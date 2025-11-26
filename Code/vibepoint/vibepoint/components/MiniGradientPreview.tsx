'use client'

interface MiniGradientPreviewProps {
  happiness: number // 0-1
  motivation: number // 0-1
  size?: number // Default 48px (not currently used, but kept for consistency)
  className?: string
}

export default function MiniGradientPreview({ 
  happiness, 
  motivation, 
  size = 48,
  className = '' 
}: MiniGradientPreviewProps) {

  // Calculate position on the gradient (x = motivation, y = inverted happiness)
  const x = motivation // 0-1, left to right
  const y = 1 - happiness // 0-1, top to bottom (inverted)

  // Get the exact color at this position
  const corners = {
    topLeft: { r: 180, g: 220, b: 255 },
    topRight: { r: 255, g: 240, b: 50 },
    bottomLeft: { r: 40, g: 35, b: 45 },
    bottomRight: { r: 255, g: 20, b: 0 },
  }

  const bilinearInterpolate = (
    x: number,
    y: number,
    c00: any,
    c10: any,
    c01: any,
    c11: any
  ) => {
    const r = Math.round(
      c00.r * (1 - x) * (1 - y) +
      c10.r * x * (1 - y) +
      c01.r * (1 - x) * y +
      c11.r * x * y
    )
    const g = Math.round(
      c00.g * (1 - x) * (1 - y) +
      c10.g * x * (1 - y) +
      c01.g * (1 - x) * y +
      c11.g * x * y
    )
    const b = Math.round(
      c00.b * (1 - x) * (1 - y) +
      c10.b * x * (1 - y) +
      c01.b * (1 - x) * y +
      c11.b * x * y
    )
    return { r, g, b }
  }

  const dotColorRgb = bilinearInterpolate(
    x,
    y,
    corners.topLeft,
    corners.topRight,
    corners.bottomLeft,
    corners.bottomRight
  )
  const dotColor = `rgb(${dotColorRgb.r}, ${dotColorRgb.g}, ${dotColorRgb.b})`

  return (
    <div className={`w-12 h-12 rounded-lg bg-white border border-gray-200 flex-shrink-0 relative overflow-hidden ${className}`}>
      {/* Small dot marking the exact position with matching color */}
      <div
        className="absolute w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm pointer-events-none"
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          backgroundColor: dotColor,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

