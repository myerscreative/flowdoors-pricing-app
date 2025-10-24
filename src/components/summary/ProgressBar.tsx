'use client'

import { Check } from 'lucide-react'

export function ProgressBar() {
  const steps = [
    { number: 1, label: 'Configure', completed: true },
    { number: 2, label: 'Customize', completed: true },
    { number: 3, label: 'Review', completed: true, active: true },
  ]

  return (
    <div className="mb-12">
      <div className="flex items-center justify-center gap-4 md:gap-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-base transition-all ${
                  step.completed
                    ? 'bg-gradient-to-br from-flowdoors-blue to-flowdoors-blue-600 text-white shadow-lg'
                    : step.active
                      ? 'bg-flowdoors-blue text-white ring-4 ring-flowdoors-blue/20'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.completed ? (
                  <Check className="w-6 h-6" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium hidden md:block ${
                  step.active
                    ? 'text-flowdoors-blue'
                    : step.completed
                      ? 'text-gray-600'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`hidden md:block w-16 h-0.5 mx-2 transition-all ${
                  step.completed ? 'bg-flowdoors-blue' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

