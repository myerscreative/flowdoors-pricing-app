// src/app/api/quote/leads/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import admin from 'firebase-admin'
import type { FieldValue } from 'firebase-admin/firestore'

/** Safe idempotent Admin init (prefer cert from env, else ADC) */
if (!admin.apps.length) {
  try {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.GCLOUD_PROJECT ||
      process.env.GOOGLE_CLOUD_PROJECT

    let credential: admin.credential.Credential

    if (
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      projectId
    ) {
      // Private key must preserve newlines
      const pk = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      credential = admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: pk,
      })
      admin.initializeApp({ projectId, credential })
      console.warn(
        '[leads] Admin initialized using service account (env cert).'
      )
    } else {
      // Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS or local gcloud)
      credential = admin.credential.applicationDefault()
      admin.initializeApp({ projectId, credential })
      console.warn('[leads] Admin initialized using ADC.')
    }
  } catch (e) {
    console.error(
      'firebase-admin initializeApp failed:',
      e instanceof Error ? e.message : String(e)
    )
  }
}

type Timeline = 'asap' | '30-60' | '90+'
type Role = 'homeowner' | 'contractor' | 'architect' | 'dealer'

interface CreateLeadBody {
  name?: unknown // "Jane Doe" (backwards compatibility)
  firstName?: unknown
  lastName?: unknown
  email?: unknown
  phone?: unknown
  zip?: unknown
  timeline?: unknown // 'asap' | '30-60' | '90+'
  role?: unknown // 'homeowner' | 'contractor' | 'architect' | 'dealer'
  referral?: unknown // free text
  attribution?: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_content?: string
    utm_term?: string
    gclid?: string
    gbraid?: string
    wbraid?: string
    fbclid?: string
    fbc?: string
    fbp?: string
    landing_page_url?: string
    referrer?: string
    first_touch_ts?: string
    last_touch_ts?: string
  }
}

function looksLikeEmail(v: string) {
  const s = v.trim()
  return s.length > 3 && s.includes('@') && s.includes('.')
}
function looksLikePhone(v: string) {
  return v.replace(/\D/g, '').length >= 10
}
function looksLikeZip(v: string) {
  return /^\d{5}(-\d{4})?$/.test(v.trim())
}

function extractAttributionFields(attribution: CreateLeadBody['attribution']) {
  if (!attribution) return {}

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

  // Remove undefined values (Firestore rejects undefined fields)
  Object.keys(mapped).forEach((k) => {
    if (mapped[k] === undefined) delete mapped[k]
  })

  return mapped as Partial<LeadDoc>
}

type LeadDoc = {
  name: string // Computed full name for backwards compatibility
  firstName: string
  lastName: string
  email: string
  phone: string
  zip: string
  timeline: Timeline
  role: Role
  status: 'new'
  source: 'web'
  createdAt: FieldValue
  referral?: string
  userAgent?: string
  referer?: string
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

export async function POST(req: Request) {
  try {
    const body: CreateLeadBody = await req.json().catch(() => ({}))

    // Extract firstName and lastName
    const firstName =
      typeof body.firstName === 'string' ? body.firstName.trim() : ''
    const lastName =
      typeof body.lastName === 'string' ? body.lastName.trim() : ''
    // Compute name from firstName/lastName or fall back to name field
    const name =
      firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : typeof body.name === 'string'
          ? body.name.trim()
          : ''

    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const zip = typeof body.zip === 'string' ? body.zip.trim() : ''
    const timeline =
      typeof body.timeline === 'string'
        ? (body.timeline as Timeline)
        : undefined
    const role = typeof body.role === 'string' ? (body.role as Role) : undefined
    const referral =
      typeof body.referral === 'string' ? body.referral.trim() : ''
    const attribution = extractAttributionFields(body.attribution)

    // If required fields are missing, treat this POST as a lenient autosave (sendBeacon path)
    const allValid =
      name.length >= 2 &&
      looksLikeEmail(email) &&
      looksLikePhone(phone) &&
      looksLikeZip(zip) &&
      !!timeline &&
      ['asap', '30-60', '90+'].includes(timeline) &&
      !!role &&
      ['homeowner', 'contractor', 'architect', 'dealer'].includes(role)

    if (!allValid) {
      // Reject incomplete leads - require name, email, and phone at minimum
      const hasRequiredFields =
        name &&
        name.length >= 2 &&
        looksLikeEmail(email) &&
        looksLikePhone(phone)

      if (!hasRequiredFields) {
        console.warn(
          '[leads] Rejected incomplete lead (POST-autosave missing name/email/phone)'
        )
        return NextResponse.json(
          {
            error: 'Required fields missing',
            detail: 'Name, email, and phone are required',
          },
          { status: 400 }
        )
      }

      // Map potential UI values (from autosave) and upsert, then accept 202
      const uiTimeline =
        typeof body.timeline === 'string' ? body.timeline : undefined
      const timelineMap: Record<string, Timeline> = {
        asap: 'asap',
        '1-3m': '30-60',
        '3-6m': '90+',
        '6plus': '90+',
        researching: '90+',
        '30-60': '30-60',
        '90+': '90+',
      } as const
      const mappedTimeline: Timeline | undefined = uiTimeline
        ? (timelineMap[uiTimeline] as Timeline | undefined)
        : undefined

      const uiRole = typeof body.role === 'string' ? body.role : undefined
      const roleMap: Record<string, Role> = {
        homeowner: 'homeowner',
        contractor: 'contractor',
        architect: 'architect',
        dealer: 'dealer',
        other: 'homeowner',
      } as const
      const mappedRole: Role | undefined = uiRole
        ? (roleMap[uiRole] as Role | undefined)
        : undefined

      const ua2 = req.headers.get('user-agent') ?? ''
      const ref2 = req.headers.get('referer') ?? ''
      const db2 = admin.firestore()
      const partial: Partial<LeadDoc> & { updatedAt: FieldValue } = {
        status: 'new',
        source: 'web',
        updatedAt:
          admin.firestore.FieldValue.serverTimestamp() as unknown as FieldValue,
      } as any
      if (name) (partial as any).name = name
      if (firstName) (partial as any).firstName = firstName
      if (lastName) (partial as any).lastName = lastName
      if (email) (partial as any).email = email
      if (phone) (partial as any).phone = phone
      if (zip) (partial as any).zip = zip
      if (mappedTimeline) (partial as any).timeline = mappedTimeline
      if (mappedRole) (partial as any).role = mappedRole
      if (ua2) (partial as any).userAgent = ua2
      if (ref2) (partial as any).referer = ref2
      if (referral) (partial as any).referral = referral

      const docId = `email:${encodeURIComponent(email.toLowerCase())}`
      const docRef = db2.collection('leads').doc(docId)
      const snap = await docRef.get()
      if (!snap.exists) {
        await docRef.set(
          {
            ...partial,
            createdAt:
              admin.firestore.FieldValue.serverTimestamp() as unknown as FieldValue,
          } as any,
          { merge: true }
        )
      } else {
        await docRef.set(partial as any, { merge: true })
      }
      console.warn(`[leads] upserted (POST-autosave) ${docId}`)
      return NextResponse.json({ id: docId, accepted: true }, { status: 202 })
    }

    const ua = req.headers.get('user-agent') ?? ''
    const ref = req.headers.get('referer') ?? ''

    // Build doc WITHOUT undefined values
    const doc: LeadDoc = {
      name,
      firstName,
      lastName,
      email,
      phone,
      zip,
      timeline,
      role,
      status: 'new',
      source: 'web',
      createdAt:
        admin.firestore.FieldValue.serverTimestamp() as unknown as FieldValue,
      ...attribution, // Include all attribution fields
    }
    if (referral) doc.referral = referral
    if (ua) doc.userAgent = ua
    if (ref) doc.referer = ref

    const db = admin.firestore()
    const { id } = await db.collection('leads').add(doc)

    console.warn(`[leads] created ${id} for ${email}`)

    // Send notification emails to marketing and manager
    try {
      const { sendNotificationEmails } = await import('@/lib/emailService')

      const notificationData = {
        type: 'Lead' as const,
        id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        timestamp: new Date(),
      }

      console.warn('📧 Sending lead notification emails for:', id)
      await sendNotificationEmails(notificationData)
    } catch (emailError) {
      // Don't fail the lead creation if email notification fails
      console.error('❌ Failed to send lead notification emails:', emailError)
    }

    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    // DEV-friendly error surface (prod stays generic)
    const err = e as
      | { message?: string; code?: string; stack?: string }
      | undefined
    const msg = err?.message ?? String(e)

    console.error('leads:create error:', msg)
    const proj =
      (admin.apps[0]?.options as { projectId?: string } | undefined)
        ?.projectId ?? 'unknown'
    console.warn('[leads] admin projectId:', proj)

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        {
          error: 'Failed to create lead.',
          detail: msg,
          code: err?.code ?? 'unknown',
        },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create lead.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    hint: 'POST { name, email, phone, zip, timeline, role, referral? }',
  })
}

/**
 * Lenient autosave/upsert endpoint.
 * Accepts partial data and upserts by email when provided.
 * Maps UI values to API schema and marks incomplete records accordingly.
 */
export async function PUT(req: Request) {
  try {
    const body: Partial<CreateLeadBody> = await req.json().catch(() => ({}))

    // Extract known fields (accept partial)
    const firstName =
      typeof body.firstName === 'string' ? body.firstName.trim() : ''
    const lastName =
      typeof body.lastName === 'string' ? body.lastName.trim() : ''
    // Compute name from firstName/lastName or fall back to name field
    const name =
      firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : typeof body.name === 'string'
          ? body.name.trim()
          : ''

    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const zip = typeof body.zip === 'string' ? body.zip.trim() : ''
    const referral =
      typeof body.referral === 'string' ? body.referral.trim() : ''
    const attribution = extractAttributionFields(body.attribution)

    // Allow UI-specific values and map to API types
    // UI timeline values: 'asap' | '1-3m' | '3-6m' | '6plus' | 'researching'
    // API expects: 'asap' | '30-60' | '90+'
    const uiTimeline =
      typeof body.timeline === 'string' ? body.timeline : undefined
    const timelineMap: Record<string, Timeline> = {
      asap: 'asap',
      '1-3m': '30-60',
      '3-6m': '90+',
      '6plus': '90+',
      researching: '90+',
      '30-60': '30-60',
      '90+': '90+',
    } as const
    const timeline: Timeline | undefined = uiTimeline
      ? (timelineMap[uiTimeline] as Timeline | undefined)
      : undefined

    // UI role/customerType values: 'homeowner' | 'contractor' | 'architect' | 'dealer' | 'other'
    // API expects: Role without 'other' → map 'other' to 'homeowner'
    const uiRole = typeof body.role === 'string' ? body.role : undefined
    const roleMap: Record<string, Role> = {
      homeowner: 'homeowner',
      contractor: 'contractor',
      architect: 'architect',
      dealer: 'dealer',
      other: 'homeowner',
    } as const
    const role: Role | undefined = uiRole
      ? (roleMap[uiRole] as Role | undefined)
      : undefined

    const ua = req.headers.get('user-agent') ?? ''
    const ref = req.headers.get('referer') ?? ''

    const db = admin.firestore()

    // Build partial doc
    const partial: Partial<LeadDoc> & { updatedAt: FieldValue } = {
      status: 'new',
      source: 'web',
      updatedAt:
        admin.firestore.FieldValue.serverTimestamp() as unknown as FieldValue,
      ...attribution, // Include attribution fields
    } as any

    if (name) (partial as any).name = name
    if (firstName) (partial as any).firstName = firstName
    if (lastName) (partial as any).lastName = lastName
    if (email) (partial as any).email = email
    if (phone) (partial as any).phone = phone
    if (zip) (partial as any).zip = zip
    if (timeline) (partial as any).timeline = timeline
    if (role) (partial as any).role = role
    if (ua) (partial as any).userAgent = ua
    if (ref) (partial as any).referer = ref
    if (referral) (partial as any).referral = referral

    // Validate required fields - only create/update leads with name, email, and phone
    const hasRequiredFields = Boolean(
      name && name.length >= 2 && looksLikeEmail(email) && looksLikePhone(phone)
    )

    // Reject requests without required fields
    if (!hasRequiredFields) {
      console.warn(
        '[leads] Rejected incomplete lead (missing name/email/phone)'
      )
      return NextResponse.json(
        {
          error: 'Required fields missing',
          detail: 'Name, email, and phone are required',
        },
        { status: 400 }
      )
    }

    // Mark complete if all fields present
    const isComplete = Boolean(
      name &&
        looksLikeEmail(email) &&
        looksLikePhone(phone) &&
        looksLikeZip(zip) &&
        timeline &&
        role
    )

    // Upsert by email when available
    if (email) {
      const docId = `email:${encodeURIComponent(email.toLowerCase())}`
      const docRef = db.collection('leads').doc(docId)
      const snap = await docRef.get()
      if (!snap.exists) {
        await docRef.set(
          {
            ...partial,
            createdAt:
              admin.firestore.FieldValue.serverTimestamp() as unknown as FieldValue,
            status: isComplete ? 'new' : 'new',
          } as any,
          { merge: true }
        )
      } else {
        await docRef.set(partial as any, { merge: true })
      }
      console.warn(`[leads] upserted ${docId} (complete=${isComplete})`)
      return NextResponse.json(
        { id: docId, complete: isComplete },
        { status: isComplete ? 200 : 202 }
      )
    }

    // This shouldn't happen since we validated email above, but kept for safety
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  } catch (e) {
    const err = e as { message?: string; code?: string } | undefined
    const msg = err?.message ?? String(e)
    console.error('leads:upsert error:', msg)
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        {
          error: 'Failed to upsert lead.',
          detail: msg,
          code: err?.code ?? 'unknown',
        },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to upsert lead.' },
      { status: 500 }
    )
  }
}
