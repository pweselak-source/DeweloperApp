# Cały kod źródłowy – DeweloperApp

Poniżej pełna treść plików projektu (bez node_modules i build). Obrazki w `src/assets/` trzeba skopiować osobno.

---

## index.html

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DOMESTA – Panel mieszkańca</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## package.json

```json
{"name":"deweloperapp","private":true,"version":"0.0.0","type":"module","scripts":{"dev":"vite","build":"tsc -b && vite build","lint":"eslint .","preview":"vite preview"},"dependencies":{"react":"^19.2.0","react-dom":"^19.2.0"},"devDependencies":{"@eslint/js":"^9.39.1","@tailwindcss/vite":"^4.2.1","@types/node":"^24.10.1","@types/react":"^19.2.7","@types/react-dom":"^19.2.3","@vitejs/plugin-react":"^5.1.1","autoprefixer":"^10.4.24","eslint":"^9.39.1","eslint-plugin-react-hooks":"^7.0.1","eslint-plugin-react-refresh":"^0.4.24","globals":"^16.5.0","postcss":"^8.5.6","tailwindcss":"^4.2.1","typescript":"~5.9.3","typescript-eslint":"^8.48.0","vite":"^7.3.1"}}
```

---

## vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

---

## tsconfig.json

```json
{"files":[],"references":[{"path":"./tsconfig.app.json"},{"path":"./tsconfig.node.json"}]}
```

---

## tsconfig.app.json

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

---

## src/main.tsx

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## src/index.css

```css
@import "tailwindcss";

@theme {
  --color-domesta-red: #c21820;
  --color-domesta-coral: #ff6f61;
  --color-domesta-gray: #333333;
  --color-domesta-gray-light: #b0b0b0;
  --color-domesta-bg: #f7f7f7;
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: var(--color-domesta-bg);
  color: var(--color-domesta-gray);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

#root {
  min-height: 100vh;
}

@keyframes slide-left {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}

@keyframes coral-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 111, 97, 0.0); }
  50% { transform: scale(1.03); box-shadow: 0 0 0 4px rgba(255, 111, 97, 0.25); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 111, 97, 0.0); }
}

@keyframes arrow-glow {
  0%, 100% { filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.7)) drop-shadow(0 0 8px rgba(251, 191, 36, 0.35)); transform: scale(1); }
  50% { filter: drop-shadow(0 0 8px rgba(251, 191, 36, 1)) drop-shadow(0 0 16px rgba(251, 191, 36, 0.6)); transform: scale(1.08); }
}

@keyframes run {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(2px) translateY(-2px); }
  50% { transform: translateX(4px) translateY(0); }
  75% { transform: translateX(2px) translateY(1px); }
}
```

---

## src/App.tsx

```tsx
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
```

---

## src/data/menuItems.tsx

```tsx
export type MenuId =
  | 'news'
  | 'formalities'
  | 'schedule'
  | 'siteLog'
  | 'documents'
  | 'handover'
  | 'meter'
  | 'complaints'
  | 'notary'

export type MenuStatus = 'done' | 'current' | 'future'

export interface MenuItem {
  id: MenuId
  label: string
  icon: React.ReactNode
  status: MenuStatus
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'news',
    label: 'Aktualności',
    status: 'current',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h9a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z" />
        <path d="M22 4h-9a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h9z" />
      </svg>
    ),
  },
  {
    id: 'formalities',
    label: 'Formalności początkowe',
    status: 'done',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 'schedule',
    label: 'Harmonogram spłaty',
    status: 'current',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'documents',
    label: 'Dokumenty do odbioru mieszkania',
    status: 'future',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'complaints',
    label: 'Reklamacje',
    status: 'future',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: 'handover',
    label: 'Odbiór mieszkania',
    status: 'future',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'meter',
    label: 'Zgłoszenia licznika do energii',
    status: 'future',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'notary',
    label: 'Podpisanie aktu notarialnego',
    status: 'future',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
]
```

---

## Komponenty (pełny kod w plikach)

Pełna treść komponentów jest w folderze **eksport_kodu/**:

| Plik w eksport_kodu/ | Odpowiednik w projekcie |
|----------------------|-------------------------|
| `AppBar.tsx`         | `src/components/AppBar.tsx` |
| `SideMenu.tsx`       | `src/components/SideMenu.tsx` |
| `NewsContent.tsx`    | `src/components/NewsContent.tsx` |
| `MainContent.tsx`    | `src/components/MainContent.tsx` |

Ścieżki importów w tych plikach odwołują się do `../data/` i `../assets/` – są poprawne po wklejeniu do **src/components/**.

**Zawartość eksportu:** powyżej w tym pliku: konfiguracja (package.json, vite, tsconfig), `index.html`, `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/data/menuItems.tsx`. W **eksport_kodu/** – wszystkie cztery komponenty z `src/components/`.

---

*Wygenerowano: eksport pełnego kodu dla developera.*
