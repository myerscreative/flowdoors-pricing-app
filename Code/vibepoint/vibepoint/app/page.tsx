'use client'

import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a8edea] via-[#fed6e3] via-[#fff9e6] to-[#ffd8cc] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Vibepoint
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Understand your moods.
          </p>
          <p className="text-xl text-gray-700">
            Control your emotional experience.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4 mb-16">
          {/* Get Started Button - Primary */}
          <button
            onClick={() => router.push('/auth/signup')}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-gray-800 text-lg
                     bg-white/30 backdrop-blur-md
                     border border-white/40
                     shadow-lg hover:shadow-xl
                     hover:bg-white/40
                     transition-all duration-300
                     transform hover:scale-[1.02]"
          >
            Get Started
          </button>

          {/* Log In Button - Secondary */}
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-gray-800 text-lg
                     bg-transparent backdrop-blur-md
                     border-2 border-white/50
                     shadow-md hover:shadow-lg
                     hover:bg-white/20 hover:border-white/60
                     transition-all duration-300
                     transform hover:scale-[1.02]"
          >
            Log In
          </button>
        </div>

        {/* How It Works */}
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            How it works
          </h2>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Tap the gradient
                </h3>
                <p className="text-gray-700 text-sm">
                  Express your mood visually on a happiness-motivation grid
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Answer 3 questions
                </h3>
                <p className="text-gray-700 text-sm">
                  Quick insights about your focus, thoughts, and body
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  Discover patterns
                </h3>
                <p className="text-gray-700 text-sm">
                  See what affects your mood and make informed changes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
