'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Recipe } from '@/types';

// Sample recipe for prototype/demo fallback
const sampleRecipe: Recipe = {
  id: 'sample',
  user_id: 'demo',
  title: "Your Confidence Recipe",
  target_emotion: "confident",
  duration: "60 seconds",
  steps: [
    {
      step: 1,
      focus: "Mental shift",
      instruction: "Recall a time when you felt fully prepared. Close your eyes and remember that feeling of 'I've got this.'",
      duration: 15,
    },
    {
      step: 2,
      focus: "Body adjustment",
      instruction: "Stand tall, pull your shoulders back, and take a deep breath. Embody the posture of confidence.",
      duration: 25,
    },
    {
      step: 3,
      focus: "Action intent",
      instruction: "Say out loud: 'I am capable and ready.' Visualise your next successful action.",
      duration: 20,
    }
  ],
  why_this_works: "This recipe combines memory recall with physiological changes (power posing) to rapidly shift your state.",
  is_favorite: false,
  use_count: 0,
  created_at: new Date().toISOString()
};

export default function RecipePlayerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('id');
  
  const [loading, setLoading] = useState(!!recipeId);
  const [recipe, setRecipe] = useState<Recipe>(sampleRecipe);
  const [activeStep, setActiveStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (recipeId && recipeId !== 'sample') {
      fetchRecipe(recipeId);
    } else {
      // Use sample recipe
      setTimeLeft(sampleRecipe.steps[0].duration);
    }
  }, [recipeId]);

  const fetchRecipe = async (id: string) => {
    try {
      const res = await fetch(`/api/recipes/${id}`);
      const data = await res.json();
      
      if (res.ok && data.recipe) {
        setRecipe(data.recipe);
        setTimeLeft(data.recipe.steps[0].duration);
      } else {
        console.error("Failed to load recipe, using sample");
        // Keep sample recipe
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trackUsage = async () => {
    if (recipe.id === 'sample') return;
    
    try {
      await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment_use' }),
      });
    } catch (err) {
      console.error("Failed to track usage", err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      handleNextStep();
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const handleStart = () => {
    setIsPlaying(true);
    setHasStarted(true);
    trackUsage();
  };

  const handleNextStep = () => {
    if (activeStep < recipe.steps.length - 1) {
      setActiveStep((prev) => {
        const next = prev + 1;
        setTimeLeft(recipe.steps[next].duration);
        return next;
      });
    } else {
      setIsPlaying(false);
      setIsComplete(true);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => {
        const next = prev - 1;
        setTimeLeft(recipe.steps[next].duration);
        return next;
      });
      setIsPlaying(false);
    }
  };

  const handleRestart = () => {
    setActiveStep(0);
    setTimeLeft(recipe.steps[0].duration);
    setIsPlaying(true);
    setIsComplete(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Progress calculation for the circle
  const currentStepDuration = recipe.steps[activeStep].duration;
  const progress = ((currentStepDuration - timeLeft) / currentStepDuration) * 100;
  const circumference = 2 * Math.PI * 120; // Radius 120
  const dashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-900 rounded-full blur-[120px] opacity-40 animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-pink-900 rounded-full blur-[120px] opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-sm font-medium tracking-wider uppercase opacity-70">Emotion Recipe</div>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 text-center">
        {isComplete ? (
          <div className="animate-fade-in space-y-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-blue-400">
              Recipe Complete!
            </h1>
            <p className="text-slate-300 max-w-xs mx-auto">
              Great job taking a moment to shift your state. How are you feeling now?
            </p>
            
            <div className="flex flex-col space-y-4 w-full max-w-xs mx-auto pt-8">
              <Link 
                href="/mood/new"
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-blue-600 rounded-xl font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all active:scale-95"
              >
                Log New Mood
              </Link>
              <button 
                onClick={handleRestart}
                className="w-full py-4 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Run Recipe Again
              </button>
              <Link
                href="/recipes"
                className="text-sm text-slate-400 hover:text-white transition-colors py-2"
              >
                Back to Recipes
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            {!hasStarted ? (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{recipe.title}</h1>
                  <div className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-sm font-medium border border-pink-500/30">
                    Target: {recipe.target_emotion}
                  </div>
                </div>
                
                <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <h3 className="text-lg font-semibold mb-3 text-blue-300">Why this works</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {recipe.why_this_works}
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-8 py-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{recipe.duration}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Duration</div>
                  </div>
                  <div className="w-px h-10 bg-white/10"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{recipe.steps.length}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Steps</div>
                  </div>
                </div>

                <button 
                  onClick={handleStart}
                  className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-xl hover:bg-slate-100 transition-transform active:scale-95"
                >
                  Start Recipe
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Timer Circle */}
                <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/10"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashoffset}
                      strokeLinecap="round"
                      className="text-pink-500 transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  
                  {/* Time Display */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <div className="text-6xl font-bold font-mono tracking-tight">
                      {timeLeft}
                    </div>
                    <div className="text-sm text-pink-400 font-medium mt-1 uppercase tracking-wider">
                      Seconds
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="w-full space-y-6 text-center animate-fade-in" key={activeStep}>
                  <div className="space-y-2">
                    <div className="text-sm uppercase tracking-widest text-blue-400 font-bold">
                      Step {activeStep + 1}: {recipe.steps[activeStep].focus}
                    </div>
                    <h2 className="text-2xl font-medium leading-snug min-h-[4rem]">
                      {recipe.steps[activeStep].instruction}
                    </h2>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-6 pt-8">
                    <button 
                      onClick={handlePreviousStep}
                      disabled={activeStep === 0}
                      className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button 
                      onClick={togglePlay}
                      className="p-6 rounded-full bg-white text-slate-900 hover:scale-105 transition-transform shadow-lg shadow-white/10"
                    >
                      {isPlaying ? (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <button 
                      onClick={handleNextStep}
                      className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


