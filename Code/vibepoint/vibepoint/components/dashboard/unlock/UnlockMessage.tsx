import React from 'react'

interface UnlockMessageProps {
  totalEntries: number
}

const UnlockMessage: React.FC<UnlockMessageProps> = React.memo(({ totalEntries }) => {
  if (totalEntries >= 10) return null

  const remaining = 10 - totalEntries
  const progress = Math.max(0, Math.min(1, totalEntries / 10)) * 100

  return (
    <div 
      className="rounded-3xl border-2 border-dashed p-6 md:p-7 lg:p-8 text-center shadow-sm backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 245, 0.9) 100%)',
        borderColor: 'rgba(214, 79, 142, 0.3)'
      }}
    >
      <div className="mb-3 text-4xl">🔮</div>
      <h3 className="mb-2 font-display text-xl md:text-2xl font-semibold text-text-primary">
        Unlock Your Patterns
      </h3>
      <div className="mb-2 flex items-center justify-center gap-2 text-base md:text-lg">
        <span className="font-display text-lg md:text-xl font-semibold" style={{ color: '#c026d3' }}>
          {remaining} entries
        </span>
        <span className="text-text-secondary">away from deep insights</span>
      </div>
      <p className="text-sm md:text-base text-text-secondary">
        Keep logging—patterns emerge around 10 entries
      </p>
      <div className="mt-5 md:mt-6 h-2.5 md:h-3 w-full overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f97316, #c026d3, #7c3aed)'
          }}
        />
      </div>
    </div>
  )
})

UnlockMessage.displayName = 'UnlockMessage'

export default UnlockMessage

