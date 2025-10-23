export async function GET() {
  const alerts = [
    { deal: 'Q-1039', reason: 'Close date slipped 2x', severity: 'high' },
    { deal: 'Q-1042', reason: 'No activity 10d', severity: 'medium' },
  ]

  const geo = [
    { region: 'CA', revenue: 420000 },
    { region: 'AZ', revenue: 180000 },
    { region: 'NV', revenue: 120000 },
  ]

  const productBreakdown = [
    { product: 'Multi-Slide', revenue: 380000 },
    { product: 'Bi-Fold', revenue: 260000 },
    { product: 'Ultra-Slim', revenue: 140000 },
  ]

  const mrr = [
    { period: '2025-06', mrr: 22000 },
    { period: '2025-07', mrr: 23500 },
    { period: '2025-08', mrr: 24800 },
  ]

  return Response.json({ alerts, geo, productBreakdown, mrr })
}
