import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CrosshairProps {
  width: number;
  height: number;
}

export default function Crosshair({ width, height }: CrosshairProps) {
  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      {/* Vertical line */}
      <View
        style={[
          styles.line,
          {
            left: width / 2,
            top: 0,
            height: height,
            width: 1,
          },
        ]}
      />
      {/* Horizontal line */}
      <View
        style={[
          styles.line,
          {
            top: height / 2,
            left: 0,
            width: width,
            height: 1,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});



