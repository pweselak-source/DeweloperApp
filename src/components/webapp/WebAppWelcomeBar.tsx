import { useEffect, useState, type ReactNode } from 'react'
import { MENU_ITEMS } from '../../data/menuItems'
import type { MenuId, MenuStatus } from '../../data/menuItems'

const CARETAKER = {
  phone: '+48 22 390 12 08',
  phoneHref: 'tel:+48223901208',
  email: 'm.krawczyk@domesta.pl',
}

const DAYS_TO_HANDOVER = 127
const NEXT_MEETING_LABEL = '15 maja 2026, godz. 10:00'
const COMPLAINTS_SUBMITTED = 3
const COMPLAINTS_ACCEPTED = 3
const NEXT_INSTALLMENT_DATE = '15 listopada 2026'

const TICK_INTERVAL_MS = 5400
const TICK_OUT_MS = 380

/** Stonowane tło + lewy akcent w tonacji menu (#243647), bez ciężkiego kontrastu. */
const TICKER_SHELL =
  'rounded-xl border border-[#1a2b38]/10 bg-white/90 shadow-[0_6px_22px_rgba(26,43,56,0.06)] border-l-[3px] border-l-[#243647]/45'

interface WebAppWelcomeBarProps {
  activeSectionId: MenuId | null
  onNavigateTo: (id: MenuId) => void
}

function NavChip({ id, onNavigateTo, children }: { id: MenuId; onNavigateTo: (id: MenuId) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => onNavigateTo(id)}
      className="mt-1 inline-flex max-w-full items-center gap-1 rounded-lg border border-[#1a2b38]/14 bg-white px-3 py-2 text-left text-base font-bold leading-tight text-[#2d4154] underline decoration-2 decoration-[#1a2b38]/25 underline-offset-[3px] shadow-sm transition hover:border-[#243647]/35 hover:bg-[#f4f7fb] hover:text-[#1a2b38]"
    >
      {children}
    </button>
  )
}

function spotlightForSection(activeSectionId: MenuId | null): { label: string; status: MenuStatus } {
  const id = activeSectionId && activeSectionId !== 'news' ? activeSectionId : 'formalities'
  if (id === 'siteLog') {
    return { label: 'Dziennik budowy', status: 'current' }
  }
  const item = MENU_ITEMS.find((m) => m.id === id)
  if (item) return { label: item.label, status: item.status }
  return { label: 'Formalności początkowe', status: 'done' }
}

function statusBadgeClasses(status: MenuStatus): string {
  if (status === 'done') return 'bg-emerald-50 text-emerald-800 ring-emerald-200/60'
  if (status === 'current') return 'bg-amber-50 text-amber-900 ring-amber-200/70'
  return 'bg-[#e8eef5] text-[#4a6074] ring-[#1a2b38]/12'
}

function statusLabel(status: MenuStatus): string {
  if (status === 'done') return 'Zakończone'
  if (status === 'current') return 'Aktualnie'
  return 'Oczekuje'
}

function TickerMessages({
  msgIndex,
  leaving,
  onNavigateTo,
}: {
  msgIndex: number
  leaving: boolean
  onNavigateTo: (id: MenuId) => void
}) {
  const accent = 'text-[var(--color-domesta-coral)]'
  const body = 'text-lg leading-snug text-[#4a6074] md:text-xl md:leading-snug'
  const hero =
    'text-4xl font-bold leading-[1.05] tracking-tight text-[#2d4154] md:text-5xl lg:text-[3.25rem]'
  const heroSm = 'text-3xl font-bold leading-tight text-[#2d4154] md:text-4xl'

  const messages: ReactNode[] = [
    <div className="flex flex-col gap-2 md:gap-3">
      <p className={`m-0 ${body}`}>Do odbioru mieszkania zostało już tylko</p>
      <p className={`m-0 ${hero} tabular-nums`}>
        <span>{DAYS_TO_HANDOVER}</span>{' '}
        <span className={accent}>dni</span>
        <span className="text-[#2d4154]">!</span>
      </p>
      <p className={`m-0 text-base text-[#4a6074] md:text-lg`}>Im bliżej mety, tym więcej formalności domykamy razem.</p>
      <NavChip id="handover" onNavigateTo={onNavigateTo}>
        Przejdź do odbioru →
      </NavChip>
    </div>,
    <div className="flex flex-col gap-2 md:gap-3">
      <p className={`m-0 ${body}`}>Twoje następne spotkanie to</p>
      <p className={`m-0 ${heroSm} md:text-5xl`}>
        <span className="text-[#2d4154]">odbiór </span>
        <span className={accent}>mieszkania</span>
        <span className="text-[#2d4154]">!</span>
      </p>
      <p className={`m-0 ${body}`}>
        Termin: <span className="font-semibold text-[#2d4154]">{NEXT_MEETING_LABEL}</span> — zarezerwuj czas w kalendarzu.
      </p>
      <NavChip id="handover" onNavigateTo={onNavigateTo}>
        Szczegóły odbioru
      </NavChip>
    </div>,
    <div className="flex flex-col gap-2 md:gap-3">
      <p className={`m-0 ${body}`}>
        Zgłosiłeś <span className="font-semibold text-[#2d4154]">{COMPLAINTS_SUBMITTED}</span> reklamacje —{' '}
        <span className="font-semibold text-[#2d4154]">{COMPLAINTS_ACCEPTED}</span> zostały przyjęte.
      </p>
      <p className={`m-0 ${heroSm} md:text-5xl`}>
        <span className={accent}>Wszystkie</span>
        <span className="text-[#2d4154]"> OK!</span>
      </p>
      <p className={`m-0 text-base text-[#4a6074] md:text-lg`}>Szczegóły zobaczysz w panelu reklamacji.</p>
      <NavChip id="complaints" onNavigateTo={onNavigateTo}>
        Otwórz reklamacje
      </NavChip>
    </div>,
    <div className="flex flex-col gap-2 md:gap-3">
      <p className={`m-0 ${body}`}>Pojawiły się wpisy w</p>
      <p className={`m-0 ${heroSm} md:text-[2.75rem]`}>
        <span className="text-[#2d4154]">Dzienniku </span>
        <span className={accent}>budowy</span>
        <span className="text-[#2d4154]">!</span>
      </p>
      <p className={`m-0 text-base text-[#4a6074] md:text-lg`}>Zdjęcia z placu i krótkie notatki z tygodnia.</p>
      <NavChip id="siteLog" onNavigateTo={onNavigateTo}>
        Zobacz wpisy
      </NavChip>
    </div>,
    <div className="flex flex-col gap-2 md:gap-3">
      <p className={`m-0 ${body}`}>Termin kolejnej raty</p>
      <p className={`m-0 ${hero} break-words`}>
        <span className={accent}>{NEXT_INSTALLMENT_DATE}</span>
        <span className="text-[#2d4154]">!</span>
      </p>
      <p className={`m-0 text-base text-[#4a6074] md:text-lg`}>W harmonogramie spłat sprawdzisz historię i kolejne kwoty.</p>
      <NavChip id="schedule" onNavigateTo={onNavigateTo}>
        Harmonogram spłat
      </NavChip>
    </div>,
  ]

  return (
    <div
      key={`${msgIndex}-${leaving}`}
      className={`m-0 w-full max-w-none px-4 py-5 md:px-5 md:py-6 ${TICKER_SHELL} ${
        leaving ? 'webapp-welcome-tick-out' : 'webapp-welcome-tick-in'
      }`}
      aria-live="polite"
    >
      {messages[msgIndex]}
    </div>
  )
}

export function WebAppWelcomeBar({ activeSectionId, onNavigateTo }: WebAppWelcomeBarProps) {
  const spot = spotlightForSection(activeSectionId)
  const [msgIndex, setMsgIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let leaveTimer: ReturnType<typeof setTimeout> | undefined
    const id = window.setInterval(() => {
      setLeaving(true)
      leaveTimer = window.setTimeout(() => {
        setMsgIndex((i) => (i + 1) % 5)
        setLeaving(false)
      }, TICK_OUT_MS)
    }, TICK_INTERVAL_MS)
    return () => {
      window.clearInterval(id)
      if (leaveTimer !== undefined) window.clearTimeout(leaveTimer)
    }
  }, [])

  return (
    <section
      className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-[#1a2b38]/10 bg-white/95 shadow-[0_10px_32px_rgba(26,43,56,0.07)]"
      aria-label="Skrót i kontakt"
    >
      <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#1a2b38]/[0.04]" aria-hidden />
      <div className="absolute -bottom-6 right-1/4 h-20 w-20 rounded-full bg-[#243647]/[0.07]" aria-hidden />

      <div className="relative z-[1] flex flex-col gap-5 p-4 md:flex-row md:items-stretch md:justify-between md:gap-6 md:p-5 lg:gap-8">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-[12rem] w-full flex-1 items-stretch md:min-h-[14rem]">
            <TickerMessages msgIndex={msgIndex} leaving={leaving} onNavigateTo={onNavigateTo} />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 md:mt-0 md:w-[min(100%,17.5rem)] lg:w-[18.5rem]">
          <div className="rounded-xl border border-[#1a2b38]/10 bg-[#f4f7fb] px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a2b38]/45">Teraz w harmonogramie</p>
            <p className="mt-1.5 text-[0.8125rem] font-semibold leading-snug text-[#2d4154]">{spot.label}</p>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${statusBadgeClasses(spot.status)}`}
            >
              {statusLabel(spot.status)}
            </span>
          </div>

          <div className="rounded-xl border border-[#1a2b38]/10 bg-[#f4f7fb] px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a2b38]/45">Kontakt do opiekunki</p>
            <div className="mt-2 flex flex-col gap-2.5 text-[0.75rem] text-[#4a6074]">
              <a
                href={CARETAKER.phoneHref}
                className="group inline-flex items-center gap-2.5 rounded-lg border border-[#1a2b38]/12 bg-white px-2 py-1.5 font-semibold text-[#2d4154] shadow-sm ring-1 ring-[#1a2b38]/6 transition hover:border-[#243647]/28 hover:bg-[#f8fafc] hover:text-[#1a2b38] hover:shadow-md"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1a2b38] to-[#2d4a63] text-white shadow-inner"
                  aria-hidden
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 truncate">{CARETAKER.phone}</span>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[var(--color-domesta-coral)] opacity-0 transition group-hover:opacity-100">
                  Zadzwoń
                </span>
              </a>
              <a
                href={`mailto:${CARETAKER.email}`}
                className="group inline-flex items-center gap-2.5 rounded-lg border border-[#1a2b38]/12 bg-white px-2 py-1.5 font-semibold text-[#2d4154] shadow-sm ring-1 ring-[#1a2b38]/6 transition hover:border-[#243647]/28 hover:bg-[#f8fafc] hover:text-[#1a2b38] hover:shadow-md"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2a3f52] to-[#1a2b38] text-white shadow-inner"
                  aria-hidden
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 truncate">{CARETAKER.email}</span>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-[var(--color-domesta-coral)] opacity-0 transition group-hover:opacity-100">
                  Napisz
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
