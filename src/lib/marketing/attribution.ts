/* Client-side attribution SDK (first-party) */

export type Attribution = {
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

const COOKIE_NAME = 'scenic_attr'
const MAX_AGE = 60 * 60 * 24 * 90 // 90 days

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : undefined
}

function writeCookie(name: string, value: string, maxAge = MAX_AGE): void {
  if (!isBrowser()) return
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAge}; samesite=lax`
}

function parseQuery(): Record<string, string> {
  const out: Record<string, string> = {}
  if (!isBrowser()) return out
  const params = new URLSearchParams(window.location.search)
  params.forEach((v, k) => {
    out[k] = v
  })
  return out
}

/** Facebook fbc/fbp helpers (if pixel present they exist as first-party cookies) */
function readFbcFbp(): { fbc?: string; fbp?: string } {
  if (!isBrowser()) return {}
  const c = document.cookie
  const get = (name: string) => {
    const m = c.match(new RegExp(`(?:^|; )${name}=([^;]+)`))
    return m ? decodeURIComponent(m[1]) : undefined
  }
  return { fbc: get('_fbc'), fbp: get('_fbp') }
}

export function getStoredAttribution(): Attribution | undefined {
  try {
    const raw =
      readCookie(COOKIE_NAME) ||
      (isBrowser()
        ? (window.localStorage.getItem(COOKIE_NAME) ?? undefined)
        : undefined)
    return raw ? (JSON.parse(raw) as Attribution) : undefined
  } catch {
    return undefined
  }
}

export function setStoredAttribution(a: Attribution): void {
  const json = JSON.stringify(a)
  writeCookie(COOKIE_NAME, json)
  if (isBrowser()) {
    try {
      window.localStorage.setItem(COOKIE_NAME, json)
    } catch {
      /* intentionally empty */
    }
  }
}

/** Merge URL params into stored attribution; set first/last touch timestamps. */
export function initAttribution(): Attribution | undefined {
  if (!isBrowser()) return undefined
  const q = parseQuery()
  const first = getStoredAttribution() ?? {}
  const nowIso = new Date().toISOString()

  const merged: Attribution = {
    ...first,
    utm_source: q.utm_source ?? first.utm_source,
    utm_medium: q.utm_medium ?? first.utm_medium,
    utm_campaign: q.utm_campaign ?? first.utm_campaign,
    utm_content: q.utm_content ?? first.utm_content,
    utm_term: q.utm_term ?? first.utm_term,
    gclid: q.gclid ?? first.gclid,
    gbraid: q.gbraid ?? first.gbraid,
    wbraid: q.wbraid ?? first.wbraid,
    fbclid: q.fbclid ?? first.fbclid,
    ...readFbcFbp(),
    landing_page_url: first.landing_page_url ?? window.location.href,
    referrer: first.referrer ?? document.referrer,
    first_touch_ts: first.first_touch_ts ?? nowIso,
    last_touch_ts: nowIso,
  }

  setStoredAttribution(merged)
  return merged
}

export type LeadPayload = {
  event_name: 'lead_submitted' | 'lead_qualified' | 'deal_won'
  user: {
    email: string
    phone: string
    name: string // ✅ required full name
  }
  lead: {
    lead_id: string
    form_name?: string
    value?: number
    currency?: string
  }
  attribution?: Attribution
}

export async function postLead(payload: LeadPayload): Promise<unknown> {
  const attribution =
    payload.attribution ?? getStoredAttribution() ?? initAttribution() ?? {}
  const endpoint = process.env.NEXT_PUBLIC_TRACK_LEAD_URL || '/api/quote/leads'

  // If using local endpoint, upsert via PUT with a minimal, lenient payload
  if (endpoint.startsWith('/api/quote/leads')) {
    const body = {
      name: payload.user?.name,
      email: payload.user?.email,
      phone: payload.user?.phone,
      referral: attribution.utm_source || attribution.referrer || undefined,
    } as const
    try {
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      })
    } catch {
      // Swallow tracking errors for local autosave path
    }
    return {}
  }

  // External endpoint: keep original behavior
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, attribution }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`trackLead failed: ${res.status} ${text}`)
  }
  return res.json()
}
