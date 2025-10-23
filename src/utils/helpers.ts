/**
 * Utility functions for the application
 */

/**
 * Formats a price with currency symbol
 * @param price - The price to format
 * @param currency - The currency symbol (default: $)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = '$'): string {
  if (price < 0) {
    throw new Error('Price cannot be negative')
  }

  return `${currency}${price.toFixed(2)}`
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}








