# Summary Page Modularization Plan

Goal: Reduce `src/app/summary/page.tsx` size/complexity without changing behavior.
Approach: Incremental, one file per step (full-file replacements only), with ESLint+typecheck green at each step.

## Target Structure (proposed)

- `src/app/summary/page.tsx`
  - Thin page that composes extracted components + hooks
- `src/app/summary/components/SummaryItemsTable.tsx`
  - Desktop/table markup for items list (pure presentational)
- `src/app/summary/components/SummaryItemsMobileCard.tsx`
  - Mobile cards markup for items list (pure presentational)
- `src/app/summary/components/ServicesCard.tsx`
  - “Professional Services” toggle card
- `src/app/summary/components/DeliveryOptions.tsx`
  - Delivery radio set
- `src/app/summary/components/QuoteTotalsSidebar.tsx`
  - Totals sidebar (receives computed numbers via props)
- `src/app/summary/components/Dialogs/EmailConfirmDialog.tsx`
  - Confirm-and-send email dialog (dumb UI + callbacks)
- `src/app/summary/components/Dialogs/StartNewQuoteConfirmDialog.tsx`
  - Unsaved-quote confirmation dialog
- `src/app/summary/components/Dialogs/CustomerInfoDialog.tsx`
  - Customer info form dialog
- `src/app/summary/hooks/useSummaryActions.ts`
  - All event handlers: save, duplicate, delete, edit navigation, toggles
- `src/app/summary/hooks/useAutosave.ts`
  - The auto-save debounce effect (quote create + update)
- `src/app/summary/lib/price.ts`
  - `estimateItemPrice` and sizing helpers (pure functions)
- `src/app/summary/lib/format.ts`
  - `toTitle`, `indexToLetters`, and other string/format helpers
- `src/app/summary/types.ts`
  - Lightweight `QuoteItemLite` and local types used by summary UI

## Migration Order (each is one PR/commit step)

1. **Extract helpers** → `lib/format.ts` + `lib/price.ts`
2. **Extract hooks** → `hooks/useAutosave.ts` (auto-save) and `hooks/useSummaryActions.ts`
3. **Extract UI: Desktop table** → `components/SummaryItemsTable.tsx`
4. **Extract UI: Mobile cards** → `components/SummaryItemsMobileCard.tsx`
5. **Extract UI: Services/Delivery** → `components/ServicesCard.tsx`, `components/DeliveryOptions.tsx`
6. **Extract UI: Totals sidebar** → `components/QuoteTotalsSidebar.tsx`
7. **Extract Dialogs** → three dialog components under `components/Dialogs/`
8. **Final tidy** → keep `page.tsx` < ~250 lines, only wiring + layout

## Guardrails

- No behavioral changes; only moving code.
- Each step: full-file replacements only for the files listed in that step.
- After each step:
  - `pnpm exec eslint <touched files>`
  - `pnpm typecheck`
  - App still builds/starts.

## Props & Data Flow

- `page.tsx` computes **minimal** state/derived values, then passes:
  - Items + UI flags → Items components
  - Totals numbers → Totals sidebar
  - Callbacks (from hooks) → UI pieces
- Components remain **presentational** (no data fetching, no context reads).

## Risks & Mitigations

- **Type drift**: keep `types.ts` local and import from a single place.
- **Event handler coupling**: centralize in `useSummaryActions`.
- **Auto-save side effects**: isolate in `useAutosave` with same deps.
