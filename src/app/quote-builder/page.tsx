'use client'

import { calculateDoorPrice } from '@/lib/pricingModel'
import { useState } from 'react'

export default function QuoteBuilderPage() {
  const [width, setWidth] = useState(144)
  const [height, setHeight] = useState(96)
  const [panels, setPanels] = useState(4)
  const [isSwing, setIsSwing] = useState(false)
  const [finish, setFinish] = useState<"standard" | "black" | "custom">("standard")
  const [glass, setGlass] = useState<"double" | "triple" | "lowE">("double")
  const [includeInstall, setIncludeInstall] = useState(false)

  const result = calculateDoorPrice({ 
    width, 
    height, 
    panelCount: panels, 
    isSwing,
    finish,
    glass,
    includeInstall
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FlowDoors Quote Builder
          </h1>
          <p className="text-gray-600">
            Configure your door and get instant pricing with margin calculations
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (inches) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  placeholder="Width"
                  min={24}
                  max={240}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (inches) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  placeholder="Height"
                  min={48}
                  max={120}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panel Count
                </label>
                <input
                  type="number"
                  value={panels}
                  onChange={(e) => setPanels(Number(e.target.value))}
                  placeholder="Panels"
                  min={1}
                  max={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Swing Door Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="swing-toggle"
                checked={isSwing}
                onChange={(e) => setIsSwing(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="swing-toggle" className="text-sm font-medium text-gray-700">
                Swing Door (reduces base cost from $1,200 to $800)
              </label>
            </div>

            {/* Finish and Glass Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finish
                </label>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value as "standard" | "black" | "custom")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard (×1.0)</option>
                  <option value="black">Black (×1.08)</option>
                  <option value="custom">Custom (×1.15)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Glass Type
                </label>
                <select
                  value={glass}
                  onChange={(e) => setGlass(e.target.value as "double" | "triple" | "lowE")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="double">Double (×1.0)</option>
                  <option value="triple">Triple (×1.15)</option>
                  <option value="lowE">Low-E (×1.05)</option>
                </select>
              </div>
            </div>

            {/* Install Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="install-toggle"
                checked={includeInstall}
                onChange={(e) => setIncludeInstall(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="install-toggle" className="text-sm font-medium text-gray-700">
                Include Installation (+$2,500)
              </label>
            </div>

            {/* Quote Results */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quote Summary
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Retail Price</div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${result.retailPrice.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Margin</div>
                    <div className="text-3xl font-bold text-green-600">
                      {result.marginPct}%
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Panels:</span>
                    <span className="ml-2 font-medium text-gray-900">{result.panels}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Area:</span>
                    <span className="ml-2 font-medium text-gray-900">{result.areaSqFt} ft²</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Base Cost:</span>
                    <span className="ml-2 font-medium text-gray-900">${result.baseCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="ml-2 font-medium text-gray-900">${result.totalCost.toLocaleString()}</span>
                  </div>
                </div>

                {/* Notes Section */}
                {result.notes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="text-xs text-gray-600 space-y-1">
                      {result.notes.map((note, idx) => (
                        <div key={idx}>{note}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Test Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Quick Tests
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setWidth(144)
                    setHeight(96)
                    setPanels(4)
                    setIsSwing(false)
                    setFinish("standard")
                    setGlass("double")
                    setIncludeInstall(false)
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  12×8 (4-panel)
                </button>
                <button
                  onClick={() => {
                    setWidth(120)
                    setHeight(84)
                    setPanels(3)
                    setIsSwing(false)
                    setFinish("standard")
                    setGlass("double")
                    setIncludeInstall(false)
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  10×7 (3-panel)
                </button>
                <button
                  onClick={() => {
                    setWidth(96)
                    setHeight(80)
                    setPanels(2)
                    setIsSwing(true)
                    setFinish("standard")
                    setGlass("double")
                    setIncludeInstall(false)
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  8×6.7 Swing (2-panel)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

