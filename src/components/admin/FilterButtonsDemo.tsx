'use client'

import { Clock } from 'lucide-react';
import { useState } from 'react';

// Version 3: Traffic Light System with FlowDoors Branding
function FilterButtonsV3() {
  const [activeFilter, setActiveFilter] = useState('VIEW ALL');
  
  const filters = [
    { name: 'NEW', color: 'emerald', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-emerald-600' },
    { name: 'HOT', color: 'red', bg: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-red-600' },
    { name: 'WARM', color: 'amber', bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-600' },
    { name: 'COLD', color: 'sky', bg: 'bg-sky-400', hover: 'hover:bg-sky-500', text: 'text-sky-500' },
    { name: 'HOLD', color: 'gray', bg: 'bg-gray-400', hover: 'hover:bg-gray-500', text: 'text-gray-500' },
    { name: 'ARCHIVED', color: 'gray', bg: 'bg-gray-500', hover: 'hover:bg-gray-600', text: 'text-gray-600' },
    { name: 'VIEW ALL', color: 'flowdoors-blue', bg: 'bg-flowdoors-blue-500', hover: 'hover:bg-flowdoors-blue-600', text: 'text-flowdoors-blue-600' },
  ];

  return (
    <div className="p-8 bg-white rounded-xl">
      <h3 className="text-lg font-bold text-gray-900 mb-4">FlowDoors Quote Filter Buttons</h3>
      <p className="text-sm text-gray-600 mb-6">Intuitive 3-color system with FlowDoors branding: Green = Good, Yellow = Caution, Red = Urgent</p>
      
      <div className="flex flex-wrap gap-3 items-center">
        {filters.map((filter) => (
          <button
            key={filter.name}
            onClick={() => setActiveFilter(filter.name)}
            className={`
              px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
              ${activeFilter === filter.name 
                ? `${filter.bg} text-white shadow-lg scale-105` 
                : `bg-gray-100 ${filter.text} hover:bg-gray-200`
              }
            `}
          >
            {filter.name}
          </button>
        ))}
        
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-flowdoors-green-500 text-white hover:bg-flowdoors-green-600 transition-colors font-semibold text-sm shadow-md animate-pulse">
          <Clock className="w-4 h-4" />
          Due Today
        </button>
      </div>
    </div>
  );
}


// Main Demo Component
export default function FilterButtonsDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">FlowDoors Quote Filter Buttons</h1>
          <p className="text-lg text-gray-600">Clean, professional designs using FlowDoors brand colors</p>
        </div>

        <FilterButtonsV3 />

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-flowdoors-blue-50 to-flowdoors-green-50 p-8 rounded-xl border-2 border-flowdoors-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 FlowDoors Traffic Light System</h3>
          <div className="space-y-3 text-gray-700">
            <p className="font-semibold">Recommended: <span className="text-flowdoors-blue-600">Version 3: Traffic Light System</span></p>
            <p><strong>Why this works best:</strong> Intuitive color coding system that users understand immediately. Green = Good/New, Yellow = Caution/Warm, Red = Urgent/Hot. The "COLD" status uses a mid-blue color for better semantic meaning.</p>
            <p><strong>Color System:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><span className="text-emerald-600 font-medium">NEW</span> - Green (Fresh, good)</li>
              <li><span className="text-red-600 font-medium">HOT</span> - Red (Urgent, immediate attention)</li>
              <li><span className="text-amber-600 font-medium">WARM</span> - Yellow (Caution, moderate priority)</li>
              <li><span className="text-sky-600 font-medium">COLD</span> - Light Blue (Low priority, can wait)</li>
              <li><span className="text-gray-500 font-medium">HOLD</span> - Light Gray (Paused, waiting)</li>
              <li><span className="text-gray-600 font-medium">ARCHIVED</span> - Gray (Inactive, stored)</li>
              <li><span className="text-flowdoors-blue-600 font-medium">VIEW ALL</span> - FlowDoors Blue (Primary action)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
