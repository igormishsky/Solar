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
  ChevronRight,
} from 'lucide-react-native';

import { useProfile } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { useDashboardStats, useRecentActivity, useUpcomingTasks } from '@/hooks';
import { StatCard, ActivityItem, TaskItem } from '@/components/ui';
import {
  sharedStyles,
  colors,
  spacing,
  radii,
  typography,
  shadows,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

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

  // Priority labels for TaskItem
  const priorityLabels = {
    urgent: t('tasks.priorities.urgent'),
    high: t('tasks.priorities.high'),
    medium: t('tasks.priorities.medium'),
    low: t('tasks.priorities.low'),
  };

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sharedStyles.heading, getTextAlign(isRTL)]}>
            {t('dashboard.welcome', { name: profile?.full_name || t('nav.dashboard') })}
          </Text>
          <Text
            style={[
              sharedStyles.subtitle,
              getTextAlign(isRTL),
              { marginTop: spacing.xs },
            ]}
          >
            {t('dashboard.overview')}
          </Text>
        </View>

        {/* Stats Grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            marginBottom: spacing['2xl'],
          }}
        >
          <StatCard
            title={t('dashboard.activeProjects')}
            value={stats?.activeProjects ?? 0}
            icon={<FolderKanban size={20} color={colors.primary} />}
            color={colors.primary}
            bgColor={colors.primaryLight}
            isLoading={statsLoading}
            isRTL={isRTL}
            onPress={() => router.push('/projects')}
          />
          <StatCard
            title={t('dashboard.pendingTasks')}
            value={stats?.pendingTasks ?? 0}
            icon={<ClipboardList size={20} color={colors.accent.blue} />}
            color={colors.accent.blue}
            bgColor={colors.status.info.bg}
            isLoading={statsLoading}
            isRTL={isRTL}
            onPress={() => router.push('/tasks')}
          />
          <StatCard
            title={t('dashboard.totalCustomers')}
            value={stats?.totalCustomers ?? 0}
            icon={<Users size={20} color={colors.accent.green} />}
            color={colors.accent.green}
            bgColor={colors.status.success.bg}
            isLoading={statsLoading}
            isRTL={isRTL}
            onPress={() => router.push('/customers')}
          />
          <StatCard
            title={t('dashboard.systemsMonitored')}
            value={stats?.systemsMonitored ?? 0}
            icon={<Activity size={20} color={colors.accent.purple} />}
            color={colors.accent.purple}
            bgColor="#f5f3ff"
            isLoading={statsLoading}
            isRTL={isRTL}
            onPress={() => router.push('/monitoring')}
          />
        </View>

        {/* Recent Activity Section */}
        <View style={[sharedStyles.card, { marginBottom: spacing.lg }]}>
          <View
            style={[
              getFlexDirection(isRTL),
              { alignItems: 'center', marginBottom: spacing.md },
            ]}
          >
            <TrendingUp size={20} color={colors.primary} />
            <Text style={[sharedStyles.sectionHeader, getMarginStart(isRTL, spacing.sm), { marginBottom: 0 }]}>
              {t('dashboard.recentActivity')}
            </Text>
          </View>

          {activityLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <ActivityItem
                key={`${activity.type}-${activity.id}`}
                activity={activity}
                isRTL={isRTL}
                onPress={() => handleActivityPress(activity)}
              />
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
              <Text style={sharedStyles.subtitle}>{t('common.noResults')}</Text>
            </View>
          )}
        </View>

        {/* Upcoming Tasks Section */}
        <View style={sharedStyles.card}>
          <View
            style={[
              getFlexDirection(isRTL),
              { alignItems: 'center', marginBottom: spacing.md },
            ]}
          >
            <AlertCircle size={20} color={colors.primary} />
            <Text style={[sharedStyles.sectionHeader, getMarginStart(isRTL, spacing.sm), { marginBottom: 0 }]}>
              {t('dashboard.upcomingTasks')}
            </Text>
          </View>

          {tasksLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : upcomingTasks.length > 0 ? (
            upcomingTasks.slice(0, 5).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isRTL={isRTL}
                priorityLabels={priorityLabels}
                onPress={() => router.push(`/task/${task.id}`)}
              />
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
              <Text style={sharedStyles.subtitle}>{t('tasks.noTasks')}</Text>
            </View>
          )}

          {upcomingTasks.length > 5 && (
            <TouchableOpacity
              style={[
                getFlexDirection(isRTL),
                sharedStyles.ghostButton,
                { justifyContent: 'center', marginTop: spacing.md },
              ]}
              onPress={() => router.push('/tasks')}
              activeOpacity={0.7}
            >
              <Text style={sharedStyles.ghostButtonText}>
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
