'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { getMoodEntries } from '@/lib/db';
import { format, startOfWeek } from 'date-fns';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entriesThisWeek, setEntriesThisWeek] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [canViewPatterns, setCanViewPatterns] = useState(false);

  useEffect(() => {
    // Check auth and load stats
    const loadData = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      // Get mood entries
      const { data } = await getMoodEntries();
      if (data) {
        setTotalEntries(data.length);
        setCanViewPatterns(data.length >= 10);

        // Count entries this week
        const weekStart = startOfWeek(new Date());
        const thisWeek = data.filter(
          (entry) => new Date(entry.created_at) >= weekStart
        ).length;
        setEntriesThisWeek(thisWeek);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vibepoint</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-900 transition-smooth"
          >
            Sign Out
          </button>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            How are you feeling?
          </h2>

          {/* Main actions */}
          <div className="space-y-4">
            <Link
              href="/mood/log"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 px-6 rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center text-lg"
            >
              Log Mood
            </Link>

            <Link
              href="/history"
              className="block w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-5 px-6 rounded-xl border-2 border-blue-600 transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center text-lg"
            >
              View History
            </Link>

            {canViewPatterns ? (
              <Link
                href="/patterns"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-5 px-6 rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-center text-lg"
              >
                See Patterns
              </Link>
            ) : (
              <div className="block w-full bg-gray-100 text-gray-400 font-semibold py-5 px-6 rounded-xl text-center text-lg cursor-not-allowed">
                <div>See Patterns</div>
                <div className="text-xs mt-1">
                  Log {10 - totalEntries} more mood{10 - totalEntries !== 1 ? 's' : ''} to unlock
                </div>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{entriesThisWeek}</p>
                <p className="text-sm text-gray-600 mt-1">This week</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">{totalEntries}</p>
                <p className="text-sm text-gray-600 mt-1">Total entries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips or motivational message */}
        {totalEntries === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Tracking your mood daily helps you discover patterns and make positive changes.
            </p>
          </div>
        )}

        {totalEntries > 0 && totalEntries < 10 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
            <p className="text-sm text-purple-900">
              ✨ You&apos;re {10 - totalEntries} mood{10 - totalEntries !== 1 ? 's' : ''} away from unlocking pattern insights!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
