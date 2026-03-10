import { useState, useEffect } from 'react'
import { AppBar } from './components/AppBar'
import { SideMenu } from './components/SideMenu'
import { MainContent } from './components/MainContent'
import { NewsContent } from './components/NewsContent'
import type { MenuId } from './data/menuItems'

const THEME_STORAGE_KEY = 'app-theme'
export type AppTheme = 'halfBlack' | 'allBlack' | 'domestaColors' | 'allWhite'

function App() {
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null
      if (saved === 'allBlack' || saved === 'domestaColors' || saved === 'allWhite') return saved
      return 'halfBlack'
    } catch {
      return 'halfBlack'
    }
  })
  const [menuCollapsed, setMenuCollapsed] = useState(true)
  const [activeSection, setActiveSection] = useState<MenuId | null>(null)
  const [showNewsOnly, setShowNewsOnly] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState('Polana Kampinowska')
  const [selectedApartment, setSelectedApartment] = useState('Uranowa 21A/3')

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme)
  }

  const handleSelectSection = (id: MenuId) => {
    if (id === 'news') {
      setActiveSection('news')
      setShowNewsOnly(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setShowNewsOnly(false)
    setActiveSection(id)
    setMenuCollapsed(false)
    // Przewiń do odpowiedniej sekcji na stronie (tylko dla ekranu głównego)
    const target = document.getElementById(`section-${id}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleToggleCollapse = () => {
    setMenuCollapsed((prev) => !prev)
  }

  const handleGoHome = () => {
    setShowNewsOnly(false)
    setActiveSection(null)
    setMenuCollapsed(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const outerBackgroundClass =
    theme === 'allBlack'
      ? 'theme-all-black bg-[#1a1a1a]'
      : theme === 'halfBlack'
        ? 'bg-[radial-gradient(circle_at_top,_#aaaaaa,_#666666,_#333333)]'
        : 'bg-[var(--color-domesta-bg)]'

  const innerBackgroundClass =
    theme === 'allBlack'
      ? 'bg-[#1a1a1a]'
      : theme === 'halfBlack'
        ? 'bg-[radial-gradient(circle_at_top,_#aaaaaa,_#666666,_#333333)]'
        : 'bg-[var(--color-domesta-bg)]'

  return (
    <div className={`min-h-screen ${outerBackgroundClass}`}>
      <div className={`flex min-h-screen flex-col ${innerBackgroundClass}`}>
        <AppBar onNavigateTo={handleSelectSection} onThemeChange={handleThemeChange} theme={theme} onGoHome={handleGoHome} />
        {!showNewsOnly && (
          <div className="px-4 pt-3 md:px-6">
            <SideMenu
              collapsed={menuCollapsed}
              activeId={activeSection}
              onSelect={handleSelectSection}
              onToggleCollapse={handleToggleCollapse}
              investmentName={selectedInvestment}
              apartmentLabel={selectedApartment}
              onInvestmentChange={setSelectedInvestment}
              onApartmentChange={setSelectedApartment}
              theme={theme}
            />
          </div>
        )}
        {showNewsOnly ? <NewsContent sidebarCollapsed={menuCollapsed} /> : <MainContent activeSectionId={activeSection} />}
      </div>
    </div>
  )
}

export default App
