import { useMemo, useState } from 'react'
import { DIRECTORY_USERS, type DirectoryUser, type UserRole } from '../data/usersDirectory'

export type BackOfficeUserRow = DirectoryUser

const PAGE_SIZE = 10

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

function roleBadgeClass(role: UserRole): string {
  if (role === 'Admin') return 'bg-violet-100 text-violet-900 border-violet-200'
  if (role === 'Kierownik') return 'bg-amber-100 text-amber-900 border-amber-200'
  return 'bg-sky-100 text-sky-900 border-sky-200'
}

export function BackOfficeUsers() {
  const [page, setPage] = useState(1)
  const total = DIRECTORY_USERS.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const pageClamped = Math.min(page, pageCount)
  const slice = useMemo(() => {
    const start = (pageClamped - 1) * PAGE_SIZE
    return DIRECTORY_USERS.slice(start, start + PAGE_SIZE)
  }, [pageClamped])

  const fromLp = (pageClamped - 1) * PAGE_SIZE + 1

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-domesta-gray)]">Użytkownicy</h1>
        <p className="mt-1 text-sm text-gray-600">
          Lista kont z rolami (wiele ról na użytkownika). Stronicowanie co {PAGE_SIZE} wierszy.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-[880px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <th className="w-14 px-4 py-3 font-semibold">LP</th>
              <th className="px-4 py-3 font-semibold">
                Imię <span className="text-[var(--color-domesta-red)]">*</span>
              </th>
              <th className="px-4 py-3 font-semibold">
                Nazwisko <span className="text-[var(--color-domesta-red)]">*</span>
              </th>
              <th className="min-w-[200px] px-4 py-3 font-semibold">Role</th>
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
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {row.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${roleBadgeClass(role)}`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
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
        <span className="text-[var(--color-domesta-red)]">*</span> pola wymagane przy tworzeniu / edycji użytkownika (mock). Role: jeden użytkownik może mieć wiele ról (
        Admin, Kierownik, Klient).
      </p>
    </section>
  )
}
