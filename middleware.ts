import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = [
  '/admin',
  '/api/orders',
  '/api/users',
  '/api/marketing',
  '/api/analytics',
]

// Define public routes that should always be accessible
const publicRoutes = [
  '/login',
  '/signup',
  '/reset-password',
  '/api/auth',
  '/api/leads',
  '/api/quotes',
  '/',
  '/configurator',
  '/quote',
]

// Debug/test pages that should be blocked in production
const debugRoutes = [
  '/debug-quote',
  '/debug-attribution',
  '/env-debug',
  '/test-email',
  '/test-sidebar',
  '/demo-modals',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block debug routes in production
  if (process.env.NODE_ENV === 'production') {
    if (debugRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // For API routes, check for authentication token
  if (pathname.startsWith('/api/')) {
    // Check for Firebase Auth token in Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // The actual token verification will be done in the API route handlers
    // This middleware just checks for the presence of the token
    return NextResponse.next()
  }

  // For admin pages, check for authentication cookie or session
  // In development mode, allow access
  if (process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return NextResponse.next()
  }

  // Check for Firebase auth session cookie
  const sessionCookie = request.cookies.get('__session')

  if (!sessionCookie) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
