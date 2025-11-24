import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useMoodStore } from '@/store/useMoodStore';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const { loadData } = useMoodStore();

  useEffect(() => {
    loadData();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="history" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="settings" />
      </Stack>
    </GestureHandlerRootView>
  );
}



