import { useMemo, useState } from 'react'

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

/** Przykładowe zgłoszenia (deterministyczna lista) */
const MOCK_DEFECT_EVENTS: DefectEvent[] = (() => {
  const types = DEFECT_TYPE_DEFINITIONS.map((t) => t.id)
  const buildings = [1, 2, 3, 4, 5] as const
  const out: DefectEvent[] = []
  let id = 1
  for (let month = 0; month < 40; month++) {
    const d = new Date(2024 + Math.floor(month / 12), month % 12, 10)
    const perMonth = 3 + (month % 5)
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

  const defaultTo = new Date().toISOString().slice(0, 10)
  const defaultFrom = '2024-01-01'

  const [dateFrom, setDateFrom] = useState(defaultFrom)
  const [dateTo, setDateTo] = useState(defaultTo)
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<string>>(new Set())

  const filteredEvents = useMemo(() => {
    return MOCK_DEFECT_EVENTS.filter(
      (e) =>
        buildingSet.has(e.buildingId) && e.at >= dateFrom && e.at <= dateTo,
    )
  }, [buildingSet, dateFrom, dateTo])

  const top10 = useMemo(() => {
    const byLabel = new Map<string, number>()
    for (const e of filteredEvents) {
      const label = DEFECT_TYPE_DEFINITIONS.find((t) => t.id === e.typeId)?.label ?? e.typeId
      byLabel.set(label, (byLabel.get(label) ?? 0) + 1)
    }
    return [...byLabel.entries()]
      .sort((a, b) => b[1] - a[1])
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
    const toM = dateTo.slice(0, 7)
    if (fromM > toM) return []
    return eachMonthInRange(fromM, toM)
  }, [dateFrom, dateTo])

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
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
          />
        </label>
        <label className="text-sm text-gray-700">
          Do
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
          />
        </label>
        <p className="max-w-md text-xs text-gray-500">
          Filtrowanie wpływa na ranking, wykresy liczbowe oraz podział na uznane i odrzucone (dane przykładowe).
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-[var(--color-domesta-gray)]">Top 10 najczęstszych usterek</h2>
        {top10.length === 0 ? (
          <p className="text-sm text-gray-500">Brak zgłoszeń w wybranym zakresie.</p>
        ) : (
          <ol className="space-y-2">
            {top10.map(([label, count], i) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-sm"
              >
                <span className="text-gray-500 tabular-nums">{i + 1}.</span>
                <span className="min-w-0 flex-1 text-gray-800">{label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-[var(--color-domesta-gray)]">{count}</span>
              </li>
            ))}
          </ol>
        )}
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
            ? 'Nie zaznaczono typów — na wykresie liczbowym widać wszystkie typy jako osobne linie. Możesz zawęzić wybór, aby pokazać tylko wybrane.'
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
  const h = 300
  const padL = 44
  const padR = 16
  const padT = 12
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
    const niceMax = Math.max(5, Math.ceil(maxY * 1.1 / 5) * 5)
    const n = months.length
    const xAt = (i: number) => padL + innerW * (n === 1 ? 0.5 : i / (n - 1))
    const yAt = (v: number) => padT + innerH - (innerH * v) / niceMax

    const series = activeTypeIds.map((typeId, si) => {
      const pts = months.map((m, i) => {
        const v = volumeByMonthAndType.get(m)?.get(typeId) ?? 0
        return { i, v, x: xAt(i), y: yAt(v) }
      })
      let d = ''
      pts.forEach((p, k) => {
        d += `${k === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `
      })
      return { typeId, d: d.trim(), color: LINE_COLORS[si % LINE_COLORS.length]! }
    })

    const ticks = Array.from({ length: 5 }, (_, i) => Math.round((niceMax * i) / 4))
    const labelIdx = xAxisLabelIndexSet(n, 8)
    return { niceMax, xAt, series, ticks, labelIdx }
  }, [months, activeTypeIds, volumeByMonthAndType, innerW, innerH, padL, padT])

  if (!model || months.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-[var(--color-domesta-gray)]">Liczba zgłoszeń wg typu</h2>
        <p className="text-sm text-gray-500">Brak miesięcy w wybranym przedziale dat (sprawdź „od” i „do”).</p>
      </section>
    )
  }

  const { niceMax, xAt, series, ticks, labelIdx } = model

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-[var(--color-domesta-gray)]">Liczba zgłoszeń wg typu (miesięcznie)</h2>
      <p className="mb-3 text-xs text-gray-600">
        Oś X: wybrany przedział czasu. Oś Y: liczba zgłoszeń.{' '}
        {noneSelected ? 'Wszystkie typy jako osobne linie.' : 'Tylko zaznaczone typy.'}
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-full" role="img" aria-label="Wykres liczby usterek wg typu">
        {ticks.map((tk) => {
          const y = padT + innerH - (innerH * tk) / niceMax
          return (
            <g key={tk}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
                {tk}
              </text>
            </g>
          )
        })}
        {series.map((s) => (
          <path
            key={s.typeId}
            d={s.d}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {months.map((m, i) =>
          labelIdx.has(i) ? (
            <text key={m} x={xAt(i)} y={h - 8} textAnchor="middle" className="fill-gray-600 text-[9px]">
              {m.slice(5, 7)}.{m.slice(0, 4)}
            </text>
          ) : null,
        )}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
        {activeTypeIds.map((tid, si) => (
          <span key={tid} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-6" style={{ background: LINE_COLORS[si % LINE_COLORS.length] }} />
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
  const h = 280
  const padL = 44
  const padR = 16
  const padT = 12
  const padB = 52
  const innerW = w - padL - padR
  const innerH = h - padT - padB

  const model = useMemo(() => {
    if (months.length === 0) return null
    let maxY = 1
    for (const m of months) {
      maxY = Math.max(maxY, (uzn.get(m) ?? 0) + (odr.get(m) ?? 0), uzn.get(m) ?? 0, odr.get(m) ?? 0)
    }
    const niceMax = Math.max(3, Math.ceil(maxY * 1.1 / 5) * 5)
    const n = months.length
    const xAt = (i: number) => padL + innerW * (n === 1 ? 0.5 : i / (n - 1))
    const yAt = (v: number) => padT + innerH - (innerH * v) / niceMax

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

    const ticks = Array.from({ length: 5 }, (_, i) => Math.round((niceMax * i) / 4))
    const labelIdx = xAxisLabelIndexSet(n, 8)
    return { niceMax, xAt, uPath, oPath, ticks, labelIdx }
  }, [months, uzn, odr, innerW, innerH, padL, padT])

  if (!model || months.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-[var(--color-domesta-gray)]">Wynik reklamacji (uznane vs odrzucone)</h2>
        <p className="text-sm text-gray-500">Brak danych w zakresie dat.</p>
      </section>
    )
  }

  const { niceMax, xAt, uPath, oPath, ticks, labelIdx } = model

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-[var(--color-domesta-gray)]">Wynik reklamacji w wybranych typach</h2>
      <p className="mb-3 text-xs text-gray-600">
        <span className="font-medium text-rose-700">Uznane</span> — reklamacja uwzględniona (usterka po stronie dewelopera).{' '}
        <span className="font-medium text-emerald-800">Odrzucone</span> — reklamacja nieuznana.
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-full" role="img" aria-label="Wykres uznanych i odrzuconych">
        {ticks.map((tk) => {
          const y = padT + innerH - (innerH * tk) / niceMax
          return (
            <g key={tk}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
                {tk}
              </text>
            </g>
          )
        })}
        <path d={uPath} fill="none" stroke="#be123c" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={oPath} fill="none" stroke="#047857" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {months.map((m, i) =>
          labelIdx.has(i) ? (
            <text key={`o-${m}`} x={xAt(i)} y={h - 8} textAnchor="middle" className="fill-gray-600 text-[9px]">
              {m.slice(5, 7)}.{m.slice(0, 4)}
            </text>
          ) : null,
        )}
      </svg>
      <div className="mt-3 flex flex-wrap gap-6 text-xs text-gray-700">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-8 bg-rose-700" />
          Uznane
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-8 bg-emerald-700" />
          Odrzucone
        </span>
      </div>
    </section>
  )
}
