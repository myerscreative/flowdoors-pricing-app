/**
 * Calculates the total price including tax
 * @param price - The base price before tax
 * @param taxRate - The tax rate as a decimal (default: 0.08 for 8%)
 * @returns The total price including tax
 */
export function calculatePriceWithTax(
  price: number,
  taxRate: number = 0.08
): number {
  if (price < 0) {
    throw new Error('Price cannot be negative')
  }

  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1')
  }

  return price * (1 + taxRate)
}
