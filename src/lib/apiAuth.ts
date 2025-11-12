import { NextRequest } from 'next/server'
import admin from 'firebase-admin'

export interface AuthResult {
  authenticated: boolean
  uid?: string
  email?: string
  role?: string
  error?: string
}

/**
 * Verifies Firebase Auth token from request Authorization header
 * @param request - Next.js request object
 * @returns AuthResult with authentication details
 */
export async function verifyAuthToken(
  request: NextRequest
): Promise<AuthResult> {
  try {
    // Skip auth in development mode if explicitly enabled
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_DEV_MODE === 'true'
    ) {
      return {
        authenticated: true,
        uid: 'dev-user',
        email: 'dev@flowdoors.com',
        role: 'admin',
      }
    }

    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        error: 'Missing or invalid authorization header',
      }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    try {
      const decodedToken = await admin.auth().verifyIdToken(token)

      return {
        authenticated: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: (decodedToken.role as string) || 'user',
      }
    } catch (_error) {
      return {
        authenticated: false,
        error: 'Invalid or expired token',
      }
    }
  } catch (_error) {
    return {
      authenticated: false,
      error: 'Authentication failed',
    }
  }
}

/**
 * Checks if authenticated user has required role
 * @param authResult - Result from verifyAuthToken
 * @param allowedRoles - Array of roles that can access the resource
 * @returns boolean indicating if user is authorized
 */
export function isAuthorized(
  authResult: AuthResult,
  allowedRoles: string[]
): boolean {
  if (!authResult.authenticated || !authResult.role) {
    return false
  }

  return allowedRoles.includes(authResult.role)
}
