import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../context/AuthContext';
import { AlertProvider } from '../components/AppAlertModal';

// Hide default native splash immediately so our in-app rich custom SplashView displays without blank delay
SplashScreen.hideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <AlertProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </AuthProvider>
    </AlertProvider>
  );
}
