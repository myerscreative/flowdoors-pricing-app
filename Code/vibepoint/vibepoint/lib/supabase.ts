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
    // Clear Supabase auth cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
    })
    localStorage.clear()
    sessionStorage.clear()
  }

  // Return user-friendly error messages
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.'
  }
  if (error.message?.includes('Email not confirmed')) {
    return 'Please check your email and confirm your account.'
  }
  
  return error.message || 'Authentication failed. Please try again.'
}
