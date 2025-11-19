import { supabase } from './supabase';
import { MoodEntry, MoodEntryInput } from '@/types';

// Mood entries
export async function createMoodEntry(entry: MoodEntryInput): Promise<{ data: MoodEntry | null; error: any }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('mood_entries')
    .insert([
      {
        user_id: user.id,
        ...entry,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function getMoodEntries(limit?: number): Promise<{ data: MoodEntry[] | null; error: any }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('Not authenticated') };
  }

  let query = supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  return { data, error };
}

export async function getMoodEntry(id: string): Promise<{ data: MoodEntry | null; error: any }> {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

export async function updateMoodEntry(id: string, updates: Partial<MoodEntryInput>): Promise<{ data: MoodEntry | null; error: any }> {
  const { data, error } = await supabase
    .from('mood_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteMoodEntry(id: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from('mood_entries')
    .delete()
    .eq('id', id);

  return { error };
}

// User preferences
export async function hasCompletedOnboarding(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  return data?.onboarding_completed || false;
}

export async function setOnboardingCompleted(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      onboarding_completed: true,
    });
}
