import type { ReactNode } from 'react'
import { MENU_ITEMS } from '../../data/menuItems'
import type { MenuId, MenuItem } from '../../data/menuItems'

const SITE_LOG_ITEM: MenuItem = {
  id: 'siteLog',
  label: 'Dziennik budowy',
  status: 'current',
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 5H9a2 2 0 0 0-2 2v11" />
      <path d="M13 9H7" />
      <path d="M15 13H7" />
      <path d="M17 17H7" />
      <path d="M5 5v14a2 2 0 0 0 2 2h11" />
      <path d="M19 21h-2a2 2 0 0 1-2-2V3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
    </svg>
  ),
}

const WEBAPP_NAV_ITEMS: MenuItem[] = [...MENU_ITEMS.filter((m) => m.id !== 'siteLog'), SITE_LOG_ITEM]

interface WebAppPrivateLayoutProps {
  activeSectionId: MenuId | null
  onSelectSection: (id: MenuId) => void
  children: ReactNode
}

export function WebAppPrivateLayout({ activeSectionId, onSelectSection, children }: WebAppPrivateLayoutProps) {
  const isNews = activeSectionId === 'news'
  const activeForNav = isNews ? 'news' : activeSectionId ?? 'formalities'

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f5f4f1] md:block md:overflow-hidden">
      <aside
        className="shrink-0 border-b border-[#243647] bg-[#1a2b38] px-3 py-4 text-white md:fixed md:bottom-0 md:left-0 md:z-20 md:w-64 md:border-b-0 md:border-r md:border-[#243647] md:px-3 md:py-4 md:top-[4.667rem] md:overflow-y-auto lg:w-72"
        aria-label="Harmonogram projektu"
      >
        <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Harmonogram projektu</p>
        <nav className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/15" aria-hidden />
          <ul className="relative space-y-0.5">
            {WEBAPP_NAV_ITEMS.map((item) => {
              const isActive = activeForNav === item.id
              const done = item.status === 'done'
              const current = item.status === 'current'
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    className={`flex w-full items-start gap-3 rounded-lg py-2.5 pl-1 pr-2 text-left transition-colors ${
                      isActive ? 'bg-white/12 text-white' : 'text-white/65 hover:bg-white/6 hover:text-white/90'
                    }`}
                  >
                    <span className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#1a2b38]">
                      <span className={`[&_svg]:h-4 [&_svg]:w-4 ${done ? 'text-amber-400' : current ? 'text-amber-300' : 'text-white/35'}`}>{item.icon}</span>
                      {done && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-[#1a2b38]">
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5">
                      <span className={`block text-[13px] leading-snug ${isActive ? 'font-semibold text-white' : 'font-medium'}`}>{item.label}</span>
                      <span className="mt-0.5 block text-[10px] text-white/45">
                        {done ? 'Status: zakończone' : current ? 'Status: aktualnie' : 'Status: oczekuje'}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain bg-[#f5f4f1] md:min-h-0 md:pl-64 lg:pl-72">
        <div className="min-h-full w-full pb-16 pt-8 md:pb-20 md:pt-12">{children}</div>
      </div>
    </div>
  )
}
