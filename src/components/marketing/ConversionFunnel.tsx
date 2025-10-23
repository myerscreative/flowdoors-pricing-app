'use client'

interface FunnelStep {
  label: string
  value: number
  color: string
  width: string
}

export default function ConversionFunnel({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-md">
      <h3 className="text-xl font-bold text-flowdoors-charcoal-800 mb-6">
        Conversion Funnel
      </h3>
      <div className="space-y-5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-[180px]">
              <div
                className="w-5 h-5 rounded-lg shadow-sm"
                style={{ backgroundColor: step.color }}
              />
              <span className="font-semibold text-flowdoors-charcoal-700">{step.label}</span>
            </div>
            <div className="flex items-center space-x-4 flex-1 ml-6">
              <div className="flex-1 bg-gray-100 rounded-full h-4 shadow-inner">
                <div
                  className="h-4 rounded-full shadow-sm transition-all duration-500"
                  style={{ backgroundColor: step.color, width: step.width }}
                />
              </div>
              <span className="font-bold text-lg min-w-[80px] text-right" style={{ color: step.color }}>
                {step.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
