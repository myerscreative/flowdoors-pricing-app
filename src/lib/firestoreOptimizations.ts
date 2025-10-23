/**
 * Firestore Performance Optimizations
 *
 * This module provides utilities for improving Firestore query performance
 */

/**
 * Default page size for paginated queries
 */
export const DEFAULT_PAGE_SIZE = 50

/**
 * Maximum page size to prevent memory issues
 */
export const MAX_PAGE_SIZE = 500

/**
 * Cache duration in milliseconds (5 minutes)
 */
export const CACHE_DURATION = 5 * 60 * 1000

/**
 * Query options for Firestore queries
 */
export interface QueryOptions {
  /** Number of documents to fetch */
  limit?: number
  /** Whether to use cached data if available */
  useCache?: boolean
  /** Whether to fetch from server only (bypass cache) */
  forceRefresh?: boolean
}

/**
 * Validates and normalizes query limit
 */
export function normalizeLimit(limit?: number): number {
  if (!limit || limit < 1) {
    return DEFAULT_PAGE_SIZE
  }
  return Math.min(limit, MAX_PAGE_SIZE)
}

/**
 * Get cache key for a query
 */
export function getCacheKey(
  collectionName: string,
  filters?: Record<string, unknown>
): string {
  const filterKey = filters ? JSON.stringify(filters) : 'all'
  return `firestore_${collectionName}_${filterKey}`
}

/**
 * Check if cached data is still valid
 */
export function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

/**
 * Performance monitoring helper
 */
export class QueryTimer {
  private startTime: number

  constructor(private queryName: string) {
    this.startTime = performance.now()
  }

  end(source: 'cache' | 'server', docCount: number): void {
    const duration = performance.now() - this.startTime
    console.warn(
      `[Firestore] ${this.queryName}: ${docCount} docs from ${source} in ${duration.toFixed(0)}ms`
    )
  }
}

/**
 * Batch documents into chunks for processing
 */
export function batchDocuments<T>(documents: T[], batchSize = 50): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < documents.length; i += batchSize) {
    batches.push(documents.slice(i, i + batchSize))
  }
  return batches
}

/**
 * Retry helper for failed queries
 */
export async function retryQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(
        `Query attempt ${attempt}/${maxRetries} failed:`,
        lastError.message
      )

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw lastError || new Error('Query failed after retries')
}
