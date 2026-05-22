import type { ReactNode } from 'react'
import {
  Newspaper,
  ClipboardText,
  CalendarBlank,
  FileText,
  WarningCircle,
  House,
  Lightning,
  Scales,
  NotePencil,
} from '@phosphor-icons/react'
import type { MenuId } from '../../data/menuItems'

type WebAppItem = {
  id: MenuId
  label: string
  status: 'done' | 'current' | 'future'
}

const WEBAPP_ITEMS: WebAppItem[] = [
  { id: 'news', label: 'Aktualności', status: 'current' },
  { id: 'formalities', label: 'Formalności początkowe', status: 'done' },
  { id: 'schedule', label: 'Harmonogram spłaty', status: 'current' },
  { id: 'documents', label: 'Dokumenty do odbioru', status: 'future' },
  { id: 'complaints', label: 'Reklamacje', status: 'future' },
  { id: 'handover', label: 'Odbiór mieszkania', status: 'future' },
  { id: 'meter', label: 'Zgłoszenia licznika', status: 'future' },
  { id: 'notary', label: 'Akt notarialny', status: 'future' },
  { id: 'siteLog', label: 'Dziennik budowy', status: 'current' },
]

function iconFor(id: MenuId, filled: boolean) {
  const weight = filled ? 'duotone' : 'regular'
  const size = 24
  switch (id) {
    case 'news':
      return <Newspaper size={size} weight={weight} />
    case 'formalities':
      return <ClipboardText size={size} weight={weight} />
    case 'schedule':
      return <CalendarBlank size={size} weight={weight} />
    case 'documents':
      return <FileText size={size} weight={weight} />
    case 'complaints':
      return <WarningCircle size={size} weight={weight} />
    case 'handover':
      return <House size={size} weight={weight} />
    case 'meter':
      return <Lightning size={size} weight={weight} />
    case 'notary':
      return <Scales size={size} weight={weight} />
    case 'siteLog':
      return <NotePencil size={size} weight={weight} />
    default:
      return <Newspaper size={size} weight={weight} />
  }
}

interface WebAppPrivateLayoutAppleProps {
  activeSectionId: MenuId | null
  onSelectSection: (id: MenuId) => void
  children: ReactNode
}

export function WebAppPrivateLayoutApple({
  activeSectionId,
  onSelectSection,
  children,
}: WebAppPrivateLayoutAppleProps) {
  const isNews = activeSectionId === 'news'
  const activeForNav = isNews ? 'news' : activeSectionId ?? 'formalities'

  return (
    <div
      className="apple-theme relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f5f5f7] md:block md:overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", system-ui, -apple-system, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <aside
        className="shrink-0 border-b border-[#d2d2d7] bg-white/75 px-4 py-4 text-[#1d1d1f] backdrop-blur-xl md:fixed md:bottom-0 md:left-0 md:z-20 md:w-64 md:border-b-0 md:border-r md:border-[#d2d2d7] md:px-3 md:py-5 md:top-[4.667rem] md:overflow-y-auto lg:w-72"
        aria-label="Harmonogram projektu"
      >
        <p className="mb-4 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">
          Harmonogram projektu
        </p>
        <nav>
          <ul className="space-y-1">
            {WEBAPP_ITEMS.map((item) => {
              const isActive = activeForNav === item.id
              const done = item.status === 'done'
              const current = item.status === 'current'

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                      isActive
                        ? 'bg-[#1d1d1f] text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)]'
                        : 'text-[#1d1d1f] hover:bg-[#1d1d1f]/[0.06]'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? 'bg-white/12 text-white'
                          : done
                            ? 'bg-[#1d1d1f]/[0.06] text-[#1d1d1f]'
                            : current
                              ? 'bg-[#1d1d1f]/[0.08] text-[#1d1d1f]'
                              : 'bg-[#1d1d1f]/[0.04] text-[#6e6e73]'
                      }`}
                    >
                      {iconFor(item.id, isActive)}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={`truncate text-[13.5px] leading-tight tracking-[-0.01em] ${
                          isActive ? 'font-semibold' : 'font-medium'
                        }`}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`mt-0.5 truncate text-[10.5px] tracking-wide ${
                          isActive ? 'text-white/55' : 'text-[#6e6e73]'
                        }`}
                      >
                        {done
                          ? 'Zakończone'
                          : current
                            ? 'W toku'
                            : 'Oczekuje'}
                      </span>
                    </span>
                    {done ? (
                      <span
                        className={`shrink-0 text-[10px] font-semibold ${
                          isActive ? 'text-white/70' : 'text-[#6e6e73]'
                        }`}
                      >
                        ✓
                      </span>
                    ) : current ? (
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          isActive ? 'bg-white' : 'bg-[#34c759]'
                        }`}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain bg-[#f5f5f7] md:min-h-0 md:pl-64 lg:pl-72">
        <div className="min-h-full w-full pb-16 pt-0 md:pb-20 md:pt-1">{children}</div>
      </div>
    </div>
  )
}
