'use client'

import { useEffect, useRef, useState } from 'react'

interface RGBColor {
  r: number
  g: number
  b: number
}

interface CornerColors {
  topLeft: RGBColor
  topRight: RGBColor
  bottomLeft: RGBColor
  bottomRight: RGBColor
}

export default function TutorialPage() {
  const gradientCanvasRef = useRef<HTMLCanvasElement>(null)
  const gradientContainerRef = useRef<HTMLDivElement>(null)
  const [feelingInput, setFeelingInput] = useState<string>('')

  // Four corner colors - EXACT from app
  const corners: CornerColors = {
    topLeft: { r: 180, g: 220, b: 255 },     // Soft sky blue - Happy + Unmotivated
    topRight: { r: 255, g: 240, b: 50 },     // Bright golden yellow - Happy + Motivated
    bottomLeft: { r: 40, g: 35, b: 45 },     // Dark grey-purple - Unhappy + Unmotivated
    bottomRight: { r: 255, g: 20, b: 0 },    // Intense red - Unhappy + Motivated
  }

  // Bilinear interpolation between four corners
  function bilinearInterpolate(
    x: number,
    y: number,
    c00: RGBColor,
    c10: RGBColor,
    c01: RGBColor,
    c11: RGBColor
  ): RGBColor {
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

  function drawGradient(): void {
    const canvas = gradientCanvasRef.current
    const container = gradientContainerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) return

    // Get actual display size
    const displayWidth = container.clientWidth
    const displayHeight = container.clientHeight

    // Don't draw if container has no dimensions
    if (displayWidth === 0 || displayHeight === 0) return

    // Set canvas size to match display size (1:1 pixels)
    canvas.width = displayWidth
    canvas.height = displayHeight

    const width = displayWidth
    const height = displayHeight

    // Create image data
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    // Fill every pixel with bilinearly interpolated color
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const x = px / (width - 1)
        const y = py / (height - 1)

        const color = bilinearInterpolate(
          x,
          y,
          corners.topLeft,
          corners.topRight,
          corners.bottomLeft,
          corners.bottomRight
        )

        const index = (py * width + px) * 4
        data[index] = color.r
        data[index + 1] = color.g
        data[index + 2] = color.b
        data[index + 3] = 255
      }
    }

    // Put the image data directly on the canvas
    ctx.putImageData(imageData, 0, 0)
  }

  useEffect(() => {
    const container = gradientContainerRef.current
    if (!container) return

    // Initial draw with delay
    const timer = setTimeout(() => {
      drawGradient()
    }, 100)

    // Use ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(() => {
      drawGradient()
    })

    resizeObserver.observe(container)

    const handleResize = () => {
      drawGradient()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="bg-gradient-to-b from-[#faf7f3] to-[#f8f5ef] text-[#333] min-h-screen py-8">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-[#d76a4c] font-semibold text-base sm:text-lg mb-2">VibePoint</h2>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">How to Track Your Moods</h1>
          <p className="max-w-[650px] mx-auto text-base sm:text-lg leading-relaxed">
            Learn how to use VibePoint&apos;s intuitive mood mapping system to understand your emotional patterns and discover what influences your daily state of mind.
          </p>
        </div>

        {/* Understanding Emotions */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Understanding How Emotions Work</h2>
        <p className="text-lg leading-relaxed mb-8">
          Most people believe emotions simply happen to them — that feelings arrive uninvited and beyond their control.
          But here&apos;s a powerful truth: emotions are created, much like baking a cake.
        </p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <h3 className="text-xl font-semibold mb-4">Your Emotional Recipe</h3>
          <p className="mb-4">Just as a cake requires specific ingredients mixed in the right way, your emotional states are built from distinct components:</p>

          <p className="mb-3"><strong>🎯 What you focus on</strong><br />Where your attention goes shapes what you feel</p>
          <p className="mb-3"><strong>💭 What you tell yourself</strong><br />The internal dialogue running through your mind</p>
          <p className="mb-3"><strong>🫀 What you feel physically</strong><br />The sensations in your body that you label as an &quot;emotion&quot;</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <strong>That&apos;s what VibePoint helps you do:</strong> Track your emotional coordinates alongside your internal recipe,
          so you can discover which ingredients consistently create which feelings. Over time, you&apos;ll develop the skill to consciously shape your emotional states
          rather than feeling controlled by them.
        </div>

        {/* Step 1 */}
        <div className="flex items-center mt-16 mb-8">
          <div className="bg-[#f27a3d] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base sm:text-lg mr-3 flex-shrink-0">1</div>
          <h2 className="text-2xl sm:text-3xl font-bold">Map Your Current Mood</h2>
        </div>

        <p className="text-lg leading-relaxed mb-8">Tracking your mood is simple. Ask yourself just two questions:</p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <strong>Question 1</strong><br />How motivated do I feel right now?<br /><br />
          <strong>Question 2</strong><br />How happy do I feel right now?
        </div>

        <p className="text-lg leading-relaxed mb-8">The combination of these two answers determines where you tap on the gradient. That&apos;s it — no overthinking required.</p>

        <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] mb-8 bg-white rounded-2xl overflow-hidden border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]" ref={gradientContainerRef}>
          <canvas
            ref={gradientCanvasRef}
            className="absolute inset-0 w-full h-full block"
          />
          {/* Axis overlay */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/40 backdrop-blur-sm transform -translate-y-1/2"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40 backdrop-blur-sm transform -translate-x-1/2"></div>

            {/* Arrows */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-[6px] border-r-white/60 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-white/60 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-b-[6px] border-b-white/60 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent"></div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-t-[6px] border-t-white/60 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent"></div>

            {/* Labels */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-white bg-black/30 px-2 py-1 rounded backdrop-blur-sm">Unmotivated</div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-white bg-black/30 px-2 py-1 rounded backdrop-blur-sm">Motivated</div>
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-white bg-black/30 px-2 py-1 rounded backdrop-blur-sm">Happy</div>
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-white bg-black/30 px-2 py-1 rounded backdrop-blur-sm">Unhappy</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <h3 className="text-xl font-semibold mb-4">How the Axes Work</h3>
          <p className="mb-3"><strong>Left to Right</strong><br />Your motivation and energy level<br />← Unmotivated | Motivated →</p>
          <p className="mb-6"><strong>Bottom to Top</strong><br />Your emotional positivity<br />↓ Unhappy | Happy ↑</p>

          <h3 className="text-xl font-semibold mb-4 mt-8">What Different Areas Represent</h3>
          <p className="mb-2 text-[#5cb882]"><strong>Top Left:</strong> Happy but unmotivated (peaceful, content, relaxed)</p>
          <p className="mb-2 text-[#e6a040]"><strong>Top Right:</strong> Happy and motivated (joyful, excited, energized)</p>
          <p className="mb-2 text-[#c75d5d]"><strong>Bottom Left:</strong> Unhappy and unmotivated (sad, drained, depleted)</p>
          <p className="mb-2 text-[#b14545]"><strong>Bottom Right:</strong> Unhappy but motivated (angry, anxious, stressed)</p>
        </div>

        <p className="text-lg leading-relaxed mb-16">These descriptions are guides to help you understand the space. What matters most is capturing your honest sense of where you are right now.</p>

        {/* Step 2 */}
        <div className="flex items-center mt-16 mb-8">
          <div className="bg-[#f27a3d] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base sm:text-lg mr-3 flex-shrink-0">2</div>
          <h2 className="text-2xl sm:text-3xl font-bold">Capture Your Emotional Recipe</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <h3 className="text-xl font-semibold mb-2">Ingredient 1: Focus</h3>
          <p className="mb-6">&quot;What are you focusing on right now?&quot;</p>

          <h3 className="text-xl font-semibold mb-2">Ingredient 2: Self-Talk</h3>
          <p className="mb-6">&quot;What are you telling yourself?&quot;</p>

          <h3 className="text-xl font-semibold mb-2">Ingredient 3: Physical State</h3>
          <p>&quot;What are you feeling physically?&quot;</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <strong>Example:</strong> You might note that you&apos;re focusing on tomorrow&apos;s presentation, telling yourself
          &quot;I&apos;m not prepared enough,&quot; and feeling tension in your shoulders. Together, these ingredients are creating your emotional state —
          and now you&apos;re aware of the recipe.
        </div>

        {/* Step 3 */}
        <div className="flex items-center mt-16 mb-8">
          <div className="bg-[#f27a3d] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base sm:text-lg mr-3 flex-shrink-0">3</div>
          <h2 className="text-2xl sm:text-3xl font-bold">Name Your Feeling (Optional)</h2>
        </div>

        <p className="text-lg leading-relaxed mb-8">
          After capturing your ingredients, you can optionally describe your feeling in your own words.
          This helps VibePoint learn your personal emotional language without forcing predefined labels.
        </p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <h3 className="text-xl font-semibold mb-2">Label Your Feeling</h3>
          <p className="mb-4">In one word or a short phrase, describe how you feel right now.</p>
          <p className="text-sm text-gray-600 italic mb-4">Examples: &quot;nervous,&quot; &quot;peaceful,&quot; &quot;anxious,&quot; &quot;energized,&quot; &quot;tired,&quot; &quot;hopeful.&quot;</p>

          <input
            type="text"
            placeholder="Type your word here…"
            value={feelingInput}
            onChange={(e) => setFeelingInput(e.target.value)}
            className="w-full mt-3 px-4 py-3 text-base border border-gray-300 rounded-xl outline-none focus:border-[#f27a3d] focus:ring-2 focus:ring-[#f27a3d]/30 transition-all duration-200 box-border"
          />

          <h3 className="text-xl font-semibold mb-2 mt-8">Why This Helps</h3>
          <p className="mb-2">
            Using your own language helps VibePoint understand how <strong>you</strong> describe emotional states.
            This allows insights and reframes to be based on your vocabulary, not a preset list.
          </p>

          <p className="text-sm text-gray-600 italic mt-2">
            You can write anything here — there are no wrong answers.
          </p>
        </div>

        {/* Step 4 */}
        <div className="flex items-center mt-16 mb-8">
          <div className="bg-[#f27a3d] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base sm:text-lg mr-3 flex-shrink-0">4</div>
          <h2 className="text-2xl sm:text-3xl font-bold">Track Consistently</h2>
        </div>

        <p className="text-lg leading-relaxed mb-8">The magic happens with consistency. Check in with yourself regularly — ideally at different times throughout your day:</p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <h3 className="text-lg font-semibold mb-2">🌅 Morning Check-in</h3>
          <p className="mb-6">Capture your baseline mood as you start your day.</p>

          <h3 className="text-lg font-semibold mb-2">☀️ Midday Pulse</h3>
          <p className="mb-6">Notice how your energy and mood shift during the day.</p>

          <h3 className="text-lg font-semibold mb-2">🌙 Evening Reflection</h3>
          <p className="mb-6">Review your day and note what influenced your state.</p>

          <h3 className="text-lg font-semibold mb-2">✨ Significant Moments</h3>
          <p>Track when you notice a major mood shift.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <strong>Pro tip:</strong> Set gentle reminders on your phone to check in 2–3 times daily.
          After a few weeks, it becomes a natural habit that takes less than 60 seconds.
        </div>

        {/* Step 5 */}
        <div className="flex items-center mt-16 mb-8">
          <div className="bg-[#f27a3d] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base sm:text-lg mr-3 flex-shrink-0">5</div>
          <h2 className="text-2xl sm:text-3xl font-bold">Discover Your Patterns</h2>
        </div>

        <p className="text-lg leading-relaxed mb-8">
          After tracking for a week or two, VibePoint reveals patterns in your emotional recipes.
          You&apos;ll start to notice which combinations of focus, self-talk, and physical sensations produce specific moods.
        </p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <h3 className="text-xl font-semibold mb-2">Example Insight</h3>
          <p>
            &quot;When you focus on creative projects and tell yourself &apos;I&apos;m making progress,&apos; you tend to land in the energized and motivated quadrant (top right).
            Your body typically feels alert and engaged.&quot;
          </p>
        </div>

        <p className="text-lg leading-relaxed mb-8">
          These insights reveal your personal emotional recipes — the specific combinations of ingredients that create your moods.
          This awareness is the foundation of emotional mastery.
        </p>

        {/* Step 6 */}
        <div className="flex items-center mt-16 mb-8">
          <div className="bg-[#f27a3d] text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-base sm:text-lg mr-3 flex-shrink-0">6</div>
          <h2 className="text-2xl sm:text-3xl font-bold">Become a Master of Your Emotions</h2>
        </div>

        <p className="text-lg leading-relaxed mb-8">
          Understanding your emotional recipes transforms you from someone emotions happen to,
          into someone who can deliberately create desired emotional states.
        </p>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <p className="mb-2">✓ Recognize early warning signs when you&apos;re using recipes that lead to unwanted states</p>
          <p className="mb-2">✓ Identify which ingredients consistently create the emotional states you want</p>
          <p className="mb-2">✓ Understand how changing your focus or self-talk shifts your emotional landscape</p>
          <p className="mb-2">✓ Notice the connection between physical sensations and emotional labels</p>
          <p>✓ Deliberately choose where to direct your attention to shape how you feel</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-16 border border-[#e7e7e7] shadow-[0px_3px_8px_rgba(0,0,0,0.05)]">
          <strong>The journey to emotional mastery:</strong>
          With practice, you&apos;ll move from simply observing your recipes to intentionally adjusting the ingredients.
          You&apos;ll learn to create energized states when you need motivation, calm states when you need peace,
          and navigate difficult emotions with skill rather than feeling overwhelmed by them.
        </div>

        {/* CTA */}
        <div className="text-center mt-16 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-base sm:text-lg mb-8">Begin tracking your moods today and discover the patterns that shape your emotional life.</p>

          <a
            href="#"
            className="inline-block mx-auto bg-[#f27a3d] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-3xl text-base sm:text-lg font-semibold transition-all duration-200 hover:bg-[#e86e31] no-underline"
          >
            Start Tracking Now
          </a>
        </div>
      </div>
    </div>
  )
}
