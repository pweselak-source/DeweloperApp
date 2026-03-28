import { useMemo, useState, useRef, useCallback } from 'react'

export const DEFECT_TYPE_DEFINITIONS = [
  { id: 'okna', label: 'Nieszczelność okien i drzwi balkonowych' },
  { id: 'plytki', label: 'Usterki glazury i fug' },
  { id: 'hydraulika', label: 'Przecieki / instalacja wod-kan' },
  { id: 'elektryka', label: 'Instalacja elektryczna' },
  { id: 'tynk', label: 'Pęknięcia tynków i ścian działowych' },
  { id: 'parkiet', label: 'Podłogi / panele / listwy' },
  { id: 'wentylacja', label: 'Wentylacja i rekuperacja' },
  { id: 'dach', label: 'Pokrycie dachowe / rynny' },
  { id: 'balustrady', label: 'Balustrady balkonowe' },
  { id: 'drzwi', label: 'Drzwi wejściowe / techniczne' },
  { id: 'ogrzewanie', label: 'Ogrzewanie / piece' },
  { id: 'gwarancja', label: 'Inne — gwarancja rękojmi' },
] as const

type DefectTypeId = (typeof DEFECT_TYPE_DEFINITIONS)[number]['id']

type DefectOutcome = 'uznana' | 'odrzucona'

type DefectEvent = {
  id: number
  at: string
  typeId: DefectTypeId
  buildingId: number
  outcome: DefectOutcome
}

const MOCK_DEFECT_EVENTS: DefectEvent[] = (() => {
  const types = DEFECT_TYPE_DEFINITIONS.map((t) => t.id)
  const buildings = [1, 2, 3, 4, 5] as const
  const out: DefectEvent[] = []
  let id = 1
  for (let month = 0; month < 40; month++) {
    const d = new Date(2024 + Math.floor(month / 12), month % 12, 10)
    const perMonth = 4 + (month % 6)
    for (let k = 0; k < perMonth; k++) {
      const typeId = types[(month * 7 + k * 11 + id) % types.length]!
      const buildingId = buildings[(month + k + id) % 5]!
      const outcome: DefectOutcome = (month + k + id) % 5 === 0 ? 'odrzucona' : 'uznana'
      out.push({
        id: id++,
        at: d.toISOString().slice(0, 10),
        typeId,
        buildingId,
        outcome,
      })
    }
  }
  return out
})()

const LINE_COLORS = [
  '#c41e3a',
  '#2563eb',
  '#7c3aed',
  '#ea580c',
  '#059669',
  '#db2777',
  '#0d9488',
  '#ca8a04',
  '#4f46e5',
  '#64748b',
  '#b45309',
  '#0f766e',
]

function monthKeyFromIso(iso: string): string {
  return iso.slice(0, 7)
}

function formatYmLabel(ym: string) {
  return `${ym.slice(5, 7)}.${ym.slice(0, 4)}`
}

function eachMonthInRange(fromYm: string, toYm: string): string[] {
  const out: string[] = []
  let y = Number(fromYm.slice(0, 4))
  let m = Number(fromYm.slice(5, 7))
  const ty = Number(toYm.slice(0, 4))
  const tm = Number(toYm.slice(5, 7))
  if (!y || !m || !ty || !tm) return []
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) {
      m = 1
      y++
    }
  }
  return out
}

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

type DefectsStatisticsPanelProps = {
  buildingIds: number[]
}

export function DefectsStatisticsPanel({ buildingIds }: DefectsStatisticsPanelProps) {
  const buildingSet = useMemo(() => new Set(buildingIds), [buildingIds])

  const todayIso = new Date().toISOString().slice(0, 10)
  const defaultTo = todayIso
  const defaultFrom = '2024-01-01'

  const [dateFrom, setDateFrom] = useState(defaultFrom)
  const [dateTo, setDateTo] = useState(defaultTo)
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<string>>(new Set())

  /** Brak danych z przyszłości — wykresy i statystyki tylko do dnia dzisiejszego */
  const effectiveDateTo = dateTo <= todayIso ? dateTo : todayIso

  const filteredEvents = useMemo(() => {
    return MOCK_DEFECT_EVENTS.filter(
      (e) =>
        buildingSet.has(e.buildingId) &&
        e.at >= dateFrom &&
        e.at <= effectiveDateTo,
    )
  }, [buildingSet, dateFrom, effectiveDateTo])

  /** Zawsze dokładnie 10 wierszy — ranking po liczbie zgłoszeń wśród wszystkich typów */
  const top10 = useMemo(() => {
    const counts = new Map<DefectTypeId, number>()
    for (const t of DEFECT_TYPE_DEFINITIONS) counts.set(t.id, 0)
    for (const e of filteredEvents) {
      counts.set(e.typeId, (counts.get(e.typeId) ?? 0) + 1)
    }
    return [...DEFECT_TYPE_DEFINITIONS]
      .map((t) => ({ label: t.label, count: counts.get(t.id) ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [filteredEvents])

  const activeTypeIds = useMemo(() => {
    if (selectedTypeIds.size > 0) {
      return [...selectedTypeIds] as DefectTypeId[]
    }
    return DEFECT_TYPE_DEFINITIONS.map((t) => t.id)
  }, [selectedTypeIds])

  const monthsAxis = useMemo(() => {
    const fromM = dateFrom.slice(0, 7)
    const toM = effectiveDateTo.slice(0, 7)
    if (fromM > toM) return []
    return eachMonthInRange(fromM, toM)
  }, [dateFrom, effectiveDateTo])

  const volumeByMonthAndType = useMemo(() => {
    const months = monthsAxis
    const vol = new Map<string, Map<DefectTypeId, number>>()
    for (const m of months) {
      const inner = new Map<DefectTypeId, number>()
      for (const t of DEFECT_TYPE_DEFINITIONS) inner.set(t.id, 0)
      vol.set(m, inner)
    }
    for (const e of filteredEvents) {
      const mk = monthKeyFromIso(e.at)
      if (!vol.has(mk)) continue
      const row = vol.get(mk)!
      row.set(e.typeId, (row.get(e.typeId) ?? 0) + 1)
    }
    return vol
  }, [filteredEvents, monthsAxis])

  const outcomeByMonth = useMemo(() => {
    const months = monthsAxis
    const uzn = new Map<string, number>()
    const odr = new Map<string, number>()
    for (const m of months) {
      uzn.set(m, 0)
      odr.set(m, 0)
    }
    const typeFilter = new Set(activeTypeIds)
    for (const e of filteredEvents) {
      if (!typeFilter.has(e.typeId)) continue
      const mk = monthKeyFromIso(e.at)
      if (!uzn.has(mk)) continue
      if (e.outcome === 'uznana') uzn.set(mk, (uzn.get(mk) ?? 0) + 1)
      else odr.set(mk, (odr.get(mk) ?? 0) + 1)
    }
    return { uzn, odr }
  }, [filteredEvents, monthsAxis, activeTypeIds])

  const toggleType = (id: string) => {
    setSelectedTypeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllTypes = () => setSelectedTypeIds(new Set(DEFECT_TYPE_DEFINITIONS.map((t) => t.id)))
  const clearTypes = () => setSelectedTypeIds(new Set())

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="text-sm text-gray-700">
          Od
          <input
            type="date"
            max={todayIso}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
          />
        </label>
        <label className="text-sm text-gray-700">
          Do
          <input
            type="date"
            max={todayIso}
            value={dateTo <= todayIso ? dateTo : todayIso}
            onChange={(e) => {
              const v = e.target.value
              setDateTo(v <= todayIso ? v : todayIso)
            }}
            className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
          />
        </label>
        <p className="max-w-md text-xs text-gray-500">
          Filtrowanie wpływa na ranking, wykresy liczbowe oraz podział na uznane i odrzucone (dane przykładowe). Wyniki znane są
          tylko do dnia dzisiejszego — przyszłe okresy nie są uwzględniane.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-[var(--color-domesta-gray)]">Top 10 najczęstszych usterek</h2>
        <ol className="space-y-2">
          {top10.map((row, i) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50/90 to-white px-3 py-2 text-sm"
            >
              <span className="text-gray-500 tabular-nums">{i + 1}.</span>
              <span className="min-w-0 flex-1 text-gray-800">{row.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-[var(--color-domesta-gray)]">{row.count}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[var(--color-domesta-gray)]">Typy usterek (wielokrotny wybór)</h2>
          <div className="flex gap-2">
            <button type="button" onClick={selectAllTypes} className="text-xs text-gray-600 underline hover:text-gray-900">
              Zaznacz wszystkie
            </button>
            <button type="button" onClick={clearTypes} className="text-xs text-gray-600 underline hover:text-gray-900">
              Wyczyść
            </button>
          </div>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {DEFECT_TYPE_DEFINITIONS.map((t) => (
            <li key={t.id}>
              <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--color-domesta-red)] focus:ring-[var(--color-domesta-red)]"
                  checked={selectedTypeIds.has(t.id)}
                  onChange={() => toggleType(t.id)}
                />
                <span className="text-gray-800">{t.label}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-gray-500">
          {selectedTypeIds.size === 0
            ? 'Nie zaznaczono typów — na wykresie widać wszystkie typy. Możesz zawęzić wybór.'
            : 'Wykres liczbowy pokazuje tylko zaznaczone typy.'}
        </p>
      </section>

      <DefectVolumeLineChart
        months={monthsAxis}
        activeTypeIds={activeTypeIds}
        volumeByMonthAndType={volumeByMonthAndType}
        noneSelected={selectedTypeIds.size === 0}
      />

      <DefectOutcomeChart months={monthsAxis} uzn={outcomeByMonth.uzn} odr={outcomeByMonth.odr} />
    </div>
  )
}

function DefectVolumeLineChart({
  months,
  activeTypeIds,
  volumeByMonthAndType,
  noneSelected,
}: {
  months: string[]
  activeTypeIds: DefectTypeId[]
  volumeByMonthAndType: Map<string, Map<DefectTypeId, number>>
  noneSelected: boolean
}) {
  const w = 720
  const h = 320
  const padL = 48
  const padR = 20
  const padT = 20
  const padB = 56
  const innerW = w - padL - padR
  const innerH = h - padT - padB

  const model = useMemo(() => {
    if (months.length === 0) return null
    let maxY = 1
    for (const m of months) {
      const row = volumeByMonthAndType.get(m)
      if (!row) continue
      for (const tid of activeTypeIds) {
        maxY = Math.max(maxY, row.get(tid) ?? 0)
      }
    }
    const niceMax = Math.max(5, Math.ceil(maxY * 1.12 / 5) * 5)
    const n = months.length
    const xAt = (i: number) => padL + innerW * (n === 1 ? 0.5 : i / (n - 1))
    const yAt = (v: number) => padT + innerH - (innerH * v) / niceMax
    const baseY = padT + innerH

    const series = activeTypeIds.map((typeId, si) => {
      const pts = months.map((m, i) => {
        const v = volumeByMonthAndType.get(m)?.get(typeId) ?? 0
        return { i, v, x: xAt(i), y: yAt(v) }
      })
      let lineD = ''
      pts.forEach((p, k) => {
        lineD += `${k === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `
      })
      const first = pts[0]!
      const last = pts[pts.length - 1]!
      const areaD =
        lineD.trim() +
        ` L ${last.x.toFixed(1)} ${baseY.toFixed(1)} L ${first.x.toFixed(1)} ${baseY.toFixed(1)} Z`
      const color = LINE_COLORS[si % LINE_COLORS.length]!
      const dash = si % 5 === 4 ? '4 3' : undefined
      const sw = 1.4 + (si % 4) * 0.35
      return { typeId, lineD: lineD.trim(), areaD, color, dash, sw }
    })

    const ticks = Array.from({ length: 5 }, (_, i) => Math.round((niceMax * i) / 4))
    const labelIdx = xAxisLabelIndexSet(n, 8)
    return { niceMax, xAt, series, ticks, labelIdx, n }
  }, [months, activeTypeIds, volumeByMonthAndType, innerW, innerH, padL, padT])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)

  const updateHover = useCallback(
    (clientX: number, clientY: number) => {
      const el = svgRef.current
      if (!el || !model) return
      const rect = el.getBoundingClientRect()
      const xSvg = ((clientX - rect.left) / rect.width) * w
      if (xSvg < padL || xSvg > w - padR) {
        setHoverIndex(null)
        setTooltip(null)
        return
      }
      const total = model.n
      const t = (xSvg - padL) / innerW
      const idx = total === 1 ? 0 : Math.round(t * (total - 1))
      setHoverIndex(Math.max(0, Math.min(total - 1, idx)))
      setTooltip({ x: clientX + 12, y: clientY + 12 })
    },
    [model, innerW, padL, padR, w],
  )

  if (!model || months.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-[var(--color-domesta-gray)]">Liczba zgłoszeń wg typu</h2>
        <p className="text-sm text-gray-500">Brak miesięcy w wybranym przedziale dat (sprawdź „od” i „do”).</p>
      </section>
    )
  }

  const { niceMax, xAt, series, ticks, labelIdx } = model
  const hpMonth = hoverIndex !== null ? months[hoverIndex] : null

  return (
    <section className="rounded-xl border border-gray-200 bg-gradient-to-b from-slate-50/80 to-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-[var(--color-domesta-gray)]">Liczba zgłoszeń wg typu (miesięcznie)</h2>
      <p className="mb-3 text-xs text-gray-600">
        Warstwy z cieniem + linie (część serii przerywana). Najedź myszą, aby zobaczyć wartości.{' '}
        {noneSelected ? 'Wszystkie typy.' : 'Tylko zaznaczone typy.'}
      </p>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          className="w-full max-w-full cursor-crosshair"
          role="img"
          aria-label="Wykres liczby usterek wg typu"
          onMouseMove={(e) => updateHover(e.clientX, e.clientY)}
          onMouseLeave={() => {
            setHoverIndex(null)
            setTooltip(null)
          }}
        >
          <defs>
            {series.map((s, si) => (
              <linearGradient key={`g-${s.typeId}`} id={`vol-grad-${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <rect x={padL} y={padT} width={innerW} height={innerH} rx="6" fill="#f1f5f9" opacity={0.85} />
          {ticks.map((tk) => {
            const y = padT + innerH - (innerH * tk) / niceMax
            return (
              <g key={tk}>
                <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-slate-500 text-[10px]">
                  {tk}
                </text>
              </g>
            )
          })}
          {[...series].reverse().map((s, ri) => {
            const si = series.length - 1 - ri
            return (
              <path
                key={`area-${s.typeId}`}
                d={s.areaD}
                fill={`url(#vol-grad-${si})`}
                opacity={0.9}
              />
            )
          })}
          {series.map((s) => (
            <path
              key={s.typeId}
              d={s.lineD}
              fill="none"
              stroke={s.color}
              strokeWidth={s.sw}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={s.dash}
            />
          ))}
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
          {months.map((m, i) =>
            labelIdx.has(i) ? (
              <text key={m} x={xAt(i)} y={h - 8} textAnchor="middle" className="fill-slate-600 text-[9px]">
                {formatYmLabel(m)}
              </text>
            ) : null,
          )}
        </svg>
        {tooltip && hpMonth !== null && hoverIndex !== null ? (
          <div
            className="pointer-events-none fixed z-[100] max-h-[min(70vh,420px)] max-w-[min(22rem,calc(100vw-1rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-sm shadow-xl backdrop-blur-sm"
            style={{ left: tooltip.x, top: tooltip.y }}
            role="status"
          >
            <p className="font-semibold text-[var(--color-domesta-gray)]">{formatYmLabel(hpMonth)}</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              {activeTypeIds.map((tid, si) => {
                const v = volumeByMonthAndType.get(hpMonth)?.get(tid) ?? 0
                return (
                  <li key={tid} className="flex justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: LINE_COLORS[si % LINE_COLORS.length] }} />
                      <span className="truncate">{DEFECT_TYPE_DEFINITIONS.find((t) => t.id === tid)?.label}</span>
                    </span>
                    <span className="shrink-0 tabular-nums font-medium">{v}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-700">
        {activeTypeIds.map((tid, si) => (
          <span key={tid} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-6 rounded-full" style={{ background: LINE_COLORS[si % LINE_COLORS.length] }} />
            {DEFECT_TYPE_DEFINITIONS.find((t) => t.id === tid)?.label ?? tid}
          </span>
        ))}
      </div>
    </section>
  )
}

function DefectOutcomeChart({
  months,
  uzn,
  odr,
}: {
  months: string[]
  uzn: Map<string, number>
  odr: Map<string, number>
}) {
  const w = 720
  const h = 300
  const padL = 48
  const padR = 20
  const padT = 20
  const padB = 54
  const innerW = w - padL - padR
  const innerH = h - padT - padB

  const model = useMemo(() => {
    if (months.length === 0) return null
    let maxY = 1
    for (const m of months) {
      maxY = Math.max(maxY, (uzn.get(m) ?? 0) + (odr.get(m) ?? 0), uzn.get(m) ?? 0, odr.get(m) ?? 0)
    }
    const niceMax = Math.max(3, Math.ceil(maxY * 1.12 / 5) * 5)
    const n = months.length
    const xAt = (i: number) => padL + innerW * (n === 1 ? 0.5 : i / (n - 1))
    const yAt = (v: number) => padT + innerH - (innerH * v) / niceMax
    const baseY = padT + innerH
    const slot = n > 0 ? innerW / n : innerW
    const barW = Math.min(11, slot * 0.22)
    const gap = Math.min(6, slot * 0.08)

    const bars: { x: number; y: number; w: number; h: number; fill: string; key: string }[] = []
    months.forEach((m, i) => {
      const cx = xAt(i)
      const vu = uzn.get(m) ?? 0
      const vo = odr.get(m) ?? 0
      const hu = (innerH * vu) / niceMax
      const ho = (innerH * vo) / niceMax
      if (vu > 0) {
        bars.push({
          x: cx - barW - gap / 2,
          y: baseY - hu,
          w: barW,
          h: hu,
          fill: 'url(#bar-uzn)',
          key: `u-${m}`,
        })
      }
      if (vo > 0) {
        bars.push({
          x: cx + gap / 2,
          y: baseY - ho,
          w: barW,
          h: ho,
          fill: 'url(#bar-odr)',
          key: `o-${m}`,
        })
      }
    })

    const ticks = Array.from({ length: 5 }, (_, i) => Math.round((niceMax * i) / 4))
    const labelIdx = xAxisLabelIndexSet(n, 8)

    const uPath = months
      .map((m, i) => {
        const v = uzn.get(m) ?? 0
        const cmd = i === 0 ? 'M' : 'L'
        return `${cmd} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`
      })
      .join(' ')
    const oPath = months
      .map((m, i) => {
        const v = odr.get(m) ?? 0
        const cmd = i === 0 ? 'M' : 'L'
        return `${cmd} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`
      })
      .join(' ')

    return { niceMax, xAt, uPath, oPath, ticks, labelIdx, n, bars, baseY }
  }, [months, uzn, odr, innerW, innerH, padL, padT])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)

  const updateHover = useCallback(
    (clientX: number, clientY: number) => {
      const el = svgRef.current
      if (!el || !model) return
      const rect = el.getBoundingClientRect()
      const xSvg = ((clientX - rect.left) / rect.width) * w
      if (xSvg < padL || xSvg > w - padR) {
        setHoverIndex(null)
        setTooltip(null)
        return
      }
      const total = model.n
      const t = (xSvg - padL) / innerW
      const idx = total === 1 ? 0 : Math.round(t * (total - 1))
      setHoverIndex(Math.max(0, Math.min(total - 1, idx)))
      setTooltip({ x: clientX + 12, y: clientY + 12 })
    },
    [model, innerW, padL, padR, w],
  )

  if (!model || months.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-[var(--color-domesta-gray)]">Wynik reklamacji (uznane vs odrzucone)</h2>
        <p className="text-sm text-gray-500">Brak danych w zakresie dat.</p>
      </section>
    )
  }

  const { niceMax, xAt, uPath, oPath, ticks, labelIdx, bars, baseY } = model
  const hpMonth = hoverIndex !== null ? months[hoverIndex] : null

  return (
    <section className="rounded-xl border border-gray-200 bg-gradient-to-br from-rose-50/40 via-white to-emerald-50/40 p-4 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-[var(--color-domesta-gray)]">Wynik reklamacji w wybranych typach</h2>
      <p className="mb-3 text-xs text-gray-600">
        <span className="font-medium text-rose-700">Słupki + linie trendu</span>. Uznane — po stronie dewelopera; odrzucone — reklamacja nieuznana.
      </p>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          className="w-full max-w-full cursor-crosshair"
          role="img"
          aria-label="Wykres uznanych i odrzuconych"
          onMouseMove={(e) => updateHover(e.clientX, e.clientY)}
          onMouseLeave={() => {
            setHoverIndex(null)
            setTooltip(null)
          }}
        >
          <defs>
            <linearGradient id="bar-uzn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="bar-odr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect x={padL} y={padT} width={innerW} height={innerH} rx="8" fill="white" opacity={0.92} />
          {ticks.map((tk) => {
            const y = padT + innerH - (innerH * tk) / niceMax
            return (
              <g key={tk}>
                <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-slate-500 text-[10px]">
                  {tk}
                </text>
              </g>
            )
          })}
          {bars.map((b) => (
            <rect key={b.key} x={b.x} y={b.y} width={b.w} height={Math.max(b.h, 0)} fill={b.fill} rx={3} filter="url(#soft-glow)" opacity={0.92} />
          ))}
          <path
            d={uPath}
            fill="none"
            stroke="#be123c"
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="6 4"
            opacity={0.85}
          />
          <path
            d={oPath}
            fill="none"
            stroke="#047857"
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.9}
          />
          {hoverIndex !== null ? (
            <line
              x1={xAt(hoverIndex)}
              y1={padT}
              x2={xAt(hoverIndex)}
              y2={baseY}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="3 3"
              pointerEvents="none"
            />
          ) : null}
          {months.map((m, i) =>
            labelIdx.has(i) ? (
              <text key={`o-${m}`} x={xAt(i)} y={h - 8} textAnchor="middle" className="fill-slate-600 text-[9px]">
                {formatYmLabel(m)}
              </text>
            ) : null,
          )}
        </svg>
        {tooltip && hpMonth !== null && hoverIndex !== null ? (
          <div
            className="pointer-events-none fixed z-[100] rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 text-sm shadow-xl backdrop-blur-sm"
            style={{ left: tooltip.x, top: tooltip.y }}
            role="status"
          >
            <p className="font-semibold text-[var(--color-domesta-gray)]">{formatYmLabel(hpMonth)}</p>
            <dl className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between gap-8">
                <dt className="text-rose-800">Uznane</dt>
                <dd className="tabular-nums font-semibold">{uzn.get(hpMonth) ?? 0}</dd>
              </div>
              <div className="flex justify-between gap-8">
                <dt className="text-emerald-800">Odrzucone</dt>
                <dd className="tabular-nums font-semibold">{odr.get(hpMonth) ?? 0}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-6 text-xs text-slate-700">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-5 rounded-sm bg-gradient-to-b from-rose-400 to-rose-900" />
          Uznane (słupki)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-5 rounded-sm bg-gradient-to-b from-emerald-300 to-emerald-800" />
          Odrzucone (słupki)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-8 border-b border-dashed border-rose-700" />
          Trend uznanych
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-8 bg-emerald-700" />
          Trend odrzuconych
        </span>
      </div>
    </section>
  )
}
