import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const WEEKDAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'] as const

/** Półgodzinne sloty: 00:00 … 23:30 */
const SLOTS_PER_DAY = 48
const SLOT_MINUTES = 30
const SLOT_PX = 22

export type CalendarManagementUser = {
  id: string
  name: string
}

type InvestmentLite = {
  id: number
  name: string
}

type BuildingLite = {
  id: number
  investmentId: number
  address: string
}

export type AvailabilityBlock = {
  id: string
  userId: string
  /** Dzień kalendarzowy (pon–ndz.), YYYY-MM-DD */
  date: string
  startSlot: number
  endSlot: number
  buildingId: number
  buildingLabel: string
}

/** Godziny pracy (sloty): 8:00–18:00 → indeksy 16–35 (20 półgodzin). */
const WORK_START_SLOT = 16
const WORK_END_SLOT = 35

const MONTHS_GEN = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
] as const

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() + n)
  return x
}

function formatPolishDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${dt.getDate()} ${MONTHS_GEN[dt.getMonth()]} ${dt.getFullYear()}`
}

function formatWeekRangeLabel(weekStartMonday: Date): string {
  const sun = addDays(weekStartMonday, 6)
  const d1 = weekStartMonday.getDate()
  const d2 = sun.getDate()
  const m1 = weekStartMonday.getMonth()
  const m2 = sun.getMonth()
  const y1 = weekStartMonday.getFullYear()
  const y2 = sun.getFullYear()
  if (m1 === m2 && y1 === y2) {
    return `${d1}–${d2} ${MONTHS_GEN[m1]} ${y1}`
  }
  if (y1 === y2) {
    return `${d1} ${MONTHS_GEN[m1]} – ${d2} ${MONTHS_GEN[m2]} ${y1}`
  }
  return `${d1} ${MONTHS_GEN[m1]} ${y1} – ${d2} ${MONTHS_GEN[m2]} ${y2}`
}

const SAMPLE_BUILDINGS: { id: number; label: string }[] = [
  { id: 1, label: 'ul. Kampinowska 12A' },
  { id: 2, label: 'ul. Kampinowska 12B' },
  { id: 3, label: 'ul. Ogrodowa 7A' },
  { id: 4, label: 'ul. Ogrodowa 7B' },
  { id: 5, label: 'ul. Morenowa 20A' },
]

/**
 * Przykładowe wpisy: kilka **dużych** bloków dziennie (wiele godzin), celowo **nachodzące** na siebie
 * (wyświetlane obok siebie w pasach). Zakres slotów w obrębie 8:00–18:00 (WORK_START_SLOT…WORK_END_SLOT).
 */
function buildSampleAvailabilityBlocks(): AvailabilityBlock[] {
  const users = ['u1', 'u2', 'u3'] as const
  /** Punkt odniesienia: pon. 23 marca 2026 */
  const anchorMonday = new Date(2026, 2, 23)
  const out: AvailabilityBlock[] = []
  let nid = 0

  /** Wzorce slotów w obrębie [WORK_START_SLOT, WORK_END_SLOT] — 3 szerokie pasma z nakładaniem. */
  const patterns: { start: number; end: number; bi: number }[][] = [
    [
      { start: WORK_START_SLOT, end: WORK_START_SLOT + 11, bi: 0 },
      { start: 22, end: 33, bi: 1 },
      { start: 28, end: WORK_END_SLOT, bi: 2 },
    ],
    [
      { start: WORK_START_SLOT, end: WORK_START_SLOT + 9, bi: 2 },
      { start: 20, end: 31, bi: 3 },
      { start: 26, end: WORK_END_SLOT, bi: 4 },
    ],
    [
      { start: 18, end: 29, bi: 4 },
      { start: 24, end: WORK_END_SLOT, bi: 0 },
      { start: WORK_START_SLOT, end: WORK_START_SLOT + 7, bi: 1 },
    ],
  ]

  for (let w = -3; w <= 3; w++) {
    const monday = addDays(anchorMonday, w * 7)
    for (let u = 0; u < users.length; u++) {
      const userId = users[u]
      for (let wd = 0; wd < 5; wd++) {
        const day = addDays(monday, wd)
        const dateStr = formatDateKey(day)
        const patternIndex = ((w + wd + u) % patterns.length + patterns.length) % patterns.length
        const pat = patterns[patternIndex]
        for (const spec of pat) {
          const b = SAMPLE_BUILDINGS[spec.bi % SAMPLE_BUILDINGS.length]
          out.push({
            id: `sample-${++nid}`,
            userId,
            date: dateStr,
            startSlot: spec.start,
            endSlot: spec.end,
            buildingId: b.id,
            buildingLabel: b.label,
          })
        }
      }
    }
  }

  return out
}

const SAMPLE_AVAILABILITY_BLOCKS: AvailabilityBlock[] = buildSampleAvailabilityBlocks()

type BackOfficeCalendarManagementProps = {
  users: CalendarManagementUser[]
  investments: InvestmentLite[]
  buildings: BuildingLite[]
}

function slotIndexToLabel(slot: number): string {
  const totalMin = slot * SLOT_MINUTES
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function normalizeRange(a: number, b: number): { start: number; end: number } {
  return a <= b ? { start: a, end: b } : { start: b, end: a }
}

function clientYToSlot(clientY: number, columnTop: number): number {
  const y = clientY - columnTop
  return Math.max(0, Math.min(SLOTS_PER_DAY - 1, Math.floor(y / SLOT_PX)))
}

/** Przypisuje pas poziomy (0..n-1) tak, by nakładające się przedziały były obok siebie. */
function assignLanes(blocks: AvailabilityBlock[]): { idToLane: Map<string, number>; laneCount: number } {
  if (blocks.length === 0) return { idToLane: new Map(), laneCount: 1 }
  const sorted = [...blocks].sort((a, b) => a.startSlot - b.startSlot || a.endSlot - b.endSlot)
  const laneEnds: number[] = []
  const idToLane = new Map<string, number>()
  for (const b of sorted) {
    let placed = false
    for (let i = 0; i < laneEnds.length; i++) {
      if (b.startSlot > laneEnds[i]) {
        laneEnds[i] = b.endSlot
        idToLane.set(b.id, i)
        placed = true
        break
      }
    }
    if (!placed) {
      laneEnds.push(b.endSlot)
      idToLane.set(b.id, laneEnds.length - 1)
    }
  }
  return { idToLane, laneCount: Math.max(1, laneEnds.length) }
}

export function BackOfficeCalendarManagement({ users, investments, buildings }: BackOfficeCalendarManagementProps) {
  const [selectedUserId, setSelectedUserId] = useState(() => users[0]?.id ?? '')
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>(() => [...SAMPLE_AVAILABILITY_BLOCKS])
  /** Poniedziałek wyświetlanego tygodnia (godz. 0:00 lokalnie). */
  const [weekStartMonday, setWeekStartMonday] = useState(() => new Date(2026, 2, 23))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [blockToRemoveId, setBlockToRemoveId] = useState<string | null>(null)
  const [pendingDateStr, setPendingDateStr] = useState<string | null>(null)
  const [pendingStart, setPendingStart] = useState<number>(0)
  const [pendingEnd, setPendingEnd] = useState<number>(0)
  const [dialogInvestmentId, setDialogInvestmentId] = useState<number | ''>('')
  const [dialogBuildingId, setDialogBuildingId] = useState<number | ''>('')

  const dragRef = useRef<{
    dayIndex: number
    anchorSlot: number
    active: boolean
  } | null>(null)
  const [dragHighlight, setDragHighlight] = useState<{ dayIndex: number; start: number; end: number } | null>(null)
  const dragHighlightRef = useRef(dragHighlight)
  dragHighlightRef.current = dragHighlight

  const blocksForUser = useMemo(
    () => blocks.filter((b) => b.userId === selectedUserId),
    [blocks, selectedUserId],
  )

  const columnDateKeys = useMemo(
    () => WEEKDAYS.map((_, dayIndex) => formatDateKey(addDays(weekStartMonday, dayIndex))),
    [weekStartMonday],
  )

  const laneLayoutByDay = useMemo(() => {
    const map = new Map<number, { idToLane: Map<string, number>; laneCount: number }>()
    for (let d = 0; d < WEEKDAYS.length; d++) {
      const key = columnDateKeys[d]
      const dayBlocks = blocksForUser.filter((b) => b.date === key)
      map.set(d, assignLanes(dayBlocks))
    }
    return map
  }, [blocksForUser, columnDateKeys])

  const buildingsForInvestment = useMemo(() => {
    if (dialogInvestmentId === '') return []
    return buildings.filter((b) => b.investmentId === dialogInvestmentId)
  }, [buildings, dialogInvestmentId])

  useEffect(() => {
    if (users.length && !users.some((u) => u.id === selectedUserId)) {
      setSelectedUserId(users[0].id)
    }
  }, [users, selectedUserId])

  const openDialogForRange = useCallback(
    (dayIndex: number, slotA: number, slotB: number) => {
      const { start, end } = normalizeRange(slotA, slotB)
      setPendingDateStr(formatDateKey(addDays(weekStartMonday, dayIndex)))
      setPendingStart(start)
      setPendingEnd(end)
      const firstInv = investments[0]?.id
      setDialogInvestmentId(firstInv !== undefined ? firstInv : '')
      setDialogBuildingId('')
      setDialogOpen(true)
    },
    [investments, weekStartMonday],
  )

  const handleDayColumnPointerDown = (dayIndex: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const rect = el.getBoundingClientRect()
    const slot = clientYToSlot(e.clientY, rect.top)
    dragRef.current = { dayIndex, anchorSlot: slot, active: true }
    setDragHighlight({ dayIndex, start: slot, end: slot })
  }

  const handleDayColumnPointerMove = (dayIndex: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d?.active || d.dayIndex !== dayIndex) return
    const rect = e.currentTarget.getBoundingClientRect()
    const slot = clientYToSlot(e.clientY, rect.top)
    const { start, end } = normalizeRange(d.anchorSlot, slot)
    setDragHighlight({ dayIndex, start, end })
  }

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current
      if (!d?.active) return
      dragRef.current = null
      const target = e.currentTarget instanceof HTMLElement ? e.currentTarget : (e.target as HTMLElement)
      try {
        target.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      const h = dragHighlightRef.current
      setDragHighlight(null)
      if (!h || h.dayIndex !== d.dayIndex) return
      openDialogForRange(h.dayIndex, h.start, h.end)
    },
    [openDialogForRange],
  )

  const blockPendingRemove = useMemo(
    () => (blockToRemoveId ? blocks.find((b) => b.id === blockToRemoveId) : undefined),
    [blocks, blockToRemoveId],
  )

  const confirmRemoveBlock = () => {
    if (!blockToRemoveId) return
    setBlocks((prev) => prev.filter((b) => b.id !== blockToRemoveId))
    setBlockToRemoveId(null)
  }

  const handleSaveDialog = () => {
    if (pendingDateStr === null || dialogInvestmentId === '' || dialogBuildingId === '') return
    const building = buildings.find((b) => b.id === dialogBuildingId)
    if (!building) return
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `av-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setBlocks((prev) => [
      ...prev,
      {
        id,
        userId: selectedUserId,
        date: pendingDateStr,
        startSlot: pendingStart,
        endSlot: pendingEnd,
        buildingId: building.id,
        buildingLabel: building.address,
      },
    ])
    setDialogOpen(false)
    setPendingDateStr(null)
  }

  const slotHighlighted = (dayIndex: number, slot: number) => {
    if (!dragHighlight || dragHighlight.dayIndex !== dayIndex) return false
    return slot >= dragHighlight.start && slot <= dragHighlight.end
  }

  const cellClasses = (dayIndex: number, slot: number) => {
    const base =
      'shrink-0 border-b border-gray-100 cursor-crosshair select-none hover:bg-amber-50/80 transition-colors'
    const hi = slotHighlighted(dayIndex, slot)
    return `${base} ${hi ? 'bg-amber-200/90 ring-1 ring-inset ring-amber-400/60' : 'bg-white'}`
  }

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-[var(--color-domesta-gray)]">Zaznacz swoją dostępność</h1>
        <label className="flex max-w-md flex-col gap-1 text-sm text-gray-600">
          Użytkownik
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[var(--color-domesta-red)]"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-gray-600">
        Przeciągnij myszą po polach jednego dnia, aby zaznaczyć przedział (bloki co 30 min). Po zwolnieniu przycisku wybierz inwestycję i budynek, potem zapisz.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setWeekStartMonday((d) => addDays(d, -7))}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Poprzedni tydzień
        </button>
        <p className="min-w-0 text-center text-sm font-semibold text-[var(--color-domesta-gray)]">{formatWeekRangeLabel(weekStartMonday)}</p>
        <button
          type="button"
          onClick={() => setWeekStartMonday((d) => addDays(d, 7))}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Następny tydzień
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <div className="min-w-[720px]">
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="sticky left-0 z-20 w-14 shrink-0 border-r border-gray-200 bg-gray-50" aria-hidden />
            {WEEKDAYS.map((label, dayIndex) => {
              const col = addDays(weekStartMonday, dayIndex)
              return (
                <div
                  key={label}
                  className="min-w-0 flex-1 border-l border-gray-100 px-1 py-2 text-center text-xs font-semibold text-[var(--color-domesta-gray)]"
                >
                  <span className="block">{label}</span>
                  <span className="mt-0.5 block text-[10px] font-normal text-gray-500">
                    {col.getDate()}.{pad2(col.getMonth() + 1)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex max-h-[min(70vh,720px)] overflow-y-auto">
            <div className="sticky left-0 z-10 w-14 shrink-0 border-r border-gray-200 bg-gray-50 pr-1">
              {Array.from({ length: SLOTS_PER_DAY }, (_, slot) => (
                <div
                  key={slot}
                  className="flex shrink-0 items-start justify-end border-b border-gray-100/80 pr-2 pt-0 text-[10px] leading-none text-gray-400"
                  style={{ height: SLOT_PX }}
                >
                  {slot % 2 === 0 ? <span>{slotIndexToLabel(slot)}</span> : null}
                </div>
              ))}
            </div>
            <div className="flex min-w-0 flex-1">
              {WEEKDAYS.map((label, dayIndex) => (
                <div key={label} className="relative min-w-0 flex-1 border-l border-gray-100">
                  <div
                    role="application"
                    aria-label={`Kalendarz: ${label}`}
                    className="relative touch-none"
                    style={{ height: SLOTS_PER_DAY * SLOT_PX }}
                    onPointerDown={handleDayColumnPointerDown(dayIndex)}
                    onPointerMove={handleDayColumnPointerMove(dayIndex)}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  >
                    {Array.from({ length: SLOTS_PER_DAY }, (_, slot) => (
                      <div
                        key={slot}
                        role="presentation"
                        className={cellClasses(dayIndex, slot)}
                        style={{ height: SLOT_PX }}
                      />
                    ))}
                    {blocksForUser
                      .filter((b) => b.date === columnDateKeys[dayIndex])
                      .map((b) => {
                        const top = b.startSlot * SLOT_PX
                        const h = (b.endSlot - b.startSlot + 1) * SLOT_PX
                        const { idToLane, laneCount } = laneLayoutByDay.get(dayIndex) ?? {
                          idToLane: new Map<string, number>(),
                          laneCount: 1,
                        }
                        const lane = idToLane.get(b.id) ?? 0
                        const gapPx = 2
                        const innerW = `calc((100% - ${(laneCount - 1) * gapPx}px) / ${laneCount})`
                        const leftOff = `calc(${lane} * ((100% - ${(laneCount - 1) * gapPx}px) / ${laneCount} + ${gapPx}px))`
                        return (
                          <div
                            key={b.id}
                            role="button"
                            tabIndex={0}
                            className="group absolute z-[2] cursor-pointer overflow-visible rounded border border-emerald-600/40 bg-emerald-100 shadow-sm outline-none ring-emerald-500/30 focus-visible:ring-2"
                            style={{
                              top,
                              height: Math.max(h, SLOT_PX),
                              left: leftOff,
                              width: innerW,
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation()
                              setBlockToRemoveId(b.id)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                e.stopPropagation()
                                setBlockToRemoveId(b.id)
                              }
                            }}
                          >
                            <div className="pointer-events-auto flex h-full w-full flex-col items-center justify-center overflow-hidden px-0.5 py-1">
                              <span
                                className="max-h-full text-center text-[9px] font-medium leading-none text-emerald-900 [writing-mode:vertical-rl] group-hover:invisible"
                                style={{ textOrientation: 'mixed' }}
                              >
                                {b.buildingLabel}
                              </span>
                              <div className="pointer-events-none invisible absolute inset-1 z-10 flex items-center justify-center rounded bg-white/95 px-1.5 py-1 text-center text-[10px] font-medium leading-snug text-emerald-950 shadow-md opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                                {b.buildingLabel}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {blockPendingRemove && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setBlockToRemoveId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-block-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="remove-block-title" className="mb-2 text-lg font-semibold text-[var(--color-domesta-gray)]">
              Usunąć wpis?
            </h2>
            <p className="mb-1 text-sm text-gray-600">
              Czy na pewno chcesz usunąć dostępność dla{' '}
              <span className="font-medium text-gray-800">{blockPendingRemove.buildingLabel}</span>?
            </p>
            <p className="mb-6 text-xs text-gray-500">
              {formatPolishDate(blockPendingRemove.date)},{' '}
              {slotIndexToLabel(blockPendingRemove.startSlot)} – {slotIndexToLabel(blockPendingRemove.endSlot + 1)}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBlockToRemoveId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Nie
              </button>
              <button
                type="button"
                onClick={confirmRemoveBlock}
                className="rounded-lg bg-[var(--color-domesta-red)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Tak, usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogOpen && pendingDateStr !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="availability-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="availability-dialog-title" className="mb-4 text-lg font-semibold text-[var(--color-domesta-gray)]">
              Dostępność: {formatPolishDate(pendingDateStr)},{' '}
              {slotIndexToLabel(pendingStart)} – {slotIndexToLabel(pendingEnd + 1)}
            </h2>
            <div className="space-y-4">
              <label className="block text-sm text-gray-600">
                Inwestycja
                <select
                  value={dialogInvestmentId === '' ? '' : String(dialogInvestmentId)}
                  onChange={(e) => {
                    const v = e.target.value
                    setDialogInvestmentId(v === '' ? '' : Number(v))
                    setDialogBuildingId('')
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                >
                  {investments.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-gray-600">
                Budynek
                <select
                  value={dialogBuildingId === '' ? '' : String(dialogBuildingId)}
                  onChange={(e) => {
                    const v = e.target.value
                    setDialogBuildingId(v === '' ? '' : Number(v))
                  }}
                  disabled={dialogInvestmentId === '' || buildingsForInvestment.length === 0}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)] disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">— wybierz budynek —</option>
                  {buildingsForInvestment.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.address}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDialogOpen(false)
                  setPendingDateStr(null)
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleSaveDialog}
                disabled={dialogBuildingId === ''}
                className="rounded-lg bg-[var(--color-domesta-red)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
