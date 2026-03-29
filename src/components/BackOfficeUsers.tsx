import { useMemo, useState } from 'react'

export type BackOfficeUserRow = {
  id: string
  firstName: string
  lastName: string
  lastLogin: string | null
  activationDate: string | null
}

const PAGE_SIZE = 10

const FIRST_NAMES = [
  'Anna',
  'Piotr',
  'Magdalena',
  'Tomasz',
  'Katarzyna',
  'Marcin',
  'Ewa',
  'Łukasz',
  'Joanna',
  'Krzysztof',
  'Agnieszka',
  'Michał',
  'Barbara',
  'Paweł',
  'Elżbieta',
  'Adam',
  'Monika',
  'Jakub',
  'Aleksandra',
  'Wojciech',
  'Justyna',
  'Dariusz',
  'Natalia',
  'Rafał',
  'Izabela',
] as const

const LAST_NAMES = [
  'Nowak',
  'Wiśniewski',
  'Zielińska',
  'Kowalczyk',
  'Wójcik',
  'Kamiński',
  'Lewandowska',
  'Zając',
  'Szymański',
  'Woźniak',
  'Dąbrowski',
  'Kozłowski',
  'Jankowski',
  'Mazur',
  'Kwiatkowski',
  'Krawczyk',
  'Piotrowski',
  'Grabowski',
  'Pawłowski',
  'Michalski',
  'Król',
  'Wieczorek',
  'Jabłoński',
  'Wróbel',
  'Nowicki',
] as const

function buildSampleUsers(): BackOfficeUserRow[] {
  const rows: BackOfficeUserRow[] = []
  for (let i = 0; i < 25; i++) {
    const lastLogin =
      i % 7 === 0 ? null : new Date(2026, 2, (i % 28) + 1, 8 + (i % 9), (i * 3) % 60, 0).toISOString()
    const activationDate = i % 5 === 0 ? null : new Date(2025, i % 12, (i % 28) + 1, 10, 0, 0).toISOString()
    rows.push({
      id: `u-${i + 1}`,
      firstName: FIRST_NAMES[i]!,
      lastName: LAST_NAMES[i]!,
      lastLogin,
      activationDate,
    })
  }
  return rows
}

const SAMPLE_USERS = buildSampleUsers()

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BackOfficeUsers() {
  const [page, setPage] = useState(1)
  const total = SAMPLE_USERS.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const pageClamped = Math.min(page, pageCount)
  const slice = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE
    return SAMPLE_USERS.slice(start, start + PAGE_SIZE)
  }, [pageClamped])

  const fromLp = (pageClamped - 1) * PAGE_SIZE + 1

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-domesta-gray)]">Użytkownicy</h1>
        <p className="mt-1 text-sm text-gray-600">Lista kont z możliwością przeglądania i stronnicowania.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <th className="w-14 px-4 py-3 font-semibold">LP</th>
              <th className="px-4 py-3 font-semibold">
                Imię <span className="text-[var(--color-domesta-red)]">*</span>
              </th>
              <th className="px-4 py-3 font-semibold">
                Nazwisko <span className="text-[var(--color-domesta-red)]">*</span>
              </th>
              <th className="px-4 py-3 font-semibold">Ostatnie logowanie</th>
              <th className="px-4 py-3 font-semibold">Data aktywacji</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {slice.map((row, i) => (
              <tr key={row.id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3 tabular-nums text-gray-600">{fromLp + i}</td>
                <td className="px-4 py-3 font-medium">{row.firstName}</td>
                <td className="px-4 py-3 font-medium">{row.lastName}</td>
                <td className="px-4 py-3 text-gray-700">{formatDateTime(row.lastLogin)}</td>
                <td className="px-4 py-3 text-gray-700">{formatDateTime(row.activationDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <p>
          Wyświetlono {(pageClamped - 1) * PAGE_SIZE + 1}–{Math.min(pageClamped * PAGE_SIZE, total)} z {total}{' '}
          rekordów
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pageClamped <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Poprzednia
          </button>
          <span className="tabular-nums text-gray-700">
            Strona {pageClamped} / {pageCount}
          </span>
          <button
            type="button"
            disabled={pageClamped >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Następna
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        <span className="text-[var(--color-domesta-red)]">*</span> pola wymagane przy tworzeniu / edycji użytkownika (mock).
      </p>
    </section>
  )
}
