/**
 * Data caching service using localStorage with cache invalidation
 * Falls back to in-memory cache if localStorage is unavailable
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
}

const CACHE_VERSION = '1.0'
const DEFAULT_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

class DataCache {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map()
  private isBrowser: boolean

  constructor() {
    this.isBrowser = typeof window !== 'undefined'
  }

  /**
   * Get cached data if valid, otherwise return null
   */
  get<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
    try {
      // Try localStorage first
      if (this.isBrowser) {
        const cached = localStorage.getItem(key)
        if (cached) {
          const entry: CacheEntry<T> = JSON.parse(cached)

          // Check version and expiry
          if (
            entry.version === CACHE_VERSION &&
            Date.now() - entry.timestamp < ttl
          ) {
            return entry.data
          } else {
            // Expired or version mismatch - remove it
            localStorage.removeItem(key)
          }
        }
      }

      // Fallback to memory cache
      const memEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined
      if (memEntry) {
        if (
          memEntry.version === CACHE_VERSION &&
          Date.now() - memEntry.timestamp < ttl
        ) {
          return memEntry.data
        } else {
          this.memoryCache.delete(key)
        }
      }

      return null
    } catch (error) {
      console.warn('Error reading from cache:', error)
      return null
    }
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      }

      // Try localStorage
      if (this.isBrowser) {
        try {
          localStorage.setItem(key, JSON.stringify(entry))
        } catch (e) {
          // QuotaExceededError or other storage errors
          console.warn('localStorage unavailable, using memory cache only:', e)
        }
      }

      // Always set in memory cache as fallback
      this.memoryCache.set(key, entry)
    } catch (error) {
      console.warn('Error writing to cache:', error)
    }
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    try {
      if (this.isBrowser) {
        localStorage.removeItem(key)
      }
      this.memoryCache.delete(key)
    } catch (error) {
      console.warn('Error invalidating cache:', error)
    }
  }

  /**
   * Invalidate all cache entries with a specific prefix
   */
  invalidatePrefix(prefix: string): void {
    try {
      if (this.isBrowser) {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key)
          }
        })
      }

      // Clear memory cache entries with prefix
      Array.from(this.memoryCache.keys()).forEach((key) => {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key)
        }
      })
    } catch (error) {
      console.warn('Error invalidating cache prefix:', error)
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    try {
      if (this.isBrowser) {
        // Only clear our cache keys, not all localStorage
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key)
          }
        })
      }
      this.memoryCache.clear()
    } catch (error) {
      console.warn('Error clearing cache:', error)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { memorySize: number; localStorageKeys: number } {
    const stats = {
      memorySize: this.memoryCache.size,
      localStorageKeys: 0,
    }

    if (this.isBrowser) {
      const keys = Object.keys(localStorage)
      stats.localStorageKeys = keys.filter((k) => k.startsWith('cache_')).length
    }

    return stats
  }
}

// Export singleton instance
export const dataCache = new DataCache()

/**
 * Helper function to create cache keys
 */
export function createCacheKey(
  prefix: string,
  params: Record<string, string | number | boolean>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return `cache_${prefix}_${sortedParams}`
}
