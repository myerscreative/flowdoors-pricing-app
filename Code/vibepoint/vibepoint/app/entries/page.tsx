'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import HeatMap from '@/components/HeatMap'
import EntryCard from '@/components/EntryCard'
import { MoodEntry } from '@/types'

export default function EntriesPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })

    if (!error && data) {
      setEntries(data as MoodEntry[])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">Your Mood History</h1>

      {/* Heat Map */}
      <div className="mb-10">
        <HeatMap entries={entries} />
      </div>

      {/* Entries */}
      {loading && (
        <p className="text-neutral-400 text-center">Loading entries...</p>
      )}

      {!loading && entries.length === 0 && (
        <p className="text-neutral-500 text-center">No entries yet.</p>
      )}

      <div className="space-y-4">
        {entries.map(entry => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}


