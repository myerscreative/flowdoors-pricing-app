# Vibepoint - Mood Tracking App

A beautiful React Native mood-tracking app built with Expo, featuring an interactive 4-quadrant happiness/motivation gradient interface.

## Features

- 🎨 **Interactive Gradient Interface** - Tap anywhere on the gradient to log your mood
- 📝 **4-Question Quick Log** - Fast, reflective mood logging
- 📊 **History Visualization** - See all your mood entries as pins on the gradient
- 🔍 **Pattern Insights** - Unlock insights after 10 entries to discover your mood patterns
- 🔥 **Streak Tracking** - Track your daily logging streak
- ⚙️ **Customizable Settings** - Toggle between clinical and meme labels, dark mode, crosshair
- 📱 **Native Feel** - Haptic feedback, smooth animations, beautiful UI

## Tech Stack

- **React Native** with **Expo** (~51.0.0)
- **TypeScript**
- **Expo Router** for navigation
- **Zustand** for state management
- **AsyncStorage** for local data persistence
- **expo-linear-gradient** for the gradient interface
- **react-native-reanimated** for smooth animations
- **expo-haptics** for tactile feedback

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator, or Expo Go app on your phone

### Installation

1. Navigate to the project directory:
```bash
cd vibepoint-rn
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npm start
```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
vibepoint-rn/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Main gradient screen
│   ├── history.tsx         # History view
│   ├── insights.tsx        # Insights & patterns
│   └── settings.tsx        # Settings screen
├── components/             # Reusable components
│   ├── GradientBackground.tsx
│   ├── Pin.tsx
│   ├── CornerLabels.tsx
│   ├── Crosshair.tsx
│   └── LogModal.tsx
├── store/                  # Zustand store
│   └── useMoodStore.ts
├── lib/                    # Utilities
│   └── utils.ts
└── types/                  # TypeScript types
    └── index.ts
```

## Core Features Explained

### Gradient Interface

The main screen features a 4-corner gradient:
- **Top-left**: Happy • Unmotivated (pale cyan)
- **Top-right**: Happy • Motivated (bright yellow)
- **Bottom-right**: Unhappy • Motivated (deep red)
- **Bottom-left**: Unhappy • Unmotivated (dark purple/black)

### Mood Logging Flow

1. Tap on the gradient to place a pin
2. Nudge the pin with arrow buttons if needed
3. Complete 4 quick questions:
   - What just happened?
   - What am I focusing on right now?
   - What am I saying to myself?
   - Physical sensations in my body?
4. Optionally add a title
5. Save with automatic timestamp

### Insights

After 10 entries, unlock insights including:
- Time-based patterns (best hours/days)
- Focus pattern correlations
- Physical sensation patterns
- Quadrant distribution

### Data Storage

All data is stored locally using AsyncStorage. No cloud sync or external services required.

## Customization

### Settings

- **Corner Labels**: Toggle between clinical labels ("Happy • Motivated") and meme labels ("main character energy")
- **Dark Mode**: Inverted gradient style (coming soon)
- **Crosshair**: Show/hide center crosshair on gradient

## Development

### Adding New Features

1. State management: Update `store/useMoodStore.ts`
2. New screens: Add to `app/` directory
3. Components: Add to `components/` directory
4. Utilities: Add to `lib/` directory

### Building for Production

```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Future Enhancements

- [ ] Home screen widget (iOS + Android)
- [ ] Monthly summary export with screenshot
- [ ] Dark mode gradient variant
- [ ] Pin clustering on history view
- [ ] Advanced pattern analysis
- [ ] Data export functionality

## License

MIT

## Credits

Built with ❤️ using React Native and Expo.



