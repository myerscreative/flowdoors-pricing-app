import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: any;
}

// Exact colors from reference image
const CORNERS = {
  topLeft: { r: 180, g: 220, b: 255 },     // Pale cyan
  topRight: { r: 255, g: 240, b: 50 },     // Bright yellow
  bottomLeft: { r: 40, g: 35, b: 45 },     // Dark purple/black
  bottomRight: { r: 255, g: 20, b: 0 },    // Deep red
};

// Convert RGB to hex for LinearGradient
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

const topLeft = rgbToHex(CORNERS.topLeft.r, CORNERS.topLeft.g, CORNERS.topLeft.b);
const topRight = rgbToHex(CORNERS.topRight.r, CORNERS.topRight.g, CORNERS.topRight.b);
const bottomLeft = rgbToHex(CORNERS.bottomLeft.r, CORNERS.bottomLeft.g, CORNERS.bottomLeft.b);
const bottomRight = rgbToHex(CORNERS.bottomRight.r, CORNERS.bottomRight.g, CORNERS.bottomRight.b);

export default function GradientBackground({ children, style }: GradientBackgroundProps) {
  // Use multiple overlapping gradients to approximate bilinear interpolation
  // This creates a smooth 4-corner gradient effect
  
  return (
    <View style={[styles.container, style]}>
      {/* Base diagonal gradient */}
      <LinearGradient
        colors={[topLeft, topRight, bottomRight, bottomLeft]}
        locations={[0, 0.33, 0.66, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Vertical overlay for left edge */}
      <LinearGradient
        colors={[topLeft, bottomLeft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
      />
      
      {/* Horizontal overlay for top edge */}
      <LinearGradient
        colors={[topLeft, topRight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.4 }]}
      />
      
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

