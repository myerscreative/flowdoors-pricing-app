import crypto from 'crypto'

/**
 * Generate a secure random token for activation/password reset
 * @param length - Length of the token
 * @returns Secure random string
 */
export function generateActivationToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash a password using SHA-256 (for storage comparison)
 * Note: In production, use bcrypt or Argon2 for password hashing
 * @param password - Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  error?: string
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    }
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number',
    }
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      error:
        'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)',
    }
  }

  return { isValid: true }
}

/**
 * Check if a token has expired
 * @param expiresAt - Expiration timestamp (Date, string, or Firestore Timestamp)
 * @returns Boolean indicating if token is expired
 */
export function isTokenExpired(expiresAt: Date | string | any): boolean {
  let expirationDate: Date

  if (typeof expiresAt === 'string') {
    expirationDate = new Date(expiresAt)
  } else if (expiresAt && typeof expiresAt.toDate === 'function') {
    // Firestore Timestamp object
    expirationDate = expiresAt.toDate()
  } else if (expiresAt instanceof Date) {
    expirationDate = expiresAt
  } else {
    console.error('❌ Invalid expiration date format:', expiresAt)
    return true // Treat invalid dates as expired
  }

  return new Date() > expirationDate
}

/**
 * Generate a secure random string for temporary passwords
 * @param length - Length of the string
 * @returns Random string with mixed case and numbers
 */
export function generateTemporaryPassword(length: number = 12): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return result
}

/**
 * Sanitize user input to prevent injection attacks
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}
