import type { ReactNode } from 'react'
import domestaLogo from '../assets/domesta-logo.png.svg'
import karolinaAvatar from '../assets/karolina-kolosowska.png'

export type BackOfficeMenuItemId =
  | 'investments'
  | 'clients'
  | 'calendar-management'
  | 'calendar-preview'
  | 'statistics'
  | 'construction-schedule'

interface BackOfficeMenuProps {
  activeItem: BackOfficeMenuItemId
  onSelectItem: (item: BackOfficeMenuItemId) => void
  collapsed: boolean
}

type NavItem = {
  id: BackOfficeMenuItemId
  label: string
  icon: ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'investments',
    label: 'Panel główny',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" />
        <rect x="13" y="3" width="8" height="5" />
        <rect x="13" y="10" width="8" height="11" />
        <rect x="3" y="13" width="8" height="8" />
      </svg>
    ),
  },
  {
    id: 'clients',
    label: 'Użytkownicy',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="8" r="3" />
        <path d="M3 20c0-3 2-5 5-5s5 2 5 5" />
        <path d="M12 20c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      </svg>
    ),
  },
  {
    id: 'calendar-management',
    label: 'Zarządzanie kalendarzem',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    id: 'calendar-preview',
    label: 'Podgląd kalendarza',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'statistics',
    label: 'Statystyki',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 6-7" />
      </svg>
    ),
  },
  {
    id: 'construction-schedule',
    label: 'Dziennik budowy',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <rect x="4" y="12" width="4" height="9" />
        <rect x="10" y="8" width="4" height="13" />
        <rect x="16" y="5" width="4" height="16" />
      </svg>
    ),
  },
]

export function BackOfficeMenu({ activeItem, onSelectItem, collapsed }: BackOfficeMenuProps) {
  return (
    <div
      className={`fixed left-0 top-0 z-40 h-screen shrink-0 self-stretch transition-[width] duration-200 ease-out ${collapsed ? 'w-16' : 'w-full max-w-[260px]'}`}
    >
      <aside className="h-screen w-full overflow-y-auto overflow-x-hidden border-r border-slate-800 bg-[#2a3f54] shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)]">
        <div className="border-b border-slate-700/70 px-3 pb-2 pt-1.5">
          <div className="px-1 py-1">
            <img src={domestaLogo} alt="Domesta" className="h-[2.2rem] w-auto object-contain" />
          </div>
        </div>
        <div className={`border-b border-slate-700/70 px-3 py-3 ${collapsed ? 'hidden' : 'block'}`}>
          <div className="flex items-center gap-3 rounded-md bg-[#334d65] p-2">
            <img src={karolinaAvatar} alt="Karolina Kołosowska" className="h-10 w-10 rounded-full border border-white/25 bg-slate-100 object-cover object-[50%_22%]" />
            <div className="min-w-0">
              <p className="truncate text-[11px] uppercase tracking-wide text-slate-300">Zalogowano</p>
              <p className="truncate text-sm font-semibold text-white">Karolina Kołosowska</p>
            </div>
          </div>
        </div>
        <div className="border-b border-slate-700/70 px-4 py-3">
          <p
            className={`truncate text-[0.83125rem] font-semibold uppercase tracking-[0.18em] text-slate-300 ${collapsed ? 'text-center' : ''}`}
          >
            {collapsed ? 'BO' : 'BackOffice'}
          </p>
          {!collapsed ? <div className="mt-2 h-px w-full bg-white/[0.38]" aria-hidden /> : null}
        </div>
        <nav className="py-3" aria-label="BackOffice menu">
          <ul id="backoffice-nav-list" className={`space-y-1 ${collapsed ? 'px-1.5' : 'px-2.5'}`}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeItem === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectItem(item.id)}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center rounded-md text-sm transition-colors ${
                      collapsed ? 'justify-center px-0 py-2.5' : 'gap-2 px-3 py-2.5 text-left'
                    } ${
                      isActive
                        ? 'bg-[#1abb9c] text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)]'
                        : 'text-slate-300 hover:bg-[#334d65] hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className={collapsed ? 'sr-only' : ''}>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </div>
  )
}
