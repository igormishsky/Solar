import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react-native';
import { sharedStyles, colors, spacing, typography, radii } from '@/styles';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  variant?: 'fullscreen' | 'inline';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showErrorDetails: boolean;
}

/**
 * Error Boundary component that catches JavaScript errors in child components.
 * Use variant="inline" for content areas, default is fullscreen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showErrorDetails: false,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null, showErrorDetails: false });
  };

  renderInlineError(): ReactNode {
    const { error } = this.state;
    return (
      <View style={[sharedStyles.card, styles.inlineError]}>
        <View style={styles.inlineErrorContent}>
          <AlertCircle size={20} color={colors.status.error.text} />
          <Text style={styles.inlineErrorText}>
            {error?.message || 'Something went wrong'}
          </Text>
        </View>
        <TouchableOpacity style={styles.inlineRetryButton} onPress={this.handleRetry}>
          <RefreshCw size={16} color={colors.primary} />
          <Text style={styles.inlineRetryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderFullscreenError(): ReactNode {
    const { error, errorInfo, showErrorDetails } = this.state;
    const { showDetails = __DEV__ } = this.props;

    return (
      <SafeAreaView style={sharedStyles.pageContainer}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <AlertCircle size={48} color={colors.status.error.text} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <RefreshCw size={20} color={colors.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          {showDetails && error && (
            <View style={styles.detailsContainer}>
              <TouchableOpacity
                style={styles.detailsToggle}
                onPress={() => this.setState((s) => ({ showErrorDetails: !s.showErrorDetails }))}
              >
                <Text style={styles.detailsToggleText}>
                  {showErrorDetails ? 'Hide' : 'Show'} Error Details
                </Text>
                {showErrorDetails ? (
                  <ChevronUp size={16} color={colors.gray[500]} />
                ) : (
                  <ChevronDown size={16} color={colors.gray[500]} />
                )}
              </TouchableOpacity>
              {showErrorDetails && (
                <ScrollView style={styles.errorDetails} nestedScrollEnabled>
                  <Text style={styles.errorName}>{error.name}</Text>
                  <Text style={styles.errorMessage}>{error.message}</Text>
                  {errorInfo?.componentStack && (
                    <Text style={styles.errorStack}>{errorInfo.componentStack.trim()}</Text>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallback, variant = 'fullscreen' } = this.props;

    if (!hasError) return children;
    if (fallback) return fallback;
    return variant === 'inline' ? this.renderInlineError() : this.renderFullscreenError();
  }
}

// Convenience alias for inline usage
export const InlineErrorBoundary = (props: Omit<ErrorBoundaryProps, 'variant'>) => (
  <ErrorBoundary {...props} variant="inline" />
);

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing['2xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.status.error.bg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[800],
    marginBottom: spacing.sm,
    textAlign: 'center' as const,
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.gray[500],
    textAlign: 'center' as const,
    marginBottom: spacing['2xl'],
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  detailsContainer: {
    marginTop: spacing['2xl'],
    width: '100%' as const,
    maxWidth: 400,
  },
  detailsToggle: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  detailsToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  errorDetails: {
    backgroundColor: colors.gray[50],
    borderRadius: radii.md,
    padding: spacing.md,
    maxHeight: 200,
  },
  errorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.status.error.text,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  errorMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    marginTop: spacing.xs,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  errorStack: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: spacing.sm,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  inlineError: {
    backgroundColor: colors.status.error.bg,
    borderWidth: 1,
    borderColor: colors.status.error.border,
  },
  inlineErrorContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  inlineErrorText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.status.error.text,
  },
  inlineRetryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  inlineRetryText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
};

export default ErrorBoundary;
