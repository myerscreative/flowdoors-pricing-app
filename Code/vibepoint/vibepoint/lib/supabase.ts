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

  // Extract error message from various possible error formats
  // Supabase AuthApiError has: error.message, error.status, error.name
  let errorMessage = ''
  
  if (error?.message) {
    errorMessage = error.message
  } else if (error?.error_description) {
    errorMessage = error.error_description
  } else if (error?.error) {
    errorMessage = typeof error.error === 'string' ? error.error : error.error.message || ''
  } else if (typeof error === 'string') {
    errorMessage = error
  } else if (error?.toString && error.toString() !== '[object Object]') {
    errorMessage = error.toString()
  }

  // Normalize error message for comparison (lowercase, trim)
  const normalizedMessage = errorMessage.toLowerCase().trim()

  // Return user-friendly error messages
  if (normalizedMessage.includes('invalid login credentials') || 
      normalizedMessage.includes('invalid credentials') ||
      normalizedMessage.includes('invalid email or password')) {
    return 'Invalid email or password. Please try again.'
  }
  if (normalizedMessage.includes('email not confirmed') || 
      normalizedMessage.includes('email not verified')) {
    return 'Please check your email and confirm your account before signing in.'
  }
  if (normalizedMessage.includes('user already registered') || 
      normalizedMessage.includes('already registered') ||
      normalizedMessage.includes('user already exists')) {
    return 'An account with this email already exists. Please sign in instead.'
  }
  if (normalizedMessage.includes('too many requests') ||
      normalizedMessage.includes('rate limit')) {
    return 'Too many login attempts. Please wait a few minutes and try again.'
  }
  if (normalizedMessage.includes('password')) {
    return errorMessage
  }
  if (normalizedMessage.includes('email')) {
    return errorMessage
  }
  
  // Return the extracted message or a fallback
  return errorMessage || 'An error occurred. Please try again or contact support if the problem persists.'
}
