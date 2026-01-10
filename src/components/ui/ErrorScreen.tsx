import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle } from 'lucide-react-native';
import { sharedStyles, colors } from '@/styles';

type ErrorScreenProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

/**
 * A full-screen error display component.
 */
export function ErrorScreen({ message, onRetry, retryLabel = 'Try Again' }: ErrorScreenProps) {
  return (
    <SafeAreaView style={sharedStyles.pageContainer}>
      <View style={sharedStyles.emptyState}>
        <AlertCircle size={48} color={colors.status.error.text} />
        <Text style={[sharedStyles.emptyStateText, { marginTop: 16 }]}>{message}</Text>
        {onRetry && (
          <TouchableOpacity
            style={[sharedStyles.primaryButton, { marginTop: 24, paddingHorizontal: 32 }]}
            onPress={onRetry}
          >
            <Text style={sharedStyles.primaryButtonText}>{retryLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

/**
 * An inline error display for use within content areas.
 */
export function ErrorMessage({ message, onRetry, retryLabel = 'Try Again' }: ErrorScreenProps) {
  return (
    <View style={[sharedStyles.card, { backgroundColor: colors.status.error.bg }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AlertCircle size={20} color={colors.status.error.text} />
        <Text
          style={[
            sharedStyles.subtitle,
            { marginLeft: 8, color: colors.status.error.text, flex: 1 },
          ]}
        >
          {message}
        </Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          style={[
            sharedStyles.primaryButton,
            { marginTop: 12, backgroundColor: colors.status.error.text },
          ]}
          onPress={onRetry}
        >
          <Text style={sharedStyles.primaryButtonText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
