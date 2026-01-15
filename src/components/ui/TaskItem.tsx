import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronRight, Clock } from 'lucide-react-native';
import {
  colors,
  spacing,
  typography,
  sharedStyles,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
  getPriorityColors,
} from '@/styles';

type TaskItemProps = {
  task: {
    id: string;
    title: string;
    priority: string;
    due_date: string | null;
    projects?: { id: string; name: string } | null;
  };
  isRTL: boolean;
  onPress: () => void;
  priorityLabels?: Record<string, string>;
  style?: ViewStyle;
};

/**
 * A reusable task item component for displaying tasks in lists.
 * Shows priority indicator, title, due date with overdue highlighting.
 * Memoized to prevent unnecessary re-renders in lists.
 */
function TaskItemComponent({
  task,
  isRTL,
  onPress,
  priorityLabels,
  style,
}: TaskItemProps) {
  const priorityColors = useMemo(() => getPriorityColors(task.priority), [task.priority]);
  const isOverdue = useMemo(
    () => task.due_date && new Date(task.due_date) < new Date(),
    [task.due_date]
  );
  const priorityLabel = priorityLabels?.[task.priority] || task.priority;

  return (
    <TouchableOpacity
      style={[
        getFlexDirection(isRTL),
        sharedStyles.listItemWithBorder,
        {
          alignItems: 'center',
          borderLeftColor: priorityColors.text,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            sharedStyles.title,
            getTextAlign(isRTL),
            { fontSize: typography.fontSize.md },
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        <View
          style={[
            getFlexDirection(isRTL),
            {
              alignItems: 'center',
              marginTop: spacing.xs,
              gap: spacing.sm,
            },
          ]}
        >
          <View
            style={[
              sharedStyles.badge,
              {
                backgroundColor: priorityColors.bg,
                paddingVertical: 2,
              },
            ]}
          >
            <Text
              style={[
                sharedStyles.badgeText,
                {
                  color: priorityColors.text,
                  fontSize: typography.fontSize.xs,
                },
              ]}
            >
              {priorityLabel}
            </Text>
          </View>

          {task.due_date && (
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <Clock
                size={12}
                color={
                  isOverdue ? colors.status.error.text : colors.gray[400]
                }
              />
              <Text
                style={[
                  sharedStyles.caption,
                  getMarginStart(isRTL, spacing.xs),
                  {
                    color: isOverdue
                      ? colors.status.error.text
                      : colors.gray[500],
                  },
                ]}
              >
                {new Date(task.due_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          {task.projects?.name && (
            <Text
              style={[
                sharedStyles.caption,
                { color: colors.gray[400] },
              ]}
              numberOfLines={1}
            >
              {task.projects.name}
            </Text>
          )}
        </View>
      </View>

      <ChevronRight
        size={16}
        color={colors.gray[400]}
        style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
      />
    </TouchableOpacity>
  );
}

// Memoize to prevent unnecessary re-renders when parent updates
export const TaskItem = memo(TaskItemComponent);
