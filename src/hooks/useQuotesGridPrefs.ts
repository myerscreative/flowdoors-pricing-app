import { useCallback, useEffect, useMemo, useState } from 'react'

/** Public shape for Quotes Grid preferences */
export type SortKey =
  | 'createdAt'
  | 'updatedAt'
  | 'subtotal'
  | 'grandTotal'
  | 'salesperson'
  | 'status'
export type SortDir = 'asc' | 'desc'
export type ViewMode = 'table' | 'cards'

export type ColumnKey =
  | 'quoteId'
  | 'customer'
  | 'salesperson'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'subtotal'
  | 'grandTotal'

export type ColumnVisibility = Record<ColumnKey, boolean>

export interface QuotesGridPrefs {
  sortBy: SortKey
  sortDir: SortDir
  pageSize: number
  view: ViewMode
  searchText: string
  columns: ColumnVisibility
}

const LS_KEY = 'scenic_quotes_grid_prefs_v1'

const DEFAULT_COLUMNS: ColumnVisibility = {
  quoteId: true,
  customer: true,
  salesperson: true,
  status: true,
  createdAt: true,
  updatedAt: false,
  subtotal: true,
  grandTotal: true,
}

const DEFAULT_PREFS: QuotesGridPrefs = {
  sortBy: 'createdAt',
  sortDir: 'desc',
  pageSize: 25,
  view: 'table',
  searchText: '',
  columns: DEFAULT_COLUMNS,
}

/* ------------------------------ type guards ------------------------------ */

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isSortKey(v: unknown): v is SortKey {
  return [
    'createdAt',
    'updatedAt',
    'subtotal',
    'grandTotal',
    'salesperson',
    'status',
  ].includes(String(v))
}

function isSortDir(v: unknown): v is SortDir {
  return v === 'asc' || v === 'desc'
}

function isView(v: unknown): v is ViewMode {
  return v === 'table' || v === 'cards'
}

function isColumnVisibility(v: unknown): v is ColumnVisibility {
  if (!isObject(v)) return false
  const keys: ColumnKey[] = [
    'quoteId',
    'customer',
    'salesperson',
    'status',
    'createdAt',
    'updatedAt',
    'subtotal',
    'grandTotal',
  ]
  return keys.every(
    (k) => typeof (v as Record<string, unknown>)[k] === 'boolean'
  )
}

/* ------------------------------- persistence ----------------------------- */

function loadPrefs(): QuotesGridPrefs {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed: unknown = JSON.parse(raw)

    if (!isObject(parsed)) return DEFAULT_PREFS

    const sortBy = isSortKey(parsed.sortBy)
      ? parsed.sortBy
      : DEFAULT_PREFS.sortBy
    const sortDir = isSortDir(parsed.sortDir)
      ? parsed.sortDir
      : DEFAULT_PREFS.sortDir
    const pageSize =
      typeof parsed.pageSize === 'number' && parsed.pageSize > 0
        ? parsed.pageSize
        : DEFAULT_PREFS.pageSize
    const view = isView(parsed.view) ? parsed.view : DEFAULT_PREFS.view
    const searchText =
      typeof parsed.searchText === 'string'
        ? parsed.searchText
        : DEFAULT_PREFS.searchText
    const columns = isColumnVisibility(parsed.columns)
      ? parsed.columns
      : DEFAULT_PREFS.columns

    return { sortBy, sortDir, pageSize, view, searchText, columns }
  } catch {
    // Stay silent to avoid violating no-console policy.
    return DEFAULT_PREFS
  }
}

function savePrefs(prefs: QuotesGridPrefs): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(prefs))
  } catch {
    // Best-effort; ignore storage failures.
  }
}

/* ---------------------------------- hook --------------------------------- */

type Updater =
  | Partial<QuotesGridPrefs>
  | ((_prev: QuotesGridPrefs) => Partial<QuotesGridPrefs>)

/**
 * Hook to manage Quotes grid user preferences with safe typing and persistence.
 */
export function useQuotesGridPrefs() {
  const [prefs, setPrefs] = useState<QuotesGridPrefs>(DEFAULT_PREFS)

  // Initial load
  useEffect(() => {
    setPrefs(loadPrefs())
  }, [])

  // Derived convenience values
  const activeColumns = useMemo(() => {
    const entries = Object.entries(prefs.columns) as [ColumnKey, boolean][]
    return entries.filter(([, visible]) => visible).map(([key]) => key)
  }, [prefs.columns])

  const updatePrefs = useCallback((updater: Updater) => {
    setPrefs((prev: QuotesGridPrefs) => {
      const patch = typeof updater === 'function' ? updater(prev) : updater
      const next: QuotesGridPrefs = {
        ...prev,
        ...patch,
        // for nested objects like columns, merge shallowly if provided
        columns:
          patch && 'columns' in patch && patch.columns
            ? { ...prev.columns, ...patch.columns }
            : prev.columns,
      }
      savePrefs(next)
      return next
    })
  }, [])

  const resetPrefs = useCallback(() => {
    setPrefs(DEFAULT_PREFS)
    savePrefs(DEFAULT_PREFS)
  }, [])

  // Public API
  return {
    prefs,
    setPrefs: updatePrefs, // expose typed updater
    resetPrefs,
    activeColumns,
  }
}

export default useQuotesGridPrefs
