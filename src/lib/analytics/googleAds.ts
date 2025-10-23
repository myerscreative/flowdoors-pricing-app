/**
 * Google Ads Conversion Tracking (GTM Implementation)
 *
 * Tracks conversions to Google Ads via Google Tag Manager (GTM).
 * Pushes conversion data to GTM's dataLayer for centralized tag management.
 * Integrates with attribution tracking to send gclid when available.
 *
 * Note: This no longer calls gtag() directly. Instead, it pushes events to
 * the dataLayer, and GTM handles firing the actual Google Ads conversion tag.
 */

// Extend window type for GTM dataLayer
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

/**
 * Tracks a conversion event to Google Ads via GTM dataLayer
 *
 * @param conversionLabel - The conversion label from Google Ads (format: XXXXXXXXXXX)
 * @param value - Optional conversion value (e.g., lead value)
 * @param gclid - Optional Google Click ID from attribution tracking
 * @param transactionId - Optional unique transaction/lead ID
 * @returns Promise that resolves when tracking completes
 */
export async function trackConversion(
  conversionLabel: string,
  value?: number,
  gclid?: string,
  transactionId?: string
): Promise<void> {
  // Don't track if no conversion label provided
  if (!conversionLabel) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Google Ads GTM] No conversion label provided, skipping tracking'
      )
    }
    return
  }

  try {
    // Initialize dataLayer if it doesn't exist
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
    } else {
      // Not in browser environment
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[Google Ads GTM] Not in browser environment, skipping tracking'
        )
      }
      return
    }

    // Push conversion event to GTM dataLayer
    const conversionData = {
      event: 'conversion',
      conversionValue: value || 0,
      currency: 'USD',
      gclid: gclid || undefined,
      transactionId: transactionId || undefined,
      timestamp: new Date().toISOString(),
    }

    window.dataLayer.push(conversionData)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Google Ads GTM] Conversion pushed to dataLayer:', {
        value: value || 0,
        gclid: gclid || '(not available)',
        transactionId: transactionId || '(not provided)',
        currency: 'USD',
      })
      console.log('[Google Ads GTM] Full dataLayer event:', conversionData)
      console.log('[Google Ads GTM] Current dataLayer:', window.dataLayer)
    }
  } catch (error) {
    // Silently fail in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Google Ads GTM] Error pushing to dataLayer:', error)
    }
  }
}
