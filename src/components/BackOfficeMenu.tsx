interface BackOfficeMenuProps {
  activeItem:
    | 'investments'
    | 'clients'
    | 'permissions'
    | 'calendar-management'
    | 'calendar-preview'
    | 'statistics'
    | 'construction-schedule'
  onSelectItem: (item: BackOfficeMenuProps['activeItem']) => void
}

export function BackOfficeMenu({ activeItem, onSelectItem }: BackOfficeMenuProps) {
  return (
    <aside className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <nav className="px-3 py-3" aria-label="BackOffice menu">
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onSelectItem('investments')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeItem === 'investments'
                  ? 'bg-gray-100 text-[var(--color-domesta-gray)]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="8" height="8" />
                <rect x="13" y="3" width="8" height="5" />
                <rect x="13" y="10" width="8" height="11" />
                <rect x="3" y="13" width="8" height="8" />
              </svg>
              <span>Panel główny</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectItem('clients')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeItem === 'clients'
                  ? 'bg-gray-100 text-[var(--color-domesta-gray)]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="3" />
                <circle cx="17" cy="8" r="3" />
                <path d="M3 20c0-3 2-5 5-5s5 2 5 5" />
                <path d="M12 20c0-2.2 1.8-4 4-4s4 1.8 4 4" />
              </svg>
              <span>Przypisanie Klientow</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectItem('permissions')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeItem === 'permissions'
                  ? 'bg-gray-100 text-[var(--color-domesta-gray)]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Uprawnienia</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectItem('calendar-management')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeItem === 'calendar-management'
                  ? 'bg-gray-100 text-[var(--color-domesta-gray)]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M3 10h18" />
                <path d="M8 2v4M16 2v4" />
              </svg>
              <span>Zarządzanie kalendarzem</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectItem('calendar-preview')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeItem === 'calendar-preview'
                  ? 'bg-gray-100 text-[var(--color-domesta-gray)]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Podglad kalendarza</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectItem('statistics')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeItem === 'statistics'
                  ? 'bg-gray-100 text-[var(--color-domesta-gray)]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 16l4-4 4 4 6-7" />
              </svg>
              <span>Statystyki</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => onSelectItem('construction-schedule')}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeItem === 'construction-schedule'
                  ? 'bg-gray-100 text-[var(--color-domesta-gray)]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <rect x="4" y="12" width="4" height="9" />
                <rect x="10" y="8" width="4" height="13" />
                <rect x="16" y="5" width="4" height="16" />
              </svg>
              <span>Harmonogram budowy</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
