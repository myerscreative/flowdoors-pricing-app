# Testing Marketing Dashboard Optimizations

## Quick Start

### 1. Start the Development Server

```bash
cd "/Users/robertmyers/Documents/Apps/ScenicDoors Pricing App/ScenicPricingApp-working"
pnpm dev
```

### 2. Open Marketing Dashboard

Navigate to: `http://localhost:3000/marketing`

### 3. Test Scenarios

#### A. Initial Load Performance (No Cache)

1. Clear cache: Open DevTools → Application → Storage → Clear site data
2. Open Network tab
3. Reload page
4. **Expected:** Page renders in <2 seconds
5. **Look for:** Console logs showing:
   ```
   [marketing-api] Total processing time: ~1500ms
   Marketing Dashboard: API response in ~1500ms
   ```

#### B. Cached Load Performance

1. Reload the page again (cache should now exist)
2. **Expected:** Page renders in <100ms
3. **Look for:** Console logs showing:
   ```
   Marketing Dashboard: Using cached data
   ```
4. Watch for the "Cached data" indicator in the header
5. Fresh data should load in the background (watch for "Updating..." indicator)

#### C. Cache Invalidation

1. Click "Refresh" button
2. **Expected:** Forces fresh data fetch, bypasses cache
3. **Look for:** Loading spinner on Refresh button

#### D. Date Range Filtering

1. Change date range to "Last 30 Days"
2. **Expected:** New data fetches for that range
3. Cache key changes (different data cached per date range)

#### E. Lazy Loading (Drilldown)

1. Click on any source card (Google, Facebook, etc.)
2. **Expected:** Modal opens immediately
3. **Expected:** Drilldown data loads separately (not on initial page load)
4. **Look for:** Loading indicator in modal while drilldown data fetches
5. Close and re-open modal - drilldown data should be cached

### 4. Performance Metrics

#### Check Chrome DevTools

1. Open DevTools → Lighthouse
2. Run performance audit
3. **Target metrics:**
   - First Contentful Paint: <1s
   - Largest Contentful Paint: <2s
   - Time to Interactive: <2.5s
   - Total Blocking Time: <200ms

#### Check Console Logs

Look for these performance indicators:

```
[marketing-api] Fetched X leads in ~500ms
[marketing-api] Fetched X quotes in ~600ms
[marketing-api] Total processing time: ~1200ms
Marketing Dashboard: API response in ~1500ms, status: 200
```

### 5. Cache Testing

#### View Cache in DevTools

1. Open DevTools → Application → Local Storage
2. Look for keys starting with `cache_marketing_`
3. **Expected keys:**
   - `cache_marketing_summary_from=all&to=all`
   - `cache_marketing_drilldown_source=google&from=all&to=all` (after opening modal)

#### Inspect Cache Contents

```javascript
// In browser console
const cacheKey = 'cache_marketing_summary_from=all&to=all'
const cached = localStorage.getItem(cacheKey)
console.log('Cache contents:', JSON.parse(cached))
```

#### Test Cache Stats

```javascript
// In browser console (if you import the module in dev)
import { dataCache } from '@/lib/dataCache'
console.log(dataCache.getStats())
// Should show: { memorySize: X, localStorageKeys: Y }
```

#### Clear Specific Cache

```javascript
// In browser console
localStorage.removeItem('cache_marketing_summary_from=all&to=all')
// Or clear all marketing caches
Object.keys(localStorage).forEach((key) => {
  if (key.startsWith('cache_marketing_')) {
    localStorage.removeItem(key)
  }
})
```

### 6. Network Testing

#### Simulate Slow Connection

1. DevTools → Network → Throttling → "Slow 3G"
2. Reload page
3. **Expected:**
   - Cached data appears immediately (if exists)
   - Background refresh takes longer but doesn't block UI
   - Loading indicators show appropriately

#### Monitor Firebase Requests

1. Network tab → Filter: "firestore" or "marketing"
2. **Expected on initial load:**
   - 1 request to `/api/marketing/summary`
   - No direct Firestore requests (handled server-side)
3. **Expected on subsequent loads:**
   - Still 1 request (background refresh)
   - But page renders from cache immediately

### 7. Error Handling

#### Test Offline Behavior

1. DevTools → Network → Offline
2. Reload page
3. **Expected:** Cached data shows (if exists)
4. Error message if no cache available

#### Test API Failure

1. Stop the dev server temporarily
2. Click "Refresh" button
3. **Expected:**
   - Error logged to console
   - Falls back to mock data or keeps existing data
   - User sees error message

### 8. Performance Benchmarks

#### Before Optimization (baseline to compare against)

```
Initial Load: 10-15 seconds
- Firebase queries: 9-14s (sequential)
- Network: 1-2s
- Rendering: 0.5s

Subsequent Loads: 10-15 seconds (no caching)
Firebase Reads: 2000-3000 documents per load
```

#### After Optimization (target metrics)

```
Initial Load: 1.5-2 seconds ✅
- Firebase queries: 1-2s (parallel, limited)
- Network: 0.3s
- Rendering: 0.2s

Subsequent Loads: <100ms ✅
- Cache retrieval: 10-50ms
- Rendering: 50ms
- Background refresh: 1.5s (non-blocking)

Firebase Reads: 100-200 documents per load ✅
```

## Validation Checklist

- [ ] Initial page load completes in <2 seconds
- [ ] Subsequent loads show cached data in <100ms
- [ ] "Cached data" indicator appears when viewing cached data
- [ ] "Updating..." indicator appears during background refresh
- [ ] Date range changes trigger new data fetch
- [ ] Drilldown modals load lazily (not on initial page load)
- [ ] Refresh button forces fresh data fetch
- [ ] Cache persists across page reloads
- [ ] Cache expires after 1 hour (TTL)
- [ ] Loading skeletons show during initial load
- [ ] Performance logs appear in console
- [ ] No ESLint errors or warnings
- [ ] TypeScript compiles without errors

## Troubleshooting

### Page Still Slow

1. Check browser console for errors
2. Verify Firebase credentials are configured
3. Check if Firestore indexes are deployed:
   ```bash
   firebase deploy --only firestore:indexes
   ```
4. Look for console logs showing query times

### Cache Not Working

1. Check if localStorage is available:
   ```javascript
   console.log(
     'localStorage available:',
     typeof window !== 'undefined' && 'localStorage' in window
   )
   ```
2. Check browser privacy settings (some block localStorage)
3. Verify cache keys in Application → Local Storage
4. Try clearing and rebuilding cache

### Stale Data Shown

1. Click "Refresh" button to force fresh fetch
2. Adjust cache TTL in code if needed:
   ```typescript
   const CACHE_TTL = 30 * 60 * 1000 // 30 minutes instead of 1 hour
   ```
3. Clear specific cache manually

### Firebase Quota Errors

1. Check Firebase console for quota limits
2. Verify `.limit()` is applied to queries
3. Ensure caching is working (reduces reads)
4. Check for infinite loops in useEffect

## Performance Tips

### Monitoring in Production

1. Enable Firebase Performance Monitoring
2. Track Web Vitals with Google Analytics
3. Monitor error rates in Sentry/similar
4. Set up alerts for slow page loads

### Further Optimizations

1. **Service Workers:** Cache API responses at network level
2. **CDN:** Cache static assets on edge servers
3. **Image Optimization:** Use Next.js Image component
4. **Code Splitting:** Lazy load heavy components
5. **Data Aggregation:** Pre-compute summaries in Cloud Functions

## Resources

- [Full Optimization Documentation](./MARKETING_PERFORMANCE_OPTIMIZATION.md)
- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

## Need Help?

If you encounter issues:

1. Check console logs for detailed error messages
2. Verify Network tab shows expected request patterns
3. Review the optimization documentation
4. Check that all dependencies are installed: `pnpm install`









