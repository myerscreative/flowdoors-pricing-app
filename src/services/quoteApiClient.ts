/**
 * API Client for Quote Operations
 * This wraps quote operations to use secure API routes
 */

export type QuoteData = Record<string, any>

/**
 * Save a new quote via API
 */
export async function saveQuoteViaApi(data: QuoteData): Promise<{ id: string }> {
  const response = await fetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save quote')
  }

  const result = await response.json()
  
  // Return just the id to match the expected format
  return { id: result.id }
}

/**
 * Update an existing quote via API
 */
export async function updateQuoteViaApi(
  quoteId: string,
  updates: Partial<QuoteData>
): Promise<void> {
  const response = await fetch(`/api/quotes?id=${quoteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update quote')
  }
}

/**
 * Fetch all quotes via API
 */
export async function fetchQuotesViaApi(): Promise<QuoteData[]> {
  const response = await fetch('/api/quotes')
  
  if (!response.ok) {
    throw new Error('Failed to fetch quotes')
  }

  const { quotes } = await response.json()
  return quotes
}

/**
 * Add a note to a quote via API
 */
export async function addNoteToQuoteViaApi(quoteId: string, note: any): Promise<void> {
  const response = await fetch(`/api/quotes/${quoteId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to add note')
  }
}