import { useState, useEffect } from 'react'
import { MENU_ITEMS } from '../data/menuItems'
import dom1 from '../assets/dom1.jpg'
import dom2 from '../assets/dom2.jpg'
import dom3 from '../assets/dom3.jpg'
import laureatImg from '../assets/laureat.jfif'
import rabatImg from '../assets/rabat.jfif'

const sectionBlockClass = 'rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden'

const ALL_NEWS_ITEMS = [
  {
    id: 'news1',
    title: 'Domesta laureatem rankingu Forbes',
    date: '24.02.2026',
    tag: 'Nagroda',
    image: laureatImg,
    imageAlt: 'Grafika z wyróżnieniem w rankingu Forbes',
    description: (
      <div className="mt-1 space-y-2 text-[11px] text-gray-600">
        <p>
          🏆 Jesteśmy dumni, że Domesta została wyróżniona w prestiżowym rankingu <strong>Diamenty Forbes 2026</strong>! 
          To dla nas ogromne wyróżnienie i potwierdzenie, że nasza praca na rzecz klientów jest doceniana.
        </p>
        <p>
          💎 Znaleźliśmy się w gronie <strong>najszybciej rozwijających się firm w Polsce</strong>. 
          Dziękujemy wszystkim naszym Klientom za zaufanie i współpracę – bez Was ten sukces byłby niemożliwy!
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>Wysoka jakość realizowanych inwestycji</li>
          <li>Terminowość oddawania mieszkań</li>
          <li>Prozachodnie podejście do obsługi klienta</li>
          <li>Rozwój firmy w zgodzie z ekologią i zrównoważonym budownictwem</li>
        </ul>
        <p>
          🎯 Zapraszamy do współpracy – razem budujemy przyszłość! 
          Skontaktuj się z nami, jeśli szukasz mieszkania marzeń. 🌟
        </p>
      </div>
    ),
  },
  {
    id: 'news2',
    title: 'Odbierz swój rabat dla klienta',
    date: '20.02.2026',
    tag: 'Oferta',
    image: rabatImg,
    imageAlt: 'Klient odbierający voucher rabatowy',
    description: (
      <div className="mt-1 space-y-2 text-[11px] text-gray-600">
        <p>
          🎁 Dla naszych obecnych Klientów przygotowaliśmy <strong>specjalny pakiet rabatowy</strong>! 
          Jako podziękowanie za wybór Domesta możesz skorzystać z wyjątkowych zniżek.
        </p>
        <p>
          ✨ Co dokładnie możesz odbierć:
        </p>
        <ul className="list-disc space-y-1 pl-4">
          <li>💰 Rabat na wykończenie mieszkania (materiały i usługi u wybranych partnerów)</li>
          <li>🅿️ Zniżka na miejsce postojowe w Twojej inwestycji</li>
          <li>🔧 Dopłata do pakietu SMART HOME – steruj domem jednym kliknięciem</li>
          <li>📦 Voucher na zakupy w salonie meblowym – dopasuj wystrój do stylu</li>
        </ul>
        <p>
          📲 Szczegóły oferty znajdziesz w swoim panelu klienta. 
          Wystarczy zalogować się i przejść do sekcji „Moje rabaty”. 
          Promocja ważna do końca kwartału – nie przegap! ⏰
        </p>
        <p>
          ❓ Masz pytania? Skontaktuj się z opiekunem klienta – chętnie pomożemy! 🙋‍♀️
        </p>
      </div>
    ),
  },
  {
    id: 'news3',
    title: 'Program poleceń – zaproś znajomych',
    date: '15.02.2026',
    tag: 'Polecenia',
    image: dom3,
    imageAlt: 'Znajomi omawiający zakup mieszkania',
    description:
      'Poleć inwestycję znajomym i odbierz dodatkowe korzyści po podpisaniu przez nich umowy. Premia może zostać wykorzystana na pakiet wykończeniowy lub doposażenie mieszkania.',
  },
  {
    id: 'news4',
    title: 'Webinar: Jak przygotować się do odbioru mieszkania',
    date: '08.02.2026',
    tag: 'Wydarzenie',
    image: dom1,
    imageAlt: 'Wideokonferencja z doradcą Domesta',
    description:
      'Zapraszamy na bezpłatny webinar online z naszym ekspertem, który opowie krok po kroku, jak przygotować się do odbioru mieszkania i na co zwrócić uwagę.',
  },
  {
    id: 'news5',
    title: 'Poradnik kredytowy dla kupujących',
    date: '01.02.2026',
    tag: 'Poradnik',
    image: dom2,
    imageAlt: 'Dokumenty kredytowe i kalkulator',
    description:
      'Przygotowaliśmy praktyczny przewodnik po aktualnych ofertach kredytów hipotecznych i wymaganych dokumentach – dostępny w Twoim panelu klienta.',
  },
  {
    id: 'news6',
    title: 'Poradnik podatkowy – ulga mieszkaniowa',
    date: '25.01.2026',
    tag: 'Poradnik',
    image: dom3,
    imageAlt: 'Rozliczenie podatkowe związane z zakupem mieszkania',
    description:
      'Dowiedz się, jakie możliwości daje ulga mieszkaniowa i w jaki sposób prawidłowo rozliczyć zakup mieszkania w zeznaniu podatkowym.',
  },
  {
    id: 'news7',
    title: 'Nowy showroom Domesta',
    date: '18.01.2026',
    tag: 'Showroom',
    image: dom1,
    imageAlt: 'Nowoczesny showroom z aranżacjami wnętrz',
    description:
      'Otworzyliśmy nowy showroom z przykładowymi aranżacjami kuchni, salonów i łazienek. Umów spotkanie z doradcą i zobacz materiały na żywo.',
  },
  {
    id: 'news8',
    title: 'Pakiet SMART HOME w promocyjnej cenie',
    date: '10.01.2026',
    tag: 'Oferta',
    image: dom2,
    imageAlt: 'Panel sterowania inteligentnym mieszkaniem',
    description:
      'Dla wybranych lokali przygotowaliśmy specjalny pakiet SMART HOME obejmujący sterowanie oświetleniem, ogrzewaniem i roletami – w niższej cenie dla obecnych klientów.',
  },
  {
    id: 'news9',
    title: 'Konkurs dla przyszłych mieszkańców',
    date: '03.01.2026',
    tag: 'Konkurs',
    image: dom3,
    imageAlt: 'Nagrody w konkursie dla klientów',
    description:
      'Weź udział w konkursie na najlepszą koncepcję aranżacji balkonu lub tarasu i wygraj voucher na zakupy w sklepie wnętrzarskim.',
  },
  {
    id: 'news10',
    title: 'Newsletter Domesta – bądź na bieżąco',
    date: '20.12.2025',
    tag: 'Informacja',
    image: dom1,
    imageAlt: 'Ekran komputera z newsletterem',
    description:
      'Zapisz się do newslettera Domesta, aby jako pierwszy otrzymywać informacje o nowych inwestycjach, promocjach i wydarzeniach dla klientów.',
  },
  {
    id: 'news11',
    title: 'Zmiana regulaminu promocji dla klientów',
    date: '15.12.2025',
    tag: 'Informacja',
    image: dom2,
    imageAlt: 'Dokument z regulaminem promocji',
    description:
      'Zaktualizowaliśmy regulamin promocji dostępnych dla klientów Domesta. Prosimy o zapoznanie się z najważniejszymi zmianami w panelu klienta.',
  },
  {
    id: 'news12',
    title: 'Aplikacja mobilna Domesta już dostępna',
    date: '05.12.2025',
    tag: 'Nowość',
    image: dom3,
    imageAlt: 'Ekran smartfona z aplikacją Domesta',
    description:
      'Pobierz aplikację mobilną Domesta, aby wygodnie sprawdzać status płatności, dokumenty oraz aktualności dotyczące Twojego mieszkania.',
  },
]

/** W aktualnościach pokazujemy tylko Laureat i Odbierz swój rabat. */
const newsItems = ALL_NEWS_ITEMS.filter((item) => item.id === 'news1' || item.id === 'news2')

interface NewsContentProps {
  sidebarCollapsed?: boolean
}

export function NewsContent({ sidebarCollapsed = false }: NewsContentProps) {
  const newsItem = MENU_ITEMS.find((m) => m.id === 'news')
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalImage(null)
    }
    if (modalImage) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [modalImage])

  return (
    <main
      className={`flex flex-1 flex-col gap-0 py-4 md:py-6 ${sidebarCollapsed ? 'px-2 md:px-4' : 'px-4 md:px-6'}`}
    >
      {/* Jasna sekcja – tylko nagłówek „Aktualności” */}
      <section className={sectionBlockClass}>
        <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-3">
          <span className="shrink-0 [&_svg]:h-12 [&_svg]:w-12 text-slate-600">
            {newsItem?.icon}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-domesta-gray)]">
              Aktualności
            </h1>
            <p className="mt-1 text-[11px] text-blue-600">
              Masz <span className="font-semibold text-[var(--color-domesta-coral)]">2 nowe</span> informacje
            </p>
          </div>
        </div>
      </section>

      {/* Kafle – przycisk ma ten sam rozmiar co zdjęcie (obrazek określa wymiary) */}
      <div className="mt-3 flex gap-1.5">
        {newsItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setModalImage({ src: item.image, alt: item.imageAlt })}
            className="group relative z-0 shrink-0 cursor-pointer overflow-visible p-0 transition-[z-index] duration-300 ease-out hover:z-10 focus:outline-none"
            title={item.title}
          >
            <img
              src={item.image}
              alt={item.imageAlt}
              className="block h-48 w-auto md:h-64 will-change-transform transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-[0_0_28px_rgba(255,111,97,0.55)]"
            />
          </button>
        ))}
      </div>

      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60 p-4"
          onClick={() => setModalImage(null)}
          aria-label="Zamknij podgląd zdjęcia"
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-lg transition-colors hover:bg-white"
            onClick={(e) => {
              e.stopPropagation()
              setModalImage(null)
            }}
            aria-label="Zamknij"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={modalImage.src}
            alt={modalImage.alt}
            className="max-h-[90vh] max-w-full cursor-default object-contain"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </div>
      )}
    </main>
  )
}

