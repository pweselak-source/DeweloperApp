import { useState, useEffect, useRef } from 'react'
import type { MenuId } from '../data/menuItems'
import type { AppTheme } from '../App'
import domestaLogo from '../assets/domesta-logo.png.svg'

interface AppBarProps {
  onNavigateTo: (id: MenuId) => void
  onThemeChange?: (theme: AppTheme) => void
  theme?: AppTheme
  onGoHome?: () => void
  onOpenBackOffice?: () => void
  onOpenWebApp?: () => void
  /** W Back Office: bez Aktualności i bez panelu Bieżące zadania – tylko logo + menu użytkownika */
  variant?: 'default' | 'backoffice'
  /** Ukryj skrót do Aktualności (np. WebApp – wejście z lewego menu) */
  hideNewsShortcut?: boolean
  /** Inwestycja + mieszkanie + meta (widok mieszkańca / WebApp, nie Back Office) */
  residentHeading?: {
    primaryBold: string
    primaryMuted: string
    metaLine: string
  }
}

export function AppBar({
  onNavigateTo,
  onThemeChange,
  theme = 'halfBlack',
  onGoHome,
  onOpenBackOffice,
  onOpenWebApp,
  variant = 'default',
  hideNewsShortcut = false,
  residentHeading,
}: AppBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tasksOpen, setTasksOpen] = useState(false)
  const tasksRef = useRef<HTMLDivElement | null>(null)

  // Zamykaj panel "Bieżące zadania" po kliknięciu poza nim
  useEffect(() => {
    if (!tasksOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (!tasksRef.current) return
      const target = event.target as Node | null
      if (target && !tasksRef.current.contains(target)) {
        setTasksOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [tasksOpen])

  return (
    <div className="sticky top-0 z-30">
      <header
        className={`flex min-h-[4.667rem] items-center border-b px-4 shadow-sm ${theme === 'allBlack' ? 'border-gray-700 bg-[#252525]' : 'border-gray-200 bg-white'}`}
      >
        <button
          type="button"
          onClick={() => onGoHome?.()}
          className="flex shrink-0 items-center justify-center rounded-lg p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-domesta-coral)]"
          aria-label="Strona główna"
        >
          <img src={domestaLogo} alt="Domesta" className="h-[2.667rem] w-auto shrink-0 object-contain" />
        </button>
        {residentHeading && variant === 'default' && (
          <>
            <div
              className={`ml-4 h-[2.667rem] w-px shrink-0 ${theme === 'allBlack' ? 'bg-gray-600' : 'bg-gray-200'}`}
              aria-hidden
            />
            <div className="ml-4 min-w-0 flex-1 pr-2">
              <p className="truncate text-[0.9375rem] leading-snug md:text-base">
                <span className={`font-semibold tracking-tight ${theme === 'allBlack' ? 'text-gray-100' : 'text-gray-900'}`}>
                  {residentHeading.primaryBold}
                </span>
                <span className={`mx-1.5 font-light ${theme === 'allBlack' ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                <span className={`font-normal ${theme === 'allBlack' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {residentHeading.primaryMuted}
                </span>
              </p>
              {residentHeading.metaLine ? (
                <p
                  className={`mt-0.5 truncate text-[11px] leading-snug ${theme === 'allBlack' ? 'text-slate-500' : 'text-slate-500'}`}
                >
                  {residentHeading.metaLine}
                </p>
              ) : null}
            </div>
          </>
        )}
        {variant === 'default' && (
          <div
            className={`flex shrink-0 items-center gap-2 ${residentHeading ? 'ml-1' : ''} ${!residentHeading && hideNewsShortcut ? 'ml-7' : ''}`}
          >
            {!hideNewsShortcut && (
              <button
                type="button"
                onClick={() => onNavigateTo('news')}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${!residentHeading ? 'ml-7' : ''} ${theme === 'allBlack' ? 'text-gray-400 hover:bg-[#333333] hover:text-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-600'}`}
                aria-label="Aktualności"
                title="Aktualności"
              >
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v6M12 16h.01" />
                  </svg>
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] px-1 text-[10px] font-semibold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">2</span>
                </span>
              </button>
            )}
            {/* Bieżące zadania – ukryte (ikona + dropdown) */}
            <div className={`relative hidden ${hideNewsShortcut ? 'ml-0' : 'ml-0'}`} ref={tasksRef}>
              <button
                type="button"
                onClick={() => setTasksOpen((open) => !open)}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${theme === 'allBlack' ? 'text-gray-400 hover:bg-[#333333] hover:text-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-600'}`}
                aria-label="Bieżące zadania"
                title="Bieżące zadania"
              >
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] px-1 text-[10px] font-semibold text-white">3</span>
                </span>
              </button>
              {tasksOpen && (
                <div className={`absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border p-3 text-xs shadow-xl ${theme === 'allBlack' ? 'border-gray-600 bg-[#252525]' : 'border-gray-200 bg-white'}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-[11px] font-medium ${theme === 'allBlack' ? 'text-gray-300' : 'text-[var(--color-domesta-gray)]'}`}>Bieżące zadania</span>
                  </div>
                  <div className="space-y-2">
                    <button
                      className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-left text-gray-700 hover:border-[var(--color-domesta-coral)]/40 hover:bg-white"
                      onClick={() => { onNavigateTo('schedule'); setTasksOpen(false) }}
                    >
                      <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] text-[10px] font-bold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">!</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">Zbliżająca się 6 rata</span>
                        <span className="text-[10px] text-gray-500">Sprawdź harmonogram spłaty i termin płatności kolejnej raty.</span>
                      </div>
                    </button>
                    <button
                      className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-left text-gray-700 hover:border-[var(--color-domesta-coral)]/40 hover:bg-white"
                      onClick={() => { onNavigateTo('meter'); setTasksOpen(false) }}
                    >
                      <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] text-[10px] font-bold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">!</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">Uzupełnij liczniki</span>
                        <span className="text-[10px] text-gray-500">Podaj aktualny stan liczników za bieżący okres rozliczeniowy.</span>
                      </div>
                    </button>
                    <button
                      className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-left text-gray-700 hover:border-[var(--color-domesta-coral)]/40 hover:bg-white"
                      onClick={() => { onNavigateTo('handover'); setTasksOpen(false) }}
                    >
                      <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] text-[10px] font-bold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">!</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">Umów się na odbiór</span>
                        <span className="text-[10px] text-gray-500">Wybierz dogodny termin odbioru mieszkania w kalendarzu.</span>
                      </div>
                    </button>
                    <button
                      className="flex w-full items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2 text-left text-gray-700 hover:border-[var(--color-domesta-coral)]/40 hover:bg-white"
                      onClick={() => { onNavigateTo('complaints'); setTasksOpen(false) }}
                    >
                      <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-domesta-coral)] text-[10px] font-bold text-white animate-[coral-pulse_1.2s_ease-in-out_infinite]">!</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-[var(--color-domesta-gray)]">Zgłoś reklamację</span>
                        <span className="text-[10px] text-gray-500">Dodaj usterki do listy reklamacyjnej wraz z opisem i zdjęciem.</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Menu użytkownika – prawa strona paska */}
      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2 md:gap-3">
        <div className="relative">
          <button
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-full ${theme === 'allBlack' ? 'text-gray-400 hover:bg-[#333333] hover:text-gray-200' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
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
            <div className={`absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border py-2 text-sm shadow-lg ${theme === 'allBlack' ? 'border-gray-600 bg-[#252525]' : 'border-gray-200 bg-white'}`}>
              <button className={`flex w-full items-center px-3 py-2 text-left ${theme === 'allBlack' ? 'text-gray-200 hover:bg-[#333333]' : 'text-gray-700 hover:bg-gray-50'}`}>
                Moje konto
              </button>
              <button className={`flex w-full items-center px-3 py-2 text-left ${theme === 'allBlack' ? 'text-gray-200 hover:bg-[#333333]' : 'text-gray-700 hover:bg-gray-50'}`}>
                Ustawienia
              </button>
              <button className={`flex w-full items-center px-3 py-2 text-left ${theme === 'allBlack' ? 'text-gray-200 hover:bg-[#333333]' : 'text-gray-700 hover:bg-gray-50'}`}>
                Pomoc
              </button>
              <div className={`my-1 border-t ${theme === 'allBlack' ? 'border-gray-600' : 'border-gray-100'}`} />
              <button
                type="button"
                onClick={() => { onThemeChange?.('halfBlack'); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${theme === 'allBlack' ? 'text-gray-200 hover:bg-[#333333]' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Kolor Half black
              </button>
              <button
                type="button"
                onClick={() => { onThemeChange?.('allBlack'); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${theme === 'allBlack' ? 'text-gray-200 hover:bg-[#333333]' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Kolor All Black
              </button>
              <button
                type="button"
                onClick={() => { onThemeChange?.('domestaColors'); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${theme === 'allBlack' ? 'text-gray-200 hover:bg-[#333333]' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Kolor DomestaColors
              </button>
              <button
                type="button"
                onClick={() => { onThemeChange?.('allWhite'); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${theme === 'allBlack' ? 'text-gray-200 hover:bg-[#333333]' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Kolor All White
              </button>
              <button
                type="button"
                onClick={() => { onOpenBackOffice?.(); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${theme === 'allBlack' ? 'text-gray-200 hover:bg-[#333333]' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                BackOffice
              </button>
              <button
                type="button"
                onClick={() => { onOpenWebApp?.(); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${theme === 'allBlack' ? 'text-gray-200 hover:bg-[#333333]' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                WebApp
              </button>
              <div className={`my-1 border-t ${theme === 'allBlack' ? 'border-gray-600' : 'border-gray-100'}`} />
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-domesta-gray)] text-xs font-medium text-white">
                  K
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-medium ${theme === 'allBlack' ? 'text-gray-200' : 'text-gray-800'}`}>Katarzyna Kowalska</span>
                  <span className={`text-[11px] ${theme === 'allBlack' ? 'text-gray-500' : 'text-gray-400'}`}>mieszkaniec</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </header>
    </div>
  )
}
