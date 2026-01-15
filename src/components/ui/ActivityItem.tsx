import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronRight, CheckCircle2, FolderKanban, TrendingUp } from 'lucide-react-native';
import {
  colors,
  spacing,
  typography,
  sharedStyles,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

type ActivityType = 'project' | 'task' | 'customer';
type ActivityAction = 'created' | 'updated' | 'completed';

type ActivityItemProps = {
  activity: {
    id: string;
    type: ActivityType;
    action: ActivityAction;
    title: string;
    timestamp: string;
  };
  isRTL: boolean;
  onPress: () => void;
  actionLabels?: {
    created?: string;
    updated?: string;
    completed?: string;
  };
  style?: ViewStyle;
};

/**
 * A reusable activity item component for displaying recent activity.
 * Shows an icon, title, action type, and timestamp.
 * Memoized to prevent unnecessary re-renders in lists.
 */
function ActivityItemComponent({
  activity,
  isRTL,
  onPress,
  actionLabels,
  style,
}: ActivityItemProps) {
  const actionIcon = useMemo(() => {
    switch (activity.action) {
      case 'completed':
        return <CheckCircle2 size={16} color={colors.status.success.text} />;
      case 'created':
        return <FolderKanban size={16} color={colors.primary} />;
      default:
        return <TrendingUp size={16} color={colors.status.info.text} />;
    }
  }, [activity.action]);

  const actionColor = useMemo(() => {
    switch (activity.action) {
      case 'completed':
        return colors.status.success.text;
      case 'created':
        return colors.primary;
      default:
        return colors.status.info.text;
    }
  }, [activity.action]);

  const actionLabel = actionLabels?.[activity.action] || activity.action;

  return (
    <TouchableOpacity
      style={[
        getFlexDirection(isRTL),
        sharedStyles.listItem,
        { alignItems: 'center' },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={sharedStyles.iconContainerSmall}>
        {actionIcon}
      </View>

      <View style={[{ flex: 1 }, getMarginStart(isRTL, spacing.md)]}>
        <Text
          style={[
            sharedStyles.title,
            getTextAlign(isRTL),
            { fontSize: typography.fontSize.md },
          ]}
          numberOfLines={1}
        >
          {activity.title}
        </Text>
        <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
          <Text style={{ color: actionColor }}>{actionLabel}</Text>
          {' - '}
          {new Date(activity.timestamp).toLocaleDateString()}
        </Text>
      </View>

      <ChevronRight
        size={16}
        color={colors.gray[400]}
        style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
      />
    </TouchableOpacity>
  );
}

// Memoize to prevent unnecessary re-renders in activity lists
export const ActivityItem = memo(ActivityItemComponent);
