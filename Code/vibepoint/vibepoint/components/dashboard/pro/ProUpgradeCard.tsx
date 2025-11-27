'use client'

import React from 'react'

interface ProUpgradeCardProps {
  onUpgrade: () => void
}

export const ProUpgradeCard: React.FC<ProUpgradeCardProps> = ({ onUpgrade }) => {
  return (
    <div 
      className="relative overflow-hidden rounded-3xl p-7 text-center shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(60, 40, 80, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Glow effect */}
      <div 
        className="pointer-events-none absolute -right-20 -top-30 h-44 w-44 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 20, 147, 0.25) 0%, transparent 70%)'
        }}
      />
      
      <div className="relative z-10">
        <div className="mb-3 inline-block text-4xl animate-float-icon">🧪</div>
        <h3 className="mb-2 font-display text-xl font-semibold text-white">
          Unlock Mood Recipes
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-white/75">
          Create personalized routines that shift your emotional state. Save what works, build your mood toolkit.
        </p>
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #c71585, #ff1493)',
            boxShadow: '0 4px 20px rgba(199, 21, 133, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <span>Upgrade to Pro</span>
          <svg 
            viewBox="0 0 24 24" 
            width={18} 
            height={18}
            className="transition-transform hover:translate-x-1"
          >
            <path 
              d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" 
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

