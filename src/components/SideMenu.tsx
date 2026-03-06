import { MENU_ITEMS } from '../data/menuItems'
import type { MenuId } from '../data/menuItems'
import type { AppTheme } from '../App'
import dom1 from '../assets/dom1.jpg'
import dom2 from '../assets/dom2.jpg'
import dom3 from '../assets/dom3.jpg'

interface SideMenuProps {
  collapsed: boolean
  activeId: MenuId | null
  onSelect: (id: MenuId) => void
  onToggleCollapse: () => void
  investmentName: string
  theme?: AppTheme
}

export function SideMenu({ collapsed, activeId, onSelect, onToggleCollapse, investmentName, theme = 'halfBlack' }: SideMenuProps) {
  const slideshowImages = [dom1, dom2, dom3]
  const parts = investmentName.split(/\s+/)
  const firstWord = parts[0] ?? ''
  const restWords = parts.slice(1).join(' ')
  return (
    <>
      <aside className={`relative w-full overflow-hidden rounded-2xl shadow-md ${
          theme === 'domestaColors' ? 'bg-white theme-domesta-colors-menu' :
          theme === 'allWhite' ? 'bg-[#F0F0F0] theme-all-white-menu' :
          'bg-[var(--color-domesta-gray)] text-white'
        }`}>
        {/* Header: nazwa inwestycji + collapse/expand control – wysokość jak górny pasek (h-14) */}
        <div className={`flex h-14 items-center border-b px-3 ${
          theme === 'allBlack' ? 'border-gray-600 bg-[#252525]' :
          theme === 'allWhite' ? 'border-gray-300 bg-[#F0F0F0]' :
          'border-gray-200 bg-white'
        }`}>
          {collapsed ? (
            <div className="flex w-full items-center gap-3">
              <div className="flex min-w-0 flex-col">
                <span className={`text-[0.8125rem] tracking-wide ${theme === 'allBlack' ? 'text-white' : ''} ${theme === 'allWhite' ? 'text-gray-800' : ''}`}>
                  <span className={
                    theme === 'allBlack' ? 'font-bold text-white' :
                    theme === 'allWhite' ? 'font-semibold text-[var(--color-domesta-red)]' :
                    'text-[var(--color-domesta-red)]'
                  }>{firstWord}</span>
                  {restWords ? <>{' '}<span className={theme === 'allBlack' ? 'text-white' : theme === 'allWhite' ? 'text-gray-700' : 'text-[var(--color-domesta-gray)]'}>{restWords}</span></> : null}
                </span>
                <span className={`min-w-0 truncate text-[0.583rem] ${theme === 'allBlack' ? 'text-white' : 'text-gray-600'}`}>Mieszkanie: Uranowa 21A/3</span>
              </div>
              <button
                type="button"
                onClick={onToggleCollapse}
                className={`ml-auto mr-3 flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] shadow-sm ${
                  theme === 'allBlack' ? 'border-gray-500 bg-[#333333] text-gray-200 hover:bg-[#404040]' :
                  theme === 'allWhite' ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100' :
                  'border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-100'
                }`}
                aria-label="Szczegóły podróży"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 ${theme === 'allBlack' ? 'text-gray-400' : theme === 'allWhite' ? 'text-gray-600' : 'text-gray-500'}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Szczegóły podróży!</span>
              </button>
            </div>
          ) : (
            <div className="flex w-full items-center gap-3">
              <div className="flex min-w-0 flex-col">
                <span className={`text-[0.8125rem] tracking-wide ${theme === 'allBlack' ? 'text-white' : ''} ${theme === 'allWhite' ? 'text-gray-800' : ''}`}>
                  <span className={
                    theme === 'allBlack' ? 'font-bold text-white' :
                    theme === 'allWhite' ? 'font-semibold text-[var(--color-domesta-red)]' :
                    'text-[var(--color-domesta-red)]'
                  }>{firstWord}</span>
                  {restWords ? <>{' '}<span className={theme === 'allBlack' ? 'text-white' : theme === 'allWhite' ? 'text-gray-700' : 'text-[var(--color-domesta-gray)]'}>{restWords}</span></> : null}
                </span>
                <span className={`min-w-0 truncate text-[0.583rem] ${theme === 'allBlack' ? 'text-white' : 'text-gray-600'}`}>Mieszkanie: Uranowa 21A/3</span>
              </div>
              <button
                type="button"
                onClick={onToggleCollapse}
                className={`ml-auto flex h-8 w-8 items-center justify-center rounded-lg ${
                  theme === 'allBlack' ? 'text-gray-300 hover:bg-[#404040]' :
                  theme === 'allWhite' ? 'text-gray-600 hover:bg-gray-200' :
                  'text-[var(--color-domesta-gray)] hover:bg-gray-200'
                }`}
                aria-label="Zwiń menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden">
          {/* Zwinięty: animowane pojawianie/znikanie */}
          <div
            className={`flex flex-col overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${
              collapsed ? 'h-[50vh] min-h-[50vh] max-h-[50vh] opacity-100 translate-y-0' : 'max-h-0 min-h-0 opacity-0 translate-y-[-6px] pointer-events-none'
            }`}
          >
          <div className="flex min-h-0 flex-1 items-stretch gap-1 py-0 animate-[menu-content-in_0.3s_ease-out_0.08s_both]">
            {/* Pionowa, grubsza strzałka po lewej stronie ikon (jeden spójny kształt) */}
            <div className="relative flex w-4 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -10 12 268"
                className="h-full w-3 -mt-1 origin-top text-gray-400 animate-[vertical-arrow-build_3.6s_ease-in-out_infinite]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* pionowy trzon – przerywany, przedłużony o 1 kreskę u góry */}
                <path d="M6 -4v236" strokeDasharray="8 5" />
                {/* grot przy samym dole trzonu */}
                <path d="M3 215 6 232l3-17" />
              </svg>
            </div>
            <nav className="flex h-full shrink-0 flex-col pl-0 pr-2" aria-label="Menu główne">
              <ul className="flex flex-1 flex-col items-start justify-between gap-px py-6">
                {MENU_ITEMS.filter((item) => item.id !== 'siteLog' && item.id !== 'news').map((item) => {
                  const isActive = activeId === item.id
                  const statusIconClass =
                    item.status === 'done'
                      ? 'text-emerald-300'
                      : item.status === 'current'
                        ? 'text-amber-300'
                        : 'text-gray-400'
                  const statusIcon =
                    item.status === 'done' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-[0.9rem] w-[0.9rem] text-emerald-300">
                        <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : item.status === 'current' ? (
                      <span className="inline-flex items-center justify-center rounded-full animate-[coral-pulse_1.2s_ease-in-out_infinite]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-[0.9rem] w-[0.9rem] text-amber-300">
                          <polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-[0.9rem] w-[0.9rem] text-gray-400 animate-pulse">
                        <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={`group relative flex items-center justify-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}
                        title={item.label}
                      >
                        <span className={`shrink-0 [&_svg]:h-[1.125rem] [&_svg]:w-[1.125rem] ${statusIconClass}`}>{item.icon}</span>
                        <span className="shrink-0">{statusIcon}</span>
                      </button>
                    </li>
                  )
                })}
                <li className="mt-2 pt-2 border-t border-white/20">
                  <button
                    type="button"
                    onClick={() => onSelect('siteLog')}
                    className={`flex items-center justify-start rounded-lg px-2 py-1.5 ${activeId === 'siteLog' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    title="Dziennik budowy"
                  >
                    <span className={`[&_svg]:h-[1.125rem] [&_svg]:w-[1.125rem] ${theme === 'allWhite' ? 'theme-all-white-site-log-icon' : 'text-amber-300'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 5H9a2 2 0 0 0-2 2v11" /><path d="M13 9H7" /><path d="M15 13H7" /><path d="M17 17H7" /><path d="M5 5v14a2 2 0 0 0 2 2h11" /><path d="M19 21h-2a2 2 0 0 1-2-2V3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
                      </svg>
                    </span>
                  </button>
                </li>
              </ul>
            </nav>
            <section className="relative ml-2 mr-0 flex min-h-0 flex-1 flex-col justify-end overflow-hidden rounded-xl rounded-r-none rounded-b-none border border-white/40 border-r-0 border-b-0 px-4 pt-3 pb-4 text-left self-stretch">
              {/* Tło: przyciemnione zdjęcia z Dziennika budowy – wypełnia całą ramkę */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0">
                  {slideshowImages.map((src, idx) => (
                    <img
                      key={src}
                      src={src}
                      alt="Dziennik budowy"
                      className={`absolute h-full w-full object-cover ${
                        idx === 0
                          ? 'animate-[slideshow1_24s_ease-in-out_infinite]'
                          : idx === 1
                            ? 'animate-[slideshow2_24s_ease-in-out_infinite]'
                            : 'animate-[slideshow3_24s_ease-in-out_infinite]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Kontener tekstu – Glassmorphism (rozmyte tło, ciemny tekst dla czytelności) */}
              <div className="relative theme-domesta-colors-intro-text">
                <div className="menu-intro-glass rounded-2xl border border-white/30 bg-white/20 p-4 backdrop-blur-[12px]">
                  <p className="text-[0.9625rem] font-semibold leading-snug text-[#1e293b]">
                    Deweloper Domesta – Twój partner w podróży
                  </p>
                  <p className="mt-3 text-[0.825rem] leading-relaxed text-slate-800">
                    Aplikacja poprowadzi Cię krok po kroku – od podpisania umowy deweloperskiej aż po akt notarialny.
                  </p>
                  <p className="mt-3 text-[0.825rem] font-medium italic leading-snug text-slate-900">
                    Klamka Zapadła – otwieramy przed Wami drzwi do nowego życia!
                  </p>
                </div>
              </div>
            </section>
          </div>
          </div>
          {/* Rozwinięty: animowane pojawianie/znikanie + wejście elementów */}
          <div
            className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${
              !collapsed ? 'max-h-[75vh] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-[-6px] pointer-events-none'
            }`}
          >
        {/* Title above menu */}
        <div className="px-3 pt-3 animate-[menu-content-in_0.4s_ease-out_0.06s_both]">
          <div className="text-left text-sm font-semibold uppercase tracking-wide text-white">
            Twoja droga do M4
          </div>
        </div>

        {/* Delikatna pionowa, przerywana linia łącząca poziome kreski etapów, zakończona grotem strzałki (top cofnięty o ~9 kresek w górę) */}
        <div
          className="pointer-events-none absolute left-3 top-[3.75rem] bottom-16 flex flex-col items-center animate-[menu-content-in_0.4s_ease-out_0.12s_both]"
          aria-hidden
        >
          <div className="h-full border-l border-dashed border-white/35" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="mt-1 h-3.5 w-3.5 text-white/70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </div>

        {/* Menu list */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Menu główne">
          <ul className="space-y-0.5 px-2">
            {MENU_ITEMS.filter((item) => item.id !== 'siteLog' && item.id !== 'news').map((item, index) => {
              const isActive = activeId === item.id
              const statusIconClass =
                item.status === 'done'
                  ? 'text-emerald-300'
                  : item.status === 'current'
                    ? 'text-amber-300'
                    : 'text-gray-400'
              const statusTextClass =
                item.status === 'current'
                  ? 'text-white font-semibold'
                  : 'text-white/60'
              const statusIcon =
                item.status === 'done' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-emerald-300"
                  >
                    <polyline
                      points="20 6 9 17 4 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : item.status === 'current' ? (
                  <span className="inline-flex items-center justify-center rounded-full animate-[coral-pulse_1.2s_ease-in-out_infinite]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-amber-300"
                    >
                      <polyline
                        points="15 18 9 12 15 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-gray-400 animate-pulse"
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
              return (
                <li
                  key={item.id}
                  className="animate-[menu-content-in_0.35s_ease-out_both]"
                  style={{ animationDelay: `${0.2 + index * 0.04}s` }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={`
                      group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors
                      ${isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/5'
                      }
                      ${collapsed ? 'justify-center px-0' : ''}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r bg-[var(--color-domesta-red)]" aria-hidden />
                    )}
                    {!collapsed && (
                      <>
                        {/* Pozioma przerywana kreska zakończona strzałką prowadząca do ikony etapu */}
                        <span className="flex items-center gap-1">
                          <span className="h-px w-6 border-t border-dashed border-white/40" />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            className="h-3 w-3 text-white/70"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 8h8" />
                            <path d="M8 4l4 4-4 4" />
                          </svg>
                          <span className={`shrink-0 [&_svg]:h-5 [&_svg]:w-5 transition-colors ${statusIconClass}`}>
                            {item.icon}
                          </span>
                        </span>

                        {/* Tekst etapu – zajmuje resztę miejsca, żeby ikony po prawej były w jednej linii */}
                        <span className={`min-w-0 flex-1 truncate ${statusTextClass}`}>{item.label}</span>
                        {/* Prawa ikonka statusu */}
                        <span className="ml-auto shrink-0">{statusIcon}</span>
                      </>
                    )}
                    {collapsed && (
                      <span className="relative flex h-8 w-8 items-center justify-center">
                        <span className={`[&_svg]:h-5 [&_svg]:w-5 transition-colors ${statusIconClass}`}>
                          {item.icon}
                        </span>
                        <span className="absolute -bottom-0.5 -right-0.5">
                          {statusIcon}
                        </span>
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
            {/* Dziennik budowy – na końcu menu, niżej, wielkie litery */}
            <li
              className="mt-4 pt-3 border-t border-gray-800 animate-[menu-content-in_0.35s_ease-out_both]"
              style={{ animationDelay: '0.45s' }}
            >
              <button
                type="button"
                onClick={() => onSelect('siteLog')}
                className={`
                  group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors
                  ${activeId === 'siteLog'
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
                title={collapsed ? 'Dziennik budowy' : undefined}
              >
                {activeId === 'siteLog' && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r bg-[var(--color-domesta-red)]" aria-hidden />
                )}
                {!collapsed ? (
                  <>
                    <span className={`shrink-0 [&_svg]:h-5 [&_svg]:w-5 ${theme === 'allWhite' ? 'theme-all-white-site-log-icon' : 'text-amber-300'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 5H9a2 2 0 0 0-2 2v11" />
                        <path d="M13 9H7" />
                        <path d="M15 13H7" />
                        <path d="M17 17H7" />
                        <path d="M5 5v14a2 2 0 0 0 2 2h11" />
                        <path d="M19 21h-2a2 2 0 0 1-2-2V3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
                      </svg>
                    </span>
                    <span className="truncate text-xs font-semibold uppercase tracking-wide text-white">
                      Dziennik budowy
                    </span>
                  </>
                ) : (
                  <span className={`[&_svg]:h-5 [&_svg]:w-5 ${theme === 'allWhite' ? 'theme-all-white-site-log-icon' : 'text-amber-300'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 5H9a2 2 0 0 0-2 2v11" />
                      <path d="M13 9H7" />
                      <path d="M15 13H7" />
                      <path d="M17 17H7" />
                      <path d="M5 5v14a2 2 0 0 0 2 2h11" />
                      <path d="M19 21h-2a2 2 0 0 1-2-2V3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>
          </div>
        </div>
      </aside>
    </>
  )
}
