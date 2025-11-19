'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    getCurrentUser().then((user) => {
      if (user) {
        router.push('/home');
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">Vibepoint</h1>
          <p className="text-2xl text-gray-700 font-light">
            Understand your moods.
          </p>
          <p className="text-2xl text-gray-700 font-light">
            Control your emotional experience.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 pt-8">
          <Link
            href="/signup"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="block w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-6 rounded-lg border-2 border-blue-600 transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Log In
          </Link>
        </div>

        {/* Features Preview */}
        <div className="pt-12 space-y-4 text-left">
          <h2 className="text-lg font-semibold text-gray-900 text-center">How it works</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tap the gradient</h3>
                <p className="text-sm text-gray-600">Express your mood visually on a happiness-motivation grid</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Answer 3 questions</h3>
                <p className="text-sm text-gray-600">Quick insights about your focus, thoughts, and body</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Discover patterns</h3>
                <p className="text-sm text-gray-600">See what affects your mood and make informed changes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
