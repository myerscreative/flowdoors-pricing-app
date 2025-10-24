# 🚀 FlowDoors Forms - Cursor Implementation Guide

## 📁 Your Project Location
```
/Volumes/External Robert/FlowDoorsPricingApp
```

---

## 🎯 Quick Start (5 Steps)

### Step 1: Open Project in Cursor

```bash
# Open Terminal
cd "/Volumes/External Robert/FlowDoorsPricingApp"

# Open in Cursor
cursor .
```

---

### Step 2: Update Tailwind Config

**File:** `tailwind.config.js`

**Action:** Replace or merge with this config:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        flowdoors: {
          // Primary Blue (#00aeef)
          blue: {
            DEFAULT: '#00aeef',
            50: '#e6f7fd',
            100: '#cceff9',
            200: '#99dff4',
            300: '#66cfee',
            400: '#33c0f3',
            500: '#00aeef',
            600: '#0097d1',
            700: '#0080b3',
            800: '#006a95',
            900: '#005377',
          },
          // Accent Green (#8dc63f)
          green: {
            DEFAULT: '#8dc63f',
            50: '#f3f9e9',
            100: '#e7f3d3',
            200: '#cfe7a7',
            300: '#b7db7b',
            400: '#9fd04f',
            500: '#8dc63f',
            600: '#7ab82f',
            700: '#68a125',
            800: '#558a1e',
            900: '#437317',
          },
          // Charcoal (#2e2e2e)
          charcoal: {
            DEFAULT: '#2e2e2e',
            50: '#f5f5f5',
            100: '#e0e0e0',
            200: '#c2c2c2',
            300: '#a3a3a3',
            400: '#858585',
            500: '#666666',
            600: '#4d4d4d',
            700: '#3d3d3d',
            800: '#2e2e2e',
            900: '#1a1a1a',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

---

### Step 3: Install Fonts

```bash
# In your terminal (project root)
pnpm add @fontsource/inter @fontsource/poppins
```

**Then update:** `src/app/layout.tsx`

```typescript
// Add these imports at the top
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

// Update metadata
export const metadata = {
  title: 'FlowDoors - San Diego Custom Door Systems',
  description: 'Premium slide-and-stack door solutions in San Diego, CA',
};
```

---

### Step 4: Create Form Components

#### 4A: Create the Forms Directory

```bash
# In Cursor terminal
mkdir -p src/components/forms
```

#### 4B: Create Homeowner Form

**File:** `src/components/forms/HomeownerConversationalForm.tsx`

**Action:** Copy the entire `HomeownerConversationalForm` component from `FlowDoors_Audience_Optimized_Forms.jsx`

**Quick way in Cursor:**
1. Open `FlowDoors_Audience_Optimized_Forms.jsx` (from your downloads/outputs)
2. Find the `HomeownerConversationalForm` export
3. Copy everything from `export const HomeownerConversationalForm = () => {` to the closing `};`
4. Create new file: `src/components/forms/HomeownerConversationalForm.tsx`
5. Paste the component
6. Add these imports at the top:

```typescript
'use client';

import React, { useState } from 'react';

export function HomeownerConversationalForm() {
  // Component code here...
}
```

#### 4C: Create Contractor Form

**File:** `src/components/forms/ContractorQuickQuote.tsx`

**Action:** Same process as above, but for `ContractorQuickQuote`

```typescript
'use client';

import React from 'react';

export function ContractorQuickQuote() {
  // Component code here...
}
```

---

### Step 5: Create Routes

#### 5A: Homeowner Quote Page

**File:** `src/app/get-quote/page.tsx`

```typescript
import { HomeownerConversationalForm } from '@/components/forms/HomeownerConversationalForm';

export const metadata = {
  title: 'Get Your Free Quote | FlowDoors San Diego',
  description: 'Get a personalized quote for your slide-and-stack door system in under 24 hours',
};

export default function GetQuotePage() {
  return <HomeownerConversationalForm />;
}
```

#### 5B: Contractor Quote Page

**File:** `src/app/contractor-quote/page.tsx`

```typescript
import { ContractorQuickQuote } from '@/components/forms/ContractorQuickQuote';

export const metadata = {
  title: 'Contractor Quick Quote | FlowDoors San Diego',
  description: 'Fast, detailed quotes for trade professionals with same-day response',
};

export default function ContractorQuotePage() {
  return <ContractorQuickQuote />;
}
```

---

## 🔄 Update Your Existing LeadIntakeForm

**Option A: Replace Completely** (Recommended)

**File:** `src/components/LeadIntakeForm.tsx`

```typescript
'use client';

import { HomeownerConversationalForm } from './forms/HomeownerConversationalForm';

export default function LeadIntakeForm() {
  return <HomeownerConversationalForm />;
}
```

**Option B: Smart Routing** (Advanced)

```typescript
'use client';

import { useState } from 'react';
import { HomeownerConversationalForm } from './forms/HomeownerConversationalForm';
import { ContractorQuickQuote } from './forms/ContractorQuickQuote';

type UserType = 'homeowner' | 'contractor' | null;

export default function LeadIntakeForm() {
  const [userType, setUserType] = useState<UserType>(null);

  // If user selects "I'm a Contractor" in homeowner form,
  // redirect to contractor form
  if (userType === 'contractor') {
    return <ContractorQuickQuote />;
  }

  return <HomeownerConversationalForm />;
}
```

---

## 🔗 Update Navigation Links

### Update Header/Navigation

**File:** `src/components/Header.tsx` (or wherever your nav is)

```typescript
// Main CTA button
<Link 
  href="/get-quote"
  className="px-6 py-3 bg-flowdoors-blue hover:bg-flowdoors-blue-600 text-white font-semibold rounded-lg transition-all"
>
  Get Your Free Quote
</Link>
```

### Update Footer

**File:** `src/components/Footer.tsx` (or wherever your footer is)

```typescript
// Add contractor link in footer
<div className="footer-section">
  <h4 className="font-semibold text-flowdoors-charcoal mb-4">For Professionals</h4>
  <Link 
    href="/contractor-quote"
    className="text-slate-600 hover:text-flowdoors-blue transition-colors"
  >
    Trade Professionals Portal
  </Link>
</div>
```

---

## 🎨 Using Cursor AI Features

### 1. Quick Component Generation

In Cursor, you can use **Cmd/Ctrl + K** to ask AI:

```
"Add form validation using React Hook Form and Zod to the HomeownerConversationalForm"

"Make this form mobile responsive with better touch targets"

"Add loading states to the submit button"
```

### 2. Cursor Composer (Cmd/Ctrl + I)

Use Composer for multi-file changes:

```
"Update all forms to use the FlowDoors brand colors from tailwind.config.js"

"Add form submission handling to both HomeownerConversationalForm and ContractorQuickQuote that posts to /api/leads"

"Create an API route at /api/leads that saves form data to Firestore"
```

### 3. Cursor Chat

Ask questions while coding:

```
"How do I add email validation to the email field?"

"What's the best way to handle form errors in React?"

"Show me how to add Google Analytics tracking to form submissions"
```

---

## 🔧 Add Form Validation (Recommended)

### Create Validation Schema

**File:** `src/lib/validation/homeowner-schema.ts`

```typescript
import { z } from 'zod';

export const homeownerFormSchema = z.object({
  // Step 1: Contact Info
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Format: (555) 123-4567'),
  bestTimeToCall: z.enum(['morning', 'afternoon', 'evening', 'anytime']),

  // Step 2: Project Details
  projectType: z.enum(['home-update', 'new-build', 'commercial', 'contractor']),
  location: z.string().min(2, 'Location is required'),
  timeline: z.string(),
  projectDetails: z.string().optional(),
  budget: z.string().optional(),

  // Step 3: Source
  source: z.string().optional(),
});

export type HomeownerFormData = z.infer<typeof homeownerFormSchema>;
```

### Hook It Up with React Hook Form

**In your form component:**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { homeownerFormSchema, type HomeownerFormData } from '@/lib/validation/homeowner-schema';

export function HomeownerConversationalForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HomeownerFormData>({
    resolver: zodResolver(homeownerFormSchema),
  });

  const onSubmit = async (data: HomeownerFormData) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Submission failed');

      // Redirect to thank you page
      window.location.href = '/thank-you';
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Your form fields with {...register('fieldName')} */}
    </form>
  );
}
```

---

## 📡 Create API Endpoint

**File:** `src/app/api/leads/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'leads'), {
      ...data,
      createdAt: serverTimestamp(),
      status: 'new',
      userAgent: request.headers.get('user-agent'),
    });

    // TODO: Send email notification
    // await sendLeadNotificationEmail(data);

    return NextResponse.json(
      { success: true, id: docRef.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Test Your Forms

### 1. Start Dev Server

```bash
pnpm dev
```

### 2. Test Routes

- **Homeowner Form:** http://localhost:3000/get-quote
- **Contractor Form:** http://localhost:3000/contractor-quote

### 3. Test Checklist

- [ ] Fonts loading correctly (Inter & Poppins)
- [ ] FlowDoors colors displaying (#00aeef, #8dc63f, #2e2e2e)
- [ ] All emoji showing (🏡 🏗️ 🏢 🔨)
- [ ] Form fields working
- [ ] Mobile responsive
- [ ] Form validation working
- [ ] Submit button states (loading, disabled)
- [ ] Success/error messages
- [ ] Analytics tracking (if implemented)

---

## 🎨 Cursor Pro Tips

### 1. Use Tab Autocomplete

Start typing and let Cursor suggest:
```typescript
const handle// Tab → Cursor suggests handleSubmit, handleChange, etc.
```

### 2. Multi-Cursor Editing

**Cmd/Ctrl + D** to select next occurrence  
**Cmd/Ctrl + Shift + L** to select all occurrences

### 3. Quick Fix with Cmd+K

Select code with issues → **Cmd/Ctrl + K** → Ask:
```
"Fix TypeScript errors"
"Add proper types to this component"
"Make this mobile responsive"
```

### 4. Refactor with AI

Select a large function → **Cmd/Ctrl + K** → Ask:
```
"Break this into smaller, reusable components"
"Extract form logic into a custom hook"
"Add error handling to this code"
```

### 5. Generate Tests

Select component → **Cmd/Ctrl + K** → Ask:
```
"Generate unit tests for this component using Jest"
"Add integration tests for form submission"
```

---

## 📋 Project Structure

After implementation, your structure should look like:

```
FlowDoorsPricingApp/
├── src/
│   ├── app/
│   │   ├── get-quote/
│   │   │   └── page.tsx           # Homeowner form page
│   │   ├── contractor-quote/
│   │   │   └── page.tsx           # Contractor form page
│   │   ├── api/
│   │   │   └── leads/
│   │   │       └── route.ts       # Form submission endpoint
│   │   └── layout.tsx             # Font imports here
│   │
│   ├── components/
│   │   ├── forms/
│   │   │   ├── HomeownerConversationalForm.tsx  ⭐
│   │   │   └── ContractorQuickQuote.tsx         ⭐
│   │   ├── LeadIntakeForm.tsx     # Updated to use new forms
│   │   ├── Header.tsx             # Updated with nav links
│   │   └── Footer.tsx             # Updated with contractor link
│   │
│   └── lib/
│       ├── validation/
│       │   ├── homeowner-schema.ts
│       │   └── contractor-schema.ts
│       └── firebase.ts
│
├── tailwind.config.js             # Updated with FlowDoors colors
└── package.json
```

---

## 🚀 Deployment Checklist

Before deploying to production:

### 1. Update Company Info

Search and replace placeholders:
```typescript
// Find all instances of:
'(619) 555-0123'  // Replace with real phone
'info@flowdoors.com'  // Replace with real email
'1234 Innovation Way, San Diego, CA 92101'  // Replace with real address
```

### 2. Test on Mobile

- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Tablet (iPad)

### 3. Check Analytics

```typescript
// Add to form submission
gtag('event', 'form_submit', {
  form_type: 'homeowner',
  form_location: 'get-quote',
});
```

### 4. Test Form Submission

- [ ] Data saves to Firestore
- [ ] Email notifications work
- [ ] Thank you page redirects
- [ ] Error handling works

### 5. Performance Check

```bash
pnpm build
pnpm start

# Check lighthouse score at:
# http://localhost:3000/get-quote
```

---

## 🐛 Common Issues & Fixes

### Issue: Fonts not loading

**Fix:**
```bash
# Reinstall fonts
pnpm remove @fontsource/inter @fontsource/poppins
pnpm add @fontsource/inter @fontsource/poppins

# Clear .next cache
rm -rf .next
pnpm dev
```

### Issue: Tailwind colors not working

**Fix:**
```bash
# Rebuild Tailwind
rm -rf .next
pnpm dev --force
```

### Issue: TypeScript errors on form components

**Fix:**
```typescript
// Add 'use client' at top of file
'use client';

// Make sure React is imported
import React from 'react';
```

### Issue: Forms not submitting

**Fix:**
1. Check `/api/leads/route.ts` exists
2. Verify Firebase is initialized
3. Check browser console for errors
4. Test endpoint directly with Postman

---

## 📚 Next Steps After Implementation

### Week 1: Deploy & Monitor
1. Deploy to Vercel
2. Set up analytics tracking
3. Monitor form submissions
4. Check error logs

### Week 2: A/B Test
1. Run homeowner form vs old form (50/50 split)
2. Measure conversion rates
3. Gather user feedback

### Week 3: Optimize
1. Deploy winner to 100% traffic
2. Add contractor form
3. Update navigation
4. Monitor metrics

### Week 4: Iterate
1. Review analytics data
2. Make minor improvements
3. Add features based on feedback

---

## 💡 Cursor AI Prompts for Enhancement

### Form Improvements

```
"Add a progress indicator to the homeowner form showing step 1/3, 2/3, 3/3"

"Create a custom phone input mask for the phone field that auto-formats"

"Add image upload capability so users can attach photos of their space"

"Create an auto-save feature that saves form data to localStorage"
```

### Validation & UX

```
"Add real-time validation that shows errors as users type"

"Create helpful tooltips that appear when users focus on each field"

"Add a confirmation dialog before form submission"

"Show estimated quote range based on project selections"
```

### Analytics & Tracking

```
"Add Google Analytics events for each form step completion"

"Track which project type is selected most often"

"Add hotjar tracking to see where users drop off"

"Create a dashboard showing form completion rates"
```

---

## 🎉 You're Ready to Go!

Your implementation path:

1. ✅ Open project in Cursor
2. ✅ Update Tailwind config
3. ✅ Install fonts
4. ✅ Create form components
5. ✅ Create routes
6. ✅ Test locally
7. ✅ Deploy to staging
8. ✅ Test thoroughly
9. ✅ Deploy to production
10. ✅ Monitor & optimize

**Estimated time:** 3-4 hours for complete implementation

**Expected result:** 2x conversion rate and happier users! 🚀

---

## 📞 Need Help?

If you run into issues in Cursor:

1. Use **Cmd/Ctrl + K** on the problematic code
2. Ask: "What's wrong with this code and how do I fix it?"
3. Check the Cursor docs: https://cursor.sh/docs
4. Review the files in your outputs folder for reference

---

*FlowDoors • San Diego, CA*  
*Ready to transform your conversions!* 🎉
