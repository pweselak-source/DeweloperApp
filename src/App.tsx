import { useState } from 'react'
import { AppBar } from './components/AppBar'
import { SideMenu } from './components/SideMenu'
import { MainContent } from './components/MainContent'
import { NewsContent } from './components/NewsContent'
import type { MenuId } from './data/menuItems'

function App() {
  const [menuCollapsed, setMenuCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState<MenuId | null>(null)
  const [showNewsOnly, setShowNewsOnly] = useState(false)
  const selectedInvestment = 'Polana Kampinowska'

  const handleSelectSection = (id: MenuId) => {
    if (id === 'news') {
      setActiveSection('news')
      setShowNewsOnly(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setShowNewsOnly(false)
    setActiveSection(id)
    // Przewiń do odpowiedniej sekcji na stronie (tylko dla ekranu głównego)
    const target = document.getElementById(`section-${id}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleToggleCollapse = () => {
    setMenuCollapsed((prev) => !prev)
  }

  return (
    <div className="min-h-screen bg-[var(--color-domesta-bg)]">
      <SideMenu
        collapsed={menuCollapsed}
        activeId={activeSection}
        onSelect={handleSelectSection}
        onToggleCollapse={handleToggleCollapse}
        investmentName={selectedInvestment}
      />
      <div className="flex min-h-screen flex-col bg-[var(--color-domesta-bg)]">
        <AppBar onNavigateTo={handleSelectSection} />
        {showNewsOnly ? <NewsContent sidebarCollapsed={menuCollapsed} /> : <MainContent />}
      </div>
    </div>
  )
}

export default App
