// src/lib/analytics.ts

type Primitive = string | number | boolean | null | undefined
type Json = Primitive | Json[] | { [key: string]: Json }
export type AnalyticsProperties = Record<string, Json>

declare global {
  interface Window {
    gtag?: (..._args: unknown[]) => void // <- rename to _args
    dataLayer?: Array<Record<string, unknown>>
  }
}

/**
 * Send a “page view” style event.
 */
export function page(name?: string, props?: AnalyticsProperties): void {
  if (typeof window === 'undefined') return

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: name,
      ...props,
    })
  }

  // GTM
  window.dataLayer?.push({
    event: 'page_view',
    page_title: name,
    ...props,
  })
}

/**
 * Identify a user (best-effort; GA4 doesn’t persist traits by default).
 */
export function identify(userId: string, traits?: AnalyticsProperties): void {
  if (typeof window === 'undefined') return

  // GA4 set user id
  if (typeof window.gtag === 'function') {
    window.gtag('set', { user_id: userId, ...traits })
  }

  // GTM custom event
  window.dataLayer?.push({
    event: 'identify',
    user_id: userId,
    ...traits,
  })
}

/**
 * Track a custom event with optional properties.
 */
export function track(eventName: string, props?: AnalyticsProperties): void {
  if (typeof window === 'undefined') return

  // GA4
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, props ?? {})
  }

  // GTM
  window.dataLayer?.push({
    event: eventName,
    ...(props ?? {}),
  })
}
