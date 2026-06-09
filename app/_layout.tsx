import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { setupNotifications } from '@/services/notifications/schedulingService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({});
        await setupNotifications();
      } catch (e) {
        // Font loading errors are non-fatal
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="post/[id]" />
          <Stack.Screen name="post/new" />
          <Stack.Screen name="connectors/index" />
          <Stack.Screen name="strategy/index" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
