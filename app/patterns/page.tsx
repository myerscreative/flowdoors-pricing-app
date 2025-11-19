'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMoodEntries } from '@/lib/db';
import { getCurrentUser } from '@/lib/supabase';
import { MoodEntry, UserStats } from '@/types';
import { analyzePatterns } from '@/lib/pattern-analysis';

export default function PatternsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data, error: fetchError } = await getMoodEntries();
      if (fetchError) {
        setError('Failed to load mood data');
      } else if (data) {
        if (data.length < 10) {
          router.push('/home');
          return;
        }

        setEntries(data);
        const analysis = analyzePatterns(data);
        setStats(analysis);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-lg text-gray-700">Analyzing your patterns...</div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-lg text-gray-700">No pattern data available</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Patterns</h1>
            <p className="text-gray-600 mt-1">Based on {stats.totalEntries} mood entries</p>
          </div>
          <Link
            href="/home"
            className="text-blue-600 hover:text-blue-700 font-medium transition-smooth"
          >
            ← Back
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Mood Map */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Mood Map</h2>

            {/* Scatter plot */}
            <div className="relative w-full aspect-square max-h-96 rounded-xl overflow-hidden mood-gradient mb-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md opacity-70 hover:opacity-100 hover:scale-150 transition-smooth"
                  style={{
                    left: `${entry.mood_x}%`,
                    top: `${entry.mood_y}%`,
                  }}
                  title={`${entry.focus} - ${new Date(entry.created_at).toLocaleDateString()}`}
                />
              ))}

              {/* Axis labels */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-40 rounded-full pointer-events-none">
                Happy
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-40 rounded-full pointer-events-none">
                Unhappy
              </div>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-40 rounded-full pointer-events-none">
                Unmotivated
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-40 rounded-full pointer-events-none">
                Motivated
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Most common zone: <span className="font-semibold text-gray-900">{stats.mostCommonZone}</span>
              </p>
            </div>
          </div>

          {/* Top Focus Areas */}
          {stats.topFocusAreas.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Focus Areas</h2>

              <div className="space-y-4">
                {stats.topFocusAreas.map((focus, index) => (
                  <div key={focus.focus} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 capitalize">
                          {index + 1}. {focus.focus}
                        </h3>
                        <p className="text-xs text-gray-500">{focus.count} entries</p>
                      </div>

                      {/* Mood rating */}
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${
                              i <= Math.round((focus.avgHappiness / 100) * 5)
                                ? 'bg-blue-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Detailed metrics */}
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Avg Happiness</p>
                        <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full"
                            style={{ width: `${focus.avgHappiness}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Avg Motivation</p>
                        <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                            style={{ width: `${focus.avgMotivation}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {stats.insights.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Pattern Insights</h2>

              {stats.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`rounded-xl shadow-lg p-6 ${
                    insight.type === 'positive'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                      : insight.type === 'warning'
                      ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200'
                      : insight.type === 'coaching'
                      ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
                      : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">
                      {insight.type === 'positive' ? '💡' : insight.type === 'warning' ? '⚠️' : insight.type === 'coaching' ? '🧠' : '✨'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-gray-700">{insight.description}</p>

                      {insight.suggestion && (
                        <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 mb-1">💭 Suggestion</p>
                          <p className="text-sm text-gray-700">{insight.suggestion}</p>
                        </div>
                      )}

                      {insight.actionItems && insight.actionItems.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-sm font-medium text-gray-900">Try these steps:</p>
                          <ul className="space-y-1">
                            {insight.actionItems.map((item, i) => (
                              <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                                <span className="text-purple-600 mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {insight.relatedEntries && insight.relatedEntries.length > 0 && (
                        <Link
                          href="/history"
                          className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View related entries →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Not enough data for advanced insights */}
          {stats.totalEntries < 20 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
              <p className="text-sm text-purple-900">
                🌟 Log {20 - stats.totalEntries} more mood{20 - stats.totalEntries !== 1 ? 's' : ''} to unlock
                advanced insights and deeper pattern analysis!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
