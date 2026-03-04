import { useState } from 'react'
import type { MenuId } from '../data/menuItems'
import domestaLogo from '../assets/domesta-logo.png.svg'

interface AppBarProps {
  onNavigateTo: (id: MenuId) => void
}

export function AppBar({ onNavigateTo }: AppBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tasksOpen, setTasksOpen] = useState(false)

  return (
    <div className="sticky top-0 z-30">
      <header className="flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* 1. Logo */}
      <div className="flex shrink-0 items-center">
        <img src={domestaLogo} alt="Domesta" className="h-8 w-auto object-contain" />
      </div>

      {/* 2. Aktualności */}
      <button
        type="button"
        onClick={() => onNavigateTo('news')}
        className="ml-4 flex shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm hover:bg-gray-100"
      >
        <span>Aktualności</span>
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] text-[10px] font-semibold text-white">
          !
        </span>
      </button>
      </header>
      {/* Delikatnie szary poziomy pasek pod górnym barem */}
      <div className="h-2 w-full bg-gray-100 border-b border-gray-200" />
      {/* Drugi poziomy pasek – przycisk + ikony z górnego paska */}
      <nav className="flex h-12 w-full items-center justify-start gap-2 border-b border-gray-200 bg-gray-50 px-4">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-600 shadow-sm hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* lewy wieżowiec */}
            <rect x="3" y="6" width="7" height="14" rx="1" />
            <path d="M6.5 3.5v2.5" />
            <path d="M5 9h1.5M7.5 9H9" />
            <path d="M5 12h1.5M7.5 12H9" />
            <path d="M5 15h1.5M7.5 15H9" />
            {/* prawy wieżowiec */}
            <rect x="12" y="4" width="9" height="16" rx="1" />
            <path d="M16.5 2.5v2" />
            <path d="M14 8h2M18 8h2" />
            <path d="M14 11h2M18 11h2" />
            <path d="M14 14h2M18 14h2" />
          </svg>
          <span>Twoje inwestycje</span>
        </button>
        <div className="relative">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Aktualności"
            onClick={() => onNavigateTo('news')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 4h9a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z" />
              <path d="M22 4h-9a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h9z" />
            </svg>
            <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] px-1 text-[10px] font-semibold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">
              2
            </span>
          </button>
        </div>
        <div className="relative">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Bieżące zadania"
            onClick={() => setTasksOpen((open) => !open)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 3.5-1.5 5-2 5h16c-.5 0-2-1.5-2-5" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] px-1 text-[10px] font-semibold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">
              3
            </span>
          </button>
          {tasksOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">
                  Bieżące zadania
                </span>
              </div>
              <div className="space-y-2">
                <button
                  className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-left text-gray-700 hover:border-[var(--color-domesta-coral)]/40 hover:bg-white"
                  onClick={() => {
                    onNavigateTo('schedule')
                    setTasksOpen(false)
                  }}
                >
                  <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] text-[10px] font-bold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">
                    !
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">
                      Zbliżająca się 6 rata
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Sprawdź harmonogram spłaty i termin płatności kolejnej raty.
                    </span>
                  </div>
                </button>
                <button
                  className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-left text-gray-700 hover:border-[var(--color-domesta-coral)]/40 hover:bg-white"
                  onClick={() => {
                    onNavigateTo('meter')
                    setTasksOpen(false)
                  }}
                >
                  <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] text-[10px] font-bold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">
                    !
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">
                      Uzupełnij liczniki
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Podaj aktualny stan liczników za bieżący okres rozliczeniowy.
                    </span>
                  </div>
                </button>
                <button
                  className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-left text-gray-700 hover:border-[var(--color-domesta-coral)]/40 hover:bg-white"
                  onClick={() => {
                    onNavigateTo('handover')
                    setTasksOpen(false)
                  }}
                >
                  <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] text-[10px] font-bold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">
                    !
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">
                      Umów się na odbiór
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Wybierz dogodny termin odbioru mieszkania w kalendarzu.
                    </span>
                  </div>
                </button>
                <button
                  className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-left text-gray-700 hover:border-[var(--color-domesta-coral)]/40 hover:bg-white"
                  onClick={() => {
                    onNavigateTo('complaints')
                    setTasksOpen(false)
                  }}
                >
                  <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] text-[10px] font-bold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">
                    !
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">
                      Zgłoś reklamację
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Dodaj usterki do listy reklamacyjnej wraz z opisem i zdjęciem.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Szukaj"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Czat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
        <div className="relative">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Menu użytkownika"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white py-2 text-sm shadow-lg">
              <button className="flex w-full items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-50">
                Moje konto
              </button>
              <button className="flex w-full items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-50">
                Ustawienia
              </button>
              <button className="flex w-full items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-50">
                Pomoc
              </button>
              <div className="my-1 border-t border-gray-100" />
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-domesta-gray)] text-xs font-medium text-white">
                  K
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-800">Katarzyna Kowalska</span>
                  <span className="text-[11px] text-gray-400">mieszkaniec</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
