import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Recipe, RecipeInput } from '@/types';

// Recipes (Pro tier)

export async function createRecipe(recipe: RecipeInput): Promise<{ data: Recipe | null; error: any }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert([
      {
        user_id: user.id,
        ...recipe,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function getRecipes(options: { 
  favoritesOnly?: boolean;
  targetEmotion?: string;
  limit?: number;
} = {}): Promise<{ data: Recipe[] | null; error: any }> {
  const supabase = await createServerSupabaseClient();
  
  let query = supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.favoritesOnly) {
    query = query.eq('is_favorite', true);
  }

  if (options.targetEmotion) {
    query = query.eq('target_emotion', options.targetEmotion);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  
  return { data: data as Recipe[] | null, error };
}

export async function getRecipe(id: string): Promise<{ data: Recipe | null; error: any }> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();
    
  return { data: data as Recipe | null, error };
}

export async function toggleRecipeFavorite(id: string, isFavorite: boolean): Promise<{ error: any }> {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('recipes')
    .update({ is_favorite: isFavorite })
    .eq('id', id);
    
  return { error };
}

export async function incrementRecipeUseCount(id: string): Promise<{ error: any }> {
  const supabase = await createServerSupabaseClient();
  
  // First get current count
  const { data, error: fetchError } = await supabase
    .from('recipes')
    .select('use_count')
    .eq('id', id)
    .single();
    
  if (fetchError) return { error: fetchError };
  
  const newCount = (data?.use_count || 0) + 1;
  
  const { error } = await supabase
    .from('recipes')
    .update({ 
      use_count: newCount,
      last_used_at: new Date().toISOString()
    })
    .eq('id', id);
    
  return { error };
}

export async function deleteRecipe(id: string): Promise<{ error: any }> {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);
    
  return { error };
}
