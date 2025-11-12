/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis-backed rate limiting (e.g., @upstash/ratelimit)
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Optional identifier for the rate limit bucket (defaults to IP) */
  identifier?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the request (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = `${identifier}:${config.maxRequests}:${config.windowMs}`

  let entry = rateLimitStore.get(key)

  // Create new entry if doesn't exist or is expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
  }

  // Increment count
  entry.count++

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const success = entry.count <= config.maxRequests

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: entry.resetTime,
  }
}

/**
 * Get client IP address from request headers
 * @param headers - Request headers
 * @returns Client IP address
 */
export function getClientIp(headers: Headers): string {
  // Check various headers for real IP (handles proxies, load balancers)
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // Fallback to a default
  return 'unknown'
}

/**
 * Rate limit presets for common use cases
 */
export const RateLimitPresets = {
  /** Strict: 10 requests per minute */
  strict: { maxRequests: 10, windowMs: 60 * 1000 },
  /** Standard: 30 requests per minute */
  standard: { maxRequests: 30, windowMs: 60 * 1000 },
  /** Lenient: 100 requests per minute */
  lenient: { maxRequests: 100, windowMs: 60 * 1000 },
  /** Public API: 50 requests per minute */
  publicApi: { maxRequests: 50, windowMs: 60 * 1000 },
  /** Quote submission: 5 requests per hour */
  quoteSubmission: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  /** Lead submission: 3 requests per hour */
  leadSubmission: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
} as const
