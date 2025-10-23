// src/components/summary/QuoteServices.tsx
'use client'

import { useQuote } from '@/context/QuoteContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function QuoteServices() {
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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <label
                className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base font-semibold"
                htmlFor="install-toggle"
              >
                Professional Installation
              </label>
              <p className="font-bold text-lg text-green-600">
                {state.installOption === 'Professional Installation'
                  ? `$${state.totals?.installationCost?.toLocaleString() || '0'}`
                  : '$0.00'}
                <span className="text-sm ml-2">Added</span>
              </p>
            </div>
            <Switch
              id="install-toggle"
              checked={state.installOption === 'Professional Installation'}
              onCheckedChange={handleInstallToggle}
            />
          </div>
          {state.installOption === 'Professional Installation' && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4 text-sm">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-blue-800">
                {INSTALLATION_INCLUSIONS.map((inclusion, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{inclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Delivery Options
          </h3>
          <div className="space-y-3">
            <div
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                state.deliveryOption === 'Regular Delivery'
                  ? 'border-primary ring-2 ring-primary'
                  : 'border-border'
              }`}
              onClick={() => handleDeliveryChange('regular')}
            >
              <div className="flex items-center gap-4">
                <div className="mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      state.deliveryOption === 'Regular Delivery'
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {state.deliveryOption === 'Regular Delivery' && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Regular Delivery</h4>
                    <p className="font-bold text-md">$800+</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Curbside delivery. You will need people and/or forklift to
                    offload the truck.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                state.deliveryOption === 'White Glove Delivery'
                  ? 'border-primary ring-2 ring-primary'
                  : 'border-border'
              }`}
              onClick={() => handleDeliveryChange('whiteglove')}
            >
              <div className="flex items-center gap-4">
                <div className="mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      state.deliveryOption === 'White Glove Delivery'
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {state.deliveryOption === 'White Glove Delivery' && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">White Glove Delivery</h4>
                    <p className="font-bold text-md">$1,500+</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Professional offloading and inspection of all items at time
                    of offloading.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
