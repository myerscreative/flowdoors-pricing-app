export async function GET() {
  const periods = ['2025-06', '2025-07', '2025-08', '2025-09']
  const accuracy = periods.map((p, i) => ({
    period: p,
    forecast: 180000 + i * 15000,
    actual: 175000 + i * 14000,
    accuracyPct: 92 + i,
  }))
  const commitBestPipeline = periods.map((p, i) => ({
    period: p,
    commit: 120000 + i * 8000,
    bestCase: 150000 + i * 10000,
    pipeline: 200000 + i * 12000,
  }))
  const deltas = periods.map((p, i) => ({ period: p, delta: (i - 1) * 6000 }))
  const majorDeals = [
    { deal: 'MS-2041', expectedCloseDate: '2025-09-12', amount: 78000 },
    { deal: 'BF-1982', expectedCloseDate: '2025-09-25', amount: 56000 },
  ]
  const projections = periods.map((p, i) => ({
    period: p,
    projectedRevenue: 210000 + i * 16000,
  }))

  return Response.json({
    accuracy,
    commitBestPipeline,
    deltas,
    majorDeals,
    projections,
  })
}
