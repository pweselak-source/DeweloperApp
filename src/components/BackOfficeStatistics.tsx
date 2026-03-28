import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { DefectsStatisticsPanel } from './DefectsStatisticsPanel'

type InvestmentLite = { id: number; name: string }
type BuildingLite = { id: number; investmentId: number; address: string; apartmentsTotal: number }

const APARTMENT_HANDOVER_STATUS_ORDER = [
  'rozpoczęto budowę',
  'do odbioru',
  'umówione na odbiór',
  'reklamacja',
  'odebrane',
] as const

type ApartmentHandoverStatusKey = (typeof APARTMENT_HANDOVER_STATUS_ORDER)[number]

const STATUS_COLORS: Record<ApartmentHandoverStatusKey, string> = {
  'rozpoczęto budowę': '#64748b',
  'do odbioru': '#3b82f6',
  'umówione na odbiór': '#8b5cf6',
  'reklamacja': '#f97316',
  'odebrane': '#22c55e',
}

/** Początek / koniec procesu oddawania — przykładowe (różne tempo per budynek) */
const MOCK_HANDOVER_TIMELINE: Record<number, { startMonth: string; endMonth: string }> = {
  1: { startMonth: '2024-04', endMonth: '2027-09' },
  2: { startMonth: '2024-07', endMonth: '2027-03' },
  3: { startMonth: '2023-02', endMonth: '2026-08' },
  4: { startMonth: '2025-01', endMonth: '2028-12' },
  5: { startMonth: '2022-09', endMonth: '2026-11' },
}

/** Udział w statusach w funkcji postępu u ∈ [0, 1] (suma = 1) */
const ADVANCE_KEYFRAMES: { u: number; w: [number, number, number, number, number] }[] = [
  { u: 0, w: [1, 0, 0, 0, 0] },
  { u: 0.22, w: [0.62, 0.22, 0.1, 0.04, 0.02] },
  { u: 0.45, w: [0.28, 0.26, 0.22, 0.14, 0.1] },
  { u: 0.68, w: [0.1, 0.14, 0.18, 0.22, 0.36] },
  { u: 0.88, w: [0.02, 0.04, 0.08, 0.16, 0.7] },
  { u: 1, w: [0, 0, 0, 0, 1] },
]

function monthToComparable(ym: string): number {
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return 0
  return y * 12 + (m - 1)
}

function addMonthsYm(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return ym
  const d = new Date(y, m - 1 + delta, 1)
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yy}-${mm}`
}

/** Bieżący miesiąc w formacie YYYY-MM (porównywalny z etykietami serii). */
function currentYearMonth(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function interpolateAdvanceDistribution(u: number): number[] {
  const kf = ADVANCE_KEYFRAMES
  if (u <= kf[0]!.u) return [...kf[0]!.w]
  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i]!
    const b = kf[i + 1]!
    if (u <= b.u) {
      const t = (u - a.u) / (b.u - a.u)
      return a.w.map((v, j) => v + t * (b.w[j]! - v))
    }
  }
  return [...kf[kf.length - 1]!.w]
}

function statusVectorForBuilding(m: string, Tb: number, start: string, end: string): number[] {
  if (monthToComparable(m) < monthToComparable(start)) {
    return [Tb, 0, 0, 0, 0]
  }
  if (monthToComparable(m) >= monthToComparable(end)) {
    return [0, 0, 0, 0, Tb]
  }
  const num = monthToComparable(m) - monthToComparable(start)
  const den = Math.max(1, monthToComparable(end) - monthToComparable(start))
  const u = num / den
  const w = interpolateAdvanceDistribution(u)
  return w.map((x) => x * Tb)
}

function eachQuarterMonth(from: string, to: string): string[] {
  const out: string[] = []
  let cur = from
  while (monthToComparable(cur) <= monthToComparable(to)) {
    out.push(cur)
    cur = addMonthsYm(cur, 3)
  }
  return out
}

type AdvancementPoint = {
  month: string
  counts: Record<ApartmentHandoverStatusKey, number>
  total: number
}

function aggregateAdvancementPoints(buildingIds: number[], buildings: BuildingLite[]): AdvancementPoint[] {
  if (buildingIds.length === 0) return []
  const list = buildings.filter((b) => buildingIds.includes(b.id))
  if (list.length === 0) return []

  let minM = '9999-12'
  let maxM = '0000-01'
  for (const b of list) {
    const t = MOCK_HANDOVER_TIMELINE[b.id] ?? { startMonth: '2024-01', endMonth: '2027-12' }
    if (monthToComparable(t.startMonth) < monthToComparable(minM)) minM = t.startMonth
    if (monthToComparable(t.endMonth) > monthToComparable(maxM)) maxM = t.endMonth
  }

  const months = eachQuarterMonth(minM, maxM)
  return months.map((month) => {
    const counts = {
      'rozpoczęto budowę': 0,
      'do odbioru': 0,
      'umówione na odbiór': 0,
      reklamacja: 0,
      'odebrane': 0,
    } as Record<ApartmentHandoverStatusKey, number>

    for (const b of list) {
      const Tb = b.apartmentsTotal
      const t = MOCK_HANDOVER_TIMELINE[b.id] ?? { startMonth: '2024-01', endMonth: '2027-12' }
      const vec = statusVectorForBuilding(month, Tb, t.startMonth, t.endMonth)
      APARTMENT_HANDOVER_STATUS_ORDER.forEach((st, i) => {
        counts[st] += vec[i]!
      })
    }

    const total = Object.values(counts).reduce((a, x) => a + x, 0)
    return { month, counts, total }
  })
}

/** Skumulowane kwoty per budynek (przykładowe dane) — te same miesiące dla wszystkich */
const MOCK_CUMULATIVE_BY_BUILDING: Record<number, { month: string; expectedPln: number; paidPln: number }[]> = {
  1: [
    { month: '2025-03', expectedPln: 180_000, paidPln: 165_000 },
    { month: '2025-06', expectedPln: 420_000, paidPln: 400_000 },
    { month: '2025-09', expectedPln: 680_000, paidPln: 620_000 },
    { month: '2025-12', expectedPln: 920_000, paidPln: 880_000 },
    { month: '2026-03', expectedPln: 1_180_000, paidPln: 1_050_000 },
    { month: '2026-06', expectedPln: 1_420_000, paidPln: 1_290_000 },
  ],
  2: [
    { month: '2025-03', expectedPln: 220_000, paidPln: 210_000 },
    { month: '2025-06', expectedPln: 510_000, paidPln: 495_000 },
    { month: '2025-09', expectedPln: 800_000, paidPln: 760_000 },
    { month: '2025-12', expectedPln: 1_100_000, paidPln: 1_020_000 },
    { month: '2026-03', expectedPln: 1_380_000, paidPln: 1_250_000 },
    { month: '2026-06', expectedPln: 1_650_000, paidPln: 1_480_000 },
  ],
  3: [
    { month: '2025-03', expectedPln: 310_000, paidPln: 300_000 },
    { month: '2025-06', expectedPln: 720_000, paidPln: 700_000 },
    { month: '2025-09', expectedPln: 1_150_000, paidPln: 1_080_000 },
    { month: '2025-12', expectedPln: 1_580_000, paidPln: 1_420_000 },
    { month: '2026-03', expectedPln: 1_980_000, paidPln: 1_750_000 },
    { month: '2026-06', expectedPln: 2_350_000, paidPln: 2_050_000 },
  ],
  4: [
    { month: '2025-03', expectedPln: 140_000, paidPln: 120_000 },
    { month: '2025-06', expectedPln: 330_000, paidPln: 300_000 },
    { month: '2025-09', expectedPln: 540_000, paidPln: 480_000 },
    { month: '2025-12', expectedPln: 750_000, paidPln: 690_000 },
    { month: '2026-03', expectedPln: 960_000, paidPln: 850_000 },
    { month: '2026-06', expectedPln: 1_170_000, paidPln: 1_020_000 },
  ],
  5: [
    { month: '2025-03', expectedPln: 95_000, paidPln: 95_000 },
    { month: '2025-06', expectedPln: 240_000, paidPln: 235_000 },
    { month: '2025-09', expectedPln: 410_000, paidPln: 400_000 },
    { month: '2025-12', expectedPln: 590_000, paidPln: 560_000 },
    { month: '2026-03', expectedPln: 780_000, paidPln: 720_000 },
    { month: '2026-06', expectedPln: 960_000, paidPln: 880_000 },
  ],
}

function formatMonthPl(m: string) {
  const [y, mo] = m.split('-')
  if (!y || !mo) return m
  return `${mo}.${y}`
}

/** Równomiernie rozłożone indeksy etykiet osi X — ogranicza liczbę wpisów, żeby etykiety się nie nakładały. */
function xAxisLabelIndexSet(length: number, maxLabels: number): Set<number> {
  if (length <= 0) return new Set()
  if (length <= maxLabels) return new Set(Array.from({ length }, (_, i) => i))
  const s = new Set<number>()
  const segments = maxLabels - 1
  for (let k = 0; k < maxLabels; k++) {
    s.add(Math.round((k * (length - 1)) / segments))
  }
  return s
}

function formatPlnCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} mln zł`
  if (n >= 1000) return `${Math.round(n / 1000)} tys. zł`
  return `${n} zł`
}

const formatPlnFull = (value: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

/** Koniec zakresu osi X (koniec trwania inwestycji / harmonogramu) — bez przewidywań po dacie bieżącej */
const REALIZATION_END_MONTH = '2027-12'

function aggregateFinancePoints(
  buildingIds: number[],
): { month: string; expectedPln: number; paidPln: number }[] {
  if (buildingIds.length === 0) return []
  const monthKeys = new Set<string>()
  for (const id of buildingIds) {
    const s = MOCK_CUMULATIVE_BY_BUILDING[id]
    if (s) for (const p of s) monthKeys.add(p.month)
  }
  const months = [...monthKeys].sort()
  return months.map((month) => {
    let expectedPln = 0
    let paidPln = 0
    for (const id of buildingIds) {
      const row = MOCK_CUMULATIVE_BY_BUILDING[id]?.find((p) => p.month === month)
      if (row) {
        expectedPln += row.expectedPln
        paidPln += row.paidPln
      }
    }
    return { month, expectedPln, paidPln }
  })
}

function FinanceChart({ points }: { points: { month: string; expectedPln: number; paidPln: number }[] }) {
  const w = 720
  const h = 340
  const padL = 56
  const padR = 24
  const padT = 20
  const padB = 48
  const innerW = w - padL - padR
  const innerH = h - padT - padB

  const chartModel = useMemo(() => {
    if (points.length === 0) {
      return null
    }

    const todayYm = currentYearMonth()
    const dataMap = new Map(points.map((p) => [p.month, p]))
    const startM = points[0]!.month
    const domainMonths = eachQuarterMonth(startM, REALIZATION_END_MONTH)

    const all: { month: string; expectedPln: number; paidPln: number; hasData: boolean }[] = domainMonths.map((m) => {
      if (monthToComparable(m) > monthToComparable(todayYm)) {
        return { month: m, expectedPln: 0, paidPln: 0, hasData: false }
      }
      const row = dataMap.get(m)
      if (row) return { month: m, expectedPln: row.expectedPln, paidPln: row.paidPln, hasData: true }
      return { month: m, expectedPln: 0, paidPln: 0, hasData: false }
    })

    const dataIndices = all.map((p, i) => (p.hasData ? i : -1)).filter((i) => i >= 0)
    const valueList = dataIndices.flatMap((i) => [all[i]!.expectedPln, all[i]!.paidPln])
    const max = Math.max(...valueList, 1)
    const niceMax = Math.ceil((max * 1.08) / 100_000) * 100_000

    const total = all.length
    const xAt = (i: number) => padL + innerW * (total === 1 ? 0.5 : i / (total - 1))
    const yAt = (v: number) => padT + innerH - (innerH * v) / niceMax

    let pathExpected = ''
    let pathPaid = ''
    for (let k = 0; k < dataIndices.length; k++) {
      const i = dataIndices[k]!
      const p = all[i]!
      const xe = xAt(i).toFixed(1)
      const ye = yAt(p.expectedPln).toFixed(1)
      const yp = yAt(p.paidPln).toFixed(1)
      pathExpected += `${k === 0 ? 'M' : 'L'} ${xe} ${ye} `
      pathPaid += `${k === 0 ? 'M' : 'L'} ${xe} ${yp} `
    }

    const lastDataIdx = dataIndices.length > 0 ? dataIndices[dataIndices.length - 1]! : -1

    const tickCount = 4
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((niceMax * i) / tickCount))

    return {
      all,
      maxY: niceMax,
      ticks,
      xAt,
      yAt,
      pathExpected: pathExpected.trim(),
      pathPaid: pathPaid.trim(),
      lastDataIdx,
      todayYm,
    }
  }, [points, innerW, innerH, padL, padT])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)

  const updateHoverFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const el = svgRef.current
      if (!el || !chartModel) return
      const rect = el.getBoundingClientRect()
      const xSvg = ((clientX - rect.left) / rect.width) * w
      if (xSvg < padL || xSvg > w - padR) {
        setHoverIndex(null)
        setTooltip(null)
        return
      }
      const total = chartModel.all.length
      const t = (xSvg - padL) / innerW
      const idx = total === 1 ? 0 : Math.round(t * (total - 1))
      const clamped = Math.max(0, Math.min(total - 1, idx))
      setHoverIndex(clamped)
      setTooltip({ x: clientX, y: clientY })
    },
    [chartModel, innerW, padL, padR, w],
  )

  const onSvgPointerMove = (e: React.MouseEvent<SVGSVGElement>) => {
    updateHoverFromEvent(e.clientX, e.clientY)
  }

  const onSvgLeave = () => {
    setHoverIndex(null)
    setTooltip(null)
  }

  const financeXLabelIndices = useMemo(
    () => xAxisLabelIndexSet(chartModel?.all.length ?? 0, 8),
    [chartModel],
  )

  if (points.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
        Brak danych dla wybranych filtrów.
      </div>
    )
  }

  if (!chartModel) return null

  const { all, maxY, ticks, pathExpected, pathPaid, lastDataIdx, todayYm, xAt, yAt } = chartModel

  const hp = hoverIndex !== null && hoverIndex < all.length ? all[hoverIndex] : null

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm text-gray-600">
        Skumulowana należność i wpłaty — tylko dane do{' '}
        <span className="font-medium">{formatMonthPl(todayYm)}</span> (bez prognoz). Oś czasu do końca inwestycji (
        {formatMonthPl(REALIZATION_END_MONTH)}). Najedź na wykres, aby zobaczyć szczegóły.
      </p>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          className="w-full max-w-full cursor-crosshair touch-none"
          role="img"
          aria-label="Wykres wpłat i należności — najechanie pokazuje szczegóły w danym okresie"
          onMouseMove={onSvgPointerMove}
          onMouseLeave={onSvgLeave}
        >
        {ticks.map((t) => {
          const y = padT + innerH - (innerH * t) / maxY
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
                {formatPlnCompact(t)}
              </text>
            </g>
          )
        })}
        {lastDataIdx >= 0 && lastDataIdx < all.length - 1 ? (
          <line
            x1={(xAt(lastDataIdx) + xAt(lastDataIdx + 1)) / 2}
            y1={padT}
            x2={(xAt(lastDataIdx) + xAt(lastDataIdx + 1)) / 2}
            y2={padT + innerH}
            stroke="#d1d5db"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-80"
          />
        ) : null}
        {pathExpected ? (
          <path
            d={pathExpected}
            fill="none"
            stroke="var(--color-domesta-red, #c41e3a)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
        {pathPaid ? (
          <path d={pathPaid} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ) : null}
        {hoverIndex !== null ? (
          <line
            x1={xAt(hoverIndex)}
            y1={padT}
            x2={xAt(hoverIndex)}
            y2={padT + innerH}
            stroke="#64748b"
            strokeWidth="1"
            strokeOpacity={0.55}
            pointerEvents="none"
          />
        ) : null}
        {all.map((p, i) => {
          if (!p.hasData) return null
          const ye = yAt(p.expectedPln)
          const yp = yAt(p.paidPln)
          const hi = hoverIndex === i
          const r = hi ? 5 : 4
          return (
            <g key={`${p.month}-${i}`}>
              <circle
                cx={xAt(i)}
                cy={ye}
                r={r}
                fill="white"
                stroke="var(--color-domesta-red, #c41e3a)"
                strokeWidth={hi ? 2.5 : 2}
              />
              <circle
                cx={xAt(i)}
                cy={yp}
                r={r}
                fill="white"
                stroke="#16a34a"
                strokeWidth={hi ? 2.5 : 2}
              />
            </g>
          )
        })}
        {all.map((p, i) => {
          if (!financeXLabelIndices.has(i)) return null
          const isFuture = monthToComparable(p.month) > monthToComparable(todayYm)
          return (
            <text
              key={`lbl-${p.month}-${i}`}
              x={xAt(i)}
              y={h - 12}
              textAnchor="middle"
              className={`text-[10px] ${isFuture ? 'fill-gray-400' : 'fill-gray-600'}`}
            >
              {formatMonthPl(p.month)}
            </text>
          )
        })}
      </svg>
        {tooltip && hp ? (
          <div
            className="pointer-events-none fixed z-[100] max-w-[min(18rem,calc(100vw-1rem))] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-lg"
            style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
            role="status"
            aria-live="polite"
          >
            <p className="font-semibold text-[var(--color-domesta-gray)]">{formatMonthPl(hp.month)}</p>
            {!hp.hasData ? (
              <p className="mt-2 text-xs text-gray-600">
                {monthToComparable(hp.month) > monthToComparable(todayYm)
                  ? 'Przyszły okres — brak danych (wykres bez prognoz).'
                  : 'Brak danych dla tego kwartału.'}
              </p>
            ) : (
              <dl className="mt-2 space-y-1 text-xs text-gray-700">
                <div className="flex justify-between gap-4">
                  <dt>Należność (harm.)</dt>
                  <dd className="tabular-nums font-medium">{formatPlnFull(hp.expectedPln)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Wpłaty</dt>
                  <dd className="tabular-nums font-medium">{formatPlnFull(hp.paidPln)}</dd>
                </div>
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-gray-900">Różnica (należ. − wpł.)</dt>
                    <dd className="tabular-nums font-semibold text-gray-900">{formatPlnFull(hp.expectedPln - hp.paidPln)}</dd>
                  </div>
                </div>
              </dl>
            )}
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-6 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-8 bg-[var(--color-domesta-red,#c41e3a)]" aria-hidden />
          Należność (harmonogram)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-8 bg-green-600" aria-hidden />
          Wpłaty (rzeczywiste)
        </span>
      </div>
    </div>
  )
}

const formatApartmentCount = (n: number) =>
  new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(n)

function AdvancementChart({ points }: { points: AdvancementPoint[] }) {
  const w = 720
  const h = 360
  const padL = 52
  const padR = 24
  const padT = 16
  const padB = 52
  const innerW = w - padL - padR
  const innerH = h - padT - padB

  const chartModel = useMemo(() => {
    if (points.length === 0) return null
    const todayYm = currentYearMonth()

    let lastDataIdx = points.length - 1
    while (lastDataIdx >= 0 && monthToComparable(points[lastDataIdx]!.month) > monthToComparable(todayYm)) {
      lastDataIdx--
    }

    const plotPts = lastDataIdx >= 0 ? points.slice(0, lastDataIdx + 1) : []
    const maxTotal = plotPts.length > 0 ? Math.max(...plotPts.map((p) => p.total), 1) : 1
    const niceMax = Math.max(5, Math.ceil((maxTotal * 1.06) / 5) * 5)

    const n = points.length
    const xAt = (i: number) => padL + innerW * (n === 1 ? 0.5 : i / (n - 1))
    const yAt = (v: number) => padT + innerH - (innerH * v) / niceMax

    const pn = plotPts.length
    const cumBottom = plotPts.map((p) => {
      const c: number[] = [0]
      for (let k = 0; k < APARTMENT_HANDOVER_STATUS_ORDER.length; k++) {
        const st = APARTMENT_HANDOVER_STATUS_ORDER[k]!
        c.push(c[k]! + p.counts[st])
      }
      return c
    })

    const layerPaths =
      pn === 0
        ? APARTMENT_HANDOVER_STATUS_ORDER.map(() => '')
        : APARTMENT_HANDOVER_STATUS_ORDER.map((_, layerIdx) => {
            const top = plotPts.map((_, i) => yAt(cumBottom[i]![layerIdx + 1]!))
            const bot = plotPts.map((_, i) => yAt(cumBottom[i]![layerIdx]!))
            let d = `M ${xAt(0).toFixed(1)} ${top[0]!.toFixed(1)}`
            for (let i = 1; i < pn; i++) d += ` L ${xAt(i).toFixed(1)} ${top[i]!.toFixed(1)}`
            for (let i = pn - 1; i >= 0; i--) d += ` L ${xAt(i).toFixed(1)} ${bot[i]!.toFixed(1)}`
            d += ' Z'
            return d
          })

    const tickCount = 5
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((niceMax * i) / tickCount))

    return { pts: points, maxY: niceMax, ticks, xAt, layerPaths, lastDataIdx, todayYm }
  }, [points, innerW, innerH, padL, padT])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)

  const updateHover = useCallback(
    (clientX: number, clientY: number) => {
      const el = svgRef.current
      if (!el || !chartModel) return
      const rect = el.getBoundingClientRect()
      const xSvg = ((clientX - rect.left) / rect.width) * w
      if (xSvg < padL || xSvg > w - padR) {
        setHoverIndex(null)
        setTooltip(null)
        return
      }
      const total = chartModel.pts.length
      const t = (xSvg - padL) / innerW
      const idx = total === 1 ? 0 : Math.round(t * (total - 1))
      setHoverIndex(Math.max(0, Math.min(total - 1, idx)))
      setTooltip({ x: clientX + 14, y: clientY + 14 })
    },
    [chartModel, innerW, padL, padR, w],
  )

  const onSvgMove = (e: React.MouseEvent<SVGSVGElement>) => {
    updateHover(e.clientX, e.clientY)
  }

  const onSvgLeave = () => {
    setHoverIndex(null)
    setTooltip(null)
  }

  const advancementXLabelIndices = useMemo(() => xAxisLabelIndexSet(chartModel?.pts.length ?? 0, 7), [chartModel])

  if (points.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
        Brak danych dla wybranych filtrów.
      </div>
    )
  }

  if (!chartModel) return null

  const { pts, maxY, ticks, xAt, layerPaths, lastDataIdx, todayYm } = chartModel
  const hp = hoverIndex !== null && hoverIndex < pts.length ? pts[hoverIndex] : null
  const hoverIsFuture = hoverIndex !== null && lastDataIdx >= 0 && hoverIndex > lastDataIdx

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm text-gray-600">
        Liczba mieszkań wg statusu oddania — wykres do{' '}
        <span className="font-medium">{formatMonthPl(todayYm)}</span> (bez prognoz). Oś X do końca realizacji wybranych budynków. Najedź na wykres po danych.
      </p>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          className="w-full max-w-full cursor-crosshair touch-none"
          role="img"
          aria-label="Wykres zaawansowania oddawania mieszkań"
          onMouseMove={onSvgMove}
          onMouseLeave={onSvgLeave}
        >
          {ticks.map((tk) => {
            const y = padT + innerH - (innerH * tk) / maxY
            return (
              <g key={tk}>
                <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={padL - 6} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
                  {tk}
                </text>
              </g>
            )
          })}
          {APARTMENT_HANDOVER_STATUS_ORDER.map((st, li) =>
            layerPaths[li] ? (
              <path
                key={st}
                d={layerPaths[li]}
                fill={STATUS_COLORS[st]}
                fillOpacity={0.88}
                stroke="white"
                strokeWidth={0.5}
                strokeOpacity={0.35}
              />
            ) : null,
          )}
          {lastDataIdx >= 0 && lastDataIdx < pts.length - 1 ? (
            <line
              x1={(xAt(lastDataIdx) + xAt(lastDataIdx + 1)) / 2}
              y1={padT}
              x2={(xAt(lastDataIdx) + xAt(lastDataIdx + 1)) / 2}
              y2={padT + innerH}
              stroke="#d1d5db"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="opacity-80"
            />
          ) : null}
          {hoverIndex !== null ? (
            <line
              x1={xAt(hoverIndex)}
              y1={padT}
              x2={xAt(hoverIndex)}
              y2={padT + innerH}
              stroke="#475569"
              strokeWidth="1"
              strokeOpacity={0.45}
              pointerEvents="none"
            />
          ) : null}
          {pts.map((p, i) =>
            advancementXLabelIndices.has(i) ? (
              <text
                key={`adv-lbl-${p.month}-${i}`}
                x={xAt(i)}
                y={h - 10}
                textAnchor="middle"
                className="fill-gray-600 text-[10px]"
              >
                {formatMonthPl(p.month)}
              </text>
            ) : null,
          )}
        </svg>
        {tooltip && hp ? (
          <div
            className="pointer-events-none fixed z-[100] max-w-[min(20rem,calc(100vw-1rem))] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y }}
            role="status"
          >
            <p className="font-semibold text-[var(--color-domesta-gray)]">{formatMonthPl(hp.month)}</p>
            {hoverIsFuture ? (
              <p className="mt-2 text-xs text-gray-600">
                Przyszły okres — wykres przedstawia wyłącznie dane do {formatMonthPl(todayYm)} (bez prognoz).
              </p>
            ) : (
              <>
                <ul className="mt-2 space-y-1 text-xs">
                  {APARTMENT_HANDOVER_STATUS_ORDER.map((st) => (
                    <li key={st} className="flex justify-between gap-6">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: STATUS_COLORS[st] }} />
                        <span className="truncate">{st}</span>
                      </span>
                      <span className="shrink-0 tabular-nums font-medium">{formatApartmentCount(hp.counts[st])}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-600">
                  Łącznie: <span className="font-semibold text-gray-900">{formatApartmentCount(hp.total)}</span> mieszkań
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-700">
        {APARTMENT_HANDOVER_STATUS_ORDER.map((st) => (
          <span key={st} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 shrink-0 rounded-sm" style={{ background: STATUS_COLORS[st] }} />
            {st}
          </span>
        ))}
      </div>
    </div>
  )
}

type StatisticsTab = 'advancement' | 'finance' | 'complaints' | 'defects'

type BackOfficeStatisticsProps = {
  investments: InvestmentLite[]
  buildings: BuildingLite[]
}

export function BackOfficeStatistics({ investments, buildings }: BackOfficeStatisticsProps) {
  const [tab, setTab] = useState<StatisticsTab>('advancement')
  const [selectedInvestmentIds, setSelectedInvestmentIds] = useState<Set<number>>(() => new Set(investments.map((i) => i.id)))
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<Set<number>>(() => new Set(buildings.map((b) => b.id)))

  useEffect(() => {
    setSelectedBuildingIds((prev) => {
      const allowed = new Set(buildings.filter((b) => selectedInvestmentIds.has(b.investmentId)).map((b) => b.id))
      const next = new Set<number>()
      for (const id of prev) {
        if (allowed.has(id)) next.add(id)
      }
      return next
    })
  }, [selectedInvestmentIds, buildings])

  const buildingsInScope = useMemo(
    () => buildings.filter((b) => selectedInvestmentIds.has(b.investmentId)),
    [buildings, selectedInvestmentIds],
  )

  const effectiveBuildingIds = useMemo(() => {
    const inScope = new Set(buildingsInScope.map((b) => b.id))
    const picked = [...selectedBuildingIds].filter((id) => inScope.has(id))
    if (picked.length > 0) return picked
    return buildingsInScope.map((b) => b.id)
  }, [buildingsInScope, selectedBuildingIds])

  const chartPoints = useMemo(() => aggregateFinancePoints(effectiveBuildingIds), [effectiveBuildingIds])

  const advancementPoints = useMemo(
    () => aggregateAdvancementPoints(effectiveBuildingIds, buildings),
    [effectiveBuildingIds, buildings],
  )

  const toggleInvestment = (id: number) => {
    setSelectedInvestmentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleBuilding = (id: number) => {
    setSelectedBuildingIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllInvestments = () => setSelectedInvestmentIds(new Set(investments.map((i) => i.id)))
  const clearInvestments = () => setSelectedInvestmentIds(new Set())

  const selectAllBuildingsInScope = () =>
    setSelectedBuildingIds(new Set(buildingsInScope.map((b) => b.id)))
  const clearBuildings = () => setSelectedBuildingIds(new Set())

  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-[var(--color-domesta-gray)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-4 4 4 6-7" />
          </svg>
        </span>
        <h1 className="text-3xl font-bold text-[var(--color-domesta-gray)]">Statystyki</h1>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
        {(
          [
            ['advancement', 'Zaawansowanie'],
            ['finance', 'Finanse'],
            ['complaints', 'Reklamacje'],
            ['defects', 'Usterki'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === id ? 'bg-white text-[var(--color-domesta-gray)] shadow-sm' : 'text-gray-600 hover:bg-white hover:text-[var(--color-domesta-gray)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-domesta-gray)]">Inwestycje</p>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllInvestments} className="text-xs text-gray-600 underline hover:text-gray-900">
                    Zaznacz wszystkie
                  </button>
                  <button type="button" onClick={clearInvestments} className="text-xs text-gray-600 underline hover:text-gray-900">
                    Wyczyść
                  </button>
                </div>
              </div>
              <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {investments.map((inv) => (
                  <li key={inv.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[var(--color-domesta-red)] focus:ring-[var(--color-domesta-red)]"
                        checked={selectedInvestmentIds.has(inv.id)}
                        onChange={() => toggleInvestment(inv.id)}
                      />
                      <span className="text-gray-800">{inv.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-domesta-gray)]">Budynek</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllBuildingsInScope}
                    disabled={buildingsInScope.length === 0}
                    className="text-xs text-gray-600 underline hover:text-gray-900 disabled:opacity-40"
                  >
                    Zaznacz wszystkie
                  </button>
                  <button
                    type="button"
                    onClick={clearBuildings}
                    disabled={buildingsInScope.length === 0}
                    className="text-xs text-gray-600 underline hover:text-gray-900 disabled:opacity-40"
                  >
                    Wyczyść
                  </button>
                </div>
              </div>
              {selectedInvestmentIds.size === 0 ? (
                <p className="text-sm text-gray-500">Wybierz co najmniej jedną inwestycję, aby filtrować budynki.</p>
              ) : buildingsInScope.length === 0 ? (
                <p className="text-sm text-gray-500">Brak budynków dla zaznaczonych inwestycji.</p>
              ) : (
                <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {buildingsInScope.map((b) => {
                    const invName = investments.find((i) => i.id === b.investmentId)?.name ?? ''
                    return (
                      <li key={b.id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-[var(--color-domesta-red)] focus:ring-[var(--color-domesta-red)]"
                            checked={selectedBuildingIds.has(b.id)}
                            onChange={() => toggleBuilding(b.id)}
                          />
                          <span className="min-w-0 text-gray-800">
                            {b.address}
                            <span className="ml-1 text-xs text-gray-500">({invName})</span>
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
              <p className="mt-3 text-xs text-gray-500">
                Przy pustym zaznaczeniu budynków wykres uwzględnia wszystkie budynki w wybranych inwestycjach.
              </p>
            </div>
          </div>

          {selectedInvestmentIds.size === 0 ? (
            <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-amber-200 bg-amber-50/50 text-sm text-amber-900">
              Zaznacz co najmniej jedną inwestycję, aby zobaczyć dane.
            </div>
          ) : (
            <>
              {tab === 'advancement' ? <AdvancementChart points={advancementPoints} /> : null}
              {tab === 'finance' ? <FinanceChart points={chartPoints} /> : null}
              {tab === 'complaints' ? (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center text-sm text-gray-600">
                  Moduł reklamacji — w przygotowaniu.
                </div>
              ) : null}
              {tab === 'defects' ? <DefectsStatisticsPanel buildingIds={effectiveBuildingIds} /> : null}
            </>
          )}
        </div>
    </section>
  )
}
