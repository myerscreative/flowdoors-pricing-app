import type { Timestamp } from 'firebase-admin/firestore'

/** Convert a Firestore Timestamp (or ISO string / Date) to an ISO string. */
export function tsToIso(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && value !== null) {
    const v = value as { toDate?: () => Date; seconds?: number }
    if (typeof v.toDate === 'function') return v.toDate().toISOString()
    if (typeof v.seconds === 'number')
      return new Date(v.seconds * 1000).toISOString()
  }
  return null
}

/** Convert a JS value to a Firestore-safe date or null. */
export function isoToDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export type FirestoreTs = Timestamp | Date | string | null | undefined
