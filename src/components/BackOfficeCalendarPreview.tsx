import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { AvailabilityBlock, CalendarBooking } from '../data/calendarShared'
import {
  addDays,
  availabilityBlocksCoveringRange,
  clipDragToAvailableRange,
  formatDateKey,
  formatPolishDate,
  formatWeekRangeLabel,
  pad2,
  SLOTS_PER_DAY,
  slotCoveredByAvailability,
  slotIndexToLabel,
} from '../data/calendarShared'
import type { CalendarManagementUser } from './BackOfficeCalendarManagement'
import { FilterableUserSelect } from './FilterableUserSelect'

const WEEKDAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'] as const
const SLOT_PX = 22

function clientYToSlot(clientY: number, columnTop: number): number {
  const y = clientY - columnTop
  return Math.max(0, Math.min(SLOTS_PER_DAY - 1, Math.floor(y / SLOT_PX)))
}

function assignLanes(blocks: { id: string; startSlot: number; endSlot: number }[]): {
  idToLane: Map<string, number>
  laneCount: number
} {
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

type BackOfficeCalendarPreviewProps = {
  calendarUsers: CalendarManagementUser[]
  availabilityBlocks: AvailabilityBlock[]
  bookings: CalendarBooking[]
  onBookingsChange: Dispatch<SetStateAction<CalendarBooking[]>>
}

export function BackOfficeCalendarPreview({
  calendarUsers,
  availabilityBlocks,
  bookings,
  onBookingsChange,
}: BackOfficeCalendarPreviewProps) {
  const [viewedUserId, setViewedUserId] = useState(() => calendarUsers[0]?.id ?? '')
  const [weekStartMonday, setWeekStartMonday] = useState(() => new Date(2026, 2, 23))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingDateStr, setPendingDateStr] = useState<string | null>(null)
  const [pendingStart, setPendingStart] = useState(0)
  const [pendingEnd, setPendingEnd] = useState(0)
  const [dialogBuildingId, setDialogBuildingId] = useState<number | ''>('')
  const [dialogAssigneeId, setDialogAssigneeId] = useState<string>('')

  const dragRef = useRef<{ dayIndex: number; anchorSlot: number; active: boolean } | null>(null)
  const [dragHighlight, setDragHighlight] = useState<{ dayIndex: number; start: number; end: number } | null>(null)
  const dragHighlightRef = useRef(dragHighlight)
  dragHighlightRef.current = dragHighlight

  const availabilityForViewed = useMemo(
    () => availabilityBlocks.filter((b) => b.userId === viewedUserId),
    [availabilityBlocks, viewedUserId],
  )

  const bookingsForViewed = useMemo(
    () => bookings.filter((b) => b.calendarOwnerUserId === viewedUserId),
    [bookings, viewedUserId],
  )

  const columnDateKeys = useMemo(
    () => WEEKDAYS.map((_, dayIndex) => formatDateKey(addDays(weekStartMonday, dayIndex))),
    [weekStartMonday],
  )

  const laneLayoutAvailability = useMemo(() => {
    const map = new Map<number, { idToLane: Map<string, number>; laneCount: number }>()
    for (let d = 0; d < WEEKDAYS.length; d++) {
      const key = columnDateKeys[d]
      const dayBlocks = availabilityForViewed.filter((b) => b.date === key)
      map.set(d, assignLanes(dayBlocks))
    }
    return map
  }, [availabilityForViewed, columnDateKeys])

  const laneLayoutBookings = useMemo(() => {
    const map = new Map<number, { idToLane: Map<string, number>; laneCount: number }>()
    for (let d = 0; d < WEEKDAYS.length; d++) {
      const key = columnDateKeys[d]
      const dayBookings = bookingsForViewed.filter((b) => b.date === key)
      map.set(d, assignLanes(dayBookings))
    }
    return map
  }, [bookingsForViewed, columnDateKeys])

  useEffect(() => {
    if (calendarUsers.length && !calendarUsers.some((u) => u.id === viewedUserId)) {
      setViewedUserId(calendarUsers[0].id)
    }
  }, [calendarUsers, viewedUserId])

  const openBookingDialog = useCallback(
    (dayIndex: number, start: number, end: number) => {
      const dateStr = formatDateKey(addDays(weekStartMonday, dayIndex))
      const dayBlocks = availabilityForViewed.filter((b) => b.date === dateStr)
      const eligible = availabilityBlocksCoveringRange(dayBlocks, start, end)
      if (eligible.length === 0) return
      setPendingDateStr(dateStr)
      setPendingStart(start)
      setPendingEnd(end)
      const first = eligible[0]
      setDialogBuildingId(first ? first.buildingId : '')
      setDialogAssigneeId(calendarUsers.find((u) => u.id !== viewedUserId)?.id ?? calendarUsers[0]?.id ?? '')
      setDialogOpen(true)
    },
    [availabilityForViewed, calendarUsers, viewedUserId, weekStartMonday],
  )

  const handleDayColumnPointerDown = (dayIndex: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const dateStr = columnDateKeys[dayIndex]
    const dayBlocks = availabilityForViewed.filter((b) => b.date === dateStr)
    const rect = e.currentTarget.getBoundingClientRect()
    const slot = clientYToSlot(e.clientY, rect.top)
    if (!slotCoveredByAvailability(slot, dayBlocks)) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { dayIndex, anchorSlot: slot, active: true }
    setDragHighlight({ dayIndex, start: slot, end: slot })
  }

  const handleDayColumnPointerMove = (dayIndex: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d?.active || d.dayIndex !== dayIndex) return
    const dateStr = columnDateKeys[dayIndex]
    const dayBlocks = availabilityForViewed.filter((b) => b.date === dateStr)
    const rect = e.currentTarget.getBoundingClientRect()
    const slot = clientYToSlot(e.clientY, rect.top)
    const clipped = clipDragToAvailableRange(d.anchorSlot, slot, dayBlocks)
    if (!clipped) {
      setDragHighlight({ dayIndex, start: d.anchorSlot, end: d.anchorSlot })
      return
    }
    setDragHighlight({ dayIndex, start: clipped.start, end: clipped.end })
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
      openBookingDialog(h.dayIndex, h.start, h.end)
    },
    [openBookingDialog],
  )

  const eligibleBuildingsForDialog = useMemo(() => {
    if (pendingDateStr === null) return []
    const dayBlocks = availabilityForViewed.filter((b) => b.date === pendingDateStr)
    const raw = availabilityBlocksCoveringRange(dayBlocks, pendingStart, pendingEnd)
    const seen = new Set<number>()
    return raw.filter((b) => {
      if (seen.has(b.buildingId)) return false
      seen.add(b.buildingId)
      return true
    })
  }, [availabilityForViewed, pendingDateStr, pendingStart, pendingEnd])

  const selectedBuildingLabel = useMemo(() => {
    if (dialogBuildingId === '') return ''
    return eligibleBuildingsForDialog.find((b) => b.buildingId === dialogBuildingId)?.buildingLabel ?? ''
  }, [dialogBuildingId, eligibleBuildingsForDialog])

  const handleSaveBooking = () => {
    if (pendingDateStr === null || dialogBuildingId === '' || dialogAssigneeId === '') return
    const assignee = calendarUsers.find((u) => u.id === dialogAssigneeId)
    if (!assignee) return
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `bk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    onBookingsChange((prev) => [
      ...prev,
      {
        id,
        calendarOwnerUserId: viewedUserId,
        date: pendingDateStr,
        startSlot: pendingStart,
        endSlot: pendingEnd,
        buildingId: Number(dialogBuildingId),
        buildingLabel: selectedBuildingLabel || '—',
        assigneeUserId: dialogAssigneeId,
        assigneeName: assignee.name,
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
    const dateStr = columnDateKeys[dayIndex]
    const dayBlocks = availabilityForViewed.filter((b) => b.date === dateStr)
    const avail = slotCoveredByAvailability(slot, dayBlocks)
    const base = `shrink-0 border-b border-gray-100 select-none transition-colors ${avail ? 'cursor-crosshair hover:bg-sky-50/80' : 'cursor-not-allowed bg-gray-100/90'}`
    const hi = slotHighlighted(dayIndex, slot)
    return `${base} ${hi ? 'bg-amber-200/90 ring-1 ring-inset ring-amber-400/60' : avail ? 'bg-white' : ''}`
  }

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-[var(--color-domesta-gray)]">Podgląd kalendarza</h1>
        <FilterableUserSelect
          label="Kalendarz użytkownika"
          users={calendarUsers}
          value={viewedUserId}
          onChange={setViewedUserId}
        />
      </div>

      <p className="text-sm text-gray-600">
        Zielone pola to dostępność z widoku „Zarządzanie kalendarzem”. Zaznacz przedział <strong>tylko w tych polach</strong>, wybierz budynek
        dostępny w całym zaznaczeniu oraz użytkownika, którego umawiasz na wizytę.
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
                    aria-label={`Podgląd: ${label}`}
                    className="relative touch-none"
                    style={{ height: SLOTS_PER_DAY * SLOT_PX }}
                    onPointerDown={handleDayColumnPointerDown(dayIndex)}
                    onPointerMove={handleDayColumnPointerMove(dayIndex)}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  >
                    {Array.from({ length: SLOTS_PER_DAY }, (_, slot) => (
                      <div key={slot} role="presentation" className={cellClasses(dayIndex, slot)} style={{ height: SLOT_PX }} />
                    ))}
                    {availabilityForViewed
                      .filter((b) => b.date === columnDateKeys[dayIndex])
                      .map((b) => {
                        const top = b.startSlot * SLOT_PX
                        const h = (b.endSlot - b.startSlot + 1) * SLOT_PX
                        const { idToLane, laneCount } = laneLayoutAvailability.get(dayIndex) ?? {
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
                            className="pointer-events-none absolute z-[2] overflow-hidden rounded border border-emerald-600/40 bg-emerald-100/95 px-0.5 py-0.5 text-[9px] font-medium leading-tight text-emerald-900 shadow-sm"
                            style={{
                              top,
                              height: Math.max(h, SLOT_PX),
                              left: leftOff,
                              width: innerW,
                            }}
                            title={b.buildingLabel}
                          >
                            <span className="line-clamp-4 [writing-mode:vertical-rl]">{b.buildingLabel}</span>
                          </div>
                        )
                      })}
                    {bookingsForViewed
                      .filter((b) => b.date === columnDateKeys[dayIndex])
                      .map((b) => {
                        const top = b.startSlot * SLOT_PX
                        const h = (b.endSlot - b.startSlot + 1) * SLOT_PX
                        const { idToLane, laneCount } = laneLayoutBookings.get(dayIndex) ?? {
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
                            className="pointer-events-none absolute z-[3] overflow-hidden rounded border border-sky-600/50 bg-sky-100 px-0.5 py-0.5 text-[9px] font-medium leading-tight text-sky-950 shadow-md"
                            style={{
                              top,
                              height: Math.max(h, SLOT_PX),
                              left: leftOff,
                              width: innerW,
                            }}
                            title={`${b.assigneeName} · ${b.buildingLabel}`}
                          >
                            <span className="line-clamp-4 [writing-mode:vertical-rl]">
                              {b.assigneeName} · {b.buildingLabel}
                            </span>
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

      {dialogOpen && pendingDateStr !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="booking-dialog-title" className="mb-4 text-lg font-semibold text-[var(--color-domesta-gray)]">
              Umówienie wizyty
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              {formatPolishDate(pendingDateStr)}, {slotIndexToLabel(pendingStart)} – {slotIndexToLabel(pendingEnd + 1)}
              <br />
              <span className="text-xs text-gray-500">Kalendarz: {calendarUsers.find((u) => u.id === viewedUserId)?.name}</span>
            </p>
            <div className="space-y-4">
              <label className="block text-sm text-gray-600">
                Budynek (dostępny w całym zaznaczeniu)
                <select
                  value={dialogBuildingId === '' ? '' : String(dialogBuildingId)}
                  onChange={(e) => setDialogBuildingId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                >
                  {eligibleBuildingsForDialog.map((b) => (
                    <option key={`${b.id}-${b.buildingId}`} value={b.buildingId}>
                      {b.buildingLabel}
                    </option>
                  ))}
                </select>
              </label>
              <div className="text-sm text-gray-600">
                <FilterableUserSelect
                  label="Umówiony użytkownik"
                  users={calendarUsers}
                  value={dialogAssigneeId}
                  onChange={setDialogAssigneeId}
                  menuZClass="z-[100]"
                />
              </div>
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
                onClick={handleSaveBooking}
                disabled={dialogBuildingId === '' || dialogAssigneeId === ''}
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
