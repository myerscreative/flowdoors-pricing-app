import { z } from 'zod'

export const contractorFormSchema = z.object({
  // Contact Information
  name: z.string().min(2, 'Name is required'),
  companyName: z.string().min(2, 'Company name is required'),
  email: z.string().email('Valid email is required'),
  phone: z
    .string()
    .min(10, 'Phone number is required')
    .regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Format: (555) 123-4567'),

  // Project Details
  projectType: z.enum(['residential', 'commercial', 'multi-unit', 'custom'], {
    required_error: 'Please select a project type',
  }),
  location: z.string().min(2, 'Location is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'Please enter a valid 5-digit ZIP code'),
  
  // Door Specifications
  doorCount: z.string().min(1, 'Number of doors is required'),
  doorWidth: z.string().optional(),
  doorHeight: z.string().optional(),
  
  // Additional Details
  timeline: z.string().min(1, 'Timeline is required'),
  budget: z.string().optional(),
  notes: z.string().optional(),
  
  // Trade Professional Details
  licenseNumber: z.string().optional(),
  tradeType: z.string().optional(),
})

export type ContractorFormData = z.infer<typeof contractorFormSchema>

