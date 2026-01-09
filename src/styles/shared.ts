import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Color constants
export const colors = {
  primary: '#f97316',
  primaryLight: '#fff7ed',
  background: '#f3f4f6',
  white: '#fff',
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
  status: {
    success: { bg: '#ecfdf5', text: '#059669' },
    info: { bg: '#eff6ff', text: '#2563eb' },
    warning: { bg: '#fffbeb', text: '#d97706' },
    error: { bg: '#fef2f2', text: '#dc2626' },
  },
  priority: {
    urgent: { bg: '#fef2f2', text: '#dc2626' },
    high: { bg: '#fff7ed', text: '#ea580c' },
    medium: { bg: '#eff6ff', text: '#2563eb' },
    low: { bg: '#f3f4f6', text: '#6b7280' },
  },
} as const;

// Shadow styles for card elevation
export const shadows = {
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
} as const;

// Common component styles
export const sharedStyles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...shadows.sm,
  },

  // Search bar container
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    ...shadows.sm,
  },

  // Search input
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },

  // Primary button
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Icon container (avatar style)
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
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
    padding: 16,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyStateText: {
    fontSize: 16,
    color: colors.gray[400],
    marginTop: 16,
  },

  // Text styles
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
  },

  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },

  caption: {
    fontSize: 12,
    color: colors.gray[400],
  },

  // Badge/chip style
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '500',
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
