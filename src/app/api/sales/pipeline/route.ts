export async function GET() {
  const stages = [
    { stage: 'Prospect', value: 450000, count: 120 },
    { stage: 'Qualified', value: 320000, count: 84 },
    { stage: 'Proposal', value: 240000, count: 56 },
    { stage: 'Negotiation', value: 150000, count: 24 },
    { stage: 'Commit', value: 90000, count: 12 },
  ]

  const quota = 300000
  const pipelineValue = stages.reduce((sum, s) => sum + s.value, 0)
  const coverageRatio = pipelineValue / quota

  const atRisk = [
    {
      id: 'Q-1012',
      amount: 36000,
      riskReason: 'Stalled 21d',
      closeDate: '2025-09-03',
    },
    {
      id: 'Q-1039',
      amount: 52000,
      riskReason: 'Competitor lead',
      closeDate: '2025-08-28',
    },
  ]

  const stageTransitions = [
    { from: 'Prospect', to: 'Qualified', count: 62 },
    { from: 'Qualified', to: 'Proposal', count: 41 },
    { from: 'Proposal', to: 'Negotiation', count: 18 },
    { from: 'Negotiation', to: 'Commit', count: 11 },
  ]

  const weightedForecast = [
    { period: '2025-08', weightedAmount: 120000 },
    { period: '2025-09', weightedAmount: 145000 },
    { period: '2025-10', weightedAmount: 132000 },
  ]

  return Response.json({
    byStage: stages,
    coverage: { pipelineValue, quota, coverageRatio },
    atRisk,
    stageTransitions,
    weightedForecast,
  })
}
