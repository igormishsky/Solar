import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { ErrorBoundary, InlineErrorBoundary } from '../components/ui/ErrorBoundary';

// Component that throws an error
function ProblemChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error from child');
  }
  return <Text>Child content</Text>;
}

// Component that throws on second render
function DelayedError({ throwOnUpdate }: { throwOnUpdate: boolean }) {
  const [count, setCount] = React.useState(0);

  if (throwOnUpdate && count > 0) {
    throw new Error('Error on update');
  }

  return (
    <View>
      <Text>Count: {count}</Text>
      <Text testID="increment" onPress={() => setCount((c) => c + 1)}>
        Increment
      </Text>
    </View>
  );
}

describe('ErrorBoundary', () => {
  // Suppress console errors for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(getByText('Child content')).toBeTruthy();
  });

  it('should render fallback UI when child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('Test error from child');
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <Text>Custom error message</Text>;

    const { getByText, queryByText } = render(
      <ErrorBoundary fallback={customFallback}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('Custom error message')).toBeTruthy();
    expect(queryByText('Something went wrong')).toBeNull();
  });

  it('should recover when Try Again is pressed', () => {
    let shouldThrow = true;

    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('Initial error');
      }
      return <Text>Recovered</Text>;
    };

    const { getByText, rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Error state
    expect(getByText('Something went wrong')).toBeTruthy();

    // Fix the error
    shouldThrow = false;

    // Press retry
    fireEvent.press(getByText('Try Again'));

    // Need to rerender to see the recovered state
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(getByText('Recovered')).toBeTruthy();
  });
});

describe('InlineErrorBoundary', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <InlineErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </InlineErrorBoundary>
    );

    expect(getByText('Child content')).toBeTruthy();
  });

  it('should render inline error card when child throws', () => {
    const { getByText } = render(
      <InlineErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </InlineErrorBoundary>
    );

    expect(getByText('Test error from child')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <InlineErrorBoundary onError={onError}>
        <ProblemChild shouldThrow={true} />
      </InlineErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <Text>Inline custom error</Text>;

    const { getByText, queryByText } = render(
      <InlineErrorBoundary fallback={customFallback}>
        <ProblemChild shouldThrow={true} />
      </InlineErrorBoundary>
    );

    expect(getByText('Inline custom error')).toBeTruthy();
    expect(queryByText('Retry')).toBeNull();
  });
});
