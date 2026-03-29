import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type FilterableUserOption = {
  id: string
  name: string
}

type FilterableUserSelectProps = {
  label: string
  users: FilterableUserOption[]
  value: string
  onChange: (userId: string) => void
  /** Klasa z-index panelu (np. wyższa wewnątrz modala). */
  menuZClass?: string
}

function normalizeSearch(s: string): string {
  return s.trim().toLowerCase()
}

export function FilterableUserSelect({
  label,
  users,
  value,
  onChange,
  menuZClass = 'z-50',
}: FilterableUserSelectProps) {
  const baseId = useId()
  const listboxId = `${baseId}-listbox`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selected = users.find((u) => u.id === value)

  const filtered = useMemo(() => {
    const q = normalizeSearch(query)
    if (!q) return users
    return users.filter((u) => normalizeSearch(u.name).includes(q))
  }, [users, query])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (open) {
      queueMicrotask(() => searchInputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open])

  return (
    <div ref={containerRef} className="relative flex max-w-md flex-col gap-1 text-sm text-gray-600">
      <span id={`${baseId}-label`} className="text-sm text-gray-600">
        {label}
      </span>
      <button
        type="button"
        id={`${baseId}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={`${baseId}-label ${baseId}-trigger`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 outline-none focus:border-[var(--color-domesta-red)] focus:ring-1 focus:ring-[var(--color-domesta-red)]/30"
      >
        <span className="min-w-0 truncate">{selected?.name ?? '—'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute left-0 right-0 top-full mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${menuZClass}`}
        >
          <div className="border-b border-gray-100 p-2">
            <input
              ref={searchInputRef}
              type="search"
              role="searchbox"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj na liście…"
              autoComplete="off"
              aria-label="Filtruj użytkowników"
              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-[var(--color-domesta-red)]"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={`${baseId}-label`}
            className="max-h-52 overflow-y-auto py-1"
          >
            {filtered.map((u) => (
              <li key={u.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={u.id === value}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${u.id === value ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-800'}`}
                  onClick={() => {
                    onChange(u.id)
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  {u.name}
                </button>
              </li>
            ))}
          </ul>
          {filtered.length === 0 ? (
            <p className="border-t border-gray-100 px-3 py-2 text-sm text-gray-500">Brak pasujących wyników</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
