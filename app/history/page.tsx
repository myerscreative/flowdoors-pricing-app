'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getMoodEntries, deleteMoodEntry } from '@/lib/db';
import { getCurrentUser } from '@/lib/supabase';
import { MoodEntry } from '@/types';
import { getMoodDescription } from '@/lib/mood-utils';

type FilterType = 'all' | 'week' | 'month';

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
        setError('Failed to load mood history');
      } else if (data) {
        setEntries(data);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mood entry?')) {
      return;
    }

    const { error: deleteError } = await deleteMoodEntry(id);
    if (deleteError) {
      setError('Failed to delete entry');
    } else {
      setEntries(entries.filter((e) => e.id !== id));
      setExpandedId(null);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'all') return true;

    const entryDate = new Date(entry.created_at);
    const now = new Date();

    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo;
    }

    if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return entryDate >= monthAgo;
    }

    return true;
  });

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-lg text-gray-700">Loading your mood history...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">History</h1>
          <Link
            href="/home"
            className="text-blue-600 hover:text-blue-700 font-medium transition-smooth"
          >
            ← Back
          </Link>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-smooth ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-smooth ${
                filter === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilter('month')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-smooth ${
                filter === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Entries */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">No mood entries yet</p>
            <Link
              href="/mood/log"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-smooth"
            >
              Log your first mood
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-smooth hover:shadow-lg"
              >
                {/* Collapsed view */}
                <button
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {format(new Date(entry.created_at), 'EEE, MMM d')} at{' '}
                        {format(new Date(entry.created_at), 'h:mm a')}
                      </p>
                      <p className="font-medium text-gray-900">
                        {getMoodDescription({ x: entry.mood_x, y: entry.mood_y })}
                      </p>
                    </div>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden mood-gradient flex-shrink-0">
                      <div
                        className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md"
                        style={{
                          left: `${entry.mood_x}%`,
                          top: `${entry.mood_y}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Focus:</span> {entry.focus}
                  </p>

                  <div className="mt-2 text-sm text-blue-600 font-medium">
                    {expandedId === entry.id ? 'Tap to collapse ↑' : 'Tap to expand ↓'}
                  </div>
                </button>

                {/* Expanded view */}
                {expandedId === entry.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {/* Large gradient */}
                    <div className="relative w-full h-48 rounded-xl overflow-hidden mood-gradient mb-6">
                      <div
                        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg"
                        style={{
                          left: `${entry.mood_x}%`,
                          top: `${entry.mood_y}%`,
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Mood:</p>
                        <p className="text-gray-900">
                          {getMoodDescription({ x: entry.mood_x, y: entry.mood_y })}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Focus:</p>
                        <p className="text-gray-900">{entry.focus}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Self-talk:</p>
                        <p className="text-gray-900">{entry.self_talk}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Physical:</p>
                        <p className="text-gray-900">{entry.physical}</p>
                      </div>

                      {entry.notes && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Notes:</p>
                          <p className="text-gray-900">{entry.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-3 px-6 rounded-lg border border-red-200 transition-smooth focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
