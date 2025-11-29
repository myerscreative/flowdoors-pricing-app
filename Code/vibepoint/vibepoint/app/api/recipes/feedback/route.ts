import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { checkProStatus } from '@/lib/pro-tier-server';

/**
 * POST /api/recipes/feedback
 *
 * Submit feedback for a recipe attempt
 * Body:
 * - attemptId: UUID of the recipe_attempts record
 * - rating: 1-5
 * - mostHelpfulIngredient: 'focus' | 'self_talk' | 'physiology' | 'combination'
 * - notes?: string (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check Pro status
    const proStatus = await checkProStatus();
    if (!proStatus.isPro) {
      return NextResponse.json(
        { error: 'Recipe feedback is a Pro feature' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { attemptId, rating, mostHelpfulIngredient, notes, followUpEntryId, endingMoodX, endingMoodY } = body;

    if (!attemptId || !rating || !mostHelpfulIngredient) {
      return NextResponse.json(
        { error: 'Missing required fields: attemptId, rating, mostHelpfulIngredient' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const validIngredients = ['focus', 'self_talk', 'physiology', 'combination'];
    if (!validIngredients.includes(mostHelpfulIngredient)) {
      return NextResponse.json(
        { error: 'Invalid mostHelpfulIngredient' },
        { status: 400 }
      );
    }

    // Get the recipe attempt to verify ownership and get starting mood
    const { data: attempt, error: attemptError } = await supabase
      .from('recipe_attempts')
      .select('*, recipes!inner(*)')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: 'Recipe attempt not found' },
        { status: 404 }
      );
    }

    // Calculate mood improvement if we have ending mood
    let moodImprovement: number | null = null;
    if (attempt.starting_mood_x !== null && attempt.starting_mood_y !== null &&
        endingMoodX !== null && endingMoodY !== null) {
      const dx = endingMoodX - attempt.starting_mood_x;
      const dy = endingMoodY - attempt.starting_mood_y;
      moodImprovement = Math.sqrt(dx * dx + dy * dy);
    }

    // Update recipe attempt with feedback
    const updateData: any = {
      effectiveness_rating: rating,
      most_helpful_ingredient: mostHelpfulIngredient,
      completed: true,
    };

    if (notes) {
      updateData.user_notes = notes;
    }

    if (followUpEntryId) {
      updateData.follow_up_entry_id = followUpEntryId;
    }

    if (endingMoodX !== null && endingMoodY !== null) {
      updateData.ending_mood_x = endingMoodX;
      updateData.ending_mood_y = endingMoodY;
    }

    if (moodImprovement !== null) {
      updateData.mood_improvement = moodImprovement;
    }

    // Calculate time to shift if we have timestamps
    if (followUpEntryId) {
      const { data: followUpEntry } = await supabase
        .from('mood_entries')
        .select('created_at')
        .eq('id', followUpEntryId)
        .single();

      if (followUpEntry && attempt.created_at) {
        const startTime = new Date(attempt.created_at).getTime();
        const endTime = new Date(followUpEntry.created_at).getTime();
        const minutes = Math.floor((endTime - startTime) / 60000);
        updateData.time_to_shift = minutes;
      }
    }

    const { error: updateError } = await supabase
      .from('recipe_attempts')
      .update(updateData)
      .eq('id', attemptId);

    if (updateError) {
      console.error('Error updating recipe attempt:', updateError);
      return NextResponse.json(
        { error: 'Failed to update recipe attempt' },
        { status: 500 }
      );
    }

    // Update recipe stats
    const recipeId = (attempt.recipes as any).id;

    // Get all completed attempts for this recipe
    const { data: allAttempts, error: statsError } = await supabase
      .from('recipe_attempts')
      .select('effectiveness_rating')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .eq('completed', true)
      .not('effectiveness_rating', 'is', null);

    if (!statsError && allAttempts) {
      const timesUsed = allAttempts.length;
      const successCount = allAttempts.filter(a => a.effectiveness_rating >= 4).length;
      const avgRating = allAttempts.reduce((sum, a) => sum + (a.effectiveness_rating || 0), 0) / timesUsed;

      // Update recipe stats
      await supabase
        .from('recipes')
        .update({
          times_used: timesUsed,
          success_count: successCount,
          avg_rating: avgRating,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recipeId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

