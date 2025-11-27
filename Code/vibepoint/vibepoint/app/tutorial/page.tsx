'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

// Four corner colors - EXACT from app
const corners = {
  topLeft: { r: 180, g: 220, b: 255 }, // Soft sky blue - Happy + Unmotivated
  topRight: { r: 255, g: 240, b: 50 }, // Bright golden yellow - Happy + Motivated
  bottomLeft: { r: 40, g: 35, b: 45 }, // Dark grey-purple - Unhappy + Unmotivated
  bottomRight: { r: 255, g: 20, b: 0 }, // Intense red - Unhappy + Motivated
}

// Bilinear interpolation between four corners
function bilinearInterpolate(
  x: number,
  y: number,
  c00: { r: number; g: number; b: number },
  c10: { r: number; g: number; b: number },
  c01: { r: number; g: number; b: number },
  c11: { r: number; g: number; b: number }
) {
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

export default function TutorialPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const drawGradient = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
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
    // Initialize
    const timer = setTimeout(() => {
      drawGradient()
    }, 100)

    // Handle resize
    const handleResize = () => {
      drawGradient()
    }
    window.addEventListener('resize', handleResize)

    // Use ResizeObserver for container size changes
    const container = containerRef.current
    if (container && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        drawGradient()
      })
      resizeObserver.observe(container)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', handleResize)
        resizeObserver.disconnect()
      }
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const backgroundStyle = {
    background: 'linear-gradient(135deg, #d4f1f9 0%, #f8e8f0 35%, #fdf6e9 65%, #f5e6e0 100%)',
    backgroundAttachment: 'fixed',
  } as const

  return (
    <div className="relative min-h-screen text-[#1a1a2e]" style={backgroundStyle}>
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[300px] w-[300px] rounded-full bg-[#a8e0eb] opacity-25 blur-[80px] animate-float" />
        <div
          className="absolute right-[-150px] top-[30%] h-[400px] w-[400px] rounded-full bg-[#f0c6d8] opacity-20 blur-[80px] animate-float"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="absolute bottom-[20%] left-[10%] h-[350px] w-[350px] rounded-full bg-[#e8d4c8] opacity-20 blur-[80px] animate-float"
          style={{ animationDelay: '-10s' }}
        />
        <div
          className="absolute -bottom-24 right-[20%] h-[300px] w-[300px] rounded-full bg-[#f0c6d8] opacity-15 blur-[80px] animate-float"
          style={{ animationDelay: '-15s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[720px] px-5 pb-[60px] pt-6 md:max-w-[800px] md:px-8 md:pb-[100px] md:pt-12">
        {/* Header */}
        <header className="mb-12 text-center pt-5">
          <div className="mb-6 font-fraunces text-xl font-semibold" style={{ background: 'linear-gradient(135deg, #f97316, #c026d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            VibePoint
          </div>
          <h1 className="mb-4 font-fraunces text-[2.5rem] font-semibold leading-tight text-[#1a1a2e] md:text-[3rem] lg:text-[3.2rem]">
            How to Track Your Moods
          </h1>
          <p className="mx-auto max-w-[600px] text-lg text-[#4a4a6a]">
            Learn how to use VibePoint&apos;s intuitive mood mapping system to understand your emotional patterns and discover what influences your daily state of mind.
          </p>
        </header>

        {/* Understanding Emotions */}
        <h2 className="mb-4 font-fraunces text-2xl font-semibold text-[#1a1a2e] md:text-[1.8rem]">
          Understanding How Emotions Work
        </h2>
        <p className="mb-4 text-lg text-[#4a4a6a]">
          Most people believe emotions simply happen to them — that feelings arrive uninvited and beyond their control. But here&apos;s a powerful truth: emotions are created, much like baking a cake.
        </p>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            Your Emotional Recipe
          </h3>
          <p className="mb-4 text-lg text-[#4a4a6a]">
            Just as a cake requires specific ingredients mixed in the right way, your emotional states are built from distinct components:
          </p>

          <div className="mb-4">
            <span className="mr-2 text-xl">🎯</span>
            <strong className="text-[#1a1a2e]">What you focus on</strong>
            <br />
            <span className="text-[#4a4a6a]">Where your attention goes shapes what you feel</span>
          </div>

          <div className="mb-4">
            <span className="mr-2 text-xl">💭</span>
            <strong className="text-[#1a1a2e]">What you tell yourself</strong>
            <br />
            <span className="text-[#4a4a6a]">The internal dialogue running through your mind</span>
          </div>

          <div>
            <span className="mr-2 text-xl">🫀</span>
            <strong className="text-[#1a1a2e]">What you feel physically</strong>
            <br />
            <span className="text-[#4a4a6a]">The sensations in your body that you label as an &quot;emotion&quot;</span>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <p className="text-lg text-[#4a4a6a]">
            <strong className="text-[#1a1a2e]">That&apos;s what VibePoint helps you do:</strong> Track your emotional coordinates alongside your internal recipe, so you can discover which ingredients consistently create which feelings. Over time, you&apos;ll develop the skill to consciously shape your emotional states rather than feeling controlled by them.
          </p>
        </div>

        {/* Step 1 */}
        <div className="mb-5 mt-14 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#c026d3] text-xl font-bold text-white shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
            1
          </div>
          <h2 className="mb-0 font-fraunces text-2xl font-semibold text-[#1a1a2e] md:text-[1.8rem]">
            Map Your Current Mood
          </h2>
        </div>

        <p className="mb-4 text-lg text-[#4a4a6a]">
          Tracking your mood is simple. Ask yourself just two questions:
        </p>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <p className="mb-4 text-lg text-[#4a4a6a]">
            <strong className="text-[#1a1a2e]">Question 1</strong>
            <br />
            How motivated do I feel right now?
          </p>
          <p className="text-lg text-[#4a4a6a]">
            <strong className="text-[#1a1a2e]">Question 2</strong>
            <br />
            How happy do I feel right now?
          </p>
        </div>

        <p className="mb-6 text-lg text-[#4a4a6a]">
          The combination of these two answers determines where you tap on the gradient. That&apos;s it — no overthinking required.
        </p>

        {/* Gradient Demo */}
        <div ref={containerRef} className="relative mb-6 w-full overflow-hidden rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.1),0_8px_40px_rgba(0,0,0,0.05)]" style={{ aspectRatio: '16 / 10' }}>
          <canvas ref={canvasRef} className="block h-full w-full" />
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-white/40" />
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-white/40" />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 border-r-[6px] border-t-[6px] border-b-[6px] border-r-white/60 border-t-transparent border-b-transparent" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 border-l-[6px] border-t-[6px] border-b-[6px] border-l-white/60 border-t-transparent border-b-transparent" />
            <div className="absolute left-1/2 top-2 -translate-x-1/2 border-b-[6px] border-l-[6px] border-r-[6px] border-b-white/60 border-l-transparent border-r-transparent" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 border-t-[6px] border-l-[6px] border-r-[6px] border-t-white/60 border-l-transparent border-r-transparent" />
            <span className="absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/30 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Happy
            </span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/30 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Unhappy
            </span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/30 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Unmotivated
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/30 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Motivated
            </span>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            How the Axes Work
          </h3>
          <p className="mb-4 text-lg text-[#4a4a6a]">
            <strong className="text-[#1a1a2e]">Left to Right</strong>
            <br />
            Your motivation and energy level
            <br />
            ← Unmotivated | Motivated →
          </p>
          <p className="mb-7 text-lg text-[#4a4a6a]">
            <strong className="text-[#1a1a2e]">Bottom to Top</strong>
            <br />
            Your emotional positivity
            <br />
            ↓ Unhappy | Happy ↑
          </p>

          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            What Different Areas Represent
          </h3>
          <p className="mb-2 text-lg text-[#7CC6D6]">
            <strong>Top Left:</strong> Happy but unmotivated (peaceful, content, relaxed)
          </p>
          <p className="mb-2 text-lg text-[#F5A623]">
            <strong>Top Right:</strong> Happy and motivated (joyful, excited, energized)
          </p>
          <p className="mb-2 text-lg text-[#6b7280]">
            <strong>Bottom Left:</strong> Unhappy and unmotivated (sad, drained, depleted)
          </p>
          <p className="text-lg text-[#ef4444]">
            <strong>Bottom Right:</strong> Unhappy but motivated (angry, anxious, stressed)
          </p>
        </div>

        <p className="mb-6 text-lg text-[#4a4a6a]">
          These descriptions are guides to help you understand the space. What matters most is capturing your honest sense of where you are right now.
        </p>

        {/* Step 2 */}
        <div className="mb-5 mt-14 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#c026d3] text-xl font-bold text-white shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
            2
          </div>
          <h2 className="mb-0 font-fraunces text-2xl font-semibold text-[#1a1a2e] md:text-[1.8rem]">
            Capture Your Emotional Recipe
          </h2>
        </div>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            Ingredient 1: Focus
          </h3>
          <p className="mb-5 text-lg text-[#4a4a6a]">
            &quot;What are you focusing on right now?&quot;
          </p>

          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            Ingredient 2: Self-Talk
          </h3>
          <p className="mb-5 text-lg text-[#4a4a6a]">
            &quot;What are you telling yourself?&quot;
          </p>

          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            Ingredient 3: Physical State
          </h3>
          <p className="text-lg text-[#4a4a6a]">
            &quot;What are you feeling physically?&quot;
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <p className="text-lg text-[#4a4a6a]">
            <strong className="text-[#1a1a2e]">Example:</strong> You might note that you&apos;re focusing on tomorrow&apos;s presentation, telling yourself &quot;I&apos;m not prepared enough,&quot; and feeling tension in your shoulders. Together, these ingredients are creating your emotional state — and now you&apos;re aware of the recipe.
          </p>
        </div>

        {/* Step 3 */}
        <div className="mb-5 mt-14 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#c026d3] text-xl font-bold text-white shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
            3
          </div>
          <h2 className="mb-0 font-fraunces text-2xl font-semibold text-[#1a1a2e] md:text-[1.8rem]">
            Name Your Feeling (Optional)
          </h2>
        </div>

        <p className="mb-6 text-lg text-[#4a4a6a]">
          After capturing your ingredients, you can optionally describe your feeling in your own words. This helps VibePoint learn your personal emotional language without forcing predefined labels.
        </p>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            Label Your Feeling
          </h3>
          <p className="mb-2 text-lg text-[#4a4a6a]">
            In one word or a short phrase, describe how you feel right now.
          </p>
          <p className="mb-3 text-sm italic text-[#4a4a6a]">
            Examples: &quot;nervous,&quot; &quot;peaceful,&quot; &quot;anxious,&quot; &quot;energized,&quot; &quot;tired,&quot; &quot;hopeful.&quot;
          </p>

          <input
            type="text"
            className="mt-3 w-full rounded-2xl border border-black/8 bg-white/60 px-5 py-4 font-outfit text-base text-[#1a1a2e] transition-all placeholder:text-[#4a4a6a]/70 focus:border-[#c026d3] focus:bg-white/90 focus:outline-none focus:ring-4 focus:ring-[#c026d3]/10"
            placeholder="Type your word here…"
          />

          <h3 className="mb-2 mt-7 font-outfit text-lg font-semibold text-[#1a1a2e]">
            Why This Helps
          </h3>
          <p className="mb-2 text-lg text-[#4a4a6a]">
            Using your own language helps VibePoint understand how <strong className="text-[#1a1a2e]">you</strong> describe emotional states. This allows insights and reframes to be based on your vocabulary, not a preset list.
          </p>
          <p className="text-sm italic text-[#4a4a6a]">
            You can write anything here — there are no wrong answers.
          </p>
        </div>

        {/* Step 4 */}
        <div className="mb-5 mt-14 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#c026d3] text-xl font-bold text-white shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
            4
          </div>
          <h2 className="mb-0 font-fraunces text-2xl font-semibold text-[#1a1a2e] md:text-[1.8rem]">
            Track Consistently
          </h2>
        </div>

        <p className="mb-6 text-lg text-[#4a4a6a]">
          The magic happens with consistency. Check in with yourself regularly — ideally at different times throughout your day:
        </p>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            🌅 Morning Check-in
          </h3>
          <p className="mb-5 text-lg text-[#4a4a6a]">
            Capture your baseline mood as you start your day.
          </p>

          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            ☀️ Midday Pulse
          </h3>
          <p className="mb-5 text-lg text-[#4a4a6a]">
            Notice how your energy and mood shift during the day.
          </p>

          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            🌙 Evening Reflection
          </h3>
          <p className="mb-5 text-lg text-[#4a4a6a]">
            Review your day and note what influenced your state.
          </p>

          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            ✨ Significant Moments
          </h3>
          <p className="text-lg text-[#4a4a6a]">
            Track when you notice a major mood shift.
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <p className="text-lg text-[#4a4a6a]">
            <strong className="text-[#1a1a2e]">Pro tip:</strong> Set gentle reminders on your phone to check in 2–3 times daily. After a few weeks, it becomes a natural habit that takes less than 60 seconds.
          </p>
        </div>

        {/* Step 5 */}
        <div className="mb-5 mt-14 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#c026d3] text-xl font-bold text-white shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
            5
          </div>
          <h2 className="mb-0 font-fraunces text-2xl font-semibold text-[#1a1a2e] md:text-[1.8rem]">
            Discover Your Patterns
          </h2>
        </div>

        <p className="mb-6 text-lg text-[#4a4a6a]">
          After tracking for a week or two, VibePoint reveals patterns in your emotional recipes. You&apos;ll start to notice which combinations of focus, self-talk, and physical sensations produce specific moods.
        </p>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <h3 className="mb-2 font-outfit text-lg font-semibold text-[#1a1a2e]">
            Example Insight
          </h3>
          <p className="text-lg text-[#4a4a6a]">
            &quot;When you focus on creative projects and tell yourself &apos;I&apos;m making progress,&apos; you tend to land in the energized and motivated quadrant (top right). Your body typically feels alert and engaged.&quot;
          </p>
        </div>

        <p className="mb-6 text-lg text-[#4a4a6a]">
          These insights reveal your personal emotional recipes — the specific combinations of ingredients that create your moods. This awareness is the foundation of emotional mastery.
        </p>

        {/* Step 6 */}
        <div className="mb-5 mt-14 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] to-[#c026d3] text-xl font-bold text-white shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
            6
          </div>
          <h2 className="mb-0 font-fraunces text-2xl font-semibold text-[#1a1a2e] md:text-[1.8rem]">
            Become a Master of Your Emotions
          </h2>
        </div>

        <p className="mb-6 text-lg text-[#4a4a6a]">
          Understanding your emotional recipes transforms you from someone emotions happen to, into someone who can deliberately create desired emotional states.
        </p>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <div className="mb-3 flex gap-3 text-lg text-[#4a4a6a]">
            <span className="shrink-0 font-semibold text-[#10b981]">✓</span>
            <span>Recognize early warning signs when you&apos;re using recipes that lead to unwanted states</span>
          </div>
          <div className="mb-3 flex gap-3 text-lg text-[#4a4a6a]">
            <span className="shrink-0 font-semibold text-[#10b981]">✓</span>
            <span>Identify which ingredients consistently create the emotional states you want</span>
          </div>
          <div className="mb-3 flex gap-3 text-lg text-[#4a4a6a]">
            <span className="shrink-0 font-semibold text-[#10b981]">✓</span>
            <span>Understand how changing your focus or self-talk shifts your emotional landscape</span>
          </div>
          <div className="mb-3 flex gap-3 text-lg text-[#4a4a6a]">
            <span className="shrink-0 font-semibold text-[#10b981]">✓</span>
            <span>Notice the connection between physical sensations and emotional labels</span>
          </div>
          <div className="flex gap-3 text-lg text-[#4a4a6a]">
            <span className="shrink-0 font-semibold text-[#10b981]">✓</span>
            <span>Deliberately choose where to direct your attention to shape how you feel</span>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/50 bg-white/85 p-7 backdrop-blur-xl md:p-8 lg:p-9 lg:rounded-[28px]">
          <p className="text-lg text-[#4a4a6a]">
            <strong className="text-[#1a1a2e]">The journey to emotional mastery:</strong> With practice, you&apos;ll move from simply observing your recipes to intentionally adjusting the ingredients. You&apos;ll learn to create energized states when you need motivation, calm states when you need peace, and navigate difficult emotions with skill rather than feeling overwhelmed by them.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-[28px] border border-white/50 bg-white/85 p-12 text-center backdrop-blur-xl">
          <h2 className="mb-3 font-fraunces text-2xl font-semibold text-[#1a1a2e] md:text-[1.8rem]">
            Ready to Start Your Journey?
          </h2>
          <p className="mb-7 text-lg text-[#4a4a6a]">
            Begin tracking your moods today and discover the patterns that shape your emotional life.
          </p>
          <Link
            href="/mood/new"
            className="inline-block rounded-[50px] bg-gradient-to-r from-[#f97316] via-[#c026d3] to-[#7c3aed] px-9 py-[18px] font-outfit text-lg font-semibold text-white shadow-[0_8px_30px_rgba(192,38,211,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(192,38,211,0.4)]"
          >
            Start Tracking Now
          </Link>
        </div>
      </div>
    </div>
  )
}
