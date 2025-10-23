import { formatPrice, isValidEmail } from '@/utils/helpers'

describe('helpers', () => {
  describe('formatPrice', () => {
    it('should format price with default currency', () => {
      const result = formatPrice(123.45)
      expect(result).toBe('$123.45')
    })

    it('should format price with custom currency', () => {
      const result = formatPrice(123.45, '€')
      expect(result).toBe('€123.45')
    })

    it('should handle zero price', () => {
      const result = formatPrice(0)
      expect(result).toBe('$0.00')
    })

    it('should throw error for negative price', () => {
      expect(() => formatPrice(-100)).toThrow('Price cannot be negative')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })
})








