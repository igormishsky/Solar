import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, radii, typography, sharedStyles } from '@/styles';

type BadgeVariant = 'default' | 'success' | 'info' | 'warning' | 'error' | 'primary';
type BadgeSize = 'sm' | 'md';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: {
    bg: colors.gray[100],
    text: colors.gray[600],
  },
  success: {
    bg: colors.status.success.bg,
    text: colors.status.success.text,
  },
  info: {
    bg: colors.status.info.bg,
    text: colors.status.info.text,
  },
  warning: {
    bg: colors.status.warning.bg,
    text: colors.status.warning.text,
  },
  error: {
    bg: colors.status.error.bg,
    text: colors.status.error.text,
  },
  primary: {
    bg: colors.primaryLight,
    text: colors.primary,
  },
};

const sizeStyles: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number }> = {
  sm: {
    paddingH: spacing.sm,
    paddingV: 2,
    fontSize: typography.fontSize.xs,
  },
  md: {
    paddingH: spacing.sm,
    paddingV: spacing.xs,
    fontSize: typography.fontSize.sm,
  },
};

/**
 * A reusable badge component for displaying status, labels, or counts.
 * Supports multiple color variants and sizes.
 */
export function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  style,
  textStyle,
}: BadgeProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: variantStyle.bg,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
          borderRadius: radii.sm,
          gap: spacing.xs,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          {
            color: variantStyle.text,
            fontSize: sizeStyle.fontSize,
            fontWeight: typography.fontWeight.medium,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * A priority-specific badge that maps priority levels to appropriate colors.
 */
type PriorityBadgeProps = {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  label?: string;
  size?: BadgeSize;
  style?: ViewStyle;
};

export function PriorityBadge({
  priority,
  label,
  size = 'sm',
  style,
}: PriorityBadgeProps) {
  const priorityColors = colors.priority[priority] || colors.priority.low;
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={[
        {
          backgroundColor: priorityColors.bg,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
          borderRadius: radii.sm,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: priorityColors.text,
          fontSize: sizeStyle.fontSize,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {label || priority}
      </Text>
    </View>
  );
}

/**
 * A status-specific badge that maps status strings to appropriate colors.
 */
type StatusBadgeProps = {
  status: string;
  label?: string;
  size?: BadgeSize;
  style?: ViewStyle;
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  style,
}: StatusBadgeProps) {
  const getVariant = (): BadgeVariant => {
    if (status.includes('completed') || status.includes('active')) {
      return 'success';
    }
    if (status.includes('progress') || status.includes('pending')) {
      return 'info';
    }
    if (status.includes('hold') || status.includes('warning')) {
      return 'warning';
    }
    if (status.includes('cancelled') || status.includes('error')) {
      return 'error';
    }
    return 'default';
  };

  return (
    <Badge
      label={label || status}
      variant={getVariant()}
      size={size}
      style={style}
    />
  );
}
