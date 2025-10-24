'use client'

import { useQuote } from '@/context/QuoteContext'
import { Switch } from '@/components/ui/switch'
import { Truck } from 'lucide-react'

const INSTALLATION_INCLUSIONS = [
  'Site preparation and protection',
  'Professional installation by certified technicians',
  'Final adjustments and operation testing',
  'Cleanup and debris removal',
  'Operation demonstration and care instructions',
  '2-year installation warranty',
]

export function EnhancedQuoteServices() {
  const { state, dispatch } = useQuote()

  const handleInstallToggle = (checked: boolean) => {
    dispatch({
      type: 'SET_INSTALL',
      payload: checked ? 'Professional Installation' : 'None',
    })
  }

  const handleDeliveryChange = (option: 'regular' | 'whiteglove') => {
    dispatch({
      type: 'SET_DELIVERY',
      payload:
        option === 'whiteglove' ? 'White Glove Delivery' : 'Regular Delivery',
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-xl font-bold text-flowdoors-charcoal mb-6">
        Services & Delivery
      </h3>

      <div className="space-y-8">
        {/* Installation Toggle */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label
                className="text-lg font-semibold text-flowdoors-charcoal cursor-pointer"
                htmlFor="install-toggle"
              >
                Professional Installation
              </label>
              <p className="text-sm text-slate-600 mt-1">
                Complete installation service
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-flowdoors-green">
                {state.installOption === 'Professional Installation'
                  ? `$${state.totals?.installationCost?.toLocaleString() || '0'}`
                  : '$0'}
              </span>
              <Switch
                id="install-toggle"
                checked={state.installOption === 'Professional Installation'}
                onCheckedChange={handleInstallToggle}
                className="data-[state=checked]:bg-flowdoors-blue"
              />
            </div>
          </div>

          {state.installOption === 'Professional Installation' && (
            <div className="bg-gradient-to-r from-flowdoors-green/10 to-flowdoors-blue/10 border border-flowdoors-green/20 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INSTALLATION_INCLUSIONS.map((inclusion, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-flowdoors-green flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700">{inclusion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Options */}
        <div>
          <h4 className="text-base font-semibold mb-4 flex items-center gap-2 text-flowdoors-charcoal">
            <Truck className="h-5 w-5 text-flowdoors-blue" />
            Delivery Options
          </h4>
          <div className="space-y-3">
            {/* Regular Delivery */}
            <div
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                state.deliveryOption === 'Regular Delivery'
                  ? 'border-flowdoors-blue bg-flowdoors-blue/5 ring-2 ring-flowdoors-blue/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => handleDeliveryChange('regular')}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      state.deliveryOption === 'Regular Delivery'
                        ? 'border-flowdoors-blue bg-flowdoors-blue'
                        : 'border-slate-300'
                    }`}
                  >
                    {state.deliveryOption === 'Regular Delivery' && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-flowdoors-charcoal">
                      Regular Delivery
                    </h5>
                    <span className="text-lg font-bold text-flowdoors-blue">
                      $800+
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Curbside delivery. You will need people and/or forklift to
                    offload the truck.
                  </p>
                </div>
              </div>
            </div>

            {/* White Glove Delivery */}
            <div
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                state.deliveryOption === 'White Glove Delivery'
                  ? 'border-flowdoors-blue bg-flowdoors-blue/5 ring-2 ring-flowdoors-blue/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => handleDeliveryChange('whiteglove')}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      state.deliveryOption === 'White Glove Delivery'
                        ? 'border-flowdoors-blue bg-flowdoors-blue'
                        : 'border-slate-300'
                    }`}
                  >
                    {state.deliveryOption === 'White Glove Delivery' && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-flowdoors-charcoal">
                      White Glove Delivery
                    </h5>
                    <span className="text-lg font-bold text-flowdoors-blue">
                      $1,500+
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Professional offloading and inspection of all items at time
                    of offloading.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

