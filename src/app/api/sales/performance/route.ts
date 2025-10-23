export async function GET() {
  const leaderboard = [
    { rep: 'Alex', attainmentPct: 112, quota: 500000, revenue: 560000 },
    { rep: 'Brooke', attainmentPct: 96, quota: 500000, revenue: 480000 },
    { rep: 'Chris', attainmentPct: 74, quota: 500000, revenue: 370000 },
  ]

  const activities = [
    { rep: 'Alex', calls: 120, meetings: 22, proposals: 14 },
    { rep: 'Brooke', calls: 98, meetings: 18, proposals: 12 },
    { rep: 'Chris', calls: 80, meetings: 12, proposals: 9 },
  ]

  const winRates = [
    { rep: 'Alex', winRatePct: 31 },
    { rep: 'Brooke', winRatePct: 27 },
    { rep: 'Chris', winRatePct: 20 },
  ]

  const newOpps = [
    { period: '2025-06', count: 38 },
    { period: '2025-07', count: 42 },
    { period: '2025-08', count: 47 },
  ]

  const cycleByRep = [
    { rep: 'Alex', avgDays: 28 },
    { rep: 'Brooke', avgDays: 33 },
    { rep: 'Chris', avgDays: 37 },
  ]

  return Response.json({
    leaderboard,
    activities,
    winRates,
    newOpps,
    cycleByRep,
  })
}
