import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  colors,
  spacing,
  radii,
  typography,
  sharedStyles,
  getFlexDirection,
  getMarginStart,
} from '@/styles';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  isRTL?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.md,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    fontSize: typography.fontSize.lg,
  },
};

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: {
    bg: colors.primary,
    text: colors.white,
  },
  secondary: {
    bg: 'transparent',
    text: colors.primary,
    border: colors.primary,
  },
  ghost: {
    bg: 'transparent',
    text: colors.primary,
  },
  danger: {
    bg: colors.status.error.text,
    text: colors.white,
  },
};

/**
 * A reusable button component with multiple variants and sizes.
 * Supports icons, loading state, and RTL layouts.
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  isRTL = false,
  style,
  textStyle,
}: ButtonProps) {
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];
  const isDisabled = disabled || isLoading;

  const effectiveIconPosition = isRTL
    ? (iconPosition === 'left' ? 'right' : 'left')
    : iconPosition;

  return (
    <TouchableOpacity
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variantStyle.bg,
          borderRadius: radii.lg,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderWidth: variantStyle.border ? 1 : 0,
          borderColor: variantStyle.border || 'transparent',
          opacity: isDisabled ? 0.6 : 1,
          ...(fullWidth && { width: '100%' }),
        },
        getFlexDirection(isRTL),
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variantStyle.text} />
      ) : (
        <>
          {icon && effectiveIconPosition === 'left' && (
            <>{icon}</>
          )}
          <Text
            style={[
              {
                color: variantStyle.text,
                fontSize: sizeStyle.fontSize,
                fontWeight: typography.fontWeight.semibold,
              },
              icon && getMarginStart(isRTL, spacing.sm),
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && effectiveIconPosition === 'right' && (
            <>{icon}</>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
