/**
 * Firebase Performance Monitoring utilities
 * Track page load times, API calls, and custom metrics
 */

type PerformanceTrace = {
  name: string
  startTime: number
  metrics: Record<string, number>
  attributes: Record<string, string>
}

class PerformanceMonitor {
  private traces: Map<string, PerformanceTrace> = new Map()
  private isBrowser: boolean

  constructor() {
    this.isBrowser = typeof window !== 'undefined'
  }

  /**
   * Start a performance trace
   */
  startTrace(name: string): void {
    if (!this.isBrowser) return

    const trace: PerformanceTrace = {
      name,
      startTime: performance.now(),
      metrics: {},
      attributes: {},
    }

    this.traces.set(name, trace)
    console.warn(`[Performance] Started trace: ${name}`)
  }

  /**
   * Stop a performance trace and log the duration
   */
  stopTrace(name: string): number | null {
    if (!this.isBrowser) return null

    const trace = this.traces.get(name)
    if (!trace) {
      console.warn(`[Performance] No trace found for: ${name}`)
      return null
    }

    const duration = performance.now() - trace.startTime
    console.warn(
      `[Performance] ${name}: ${duration.toFixed(2)}ms`,
      trace.metrics,
      trace.attributes
    )

    // Log to console for debugging
    if (duration > 2000) {
      console.warn(
        `[Performance WARNING] ${name} took ${duration.toFixed(2)}ms (>2s)`
      )
    }

    // Clean up
    this.traces.delete(name)

    return duration
  }

  /**
   * Add a custom metric to a trace
   */
  setMetric(traceName: string, metricName: string, value: number): void {
    const trace = this.traces.get(traceName)
    if (trace) {
      trace.metrics[metricName] = value
    }
  }

  /**
   * Add a custom attribute to a trace
   */
  setAttribute(traceName: string, key: string, value: string): void {
    const trace = this.traces.get(traceName)
    if (trace) {
      trace.attributes[key] = value
    }
  }

  /**
   * Measure an async operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    attributes?: Record<string, string>
  ): Promise<T> {
    this.startTrace(name)

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        this.setAttribute(name, key, value)
      })
    }

    try {
      const result = await operation()
      this.stopTrace(name)
      return result
    } catch (error) {
      this.setAttribute(name, 'error', 'true')
      this.stopTrace(name)
      throw error
    }
  }

  /**
   * Track a network request
   */
  async trackNetworkRequest<T>(
    url: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const traceName = `network_${url.split('?')[0].replace(/\//g, '_')}`
    const startTime = performance.now()

    this.startTrace(traceName)
    this.setAttribute(traceName, 'url', url)

    try {
      const result = await requestFn()
      const duration = performance.now() - startTime

      this.setMetric(traceName, 'response_time', duration)
      this.setAttribute(traceName, 'status', 'success')
      this.stopTrace(traceName)

      return result
    } catch (error) {
      this.setAttribute(traceName, 'status', 'error')
      this.setAttribute(
        traceName,
        'error_message',
        error instanceof Error ? error.message : 'Unknown error'
      )
      this.stopTrace(traceName)
      throw error
    }
  }

  /**
   * Get Web Vitals metrics (if available)
   */
  reportWebVitals(): void {
    if (!this.isBrowser) return

    // Try to use Web Vitals API if available
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry && 'renderTime' in lastEntry) {
            const lcp = (lastEntry.renderTime ||
              (lastEntry as PerformancePaintTiming).startTime) as number
            console.warn(`[Web Vitals] LCP: ${lcp.toFixed(2)}ms`)
          }
        })
        lcpObserver.observe({
          type: 'largest-contentful-paint',
          buffered: true,
        })
      } catch {
        // Observer not supported
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if ('processingStart' in entry) {
              const fid =
                (entry as PerformanceEventTiming).processingStart -
                entry.startTime
              console.warn(`[Web Vitals] FID: ${fid.toFixed(2)}ms`)
            }
          })
        })
        fidObserver.observe({ type: 'first-input', buffered: true })
      } catch {
        // Observer not supported
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsScore = 0
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!(entry as LayoutShift).hadRecentInput) {
              clsScore += (entry as LayoutShift).value
            }
          })
          console.warn(`[Web Vitals] CLS: ${clsScore.toFixed(4)}`)
        })
        clsObserver.observe({ type: 'layout-shift', buffered: true })
      } catch {
        // Observer not supported
      }
    }

    // Navigation Timing API
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const [navigation] = window.performance.getEntriesByType(
        'navigation'
      ) as PerformanceNavigationTiming[]
      if (navigation) {
        const metrics = {
          'DNS Lookup':
            navigation.domainLookupEnd - navigation.domainLookupStart,
          'TCP Connection': navigation.connectEnd - navigation.connectStart,
          'Request Time': navigation.responseStart - navigation.requestStart,
          'Response Time': navigation.responseEnd - navigation.responseStart,
          'DOM Processing': navigation.domComplete - navigation.domInteractive,
          'Total Load': navigation.loadEventEnd - navigation.fetchStart,
        }

        console.warn('[Navigation Timing]', metrics)
      }
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Type for layout shift
interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}
