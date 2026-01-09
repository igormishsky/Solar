import { Redirect } from 'expo-router';
import { useIsAuthenticated } from '@/stores/useAuthStore';

export default function Index() {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
