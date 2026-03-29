import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type Select2Option = {
  id: number
  label: string
  sublabel?: string
}

type Select2MultiSelectProps = {
  /** Etykieta sekcji (np. nad kontrolką) */
  sectionLabel: string
  options: Select2Option[]
  selectedIds: Set<number>
  onToggle: (id: number) => void
  onSelectAll: () => void
  onClear: () => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  /** Tekst zamiast listy gdy brak opcji (np. brak budynków) */
  emptyOptionsMessage?: string
  /** Krótki opis pod kontrolką */
  hint?: string
}

export function Select2MultiSelect({
  sectionLabel,
  options,
  selectedIds,
  onToggle,
  onSelectAll,
  onClear,
  placeholder = 'Wybierz z listy…',
  searchPlaceholder = 'Szukaj…',
  disabled = false,
  emptyOptionsMessage,
  hint,
}: Select2MultiSelectProps) {
  const uid = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || (o.sublabel && o.sublabel.toLowerCase().includes(q)),
    )
  }, [options, search])

  const selectedOptions = useMemo(
    () => options.filter((o) => selectedIds.has(o.id)),
    [options, selectedIds],
  )

  const noOptions = options.length === 0
  const controlDisabled = disabled || noOptions

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--color-domesta-gray)]">{sectionLabel}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={controlDisabled || options.length === 0}
            className="text-xs text-gray-600 underline hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Zaznacz wszystkie
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={selectedIds.size === 0}
            className="text-xs text-gray-600 underline hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Wyczyść
          </button>
        </div>
      </div>

      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={uid}
          disabled={controlDisabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => !controlDisabled && setOpen((o) => !o)}
          className={`flex min-h-[42px] w-full flex-wrap items-center gap-1 rounded-lg border bg-white px-3 py-2 text-left text-sm shadow-sm transition-colors ${
            controlDisabled
              ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
              : 'cursor-pointer border-gray-300 hover:border-gray-400 focus:border-[var(--color-domesta-red)] focus:outline-none focus:ring-2 focus:ring-[var(--color-domesta-red)]/25'
          } ${open && !controlDisabled ? 'border-[var(--color-domesta-red)] ring-2 ring-[var(--color-domesta-red)]/20' : ''}`}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selectedOptions.map((o) => (
              <span
                key={o.id}
                className="inline-flex max-w-full items-center gap-1 rounded-md border border-gray-200 bg-gray-50 py-0.5 pl-2 pr-1 text-xs text-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="truncate">{o.label}</span>
                {!controlDisabled && (
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                    aria-label={`Usuń ${o.label}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggle(o.id)
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </span>
            ))
          )}
          <span className="ml-auto shrink-0 pl-1 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>

        {open && !controlDisabled && (
          <div
            className="absolute left-0 right-0 z-50 mt-1 max-h-[min(320px,50vh)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            role="listbox"
            aria-labelledby={uid}
          >
            <div className="border-b border-gray-100 p-2">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500">Brak wyników</li>
              ) : (
                filtered.map((o) => {
                  const checked = selectedIds.has(o.id)
                  return (
                    <li key={o.id} role="option" aria-selected={checked}>
                      <button
                        type="button"
                        className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                          checked ? 'bg-red-50/50' : ''
                        }`}
                        onClick={() => onToggle(o.id)}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            checked ? 'border-[var(--color-domesta-red)] bg-[var(--color-domesta-red)]' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {checked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-gray-900">{o.label}</span>
                          {o.sublabel ? <span className="block text-xs text-gray-500">{o.sublabel}</span> : null}
                        </span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}

        {noOptions && emptyOptionsMessage ? (
          <p className="mt-2 text-sm text-gray-500">{emptyOptionsMessage}</p>
        ) : null}
      </div>

      {hint ? <p className="mt-3 text-xs text-gray-500">{hint}</p> : null}
    </div>
  )
}
