import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ClipboardList,
  User,
  Calendar,
  Flag,
  FolderKanban,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Play,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useTask, useUpdateTask, useUpdateTaskStatus, useDeleteTask } from '@/hooks';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
  getPriorityColors,
  getStatusColors,
} from '@/styles';
import {
  Section,
  Field,
  DetailHeader,
  LoadingScreen,
  ErrorScreen,
} from '@/components';
import { TaskStatus } from '@/types/database.types';

type StatusButtonProps = {
  status: TaskStatus;
  currentStatus: TaskStatus;
  onPress: () => void;
  isRTL: boolean;
  t: (key: string) => string;
  icon: React.ReactNode;
};

function StatusButton({ status, currentStatus, onPress, isRTL, t, icon }: StatusButtonProps) {
  const isActive = status === currentStatus;
  const statusColors = getStatusColors(status);

  return (
    <TouchableOpacity
      style={[
        getFlexDirection(isRTL),
        {
          flex: 1,
          padding: 12,
          backgroundColor: isActive ? statusColors.bg : colors.gray[50],
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: isActive ? statusColors.text : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      {icon}
      <Text
        style={[
          sharedStyles.badgeText,
          getMarginStart(isRTL, 6),
          { color: isActive ? statusColors.text : colors.gray[500] },
        ]}
      >
        {t(`tasks.statuses.${status}`)}
      </Text>
    </TouchableOpacity>
  );
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
  });

  const { data: task, isLoading, error } = useTask(id);
  const updateTask = useUpdateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const handleEdit = () => {
    if (task) {
      setEditData({
        title: task.title || '',
        description: task.description || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateTask.mutateAsync({ id, data: editData });
      setIsEditing(false);
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.confirm'),
      'Are you sure you want to delete this task?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask.mutateAsync(id);
              router.back();
            } catch (err) {
              Alert.alert(t('common.error'), t('errors.general'));
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !task) {
    return <ErrorScreen message={t('errors.notFound')} />;
  }

  const priorityColors = getPriorityColors(task.priority);
  const statusColors = getStatusColors(task.status);

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['top']}>
      <DetailHeader
        title={t('tasks.taskDetails')}
        isRTL={isRTL}
        isEditing={isEditing}
        isSaving={updateTask.isPending}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={handleDelete}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Task Header Card */}
        <View
          style={[
            sharedStyles.card,
            { marginBottom: 16, borderLeftWidth: 4, borderLeftColor: priorityColors.text },
          ]}
        >
          <View style={[getFlexDirection(isRTL), { alignItems: 'flex-start', marginBottom: 12 }]}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ClipboardList size={24} color={colors.primary} />
            </View>
            <View style={[{ flex: 1 }, getMarginStart(isRTL, 16)]}>
              {isEditing ? (
                <TextInput
                  style={[
                    sharedStyles.title,
                    {
                      fontSize: 20,
                      backgroundColor: colors.gray[50],
                      borderRadius: 8,
                      padding: 8,
                      borderWidth: 1,
                      borderColor: colors.gray[200],
                    },
                    getTextAlign(isRTL),
                  ]}
                  value={editData.title}
                  onChangeText={(text) => setEditData((prev) => ({ ...prev, title: text }))}
                />
              ) : (
                <Text style={[sharedStyles.title, getTextAlign(isRTL), { fontSize: 20 }]}>
                  {task.title}
                </Text>
              )}
              <View style={[getFlexDirection(isRTL), { marginTop: 8, gap: 8, flexWrap: 'wrap' }]}>
                <View style={[sharedStyles.badge, { backgroundColor: priorityColors.bg }]}>
                  <Text style={[sharedStyles.badgeText, { color: priorityColors.text }]}>
                    {t(`tasks.priorities.${task.priority}`)}
                  </Text>
                </View>
                <View style={[sharedStyles.badge, { backgroundColor: statusColors.bg }]}>
                  <Text style={[sharedStyles.badgeText, { color: statusColors.text }]}>
                    {t(`tasks.statuses.${task.status}`)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Status Control */}
        <Section
          title={t('tasks.status')}
          icon={<Flag size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <View style={[getFlexDirection(isRTL), { gap: 8 }]}>
            <StatusButton
              status="pending"
              currentStatus={task.status}
              onPress={() => handleStatusChange('pending')}
              isRTL={isRTL}
              t={t}
              icon={<Circle size={16} color={task.status === 'pending' ? colors.status.info.text : colors.gray[400]} />}
            />
            <StatusButton
              status="in_progress"
              currentStatus={task.status}
              onPress={() => handleStatusChange('in_progress')}
              isRTL={isRTL}
              t={t}
              icon={<Play size={16} color={task.status === 'in_progress' ? colors.status.warning.text : colors.gray[400]} />}
            />
            <StatusButton
              status="completed"
              currentStatus={task.status}
              onPress={() => handleStatusChange('completed')}
              isRTL={isRTL}
              t={t}
              icon={<CheckCircle2 size={16} color={task.status === 'completed' ? colors.status.success.text : colors.gray[400]} />}
            />
          </View>
        </Section>

        {/* Description */}
        <Section
          title={t('tasks.description')}
          icon={<ClipboardList size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <Field
            label=""
            value={isEditing ? editData.description : task.description}
            isRTL={isRTL}
            editable={isEditing}
            multiline
            numberOfLines={4}
            onChangeText={(text) => setEditData((prev) => ({ ...prev, description: text }))}
          />
        </Section>

        {/* Due Date */}
        <Section
          title={t('tasks.dueDate')}
          icon={<Calendar size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
            <Clock size={16} color={colors.gray[400]} />
            <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8), { fontSize: 15, color: colors.gray[700] }]}>
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
            </Text>
          </View>
          {task.completed_at && (
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 8 }]}>
              <CheckCircle2 size={16} color={colors.status.success.text} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8), { color: colors.status.success.text }]}>
                Completed: {new Date(task.completed_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </Section>

        {/* Related Project */}
        {task.projects && (
          <TouchableOpacity onPress={() => router.push(`/project/${task.projects.id}`)}>
            <Section
              title={t('tasks.relatedProject')}
              icon={<FolderKanban size={20} color={colors.primary} />}
              isRTL={isRTL}
            >
              <View style={[getFlexDirection(isRTL), { alignItems: 'center', justifyContent: 'space-between' }]}>
                <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
                  {task.projects.name}
                </Text>
                <ChevronRight
                  size={20}
                  color={colors.gray[400]}
                  style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                />
              </View>
            </Section>
          </TouchableOpacity>
        )}

        {/* Related Customer */}
        {task.customers && (
          <TouchableOpacity onPress={() => router.push(`/customer/${task.customers.id}`)}>
            <Section
              title={t('tasks.relatedCustomer')}
              icon={<User size={20} color={colors.primary} />}
              isRTL={isRTL}
            >
              <View style={[getFlexDirection(isRTL), { alignItems: 'center', justifyContent: 'space-between' }]}>
                <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
                  {task.customers.first_name} {task.customers.last_name}
                </Text>
                <ChevronRight
                  size={20}
                  color={colors.gray[400]}
                  style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                />
              </View>
            </Section>
          </TouchableOpacity>
        )}

        {/* Timestamps */}
        <View style={[sharedStyles.card, { marginBottom: 16 }]}>
          <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between' }]}>
            <View>
              <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>Created</Text>
              <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
                {new Date(task.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View>
              <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>Updated</Text>
              <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
                {new Date(task.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
