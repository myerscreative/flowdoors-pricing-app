import { cn } from '@/lib/utils'

type Row = {
  cohortLabel: string
  cohortStartISO: string
  totalLeads: number
  totalConversions: number
  rate: number
  // dynamic week fields: week0..weekN
  [key: `week${number}`]: number | string
}

export default function CohortHeatmapTable({
  rows,
  weeks,
}: {
  rows: Row[]
  weeks: number
}) {
  const maxCell = Math.max(
    1,
    ...rows.flatMap((r) =>
      Array.from({ length: weeks }, (_, i) => Number(r[`week${i}`] || 0))
    )
  )

  const tint = (n: number) => {
    const pct = n / maxCell // 0..1
    // light -> deeper rose
    const alpha = Math.min(0.85, 0.15 + pct * 0.7)
    return `rgba(244, 63, 94, ${alpha})` // tailwind rose-500 base in rgba
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 sticky left-0 bg-gray-50">
                Cohort
              </th>
              {Array.from({ length: weeks }).map((_, i) => (
                <th key={i} className="px-3 py-3 text-center">
                  Week {i}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Total Leads</th>
              <th className="px-4 py-3 text-right">Conversions</th>
              <th className="px-4 py-3 text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={r.cohortStartISO}
                className={cn(idx % 2 ? 'bg-white' : 'bg-gray-50/50')}
              >
                <td className="px-4 py-2 font-medium sticky left-0 bg-inherit">
                  {r.cohortLabel}
                </td>
                {Array.from({ length: weeks }).map((_, i) => {
                  const v = Number(r[`week${i}`] || 0)
                  return (
                    <td key={i} className="px-2 py-1 text-center">
                      <div
                        className="rounded-md text-xs font-semibold text-white inline-block min-w-[2rem] px-2 py-1"
                        style={{
                          backgroundColor: v ? tint(v) : 'rgba(244,63,94,0.08)',
                          color: v ? 'white' : '#7f1d1d',
                        }}
                        title={`${v} conversions`}
                      >
                        {v}
                      </div>
                    </td>
                  )
                })}
                <td className="px-4 py-2 text-right">
                  {r.totalLeads.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right">
                  {r.totalConversions.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right">
                  {(r.rate * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
