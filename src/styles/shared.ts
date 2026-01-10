import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// ============================================
// DESIGN TOKENS - Foundation for consistent UI
// ============================================

// Spacing scale (4px base unit)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Border radius scale
export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Typography scale
export const typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Color palette
export const colors = {
  // Brand colors
  primary: '#f97316',
  primaryLight: '#fff7ed',
  primaryDark: '#ea580c',

  // Background colors
  background: '#f3f4f6',
  surface: '#fff',
  surfaceElevated: '#fff',
  white: '#fff',

  // Gray scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic colors
  status: {
    success: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    info: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    warning: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    error: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  },

  // Priority colors
  priority: {
    urgent: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    high: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
    medium: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    low: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  },

  // Accent colors for data visualization
  accent: {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    pink: '#ec4899',
    cyan: '#06b6d4',
  },
} as const;

// Shadow styles for card elevation
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Animation durations (in ms)
export const durations = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Icon sizes
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

// ============================================
// SHARED COMPONENT STYLES
// ============================================

export const sharedStyles = StyleSheet.create({
  // Card variants
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },

  cardElevated: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },

  cardInteractive: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Search bar container
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },

  // Search input
  searchInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
  },

  // Button variants
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },

  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },

  ghostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  ghostButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },

  // Icon container (avatar style)
  iconContainer: {
    width: iconSizes['2xl'],
    height: iconSizes['2xl'],
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconContainerSmall: {
    width: iconSizes.xl,
    height: iconSizes.xl,
    borderRadius: radii.full,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Page container
  pageContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  pageContent: {
    flex: 1,
    padding: spacing.lg,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },

  emptyStateText: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[400],
    marginTop: spacing.lg,
    textAlign: 'center',
  },

  // Typography styles
  heading: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
  },

  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[800],
  },

  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray[500],
  },

  body: {
    fontSize: typography.fontSize.md,
    color: colors.gray[700],
  },

  caption: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[400],
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },

  // Badge/chip style
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },

  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // List item styles
  listItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  listItemWithBorder: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.lg,
  },

  // Section header
  sectionHeader: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
});

// RTL-aware style helpers
export const getFlexDirection = (isRTL: boolean): ViewStyle => ({
  flexDirection: isRTL ? 'row-reverse' : 'row',
});

export const getTextAlign = (isRTL: boolean): TextStyle => ({
  textAlign: isRTL ? 'right' : 'left',
});

export const getMarginStart = (isRTL: boolean, value: number): ViewStyle => ({
  marginLeft: isRTL ? 0 : value,
  marginRight: isRTL ? value : 0,
});

export const getMarginEnd = (isRTL: boolean, value: number): ViewStyle => ({
  marginLeft: isRTL ? value : 0,
  marginRight: isRTL ? 0 : value,
});

// Priority color helpers
export const getPriorityColors = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return colors.priority.urgent;
    case 'high':
      return colors.priority.high;
    case 'medium':
      return colors.priority.medium;
    default:
      return colors.priority.low;
  }
};

// Status color helpers
export const getStatusColors = (status: string) => {
  if (status.includes('completed') || status.includes('active')) {
    return colors.status.success;
  }
  if (status.includes('progress') || status.includes('pending')) {
    return colors.status.info;
  }
  if (status.includes('hold') || status.includes('warning')) {
    return colors.status.warning;
  }
  if (status.includes('cancelled') || status.includes('error')) {
    return colors.status.error;
  }
  return { bg: colors.gray[100], text: colors.gray[500] };
};
