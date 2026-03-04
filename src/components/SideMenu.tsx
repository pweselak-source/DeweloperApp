import { MENU_ITEMS } from '../data/menuItems'
import type { MenuId } from '../data/menuItems'

interface SideMenuProps {
  collapsed: boolean
  activeId: MenuId | null
  onSelect: (id: MenuId) => void
  onToggleCollapse: () => void
  investmentName: string
}

export function SideMenu({ collapsed, activeId, onSelect, onToggleCollapse, investmentName }: SideMenuProps) {
  const parts = investmentName.split(/\s+/)
  const firstWord = parts[0] ?? ''
  const restWords = parts.slice(1).join(' ')
  return (
    <>
      <aside className="hidden">
        {/* Header: nazwa inwestycji + collapse/expand control – wysokość jak górny pasek (h-14) */}
        <div className="flex h-14 items-center border-b border-gray-200 bg-white px-3">
          {collapsed ? (
            <div className="flex w-full justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-domesta-gray)] hover:bg-gray-200"
                aria-label="Rozwiń menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex w-full items-center gap-2">
              <span className="text-[1.2175625rem] tracking-wide">
                <span className="text-[var(--color-domesta-red)]">{firstWord}</span>
                {restWords ? <>{' '}<span className="text-[var(--color-domesta-gray)]">{restWords}</span></> : null}
              </span>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-domesta-gray)] hover:bg-gray-200"
                aria-label="Zwiń menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Title above menu */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="text-left text-sm font-semibold uppercase tracking-wide text-white">
              Twoja droga do M4
            </div>
          </div>
        )}

        {/* Menu list */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Menu główne">
          <ul className="space-y-0.5 px-2">
            {MENU_ITEMS.filter((item) => item.id !== 'siteLog' && item.id !== 'news').map((item) => {
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
                      strokeWidth="2.5"
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
                        strokeWidth="2.5"
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
                <li key={item.id}>
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
                        {/* Lewa ikona etapu – stan kolorami */}
                        <span className={`shrink-0 [&_svg]:h-5 [&_svg]:w-5 transition-colors ${statusIconClass}`}>
                          {item.icon}
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
            <li className="mt-4 pt-3 border-t border-gray-800">
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
                    <span className="shrink-0 [&_svg]:h-5 [&_svg]:w-5 text-amber-300">
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
                  <span className="[&_svg]:h-5 [&_svg]:w-5 text-amber-300">
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
      </aside>
    </>
  )
}
