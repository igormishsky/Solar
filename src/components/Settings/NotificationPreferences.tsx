import { View, Text, Switch, ActivityIndicator, Alert } from 'react-native';
import { Bell, CheckSquare, FolderKanban, FileCheck, FileX, Award } from 'lucide-react-native';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotifications';
import { Section } from '@/components/ui/Section';
import {
  colors,
  spacing,
  sharedStyles,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

interface NotificationPreferencesProps {
  isRTL: boolean;
}

interface PreferenceToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: React.ReactNode;
  isRTL: boolean;
  disabled?: boolean;
}

function PreferenceToggle({
  label,
  description,
  value,
  onValueChange,
  icon,
  isRTL,
  disabled = false,
}: PreferenceToggleProps) {
  return (
    <View
      style={[
        getFlexDirection(isRTL),
        {
          alignItems: 'center',
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[100],
        },
      ]}
    >
      <View
        style={[
          sharedStyles.iconContainerSmall,
          { backgroundColor: colors.gray[100] },
        ]}
      >
        {icon}
      </View>
      <View style={[{ flex: 1 }, getMarginStart(isRTL, spacing.md)]}>
        <Text style={[sharedStyles.title, getTextAlign(isRTL), { fontSize: 14 }]}>
          {label}
        </Text>
        <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.gray[200], true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export function NotificationPreferences({ isRTL }: NotificationPreferencesProps) {
  const { data: preferences, isLoading, error } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updatePreferences.mutateAsync({ [key]: value });
    } catch (err) {
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  if (isLoading) {
    return (
      <Section
        title="Notification Preferences"
        icon={<Bell size={20} color={colors.primary} />}
        isRTL={isRTL}
      >
        <ActivityIndicator size="small" color={colors.primary} />
      </Section>
    );
  }

  if (error) {
    return (
      <Section
        title="Notification Preferences"
        icon={<Bell size={20} color={colors.primary} />}
        isRTL={isRTL}
      >
        <Text style={[sharedStyles.caption, { color: colors.status.error.text }]}>
          Failed to load preferences
        </Text>
      </Section>
    );
  }

  const preferenceItems = [
    {
      key: 'task_assigned',
      label: 'Task Assignments',
      description: 'Get notified when a task is assigned to you',
      icon: <CheckSquare size={16} color={colors.gray[600]} />,
    },
    {
      key: 'project_status',
      label: 'Project Status Changes',
      description: 'Get notified when a project status changes',
      icon: <FolderKanban size={16} color={colors.gray[600]} />,
    },
    {
      key: 'form_approved',
      label: 'Form Approvals',
      description: 'Get notified when a form is approved',
      icon: <FileCheck size={16} color={colors.gray[600]} />,
    },
    {
      key: 'form_rejected',
      label: 'Form Rejections',
      description: 'Get notified when a form is rejected',
      icon: <FileX size={16} color={colors.gray[600]} />,
    },
    {
      key: 'license_expiry',
      label: 'License Expiry Warnings',
      description: 'Get notified when a professional license is expiring',
      icon: <Award size={16} color={colors.gray[600]} />,
    },
  ];

  return (
    <Section
      title="Notification Preferences"
      icon={<Bell size={20} color={colors.primary} />}
      isRTL={isRTL}
    >
      <Text style={[sharedStyles.caption, getTextAlign(isRTL), { marginBottom: spacing.md }]}>
        Choose which email notifications you want to receive
      </Text>
      {preferenceItems.map((item) => (
        <PreferenceToggle
          key={item.key}
          label={item.label}
          description={item.description}
          value={preferences?.[item.key as keyof typeof preferences] as boolean ?? true}
          onValueChange={(value) => handleToggle(item.key, value)}
          icon={item.icon}
          isRTL={isRTL}
          disabled={updatePreferences.isPending}
        />
      ))}
    </Section>
  );
}
