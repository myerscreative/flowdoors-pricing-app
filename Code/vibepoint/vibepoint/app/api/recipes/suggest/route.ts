import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getRecipes } from '@/lib/db';
import { checkProStatus } from '@/lib/pro-tier-server';

/**
 * GET /api/recipes/suggest
 *
 * Suggest a recipe for a low mood entry
 * Query params:
 * - entryId: UUID of the mood entry that triggered the suggestion
 * - happinessLevel: 0-1 (y coordinate)
 * - motivationLevel: 0-1 (x coordinate)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check Pro status - this feature is Pro only
    const proStatus = await checkProStatus();
    if (!proStatus.isPro) {
      return NextResponse.json(
        { error: 'Recipe suggestions are a Pro feature. Please upgrade to access.' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const entryId = searchParams.get('entryId');
    const happinessLevel = parseFloat(searchParams.get('happinessLevel') || '0');
    const motivationLevel = parseFloat(searchParams.get('motivationLevel') || '0');

    // Validate coordinates
    if (isNaN(happinessLevel) || isNaN(motivationLevel) ||
        happinessLevel < 0 || happinessLevel > 1 ||
        motivationLevel < 0 || motivationLevel > 1) {
      return NextResponse.json(
        { error: 'Invalid mood coordinates' },
        { status: 400 }
      );
    }

    // Determine if this is a low mood (bottom-left or bottom-right quadrant)
    const isLowMood = happinessLevel < 0.5;
    
    if (!isLowMood) {
      return NextResponse.json(
        { error: 'Recipe suggestions are only shown for low mood entries' },
        { status: 400 }
      );
    }

    // Get user's recipes
    const { data: recipes, error } = await getRecipes({
      favoritesOnly: false,
    });

    if (error) {
      console.error('Error fetching recipes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }

    if (!recipes || recipes.length === 0) {
      return NextResponse.json(
        { error: 'No recipes available. Create a recipe first!' },
        { status: 404 }
      );
    }

    // Simple algorithm: prefer favorite recipes, then by highest success rate
    // In the future, could use ML to match recipe to mood pattern
    const sortedRecipes = [...recipes].sort((a, b) => {
      // Favorites first
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      
      // Then by success rate (if available)
      const aSuccessRate = a.avg_rating && a.times_used ? (a.success_count / a.times_used) : 0;
      const bSuccessRate = b.avg_rating && b.times_used ? (b.success_count / b.times_used) : 0;
      
      if (bSuccessRate !== aSuccessRate) {
        return bSuccessRate - aSuccessRate;
      }
      
      // Finally, by most recently used/updated
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    const suggestedRecipe = sortedRecipes[0];

    // Create recipe attempt record (to track that suggestion was shown)
    if (entryId) {
      const { error: attemptError } = await supabase
        .from('recipe_attempts')
        .insert({
          user_id: user.id,
          recipe_id: suggestedRecipe.id,
          triggered_after_entry_id: entryId,
          starting_mood_x: motivationLevel,
          starting_mood_y: happinessLevel,
          completed: false,
        });

      if (attemptError) {
        console.error('Error creating recipe attempt:', attemptError);
        // Don't fail the request - suggestion still works
      }
    }

    return NextResponse.json({ recipe: suggestedRecipe });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

