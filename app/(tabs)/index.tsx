import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  FolderKanban,
  ClipboardList,
  Activity,
  TrendingUp,
  AlertCircle,
} from 'lucide-react-native';

import { useProfile } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  const { isRTL } = useLanguageStore();

  return (
    <View
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
      <Text
        style={{
          fontSize: 14,
          color: '#6b7280',
          textAlign: isRTL ? 'right' : 'left',
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { t } = useTranslation();
  const profile = useProfile();
  const { isRTL } = useLanguageStore();

  // Placeholder stats - will be replaced with real data from React Query
  const stats = {
    activeProjects: 12,
    pendingTasks: 8,
    totalCustomers: 156,
    systemsMonitored: 89,
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
            value={stats.activeProjects}
            icon={<FolderKanban size={20} color="#f97316" />}
            color="#f97316"
            bgColor="#fff7ed"
          />
          <StatCard
            title={t('dashboard.pendingTasks')}
            value={stats.pendingTasks}
            icon={<ClipboardList size={20} color="#3b82f6" />}
            color="#3b82f6"
            bgColor="#eff6ff"
          />
          <StatCard
            title={t('dashboard.totalCustomers')}
            value={stats.totalCustomers}
            icon={<Users size={20} color="#10b981" />}
            color="#10b981"
            bgColor="#ecfdf5"
          />
          <StatCard
            title={t('dashboard.systemsMonitored')}
            value={stats.systemsMonitored}
            icon={<Activity size={20} color="#8b5cf6" />}
            color="#8b5cf6"
            bgColor="#f5f3ff"
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
              marginBottom: 16,
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

          {/* Placeholder for activity list */}
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: '#9ca3af' }}>{t('common.noResults')}</Text>
          </View>
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
              marginBottom: 16,
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

          {/* Placeholder for tasks list */}
          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: '#9ca3af' }}>{t('tasks.noTasks')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
