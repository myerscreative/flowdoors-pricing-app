# App Icons for Vibepoint

This document describes the app icons needed for Vibepoint's PWA functionality.

## Required Icons

The following icon files are referenced in the codebase and need to be created:

### 1. `/public/icon-192.png` (192x192 pixels)
- **Purpose**: Standard PWA icon, notification badge
- **Referenced in**: `public/manifest.json`
- **Format**: PNG
- **Dimensions**: 192x192 pixels
- **Requirements**:
  - Should have transparent or white background
  - Simple, recognizable design that works at small sizes
  - Should represent mood/emotion tracking concept

### 2. `/public/icon-512.png` (512x512 pixels)
- **Purpose**: High-resolution PWA icon for install prompts and splash screens
- **Referenced in**: `public/manifest.json`
- **Format**: PNG
- **Dimensions**: 512x512 pixels
- **Requirements**:
  - Should match 192px version but higher quality
  - Same design concept and color scheme
  - Used when user adds app to home screen

## Design Suggestions

### Brand Colors
- Primary Blue: `#2563EB` (from viewport themeColor)
- Gradient: Blue to Purple (matching app design)

### Icon Concepts
1. **Simple Emoji-Based**: Large 😊 or 🌟 emoji on solid background
2. **Abstract**: Wavy line representing mood graph/spectrum
3. **Geometric**: Circle or square with gradient representing mood map
4. **Minimalist**: Single letter "V" in brand style

### Quick Placeholder Approach

For a quick prototype placeholder, you can:
1. Create a 512x512 canvas with blue gradient background
2. Add white text "VP" or emoji in center
3. Export as PNG
4. Resize to 192x192 for smaller version


