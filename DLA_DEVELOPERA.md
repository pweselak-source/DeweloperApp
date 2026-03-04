# Dokumentacja dla developera – DeweloperApp

## Stack technologiczny

- **React 19** + **TypeScript**
- **Vite 7** (build)
- **Tailwind CSS 4** (style)

---

## Struktura projektu (src)

```
src/
├── App.tsx                 # Główny kontener, stan: menu, sekcja, inwestycja, news
├── main.tsx
├── index.css               # Tailwind, zmienne CSS (kolory Domesta), keyframes
├── components/
│   ├── AppBar.tsx          # Pasek górny: logo, „Twoje inwestycje”, ikony
│   ├── SideMenu.tsx        # Pasek boczny: nazwa inwestycji, lista etapów
│   ├── MainContent.tsx     # Treść główna (etapy, harmonogram, dokumenty, reklamacje, itd.)
│   └── NewsContent.tsx     # Widok Aktualności: nagłówek + 2 kafelki (Laureat, Rabat)
├── data/
│   └── menuItems.tsx       # MENU_ITEMS, typ MenuId
└── assets/                 # Obrazy (logo, zdjęcia, laureat.jfif, rabat.jfif)
```

---

## Stan aplikacji (App.tsx)

- **menuCollapsed** – pasek boczny zwinięty (wąski) / rozwinięty
- **menuExpanded** – (do ewentualnego użycia)
- **activeSection** – aktywna sekcja (MenuId)
- **showNewsOnly** – true = widok tylko Aktualności
- **selectedInvestment** – wybrana inwestycja: `'Polana Kampinowska' | 'Zielone Wzgórze' | 'Czarny Staw'`

Przekazywanie stanu:

- **SideMenu**: `collapsed`, `activeId`, `investmentName` (= selectedInvestment), `onSelect`, `onToggleCollapse`
- **AppBar**: `selectedInvestment`, `onInvestmentChange`, `onNavigateTo`
- **NewsContent**: `sidebarCollapsed` (do mniejszego paddingu przy zwiniętym pasku)
- **MainContent**: brak dodatkowych propsów

---

## Główne komponenty

### AppBar

- Logo Domesta, select **„Twoje inwestycje”** (Polana Kampinowska, Zielone Wzgórze, Czarny Staw), ikony (aktualności, zadania, szukaj, czat, menu użytkownika).
- Kolejność: Logo → Twoje inwestycje → ikony (ikony z `ml-auto`).

### SideMenu

- **Górny blok**: biały pasek, wysokość `h-14` (jak AppBar). Nazwa inwestycji: pierwsze słowo czerwone (`--color-domesta-red`), reszta ciemnoszare (`--color-domesta-gray`). Przycisk zwijania/rozwijania.
- **Lista etapów**: ikona etapu, etykieta (flex-1), ikona statusu po prawej (wyrównane w pionie).
- Szerokość: zwinięty `72px`, rozwinięty `min(320px, 85vw)`.

### NewsContent

- **Sekcja jasna**: tylko nagłówek „Aktualności” (ikona + tytuł + „Masz 2 nowe informacje”) – białe tło, zaokrąglona karta.
- **Kafelki**: dwa zdjęcia (Laureat, Odbierz swój rabat) obok siebie, `gap-1.5`. Każdy kafelek to przycisk o rozmiarze równym zdjęciu (`img`: `h-48 w-auto md:h-64`). Hover: powiększenie `scale-110`, koralowy połysk `box-shadow`. Klik = lightbox (powiększenie na cały ekran, Escape zamyka).
- **Padding**: zależny od `sidebarCollapsed` – mniejszy (`px-2 md:px-4`) przy zwiniętym pasku, większy (`px-4 md:px-6`) przy rozwiniętym.

### MainContent

- Sekcje: m.in. Podsumowanie, Harmonogram spłaty, Dokumenty, Reklamacje, Odbiór mieszkania, Liczniki, Notariusz. Sekcje mają `id="section-{id}"` do scrollowania z menu.
- Modal kalendarza odbioru mieszkania, toasty itp.

---

## Kolory i style (index.css, Tailwind)

Zmienne w `@theme` (Tailwind):

- `--color-domesta-red`: #c21820  
- `--color-domesta-coral`: #ff6f61  
- `--color-domesta-gray`: #333333  
- `--color-domesta-gray-light`: #b0b0b0  
- `--color-domesta-bg`: #f7f7f7  

Keyframes: `coral-pulse`, `slide-left`, `arrow-glow`, `run` (używane w różnych komponentach).

---

## Dane

- **menuItems.tsx**: eksport `MENU_ITEMS` (lista etapów z `id`, `label`, `status`, `icon`) oraz typ `MenuId`.
- **NewsContent**: wewnętrzna lista `ALL_NEWS_ITEMS`; do wyświetlania używane są tylko wpisy z `id === 'news1'` i `id === 'news2'` (Laureat, Rabat).

---

## Uruchomienie

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

---

## Krótki checklist dla developera

- [ ] Zmiana listy inwestycji: `AppBar.tsx` – stała `INVESTMENTS`.
- [ ] Zmiana etapów w menu: `data/menuItems.tsx` – `MENU_ITEMS`.
- [ ] Zmiana kafelków aktualności: `NewsContent.tsx` – filtr `newsItems` i/lub `ALL_NEWS_ITEMS`.
- [ ] Kolory marki: `src/index.css` – blok `@theme` oraz ewentualne klasy w komponentach używające `var(--color-domesta-*)`.
- [ ] Wysokość pasków: AppBar i górny blok SideMenu używają `h-14` – zmiana w obu miejscach dla spójności.

---

*Plik wygenerowany na potrzeby przekazania projektu developerowi. Ostatnia aktualizacja: stan kodu w repozytorium.*
