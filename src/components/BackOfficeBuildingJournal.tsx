import { Fragment, useEffect, useMemo, useState } from 'react'
import { Select2MultiSelect } from './Select2MultiSelect'
import dom1 from '../assets/dom1.jpg'
import dom2 from '../assets/dom2.jpg'
import dom3 from '../assets/dom3.jpg'

type InvestmentLite = { id: number; name: string }
type BuildingLite = { id: number; investmentId: number; address: string }

export type BuildingJournalPost = {
  id: number
  investmentId: number
  buildingId: number | null
  content: string
  createdAt: string
  authorDisplay: string
  imageSrcs: string[]
}

/** Te same treści co w sekcji „Dziennik budowy” na stronie głównej (MainContent) + przypisania do inwestycji/budynków */
const JOURNAL_POSTS: BuildingJournalPost[] = [
  {
    id: 1,
    investmentId: 1,
    buildingId: 1,
    content:
      'Na budowie zakończono prace konstrukcyjne głównej bryły budynku oraz montaż większości okien. Trwają przygotowania do prac elewacyjnych.',
    createdAt: '2025-11-15T10:30:00',
    authorDisplay: 'Anna Nowak (Admin)',
    imageSrcs: [dom1, dom2, dom3],
  },
  {
    id: 2,
    investmentId: 1,
    buildingId: 2,
    content:
      'Dzisiaj na budowie ekipy kontynuują prace wykończeniowe wewnątrz klatek schodowych, prowadzone są montaże instalacji elektrycznej i sanitarnych pionów.',
    createdAt: '2025-12-08T14:00:00',
    authorDisplay: 'Piotr Zieliński (Admin)',
    imageSrcs: [dom2, dom3, dom1],
  },
  {
    id: 3,
    investmentId: 2,
    buildingId: 3,
    content:
      'W tym miesiącu skupiamy się na zagospodarowaniu terenu: powstają chodniki, miejsca postojowe oraz pierwsze nasadzenia zieleni wokół budynku.',
    createdAt: '2026-01-20T09:15:00',
    authorDisplay: 'Anna Nowak (Admin)',
    imageSrcs: [dom3, dom1, dom2],
  },
  {
    id: 4,
    investmentId: 3,
    buildingId: null,
    content:
      'Komunikat ogólny dla inwestycji: planowany przegląd placu budowy w przyszłym tygodniu. Prosimy o stosowanie się do oznakowania BHP.',
    createdAt: '2026-02-01T11:00:00',
    authorDisplay: 'Marek Wiśniewski (Admin)',
    imageSrcs: [dom1],
  },
]

function formatJournalDateTime(iso: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function excerpt(text: string, max: number) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

function filterJournalPosts(
  posts: BuildingJournalPost[],
  selectedInvestmentIds: Set<number>,
  selectedBuildingIds: Set<number>,
  buildings: BuildingLite[],
): BuildingJournalPost[] {
  if (selectedInvestmentIds.size === 0) return []
  const buildingsInScope = buildings.filter((b) => selectedInvestmentIds.has(b.investmentId))
  const inScopeIds = new Set(buildingsInScope.map((b) => b.id))
  const picked = [...selectedBuildingIds].filter((id) => inScopeIds.has(id))
  const effectiveBuildingIds = picked.length > 0 ? new Set(picked) : inScopeIds

  return posts.filter((p) => {
    if (!selectedInvestmentIds.has(p.investmentId)) return false
    if (p.buildingId === null) return true
    return effectiveBuildingIds.has(p.buildingId)
  })
}

type BackOfficeBuildingJournalProps = {
  investments: InvestmentLite[]
  buildings: BuildingLite[]
}

export function BackOfficeBuildingJournal({ investments, buildings }: BackOfficeBuildingJournalProps) {
  const [selectedInvestmentIds, setSelectedInvestmentIds] = useState<Set<number>>(() => new Set(investments.map((i) => i.id)))
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<Set<number>>(() => new Set(buildings.map((b) => b.id)))
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null)

  useEffect(() => {
    setSelectedBuildingIds((prev) => {
      const allowed = new Set(buildings.filter((b) => selectedInvestmentIds.has(b.investmentId)).map((b) => b.id))
      const next = new Set<number>()
      for (const id of prev) {
        if (allowed.has(id)) next.add(id)
      }
      return next
    })
  }, [selectedInvestmentIds, buildings])

  const buildingsInScope = useMemo(
    () => buildings.filter((b) => selectedInvestmentIds.has(b.investmentId)),
    [buildings, selectedInvestmentIds],
  )

  const filteredPosts = useMemo(
    () =>
      [...filterJournalPosts(JOURNAL_POSTS, selectedInvestmentIds, selectedBuildingIds, buildings)].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [selectedInvestmentIds, selectedBuildingIds, buildings],
  )

  const toggleInvestment = (id: number) => {
    setSelectedInvestmentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleBuilding = (id: number) => {
    setSelectedBuildingIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllInvestments = () => setSelectedInvestmentIds(new Set(investments.map((i) => i.id)))
  const clearInvestments = () => setSelectedInvestmentIds(new Set())
  const selectAllBuildingsInScope = () => setSelectedBuildingIds(new Set(buildingsInScope.map((b) => b.id)))
  const clearBuildings = () => setSelectedBuildingIds(new Set())

  const investmentOptions = useMemo(
    () => investments.map((i) => ({ id: i.id, label: i.name })),
    [investments],
  )

  const buildingOptions = useMemo(
    () =>
      buildingsInScope.map((b) => ({
        id: b.id,
        label: b.address,
        sublabel: investments.find((i) => i.id === b.investmentId)?.name ?? '',
      })),
    [buildingsInScope, investments],
  )

  const buildingFilterEmptyMessage =
    selectedInvestmentIds.size === 0
      ? 'Wybierz co najmniej jedną inwestycję, aby filtrować budynki.'
      : buildingsInScope.length === 0
        ? 'Brak budynków dla zaznaczonych inwestycji.'
        : undefined

  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-[var(--color-domesta-gray)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="14" rx="2" />
            <path d="M6 8h4M6 12h8M6 16h5" />
            <circle cx="16" cy="8" r="2" />
          </svg>
        </span>
        <h1 className="text-3xl font-bold text-[var(--color-domesta-gray)]">Dziennik budowy</h1>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Select2MultiSelect
          sectionLabel="Inwestycje"
          options={investmentOptions}
          selectedIds={selectedInvestmentIds}
          onToggle={toggleInvestment}
          onSelectAll={selectAllInvestments}
          onClear={clearInvestments}
          placeholder="Wybierz inwestycje…"
        />
        <Select2MultiSelect
          sectionLabel="Budynek"
          options={buildingOptions}
          selectedIds={selectedBuildingIds}
          onToggle={toggleBuilding}
          onSelectAll={selectAllBuildingsInScope}
          onClear={clearBuildings}
          placeholder="Wybierz budynki…"
          disabled={selectedInvestmentIds.size === 0}
          emptyOptionsMessage={buildingFilterEmptyMessage}
          hint="Przy pustym zaznaczeniu budynków uwzględniane są wszystkie budynki w wybranych inwestycjach. Wpisy bez przypisanego budynku są widoczne przy dowolnym filtrze inwestycji."
        />
      </div>

      {selectedInvestmentIds.size === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-amber-200 bg-amber-50/50 text-sm text-amber-900">
          Zaznacz co najmniej jedną inwestycję, aby zobaczyć wpisy.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-3 font-semibold">Lp</th>
                  <th className="px-3 py-3 font-semibold">
                    Inwestycja <span className="text-[var(--color-domesta-red)]">*</span>
                  </th>
                  <th className="px-3 py-3 font-semibold">Budynek</th>
                  <th className="px-3 py-3 font-semibold">Opis</th>
                  <th className="px-3 py-3 font-semibold">Stworzono</th>
                  <th className="px-3 py-3 font-semibold">Stworzył</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredPosts.map((post, index) => {
                  const inv = investments.find((i) => i.id === post.investmentId)
                  const b = post.buildingId !== null ? buildings.find((x) => x.id === post.buildingId) : null
                  const open = expandedPostId === post.id
                  return (
                    <Fragment key={post.id}>
                      <tr
                        className={`cursor-pointer transition-colors ${open ? 'bg-amber-50/70' : 'hover:bg-gray-50'}`}
                        onClick={() => setExpandedPostId((id) => (id === post.id ? null : post.id))}
                      >
                        <td className="px-3 py-3 tabular-nums text-gray-600">{index + 1}</td>
                        <td className="px-3 py-3 font-medium">{inv?.name ?? '—'}</td>
                        <td className="px-3 py-3 text-gray-600">{b?.address ?? '—'}</td>
                        <td className="max-w-[min(24rem,40vw)] px-3 py-3 text-gray-800" title={post.content}>
                          {excerpt(post.content, 50)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-gray-600">{formatJournalDateTime(post.createdAt)}</td>
                        <td className="px-3 py-3 text-gray-800">{post.authorDisplay}</td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={6} className="border-t border-amber-100 bg-amber-50/40 px-4 py-5">
                            <p className="text-sm leading-relaxed text-gray-800">{post.content}</p>
                            {post.imageSrcs.length > 0 && (
                              <div className="mt-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Załączone grafiki</p>
                                <div className="flex flex-wrap gap-3">
                                  {post.imageSrcs.map((src, i) => (
                                    <a
                                      key={`${post.id}-img-${i}`}
                                      href={src}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <img src={src} alt="" className="h-24 w-32 object-cover sm:h-28 sm:w-40" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredPosts.length === 0 && (
            <p className="text-center text-sm text-gray-500">Brak wpisów dla wybranych filtrów.</p>
          )}
        </div>
      )}
    </section>
  )
}
