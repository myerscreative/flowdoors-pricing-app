import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Helper function to handle auth errors
export const handleAuthError = (error: any) => {
  console.error('Auth error:', error)

  // Clear potentially corrupted auth state
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase.auth.token')
    sessionStorage.clear()
  }

  return error.message || 'Authentication failed'
}
