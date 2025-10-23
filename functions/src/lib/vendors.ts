import type { NormalizedEvent } from './attribution'

type Forward = { status: 'sent' | 'skipped'; reason?: string }

export async function sendToGA4(_e: NormalizedEvent): Promise<Forward> {
  const mid = process.env.GA4_MEASUREMENT_ID
  const sec = process.env.GA4_API_SECRET
  if (!mid || !sec) return { status: 'skipped', reason: 'GA4 env not set' }
  // Intentionally disabled in this step (uncomment when secrets are provided)
  return { status: 'skipped', reason: 'GA4 forwarding disabled in dev' }
}

export async function sendToGoogleAds(_e: NormalizedEvent): Promise<Forward> {
  const cid = process.env.GADS_CUSTOMER_ID
  const token = process.env.GADS_DEV_TOKEN
  if (!cid || !token)
    return { status: 'skipped', reason: 'Google Ads env not set' }
  return { status: 'skipped', reason: 'Google Ads forwarding disabled in dev' }
}

export async function sendToMeta(_e: NormalizedEvent): Promise<Forward> {
  const pixel = process.env.META_PIXEL_ID
  const access = process.env.META_ACCESS_TOKEN
  if (!pixel || !access)
    return { status: 'skipped', reason: 'Meta env not set' }
  return { status: 'skipped', reason: 'Meta forwarding disabled in dev' }
}
