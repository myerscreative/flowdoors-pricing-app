'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Recipe } from '@/types';

export default function RecipesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecipes();
  }, [filter]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'favorites') {
        params.append('favoritesOnly', 'true');
      }

      const res = await fetch(`/api/recipes?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      setRecipes(data.recipes || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setRecipes(recipes.map(r => 
        r.id === id ? { ...r, is_favorite: !currentStatus } : r
      ));

      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'favorite', 
          isFavorite: !currentStatus 
        }),
      });

      if (!res.ok) throw new Error('Failed to update favorite');
    } catch (err) {
      console.error(err);
      // Revert on error
      loadRecipes();
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete recipe');
      
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete recipe');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/patterns" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-bold text-xl text-slate-800">My Recipes</h1>
          </div>
          <Link 
            href="/patterns"
            className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
          >
            + New
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Recipes
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
              filter === 'favorites'
                ? 'bg-pink-100 text-pink-700 border border-pink-200 shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Favorites
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🧪</span>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">No recipes yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              {filter === 'favorites' 
                ? "You haven't favorited any recipes yet." 
                : "Generate your first emotion recipe from your patterns!"}
            </p>
            {filter === 'all' && (
              <Link
                href="/patterns"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-linear-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700 shadow-sm"
              >
                Go to Patterns
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1">{recipe.title}</h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold text-slate-600">
                          {recipe.target_emotion}
                        </span>
                        <span>•</span>
                        <span>{recipe.duration}</span>
                        <span>•</span>
                        <span>Used {recipe.use_count}x</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(recipe.id, recipe.is_favorite);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        recipe.is_favorite 
                          ? 'text-yellow-400 bg-yellow-50' 
                          : 'text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {recipe.why_this_works}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                    
                    <Link
                      href={`/recipe-player?id=${recipe.id}`}
                      className="inline-flex items-center space-x-1 text-sm font-bold text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      <span>Play Recipe</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

