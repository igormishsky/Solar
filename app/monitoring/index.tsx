import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import {
  Activity,
  Zap,
  Sun,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Battery,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useMonitoredSystems, useMonitoringStats, type MonitoredSystem } from '@/hooks/useMonitoring';
import { SimpleHeader, StatCard, Badge } from '@/components/ui';
import {
  sharedStyles,
  colors,
  spacing,
  radii,
  typography,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

function SystemCard({ system, isRTL, onPress }: { system: MonitoredSystem; isRTL: boolean; onPress: () => void }) {
  const { t } = useTranslation();

  const statusColors = {
    online: colors.status.success.text,
    offline: colors.status.error.text,
    warning: colors.status.warning.text,
  };

  const statusBgColors = {
    online: colors.status.success.bg,
    offline: colors.status.error.bg,
    warning: colors.status.warning.bg,
  };

  const StatusIcon = system.status === 'online' ? CheckCircle : system.status === 'offline' ? XCircle : AlertTriangle;

  return (
    <TouchableOpacity
      style={[sharedStyles.card, { marginBottom: spacing.md }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', marginBottom: spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <Text style={[sharedStyles.cardTitle, getTextAlign(isRTL)]}>
            {system.projectName}
          </Text>
          <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
            {system.customerName}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: statusBgColors[system.status],
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radii.full,
          }}
        >
          <StatusIcon size={14} color={statusColors[system.status]} />
          <Text
            style={{
              color: statusColors[system.status],
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              marginLeft: spacing.xs,
            }}
          >
            {t(`monitoring.${system.status}`)}
          </Text>
        </View>
      </View>

      <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', marginTop: spacing.sm }]}>
        <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>
            {t('monitoring.energyProduction')}
          </Text>
          <Text style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary }}>
            {system.currentPowerKw} kW
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>
            {t('monitoring.today')}
          </Text>
          <Text style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary }}>
            {system.todayProductionKwh} kWh
          </Text>
        </View>
        <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
          <Text style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>
            {t('monitoring.efficiency')}
          </Text>
          <Text style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.accent.green }}>
            {system.efficiency}%
          </Text>
        </View>
      </View>

      {system.systemSizeKw && (
        <View style={[getFlexDirection(isRTL), { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Battery size={14} color={colors.textSecondary} />
          <Text style={[{ fontSize: typography.fontSize.sm, color: colors.textSecondary }, getMarginStart(isRTL, spacing.xs)]}>
            {system.systemSizeKw} kW • {system.panelCount || 0} panels
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function MonitoringScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useLanguageStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data: systems = [], isLoading: systemsLoading, refetch: refetchSystems } = useMonitoredSystems();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useMonitoringStats();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSystems(), refetchStats()]);
    setRefreshing(false);
  }, [refetchSystems, refetchStats]);

  const isLoading = systemsLoading || statsLoading;

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
      <SimpleHeader title={t('monitoring.title')} />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Stats Overview */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            marginBottom: spacing['2xl'],
          }}
        >
          <StatCard
            title={t('monitoring.online')}
            value={stats?.totalSystemsOnline ?? 0}
            icon={<CheckCircle size={20} color={colors.accent.green} />}
            color={colors.accent.green}
            bgColor={colors.status.success.bg}
            isLoading={isLoading}
            isRTL={isRTL}
          />
          <StatCard
            title={t('monitoring.warning')}
            value={stats?.totalSystemsWarning ?? 0}
            icon={<AlertTriangle size={20} color={colors.status.warning.text} />}
            color={colors.status.warning.text}
            bgColor={colors.status.warning.bg}
            isLoading={isLoading}
            isRTL={isRTL}
          />
          <StatCard
            title={t('monitoring.offline')}
            value={stats?.totalSystemsOffline ?? 0}
            icon={<XCircle size={20} color={colors.status.error.text} />}
            color={colors.status.error.text}
            bgColor={colors.status.error.bg}
            isLoading={isLoading}
            isRTL={isRTL}
          />
          <StatCard
            title={t('monitoring.energyProduction')}
            value={`${stats?.totalTodayProductionKwh ?? 0} kWh`}
            icon={<Zap size={20} color={colors.primary} />}
            color={colors.primary}
            bgColor={colors.primaryLight}
            isLoading={isLoading}
            isRTL={isRTL}
          />
        </View>

        {/* Total Capacity */}
        <View style={[sharedStyles.card, { marginBottom: spacing.lg }]}>
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', justifyContent: 'space-between' }]}>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <Sun size={24} color={colors.primary} />
              <View style={getMarginStart(isRTL, spacing.md)}>
                <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
                  Total Installed Capacity
                </Text>
                <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary }}>
                  {stats?.totalCapacityKw ?? 0} kW
                </Text>
              </View>
            </View>
            <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
              <Text style={sharedStyles.subtitle}>Avg. Efficiency</Text>
              <Text style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.accent.green }}>
                {stats?.averageEfficiency ?? 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Systems List */}
        <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginBottom: spacing.md }]}>
          <Activity size={20} color={colors.primary} />
          <Text style={[sharedStyles.sectionHeader, getMarginStart(isRTL, spacing.sm), { marginBottom: 0 }]}>
            {t('monitoring.systemStatus')} ({systems.length})
          </Text>
        </View>

        {isLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : systems.length > 0 ? (
          systems.map((system) => (
            <SystemCard
              key={system.id}
              system={system}
              isRTL={isRTL}
              onPress={() => router.push(`/monitoring/${system.id}`)}
            />
          ))
        ) : (
          <View style={[sharedStyles.card, { alignItems: 'center', paddingVertical: spacing['2xl'] }]}>
            <Sun size={48} color={colors.textTertiary} />
            <Text style={[sharedStyles.subtitle, { marginTop: spacing.md, textAlign: 'center' }]}>
              No monitored systems yet
            </Text>
            <Text style={{ color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xs }}>
              Complete projects with commercial activation to start monitoring
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
