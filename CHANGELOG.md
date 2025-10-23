# ScenicPricingApp – Changelog

All notable stable checkpoints will be documented in this file.  
Tags follow the convention: `checkpoint/<feature>-stable`.

---

## [checkpoint/lead-intake-stable] – 2025-09-05

**Stable checkpoint – lead intake + postLead tracking working**

- ✅ Lead intake form (`LeadIntakeForm`) implemented with validation via Zod + React Hook Form.
- ✅ Integrated attribution SDK for UTM/gclid/fbclid tracking.
- ✅ `postLead` function working with proper payload structure (name, email, phone, attribution).
- ✅ Lint and typecheck passing cleanly.
- ✅ Deployed safe rollback point for lead intake flow.

---

## [checkpoint/pdf-preview-stable] – (TBD)

**Stable checkpoint – PDF preview/export pipeline working**

- 📌 Placeholder for upcoming PDF preview/export milestone.
- Will include working `/pdf-preview` page rendering with Firestore data fallback.
- Lint + typecheck passing required before tagging.
- Ensure export to PDF is visually consistent and error-free.

---
