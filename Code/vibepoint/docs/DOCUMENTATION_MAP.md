# Vibepoint Documentation Map

## 📚 Document Hierarchy & Purpose

This guide clarifies which document to use for what purpose and which is the source of truth for implementation.

---

## 🎯 Source of Truth

### **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** 
**Status:** ✅ **PRIMARY IMPLEMENTATION REFERENCE**

**Use this for:**
- All technical implementation decisions
- Database schema (current/final)
- Feature specifications (Free vs Premium)
- Entry throttling logic
- Recipe system implementation
- UI/UX flows
- Testing checklist

**This document contains:**
- ✅ Latest design decisions (7 entry threshold, entry throttling, premium features)
- ✅ Complete database schema with all tables
- ✅ Recipe system specification
- ✅ Entry throttling (30-min buffer, 3 overrides/day)
- ✅ Canvas gradient implementation details
- ✅ Premium feature breakdown

**Last Updated:** November 2024

---

## 📖 Supporting Documentation

### 1. [README.md](../README.md)
**Status:** Project Overview

**Purpose:**
- High-level project description
- Core concept explanation
- Design philosophy
- Link to detailed docs

**Use this for:**
- Understanding the "why" behind Vibepoint
- Explaining the app to others
- Project vision and goals

---

### 2. [PROJECT_INSTRUCTIONS.md](../PROJECT_INSTRUCTIONS.md)
**Status:** ⚠️ Original Specification (Partially Outdated)

**Purpose:**
- Original project vision and requirements
- Detailed feature descriptions
- User flow documentation
- Development phases

**⚠️ Known Outdated Information:**
- Pattern threshold: States "10+ entries" and "20+ entries" (now 7/15/30)
- Missing: Entry throttling system
- Missing: Premium features (recipes, "Up Your Vibe")
- Missing: Rapid shift tracking fields
- Database schema: Incomplete (missing premium tables)

**Still Useful For:**
- Understanding original vision
- Feature requirements (core concepts)
- User experience goals
- Design principles

**Action Item:** Update specific numbers to match implementation guide, or add note referring to IMPLEMENTATION_GUIDE.md

---

### 3. [QUICK_START.md](../QUICK_START.md)
**Status:** ✅ Up to Date - Developer Setup Guide

**Purpose:**
- Getting started with development
- Installation instructions
- Basic project structure
- Initial setup steps

**Use this for:**
- First-time project setup
- Installing dependencies
- Configuring Supabase
- Creating initial database

**Aligned with:** IMPLEMENTATION_GUIDE.md

---

## 🔄 When Documents Conflict

**Resolution Order (highest priority first):**

1. **IMPLEMENTATION_GUIDE.md** ← Use this
2. QUICK_START.md
3. PROJECT_INSTRUCTIONS.md (for conceptual understanding only)
4. README.md (for high-level overview only)

**Example:**
- If IMPLEMENTATION_GUIDE.md says "7 entries" and PROJECT_INSTRUCTIONS.md says "10+ entries"
- **Use 7 entries** (from IMPLEMENTATION_GUIDE.md)

---

## 📋 Quick Reference: Where to Find What

| Topic | Primary Document | Secondary Reference |
|-------|-----------------|---------------------|
| **Database Schema** | IMPLEMENTATION_GUIDE.md | QUICK_START.md |
| **Pattern Thresholds** | IMPLEMENTATION_GUIDE.md (7/15/30) | ~~PROJECT_INSTRUCTIONS.md~~ |
| **Entry Throttling** | IMPLEMENTATION_GUIDE.md | None |
| **Premium Features** | IMPLEMENTATION_GUIDE.md | None |
| **Recipe System** | IMPLEMENTATION_GUIDE.md | None |
| **Canvas Gradient** | IMPLEMENTATION_GUIDE.md | PROJECT_INSTRUCTIONS.md |
| **User Flow** | IMPLEMENTATION_GUIDE.md | PROJECT_INSTRUCTIONS.md |
| **Design Philosophy** | README.md | PROJECT_INSTRUCTIONS.md |
| **Setup Instructions** | QUICK_START.md | IMPLEMENTATION_GUIDE.md |

---

## 🎯 Specific Conflict Resolutions

### Conflict 1: Pattern Insights Threshold
**Use:** 7 entries (from IMPLEMENTATION_GUIDE.md)
- 5 entries: Show mood map
- 7 entries: Early patterns
- 15 entries: Pattern correlations
- 30+ entries: Deep insights

**Ignore:** "10+ entries" and "20+ entries" from PROJECT_INSTRUCTIONS.md

---

### Conflict 2: Database Schema
**Use:** Complete schema from IMPLEMENTATION_GUIDE.md including:
- `is_rapid_shift`, `rapid_shift_context`, `minutes_since_last_entry` fields
- `recipes` table (Premium)
- `recipe_attempts` table (Premium)
- `user_subscription` table

**Ignore:** Incomplete schema in PROJECT_INSTRUCTIONS.md

---

### Conflict 3: Entry Throttling
**Use:** 30-minute buffer with 3 overrides/day (from IMPLEMENTATION_GUIDE.md)

**Ignore:** PROJECT_INSTRUCTIONS.md doesn't mention this (it was added during design refinement)

---

### Conflict 4: Free vs Premium Features
**Use:** Feature breakdown from IMPLEMENTATION_GUIDE.md
- Free: Basic patterns, mood tracking, 90-day history
- Premium: Recipes, "Up Your Vibe", adaptive learning, unlimited history

**Ignore:** PROJECT_INSTRUCTIONS.md doesn't distinguish tiers (this was added during monetization planning)

---

## 🔧 Recommended Updates

### High Priority
1. ✅ Add note to README.md pointing to IMPLEMENTATION_GUIDE.md
2. ⏳ Update PROJECT_INSTRUCTIONS.md with note about implementation guide
3. ⏳ Update pattern thresholds in PROJECT_INSTRUCTIONS.md (7/15/30)

### Medium Priority
4. ⏳ Add Premium features section to PROJECT_INSTRUCTIONS.md
5. ⏳ Add entry throttling section to PROJECT_INSTRUCTIONS.md

### Low Priority
6. Consider consolidating PROJECT_INSTRUCTIONS.md into IMPLEMENTATION_GUIDE.md
7. Archive outdated sections

---

## 📝 Document Maintenance Guidelines

### When to Update Which Document

**IMPLEMENTATION_GUIDE.md:**
- ✅ Update whenever technical specifications change
- ✅ Update when adding new features
- ✅ Update database schema changes
- ✅ Update algorithms or implementation details

**PROJECT_INSTRUCTIONS.md:**
- Update conceptual descriptions if vision changes
- Update user experience goals
- Keep in sync with major feature additions (Premium, etc.)
- Can lag behind implementation details

**QUICK_START.md:**
- Update when setup process changes
- Update when dependencies change
- Keep aligned with IMPLEMENTATION_GUIDE.md schema

**README.md:**
- Update when project description changes
- Update when adding major features
- Keep high-level, avoid technical details

---

## 🎓 For New Developers

**Start here in this order:**

1. **README.md** - Understand what Vibepoint is
2. **QUICK_START.md** - Set up your development environment
3. **IMPLEMENTATION_GUIDE.md** - Learn how to build features
4. **PROJECT_INSTRUCTIONS.md** - Understand the original vision (optional)

**When building features:**
- Always reference **IMPLEMENTATION_GUIDE.md** first
- Use PROJECT_INSTRUCTIONS.md for conceptual understanding only
- If documents conflict, trust IMPLEMENTATION_GUIDE.md

---

## ✅ Document Status Summary

| Document | Status | Completeness | Last Updated |
|----------|--------|--------------|--------------|
| IMPLEMENTATION_GUIDE.md | ✅ Current | 100% | Nov 2024 |
| QUICK_START.md | ✅ Current | 100% | Nov 2024 |
| README.md | ✅ Current | 100% | Nov 2024 |
| PROJECT_INSTRUCTIONS.md | ⚠️ Partially Outdated | ~70% | Original spec |

---

**Questions?** When in doubt, use **IMPLEMENTATION_GUIDE.md** as your source of truth.

**Last Updated:** November 2024

