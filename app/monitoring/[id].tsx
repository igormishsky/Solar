import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sun,
  Zap,
  TrendingUp,
  Calendar,
  MapPin,
  Battery,
  CheckCircle,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useProjectMonitoring } from '@/hooks/useMonitoring';
import { SimpleHeader, Section, InfoRow, ErrorScreen } from '@/components/ui';
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

const { width: screenWidth } = Dimensions.get('window');

function ProductionChart({ data, label, isRTL }: { data: { label: string; value: number }[]; label: string; isRTL: boolean }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = (screenWidth - spacing.lg * 4) / data.length - 4;

  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={[sharedStyles.subtitle, getTextAlign(isRTL), { marginBottom: spacing.sm }]}>
        {label}
      </Text>
      <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', alignItems: 'flex-end', height: 120 }]}>
        {data.map((item, index) => (
          <View key={index} style={{ alignItems: 'center', width: barWidth }}>
            <View
              style={{
                width: barWidth - 4,
                height: Math.max(4, (item.value / maxValue) * 100),
                backgroundColor: colors.primary,
                borderRadius: radii.sm,
              }}
            />
            <Text style={{ fontSize: 10, color: colors.textSecondary, marginTop: 4 }}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function MonitoringDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isRTL } = useLanguageStore();

  const { data, isLoading, error } = useProjectMonitoring(id || '');

  if (isLoading) {
    return (
      <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
        <SimpleHeader title={t('monitoring.title')} onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
        <SimpleHeader title={t('monitoring.title')} onBack={() => router.back()} />
        <ErrorScreen
          message={t('errors.notFound')}
          onRetry={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const { project, hourlyProduction, weeklyProduction, currentPower, todayProduction, monthProduction, yearProduction } = data;
  const customer = project.customers as { first_name: string; last_name: string; property_city: string | null } | null;

  // Format hourly data for chart (show every 2 hours)
  const hourlyChartData = hourlyProduction
    .filter((_, i) => i % 2 === 0)
    .map(h => ({
      label: `${h.hour}`,
      value: h.production,
    }));

  // Format weekly data for chart
  const weeklyChartData = weeklyProduction.map(d => ({
    label: d.day,
    value: d.production,
  }));

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
      <SimpleHeader title={project.name} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {/* Current Status */}
        <View style={[sharedStyles.card, { marginBottom: spacing.lg }]}>
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginBottom: spacing.md }]}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: radii.full,
                backgroundColor: colors.status.success.bg,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Sun size={24} color={colors.status.success.text} />
            </View>
            <View style={[getMarginStart(isRTL, spacing.md), { flex: 1 }]}>
              <Text style={sharedStyles.subtitle}>{t('monitoring.systemStatus')}</Text>
              <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
                <CheckCircle size={16} color={colors.status.success.text} />
                <Text style={[{ color: colors.status.success.text, fontWeight: typography.fontWeight.semibold, marginLeft: spacing.xs }]}>
                  {t('monitoring.online')}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
              <Text style={sharedStyles.subtitle}>Current Power</Text>
              <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary }}>
                {currentPower.toFixed(1)} kW
              </Text>
            </View>
          </View>
        </View>

        {/* Production Stats */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <View style={[sharedStyles.card, { flex: 1, minWidth: '45%' }]}>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <Zap size={20} color={colors.primary} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, spacing.sm)]}>
                {t('monitoring.today')}
              </Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing.xs }}>
              {todayProduction.toFixed(1)} kWh
            </Text>
          </View>

          <View style={[sharedStyles.card, { flex: 1, minWidth: '45%' }]}>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <Calendar size={20} color={colors.accent.blue} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, spacing.sm)]}>
                {t('monitoring.thisMonth')}
              </Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing.xs }}>
              {monthProduction.toFixed(0)} kWh
            </Text>
          </View>

          <View style={[sharedStyles.card, { flex: 1, minWidth: '45%' }]}>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <TrendingUp size={20} color={colors.accent.green} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, spacing.sm)]}>
                {t('monitoring.thisYear')}
              </Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginTop: spacing.xs }}>
              {(yearProduction / 1000).toFixed(1)} MWh
            </Text>
          </View>

          <View style={[sharedStyles.card, { flex: 1, minWidth: '45%' }]}>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <Battery size={20} color={colors.accent.purple} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, spacing.sm)]}>
                {t('monitoring.efficiency')}
              </Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.accent.green, marginTop: spacing.xs }}>
              92%
            </Text>
          </View>
        </View>

        {/* Hourly Production Chart */}
        <Section title={t('monitoring.energyProduction')}>
          <ProductionChart
            data={hourlyChartData}
            label={`${t('monitoring.today')} (kWh per hour)`}
            isRTL={isRTL}
          />
          <ProductionChart
            data={weeklyChartData}
            label={`${t('monitoring.thisWeek')} (kWh per day)`}
            isRTL={isRTL}
          />
        </Section>

        {/* System Details */}
        <Section title={t('projects.systemSpecs')}>
          <InfoRow
            icon={<Battery size={18} color={colors.textSecondary} />}
            label={t('projects.systemSize')}
            value={`${project.system_size_kw || 0} kW`}
            isRTL={isRTL}
          />
          <InfoRow
            icon={<Sun size={18} color={colors.textSecondary} />}
            label={t('projects.panelCount')}
            value={`${project.panel_count || 0} panels`}
            isRTL={isRTL}
          />
          <InfoRow
            icon={<Zap size={18} color={colors.textSecondary} />}
            label={t('projects.inverterModel')}
            value={project.inverter_model || '-'}
            isRTL={isRTL}
          />
          <InfoRow
            icon={<TrendingUp size={18} color={colors.textSecondary} />}
            label={t('projects.estimatedProduction')}
            value={`${project.estimated_annual_production || 0} kWh/year`}
            isRTL={isRTL}
          />
        </Section>

        {/* Customer Info */}
        {customer && (
          <Section title={t('customers.customerDetails')}>
            <InfoRow
              label={t('customers.customerDetails')}
              value={`${customer.first_name} ${customer.last_name}`}
              isRTL={isRTL}
            />
            {customer.property_city && (
              <InfoRow
                icon={<MapPin size={18} color={colors.textSecondary} />}
                label={t('customers.city')}
                value={customer.property_city}
                isRTL={isRTL}
              />
            )}
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
