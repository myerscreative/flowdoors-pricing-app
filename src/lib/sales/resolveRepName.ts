export type AppUser = {
  id: string
  name: string
  role?: string
  region?: string
  salesperson_id?: string
}

const looksLikeId = (s: string) =>
  /^([A-Z]{2,3})-[A-Z0-9]+$/i.test(s) || s.startsWith('QUOTE')
const normalizeId = (s: string) => s.replace(/^PS-/i, 'SP-')

export function resolveRepName(
  q: { salesRep?: string; salesperson_id?: string },
  users: AppUser[]
): string {
  const rawName = (q.salesRep ?? '').trim()
  const rawId = (q.salesperson_id ?? '').trim()

  if (rawName && !looksLikeId(rawName)) {
    const byName = users.find((u) => u.name === rawName)
    return byName?.name ?? rawName
  }

  const candidates = [rawId, normalizeId(rawId), normalizeId(rawName)].filter(
    Boolean
  ) as string[]
  for (const cand of candidates) {
    const hit = users.find((u) => u.salesperson_id === cand || u.id === cand)
    if (hit) return hit.name
  }

  return rawName || rawId || 'Unassigned'
}
