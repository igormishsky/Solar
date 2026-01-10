import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sharedStyles, colors } from '@/styles';

type LoadingScreenProps = {
  message?: string;
};

/**
 * A full-screen loading indicator component.
 */
export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <SafeAreaView
      style={[sharedStyles.pageContainer, { justifyContent: 'center', alignItems: 'center' }]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={[sharedStyles.subtitle, { marginTop: 16 }]}>{message}</Text>
      )}
    </SafeAreaView>
  );
}

/**
 * An inline loading indicator for use within scrollviews.
 */
export function LoadingIndicator({ message }: LoadingScreenProps) {
  return (
    <View style={sharedStyles.emptyState}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={[sharedStyles.subtitle, { marginTop: 16 }]}>{message}</Text>
      )}
    </View>
  );
}
