import { useMemo, useState, useEffect } from 'react'

type InvestmentLite = { id: number; name: string }
type BuildingLite = { id: number; investmentId: number; address: string }

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

function formatPlnCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} mln zł`
  if (n >= 1000) return `${Math.round(n / 1000)} tys. zł`
  return `${n} zł`
}

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
  const h = 320
  const padL = 56
  const padR = 24
  const padT = 20
  const padB = 48
  const innerW = w - padL - padR
  const innerH = h - padT - padB

  const { pathExpected, pathPaid, maxY, ticks } = useMemo(() => {
    if (points.length === 0) {
      return { pathExpected: '', pathPaid: '', maxY: 1, ticks: [0] }
    }
    const max = Math.max(...points.flatMap((p) => [p.expectedPln, p.paidPln]), 1)
    const niceMax = Math.ceil(max * 1.08 / 100_000) * 100_000
    const n = points.length
    const xAt = (i: number) => padL + (innerW * (n === 1 ? 0.5 : i / (n - 1)))
    const yAt = (v: number) => padT + innerH - (innerH * v) / niceMax

    const line = (key: 'expectedPln' | 'paidPln') =>
      points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(p[key]).toFixed(1)}`)
        .join(' ')

    const tickCount = 4
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((niceMax * i) / tickCount))

    return {
      pathExpected: line('expectedPln'),
      pathPaid: line('paidPln'),
      maxY: niceMax,
      ticks,
    }
  }, [points, innerW, innerH, padL, padT, padR, padB])

  if (points.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
        Brak danych dla wybranych filtrów.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-3 text-sm text-gray-600">
        Skumulowana należność według harmonogramu vs skumulowane wpłaty (dane przykładowe, zależne od filtrów).
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-full" role="img" aria-label="Wykres wpłat i należności">
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
        <path d={pathExpected} fill="none" stroke="var(--color-domesta-red, #c41e3a)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={pathPaid} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const n = points.length
          const x = padL + (innerW * (n === 1 ? 0.5 : i / (n - 1)))
          const ye = padT + innerH - (innerH * p.expectedPln) / maxY
          const yp = padT + innerH - (innerH * p.paidPln) / maxY
          return (
            <g key={p.month}>
              <circle cx={x} cy={ye} r="4" fill="white" stroke="var(--color-domesta-red, #c41e3a)" strokeWidth="2" />
              <circle cx={x} cy={yp} r="4" fill="white" stroke="#16a34a" strokeWidth="2" />
            </g>
          )
        })}
        {points.map((p, i) => {
          const n = points.length
          const x = padL + (innerW * (n === 1 ? 0.5 : i / (n - 1)))
          return (
            <text key={`lbl-${p.month}`} x={x} y={h - 12} textAnchor="middle" className="fill-gray-600 text-[10px]">
              {formatMonthPl(p.month)}
            </text>
          )
        })}
      </svg>
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

type StatisticsTab = 'advancement' | 'finance'

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

      {tab === 'advancement' ? <div className="min-h-[240px]" aria-hidden /> : (
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
              Zaznacz co najmniej jedną inwestycję, aby zobaczyć wykres.
            </div>
          ) : (
            <FinanceChart points={chartPoints} />
          )}
        </div>
      )}
    </section>
  )
}
