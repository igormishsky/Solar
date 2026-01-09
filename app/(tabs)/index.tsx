import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  FolderKanban,
  ClipboardList,
  Activity,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';

import { useProfile } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useDashboardStats, useRecentActivity, useUpcomingTasks } from '@/hooks';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
  getPriorityColors,
} from '@/styles';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isLoading?: boolean;
  onPress?: () => void;
}

function StatCard({ title, value, icon, color, bgColor, isLoading, onPress }: StatCardProps) {
  const { isRTL } = useLanguageStore();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flex: 1,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: bgColor,
            padding: 8,
            borderRadius: 8,
          }}
        >
          {icon}
        </View>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color={color} style={{ marginBottom: 4 }} />
      ) : (
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: 4,
            textAlign: isRTL ? 'right' : 'left',
          }}
        >
          {value}
        </Text>
      )}
      <Text
        style={{
          fontSize: 14,
          color: '#6b7280',
          textAlign: isRTL ? 'right' : 'left',
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

interface ActivityItemProps {
  activity: {
    id: string;
    type: 'project' | 'task' | 'customer';
    action: 'created' | 'updated' | 'completed';
    title: string;
    timestamp: string;
  };
  isRTL: boolean;
  t: (key: string) => string;
  onPress: () => void;
}

function ActivityItem({ activity, isRTL, t, onPress }: ActivityItemProps) {
  const getActionIcon = () => {
    switch (activity.action) {
      case 'completed':
        return <CheckCircle2 size={16} color={colors.status.success.text} />;
      case 'created':
        return <FolderKanban size={16} color={colors.primary} />;
      default:
        return <TrendingUp size={16} color={colors.status.info.text} />;
    }
  };

  const getActionColor = () => {
    switch (activity.action) {
      case 'completed':
        return colors.status.success.text;
      case 'created':
        return colors.primary;
      default:
        return colors.status.info.text;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getFlexDirection(isRTL),
        {
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[100],
          alignItems: 'center',
        },
      ]}
      onPress={onPress}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.gray[100],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {getActionIcon()}
      </View>
      <View style={[{ flex: 1 }, getMarginStart(isRTL, 12)]}>
        <Text style={[sharedStyles.title, getTextAlign(isRTL), { fontSize: 14 }]} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
          <Text style={{ color: getActionColor() }}>{activity.action}</Text>
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

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    priority: string;
    due_date: string | null;
    projects?: { id: string; name: string } | null;
  };
  isRTL: boolean;
  t: (key: string) => string;
  onPress: () => void;
}

function TaskItem({ task, isRTL, t, onPress }: TaskItemProps) {
  const priorityColors = getPriorityColors(task.priority);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <TouchableOpacity
      style={[
        getFlexDirection(isRTL),
        {
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[100],
          alignItems: 'center',
          borderLeftWidth: 3,
          borderLeftColor: priorityColors.text,
          paddingLeft: 12,
        },
      ]}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={[sharedStyles.title, getTextAlign(isRTL), { fontSize: 14 }]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 4, gap: 8 }]}>
          <View style={[sharedStyles.badge, { backgroundColor: priorityColors.bg, paddingVertical: 2 }]}>
            <Text style={[sharedStyles.badgeText, { color: priorityColors.text, fontSize: 10 }]}>
              {t(`tasks.priorities.${task.priority}`)}
            </Text>
          </View>
          {task.due_date && (
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <Clock size={12} color={isOverdue ? colors.status.error.text : colors.gray[400]} />
              <Text
                style={[
                  sharedStyles.caption,
                  getMarginStart(isRTL, 4),
                  { color: isOverdue ? colors.status.error.text : colors.gray[500] },
                ]}
              >
                {new Date(task.due_date).toLocaleDateString()}
              </Text>
            </View>
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

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useProfile();
  const { isRTL } = useLanguageStore();

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentActivity(5);
  const { data: upcomingTasks = [], isLoading: tasksLoading } = useUpcomingTasks(7);

  const handleActivityPress = (activity: { id: string; type: string }) => {
    switch (activity.type) {
      case 'project':
        router.push(`/project/${activity.id}`);
        break;
      case 'task':
        router.push(`/task/${activity.id}`);
        break;
      case 'customer':
        router.push(`/customer/${activity.id}`);
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#1f2937',
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t('dashboard.welcome', { name: profile?.full_name || t('nav.dashboard') })}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              marginTop: 4,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t('dashboard.overview')}
          </Text>
        </View>

        {/* Stats Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <StatCard
            title={t('dashboard.activeProjects')}
            value={stats?.activeProjects ?? 0}
            icon={<FolderKanban size={20} color="#f97316" />}
            color="#f97316"
            bgColor="#fff7ed"
            isLoading={statsLoading}
            onPress={() => router.push('/projects')}
          />
          <StatCard
            title={t('dashboard.pendingTasks')}
            value={stats?.pendingTasks ?? 0}
            icon={<ClipboardList size={20} color="#3b82f6" />}
            color="#3b82f6"
            bgColor="#eff6ff"
            isLoading={statsLoading}
            onPress={() => router.push('/tasks')}
          />
          <StatCard
            title={t('dashboard.totalCustomers')}
            value={stats?.totalCustomers ?? 0}
            icon={<Users size={20} color="#10b981" />}
            color="#10b981"
            bgColor="#ecfdf5"
            isLoading={statsLoading}
            onPress={() => router.push('/customers')}
          />
          <StatCard
            title={t('dashboard.systemsMonitored')}
            value={stats?.systemsMonitored ?? 0}
            icon={<Activity size={20} color="#8b5cf6" />}
            color="#8b5cf6"
            bgColor="#f5f3ff"
            isLoading={statsLoading}
          />
        </View>

        {/* Recent Activity Section */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <TrendingUp size={20} color="#f97316" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginLeft: isRTL ? 0 : 8,
                marginRight: isRTL ? 8 : 0,
              }}
            >
              {t('dashboard.recentActivity')}
            </Text>
          </View>

          {activityLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <ActivityItem
                key={`${activity.type}-${activity.id}`}
                activity={activity}
                isRTL={isRTL}
                t={t}
                onPress={() => handleActivityPress(activity)}
              />
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ color: '#9ca3af' }}>{t('common.noResults')}</Text>
            </View>
          )}
        </View>

        {/* Upcoming Tasks Section */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <AlertCircle size={20} color="#f97316" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1f2937',
                marginLeft: isRTL ? 0 : 8,
                marginRight: isRTL ? 8 : 0,
              }}
            >
              {t('dashboard.upcomingTasks')}
            </Text>
          </View>

          {tasksLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : upcomingTasks.length > 0 ? (
            upcomingTasks.slice(0, 5).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isRTL={isRTL}
                t={t}
                onPress={() => router.push(`/task/${task.id}`)}
              />
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ color: '#9ca3af' }}>{t('tasks.noTasks')}</Text>
            </View>
          )}

          {upcomingTasks.length > 5 && (
            <TouchableOpacity
              style={[
                getFlexDirection(isRTL),
                { justifyContent: 'center', alignItems: 'center', marginTop: 12 },
              ]}
              onPress={() => router.push('/tasks')}
            >
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {t('common.view')} {t('common.all')}
              </Text>
              <ChevronRight
                size={16}
                color={colors.primary}
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
