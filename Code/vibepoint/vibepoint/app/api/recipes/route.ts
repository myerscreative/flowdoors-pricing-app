import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getRecipes, createRecipe } from '@/lib/db';
import { RecipeInput } from '@/types';

/**
 * GET /api/recipes
 *
 * Get user's saved recipes
 * Query params:
 * - limit: number
 * - favoritesOnly: boolean
 * - targetEmotion: string
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

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const favoritesOnly = searchParams.get('favoritesOnly') === 'true';
    const targetEmotion = searchParams.get('targetEmotion') || undefined;

    const { data, error } = await getRecipes({
      limit,
      favoritesOnly,
      targetEmotion,
    });

    if (error) {
      console.error('Error fetching recipes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ recipes: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recipes
 *
 * Save a new recipe
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

    const body = await request.json();
    const recipeInput: RecipeInput = {
      title: body.title,
      target_emotion: body.target_emotion,
      duration: body.duration,
      steps: body.steps,
      why_this_works: body.why_this_works,
      is_favorite: body.is_favorite || false,
    };

    // Validate input
    if (!recipeInput.title || !recipeInput.target_emotion || !recipeInput.steps) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await createRecipe(recipeInput);

    if (error) {
      console.error('Error creating recipe:', error);
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ recipe: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
