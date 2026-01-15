import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskItem } from '../components/ui/TaskItem';
import { StatCard } from '../components/ui/StatCard';
import { ActivityItem } from '../components/ui/ActivityItem';
import { Sun } from 'lucide-react-native';
import { colors } from '@/styles';

describe('TaskItem', () => {
  const mockTask = {
    id: '1',
    title: 'Complete site survey',
    priority: 'high',
    due_date: '2025-12-31',
    projects: { id: 'p1', name: 'Solar Project A' },
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render task title', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} isRTL={false} onPress={mockOnPress} />
    );
    expect(getByText('Complete site survey')).toBeTruthy();
  });

  it('should render priority badge', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} isRTL={false} onPress={mockOnPress} />
    );
    expect(getByText('high')).toBeTruthy();
  });

  it('should render custom priority label when provided', () => {
    const priorityLabels = { high: 'Urgent Priority' };
    const { getByText } = render(
      <TaskItem
        task={mockTask}
        isRTL={false}
        onPress={mockOnPress}
        priorityLabels={priorityLabels}
      />
    );
    expect(getByText('Urgent Priority')).toBeTruthy();
  });

  it('should render due date', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} isRTL={false} onPress={mockOnPress} />
    );
    // Date format depends on locale, check for presence
    expect(getByText(/2025/)).toBeTruthy();
  });

  it('should render project name', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} isRTL={false} onPress={mockOnPress} />
    );
    expect(getByText('Solar Project A')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} isRTL={false} onPress={mockOnPress} />
    );
    fireEvent.press(getByText('Complete site survey'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should handle task without project', () => {
    const taskWithoutProject = { ...mockTask, projects: null };
    const { getByText, queryByText } = render(
      <TaskItem task={taskWithoutProject} isRTL={false} onPress={mockOnPress} />
    );
    expect(getByText('Complete site survey')).toBeTruthy();
    expect(queryByText('Solar Project A')).toBeNull();
  });

  it('should handle task without due date', () => {
    const taskWithoutDueDate = { ...mockTask, due_date: null };
    const { queryByText } = render(
      <TaskItem task={taskWithoutDueDate} isRTL={false} onPress={mockOnPress} />
    );
    // Should not render date-related elements
    expect(queryByText(/2025/)).toBeNull();
  });

  it('should render with RTL layout', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} isRTL={true} onPress={mockOnPress} />
    );
    // Component should still render correctly
    expect(getByText('Complete site survey')).toBeTruthy();
  });
});

describe('StatCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render title and value', () => {
    const { getByText } = render(
      <StatCard
        title="Active Projects"
        value={42}
        icon={<Sun size={24} color={colors.primary} />}
        color={colors.primary}
        bgColor={colors.primaryLight}
      />
    );
    expect(getByText('Active Projects')).toBeTruthy();
    expect(getByText('42')).toBeTruthy();
  });

  it('should render string value', () => {
    const { getByText } = render(
      <StatCard
        title="Status"
        value="Online"
        icon={<Sun size={24} color={colors.primary} />}
        color={colors.primary}
        bgColor={colors.primaryLight}
      />
    );
    expect(getByText('Online')).toBeTruthy();
  });

  it('should show loading indicator when isLoading is true', () => {
    const { queryByText, getByTestId } = render(
      <StatCard
        title="Loading Stat"
        value={0}
        icon={<Sun size={24} color={colors.primary} />}
        color={colors.primary}
        bgColor={colors.primaryLight}
        isLoading={true}
      />
    );
    // Value should not be displayed when loading
    expect(queryByText('0')).toBeNull();
  });

  it('should call onPress when tapped', () => {
    const { getByText } = render(
      <StatCard
        title="Clickable Stat"
        value={100}
        icon={<Sun size={24} color={colors.primary} />}
        color={colors.primary}
        bgColor={colors.primaryLight}
        onPress={mockOnPress}
      />
    );
    fireEvent.press(getByText('Clickable Stat'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should not be pressable without onPress', () => {
    const { getByText } = render(
      <StatCard
        title="Non-clickable"
        value={50}
        icon={<Sun size={24} color={colors.primary} />}
        color={colors.primary}
        bgColor={colors.primaryLight}
      />
    );
    fireEvent.press(getByText('Non-clickable'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});

describe('ActivityItem', () => {
  const mockOnPress = jest.fn();
  const mockActivity = {
    id: '1',
    type: 'project' as const,
    action: 'created' as const,
    title: 'New Solar Project',
    timestamp: '2025-01-15T10:30:00Z',
  };

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render activity title', () => {
    const { getByText } = render(
      <ActivityItem activity={mockActivity} isRTL={false} onPress={mockOnPress} />
    );
    expect(getByText('New Solar Project')).toBeTruthy();
  });

  it('should render action label', () => {
    const { getByText } = render(
      <ActivityItem activity={mockActivity} isRTL={false} onPress={mockOnPress} />
    );
    expect(getByText('created')).toBeTruthy();
  });

  it('should render custom action labels', () => {
    const actionLabels = { created: 'Added' };
    const { getByText } = render(
      <ActivityItem
        activity={mockActivity}
        isRTL={false}
        onPress={mockOnPress}
        actionLabels={actionLabels}
      />
    );
    expect(getByText('Added')).toBeTruthy();
  });

  it('should render different icons for different actions', () => {
    const completedActivity = { ...mockActivity, action: 'completed' as const };
    const { getByText: getCompleted } = render(
      <ActivityItem
        activity={completedActivity}
        isRTL={false}
        onPress={mockOnPress}
      />
    );
    expect(getCompleted('completed')).toBeTruthy();

    const updatedActivity = { ...mockActivity, action: 'updated' as const };
    const { getByText: getUpdated } = render(
      <ActivityItem activity={updatedActivity} isRTL={false} onPress={mockOnPress} />
    );
    expect(getUpdated('updated')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const { getByText } = render(
      <ActivityItem activity={mockActivity} isRTL={false} onPress={mockOnPress} />
    );
    fireEvent.press(getByText('New Solar Project'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should render with RTL layout', () => {
    const { getByText } = render(
      <ActivityItem activity={mockActivity} isRTL={true} onPress={mockOnPress} />
    );
    expect(getByText('New Solar Project')).toBeTruthy();
  });
});
