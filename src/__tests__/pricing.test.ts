import { calculatePriceWithTax } from '../pricing'

describe('calculatePriceWithTax', () => {
  it('should calculate price with default tax rate of 8%', () => {
    const price = 100
    const expected = 108
    const result = calculatePriceWithTax(price)
    expect(result).toBe(expected)
  })

  it('should calculate price with custom tax rate', () => {
    const price = 100
    const taxRate = 0.1 // 10%
    const expected = 110
    const result = calculatePriceWithTax(price, taxRate)
    expect(result).toBeCloseTo(expected, 2)
  })

  it('should handle zero price', () => {
    const price = 0
    const expected = 0
    const result = calculatePriceWithTax(price)
    expect(result).toBe(expected)
  })

  it('should handle decimal prices', () => {
    const price = 99.99
    const taxRate = 0.05 // 5%
    const expected = 104.9895
    const result = calculatePriceWithTax(price, taxRate)
    expect(result).toBeCloseTo(expected, 4)
  })

  it('should throw error for negative price', () => {
    const price = -100
    expect(() => calculatePriceWithTax(price)).toThrow(
      'Price cannot be negative'
    )
  })

  it('should throw error for negative tax rate', () => {
    const price = 100
    const taxRate = -0.1
    expect(() => calculatePriceWithTax(price, taxRate)).toThrow(
      'Tax rate must be between 0 and 1'
    )
  })

  it('should throw error for tax rate greater than 1', () => {
    const price = 100
    const taxRate = 1.5
    expect(() => calculatePriceWithTax(price, taxRate)).toThrow(
      'Tax rate must be between 0 and 1'
    )
  })
})
