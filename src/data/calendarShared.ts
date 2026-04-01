/** Wspólne typy i przykładowe dane kalendarza (dostępność + umówienia). */

import { getUserDisplayName } from './usersDirectory'

export type AvailabilityBlock = {
  id: string
  userId: string
  date: string
  startSlot: number
  endSlot: number
  buildingId: number
  buildingLabel: string
}

/** Umówienie gościa (assignee) na budynek w czasie dostępności właściciela kalendarza. */
export type CalendarBooking = {
  id: string
  calendarOwnerUserId: string
  date: string
  startSlot: number
  endSlot: number
  buildingId: number
  buildingLabel: string
  assigneeUserId: string
  assigneeName: string
}

export const WORK_START_SLOT = 16
export const WORK_END_SLOT = 35

const SAMPLE_BUILDINGS: { id: number; label: string }[] = [
  { id: 1, label: 'ul. Kampinowska 12A' },
  { id: 2, label: 'ul. Kampinowska 12B' },
  { id: 3, label: 'ul. Ogrodowa 7A' },
  { id: 4, label: 'ul. Ogrodowa 7B' },
  { id: 5, label: 'ul. Morenowa 20A' },
]

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export const SLOTS_PER_DAY = 48
export const SLOT_MINUTES = 30

export function slotIndexToLabel(slot: number): string {
  const totalMin = slot * SLOT_MINUTES
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

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

export function formatPolishDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${dt.getDate()} ${MONTHS_GEN[dt.getMonth()]} ${dt.getFullYear()}`
}

export function formatWeekRangeLabel(weekStartMonday: Date): string {
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

export function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() + n)
  return x
}

export function buildSampleAvailabilityBlocks(userIds: string[]): AvailabilityBlock[] {
  if (userIds.length === 0) return []
  const anchorMonday = new Date(2026, 2, 23)
  const out: AvailabilityBlock[] = []
  let nid = 0

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
    for (let u = 0; u < userIds.length; u++) {
      const userId = userIds[u]!
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

export function slotCoveredByAvailability(slot: number, dayBlocks: AvailabilityBlock[]): boolean {
  return dayBlocks.some((b) => b.startSlot <= slot && slot <= b.endSlot)
}

/** Rozciąga zaznaczenie od kotwicy w stronę kursora tylko po dostępnych slotach (spójny fragment). */
export function clipDragToAvailableRange(
  anchor: number,
  current: number,
  dayBlocks: AvailabilityBlock[],
): { start: number; end: number } | null {
  const isAvail = (s: number) => slotCoveredByAvailability(s, dayBlocks)
  if (!isAvail(anchor)) return null
  const goalLo = Math.min(anchor, current)
  const goalHi = Math.max(anchor, current)
  let lo = anchor
  let hi = anchor
  for (let s = anchor - 1; s >= goalLo; s--) {
    if (!isAvail(s)) break
    lo = s
  }
  for (let s = anchor + 1; s <= goalHi; s++) {
    if (!isAvail(s)) break
    hi = s
  }
  return { start: lo, end: hi }
}

/** Budynki, których blok dostępności w całości obejmuje [start, end]. */
export function availabilityBlocksCoveringRange(
  dayBlocks: AvailabilityBlock[],
  start: number,
  end: number,
): AvailabilityBlock[] {
  return dayBlocks.filter((b) => b.startSlot <= start && b.endSlot >= end)
}

/** Przykładowe umówienia (właściciel kalendarza = Klient z podglądu). */
export function buildSampleCalendarBookings(): CalendarBooking[] {
  return [
    {
      id: 'bk-1',
      calendarOwnerUserId: 'u4',
      date: '2026-03-24',
      startSlot: 22,
      endSlot: 26,
      buildingId: 2,
      buildingLabel: 'ul. Kampinowska 12B',
      assigneeUserId: 'u5',
      assigneeName: getUserDisplayName('u5'),
    },
    {
      id: 'bk-2',
      calendarOwnerUserId: 'u4',
      date: '2026-03-25',
      startSlot: 28,
      endSlot: 31,
      buildingId: 3,
      buildingLabel: 'ul. Ogrodowa 7A',
      assigneeUserId: 'u6',
      assigneeName: getUserDisplayName('u6'),
    },
    {
      id: 'bk-3',
      calendarOwnerUserId: 'u5',
      date: '2026-03-26',
      startSlot: 20,
      endSlot: 24,
      buildingId: 4,
      buildingLabel: 'ul. Ogrodowa 7B',
      assigneeUserId: 'u3',
      assigneeName: getUserDisplayName('u3'),
    },
    {
      id: 'bk-4',
      calendarOwnerUserId: 'u6',
      date: '2026-03-27',
      startSlot: 16,
      endSlot: 20,
      buildingId: 5,
      buildingLabel: 'ul. Morenowa 20A',
      assigneeUserId: 'u4',
      assigneeName: getUserDisplayName('u4'),
    },
    {
      id: 'bk-5',
      calendarOwnerUserId: 'u3',
      date: '2026-03-23',
      startSlot: 26,
      endSlot: 30,
      buildingId: 3,
      buildingLabel: 'ul. Ogrodowa 7A',
      assigneeUserId: 'u5',
      assigneeName: getUserDisplayName('u5'),
    },
  ]
}
