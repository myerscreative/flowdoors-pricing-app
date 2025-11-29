'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Recipe } from '@/types'
import { ProBadge } from '@/components/ProBadge'

export default function RecipesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    loadRecipes()
  }, [activeFilter])

  const loadRecipes = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (activeFilter === 'favorites') {
        params.append('favoritesOnly', 'true')
      }

      const res = await fetch(`/api/recipes?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to load recipes')
      
      setRecipes(data.recipes || [])
    } catch (err: any) {
      console.error('Error loading recipes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (recipeId: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setRecipes(recipes.map(r => 
        r.id === recipeId ? { ...r, is_favorite: !currentStatus } : r
      ))

      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'favorite', 
          isFavorite: !currentStatus 
        }),
      })

      if (!res.ok) throw new Error('Failed to update favorite')
    } catch (err) {
      console.error(err)
      // Revert on error
      loadRecipes()
    }
  }

  const handleDelete = async (recipeId: string) => {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete recipe')
      
      setRecipes(recipes.filter(r => r.id !== recipeId))
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
      alert('Failed to delete recipe')
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    }
    return `${secs}s`
  }

  const filteredRecipes = activeFilter === 'favorites'
    ? recipes.filter(r => r.is_favorite)
    : recipes

  const getStepTags = (steps: Recipe['recipe_steps']): string[] => {
    if (!steps || steps.length === 0) return []
    
    const tags: string[] = []
    steps.forEach(step => {
      const title = step.title.toLowerCase()
      if (title.includes('breath')) tags.push('Breathing')
      else if (title.includes('movement') || title.includes('stretch') || title.includes('body')) tags.push('Movement')
      else if (title.includes('visual') || title.includes('imagine') || title.includes('picture')) tags.push('Visualization')
      else if (title.includes('gratitude') || title.includes('appreciat')) tags.push('Gratitude')
      else if (title.includes('affirm') || title.includes('say')) tags.push('Affirmations')
    })
    
    // Return unique tags, limit to 3
    return [...new Set(tags)].slice(0, 3)
  }

  return (
    <div 
      className="min-h-screen pb-24"
      style={{ 
        background: 'linear-gradient(45deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="relative z-10 mx-auto max-w-[480px] md:max-w-[600px] px-5 py-6 md:px-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="flex items-center gap-2 rounded-[24px] border-2 border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#1a1a2e] transition-colors hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </Link>
            <h1 
              className="font-serif text-[32px] font-semibold text-white"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              My Recipes
            </h1>
          </div>
          <ProBadge size="md" />
        </header>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-3 rounded-[20px] bg-white p-2 shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 rounded-[16px] px-4 py-2.5 text-sm font-semibold transition-all ${
              activeFilter === 'all'
                ? 'text-white shadow-[0_2px_8px_rgba(168,85,247,0.3)]'
                : 'text-[#4a4a6a] hover:bg-gray-50'
            }`}
            style={
              activeFilter === 'all'
                ? {
                    background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
                  }
                : {}
            }
          >
            All Recipes
          </button>
          <button
            onClick={() => setActiveFilter('favorites')}
            className={`flex-1 rounded-[16px] px-4 py-2.5 text-sm font-semibold transition-all ${
              activeFilter === 'favorites'
                ? 'text-white shadow-[0_2px_8px_rgba(168,85,247,0.3)]'
                : 'text-[#4a4a6a] hover:bg-gray-50'
            }`}
            style={
              activeFilter === 'favorites'
                ? {
                    background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
                  }
                : {}
            }
          >
            Favorites
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRecipes.length === 0 && (
          <div className="rounded-[20px] bg-white p-12 text-center shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
            <div className="mb-4 text-6xl">📝</div>
            <h3 className="mb-2 font-serif text-xl font-semibold text-[#1a1a2e]">
              {activeFilter === 'favorites' ? 'No favorite recipes yet' : 'No recipes yet'}
            </h3>
            <p className="mb-6 text-sm text-[#4a4a6a]">
              {activeFilter === 'favorites'
                ? "You haven't favorited any recipes yet. Mark recipes as favorites to find them quickly."
                : "Create your first mood-shifting recipe to get started. Build routines that help you shift your emotional state."}
            </p>
            {activeFilter === 'all' && (
              <Link
                href="/patterns"
                className="inline-block rounded-[24px] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(168,85,247,0.3)] transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
                }}
              >
                Create Recipe
              </Link>
            )}
          </div>
        )}

        {/* Recipes Grid */}
        {!isLoading && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredRecipes.map((recipe) => {
              const stepCount = recipe.recipe_steps?.length || 0
              const tags = getStepTags(recipe.recipe_steps)

              return (
                <div
                  key={recipe.id}
                  className="group cursor-pointer rounded-[20px] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
                  onClick={() => router.push(`/recipe-player?id=${recipe.id}`)}
                >
                  {/* Header with title and actions */}
                  <div className="mb-3 flex items-start justify-between">
                    <h3 
                      className="flex-1 font-serif text-[20px] font-semibold text-[#1a1a2e]"
                      style={{ fontFamily: 'var(--font-fraunces)' }}
                    >
                      {recipe.title}
                    </h3>
                    <div className="ml-2 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(recipe.id, recipe.is_favorite)
                        }}
                        className={`rounded-full p-1.5 transition-colors ${
                          recipe.is_favorite
                            ? 'text-pink-500'
                            : 'text-gray-300 hover:text-pink-400'
                        }`}
                      >
                        <svg className="h-5 w-5" fill={recipe.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(recipe.id)
                        }}
                        className="rounded-full p-1.5 text-gray-400 transition-colors hover:text-red-500"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="mb-3 flex items-center gap-4 text-xs text-[#718096]">
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatDuration(recipe.total_duration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{stepCount} {stepCount === 1 ? 'step' : 'steps'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-4 line-clamp-2 text-sm text-[#4a4a6a]" style={{ fontFamily: 'var(--font-outfit)' }}>
                    {recipe.description}
                  </p>

                  {/* Step tags */}
                  {tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-[#4a4a6a]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Gradient preview bar */}
                  <div
                    className="h-2 rounded-[4px]"
                    style={{
                      background: 'linear-gradient(90deg, #A855F7 0%, #EC4899 50%, #F97316 100%)',
                      opacity: 0.3,
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setDeleteTarget(null)}
        >
          <div 
            className="relative z-10 w-full max-w-[400px] rounded-[28px] bg-white p-6 shadow-[0_25px_80px_rgba(0,0,0,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 font-serif text-xl font-semibold text-[#1a1a2e]">
              Delete Recipe?
            </h3>
            <p className="mb-6 text-sm text-[#4a4a6a]">
              Are you sure you want to delete this recipe? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="rounded-[24px] border-2 border-black/10 bg-white px-6 py-2.5 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-gray-50"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="rounded-[24px] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(220,38,38,0.3)] transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                }}
                onClick={() => handleDelete(deleteTarget)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
