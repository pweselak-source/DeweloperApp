import { useState, useEffect } from 'react'
import { MENU_ITEMS } from '../data/menuItems'
import type { MenuId } from '../data/menuItems'
import dom1 from '../assets/dom1.jpg'
import dom2 from '../assets/dom2.jpg'
import dom3 from '../assets/dom3.jpg'

type SectionId = MenuId | 'siteLog'

function getSectionIcon(sectionId: SectionId): { icon: React.ReactNode; colorClass: string } {
  const menuItem = MENU_ITEMS.find((m) => m.id === sectionId)
  if (menuItem) {
    const colorClass =
      menuItem.status === 'done'
        ? 'text-emerald-600'
        : menuItem.status === 'current'
          ? 'text-amber-500'
          : 'text-gray-500'
    return { icon: menuItem.icon, colorClass }
  }
  if (sectionId === 'siteLog') {
    return {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 5H9a2 2 0 0 0-2 2v11" />
          <path d="M13 9H7" />
          <path d="M15 13H7" />
          <path d="M17 17H7" />
          <path d="M5 5v14a2 2 0 0 0 2 2h11" />
          <path d="M19 21h-2a2 2 0 0 1-2-2V3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z" />
        </svg>
      ),
      colorClass: 'text-amber-500',
    }
  }
  return { icon: null, colorClass: 'text-gray-500' }
}

function getSectionStatusIcon(sectionId: SectionId): React.ReactNode {
  const menuItem = MENU_ITEMS.find((m) => m.id === sectionId)
  const status = menuItem?.status ?? (sectionId === 'siteLog' ? 'current' : 'future')

  if (status === 'done') {
    // zielony ptaszek
    return (
      <span className="inline-block translate-x-[2px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4 text-emerald-500"
        >
          <polyline
            points="20 6 9 17 4 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }

  if (status === 'current') {
    // migająca żółta strzałka
    return (
      <span className="inline-flex items-center justify-center rounded-full animate-[coral-pulse_1.2s_ease-in-out_infinite]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4 text-amber-400"
        >
          <polyline
            points="15 18 9 12 15 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }

  // przyszłe – szary zegarek
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-gray-400"
    >
      <path
        d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7v5l3 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MainContent() {
  const [expandedSections, setExpandedSections] = useState<Record<SectionId, boolean>>({
    formalities: false,
    schedule: false,
    documents: false,
    complaints: false,
    handover: false,
    meter: false,
    siteLog: false,
    notary: false,
    news: false,
  })
  const [meterOpen, setMeterOpen] = useState(false)
  const [meterSubmitted, setMeterSubmitted] = useState(false)
  const [handoverMonthView, setHandoverMonthView] = useState(() => {
    const d = new Date(2026, 1, 1)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [handoverSelectedDate, setHandoverSelectedDate] = useState<Date | null>(null)
  const [handoverSelectedSlot, setHandoverSelectedSlot] = useState<string | null>(null)
  const [handoverCalendarVisible, setHandoverCalendarVisible] = useState(false)
  const [handoverConfirmed, setHandoverConfirmed] = useState(false)
  const [handoverToastVisible, setHandoverToastVisible] = useState(false)
  const [complaints, setComplaints] = useState<
    { id: number; type: string; description: string; hasPhoto: boolean; status: string }[]
  >([])
  const [complaintType, setComplaintType] = useState('Krzywizna ścian')
  const [complaintDescription, setComplaintDescription] = useState('')
  const [complaintHasPhoto, setComplaintHasPhoto] = useState(false)
  const [complaintFormOpen, setComplaintFormOpen] = useState(false)
  const [complaintsConfirmed, setComplaintsConfirmed] = useState(false)
  const [complaintsConfirmOpen, setComplaintsConfirmOpen] = useState(false)

  const toggleSection = (id: SectionId) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    if (!handoverToastVisible) return
    const t = setTimeout(() => setHandoverToastVisible(false), 4000)
    return () => clearTimeout(t)
  }, [handoverToastVisible])

  const installments = [
    {
      id: 'reservation',
      label: 'Opłata rezerwacyjna',
      status: 'Opłacona',
      tone: 'green' as const,
      dueDate: '15.01.2026',
      amount: '10 000,00 zł',
    },
    {
      id: 'installment1',
      label: 'Rata 1',
      status: 'Opłacona',
      tone: 'green' as const,
      dueDate: '15.03.2026',
      amount: '50 000,00 zł',
    },
    {
      id: 'installment2',
      label: 'Rata 2',
      status: 'Opłacona',
      tone: 'green' as const,
      dueDate: '15.05.2026',
      amount: '50 000,00 zł',
    },
    {
      id: 'installment3',
      label: 'Rata 3',
      status: 'Opłacona',
      tone: 'green' as const,
      dueDate: '15.07.2026',
      amount: '50 000,00 zł',
    },
    {
      id: 'installment4',
      label: 'Rata 4',
      status: 'Opłacona',
      tone: 'green' as const,
      dueDate: '15.09.2026',
      amount: '50 000,00 zł',
    },
    {
      id: 'installment5',
      label: 'Rata 5',
      status: 'Oczekuje na zapłatę',
      tone: 'amber' as const,
      dueDate: '15.11.2026',
      amount: '50 000,00 zł',
    },
    {
      id: 'installment6',
      label: 'Rata 6',
      status: 'Etap nieskończony',
      tone: 'slate' as const,
      dueDate: '15.01.2027',
      amount: '50 000,00 zł',
    },
    {
      id: 'installment7',
      label: 'Rata 7',
      status: 'Etap nieskończony',
      tone: 'slate' as const,
      dueDate: '15.03.2027',
      amount: '50 000,00 zł',
    },
  ]

const toneClasses: Record<'green' | 'amber' | 'slate', { badge: string; dot: string }> = {
  green: {
    badge: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
  },
  slate: {
    badge: 'bg-slate-50 text-slate-600',
    dot: 'bg-slate-400',
  },
}

  const monthsForSiteLog = [
    {
      id: 'nov',
      label: 'Listopad 2025',
      description:
        'Na budowie zakończono prace konstrukcyjne głównej bryły budynku oraz montaż większości okien. Trwają przygotowania do prac elewacyjnych.',
    },
    {
      id: 'dec',
      label: 'Grudzień 2025',
      description:
        'Dzisiaj na budowie ekipy kontynuują prace wykończeniowe wewnątrz klatek schodowych, prowadzone są montaże instalacji elektrycznej i sanitarnych pionów.',
    },
    {
      id: 'jan',
      label: 'Styczeń 2026',
      description:
        'W tym miesiącu skupiamy się na zagospodarowaniu terenu: powstają chodniki, miejsca postojowe oraz pierwsze nasadzenia zieleni wokół budynku.',
    },
  ]

  const photos = [
    { src: dom1, label: 'dom1' },
    { src: dom2, label: 'dom2' },
    { src: dom3, label: 'dom3' },
  ]

  const HANDOVER_TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
  ]
  const HANDOVER_DAY_ABBREV = ['PON.', 'WT.', 'ŚR.', 'CZW.', 'PT.', 'SOB.', 'NIEDZ.']
  const MONTH_NAMES = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']
  const handoverSlotKey = (date: Date, time: string) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}T${time}`
  }
  const isHandoverSlotOccupied = (date: Date, time: string) => {
    const day = date.getDay()
    if (day === 1) return time === '15:30' || time === '16:00'
    if (day === 2) return time === '10:00' || time === '10:30'
    if (day === 3) return time === '14:00' || time === '14:30'
    if (day === 5) return time === '11:00' || time === '11:30' || time === '16:30' || time === '17:00'
    return false
  }
  const getCalendarDays = (monthDate: Date) => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startOffset = (first.getDay() + 6) % 7
    const days: { date: Date | null; dayNum: number }[] = []
    for (let i = 0; i < startOffset; i++) days.push({ date: null, dayNum: 0 })
    for (let d = 1; d <= last.getDate(); d++) days.push({ date: new Date(year, month, d), dayNum: d })
    const total = days.length
    const pad = total % 7 === 0 ? 0 : 7 - (total % 7)
    for (let i = 0; i < pad; i++) days.push({ date: null, dayNum: 0 })
    return days
  }
  const handoverPrevMonth = () => {
    const d = new Date(handoverMonthView)
    d.setMonth(d.getMonth() - 1)
    setHandoverMonthView(d)
  }
  const handoverNextMonth = () => {
    const d = new Date(handoverMonthView)
    d.setMonth(d.getMonth() + 1)
    setHandoverMonthView(d)
  }
  const handoverSelectDate = (date: Date | null) => {
    setHandoverSelectedDate(date)
    setHandoverSelectedSlot(null)
  }
  const handoverSelectTime = (time: string) => {
    if (!handoverSelectedDate || isHandoverSlotOccupied(handoverSelectedDate, time)) return
    setHandoverSelectedSlot(handoverSlotKey(handoverSelectedDate, time))
  }
  const handoverCalendarDays = getCalendarDays(handoverMonthView)
  const handoverMonthLabel = () =>
    `${MONTH_NAMES[handoverMonthView.getMonth()]} ${handoverMonthView.getFullYear()}`

  const sectionBlockClass =
    'rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden'

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Formalności początkowe */}
      <section id="section-formalities" className={sectionBlockClass}>
        <button
          type="button"
          className="flex w-full items-stretch border-b border-gray-100 text-left"
          onClick={() => toggleSection('formalities')}
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-[0_0_16px_rgba(15,23,42,0.3)] ring-1 ring-white/30">
              <span className={`shrink-0 [&_svg]:h-10 [&_svg]:w-10 ${getSectionIcon('formalities').colorClass}`}>
                {getSectionIcon('formalities').icon}
              </span>
              <span className="absolute -bottom-1 -right-1">
                {getSectionStatusIcon('formalities')}
              </span>
            </span>
            <span className="h-8 w-px rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-1 items-center gap-3 bg-emerald-50/70 px-5 py-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold text-[var(--color-domesta-gray)]">
                Formalności początkowe
              </h1>
              <p className="mt-1 text-[11px] text-emerald-600">
                Status: <span className="font-medium">zakończone</span>
              </p>
            </div>
            <span className="ml-3 text-xs text-gray-500">
              {expandedSections.formalities ? 'Zwiń' : 'Rozwiń'}
            </span>
          </div>
        </button>
        {expandedSections.formalities && (
        <div className="p-5 md:p-6 bg-emerald-50/40 animate-[section-expand_0.25s_ease-out]">
        <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-[var(--color-domesta-gray)]">
              Podpisanie umowy rezerwacyjnej
            </h2>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Status: zakończona
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Umowa została podpisana. W razie pytań dotyczących warunków rezerwacji możesz skontaktować się z
            opiekunem klienta.
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-[var(--color-domesta-gray)]">
              Podpisanie umowy przedwstępnej
            </h2>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Status: w przygotowaniu
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Otrzymasz powiadomienie, gdy dokumenty będą gotowe do podpisu. Sprawdź, czy Twoje dane kontaktowe
            są aktualne.
          </p>
        </div>
        </div>
        )}
      </section>

      {handoverCalendarVisible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={handoverPrevMonth}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                ←
              </button>
              <span className="text-sm font-medium text-gray-700">
                {handoverMonthLabel()}
              </span>
              <button
                type="button"
                onClick={handoverNextMonth}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                →
              </button>
            </div>
            <div className="flex justify-center pb-4">
              <div className="grid w-full max-w-[260px] grid-cols-7 gap-x-0.5 gap-y-1 text-center text-xs scale-125 origin-top">
                {HANDOVER_DAY_ABBREV.map((abbr) => (
                  <div
                    key={abbr}
                    className="py-1 text-[10px] font-medium uppercase tracking-wide text-gray-400"
                  >
                    {abbr}
                  </div>
                ))}
                {handoverCalendarDays.map((cell, i) => {
                  const isSelected =
                    !!handoverSelectedDate && !!cell.date && handoverSelectedDate.getTime() === cell.date.getTime()
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-center ${
                        cell.date ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      onClick={() => cell.date && handoverSelectDate(cell.date)}
                    >
                      {cell.date ? (
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${
                            isSelected ? 'bg-gray-800 text-white' : 'text-gray-800'
                          }`}
                        >
                          {cell.dayNum}
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
            {handoverSelectedDate && (
              <div className="mt-6">
                <p className="mb-2 text-xs text-gray-600">
                  Godziny na dzień {handoverSelectedDate.getDate()}.{String(handoverSelectedDate.getMonth() + 1).padStart(2, '0')}:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {HANDOVER_TIME_SLOTS.map((time) => {
                    const occupied = isHandoverSlotOccupied(handoverSelectedDate, time)
                    const key = handoverSlotKey(handoverSelectedDate, time)
                    const selected = handoverSelectedSlot === key
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handoverSelectTime(time)}
                        disabled={occupied}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${occupied ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400' : selected ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="mt-8 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setHandoverCalendarVisible(false)
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                type="button"
                disabled={!handoverSelectedSlot}
                onClick={() => {
                  if (!handoverSelectedSlot) return
                  setHandoverConfirmed(true)
                  setHandoverCalendarVisible(false)
                  setHandoverToastVisible(true)
                }}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400/60"
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Harmonogram spłaty */}
      <section
        id="section-schedule"
        className={`${sectionBlockClass} ${
          !expandedSections.schedule ? 'animate-[gold-pulse_2.4s_ease-in-out_infinite]' : ''
        }`}
      >
        <button
          type="button"
          className="flex w-full items-stretch border-b border-amber-100 text-left"
          onClick={() => toggleSection('schedule')}
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-[0_0_16px_rgba(15,23,42,0.3)] ring-1 ring-white/30">
              <span className={`shrink-0 [&_svg]:h-10 [&_svg]:w-10 ${getSectionIcon('schedule').colorClass}`}>
                {getSectionIcon('schedule').icon}
              </span>
              {!expandedSections.schedule && (
                <span className="absolute -bottom-1 -right-1 animate-[gold-pulse_2.4s_ease-in-out_infinite]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-amber-400"
                  >
                    <polyline
                      points="15 18 9 12 15 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </span>
            <span className="h-8 w-px rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-1 items-center gap-3 bg-amber-50/80 px-5 py-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold text-[var(--color-domesta-gray)]">
                Harmonogram spłaty
              </h1>
              <p className="mt-1 text-[11px] text-amber-500">
                Status: <span className="font-medium">aktualnie</span>
              </p>
            </div>
            <span className="ml-3 text-xs text-gray-500">
              {expandedSections.schedule ? 'Zwiń' : 'Rozwiń'}
            </span>
          </div>
        </button>
        {expandedSections.schedule && (
        <div className="p-5 md:p-6 bg-amber-50/40 animate-[section-expand_0.25s_ease-out]">
        <div className="space-y-3">
          {installments.map((item) => {
            const tone = toneClasses[item.tone]
            const isPending = item.id === 'installment5'
            return (
              <section
                key={item.id}
                className={`flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ${
                  isPending ? 'animate-[coral-pulse_1.2s_ease-in-out_infinite]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.tone === 'green' ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  ) : (
                    <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm text-[var(--color-domesta-gray)]">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Termin płatności: <span className="font-medium text-gray-500">{item.dueDate}</span>
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Kwota do zapłaty:{' '}
                      <span className="font-semibold text-[var(--color-domesta-gray)]">
                        {item.amount}
                      </span>
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${tone.badge}`}
                >
                  {item.status}
                </span>
              </section>
            )
          })}
        </div>
        </div>
        )}
      </section>

      {/* Dokumenty do odbioru mieszkania */}
      <section id="section-documents" className={sectionBlockClass}>
        <button
          type="button"
          className="flex w-full items-stretch border-b border-slate-200 text-left"
          onClick={() => toggleSection('documents')}
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-[0_0_16px_rgba(15,23,42,0.3)] ring-1 ring-white/30">
              <span className={`shrink-0 [&_svg]:h-10 [&_svg]:w-10 ${getSectionIcon('documents').colorClass}`}>
                {getSectionIcon('documents').icon}
              </span>
              <span className="absolute -bottom-1 -right-1">
                {getSectionStatusIcon('documents')}
              </span>
            </span>
            <span className="h-8 w-px rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-1 items-center gap-3 bg-slate-50/80 px-5 py-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold text-[var(--color-domesta-gray)]">
                Dokumenty do odbioru mieszkania
              </h1>
              <p className="mt-1 text-[11px] text-gray-500">
                Status: <span className="font-medium">w oczekiwaniu</span>
              </p>
            </div>
            <span className="ml-3 text-xs text-gray-500">
              {expandedSections.documents ? 'Zwiń' : 'Rozwiń'}
            </span>
          </div>
        </button>
        {expandedSections.documents && (
        <div className="p-5 md:p-6 bg-slate-50/40 animate-[section-expand_0.25s_ease-out]">
          <div className="rounded-xl bg-white p-4 text-xs text-gray-600">
            Tutaj pojawi się lista dokumentów wymaganych do odbioru mieszkania (mock).
          </div>
        </div>
        )}
      </section>

      {/* Reklamacje */}
      <section id="section-complaints" className={sectionBlockClass}>
        <button
          type="button"
          className="flex w-full items-stretch border-b border-slate-200 text-left"
          onClick={() => toggleSection('complaints')}
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-[0_0_16px_rgba(15,23,42,0.3)] ring-1 ring-white/30">
              <span className={`shrink-0 [&_svg]:h-10 [&_svg]:w-10 ${getSectionIcon('complaints').colorClass}`}>
                {getSectionIcon('complaints').icon}
              </span>
              <span className="absolute -bottom-1 -right-1">
                {getSectionStatusIcon('complaints')}
              </span>
            </span>
            <span className="h-8 w-px rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-1 items-center gap-3 bg-slate-50/80 px-5 py-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold text-[var(--color-domesta-gray)]">Reklamacje</h1>
              <p className="mt-1 text-[11px] text-gray-500">
                Status: <span className="font-medium">w oczekiwaniu</span>
              </p>
            </div>
            <span className="ml-3 text-xs text-gray-500">
              {expandedSections.complaints ? 'Zwiń' : 'Rozwiń'}
            </span>
          </div>
        </button>
        {expandedSections.complaints && (
        <div className="p-5 md:p-6 bg-slate-50/40 animate-[section-expand_0.25s_ease-out]">
        {(() => {
          const complaintTypes = [
            'Krzywizna ścian',
            'Krzywizna sufitów',
            'Grzyb',
            'Pęknięcia na oknach',
            'Wady w podłodze',
            'Niezgodna elektryka',
            'Inne',
          ]

          const handleAddComplaint = () => {
            if (!complaintDescription.trim()) return
            setComplaints((prev) => [
              {
                id: Date.now(),
                type: complaintType,
                description: complaintDescription.trim(),
                hasPhoto: complaintHasPhoto,
                status: 'Nowa',
              },
              ...prev,
            ])
            setComplaintDescription('')
            setComplaintHasPhoto(false)
            setComplaintFormOpen(false)
          }

          const handleResetComplaints = () => {
            setComplaints([])
            setComplaintDescription('')
            setComplaintHasPhoto(false)
            setComplaintType('Krzywizna ścian')
            setComplaintFormOpen(false)
            setComplaintsConfirmed(false)
          }

          const handleConfirmComplaints = () => {
            if (complaintsConfirmOpen || complaintsConfirmed) return
            setComplaintsConfirmOpen(true)
          }

          return (
            <section className="mt-2 rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-[var(--color-domesta-gray)]">
                  Lista reklamacji
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-domesta-red)] text-white text-xs animate-[coral-pulse_1.2s_ease-in-out_infinite]"
                    onClick={() => setComplaintFormOpen(true)}
                    aria-label="Dodaj reklamację"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="text-[11px] text-gray-500 underline"
                    onClick={handleResetComplaints}
                  >
                    Reset listy (mock)
                  </button>
                </div>
              </div>

              {complaintFormOpen && (
                <div className="mb-4 rounded-lg border border-gray-100 bg-gray-50/70 p-3 text-xs">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">
                      Nowa reklamacja
                    </span>
                    <button
                      type="button"
                      className="text-[11px] text-gray-400 hover:text-gray-600"
                      onClick={() => setComplaintFormOpen(false)}
                    >
                      Anuluj
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-gray-500">Typ usterki</label>
                      <select
                        className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs outline-none focus:border-[var(--color-domesta-red)] focus:ring-1 focus:ring-[var(--color-domesta-red)]"
                        value={complaintType}
                        onChange={(e) => setComplaintType(e.target.value)}
                      >
                        {complaintTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-gray-500">Opis problemu</label>
                      <textarea
                        rows={3}
                        className="w-full rounded-md border border-gray-200 bg-white px-2 py-2 text-xs outline-none focus:border-[var(--color-domesta-red)] focus:ring-1 focus:ring-[var(--color-domesta-red)]"
                        placeholder="Opisz krótko, gdzie występuje problem i w jakich okolicznościach został zauważony."
                        value={complaintDescription}
                        onChange={(e) => setComplaintDescription(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[11px] ${
                          complaintHasPhoto
                            ? 'border-[var(--color-domesta-red)] bg-[var(--color-domesta-red)]/5 text-[var(--color-domesta-red)]'
                            : 'border-gray-300 text-gray-600 hover:border-[var(--color-domesta-red)]/60 hover:text-[var(--color-domesta-red)]'
                        }`}
                        onClick={() => setComplaintHasPhoto((v) => !v)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 7h4l2-3h4l2 3h4v12H4z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                        {complaintHasPhoto ? 'Dodano zdjęcie (mock)' : 'Dodaj zdjęcie (mock)'}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-lg bg-[var(--color-domesta-red)] px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
                        onClick={handleAddComplaint}
                        disabled={!complaintDescription.trim()}
                      >
                        Zapisz reklamację
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">
                    Twoje reklamacje
                  </span>
                  <span className="text-[11px] text-gray-400">Łącznie: {complaints.length}</span>
                </div>

                {complaints.length === 0 ? (
                  <p className="text-[11px] text-gray-400">
                    Nie dodałeś jeszcze żadnej reklamacji. Użyj przycisku z plusem, aby utworzyć
                    pierwszą.
                  </p>
                ) : (
                  <>
                    <ul className="space-y-3 text-xs">
                      {complaints.map((c) => (
                        <li
                          key={c.id}
                          className="rounded-lg border border-gray-100 bg-gray-50/60 p-3"
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">
                              {c.type}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                              {c.status}
                            </span>
                          </div>
                          <p className="mb-1 text-[11px] text-gray-600">{c.description}</p>
                          {c.hasPhoto && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] text-gray-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M4 7h4l2-3h4l2 3h4v12H4z" />
                                <circle cx="12" cy="13" r="3" />
                              </svg>
                              zdjęcie załączone (mock)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between">
                      {!complaintsConfirmed && (
                        <button
                          type="button"
                          className="inline-flex items-center rounded-lg border border-[var(--color-domesta-red)] bg-[var(--color-domesta-red)]/5 px-3 py-1.5 text-[11px] font-medium text-[var(--color-domesta-red)]"
                          onClick={handleConfirmComplaints}
                        >
                          Potwierdzam kompletność listy
                        </button>
                      )}
                      {complaintsConfirmed && (
                        <span className="text-[11px] font-medium text-emerald-600">
                          Status: lista kompletna
                        </span>
                      )}
                    </div>

                    {complaintsConfirmOpen && !complaintsConfirmed && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
                          <h3 className="mb-2 text-sm font-semibold text-[var(--color-domesta-gray)]">
                            Potwierdzić kompletność listy?
                          </h3>
                          <p className="mb-4 text-[11px] text-gray-600">
                            Po potwierdzeniu deweloper rozpocznie proces weryfikacji wszystkich
                            zgłoszonych usterek. Czy na pewno lista reklamacji jest kompletna na tym
                            etapie?
                          </p>
                          <div className="flex justify-end gap-2 text-[11px]">
                            <button
                              type="button"
                              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-600"
                              onClick={() => setComplaintsConfirmOpen(false)}
                            >
                              Anuluj
                            </button>
                            <button
                              type="button"
                              className="rounded-lg bg-[var(--color-domesta-red)] px-3 py-1.5 font-medium text-white"
                              onClick={() => {
                                setComplaintsConfirmed(true)
                                setComplaintsConfirmOpen(false)
                              }}
                            >
                              Potwierdzam
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )
        })()}
        </div>
        )}
      </section>

      {/* Odbiór mieszkania */}
      <section id="section-handover" className={sectionBlockClass}>
        <button
          type="button"
          className="flex w-full items-stretch border-b border-slate-200 text-left"
          onClick={() => toggleSection('handover')}
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-[0_0_16px_rgba(15,23,42,0.3)] ring-1 ring-white/30">
              <span className={`shrink-0 [&_svg]:h-10 [&_svg]:w-10 ${getSectionIcon('handover').colorClass}`}>
                {getSectionIcon('handover').icon}
              </span>
              <span className="absolute -bottom-1 -right-1">
                {getSectionStatusIcon('handover')}
              </span>
            </span>
            <span className="h-8 w-px rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-1 items-center gap-3 bg-slate-50/80 px-5 py-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold text-[var(--color-domesta-gray)]">Odbiór mieszkania</h1>
              <p className="mt-1 text-[11px] text-gray-500">
                Status: <span className="font-medium">w oczekiwaniu</span>
              </p>
            </div>
            <span className="ml-3 text-xs text-gray-500">
              {expandedSections.handover ? 'Zwiń' : 'Rozwiń'}
            </span>
          </div>
        </button>
        {expandedSections.handover && (
        <div className="p-5 md:p-6 bg-slate-50/40 animate-[section-expand_0.25s_ease-out]">
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-domesta-gray)]">
            Umów spotkanie – odbiór mieszkania
          </h2>
          <p className="mt-1 text-[11px] text-gray-500">
            Spotkanie może trwać około 1–2 godziny. Mogą być obecne maksymalnie 2 osoby ze strony kupującego.
          </p>
          <div className="mt-4" />
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-gray-100 bg-gray-50/60 py-12">
            {handoverConfirmed && handoverSelectedSlot ? (
              <>
                <p className="text-center text-sm font-medium text-emerald-700">
                  ✓ Termin odbioru potwierdzony
                </p>
                <p className="text-center text-base font-semibold text-[var(--color-domesta-gray)]">
                  {handoverSelectedSlot.replace('T', ' ')}
                </p>
                <p className="text-center text-xs text-gray-500">
                  Otrzymasz potwierdzenie e-mailem. W razie zmiany terminu skontaktuj się z opiekunem klienta.
                </p>
                <button
                  type="button"
                  onClick={() => setHandoverCalendarVisible(true)}
                  className="text-[11px] text-gray-500 underline hover:text-gray-700"
                >
                  Zmień termin
                </button>
              </>
            ) : (
              <>
                <p className="text-center text-sm text-gray-600">
                  Wybierz dogodny termin odbioru mieszkania w kalendarzu dostępnych slotów.
                </p>
                <button
                  type="button"
                  onClick={() => setHandoverCalendarVisible(true)}
                  className="rounded-lg bg-[var(--color-domesta-coral)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                >
                  Zarezerwuj termin
                </button>
              </>
            )}
          </div>
        </section>
        </div>
        )}
      </section>

      {handoverToastVisible && handoverSelectedSlot && (
        <div className="fixed bottom-4 left-4 z-50 flex max-w-xs items-start gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-[11px] text-white shadow-lg">
          <span className="mt-0.5">
            ✓ Wizyta została potwierdzona na{' '}
            <span className="font-semibold">
              {handoverSelectedSlot.replace('T', ' ')}
            </span>
          </span>
        </div>
      )}

      {/* Zgłoszenia licznika do energii */}
      <section id="section-meter" className={sectionBlockClass}>
        <button
          type="button"
          className="flex w-full items-stretch border-b border-slate-200 text-left"
          onClick={() => toggleSection('meter')}
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-[0_0_16px_rgba(15,23,42,0.3)] ring-1 ring-white/30">
              <span className={`shrink-0 [&_svg]:h-10 [&_svg]:w-10 ${getSectionIcon('meter').colorClass}`}>
                {getSectionIcon('meter').icon}
              </span>
              <span className="absolute -bottom-1 -right-1">
                {getSectionStatusIcon('meter')}
              </span>
            </span>
            <span className="h-8 w-px rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-1 items-center gap-3 bg-slate-50/80 px-5 py-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold text-[var(--color-domesta-gray)]">
                Zgłoszenia licznika do energii
              </h1>
              <p className="mt-1 text-[11px] text-gray-500">
                Status: <span className="font-medium">w oczekiwaniu</span>
              </p>
            </div>
            <span className="ml-3 text-xs text-gray-500">
              {expandedSections.meter ? 'Zwiń' : 'Rozwiń'}
            </span>
          </div>
        </button>
        {expandedSections.meter && (
        <div className="p-5 md:p-6 bg-slate-50/40 animate-[section-expand_0.25s_ease-out]">
        <section
          className={`rounded-xl bg-white p-4 shadow-sm transition-shadow ${
            !meterSubmitted ? 'cursor-pointer' : ''
          }`}
          onClick={() => {
            if (!meterSubmitted) setMeterOpen(true)
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {!meterSubmitted && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-domesta-coral)] animate-[coral-pulse_1.2s_ease-in-out_infinite]" />
                )}
                <h2 className="text-sm font-medium text-[var(--color-domesta-gray)]">
                  Wpisz dane liczników za styczeń – marzec
                </h2>
              </div>
              <span className="text-[11px] text-gray-500">
                Upewnij się, że przekazujesz stan z ostatniego dnia okresu rozliczeniowego.
              </span>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                meterSubmitted
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {meterSubmitted ? 'Status: przekazano' : 'Status: oczekuje na zgłoszenie'}
            </span>
          </div>

          {meterOpen && !meterSubmitted && (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-red-100 bg-red-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-red-800">Licznik ciepłej wody</span>
                  <span className="text-[11px] text-red-500">Nr licznika: 123456789</span>
                </div>
                <input
                  type="number"
                  className="w-full rounded-md border border-red-100 bg-white px-3 py-2 text-xs outline-none focus:border-[var(--color-domesta-red)] focus:ring-1 focus:ring-[var(--color-domesta-red)]"
                  placeholder="Podaj aktualny stan (m³)"
                />
              </div>

              <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-sky-800">Licznik zimnej wody</span>
                  <span className="text-[11px] text-sky-500">Nr licznika: 987654321</span>
                </div>
                <input
                  type="number"
                  className="w-full rounded-md border border-sky-100 bg-white px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="Podaj aktualny stan (m³)"
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-lg bg-[var(--color-domesta-red)] px-3 py-2 text-xs font-medium text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMeterSubmitted(true)
                    setMeterOpen(false)
                  }}
                >
                  Zatwierdź zgłoszenie
                </button>
                {meterSubmitted && (
                  <button
                    type="button"
                    className="text-[11px] text-gray-500 underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMeterSubmitted(false)
                      setMeterOpen(false)
                    }}
                  >
                    Reset (mock)
                  </button>
                )}
              </div>
            </div>
          )}

          {meterSubmitted && (
            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
              <span>Odczyty zostały przekazane do dewelopera.</span>
              <button
                type="button"
                className="text-[11px] font-medium text-[var(--color-domesta-red)] underline"
                onClick={(e) => {
                  e.stopPropagation()
                  setMeterSubmitted(false)
                  setMeterOpen(false)
                }}
              >
                Reset (mock)
              </button>
            </div>
          )}
        </section>
        </div>
        )}
      </section>

      {/* Podpisanie aktu notarialnego – placeholder */}
      <section id="section-notary" className={sectionBlockClass}>
        <button
          type="button"
          className="flex w-full items-stretch border-b border-slate-200 text-left"
          onClick={() => toggleSection('notary')}
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-[0_0_16px_rgba(15,23,42,0.3)] ring-1 ring-white/30">
              <span className={`shrink-0 [&_svg]:h-10 [&_svg]:w-10 ${getSectionIcon('notary').colorClass}`}>
                {getSectionIcon('notary').icon}
              </span>
              <span className="absolute -bottom-1 -right-1">
                {getSectionStatusIcon('notary')}
              </span>
            </span>
            <span className="h-8 w-px rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-1 items-center gap-3 bg-slate-50/80 px-5 py-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold text-[var(--color-domesta-gray)]">
                Podpisanie aktu notarialnego
              </h1>
              <p className="mt-1 text-[11px] text-gray-500">
                Status: <span className="font-medium">w oczekiwaniu</span>
              </p>
            </div>
            <span className="ml-3 text-xs text-gray-500">
              {expandedSections.notary ? 'Zwiń' : 'Rozwiń'}
            </span>
          </div>
        </button>
        {expandedSections.notary && (
        <div className="p-5 md:p-6 bg-slate-50/40 animate-[section-expand_0.25s_ease-out]">
          <div className="rounded-xl bg-white p-4 text-xs text-gray-600">
            W tym miejscu w przyszłości pojawi się harmonogram i szczegóły podpisania aktu
            notarialnego (mock).
          </div>
        </div>
        )}
      </section>

      {/* Dziennik budowy */}
      <section id="section-siteLog" className={sectionBlockClass}>
        <button
          type="button"
          className="flex w-full items-stretch border-b border-amber-100 text-left"
          onClick={() => toggleSection('siteLog')}
        >
          <div className="flex items-center gap-3 bg-white px-5 py-3">
            <span className="shrink-0 [&_svg]:h-10 [&_svg]:w-10 rounded-2xl bg-gradient-to-br from-white/40 via-white/10 to-transparent shadow-[0_0_16px_rgba(15,23,42,0.3)] ring-1 ring-white/30">
              {getSectionIcon('siteLog').icon}
            </span>
            <span className="h-8 w-px rounded-full bg-gray-200" />
          </div>
          <div className="flex flex-1 items-center gap-3 bg-amber-50/80 px-5 py-3">
            <div className="flex-1">
              <h1 className="text-base font-semibold text-[var(--color-domesta-gray)]">
                Dziennik budowy
              </h1>
              <p className="mt-1 text-[11px] text-amber-500">
                Status: <span className="font-medium">aktualnie</span>
              </p>
            </div>
            <span className="ml-3 text-xs text-gray-500">
              {expandedSections.siteLog ? 'Zwiń' : 'Rozwiń'}
            </span>
          </div>
        </button>
        {expandedSections.siteLog && (
        <div className="p-5 md:p-6 bg-amber-50/40 animate-[section-expand_0.25s_ease-out]">
        <div className="space-y-4">
          {monthsForSiteLog.map((month) => (
            <section key={month.id} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-domesta-gray)]">
                  {month.label}
                </span>
                <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
                  Raport postępu prac
                </span>
              </div>
              <p className="mb-3 text-[11px] text-gray-500">{month.description}</p>

              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <figure
                    key={photo.label}
                    className="flex aspect-[4/3] flex-col overflow-hidden rounded-lg border border-gray-100 bg-slate-100"
                  >
                    <img
                      src={photo.src}
                      alt=""
                      className="h-full w-full flex-1 object-cover"
                    />
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>
        </div>
        )}
      </section>
    </main>
  )
}
