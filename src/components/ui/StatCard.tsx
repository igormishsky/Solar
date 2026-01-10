import { View, Text, TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';
import {
  colors,
  spacing,
  radii,
  shadows,
  typography,
  getFlexDirection,
  getTextAlign,
} from '@/styles';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isLoading?: boolean;
  onPress?: () => void;
  isRTL?: boolean;
  style?: ViewStyle;
};

/**
 * A reusable stat card component for displaying key metrics.
 * Used in dashboards and overview screens.
 */
export function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  isLoading = false,
  onPress,
  isRTL = false,
  style,
}: StatCardProps) {
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          padding: spacing.lg,
          flex: 1,
          minWidth: 150,
          ...shadows.sm,
        },
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={[
          getFlexDirection(isRTL),
          {
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: spacing.md,
          },
        ]}
      >
        <View
          style={{
            backgroundColor: bgColor,
            padding: spacing.sm,
            borderRadius: radii.md,
          }}
        >
          {icon}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={color}
          style={{ marginBottom: spacing.xs }}
        />
      ) : (
        <Text
          style={[
            {
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.gray[800],
              marginBottom: spacing.xs,
            },
            getTextAlign(isRTL),
          ]}
        >
          {value}
        </Text>
      )}

      <Text
        style={[
          {
            fontSize: typography.fontSize.md,
            color: colors.gray[500],
          },
          getTextAlign(isRTL),
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
