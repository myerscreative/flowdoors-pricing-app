'use client'

interface FunnelStep {
  label: string
  value: number
  color: string
  width: string
}

export default function ConversionFunnel({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Conversion Funnel
      </h3>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: step.color }}
              />
              <span className="font-medium">{step.label}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-64 bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full"
                  style={{ backgroundColor: step.color, width: step.width }}
                />
              </div>
              <span className="font-bold" style={{ color: step.color }}>
                {step.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
