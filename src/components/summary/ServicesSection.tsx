// src/components/summary/ServicesSection.tsx
'use client'

import { useQuote } from '@/context/QuoteContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Wrench, Truck, CheckCircle } from 'lucide-react'
import { DELIVERY_OPTIONS } from '@/lib/constants'
import { InstallOption, DeliveryOption } from '@/lib/types'

export default function ServicesSection() {
  const { state, dispatch } = useQuote()
  const { installOption, deliveryOption } = state

  const handleInstallationChange = (value: string) => {
    dispatch({ type: 'SET_INSTALL', payload: value as InstallOption })
  }

  const handleDeliveryChange = (value: string) => {
    dispatch({ type: 'SET_DELIVERY', payload: value as DeliveryOption })
  }

  return (
    <div className="space-y-6">
      {/* Installation Options */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Installation Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={installOption}
            onValueChange={handleInstallationChange}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="None" id="install-none" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="install-none" className="cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">No Installation</div>
                      <div className="text-sm text-gray-600">
                        Customer will handle installation themselves
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      $0
                    </Badge>
                  </div>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem
                value="Professional Installation"
                id="install-pro"
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="install-pro" className="cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        Professional Installation
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-sm text-gray-600">
                        Full installation by certified professionals
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        • Site preparation and measurement • Professional
                        installation and setup • Quality inspection and testing
                        • 2-year installation warranty
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      $25/sq ft
                    </Badge>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Delivery Options */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={deliveryOption}
            onValueChange={handleDeliveryChange}
            className="space-y-4"
          >
            {DELIVERY_OPTIONS.map((option) => (
              <div
                key={option.name}
                className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50"
              >
                <RadioGroupItem
                  value={option.name}
                  id={`delivery-${option.name}`}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`delivery-${option.name}`}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {option.name}
                          {option.name === 'White Glove Delivery' && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                        {option.features && (
                          <div className="text-xs text-blue-600 mt-1">
                            {option.features.map((feature, index) => (
                              <div key={index}>• {feature}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(option.price)}
                      </Badge>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
