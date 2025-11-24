# Assets Directory

This directory should contain the following image assets:

## Required Assets

1. **icon.png** (1024x1024)
   - App icon for iOS and Android
   - Should be square with rounded corners (iOS will apply mask)

2. **splash.png** (1284x2778 for iPhone)
   - Splash screen shown on app launch
   - Can be a simple gradient or logo

3. **adaptive-icon.png** (1024x1024)
   - Android adaptive icon foreground
   - Should be centered with padding (safe area)

4. **favicon.png** (48x48)
   - Web favicon (if deploying to web)

## Creating Placeholder Assets

You can create simple placeholder images using any image editor, or use online tools:

- **For icon.png**: Create a 1024x1024 image with a gradient background matching the app's color scheme
- **For splash.png**: Use the same gradient or a simple "Vibepoint" text
- **For adaptive-icon.png**: Same as icon.png

## Quick Placeholder Script

If you have ImageMagick installed:

```bash
# Create icon
convert -size 1024x1024 gradient:'#B4DCFF-#FF1832' -pointsize 200 -fill white -gravity center -annotate +0+0 "V" icon.png

# Create splash (use your preferred dimensions)
convert -size 1284x2778 gradient:'#B4DCFF-#FF1832' splash.png
```

Or use any design tool (Figma, Sketch, etc.) to create these assets.



