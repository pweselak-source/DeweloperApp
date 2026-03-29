import { useState, type ReactNode } from 'react'

export type BackOfficeMenuItemId =
  | 'investments'
  | 'clients'
  | 'permissions'
  | 'calendar-management'
  | 'calendar-preview'
  | 'statistics'
  | 'construction-schedule'

interface BackOfficeMenuProps {
  activeItem: BackOfficeMenuItemId
  onSelectItem: (item: BackOfficeMenuItemId) => void
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="8" r="3" />
        <path d="M3 20c0-3 2-5 5-5s5 2 5 5" />
        <path d="M12 20c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      </svg>
    ),
  },
  {
    id: 'permissions',
    label: 'Uprawnienia',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'calendar-management',
    label: 'Zarządzanie kalendarzem',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    id: 'calendar-preview',
    label: 'Podglad kalendarza',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'statistics',
    label: 'Statystyki',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 6-7" />
      </svg>
    ),
  },
  {
    id: 'construction-schedule',
    label: 'Harmonogram budowy',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <rect x="4" y="12" width="4" height="9" />
        <rect x="10" y="8" width="4" height="13" />
        <rect x="16" y="5" width="4" height="16" />
      </svg>
    ),
  },
]

export function BackOfficeMenu({ activeItem, onSelectItem }: BackOfficeMenuProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={`shrink-0 transition-[width] duration-200 ease-out ${collapsed ? 'w-14' : 'w-full max-w-[320px]'}`}
    >
      <aside className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <nav className="py-2" aria-label="BackOffice menu">
          <div className={`mb-1 flex px-2 ${collapsed ? 'justify-center' : 'justify-end'}`}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[var(--color-domesta-gray)]"
              aria-expanded={!collapsed}
              aria-controls="backoffice-nav-list"
              aria-label={collapsed ? 'Rozwiń menu boczne' : 'Zwiń menu — pokaż tylko ikony'}
              title={collapsed ? 'Rozwiń menu' : 'Zwiń menu (tylko ikony)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
          <ul id="backoffice-nav-list" className={`space-y-1 ${collapsed ? 'px-1.5' : 'px-3'}`}>
            {NAV_ITEMS.map((item) => {
              const isActive = activeItem === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectItem(item.id)}
                    title={collapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center rounded-lg text-sm ${
                      collapsed ? 'justify-center px-0 py-2.5' : 'gap-2 px-3 py-2 text-left'
                    } ${
                      isActive
                        ? 'bg-gray-100 text-[var(--color-domesta-gray)] ring-1 ring-gray-200/80'
                        : 'text-gray-700 hover:bg-gray-50'
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
