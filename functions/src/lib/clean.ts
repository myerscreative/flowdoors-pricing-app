export function cleanUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => cleanUndefined(v)) as T
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue
      out[k] = cleanUndefined(v)
    }
    return out as T
  }
  return value
}
