import { useState } from 'react'
import { AppBar } from './components/AppBar'
import { SideMenu } from './components/SideMenu'
import { MainContent } from './components/MainContent'
import { NewsContent } from './components/NewsContent'
import type { MenuId } from './data/menuItems'

function App() {
  const [menuExpanded, setMenuExpanded] = useState(false)
  const [menuCollapsed, setMenuCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState<MenuId | null>(null)
  const [showNewsOnly, setShowNewsOnly] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState('Polana Kampinowska')

  const handleMenuToggle = () => {
    setMenuExpanded((prev) => !prev)
  }

  const handleSelectSection = (id: MenuId) => {
    if (id === 'news') {
      setActiveSection('news')
      setShowNewsOnly(true)
      setMenuExpanded(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setShowNewsOnly(false)
    setActiveSection(id)
    setMenuExpanded(false)
    // Przewiń do odpowiedniej sekcji na stronie (tylko dla ekranu głównego)
    const target = document.getElementById(`section-${id}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleToggleCollapse = () => {
    setMenuCollapsed((prev) => !prev)
    setMenuExpanded(false)
  }

  return (
    <div className="min-h-screen bg-[var(--color-domesta-bg)]">
      <SideMenu
        collapsed={menuCollapsed}
        expanded={menuExpanded}
        activeId={activeSection}
        onSelect={handleSelectSection}
        onToggleCollapse={handleToggleCollapse}
        investmentName={selectedInvestment}
      />
      <div
        className={`flex min-h-screen flex-col bg-[var(--color-domesta-bg)] transition-[margin-left] duration-300 ${menuCollapsed ? 'md:ml-[72px]' : 'md:ml-[320px]'}`}
      >
        <AppBar
          onNavigateTo={handleSelectSection}
          selectedInvestment={selectedInvestment}
          onInvestmentChange={setSelectedInvestment}
        />
        {showNewsOnly ? <NewsContent sidebarCollapsed={menuCollapsed} /> : <MainContent />}
      </div>
    </div>
  )
}

export default App
