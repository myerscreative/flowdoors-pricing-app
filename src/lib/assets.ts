// Centralized asset bases & filename maps

export const CONFIG_BASES = {
  bifold: 'https://storage.googleapis.com/scenic_images/Configs/Bifold/',
  slideStack: 'https://storage.googleapis.com/scenic_images/Configs/Slide-and-Stack/',
  multiSlide: 'https://storage.googleapis.com/scenic_images/Configs/Multi-slide/',
  pocket: 'https://storage.googleapis.com/scenic_images/Configs/Pocket/',
} as const

export const GLASS_BASE = 'https://storage.googleapis.com/scenic_images/Glass/'

// Keys align with builders' unions ("dual" | "triple" | "clear" | "low-e3" | "laminated")
export const GLASS_IMAGE_BY_KEY = {
  // pane config
  dual: 'dual-pane.png',
  triple: 'triple-pane.png',
  // glass types
  clear: 'clear-glass.png',
  'low-e3': 'low-e-3.png',
  laminated: 'laminated-glass.png',
} as const
