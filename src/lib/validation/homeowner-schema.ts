import { z } from 'zod'

export const homeownerFormSchema = z.object({
  // Step 1: Contact Info
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z
    .string()
    .min(10, 'Phone number is required')
    .regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Format: (555) 123-4567'),
  bestTimeToCall: z.enum(['morning', 'afternoon', 'evening', 'anytime'], {
    required_error: 'Please select a time',
  }),

  // Step 2: Project Details
  projectType: z.enum(['home-update', 'new-build', 'commercial', 'contractor'], {
    required_error: 'Please select a project type',
  }),
  location: z.string().min(2, 'Location is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'Please enter a valid 5-digit ZIP code'),
  timeline: z.string().min(1, 'Timeline is required'),
  projectDetails: z.string().optional(),
  budget: z.string().optional(),

  // Step 3: Source
  source: z.string().optional(),
  referralCode: z.string().optional(),
})

export type HomeownerFormData = z.infer<typeof homeownerFormSchema>

