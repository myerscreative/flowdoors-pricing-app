import { z } from 'zod'
import { randomUUID } from 'crypto'
import type { Request } from 'firebase-functions/v2/https'
import { sha256, normalizePhoneToE164 } from './hash'

export const EventSchema = z.object({
  event_id: z.string().default(() => randomUUID()),
  event_name: z.enum(['lead_submitted', 'lead_qualified', 'deal_won']),
  event_time: z.string().datetime().optional(),
  user: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .optional()
    .default({}),
  attribution: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
      utm_term: z.string().optional(),
      gclid: z.string().optional(),
      gbraid: z.string().optional(),
      wbraid: z.string().optional(),
      fbclid: z.string().optional(),
      fbc: z.string().optional(),
      fbp: z.string().optional(),
      landing_page_url: z.string().optional(),
      referrer: z.string().optional(),
      first_touch_ts: z.string().optional(),
      last_touch_ts: z.string().optional(),
    })
    .optional()
    .default({}),
  lead: z
    .object({
      lead_id: z.string().default(() => randomUUID()),
      form_name: z.string().optional(),
      value: z.number().optional(),
      currency: z.string().default('USD'),
    })
    .default({ currency: 'USD', lead_id: randomUUID() }),
})

export type NormalizedEvent = z.infer<typeof EventSchema> & {
  user: {
    email_hashed?: string
    phone_hashed?: string
    ip?: string
    user_agent?: string
  }
  event_ts: number
}

export function normalizeEvent(req: Request): NormalizedEvent {
  const parsed = EventSchema.parse(req.body ?? {})
  const nowIso = parsed.event_time ?? new Date().toISOString()
  const ua = req.get('user-agent') ?? undefined
  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)
      ?.split(',')[0]
      ?.trim() ||
    (req as unknown as { ip?: string }).ip ||
    undefined

  const email_hashed = sha256(parsed.user?.email)
  const phoneE164 = normalizePhoneToE164(parsed.user?.phone)
  const phone_hashed = sha256(phoneE164)

  return {
    ...parsed,
    event_time: nowIso,
    event_ts: Math.floor(new Date(nowIso).getTime() / 1000),
    user: { ...parsed.user, email_hashed, phone_hashed, ip, user_agent: ua },
  }
}
