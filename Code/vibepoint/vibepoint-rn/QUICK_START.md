# Quick Start Guide

## Installation & Setup

1. **Install dependencies:**
   ```bash
   cd vibepoint-rn
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - **iOS**: Press `i` in the terminal (requires Xcode and iOS Simulator)
   - **Android**: Press `a` in the terminal (requires Android Studio and emulator)
   - **Physical Device**: Install Expo Go app and scan the QR code

## First Run

1. The app will load and show the gradient interface
2. Tap anywhere on the gradient to place a pin
3. Complete the 4-question flow
4. Your first entry will be saved!

## Features to Try

- **Main Screen**: Tap the gradient to log your mood
- **Nudge Buttons**: Use arrow buttons to fine-tune pin position
- **History**: View all your entries as pins on the gradient
- **Insights**: Unlock after 10 entries to see patterns
- **Settings**: Toggle labels, dark mode, crosshair

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### iOS Simulator not opening
- Make sure Xcode is installed
- Run `xcode-select --install` if needed

### Android Emulator not opening
- Make sure Android Studio is installed
- Start an emulator from Android Studio first

### Type errors
```bash
npm install --save-dev @types/react @types/react-native
```

## Project Structure

- `app/` - All screens (Expo Router)
- `components/` - Reusable UI components
- `store/` - Zustand state management
- `lib/` - Utility functions
- `types/` - TypeScript type definitions

## Next Steps

- Customize the gradient colors in `components/GradientBackground.tsx`
- Add more insights in `app/insights.tsx`
- Enhance the pattern analysis in `lib/utils.ts`

## Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

Note: You'll need to set up an Expo account and configure EAS (Expo Application Services) for production builds.



