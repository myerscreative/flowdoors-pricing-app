export async function GET() {
  // Mock data for Sales Performance Overview
  const now = new Date()
  const months: string[] = [...Array(12).keys()].map((i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const revenueTrends = months.map((m, i) => ({
    period: m,
    revenue: 65000 + i * 2500 + (i % 3) * 1200,
  }))
  const yoy = months.map((m, i) => ({
    month: m.slice(5),
    current: 70000 + i * 3000,
    last: 58000 + i * 2200,
  }))
  const avgDealSize = months.map((m, i) => ({
    period: m,
    avgDealSize: 8200 + (i % 5) * 250,
  }))
  const velocity = months.map((m, i) => ({
    period: m,
    avgDaysLeadToClose: 32 - (i % 6),
  }))

  const periodRevenue = 185000
  const periodTarget = 200000

  return Response.json({
    periodRevenue,
    periodTarget,
    revenueTrends,
    yoy,
    avgDealSize,
    velocity,
  })
}
