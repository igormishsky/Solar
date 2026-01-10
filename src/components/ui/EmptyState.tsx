import { View, Text, TouchableOpacity } from 'react-native';
import { sharedStyles, colors } from '@/styles';

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * A reusable empty state component for lists and content areas.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={sharedStyles.emptyState}>
      {icon}
      <Text style={[sharedStyles.emptyStateText, { marginTop: 16 }]}>{title}</Text>
      {description && (
        <Text style={[sharedStyles.caption, { marginTop: 8, textAlign: 'center' }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[sharedStyles.primaryButton, { marginTop: 24, paddingHorizontal: 32 }]}
          onPress={onAction}
        >
          <Text style={sharedStyles.primaryButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
