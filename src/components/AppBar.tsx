import { useState } from 'react'
import type { MenuId } from '../data/menuItems'
import type { AppTheme } from '../App'
import {
  BATORY_MENU_THEMES,
  BATORY_THEME_CONFIG,
  getBatoryThemeConfig,
  isBatoryTheme,
  usesBatoryLogo,
} from '../data/batoryThemes'
import domestaLogo from '../assets/domesta-logo.png.svg'
import batoryLogo from '../assets/batory-logo.png'

function BatoryLogoOnDarkBar({
  primary = '#ffffff',
  secondary = '#e0e0e0',
}: {
  primary?: string
  secondary?: string
}) {
  return (
    <span className="inline-flex h-[2.667rem] flex-col items-center justify-center leading-none">
      <span className="text-[1.2rem] font-bold tracking-[0.07em]" style={{ color: primary }}>
        BATORY
      </span>
      <span className="mt-0.5 text-[0.5rem] tracking-[0.2em]" style={{ color: secondary }}>
        PROJEKT
      </span>
    </span>
  )
}

const BACKOFFICE_TOP_STATS = [
  { label: 'Liczba mieszkań', value: '2,500', trend: '+4% w tym tygodniu' },
  { label: 'Oddane mieszkania', value: '1,824', trend: '+12% rok do roku' },
  { label: 'Mieszkania w budowie', value: '676', trend: '-3% vs poprzedni miesiąc' },
  { label: 'Aktywne inwestycje', value: '12', trend: 'w 4 miastach' },
  { label: 'Lokale sprzedane', value: '2,110', trend: '+7% kwartał do kwartału' },
  { label: 'Średni etap realizacji', value: '68%', trend: 'dla wszystkich inwestycji' },
] as const

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
  showLogo?: boolean
  backOfficeMenuCollapsed?: boolean
  onToggleBackOfficeMenu?: () => void
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
  showLogo = true,
  backOfficeMenuCollapsed = false,
  onToggleBackOfficeMenu,
}: AppBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const batoryCfg = getBatoryThemeConfig(theme)
  const isBatoryThemeActive = isBatoryTheme(theme)
  const showBatoryLogo = usesBatoryLogo(theme)

  return (
    <div
      className={
        variant === 'backoffice'
          ? `fixed right-0 top-0 z-30 ${backOfficeMenuCollapsed ? 'left-16' : 'left-[260px]'}`
          : 'sticky top-0 z-30'
      }
    >
      <header
        className={`flex min-h-[4.667rem] items-center border-b px-4 shadow-sm ${
          variant === 'backoffice'
            ? 'border-slate-300 bg-[#e6e6e6] text-slate-700 shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
            : theme === 'appleFont'
              ? 'border-[#d2d2d7] bg-white/80 text-[#1d1d1f] shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl'
              : theme === 'gold'
                ? 'border-[#c9974a]/30 bg-[#f7f4ee] text-[#2a2a2a] shadow-[0_1px_0_rgba(201,151,74,0.15)]'
                : batoryCfg
                  ? ''
                : theme === 'allBlack'
                  ? 'border-gray-700 bg-[#252525]'
                  : 'border-gray-200 bg-white'
        }`}
        style={
          theme === 'appleFont' && variant !== 'backoffice'
            ? {
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, sans-serif',
              }
            : batoryCfg
              ? {
                  backgroundColor: batoryCfg.headerBg,
                  borderColor: batoryCfg.headerBorder,
                  color: batoryCfg.headerText,
                  boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
                }
              : undefined
        }
      >
        {variant === 'backoffice' && (
          <>
            <button
              type="button"
              onClick={onToggleBackOfficeMenu}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-300/60 hover:text-slate-900"
              aria-label={backOfficeMenuCollapsed ? 'Rozwiń menu boczne' : 'Zwiń menu boczne'}
              title={backOfficeMenuCollapsed ? 'Rozwiń menu' : 'Zwiń menu'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <div className="ml-3 flex min-w-0 flex-1">
              {BACKOFFICE_TOP_STATS.map((stat) => (
                <div key={stat.label} className="min-w-0 flex-1 border-r border-slate-300 px-4 last:border-r-0">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-semibold leading-none text-[#2a3f54]">{stat.value}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{stat.trend}</p>
                </div>
              ))}
            </div>
          </>
        )}
        {showLogo ? (
          <button
            type="button"
            onClick={() => onGoHome?.()}
            className={`flex shrink-0 items-center justify-center rounded-lg p-0 focus-visible:outline-none focus-visible:ring-2 ${
              variant === 'backoffice' ? 'focus-visible:ring-[#1abb9c]' : isBatoryThemeActive ? 'focus-visible:ring-[var(--color-domesta-coral)]' : 'focus-visible:ring-[var(--color-domesta-coral)]'
            }`}
            aria-label="Strona główna"
          >
            {theme === 'batory6' ? (
              <BatoryLogoOnDarkBar primary={batoryCfg?.headerText} secondary={batoryCfg?.accentMuted} />
            ) : (
              <img
                src={showBatoryLogo ? batoryLogo : domestaLogo}
                alt={showBatoryLogo ? 'Batory Projekt' : 'Domesta'}
                className="h-[2.667rem] w-auto shrink-0 object-contain"
              />
            )}
          </button>
        ) : null}
        {residentHeading && variant === 'default' && (
          <>
              <div
                className={`ml-4 h-[2.667rem] w-px shrink-0 ${theme === 'allBlack' ? 'bg-gray-600' : theme === 'gold' ? 'bg-[#c9974a]/30' : theme === 'batoryProject' ? 'bg-[#cfd8e5]' : 'bg-gray-200'}`}
                aria-hidden
              />
              <div className="ml-4 min-w-0 flex-1 pr-2">
                <p className="truncate text-[0.9375rem] leading-snug md:text-base">
                  <span className={`font-semibold tracking-tight ${theme === 'allBlack' ? 'text-gray-100' : theme === 'gold' ? 'text-[#2a2a2a]' : theme === 'batoryProject' ? 'text-[#10284b]' : 'text-gray-900'}`}>
                    {residentHeading.primaryBold}
                  </span>
                  <span className={`mx-1.5 font-light ${theme === 'allBlack' ? 'text-gray-500' : theme === 'gold' ? 'text-[#c9974a]/60' : theme === 'batoryProject' ? 'text-[#7f8ba0]' : 'text-gray-400'}`}>—</span>
                  <span className={`font-normal ${theme === 'allBlack' ? 'text-slate-400' : theme === 'gold' ? 'text-[#6b7280]' : theme === 'batoryProject' ? 'text-[#6d7a91]' : 'text-slate-500'}`}>
                    {residentHeading.primaryMuted}
                  </span>
                </p>
                {residentHeading.metaLine ? (
                  <p
                    className={`mt-0.5 truncate text-[11px] leading-snug ${theme === 'allBlack' ? 'text-slate-500' : theme === 'gold' ? 'text-[#c9974a]/70' : theme === 'batoryProject' ? 'text-[#7f8ba0]' : 'text-slate-500'}`}
                  >
                    {residentHeading.metaLine}
                  </p>
                ) : null}
              </div>
          </>
        )}

      {/* Aktualności + menu użytkownika – prawa strona paska */}
      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2 md:gap-3">
        {variant === 'default' && !hideNewsShortcut && (
          <button
            type="button"
            onClick={() => onNavigateTo('news')}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              theme === 'allBlack'
                ? 'text-gray-400 hover:bg-[#333333] hover:text-gray-200'
                : theme === 'gold'
                  ? 'text-[#c9974a] hover:bg-[#c9974a]/10'
                  : batoryCfg
                    ? 'hover:opacity-90'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-600'
            }`}
            style={
              batoryCfg
                ? { color: batoryCfg.newsIcon, backgroundColor: 'transparent' }
                : undefined
            }
            onMouseEnter={(e) => {
              if (batoryCfg) e.currentTarget.style.backgroundColor = batoryCfg.newsHoverBg
            }}
            onMouseLeave={(e) => {
              if (batoryCfg) e.currentTarget.style.backgroundColor = 'transparent'
            }}
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
        <div className="relative">
          <button
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              variant === 'backoffice'
                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                : theme === 'allBlack'
                  ? 'text-gray-400 hover:bg-[#333333] hover:text-gray-200'
                  : batoryCfg
                    ? 'hover:opacity-90'
                    : theme === 'gold'
                      ? 'text-[#6b7280] hover:bg-[#c9974a]/10 hover:text-[#a97c35]'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            style={batoryCfg ? { color: batoryCfg.accentMuted } : undefined}
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
            <div
              className={`absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border py-2 text-sm shadow-lg ${
                variant === 'backoffice'
                  ? 'border-slate-200 bg-white text-slate-700 shadow-xl'
                  : theme === 'allBlack'
                    ? 'border-gray-600 bg-[#252525]'
                    : batoryCfg
                      ? ''
                      : theme === 'gold'
                        ? 'border-[#c9974a]/25 bg-[#faf8f3] shadow-[0_8px_32px_rgba(201,151,74,0.12)]'
                        : 'border-gray-200 bg-white'
              }`}
              style={
                batoryCfg
                  ? {
                      backgroundColor: batoryCfg.menuDropdownBg,
                      borderColor: batoryCfg.menuDropdownBorder,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    }
                  : undefined
              }
            >
              <button
                className={`flex w-full items-center px-3 py-2 text-left ${
                  variant === 'backoffice'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : theme === 'allBlack'
                      ? 'text-gray-200 hover:bg-[#333333]'
                      : theme === 'gold'
                        ? 'text-[#2a2a2a] hover:bg-[#c9974a]/10'
                        : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Moje konto
              </button>
              <button
                className={`flex w-full items-center px-3 py-2 text-left ${
                  variant === 'backoffice'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : theme === 'allBlack'
                      ? 'text-gray-200 hover:bg-[#333333]'
                      : theme === 'gold'
                        ? 'text-[#2a2a2a] hover:bg-[#c9974a]/10'
                        : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Ustawienia
              </button>
              <button
                className={`flex w-full items-center px-3 py-2 text-left ${
                  variant === 'backoffice'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : theme === 'allBlack'
                      ? 'text-gray-200 hover:bg-[#333333]'
                      : theme === 'gold'
                        ? 'text-[#2a2a2a] hover:bg-[#c9974a]/10'
                        : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pomoc
              </button>
              <div
                className={`my-1 border-t ${
                  variant === 'backoffice' ? 'border-slate-200' : theme === 'allBlack' ? 'border-gray-600' : theme === 'gold' ? 'border-[#c9974a]/20' : 'border-gray-100'
                }`}
              />
              <button
                type="button"
                onClick={() => { onThemeChange?.('halfBlack'); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${
                  variant === 'backoffice'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : theme === 'allBlack'
                      ? 'text-gray-200 hover:bg-[#333333]'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Kolor Half black
              </button>
              <button
                type="button"
                onClick={() => { onThemeChange?.('allBlack'); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${
                  variant === 'backoffice'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : theme === 'allBlack'
                      ? 'text-gray-200 hover:bg-[#333333]'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Kolor All Black
              </button>
              <button
                type="button"
                onClick={() => { onThemeChange?.('allWhite'); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${
                  variant === 'backoffice'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : theme === 'allBlack'
                      ? 'text-gray-200 hover:bg-[#333333]'
                      : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Kolor All White
              </button>
              <button
                type="button"
                onClick={() => { onThemeChange?.('gold'); setMenuOpen(false) }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left ${
                  variant === 'backoffice'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : theme === 'allBlack'
                      ? 'text-gray-200 hover:bg-[#333333]'
                      : theme === 'gold'
                        ? 'bg-[#c9974a]/10 text-[#a97c35] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Gold</span>
                <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ background: 'linear-gradient(135deg,#e0b96e,#a97c35)', color: '#fff' }}>Nowy</span>
              </button>
              {BATORY_MENU_THEMES.map((batoryId) => {
                const cfg = BATORY_THEME_CONFIG[batoryId]
                const isActive = theme === batoryId
                return (
                  <button
                    key={batoryId}
                    type="button"
                    onClick={() => { onThemeChange?.(batoryId); setMenuOpen(false) }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left ${
                      variant === 'backoffice'
                        ? 'text-slate-700 hover:bg-slate-100'
                        : theme === 'allBlack'
                          ? 'text-gray-200 hover:bg-[#333333]'
                          : isActive
                            ? 'font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={
                      isActive && batoryCfg
                        ? { backgroundColor: `${cfg.accent}18`, color: cfg.accent }
                        : isActive
                          ? { backgroundColor: `${cfg.accent}18`, color: cfg.accent }
                          : undefined
                    }
                  >
                    <span>{cfg.menuLabel}</span>
                    {batoryId === 'batoryProject' ? (
                      <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white" style={{ backgroundColor: cfg.menuBg }}>
                        Nowy
                      </span>
                    ) : batoryId === 'batory6' ? (
                      <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white" style={{ backgroundColor: cfg.accent }}>
                        Nowy
                      </span>
                    ) : null}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => { onOpenBackOffice?.(); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${
                  variant === 'backoffice'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : theme === 'allBlack'
                      ? 'text-gray-200 hover:bg-[#333333]'
                      : theme === 'gold'
                        ? 'text-[#2a2a2a] hover:bg-[#c9974a]/10'
                        : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                BackOffice
              </button>
              <button
                type="button"
                onClick={() => { onOpenWebApp?.(); setMenuOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-left ${
                  variant === 'backoffice'
                    ? 'text-slate-700 hover:bg-slate-100'
                    : theme === 'allBlack'
                      ? 'text-gray-200 hover:bg-[#333333]'
                      : theme === 'gold'
                        ? 'text-[#2a2a2a] hover:bg-[#c9974a]/10'
                        : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                WebApp
              </button>
              <div
                className={`my-1 border-t ${
                  variant === 'backoffice' ? 'border-slate-200' : theme === 'allBlack' ? 'border-gray-600' : theme === 'gold' ? 'border-[#c9974a]/20' : 'border-gray-100'
                }`}
              />
              <div className="flex items-center gap-2 px-3 py-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white ${
                    variant === 'backoffice' ? 'bg-[#1abb9c]' : 'bg-[var(--color-domesta-gray)]'
                  }`}
                >
                  K
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-medium ${
                      variant === 'backoffice' ? 'text-slate-800' : theme === 'allBlack' ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    Katarzyna Kowalska
                  </span>
                  <span
                    className={`text-[11px] ${
                      variant === 'backoffice' ? 'text-slate-500' : theme === 'allBlack' ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    mieszkaniec
                  </span>
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
