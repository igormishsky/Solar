import React, { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import i18n from '@/lib/i18n';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { ErrorBoundary } from '@/components/ui';
import { logError } from '@/lib/errorHandler';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initializeLanguage = useLanguageStore((state) => state.initialize);

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    logError(error, errorInfo, { component: 'RootLayout' }, 'critical');
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize language settings
        initializeLanguage();
        // Initialize auth
        await initialize();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    };

    init();
  }, [initialize, initializeLanguage]);

  if (!isInitialized) {
    return null;
  }

  return (
    <ErrorBoundary onError={handleError}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <I18nextProvider i18n={i18n}>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              />
              <StatusBar style="auto" />
            </I18nextProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
