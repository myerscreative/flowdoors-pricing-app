'use client'

// Type-only imports for Firebase typings
import { z } from 'zod'

/** Accept Firestore Timestamp | Date | string | number and normalize to Date|null */
const FireDateZ = z.unknown().transform((v) => {
  try {
    if (
      v &&
      typeof v === 'object' &&
      'toDate' in v &&
      typeof (v as any).toDate === 'function'
    )
      return (v as any).toDate() as Date
    if (v instanceof Date) return v as Date

    if (typeof v === 'string' || typeof v === 'number') return new Date(v)
  } catch {
    // intentionally empty
  }
  return null as Date | null
})

const FireLeadDocZ = z.object({
  name: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  timeline: z.string().optional().default(''),
  role: z.string().optional().default(''),
  status: z.string().optional().default('new'),
  source: z.string().optional().default('web'),
  createdAt: FireDateZ.nullable(),
  referral: z.string().optional(),
  userAgent: z.string().optional(),
  referer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
})

type FireLeadDoc = z.infer<typeof FireLeadDocZ>

// Helper functions removed as they're not used in this service

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  zip: string
  timeline: string
  role: string
  status: string
  source: string
  createdAt: Date | null
  referral?: string
  userAgent?: string
  referer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  gclid?: string
  fbclid?: string
  hasQuote: boolean // Whether this lead has converted to a quote
}

let firebaseInitialized = false

async function initFirebase() {
  if (firebaseInitialized) return

  try {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getFirestore, connectFirestoreEmulator } = await import(
      'firebase/firestore'
    )

    if (getApps().length === 0) {
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }

      const app = initializeApp(config)
      const db = getFirestore(app)

      // Connect to emulator if in development
      if (
        process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR === 'true'
      ) {
        try {
          connectFirestoreEmulator(db, 'localhost', 8080)
        } catch {
          // Emulator already connected, ignore
        }
      }
    }

    firebaseInitialized = true
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    throw error
  }
}

async function requireDb() {
  const { getFirestore } = await import('firebase/firestore')
  const { getApps } = await import('firebase/app')
  const apps = getApps()
  if (apps.length === 0) {
    throw new Error('Firebase not initialized. Call initFirebase() first.')
  }
  return getFirestore(apps[0])
}

function mapFireToLead(id: string, rawDoc: FireLeadDoc): Lead | null {
  try {
    const validated = FireLeadDocZ.parse(rawDoc)

    return {
      id,
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      zip: validated.zip,
      timeline: validated.timeline,
      role: validated.role,
      status: validated.status,
      source: validated.source,
      createdAt: validated.createdAt,
      referral: validated.referral,
      userAgent: validated.userAgent,
      referer: validated.referer,
      utmSource: validated.utmSource,
      utmMedium: validated.utmMedium,
      utmCampaign: validated.utmCampaign,
      utmContent: validated.utmContent,
      utmTerm: validated.utmTerm,
      gclid: validated.gclid,
      fbclid: validated.fbclid,
      hasQuote: false, // Will be set later by checking quotes
    }
  } catch (_error) {
    console.warn('Failed to parse lead document:', id, _error)
    return null
  }
}

export async function getLeads(): Promise<Lead[]> {
  await initFirebase()
  try {
    const { collection, getDocs, query, orderBy } = await import(
      'firebase/firestore'
    )
    const db = await requireDb()

    // Try to order by createdAt (nice for admin). Fall back if index/field missing.
    let snap
    try {
      const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'))
      snap = await getDocs(q)
    } catch (e) {
      console.warn(
        'getLeads: orderBy(createdAt) failed, falling back to unordered fetch:',
        e
      )
      snap = await getDocs(collection(db, 'leads'))
    }

    if (snap.empty) return []

    const leads = snap.docs
      .map((d) => {
        const rawDoc = d.data() as FireLeadDoc
        return mapFireToLead(d.id, rawDoc)
      })
      .filter(Boolean) as Lead[]

    return leads
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    throw new Error(`Failed to fetch leads: ${error}`)
  }
}

export async function getLeadsWithoutQuotes(): Promise<Lead[]> {
  await initFirebase()
  try {
    // Import quote service to get all quotes
    const { getQuotes } = await import('@/services/quoteService')

    // Get all leads and all quotes
    const [leads, quotes] = await Promise.all([getLeads(), getQuotes()])

    // Create a set of emails that have quotes
    const emailsWithQuotes = new Set(
      quotes
        .map((quote) => {
          const customer = quote.customer as any
          return customer?.email || quote.email || ''
        })
        .filter(Boolean)
    )

    // Filter leads that don't have quotes
    const leadsWithoutQuotes = leads.filter(
      (lead) => !emailsWithQuotes.has(lead.email.toLowerCase())
    )

    // Note: leadsWithQuoteStatus not used in this function

    return leadsWithoutQuotes
  } catch (error) {
    console.error('Failed to fetch leads without quotes:', error)
    throw new Error(`Failed to fetch leads without quotes: ${error}`)
  }
}

// Service functions
export const leadService = {
  async getLeads(): Promise<Lead[]> {
    return getLeads()
  },

  async getLeadsWithoutQuotes(): Promise<Lead[]> {
    return getLeadsWithoutQuotes()
  },

  async getLead(id: string): Promise<Lead | null> {
    try {
      await initFirebase()
      const { doc, getDoc } = await import('firebase/firestore')

      const db = await requireDb()
      const leadDoc = await getDoc(doc(db, 'leads', id))
      if (!leadDoc.exists()) return null

      return mapFireToLead(id, leadDoc.data() as FireLeadDoc)
    } catch (error) {
      console.error('Failed to fetch lead:', error)
      return null
    }
  },
}

// Convenience helper
export async function getLeadById(id: string): Promise<Lead | null> {
  return leadService.getLead(id)
}
