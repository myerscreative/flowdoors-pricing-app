'use client'

interface MiniMoodDisplayProps {
  happiness: number // 0-1
  motivation: number // 0-1
}

/**
 * Mini mood display with white background and colored dot
 * Used in history page entry cards
 * Size is controlled by parent container (responsive: 56px/64px/72px)
 */
export function MiniMoodDisplay({ happiness, motivation }: MiniMoodDisplayProps) {
  // Calculate position on the gradient (x = motivation, y = inverted happiness)
  const x = motivation // 0-1, left to right
  const y = 1 - happiness // 0-1, top to bottom (inverted)

  // Get the exact color at this position using bilinear interpolation
  const topLeft = { r: 124, g: 198, b: 214 }     // #7CC6D6 (happy + unmotivated)
  const topRight = { r: 245, g: 166, b: 35 }     // #F5A623 (happy + motivated)
  const bottomLeft = { r: 45, g: 58, b: 92 }     // #2D3A5C (unhappy + unmotivated)
  const bottomRight = { r: 139, g: 41, b: 66 }   // #8B2942 (unhappy + motivated)

  const r = Math.round(
    topLeft.r * (1 - x) * (1 - y) +
    topRight.r * x * (1 - y) +
    bottomLeft.r * (1 - x) * y +
    bottomRight.r * x * y
  )
  const g = Math.round(
    topLeft.g * (1 - x) * (1 - y) +
    topRight.g * x * (1 - y) +
    bottomLeft.g * (1 - x) * y +
    bottomRight.g * x * y
  )
  const b = Math.round(
    topLeft.b * (1 - x) * (1 - y) +
    topRight.b * x * (1 - y) +
    bottomLeft.b * (1 - x) * y +
    bottomRight.b * x * y
  )

  const dotColor = `rgb(${r}, ${g}, ${b})`
  const borderColor = dotColor

  // Convert to percentages for positioning
  const markerX = x * 100
  const markerY = y * 100

  return (
    <div
      className="relative w-full h-full rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
        border: `2px solid ${borderColor}`,
      }}
    >
      <div
        className="absolute rounded-full border-2 border-white shadow-md"
        style={{
          width: 14,
          height: 14,
          left: `${markerX}%`,
          top: `${markerY}%`,
          backgroundColor: dotColor,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

