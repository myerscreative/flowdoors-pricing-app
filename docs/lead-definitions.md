# Lead Definitions and Data Quality

## Lead Classifications

### Quote

A **Quote** is when a customer:

1. ✅ Enters their contact information (name, email, phone)
2. ✅ Configures a door (selects products, options, etc.)

### Lead

A **Lead** is when a customer:

1. ✅ Enters their contact information (name, email, phone)
2. ❌ Has NOT configured a door yet

### Invalid Entry

An **Invalid Entry** is when a visitor:

1. ❌ Just visits the "Get a Quote" page
2. ❌ Does not provide any contact information

These should be **deleted** as they are not actionable leads.

## Data Quality Rules

### Required Fields for Valid Leads

A lead must have **at least one** of:

- **Name** (non-empty, minimum 2 characters)
- **Email** (valid email format)
- **Phone** (valid phone format)

### Validation Logic

- API endpoints validate contact information before creating leads
- Invalid entries are rejected with 400 status
- Only complete contact information creates actionable leads

## Cleanup Process

### Automated Cleanup Script

```bash
node scripts/cleanupInvalidLeads.mjs
```

This script:

- ✅ Identifies leads without contact information
- ✅ Deletes invalid entries in batch
- ✅ Preserves valid leads with contact info
- ✅ Reports cleanup statistics

### Manual Verification

Check leads data:

```bash
curl 'http://localhost:3000/api/leads?withoutQuotes=true'
```

## Admin Panel Display

The admin panel now shows:

- **Total Leads**: Valid leads with contact information
- **Without Quotes**: Leads that haven't configured doors yet
- **With Quotes**: Leads that have completed door configuration
- **New This Week**: Recently created valid leads

## Prevention

To prevent future invalid leads:

1. ✅ API validation is in place for both POST and PUT endpoints
2. ✅ Frontend forms validate required fields
3. ✅ Regular cleanup script can be run as needed

## Last Cleanup Results

- **Before**: 185 entries (184 invalid, 1 valid)
- **After**: 1 valid lead with complete contact information
- **Deleted**: 184 invalid page visits without contact info
