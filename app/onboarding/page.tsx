'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setOnboardingCompleted } from '@/lib/db';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    await setOnboardingCompleted();
    router.push('/home');
  };

  const handleComplete = async () => {
    await setOnboardingCompleted();
    router.push('/home');
  };

  const slides = [
    {
      title: "Tap the gradient",
      description: "Express your mood by tapping anywhere on the colorful gradient. Your position shows how happy and motivated you feel.",
      visual: (
        <div className="relative w-64 h-64 mx-auto rounded-3xl overflow-hidden mood-gradient shadow-2xl">
          {/* Example tap indicator */}
          <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-white bg-opacity-50 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>

          {/* Axis labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-30 rounded-full">
            Happy
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-30 rounded-full">
            Unhappy
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-30 rounded-full">
            Unmotivated
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 -rotate-90 text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-30 rounded-full">
            Motivated
          </div>
        </div>
      ),
    },
    {
      title: "Answer 3 questions",
      description: "Share quick insights about what you're focusing on, what you're telling yourself, and what you notice in your body.",
      visual: (
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Question 1</p>
            <p className="font-medium text-gray-900">What are you focusing on?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Work</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Exercise</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Family</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg opacity-60">
            <p className="text-sm text-gray-600 mb-2">Question 2</p>
            <p className="font-medium text-gray-900">What are you telling yourself?</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg opacity-30">
            <p className="text-sm text-gray-600 mb-2">Question 3</p>
            <p className="font-medium text-gray-900">What do you notice in your body?</p>
          </div>
        </div>
      ),
    },
    {
      title: "Discover your patterns",
      description: "After logging 10 moods, you'll unlock insights about what affects your happiness and motivation.",
      visual: (
        <div className="max-w-sm mx-auto space-y-4">
          {/* Mock insight card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-3xl mb-2">💡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Insight</h3>
            <p className="text-sm text-gray-700">
              When you focus on &quot;exercise&quot; your happiness is typically 30% higher than average
            </p>
          </div>

          {/* Mock pattern visualization */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Top Focus Areas</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Work projects</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i <= 3 ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Exercise</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i <= 5 ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl w-full">
        {/* Skip button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-smooth"
          >
            Skip
          </button>
        </div>

        {/* Slide content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Visual */}
          <div className="mb-8">
            {currentSlideData.visual}
          </div>

          {/* Text content */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              {currentSlideData.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              {currentSlideData.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mt-8 mb-6">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-smooth ${
                  index === currentSlide
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation button */}
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {currentSlide < 2 ? 'Next' : 'Get Started'}
          </button>
        </div>
      </div>
    </main>
  );
}
