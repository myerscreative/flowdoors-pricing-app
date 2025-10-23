import {
    Clock,
    MoveHorizontal,
    PackageCheck,
    ShieldCheck,
    Wrench
} from 'lucide-react'
import type {
    DeliveryOptionInfo,
    GlazingOption,
    InstallationFeature,
    ProductId,
    ProductTypeInfo,
    RalColor,
} from './types'

export const STEPS = [
  { step: 1, title: 'Configure' },
  { step: 2, title: 'Summary' },
]

export const PRODUCT_TYPES: ProductTypeInfo[] = [
  {
    id: 'Slide-and-Stack',
    name: 'Slide-&-Stack Systems',
    icon: MoveHorizontal,
    description:
      'Non-hinged panels slide and stack to one side for flexible opening widths and layouts. The ultimate in architectural versatility.',
    basePrice: 'From: $110/sq ft',
    features: [
      'Flexible configurations',
      'Minimal frame design',
      'German precision hardware',
    ],
    image: {
      src: '/products/slide-stack/slide-and-stack.png',
      alt: 'Slide-and-stack door system in a commercial space',
      hint: 'stacking glass door',
    },
    sizeConstraints: {
      minPanelWidth: 28,
      maxPanelWidth: 39,
      maxHeight: 137.79,
      maxWidth: 292,
    },
  },
]

// Product-specific square-foot pricing used in calculations
export const PRODUCT_SQFT_RATE: Record<ProductId, number> = {
  'Slide-and-Stack': 110,
  '': 50,
}

// Slide-and-Stack configurations
export const SLIDE_AND_STACK_CONFIGS: Record<
  number,
  { name: string; label: string }[]
> = {
  2: [
    { name: 'sas_2p_1L_1R', label: '1 Left + 1 Right' },
    { name: 'sas_2p_2L', label: '2 Left' },
    { name: 'sas_2p_2R', label: '2 Right' },
  ],
  3: [
    { name: 'sas_3p_3L', label: '3 Left' },
    { name: 'sas_3p_3R', label: '3 Right' },
  ],
  4: [
    { name: 'sas_4p_4L', label: '4 Left' },
    { name: 'sas_4p_4R', label: '4 Right' },
  ],
  5: [
    { name: 'sas_5p_5L', label: '5 Left' },
    { name: 'sas_5p_5R', label: '5 Right' },
  ],
  6: [
    { name: 'sas_6p_6L', label: '6 Left' },
    { name: 'sas_6p_6R', label: '6 Right' },
  ],
  7: [
    { name: 'sas_7p_7L', label: '7 Left' },
    { name: 'sas_7p_7R', label: '7 Right' },
  ],
  8: [
    { name: 'sas_8p_8L', label: '8 Left' },
    { name: 'sas_8p_8R', label: '8 Right' },
  ],
}

export const TINT_OPTIONS: GlazingOption[] = [
  {
    name: 'Clear Glass',
    description: 'Standard clear insulated glass',
    features: [
      'Maximum light transmission',
      'Standard option',
      'Clear view',
      'Dual-Pane Tempered',
    ],
    price: -50,
    isStandard: false,
    image: '/products/glass/clear-glass.png',
    aiHint: 'clear glass window',
  },
  {
    name: 'Low-E3 Glass',
    description: 'Low-emissivity coating for energy efficiency',
    features: [
      'Improved energy efficiency',
      'UV protection',
      'Reduced fading',
      'Dual-Pane Tempered',
    ],
    price: 0,
    isStandard: true,
    image: '/products/glass/low-e-3.png',
    aiHint: 'low-e glass',
  },
  {
    name: 'Laminated Glass',
    description: 'Safety glass with enhanced security',
    features: [
      'Enhanced security',
      'Sound reduction',
      'Safety protection',
      'Dual-Pane Tempered',
    ],
    price: 75,
    isStandard: false,
    image: '/products/glass/laminated-glass.png',
    aiHint: 'laminated glass',
  },
]

export const HARDWARE_FINISH_OPTIONS: ('Black' | 'White' | 'Silver')[] = [
  'Black',
  'White',
  'Silver',
]

export const INSTALLATION_FEATURES: InstallationFeature[] = [
  {
    title: 'Professional Installation',
    description: 'Certified installers ensure proper fitting and operation',
    icon: Wrench,
  },
  {
    title: 'Complete Service',
    description: 'From delivery to final adjustment, we handle everything',
    icon: PackageCheck,
  },
  {
    title: 'Timely Completion',
    description:
      'Scheduled installation with minimal disruption to your routine',
    icon: Clock,
  },
  {
    title: 'Warranty Protection',
    description: 'Installation warranty protects your investment',
    icon: ShieldCheck,
  },
]

export const INSTALLATION_INCLUSIONS = [
  'Site preparation and protection',
  'Professional installation by certified technicians',
  'Final adjustments and operation testing',
  'Cleanup and debris removal',
  'Operation demonstration and care instructions',
  '2-year installation warranty',
]

export const DELIVERY_OPTIONS: DeliveryOptionInfo[] = [
  {
    name: 'Regular Delivery',
    description:
      'Curbside delivery. You will need people and/or forklift to offload the truck.',
    price: 800,
  },
  {
    name: 'White Glove Delivery',
    description:
      'Professional offloading and inspection of all items at time of offloading.',
    price: 1500,
    features: [
      'Professional offloading service',
      'Complete inspection at delivery',
      'Transport to garage or backyard',
      'Haulaway of old doors/windows',
      'Dump fee included',
    ],
  },
]

export const INSTALL_OPTIONS: ('None' | 'Professional Installation')[] = [
  'None',
  'Professional Installation',
]

export const FINISH_OPTIONS: RalColor[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Bronze (paint)', hex: '#5f4c3a' },
  { name: 'Anodized Aluminum', hex: '#a9a9a9' },
]
// ---- FlowDoors: Lead Intake Select Options ----
export type SelectOption = { label: string; value: string }

export const TIMELINE_OPTIONS: SelectOption[] = [
  { label: 'ASAP (0–30 days)', value: 'asap' },
  { label: '1–3 months', value: '1-3m' },
  { label: '3–6 months', value: '3-6m' },
  { label: '6+ months / Planning', value: '6plus' },
  { label: 'Just researching', value: 'researching' },
]

export const CUSTOMER_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Homeowner', value: 'homeowner' },
  { label: 'Contractor/Builder', value: 'contractor' },
  { label: 'Architect/Designer', value: 'architect' },
  { label: 'Dealer/Reseller', value: 'dealer' },
  { label: 'Other', value: 'other' },
]

export const HEARD_VIA_OPTIONS: SelectOption[] = [
  { label: 'Google/Search', value: 'google' },
  { label: 'Referral', value: 'referral' },
  { label: 'Social Media', value: 'social' },
  { label: 'Event/Showroom', value: 'event' },
  { label: 'Other', value: 'other' },
]
