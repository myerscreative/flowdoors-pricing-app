import React, { useMemo } from 'react'

interface EncouragementProps {
  enabled?: boolean
}

const messages = [
  "God's grace is bigger than the toughest moment you'll face today.",
  "You are fully loved, fully accepted, and fully favored in Christ.",
  "His strength is made perfect in your weakness—lean on Him today.",
  "You are not alone. God walks with you in every step and every decision.",
  "Peace flows when your heart is anchored in His goodness.",
  "God's supply for you today is greater than any need you'll have.",
  "You have a sound mind, a strong spirit, and a steady heart.",
  "God's wisdom is available to you the moment you ask.",
  "You can cast your cares on Him because He cares deeply for you.",
  "His joy is your strength — let it rise in you today.",
]

const Encouragement: React.FC<EncouragementProps> = React.memo(({ enabled = true }) => {
  if (!enabled) return null

  const dailyMessage = useMemo(() => {
    const today = new Date()
    const index = today.getDate() % messages.length
    return messages[index]
  }, [])

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-2">Encouragement for Today</h3>
      <p className="text-indigo-100 leading-relaxed">{dailyMessage}</p>
    </div>
  )
})

Encouragement.displayName = 'Encouragement'

export default Encouragement
