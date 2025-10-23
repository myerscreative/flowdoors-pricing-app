// src/types/quote.ts

// Canonical activity types used across Quotes UI
export type QuoteNote = {
  id: string
  content: string
  /** ISO timestamp string */
  timestamp: string
  author?: string
}

export type QuoteTask = {
  id: string
  content: string
  /** Date or ISO string */
  dueDate: string | Date
  completed: boolean
}

// Backward-compat aliases (some modules import Note/Task)
export type Note = QuoteNote
export type Task = QuoteTask

export interface Quote {
  id: string
  /** May be a string like "Q-1234" or a number from legacy data */
  quoteNumber?: string | number
  /** Heat/status pill (Hot/Warm/Cold/Hold/etc.) */
  status: string
  /** Pipeline column (Kanban grouping) */
  pipelineStage?: string
  /** Optional labels used for filtering/grouping */
  tags?: string[]
  /** Timestamp map of when quote entered each status */
  stageDates?: Record<string, string | Date>
  /** Last updated */
  updatedAt?: string | Date

  /** Creation time from various sources */
  createdAt?: string | Date

  // Customer & ownership
  firstName?: string
  lastName?: string
  salesRep?: string

  // Follow-up workflow
  followUpDate?: string | Date | null
  lastContact?: string | Date

  // Contact/company (optional)
  company?: string
  phone?: string
  zip?: string

  // Financials (optional — some sources don’t provide it)
  quoteAmount?: number

  // Derived counts
  numberOfItems?: number

  // Activity (legacy in-memory or from Firestore)
  notes?: QuoteNote[]
  tasks?: QuoteTask[]

  /** Referral code entered by customer (as typed) */
  referralCodeCustomer?: string

  /** Referral code associated with salesperson (canonical when available) */
  referralCodeSalesperson?: string
}
