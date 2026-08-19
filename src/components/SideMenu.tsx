import { useState, useRef, useLayoutEffect, type ReactNode } from 'react'
import { ResidentIntroSlideshowPanel } from './ResidentIntroHero'
import { MENU_ITEMS } from '../data/menuItems'
import type { MenuId } from '../data/menuItems'
import type { AppTheme } from '../App'

/** Ikona etapu na szarym, zaokrąglonym tle (rozmiar glifiki jak wcześniej) */
function MenuIconTile({
  children,
  iconClassName,
  theme = 'halfBlack',
}: {
  children: ReactNode
  iconClassName: string
  theme?: AppTheme
}) {
  const tileBg =
    theme === 'allWhite'
      ? 'bg-[#d8d8dc]'
      : theme === 'domestaColors'
        ? 'bg-[#e5e5ea]'
        : theme === 'batoryProject'
          ? 'bg-[#2a446a]'
        : theme === 'allBlack'
          ? 'bg-[#3a3a3c]'
          : theme === 'gold'
            ? 'bg-[#e8e0d0]'
            : 'bg-[#52525a]'

  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] ${tileBg} shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-black/10`}
    >
      <span className={`[&_svg]:h-[1.125rem] [&_svg]:w-[1.125rem] ${iconClassName}`}>
        {children}
      </span>
    </span>
  )
}

/** Nagłówek inwestycji na poziomym pasku (obok „Szczegóły podróży”) */
function InvestmentBarTitle({
  theme,
  investmentName,
}: {
  theme: AppTheme
  investmentName: string
}) {
  const showOrlowoSquare =
    theme === 'batoryProject' ||
    investmentName === 'Orłowo Square' ||
    investmentName === 'Polana Kampinowska'

  if (showOrlowoSquare) {
    return (
      <span className="flex flex-col items-start leading-none">
        <span className="text-[1.0625rem] font-semibold tracking-wide text-black">Orłowo</span>
        <span className="mt-1 text-[0.5625rem] font-medium uppercase tracking-[0.14em] text-[#c9a227]">
          square
        </span>
      </span>
    )
  }

  const parts = investmentName.split(/\s+/)
  const firstWord = parts[0] ?? ''
  const restWords = parts.slice(1).join(' ')

  return (
    <span className={`text-[0.8125rem] tracking-wide ${theme === 'allBlack' ? 'text-white' : ''} ${theme === 'allWhite' ? 'text-gray-800' : ''}`}>
      <span className={
        theme === 'allBlack' ? 'font-bold text-white' :
        theme === 'allWhite' ? 'font-semibold text-[var(--color-domesta-red)]' :
        theme === 'gold' ? 'font-semibold text-[#a97c35]' :
        'text-[var(--color-domesta-red)]'
      }>{firstWord}</span>
      {restWords ? <>{' '}<span className={theme === 'allBlack' ? 'text-white' : theme === 'allWhite' ? 'text-gray-700' : theme === 'gold' ? 'text-[#2a2a2a]' : 'text-[var(--color-domesta-gray)]'}>{restWords}</span></> : null}
    </span>
  )
}

interface SideMenuProps {
  collapsed: boolean
  activeId: MenuId | null
  onSelect: (id: MenuId) => void
  onToggleCollapse: () => void
  investmentName: string
   apartmentLabel: string
  theme?: AppTheme
  /** WebApp (lg+): pas zdjęć + intro na pełną szerokość viewportu, szyna ikon przy lewej krawędzi */
  monitorIntroFullBleed?: boolean
  /** WebApp: stały wariant bez przełączania — slideshow (jak zwinięte) albo menu rozwinięte (jak po „Szczegóły podróży”) */
  webappFixedBand?: 'none' | 'slideshow' | 'expanded'
}

export function SideMenu({
  collapsed,
  activeId,
  onSelect,
  onToggleCollapse,
  investmentName,
  apartmentLabel,
  theme = 'halfBlack',
  onInvestmentChange,
  onApartmentChange,
  monitorIntroFullBleed = false,
  webappFixedBand = 'none',
}: SideMenuProps & { onInvestmentChange: (name: string) => void; onApartmentChange: (apartment: string) => void }) {
  const effectiveCollapsed =
    webappFixedBand === 'slideshow' ? true : webappFixedBand === 'expanded' ? false : collapsed
  const hideSlideshowExpandBtn = webappFixedBand === 'slideshow'
  const hideExpandedCollapseBtn = webappFixedBand === 'expanded'
  const slideshowBandHeightClass =
    webappFixedBand === 'slideshow'
      ? 'min-h-[200px] max-h-[400px]'
      : 'h-auto min-h-[26rem]'

  const introHeroRef = useRef<HTMLElement | null>(null)
  const [introHeroBleed, setIntroHeroBleed] = useState<{ marginLeft: number; width: number } | null>(null)
  const [unitPopupOpen, setUnitPopupOpen] = useState(false)
  const [popupStep, setPopupStep] = useState<'investment' | 'apartment'>('investment')
  const [pendingInvestment, setPendingInvestment] = useState(investmentName)

  const introRailSolidBg =
    theme === 'domestaColors'
      ? 'bg-white'
      : theme === 'allWhite'
        ? 'bg-[#F0F0F0]'
        : theme === 'batoryProject'
          ? 'bg-[#10284b]'
        : theme === 'gold'
          ? 'bg-[#f0ebe0]'
          : 'bg-[var(--color-domesta-gray)]'

  useLayoutEffect(() => {
    if (!monitorIntroFullBleed || !effectiveCollapsed) {
      setIntroHeroBleed(null)
      return
    }
    const mq = window.matchMedia('(min-width: 1024px)')
    const measure = () => {
      if (!mq.matches) {
        setIntroHeroBleed(null)
        return
      }
      const el = introHeroRef.current
      if (!el) return
      const { left } = el.getBoundingClientRect()
      const w = document.documentElement.clientWidth
      setIntroHeroBleed({ marginLeft: -left, width: w })
    }
    measure()
    const raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    mq.addEventListener('change', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      mq.removeEventListener('change', measure)
    }
  }, [monitorIntroFullBleed, effectiveCollapsed, investmentName, apartmentLabel, webappFixedBand])

  return (
    <>
      <aside
        className={`relative w-full rounded-2xl shadow-md ${
          webappFixedBand !== 'none'
            ? 'lg:static lg:z-20 lg:max-h-none lg:overflow-y-visible'
            : 'lg:sticky lg:top-20 lg:z-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto'
        } ${
          monitorIntroFullBleed ? 'overflow-hidden lg:overflow-x-visible lg:overflow-y-auto' : 'overflow-hidden lg:overflow-x-hidden'
        } ${
          theme === 'domestaColors' ? 'bg-white theme-domesta-colors-menu' :
          theme === 'batoryProject' ? 'bg-[#10284b] text-white theme-batory-menu' :
          theme === 'allWhite' ? 'bg-[#F0F0F0] theme-all-white-menu' :
          theme === 'gold' ? 'bg-[#f0ebe0]' :
          'bg-[var(--color-domesta-gray)] text-white'
        }`}>
        {/* Header: nazwa inwestycji + collapse/expand control – wysokość jak górny pasek AppBar */}
        <div className={`flex min-h-[4.667rem] h-[4.667rem] items-center border-b px-3 ${
          theme === 'allBlack' ? 'border-gray-600 bg-[#252525]' :
          theme === 'allWhite' ? 'border-gray-300 bg-[#F0F0F0]' :
          theme === 'gold' ? 'border-[#c9974a]/25 bg-[#faf8f3]' :
          'border-gray-200 bg-white'
        }`}>
          {effectiveCollapsed ? (
            <div className="flex w-full items-center gap-3">
              <button
                type="button"
                onClick={() => setUnitPopupOpen(true)}
                className={`flex min-w-0 flex-col text-left ${theme === 'batoryProject' ? 'gap-2' : ''}`}
              >
                <InvestmentBarTitle theme={theme} investmentName={investmentName} />
                <span className={`min-w-0 truncate text-[0.583rem] ${theme === 'allBlack' ? 'text-white' : theme === 'gold' ? 'text-[#6b7280]' : 'text-gray-600'}`}>Mieszkanie: {apartmentLabel}</span>
              </button>
              {!hideSlideshowExpandBtn && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className={`ml-auto mr-3 flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] shadow-sm ${
                    theme === 'allBlack' ? 'border-gray-500 bg-[#333333] text-gray-200 hover:bg-[#404040]' :
                    theme === 'allWhite' ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100' :
                    theme === 'gold' ? 'border-[#c9974a]/30 bg-white text-[#a97c35] hover:bg-[#faf8f3]' :
                    'border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-100'
                  }`}
                  aria-label="Szczegóły podróży"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 ${theme === 'allBlack' ? 'text-gray-400' : theme === 'allWhite' ? 'text-gray-600' : theme === 'gold' ? 'text-[#c9974a]' : 'text-gray-500'}`}
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
              )}
            </div>
          ) : (
            <div className="flex w-full items-center gap-3">
              <button
                type="button"
                onClick={() => setUnitPopupOpen(true)}
                className={`flex min-w-0 flex-col text-left ${theme === 'batoryProject' ? 'gap-2' : ''}`}
              >
                <InvestmentBarTitle theme={theme} investmentName={investmentName} />
                <span className={`min-w-0 truncate text-[0.583rem] ${theme === 'allBlack' ? 'text-white' : theme === 'gold' ? 'text-[#6b7280]' : 'text-gray-600'}`}>Mieszkanie: {apartmentLabel}</span>
              </button>
              {!hideExpandedCollapseBtn && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className={`ml-auto flex h-8 w-8 items-center justify-center rounded-lg ${
                    theme === 'allBlack' ? 'text-gray-300 hover:bg-[#404040]' :
                    theme === 'allWhite' ? 'text-gray-600 hover:bg-gray-200' :
                    theme === 'gold' ? 'text-[#a97c35] hover:bg-[#c9974a]/10' :
                    'text-[var(--color-domesta-gray)] hover:bg-gray-200'
                  }`}
                  aria-label="Zwiń menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {unitPopupOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--color-domesta-gray)]">
                  {popupStep === 'investment' ? 'Wybierz inwestycję' : 'Wybierz mieszkanie'}
                </h2>
                <button
                  type="button"
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => {
                    setUnitPopupOpen(false)
                    setPopupStep('investment')
                    setPendingInvestment(investmentName)
                  }}
                  aria-label="Zamknij"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {popupStep === 'investment' ? (
                <>
                  <p className="mb-3 text-xs text-gray-600">
                    Aktualnie wybrana inwestycja:{' '}
                    <span className="font-semibold">{investmentName}</span>
                  </p>
                  <p className="mb-2 text-[11px] text-gray-500">
                    Wybierz inwestycję, a następnie mieszkanie w tej lokalizacji.
                  </p>
                  <div className="space-y-2 text-xs">
                    {(theme === 'batoryProject'
                      ? ['Orłowo Square', 'Zielone Ogrody', 'Nowa Morena']
                      : ['Polana Kampinowska', 'Zielone Ogrody', 'Nowa Morena']
                    ).map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={`flex w-full items-center justify-between rounded-md border px-3 py-1.5 text-left text-gray-800 hover:border-[var(--color-domesta-red)] hover:bg-gray-50 ${
                          pendingInvestment === name ? 'border-[var(--color-domesta-red)] bg-gray-50' : 'border-gray-200'
                        }`}
                        onClick={() => {
                          setPendingInvestment(name)
                          setPopupStep('apartment')
                        }}
                      >
                        <span className="text-gray-800">{name}</span>
                        <span className="text-[10px] text-[var(--color-domesta-red)]">
                          {pendingInvestment === name ? 'Wybrane' : 'Wybierz'}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-2 text-xs text-gray-600">
                    Inwestycja:{' '}
                    <span className="font-semibold">{pendingInvestment}</span>
                  </p>
                  <p className="mb-2 text-[11px] text-gray-500">
                    Wybierz mieszkanie, które chcesz powiązać z kontem.
                  </p>
                  <div className="space-y-2 text-xs">
                    {(
                      pendingInvestment === 'Zielone Ogrody'
                        ? ['Lipowa 3/7', 'Lipowa 5/2', 'Kasztanowa 12/4', 'Klonowa 8/1'] // 4 mieszkania
                        : pendingInvestment === 'Nowa Morena'
                          ? ['Morena 10/1'] // 1 mieszkanie
                          : pendingInvestment === 'Orłowo Square'
                            ? ['Uranowa 21A/3', 'Uranowa 21A/5']
                            : ['Uranowa 21A/3', 'Uranowa 21A/5'] // 2 mieszkania
                    ).map((address) => (
                      <button
                        key={address}
                        type="button"
                        className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-1.5 text-left text-gray-800 hover:border-[var(--color-domesta-red)] hover:bg-gray-50"
                        onClick={() => {
                          onInvestmentChange(pendingInvestment)
                          onApartmentChange(address)
                          setUnitPopupOpen(false)
                          setPopupStep('investment')
                        }}
                      >
                        <span className="text-gray-800">{address}</span>
                        <span className="text-[10px] text-[var(--color-domesta-red)]">Wybierz</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className={monitorIntroFullBleed ? 'relative overflow-hidden lg:overflow-x-visible' : 'relative overflow-hidden'}>
          {/* Zwinięty: animowane pojawianie/znikanie */}
          <div
            className={`flex flex-col transition-[max-height,opacity,transform] duration-300 ease-out ${
              monitorIntroFullBleed ? 'overflow-visible lg:overflow-x-visible' : 'overflow-visible'
            } ${
              effectiveCollapsed
                ? `${slideshowBandHeightClass} opacity-100 translate-y-0`
                : 'max-h-0 min-h-0 opacity-0 translate-y-[-6px] pointer-events-none overflow-hidden'
            }`}
          >
          <div
            className={`flex min-h-[26rem] flex-1 flex-nowrap items-stretch gap-1 py-0 animate-[menu-content-in_0.3s_ease-out_0.08s_both] ${
              monitorIntroFullBleed && effectiveCollapsed ? 'overflow-visible' : ''
            }`}
          >
            {/* Szyna ikon + strzałka: przyklejona do lewej, nad pełnoekranowym pasem zdjęć (WebApp lg+) */}
            <div
              className={`flex shrink-0 items-stretch gap-1 ${
                monitorIntroFullBleed && effectiveCollapsed ? `relative z-30 lg:rounded-l-xl lg:pr-1 ${introRailSolidBg}` : ''
              }`}
            >
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
            <nav className="flex shrink-0 flex-col self-stretch pl-0 pr-2.5" aria-label="Menu główne">
              <ul className="flex flex-col items-start gap-1.5 py-4">
                {MENU_ITEMS.filter((item) => item.id !== 'siteLog' && item.id !== 'news').map((item) => {
                  const isActive = activeId === item.id
                  const statusIconClass =
                    theme === 'gold'
                      ? item.status === 'done'
                        ? 'text-[#c9974a]'
                        : item.status === 'current'
                          ? 'text-[#d4956a]'
                          : 'text-[#6b7280]'
                      : item.status === 'done'
                        ? 'text-emerald-300'
                        : item.status === 'current'
                          ? 'text-amber-300'
                          : 'text-gray-400'
                  const statusIcon =
                    item.status === 'done' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`h-[0.9rem] w-[0.9rem] ${theme === 'gold' ? 'text-[#c9974a]' : 'text-emerald-300'}`}>
                        <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : item.status === 'current' ? (
                      <span className="inline-flex items-center justify-center rounded-full animate-[coral-pulse_1.2s_ease-in-out_infinite]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`h-[0.9rem] w-[0.9rem] ${theme === 'gold' ? 'text-[#d4956a]' : 'text-amber-300'}`}>
                          <polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`h-[0.9rem] w-[0.9rem] animate-pulse ${theme === 'gold' ? 'text-[#6b7280]' : 'text-gray-400'}`}>
                        <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={`group relative flex items-center justify-start gap-2 rounded-lg px-1 py-1 text-left transition-colors ${
                          theme === 'gold'
                            ? isActive ? 'bg-[#c9974a]/15 ring-1 ring-[#c9974a]/25' : 'hover:bg-[#c9974a]/8'
                            : isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                        }`}
                        title={item.label}
                      >
                        <MenuIconTile iconClassName={statusIconClass} theme={theme}>
                          {item.icon}
                        </MenuIconTile>
                        <span className="shrink-0">{statusIcon}</span>
                      </button>
                    </li>
                  )
                })}
                <li className={`mt-2 pt-2 border-t ${theme === 'gold' ? 'border-[#c9974a]/20' : 'border-white/20'}`}>
                  <button
                    type="button"
                    onClick={() => onSelect('siteLog')}
                    className={`flex items-center justify-start rounded-lg px-1 py-1 ${
                      theme === 'gold'
                        ? activeId === 'siteLog' ? 'bg-[#c9974a]/15 ring-1 ring-[#c9974a]/25' : 'hover:bg-[#c9974a]/8'
                        : activeId === 'siteLog' ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                    title="Dziennik budowy"
                  >
                    <MenuIconTile
                      iconClassName={theme === 'allWhite' ? 'theme-all-white-site-log-icon' : theme === 'gold' ? 'text-[#d4956a]' : 'text-amber-300'}
                      theme={theme}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 5H9a2 2 0 0 0-2 2v11" /><path d="M13 9H7" /><path d="M15 13H7" /><path d="M17 17H7" /><path d="M5 5v14a2 2 0 0 0 2 2h11" /><path d="M19 21h-2a2 2 0 0 1-2-2V3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
                      </svg>
                    </MenuIconTile>
                  </button>
                </li>
              </ul>
            </nav>
            </div>
            <section
              ref={introHeroRef}
              style={
                introHeroBleed
                  ? { marginLeft: introHeroBleed.marginLeft, width: introHeroBleed.width, maxWidth: introHeroBleed.width }
                  : undefined
              }
              className={`relative mr-0 flex min-h-[26rem] min-w-0 flex-1 flex-col justify-end self-stretch overflow-hidden border border-white/40 border-b-0 px-4 pt-3 pb-4 text-left ${
                introHeroBleed
                  ? 'z-0 ml-0 rounded-none border-r-0 lg:rounded-r-xl'
                  : 'ml-2 rounded-xl rounded-r-none rounded-b-none border-r-0'
              }`}
            >
              <ResidentIntroSlideshowPanel theme={theme} />
            </section>
          </div>
          </div>
          {/* Rozwinięty: animowane pojawianie/znikanie + wejście elementów */}
          <div
            className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${
              webappFixedBand === 'expanded'
                ? 'max-h-[min(60vh,640px)] opacity-100 translate-y-0 lg:overflow-y-auto'
                : !effectiveCollapsed
                  ? 'max-h-[75vh] opacity-100 translate-y-0'
                  : 'max-h-0 opacity-0 translate-y-[-6px] pointer-events-none'
            }`}
          >
        {/* Title above menu */}
        <div className="px-3 pt-3 animate-[menu-content-in_0.4s_ease-out_0.06s_both]">
          <div className={`text-left text-sm font-semibold uppercase tracking-wide ${theme === 'gold' || theme === 'allWhite' || theme === 'domestaColors' ? 'text-[#2a2a2a]' : 'text-white'}`}>
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
                theme === 'gold'
                  ? item.status === 'done'
                    ? 'text-[#c9974a]'
                    : item.status === 'current'
                      ? 'text-[#d4956a]'
                      : 'text-[#6b7280]'
                  : item.status === 'done'
                    ? 'text-emerald-300'
                    : item.status === 'current'
                      ? 'text-amber-300'
                      : 'text-gray-400'
              const statusTextClass =
                theme === 'gold'
                  ? item.status === 'current'
                    ? 'text-[#2a2a2a] font-semibold'
                    : item.status === 'done'
                      ? 'text-[#6b7280]'
                      : 'text-[#6b7280]/70'
                  : item.status === 'current'
                    ? 'text-white font-semibold'
                    : 'text-white/60'
              const statusIcon =
                item.status === 'done' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`h-4 w-4 ${theme === 'gold' ? 'text-[#c9974a]' : 'text-emerald-300'}`}>
                    <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : item.status === 'current' ? (
                  <span className="inline-flex items-center justify-center rounded-full animate-[coral-pulse_1.2s_ease-in-out_infinite]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`h-4 w-4 ${theme === 'gold' ? 'text-[#d4956a]' : 'text-amber-300'}`}>
                      <polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`h-4 w-4 animate-pulse ${theme === 'gold' ? 'text-[#6b7280]' : 'text-gray-400'}`}>
                    <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                      group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors
                      ${theme === 'gold'
                        ? isActive
                          ? 'bg-gradient-to-r from-[#e0b96e]/20 to-[#c9974a]/10 ring-1 ring-[#c9974a]/30'
                          : 'hover:bg-[#c9974a]/8'
                        : isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/70 hover:bg-white/5'
                      }
                      ${effectiveCollapsed ? 'justify-center px-0' : ''}
                    `}
                    title={effectiveCollapsed ? item.label : undefined}
                  >
                    {isActive && !effectiveCollapsed && (
                      <span
                        className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r ${theme === 'gold' ? 'bg-gradient-to-b from-[#e0b96e] to-[#a97c35]' : 'bg-[var(--color-domesta-red)]'}`}
                        aria-hidden
                      />
                    )}
                    {!effectiveCollapsed && (
                      <>
                        {/* Pozioma przerywana kreska zakończona strzałką prowadząca do ikony etapu */}
                        <span className="flex items-center gap-1">
                          <span className={`h-px w-6 border-t border-dashed ${theme === 'gold' ? 'border-[#c9974a]/30' : 'border-white/40'}`} />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            className={`h-3 w-3 ${theme === 'gold' ? 'text-[#c9974a]/50' : 'text-white/70'}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 8h8" />
                            <path d="M8 4l4 4-4 4" />
                          </svg>
                          <MenuIconTile iconClassName={statusIconClass} theme={theme}>
                            {item.icon}
                          </MenuIconTile>
                        </span>

                        {/* Tekst etapu – zajmuje resztę miejsca, żeby ikony po prawej były w jednej linii */}
                        <span className={`min-w-0 flex-1 truncate ${statusTextClass}`}>{item.label}</span>
                        {/* Prawa ikonka statusu */}
                        <span className="ml-auto shrink-0">{statusIcon}</span>
                      </>
                    )}
                    {effectiveCollapsed && (
                      <span className="relative flex items-center justify-center">
                        <MenuIconTile iconClassName={statusIconClass} theme={theme}>
                          {item.icon}
                        </MenuIconTile>
                        <span className="absolute -bottom-0.5 -right-1">
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
              className={`mt-4 pt-3 border-t animate-[menu-content-in_0.35s_ease-out_both] ${theme === 'gold' ? 'border-[#c9974a]/20' : 'border-gray-800'}`}
              style={{ animationDelay: '0.45s' }}
            >
              <button
                type="button"
                onClick={() => onSelect('siteLog')}
                className={`
                  group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors
                  ${theme === 'gold'
                    ? activeId === 'siteLog'
                      ? 'bg-gradient-to-r from-[#e0b96e]/20 to-[#c9974a]/10 ring-1 ring-[#c9974a]/30'
                      : 'hover:bg-[#c9974a]/8'
                    : activeId === 'siteLog'
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5'
                  }
                  ${effectiveCollapsed ? 'justify-center px-0' : ''}
                `}
                title={effectiveCollapsed ? 'Dziennik budowy' : undefined}
              >
                {activeId === 'siteLog' && !effectiveCollapsed && (
                  <span
                    className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r ${theme === 'gold' ? 'bg-gradient-to-b from-[#e0b96e] to-[#a97c35]' : 'bg-[var(--color-domesta-red)]'}`}
                    aria-hidden
                  />
                )}
                {!effectiveCollapsed ? (
                  <>
                    <MenuIconTile
                      iconClassName={theme === 'allWhite' ? 'theme-all-white-site-log-icon' : theme === 'gold' ? 'text-[#d4956a]' : 'text-amber-300'}
                      theme={theme}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 5H9a2 2 0 0 0-2 2v11" />
                        <path d="M13 9H7" />
                        <path d="M15 13H7" />
                        <path d="M17 17H7" />
                        <path d="M5 5v14a2 2 0 0 0 2 2h11" />
                        <path d="M19 21h-2a2 2 0 0 1-2-2V3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
                      </svg>
                    </MenuIconTile>
                    <span className={`truncate text-xs font-semibold uppercase tracking-wide ${theme === 'gold' ? 'text-[#a97c35]' : 'text-white'}`}>
                      Dziennik budowy
                    </span>
                  </>
                ) : (
                  <MenuIconTile
                    iconClassName={theme === 'allWhite' ? 'theme-all-white-site-log-icon' : theme === 'gold' ? 'text-[#d4956a]' : 'text-amber-300'}
                    theme={theme}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 5H9a2 2 0 0 0-2 2v11" />
                      <path d="M13 9H7" />
                      <path d="M15 13H7" />
                      <path d="M17 17H7" />
                      <path d="M5 5v14a2 2 0 0 0 2 2h11" />
                      <path d="M19 21h-2a2 2 0 0 1-2-2V3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2Z" />
                    </svg>
                  </MenuIconTile>
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
