// Product service for managing product data
export interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  image: string
  category: string
  features: string[]
}

export interface ProductConfiguration {
  material: string
  size: string
  color: string
  hardware: string
  additionalFeatures: string[]
}

// Mock product data
const mockProducts: Product[] = [
  {
    id: 'classic-door',
    name: 'Classic Door',
    description: 'Traditional style door with timeless appeal',
    basePrice: 1200,
    image: 'https://placehold.co/400x600/e2e8f0/64748b?text=Classic+Door',
    category: 'Traditional',
    features: [
      'Solid wood construction',
      'Traditional styling',
      'Multiple finish options',
    ],
  },
  {
    id: 'modern-door',
    name: 'Modern Door',
    description: 'Contemporary design with clean lines',
    basePrice: 1500,
    image: 'https://placehold.co/400x600/e2e8f0/64748b?text=Modern+Door',
    category: 'Contemporary',
    features: ['Minimalist design', 'Premium materials', 'Energy efficient'],
  },
  {
    id: 'rustic-door',
    name: 'Rustic Door',
    description: 'Natural wood finish with rustic charm',
    basePrice: 1800,
    image: 'https://placehold.co/400x600/e2e8f0/64748b?text=Rustic+Door',
    category: 'Rustic',
    features: [
      'Reclaimed wood',
      'Handcrafted details',
      'Unique grain patterns',
    ],
  },
]

export const productService = {
  async getProducts(): Promise<Product[]> {
    return mockProducts
  },

  async getProduct(id: string): Promise<Product | null> {
    return mockProducts.find((product) => product.id === id) || null
  },

  calculatePrice(
    basePrice: number,
    configuration: ProductConfiguration
  ): number {
    let totalPrice = basePrice

    // Hardware pricing
    const hardwarePricing = {
      Bronze: 50,
      Black: 25,
    }

    totalPrice +=
      hardwarePricing[configuration.hardware as keyof typeof hardwarePricing] ||
      0

    return totalPrice
  },
}
