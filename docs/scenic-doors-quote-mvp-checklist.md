# Scenic Doors — Quote MVP Test Plan & Checklist

> Single source of truth for launch readiness. Update in PRs. One atomic change per step.

## 0) Ground Rules (from Pair-Programming Protocol)

- One action per step, prove it works, then proceed.
- No unrelated edits. Lint + typecheck must pass unless explicitly deferred.
- Commit message template: `feat(step-X): <short> // files: <list>`

## 1) Scope & Flow (What must work end-to-end)

1. **Lead Capture**: `/quote/start` collects Name, Email, Phone, ZIP, Role, Timeline, Referral.
2. **Configurator**: choose product (e.g., Multi-Slide), dimensions, panels, finishes, glass, hardware.
3. **Summary**: review line items, taxes (ZIP-based), totals.
4. **PDF & Email**: generate a PDF for the first door immediately; send to customer; store a record.
5. **Persistence**: quote saved to DB with status, totals, customer, items.
6. **Assignment**: manager can assign quote to a salesperson.
7. **Admin**: managers see all quotes; salespeople see only their own; add notes/tasks/follow-up date.
8. **Reminders**: if user quits mid-flow or has multiple items, send reminder digest later (deferred if needed).

## 2) Data Contract (minimal)

```ts
type QuoteStatus = 'draft' | 'sent' | 'followup' | 'won' | 'lost'

type QuoteItem = {
  id: string
  productType: 'multi-slide' | 'pocket' | 'slide-and-stack' | 'window'
  configCode: string // e.g., "ms_3p_xoo"
  widthIn: number
  heightIn: number
  panels?: number
  finishes?: { frame: string; hardware: string }
  glass?: { type: string; paneConfig?: 'dual' | 'triple' }
  unitPrice: number
  qty: number
  lineTotal: number
}

type Quote = {
  id: string
  createdAt: string
  updatedAt: string
  customer: {
    first: string
    last: string
    email: string
    phone?: string
    zip?: string
  }
  items: QuoteItem[]
  subtotal: number
  tax: number
  total: number
  status: QuoteStatus
  assignedTo?: { uid: string; name: string } | null
  followUpDate?: string | null
  notes?: { id: string; content: string; createdAt: string; author?: string }[]
}
```
