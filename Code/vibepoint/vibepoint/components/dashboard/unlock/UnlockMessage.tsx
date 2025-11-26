import React from 'react'

interface UnlockMessageProps {
  totalEntries: number
}

const UnlockMessage: React.FC<UnlockMessageProps> = React.memo(({ totalEntries }) => {
  if (totalEntries >= 10) return null

  const remaining = 10 - totalEntries

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        Unlock Your Mood Patterns
      </h3>
      <p className="text-yellow-700 leading-relaxed">
        You're <span className="font-semibold">{remaining} entries</span> away from
        unlocking deep insights into your emotional patterns.
      </p>
      <p className="text-sm text-yellow-600 mt-2">
        Keep logging your moods — patterns usually become clear around 10 entries.
      </p>
    </div>
  )
})

UnlockMessage.displayName = 'UnlockMessage'

export default UnlockMessage

