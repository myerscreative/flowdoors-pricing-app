export async function GET() {
  const conversionBySource = [
    { bucket: 'Web', ratePct: 14 },
    { bucket: 'Referral', ratePct: 22 },
    { bucket: 'Events', ratePct: 10 },
    { bucket: 'Partners', ratePct: 18 },
  ]

  const conversionByStage = [
    { bucket: 'Prospect→Qualified', ratePct: 52 },
    { bucket: 'Qualified→Proposal', ratePct: 44 },
    { bucket: 'Proposal→Negotiation', ratePct: 32 },
    { bucket: 'Negotiation→Won', ratePct: 58 },
  ]

  const cac = [
    { period: '2025-06', cac: 680 },
    { period: '2025-07', cac: 640 },
    { period: '2025-08', cac: 620 },
  ]

  const sqls = [
    { period: '2025-06', count: 120 },
    { period: '2025-07', count: 136 },
    { period: '2025-08', count: 142 },
  ]

  const quoteToClose = [
    { period: '2025-06', ratioPct: 18 },
    { period: '2025-07', ratioPct: 21 },
    { period: '2025-08', ratioPct: 24 },
  ]

  const lostReasons = [
    { reason: 'Price', count: 18 },
    { reason: 'Timing', count: 11 },
    { reason: 'Competition', count: 9 },
    { reason: 'Scope', count: 6 },
  ]

  return Response.json({
    conversionBySource,
    conversionByStage,
    cac,
    sqls,
    quoteToClose,
    lostReasons,
  })
}
