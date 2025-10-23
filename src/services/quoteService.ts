'use client'

// Type-only imports for Firebase typings
import type {
  QueryDocumentSnapshot,
  DocumentData,
  Transaction,
  Firestore,
} from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'
import { z } from 'zod'

/** Accept Firestore Timestamp | Date | string | number and normalize to Date|null */
const FireDateZ = z.any().transform((v) => {
  try {
    if (v && typeof v.toDate === 'function') return v.toDate() as Date
    if (v instanceof Date) return v as Date

    if (typeof v === 'string' || typeof v === 'number')
      return new Date(v as any)
  } catch {
    // intentionally empty
  }
  return null as Date | null
})

const CustomerZ = z.object({
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  zipCode: z.string().optional().default(''),
  referralCode: z.string().optional().default(''),
  company: z.string().optional().default(''),
  customerType: z.string().optional().default(''),
  timeline: z.string().optional().default(''),
  heardVia: z.array(z.string()).optional().default([]),
})

const TotalsZ = z.object({
  subtotal: z.number().optional().default(0),
  grandTotal: z.number().optional().default(0),
  installationCost: z.number().optional().default(0),
  deliveryCost: z.number().optional().default(0),
  tax: z.number().optional().default(0),
})

const FireQuoteDocZ = z
  .object({
    /** Some docs use quote_number, some use quoteId — we accept either */
    quote_number: z.union([z.string(), z.number()]).optional(),
    quoteId: z.string().optional(),

    status: z.string().optional().default('New'),
    customer: CustomerZ.optional().default({}),
    totals: TotalsZ.optional().default({}),

    salesperson_id: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),

    createdAt: FireDateZ.optional().nullable(),
    updatedAt: FireDateZ.optional().nullable(),

    // allow other fields to exist without breaking parsing
  })
  .passthrough()

/** Flat shape the Admin UI expects */
export type AdminQuote = {
  id: string
  quoteNumber: string
  status: string

  firstName: string
  lastName: string
  email: string
  phone?: string
  zipCode?: string

  quoteAmount: number // derived from totals.grandTotal || totals.subtotal
  salespersonId?: string
  tags: string[]

  createdAt?: Date | null
  updatedAt?: Date | null

  /** raw doc for debugging (optional) */
  _raw?: unknown
}

/** Safely map a Firestore doc to the flat Admin UI shape */
export function mapFireToAdminQuote(
  docId: string,
  raw: unknown
): AdminQuote | null {
  const parsed = FireQuoteDocZ.safeParse(raw)
  if (!parsed.success) {
    console.warn('Skipping malformed quote', {
      docId,
      issues: parsed.error.issues,
    })
    return null
  }
  const q = parsed.data

  const quoteNumber = String(q.quote_number ?? q.quoteId ?? docId)
  const totals = q.totals ?? {}
  const quoteAmount =
    typeof totals.grandTotal === 'number' && totals.grandTotal > 0
      ? totals.grandTotal
      : (totals.subtotal ?? 0)

  const c = q.customer ?? {}

  return {
    id: docId,
    quoteNumber,
    status: q.status ?? 'New',

    firstName: c.firstName ?? '',
    lastName: c.lastName ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    zipCode: c.zipCode ?? '',

    quoteAmount: Number.isFinite(quoteAmount) ? quoteAmount : 0,
    salespersonId: q.salesperson_id,
    tags: q.tags ?? [],

    createdAt: (q.createdAt as Date | null) ?? null,
    updatedAt: (q.updatedAt as Date | null) ?? null,

    _raw: raw, // handy for debugging
  }
}

// Helper module-type aliases
type FS = typeof import('firebase/firestore')
type ST = typeof import('firebase/storage')

// Dynamic imports to prevent SSR issues (typed)
let db: Firestore
let storage: FirebaseStorage

// Firestore function refs
let collection: FS['collection']
let addDoc: FS['addDoc']
let getDocs: FS['getDocs']
let doc: FS['doc']
let getDoc: FS['getDoc']
let updateDoc: FS['updateDoc']
let arrayUnion: FS['arrayUnion']
let serverTimestamp: FS['serverTimestamp']
let query: FS['query']
let orderBy: FS['orderBy']
let deleteDoc: FS['deleteDoc']
let setDoc: FS['setDoc']
let runTransaction: FS['runTransaction']
let where: FS['where']
let startAt: FS['startAt']
let endAt: FS['endAt']
let limit: FS['limit']
let startAfter: FS['startAfter']

// Storage function refs
let ref: ST['ref']
let uploadBytes: ST['uploadBytes']
let getDownloadURL: ST['getDownloadURL']

// Initialize Firebase imports dynamically
async function initFirebase() {
  const firebase = await import('@/lib/firebaseClient')
  const firestore = await import('firebase/firestore')
  const firebaseStorage = await import('firebase/storage')

  db = firebase.db
  storage = firebase.storage
  collection = firestore.collection
  addDoc = firestore.addDoc
  getDocs = firestore.getDocs
  doc = firestore.doc
  getDoc = firestore.getDoc
  updateDoc = firestore.updateDoc
  arrayUnion = firestore.arrayUnion
  serverTimestamp = firestore.serverTimestamp
  query = firestore.query
  orderBy = firestore.orderBy
  deleteDoc = firestore.deleteDoc
  setDoc = firestore.setDoc
  runTransaction = firestore.runTransaction
  where = firestore.where
  startAt = firestore.startAt
  endAt = firestore.endAt
  limit = firestore.limit
  startAfter = firestore.startAfter
  ref = firebaseStorage.ref
  uploadBytes = firebaseStorage.uploadBytes
  getDownloadURL = firebaseStorage.getDownloadURL
}

function requireDb(): Firestore {
  if (!db)
    throw new Error(
      'Firestore not initialized. Ensure initFirebase() ran in a client component.'
    )
  return db as Firestore
}
function requireStorage(): FirebaseStorage {
  if (!storage)
    throw new Error(
      'Firebase Storage not initialized. Ensure initFirebase() ran.'
    )
  return storage as FirebaseStorage
}

import { kanbanService } from './kanbanService'
import { getSalespersonById } from '@/services/salesService'

// Canonical types
import type { QuoteNote as Note, QuoteTask as Task } from '@/types/quote'
import type { Quote as QuoteContextState } from '@/lib/types'

/* ========================= Local Types & Helpers ========================= */

interface QuoteToSave extends QuoteContextState {
  quoteId: string
}

export type Attachment = {
  id: string
  name: string
  url: string
  size: number
  contentType: string
  uploadedAt: Date
  uploadedBy: string
}

type FireTimestampLike =
  | Date
  | string
  | number
  | { toDate?: () => Date }
  | null
  | undefined

type FireNoteDoc = {
  id?: string
  content?: string
  timestamp?: FireTimestampLike
  author?: string
}

type FireTaskDoc = {
  id?: string
  content?: string
  dueDate?: FireTimestampLike
  completed?: boolean
}

type FireAttachmentDoc = {
  id?: string
  name?: string
  url?: string
  size?: number
  contentType?: string
  uploadedAt?: FireTimestampLike
  uploadedBy?: string
}

type FireTotals = {
  subtotal?: number
  grandTotal?: number
  installationCost?: number
  deliveryCost?: number
  screens?: number
  crating?: number
  tax?: number
  tradeDiscount?: number
  tradeDiscountType?: 'amount' | 'percent'
  tradeDiscountPercent?: number
  tradeDiscounts?: { type: 'amount' | 'percent'; value: number }[]
}

type FireCustomer = {
  firstName?: string
  lastName?: string
  customerType?: string
  company?: string
  phone?: string
  zipCode?: string
  email?: string
  timeline?: string
  heardVia?: string[]
  referralCode?: string
}

type FireQuoteDoc = {
  quote_number?: string
  quoteId?: string
  status?: string
  pipelineStage?: string
  stageDates?: Record<string, FireTimestampLike>
  tags?: string[]
  totals?: FireTotals
  customer?: FireCustomer
  createdAt?: FireTimestampLike
  updatedAt?: FireTimestampLike
  salesperson_id?: string
  last_modified_by?: string
  items?: unknown[]
  notes?: FireNoteDoc[]
  tasks?: FireTaskDoc[]
  followUpDate?: FireTimestampLike
  attachments?: FireAttachmentDoc[]

  // NEW: top-level referral fields for admin/query convenience
  referralCodeCustomer?: string
  referralCodeSalesperson?: string

  // Attribution fields (camelCase for Firestore)
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  gclid?: string
  gbraid?: string
  wbraid?: string
  fbclid?: string
  fbc?: string
  fbp?: string
  landingPageUrl?: string
  referrer?: string
  firstTouchTs?: string
  lastTouchTs?: string
}

/** Safely coerce Firebase timestamp-ish values into Date */
const toDateSafe = (v: FireTimestampLike): Date | null => {
  if (!v) return null
  if (v instanceof Date) return v
  if (typeof v === 'number') return new Date(v)
  if (typeof v === 'string') {
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof v === 'object' && typeof v.toDate === 'function') {
    try {
      return v.toDate()
    } catch {
      return null
    }
  }
  return null
}

const isFiniteNumber = (x: unknown): x is number =>
  typeof x === 'number' && Number.isFinite(x)
const asString = (v: unknown): string => (v == null ? '' : String(v))

/**
 * Resolve a passed id which may be either:
 *  - a Firestore document id, or
 *  - a human quote number like "NYBL-1042" / "QUOTE-1001".
 * Returns the Firestore document id, or null if not found.
 */
async function resolveQuoteDocId(rawId: string): Promise<string | null> {
  await initFirebase()

  const trimmed = String(rawId || '').trim()
  if (!trimmed) return null

  // Heuristic: Firestore auto-ids are typically 20 chars+ mixed charset, human numbers contain '-'
  const looksLikeHuman = trimmed.includes('-') || trimmed.length < 18

  if (!looksLikeHuman) {
    // Try as doc id directly
    const asRef = doc(requireDb(), 'quotes', trimmed)
    const snap = await getDoc(asRef)
    if (snap.exists()) return trimmed
    // fallthrough to try lookup by quote_number
  }

  // Lookup by quote_number
  const qRef = query(
    collection(requireDb(), 'quotes'),
    where('quote_number', '==', trimmed),
    limit(1)
  )
  const snap = await getDocs(qRef)
  if (!snap.empty) return snap.docs[0].id

  return null
}

/* =============================== Services =============================== */

// Get attribution data from client-side storage
async function getAttributionData() {
  if (typeof window === 'undefined') return {}

  try {
    const { getStoredAttribution } = await import('@/lib/marketing/attribution')
    const attribution = getStoredAttribution()
    if (!attribution) return {}

    // Convert snake_case to camelCase for Firestore
    const mapped = {
      utmSource: attribution.utm_source,
      utmMedium: attribution.utm_medium,
      utmCampaign: attribution.utm_campaign,
      utmContent: attribution.utm_content,
      utmTerm: attribution.utm_term,
      gclid: attribution.gclid,
      gbraid: attribution.gbraid,
      wbraid: attribution.wbraid,
      fbclid: attribution.fbclid,
      fbc: attribution.fbc,
      fbp: attribution.fbp,
      landingPageUrl: attribution.landing_page_url,
      referrer: attribution.referrer,
      firstTouchTs: attribution.first_touch_ts,
      lastTouchTs: attribution.last_touch_ts,
    } as Record<string, unknown>

    Object.keys(mapped).forEach((k) => {
      if (mapped[k] === undefined) delete mapped[k]
    })

    return mapped
  } catch (error) {
    console.warn('Failed to get attribution data:', error)
    return {}
  }
}

export async function addQuote(quoteData: QuoteToSave): Promise<string> {
  try {
    // Initialize Firebase
    await initFirebase()

    const location_code = 'SD'
    // Prefer logged-in sales rep identity when present (set by Google sign-in)
    let salesperson_id = 'SP-ADMIN-WEB'
    let salesRepId: string | null = null
    let salesRepPrefix: string | null = null

    if (typeof window !== 'undefined') {
      try {
        const repName = localStorage.getItem('salesRepName')
        const repId = localStorage.getItem('salesRepId')
        if (repName && repName.trim().length > 0) {
          salesperson_id = repName.trim()
        }
        if (repId && repId.trim().length > 0) {
          salesRepId = repId.trim()
          const sp = await getSalespersonById(salesRepId)
          // Narrow unknown
          const prefixMaybe = (sp as unknown as { prefix?: unknown })?.prefix
          salesRepPrefix = typeof prefixMaybe === 'string' ? prefixMaybe : null
        }
      } catch (_e) {
        console.warn(
          'addQuote: unable to read sales rep from localStorage:',
          _e
        )
      }
    }

    // Determine prefix
    // - If no salesperson assigned, use special prefix "QUOTE"
    // - Otherwise enforce a 4-letter uppercase prefix for reps
    let cleanedPrefix: string
    if (!salesRepId || !salesRepPrefix) {
      cleanedPrefix = 'QUOTE' // special-case online/unassigned quotes
    } else {
      cleanedPrefix = String(salesRepPrefix)
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .padEnd(4, 'X')
        .slice(0, 4)
    }

    // Firestore-backed counter per prefix starting at 1000
    const nextNum = await runTransaction(db!, async (tx: Transaction) => {
      const counterRef = doc(requireDb(), 'quote_counters', cleanedPrefix)
      const snap = await tx.get(counterRef)
      let current = 999
      if (snap.exists()) {
        const data = snap.data() as unknown as { seq?: unknown }
        const val = typeof data?.seq === 'number' ? data.seq : 999
        current = val
      }
      const next = current + 1
      tx.set(
        counterRef,
        { seq: next, updatedAt: serverTimestamp() },
        { merge: true }
      )
      return next
    })

    const humanQuoteNumber = `${cleanedPrefix}-${nextNum}`

    // Normalize referral codes for fast querying
    const referralCodeCustomerRaw = (
      quoteData?.customer as unknown as { referralCode?: unknown }
    )?.referralCode

    const referralCodeCustomer =
      typeof referralCodeCustomerRaw === 'string' &&
      referralCodeCustomerRaw.trim()
        ? referralCodeCustomerRaw.trim()
        : null

    const referralCodeCustomerLower = referralCodeCustomer
      ? referralCodeCustomer.toLowerCase()
      : null

    const referralCodeSalesperson =
      (quoteData.referralCodeSalesperson &&
        quoteData.referralCodeSalesperson.trim()) ||
      null

    const referralCodeSalespersonLower = referralCodeSalesperson
      ? referralCodeSalesperson.toLowerCase()
      : null

    // Get attribution data from client-side storage
    const attributionData = await getAttributionData()

    // Optional: auto-assign rep from referral code
    try {
      if (!salesRepId) {
        const code = (referralCodeSalesperson || referralCodeCustomer || '')
          .trim()
          .toLowerCase()
        if (code) {
          // You already have this in salesService
          const { getSalespersonByReferralCode } = await import(
            '@/services/salesService'
          )
          const sp = await getSalespersonByReferralCode(code)
          if (sp && typeof sp === 'object') {
            // minimal fields we rely on
            const maybeId =
              (sp as unknown as { id?: unknown; salesperson_id?: unknown })
                ?.id ??
              (sp as unknown as { id?: unknown; salesperson_id?: unknown })
                ?.salesperson_id
            const maybePrefix = (sp as unknown as { prefix?: unknown })?.prefix
            if (maybeId) {
              salesRepId = String(maybeId)
            }
            if (typeof maybePrefix === 'string' && maybePrefix.trim()) {
              salesRepPrefix = maybePrefix.trim()
            }
          }
        }
      }
    } catch (e) {
      console.warn('Auto-assign via referral code failed (non-fatal):', e)
    }

    const dataToSave = {
      quote_number: humanQuoteNumber,
      salesperson_id,
      location_code,
      status: 'New' as const,
      version: 1,
      locked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      last_modified_by: salesperson_id || 'customer-quoter',

      // keep original customer block (sanitize undefined values)
      customer: Object.fromEntries(
        Object.entries(quoteData.customer).map(([k, v]) => [
          k,
          v === undefined ? '' : v,
        ])
      ),
      items: quoteData.items.map((item) => ({
        ...item,
        priceBreakdown:
          (item as unknown as { priceBreakdown?: unknown }).priceBreakdown ||
          null,
      })),
      installOption: quoteData.installOption,
      deliveryOption: quoteData.deliveryOption,
      totals: quoteData.totals,

      // legacy field
      quoteId: quoteData.quoteId,
      salesRepId: salesRepId || null,
      salesRep: salesperson_id || null, // Add salesRep field for admin interface
      attachments: [] as unknown[],

      // flattened for fast queries
      referralCodeCustomer, // e.g. "AB12"
      referralCodeCustomerLower, // e.g. "ab12"
      referralCodeSalesperson, // e.g. "SP01"
      referralCodeSalespersonLower, // e.g. "sp01"

      // Attribution data for marketing analytics
      ...attributionData,
    }

    const docRef = await addDoc(collection(requireDb(), 'quotes'), dataToSave)

    // Send notification emails to marketing and manager (server-side only)
    if (typeof window === 'undefined') {
      try {
        const { sendNotificationEmails } = await import('@/lib/emailService')

        const notificationData = {
          type: 'Quote' as const,
          id: humanQuoteNumber,
          customerName: `${quoteData.customer.firstName} ${quoteData.customer.lastName}`,
          customerEmail: quoteData.customer.email,
          customerPhone: quoteData.customer.phone,
          timestamp: new Date(),
          totalAmount: quoteData.totals?.grandTotal || 0,
          itemCount: quoteData.items.length,
          productTypes: quoteData.items
            .map((item) => item.product?.type || 'Unknown')
            .filter(Boolean),
          salesRep: salesperson_id,
        }

        console.warn(
          '📧 Sending quote notification emails for:',
          humanQuoteNumber
        )
        await sendNotificationEmails(notificationData)
      } catch (emailError) {
        // Don't fail the quote creation if email notification fails
        console.error(
          '❌ Failed to send quote notification emails:',
          emailError
        )
      }
    }

    return docRef.id
  } catch (e) {
    console.error('Error adding document: ', e)
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`Failed to save quote to database: ${msg}`)
  }
}

// Update existing quote document by id or human quote number
export async function updateQuote(
  rawId: string,
  partial: Record<string, unknown>
) {
  await initFirebase()
  try {
    // Resolve id if a human "QUOTE-####" was passed
    const resolvedId = await resolveQuoteDocId(rawId)
    if (!resolvedId) {
      throw new Error(
        `No matching quote found for id/quote_number "${rawId}". (Tip: pass Firestore doc id or a valid quote_number.)`
      )
    }

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)

    // Ensure we don't persist empty strings or undefined values for referral fields
    const patch = { ...partial } as {
      referralCodeCustomer?: unknown
      referralCodeSalesperson?: unknown
      customer?: Record<string, unknown>
    }

    if (
      typeof patch.referralCodeCustomer === 'string' &&
      patch.referralCodeCustomer.trim() === ''
    ) {
      delete patch.referralCodeCustomer
    }
    if (
      typeof patch.referralCodeSalesperson === 'string' &&
      patch.referralCodeSalesperson.trim() === ''
    ) {
      delete patch.referralCodeSalesperson
    }

    // Sanitize customer subfields to avoid undefined in Firestore
    if (patch.customer) {
      patch.customer = Object.fromEntries(
        Object.entries(patch.customer).map(([k, v]) => [
          k,
          v === undefined ? '' : v,
        ])
      )
    }

    await updateDoc(quoteRef, { ...patch, updatedAt: serverTimestamp() })
  } catch (e) {
    console.error('Error updating quote: ', e)
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`Failed to update quote in database: ${msg}`)
  }
}

export async function getQuotes(
  options: { limit?: number; useCachedIfAvailable?: boolean } = {}
): Promise<Array<Record<string, unknown>>> {
  await initFirebase()
  const queryLimit = options.limit ?? 500 // Default limit to prevent overload
  // Note: useCachedIfAvailable option available but Firestore auto-uses cache by default

  try {
    // Try to order by createdAt (nice for admin). Fall back if index/field missing.
    let snap
    try {
      const q = query(
        collection(requireDb(), 'quotes'),
        orderBy('createdAt', 'desc'),
        limit(queryLimit)
      )

      // Note: Firestore automatically uses cache when available
      snap = await getDocs(q)

      if (snap.metadata?.fromCache) {
        console.warn('✓ Loaded quotes from cache')
      } else {
        console.warn('✓ Loaded quotes from server')
      }
    } catch (e) {
      console.warn(
        'getQuotes: orderBy(createdAt) failed, falling back to limited unordered fetch:',
        e
      )
      const fallbackQuery = query(
        collection(requireDb(), 'quotes'),
        limit(queryLimit)
      )
      snap = await getDocs(fallbackQuery)
    }

    if (snap.empty) return []

    const rows = snap.docs
      .map((d) => {
        const rawDoc = d.data()
        const base = mapFireToAdminQuote(d.id, rawDoc)
        if (!base) return null // malformed doc safely skipped

        // Enrich with fields your Admin UI already uses
        const raw = rawDoc as FireQuoteDoc

        // Notes
        const notes: Note[] = (raw.notes ?? []).map((note) => {
          const ts = note?.timestamp
          const iso =
            (typeof ts === 'string' && ts) ||
            (toDateSafe(ts)?.toISOString() ?? new Date().toISOString())
          return {
            id: asString(
              note?.id || `note-${d.id}-${Math.random().toString(36).slice(2)}`
            ),
            content: asString(note?.content),
            timestamp: iso,
            author: asString(note?.author || 'Unknown'),
          }
        })

        // Tasks
        const tasks: Task[] = (raw.tasks ?? []).map((task) => ({
          id: asString(
            task?.id || `task-${d.id}-${Math.random().toString(36).slice(2)}`
          ),
          content: asString(task?.content),
          dueDate: toDateSafe(task?.dueDate) ?? new Date(),
          completed: Boolean(task?.completed),
        }))

        // Attachments
        const attachments: Attachment[] = (raw.attachments ?? []).map((a) => ({
          id: asString(
            a?.id || `${d.id}-${Math.random().toString(36).slice(2)}`
          ),
          name: asString(a?.name || 'file'),
          url: asString(a?.url || ''),
          size: isFiniteNumber(a?.size) ? (a?.size as number) : 0,
          contentType: asString(a?.contentType || 'application/octet-stream'),
          uploadedAt: toDateSafe(a?.uploadedAt) ?? new Date(),
          uploadedBy: asString(a?.uploadedBy || 'Unknown'),
        }))

        const createdAt =
          base.createdAt ?? toDateSafe(raw.createdAt) ?? new Date()
        const updatedAt = base.updatedAt ?? toDateSafe(raw.updatedAt) ?? null
        const followUp = toDateSafe(raw.followUpDate)

        return {
          // Validated + flattened minimal fields
          ...base,

          // Extras your Admin grid uses
          pipelineStage: raw.pipelineStage || base.status || 'New',
          tags: Array.isArray(base.tags)
            ? base.tags
            : Array.isArray(raw.tags)
              ? raw.tags
              : [],
          company: raw.customer?.customerType || raw.customer?.company || '',
          phone: base.phone ?? raw.customer?.phone ?? '',
          zip: base.zipCode ?? raw.customer?.zipCode ?? '',
          createdAt,
          updatedAt,
          stageDates: raw.stageDates || {},
          salesRep: raw.salesperson_id || raw.last_modified_by || 'Unassigned',
          numberOfItems: Array.isArray(raw.items) ? raw.items.length : 0,
          notes,
          tasks,
          followUpDate: followUp,
          attachments,

          // Referral convenience fields (used elsewhere)
          referralCodeCustomer:
            raw.referralCodeCustomer ?? raw.customer?.referralCode ?? '',
          referralCodeSalesperson: raw.referralCodeSalesperson ?? '',
        }
      })
      .filter(Boolean) as Array<Record<string, unknown>>

    // Fallback local sort (desc by createdAt, then quoteNumber)
    rows.sort((a, b) => {
      const ta = (a.createdAt as Date | null)?.getTime?.() ?? 0
      const tb = (b.createdAt as Date | null)?.getTime?.() ?? 0
      if (tb !== ta) return tb - ta
      return String(b.quoteNumber ?? '').localeCompare(
        String(a.quoteNumber ?? '')
      )
    })

    return rows
  } catch (error) {
    console.error('Error getting quotes:', error)
    throw error
  }
}

export async function getQuoteById(id: string) {
  try {
    await initFirebase()

    const resolvedId = await resolveQuoteDocId(id)
    if (!resolvedId) return null

    const docRef = doc(requireDb(), 'quotes', resolvedId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    const raw = docSnap.data() as unknown as FireQuoteDoc

    const attachments: Attachment[] = (raw.attachments ?? []).map((a) => ({
      id: asString(
        a?.id || `${resolvedId}-${Math.random().toString(36).slice(2)}`
      ),
      name: asString(a?.name || 'file'),
      url: asString(a?.url || ''),
      size: isFiniteNumber(a?.size) ? (a?.size as number) : 0,
      contentType: asString(a?.contentType || 'application/octet-stream'),
      uploadedAt: toDateSafe(a?.uploadedAt) ?? new Date(),
      uploadedBy: asString(a?.uploadedBy || 'Unknown'),
    }))

    return {
      id: docSnap.id,
      ...raw,
      attachments,
      referralCodeCustomer:
        raw.referralCodeCustomer ?? raw.customer?.referralCode ?? '',
      referralCodeSalesperson: raw.referralCodeSalesperson ?? '',
    }
  } catch (error) {
    console.error('Error getting document:', error)
    throw error
  }
}

// Update pill status only (does not move Kanban column)
export async function updateQuoteStatus(quoteId: string, status: string) {
  try {
    await initFirebase()

    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)
    await updateDoc(quoteRef, {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating quote status: ', error)
    throw new Error('Failed to update quote status in database.')
  }
}

// Move between pipeline columns and stamp date
export async function moveQuotePipeline(quoteId: string, stage: string) {
  await initFirebase()
  try {
    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)
    const key = `stageDates.${stage}`
    await updateDoc(quoteRef, {
      pipelineStage: stage,
      updatedAt: serverTimestamp(),
      [key]: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error moving quote pipeline: ', error)
    throw new Error('Failed to update pipeline stage in database.')
  }
}

export async function updateQuoteTags(quoteId: string, tags: string[]) {
  await initFirebase()
  try {
    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)
    await updateDoc(quoteRef, {
      tags,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating quote tags: ', error)
    throw new Error('Failed to update quote tags in database.')
  }
}

export async function updateQuoteSalesRep(quoteId: string, salesRepId: string) {
  await initFirebase()
  try {
    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)
    await updateDoc(quoteRef, {
      salesperson_id: salesRepId,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating quote salesperson: ', error)
    throw new Error('Failed to update quote salesperson in database.')
  }
}

export async function updateQuoteFollowUpDate(quoteId: string, newDate: Date) {
  await initFirebase()
  try {
    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)
    await updateDoc(quoteRef, {
      followUpDate: newDate,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating follow-up date: ', error)
    throw new Error('Failed to update follow-up date in database.')
  }
}

// Update trade discount and recompute grand total from existing totals
export async function updateQuoteDiscount(
  quoteId: string,
  discount: number,
  isPercent = false
) {
  await initFirebase()
  try {
    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)
    const snap = await getDoc(quoteRef)
    if (!snap.exists()) throw new Error('Quote not found')
    const raw = snap.data() as unknown as { totals?: FireTotals }
    const totals = raw?.totals || {}
    const subtotal = Number(totals?.subtotal || 0)
    const install = Number(totals?.installationCost || 0)
    const delivery = Number(totals?.deliveryCost || 0)
    const screens = Number(totals?.screens || 0)
    const crating = Number(totals?.crating || 0)
    const tax = Number(totals?.tax || 0)
    const base = subtotal + install + delivery + screens + crating
    const rawNum = Math.max(0, Number(discount) || 0)
    const discountAmount = isPercent
      ? Math.round(base * (rawNum / 100) * 100) / 100
      : rawNum
    const grandTotal = base + tax - discountAmount

    await updateDoc(quoteRef, {
      totals: {
        ...totals,
        tradeDiscount: discountAmount,
        tradeDiscountType: isPercent ? 'percent' : 'amount',
        tradeDiscountPercent: isPercent ? rawNum : undefined,
        grandTotal,
      },
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating trade discount:', error)
    throw new Error('Failed to update trade discount.')
  }
}

// Strong typing for discounts
export type DiscountType = 'percent' | 'amount'
export type DiscountEntry = { type: DiscountType; value: number }

export async function setQuoteDiscounts(
  quoteId: string,
  discounts: DiscountEntry[]
) {
  try {
    await initFirebase()

    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)
    const snap = await getDoc(quoteRef)
    if (!snap.exists()) throw new Error('Quote not found')
    const raw = snap.data() as unknown as { totals?: FireTotals }
    const totals = raw?.totals || {}
    const subtotal = Number(totals?.subtotal || 0)
    const install = Number(totals?.installationCost || 0)
    const delivery = Number(totals?.deliveryCost || 0)
    const screens = Number(totals?.screens || 0)
    const crating = Number(totals?.crating || 0)
    const tax = Number(totals?.tax || 0)
    const base = subtotal + install + delivery + screens + crating

    const normalized: DiscountEntry[] = (discounts ?? [])
      .map((d) => ({
        type: (d.type === 'percent' ? 'percent' : 'amount') as DiscountType,
        value: Number(d.value ?? 0),
      }))
      .filter((d) => d.value > 0)

    const sumAmount = normalized
      .filter((d) => d.type === 'amount')
      .reduce((s, d) => s + d.value, 0)
    const sumPercent = normalized
      .filter((d) => d.type === 'percent')
      .reduce((s, d) => s + d.value, 0)

    const percentDiscount = Math.round(base * (sumPercent / 100) * 100) / 100
    const totalDiscount = Math.round((sumAmount + percentDiscount) * 100) / 100
    const grandTotal = base + tax - totalDiscount

    await updateDoc(quoteRef, {
      totals: {
        ...totals,
        tradeDiscount: totalDiscount,
        tradeDiscounts: normalized,
        tradeDiscountType: undefined,
        tradeDiscountPercent: undefined,
        grandTotal,
      },
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error setting discounts:', error)
    throw new Error('Failed to update discounts.')
  }
}

export async function addNoteToQuote(quoteId: string, note: Note) {
  await initFirebase()
  try {
    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)
    const ts =
      typeof note.timestamp === 'string'
        ? note.timestamp
        : new Date(note.timestamp as Date).toISOString()

    const toSave = {
      ...note,
      timestamp: ts,
    }

    await updateDoc(quoteRef, {
      notes: arrayUnion(toSave),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error adding note: ', error)
    throw new Error('Failed to add note to database.')
  }
}

export async function addTaskToQuote(quoteId: string, task: Task) {
  await initFirebase()
  try {
    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const quoteRef = doc(requireDb(), 'quotes', resolvedId)
    await updateDoc(quoteRef, {
      tasks: arrayUnion(task),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error adding task: ', error)
    throw new Error('Failed to add task to database.')
  }
}

export async function toggleTaskCompletion(
  quoteId: string,
  taskId: string,
  isCompleted: boolean
) {
  await initFirebase()
  const resolvedId = await resolveQuoteDocId(quoteId)
  if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

  const quoteRef = doc(requireDb(), 'quotes', resolvedId)
  try {
    const quoteSnap = await getDoc(quoteRef)
    if (!quoteSnap.exists()) throw new Error('Quote not found')

    const tasks =
      (quoteSnap.data() as unknown as { tasks?: Task[] }).tasks ?? []
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: isCompleted } : task
    )

    await updateDoc(quoteRef, {
      tasks: updatedTasks,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error toggling task completion:', error)
    throw new Error('Failed to update task in database.')
  }
}

export async function addAttachmentToQuote(
  quoteId: string,
  file: File,
  uploadedBy = 'Admin User'
): Promise<Attachment> {
  await initFirebase()
  try {
    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    const fileRef = ref(
      requireStorage(),
      `quotes/${resolvedId}/${Date.now()}-${file.name}`
    )
    await uploadBytes(fileRef, file)
    const url = await getDownloadURL(fileRef)

    const record = {
      id: fileRef.name,
      name: file.name,
      url,
      size: file.size,
      contentType: file.type,
      uploadedAt: serverTimestamp(),
      uploadedBy,
    }

    await updateDoc(doc(requireDb(), 'quotes', resolvedId), {
      attachments: arrayUnion(record),
      updatedAt: serverTimestamp(),
    })

    return {
      id: record.id,
      name: record.name,
      url: record.url,
      size: record.size,
      contentType: record.contentType,
      uploadedAt: new Date(),
      uploadedBy: record.uploadedBy,
    }
  } catch (error) {
    console.error('Error uploading attachment:', error)
    throw new Error('Failed to upload attachment.')
  }
}

export async function deleteQuote(quoteId: string): Promise<void> {
  await initFirebase()
  try {
    const resolvedId = await resolveQuoteDocId(quoteId)
    if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)

    // Soft delete: move to deleted_quotes with timestamp for retention
    const refQ = doc(requireDb(), 'quotes', resolvedId)
    const snap = await getDoc(refQ)
    const data = snap.exists()
      ? (snap.data() as unknown as Record<string, unknown>)
      : {}
    const retentionDays = await kanbanService.getDeletedRetentionDays()
    const now = Date.now()
    const expiresAt = new Date(now + retentionDays * 24 * 60 * 60 * 1000)
    await setDoc(doc(requireDb(), 'deleted_quotes', resolvedId), {
      ...data,
      deletedAt: serverTimestamp(),
      expiresAt,
    })
    await deleteDoc(refQ)
  } catch (error) {
    console.error('Error deleting quote: ', error)
    throw new Error('Failed to delete quote from the database.')
  }
}

export type DeletedQuoteListItem = {
  id: string
  quoteNumber: string
  firstName: string
  lastName: string
  company: string
  quoteAmount: number
  deletedAt: Date | null
  expiresAt: Date | null
}

export async function listDeletedQuotes(): Promise<DeletedQuoteListItem[]> {
  await initFirebase()
  const q = query(
    collection(requireDb(), 'deleted_quotes'),
    orderBy('deletedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as unknown as {
      quote_number?: string
      quoteId?: string
      customer?: { firstName?: string; lastName?: string; company?: string }
      totals?: { subtotal?: number; grandTotal?: number }
      deletedAt?: FireTimestampLike
      expiresAt?: FireTimestampLike
    }

    return {
      id: d.id,
      quoteNumber: data.quote_number || data.quoteId || 'N/A',
      firstName: data.customer?.firstName || '',
      lastName: data.customer?.lastName || '',
      company: data.customer?.company || '',
      quoteAmount:
        (isFiniteNumber(data.totals?.subtotal) &&
          (data.totals?.subtotal as number)) ||
        (isFiniteNumber(data.totals?.grandTotal) &&
          (data.totals?.grandTotal as number)) ||
        0,
      deletedAt: toDateSafe(data.deletedAt) ?? null,
      expiresAt: toDateSafe(data.expiresAt) ?? null,
    }
  })
}

export async function restoreDeletedQuote(quoteId: string) {
  await initFirebase()
  const resolvedId = await resolveQuoteDocId(quoteId)
  if (!resolvedId) return false

  // Move doc back from deleted_quotes to quotes
  const deletedRef = doc(requireDb(), 'deleted_quotes', resolvedId)
  const snap = await getDoc(deletedRef)
  if (!snap.exists()) return false
  const data = snap.data() as unknown as Record<string, unknown>
  await setDoc(doc(requireDb(), 'quotes', resolvedId), {
    ...data,
    deletedAt: null,
    updatedAt: serverTimestamp(),
  })
  await deleteDoc(deletedRef)
  return true
}

export async function purgeDeletedQuote(quoteId: string) {
  await initFirebase()
  const resolvedId = await resolveQuoteDocId(quoteId)
  if (!resolvedId) throw new Error(`No matching quote found for "${quoteId}"`)
  await deleteDoc(doc(requireDb(), 'deleted_quotes', resolvedId))
}

export async function purgeExpiredDeletedQuotes(retentionDays: number) {
  await initFirebase()
  // Best-effort client purge: fetch and filter
  const all = await listDeletedQuotes()
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
  const toPurge = all.filter(
    (r) => r.deletedAt && r.deletedAt.getTime() < cutoff
  )
  for (const r of toPurge) {
    await purgeDeletedQuote(r.id)
  }
  return toPurge.length
}

// Recalculate expiresAt for all deleted quotes (use when retention changes)
export async function backfillDeletedExpires(retentionDays: number) {
  await initFirebase()
  const snap = await getDocs(query(collection(requireDb(), 'deleted_quotes')))
  const ms = retentionDays * 24 * 60 * 60 * 1000
  for (const d of snap.docs) {
    const data = d.data() as unknown as { deletedAt?: FireTimestampLike }
    const base = toDateSafe(data.deletedAt) ?? new Date()
    const expiresAt = new Date(base.getTime() + ms)
    await setDoc(d.ref, { expiresAt }, { merge: true })
  }
}

export type ReferralSearchMode = 'exact' | 'prefix'

export interface GetQuotesByReferralOpts {
  mode?: ReferralSearchMode // default "exact"
  pageSize?: number // default 50
  after?: QueryDocumentSnapshot<DocumentData> | null
  includeSalesperson?: boolean // default false
}

/**
 * Server-side referral search (case-insensitive).
 * - exact: equality on referralCodeCustomerLower
 * - prefix: range query using startAt/endAt on referralCodeCustomerLower
 *
 * Returns both the rows and the `lastDoc` for pagination.
 */
export async function getQuotesByReferral(
  raw: string,
  opts: GetQuotesByReferralOpts = {}
): Promise<{
  rows: Array<Record<string, unknown>>
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
}> {
  await initFirebase()
  const code = String(raw || '')
    .trim()
    .toLowerCase()
  const mode: ReferralSearchMode = opts.mode ?? 'exact'
  const pageSize = Math.max(1, Math.min(opts.pageSize ?? 50, 200))
  const after = opts.after ?? null

  if (!code) return { rows: [], lastDoc: null }

  const base = collection(requireDb(), 'quotes')

  // Build query
  let qRef
  if (mode === 'exact') {
    qRef = query(
      base,
      where('referralCodeCustomerLower', '==', code),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    )
  } else {
    const rangeStart = code
    const rangeEnd = code + '\uf8ff'
    qRef = query(
      base,
      orderBy('referralCodeCustomerLower'),
      startAt(rangeStart),
      endAt(rangeEnd),
      limit(pageSize)
    )
  }

  // Pagination
  if (after) {
    qRef = query(qRef, startAfter(after))
  }

  const snap = await getDocs(qRef)
  if (snap.empty) return { rows: [], lastDoc: null }

  const rows = snap.docs.map((d) => {
    const data = d.data() as unknown as FireQuoteDoc

    const subtotal =
      (typeof data?.totals?.subtotal === 'number' && data.totals.subtotal) ||
      (typeof data?.totals?.grandTotal === 'number' &&
        data.totals.grandTotal) ||
      0

    return {
      id: d.id,
      quoteNumber: data.quote_number || data.quoteId || 'N/A',
      status: data.status || 'draft',
      pipelineStage: data.pipelineStage || data.status || 'New',
      tags: Array.isArray(data.tags) ? data.tags : [],
      quoteAmount: subtotal,
      lastName: data?.customer?.lastName || '',
      firstName: data?.customer?.firstName || '',
      company: data?.customer?.customerType || data?.customer?.company || '',
      phone: data?.customer?.phone || '',
      zip: data?.customer?.zipCode || '',
      createdAt: toDateSafe(data?.createdAt) ?? new Date(),
      updatedAt: toDateSafe(data?.updatedAt) ?? null,
      stageDates: data?.stageDates || {},
      salesRep: data?.salesperson_id || data?.last_modified_by || 'Unassigned',
      numberOfItems: Array.isArray(data?.items) ? data.items.length : 0,
      referralCodeCustomer: data?.referralCodeCustomer ?? null,
      referralCodeSalesperson: data?.referralCodeSalesperson ?? null,
    }
  })

  const lastDoc = snap.docs[snap.docs.length - 1] ?? null
  return { rows, lastDoc }
}
