import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface PinProps {
  x: number; // 0-1
  y: number; // 0-1
  size?: number;
  color?: string;
  onPositionChange?: (x: number, y: number) => void;
  draggable?: boolean;
}

const AnimatedView = Reanimated.createAnimatedComponent(View);

export default function Pin({ 
  x, 
  y, 
  size = 24, 
  color = '#FFFFFF',
  onPositionChange,
  draggable = true,
}: PinProps) {
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    translateX.value = withSpring(x);
    translateY.value = withSpring(y);
  }, [x, y]);

  const panGesture = Gesture.Pan()
    .enabled(draggable)
    .onUpdate((e) => {
      translateX.value = e.x;
      translateY.value = e.y;
    })
    .onEnd(() => {
      if (onPositionChange) {
        // Note: This is simplified - in a real implementation, you'd need
        // to pass container dimensions to properly convert back to 0-1 coordinates
        // For now, we'll use the current approach
        onPositionChange(translateX.value, translateY.value);
      }
      scale.value = withSpring(1);
    })
    .onBegin(() => {
      scale.value = withSpring(1.2);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedView
        style={[
          styles.pin,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      >
        <View style={[styles.innerDot, { backgroundColor: color }]} />
      </AnimatedView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  pin: {
    position: 'absolute',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

