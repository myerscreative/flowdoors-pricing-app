# VibePoint Page Navigation Graph

This document shows all the page-to-page links in the VibePoint application.

## Graph Visualization

See `page-graph.html` for an interactive visual graph.

## Page Links Summary

### Landing & Entry Points
- **/** (Landing Page)
  - → `/home` (Sign In)
  - → `/auth/signup` (Start Free Trial)

### Authentication Flow
- **/auth/login**
  - → `/home` (after successful login)
  - → `/auth/signup` (Don't have account link)
  
- **/auth/signup**
  - → `/onboarding` (after successful signup)
  - → `/auth/login` (Already have account link)

- **/onboarding**
  - → `/home` (Get Started / Skip)

### Main Application Hub
- **/home** (Main Dashboard)
  - → `/mood/new` (Log Your Mood button)
  - → `/history` (View History button)
  - → `/recipes` (My Recipes button - Pro feature)
  - → `/learn` (How It Works button)
  - → `/patterns` (Patterns button)
  - → `/entries` (Export button)
  - → `/auth/login` (Logout)
  - → `/auth/signup` (Sign up link when not authenticated)

### Mood Tracking Flow
- **/mood**
  - → `/mood/questions` (Continue button)

- **/mood/new**
  - → `/home` (Back button)

- **/mood/questions**
  - → `/success` (Save Entry)
  - → `/mood` (if no coordinates)
  - → `/auth/login` (if not authenticated)

- **/success**
  - → `/home` (Return to Home link)
  - → `/mood` (Log Another Mood link)
  - → `/home` (Auto-redirect after 3 seconds)

### History & Patterns
- **/history**
  - → `/home` (Back button)
  - → `/mood/new` (Log Your First Mood button)
  - → `/auth/login` (if not authenticated)

- **/patterns**
  - → `/home` (Back to Home link)
  - → `/mood` (Log Another Mood button)
  - → `/auth/login` (if not authenticated)

- **/entries**
  - (No explicit links found, but likely links back to home)

### Recipes Flow
- **/recipes**
  - → `/patterns` (New Recipe / Back button)
  - → `/recipe-player?id={id}` (Play Recipe link)

- **/recipe-player**
  - → `/mood/log` (Log New Mood after completion)
  - → `/recipes` (Back to Recipes link)
  - → `/recipe-player` (Run Recipe Again)

### Learning & Tutorial
- **/learn**
  - → `/deep-dive` (Automatic redirect)

- **/deep-dive**
  - → `/home` (Back to Dashboard)
  - → `/mood/new` (Log Your First Mood button)

- **/tutorial**
  - → `/mood/new` (Start Tracking Now button)

### Error Pages
- **/not-found**
  - → `/` (Go Home button)

## Component Links

### Logo Component
- Links to `/` or `/home` depending on `href` prop

### Dashboard Components
- **InsightCard** → `/learn#ingredients`
- **UnlockMessage** → `/learn`
- **MoodSnapshot** → `/history`
- **HeroSection** → `/mood`, `/recipes`, `/history`

## Navigation Patterns

### Primary User Flows

1. **New User Flow:**
   ```
   Landing → Signup → Onboarding → Home → Mood/New
   ```

2. **Returning User Flow:**
   ```
   Landing → Login → Home → Mood/New
   ```

3. **Mood Tracking Flow:**
   ```
   Home → Mood/New → (Save) → Success → Home
   ```
   OR
   ```
   Home → Mood → Mood/Questions → Success → Home
   ```

4. **Pattern Discovery Flow:**
   ```
   Home → Patterns (requires 10+ entries)
   ```

5. **Recipe Flow:**
   ```
   Home → Recipes → Recipe/Player → Mood/Log
   ```

### Authentication Guards

Several pages redirect to `/auth/login` if user is not authenticated:
- `/home` (shows login form)
- `/history`
- `/patterns`
- `/mood/questions`

## Statistics

- **Total Pages:** 18
- **Total Links:** 35+
- **Hub Page:** `/home` (connects to 8+ pages)
- **Entry Points:** `/`, `/auth/login`, `/auth/signup`
- **Most Connected:** `/home` (8+ outgoing links)

