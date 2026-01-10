import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, User, Calendar, Filter } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useAuditLogs, useAuditStats } from '@/hooks/useAuditLogs';
import { SimpleHeader, Badge, Section } from '@/components/ui';
import { AuditAction, AuditEntityType } from '@/types/database.types';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

type AuditLog = {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string | null;
  created_at: string;
  ip_address: string | null;
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
};

const getActionBadgeVariant = (action: AuditAction): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
  switch (action) {
    case 'create':
      return 'success';
    case 'update':
      return 'warning';
    case 'delete':
      return 'danger';
    case 'view':
    case 'export':
      return 'info';
    default:
      return 'default';
  }
};

export default function AuditScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useLanguageStore();
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: logs = [], isLoading } = useAuditLogs({
    action: actionFilter || undefined,
    entity_type: entityFilter || undefined,
  });
  const { data: stats } = useAuditStats(30);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(isRTL ? 'he-IL' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const actions: AuditAction[] = ['create', 'update', 'delete', 'view', 'export', 'login', 'logout', 'password_change'];
  const entities: AuditEntityType[] = ['customer', 'project', 'task', 'professional', 'form', 'document', 'user', 'report'];

  const renderLogItem = ({ item }: { item: AuditLog }) => (
    <View style={[sharedStyles.card, { marginBottom: 8 }]}>
      <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
        <View style={{ flex: 1 }}>
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginBottom: 4 }]}>
            <Badge
              label={t(`audit.actions.${item.action}`)}
              variant={getActionBadgeVariant(item.action)}
            />
            <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8)]}>
              {t(`audit.entities.${item.entity_type}`)}
            </Text>
          </View>
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 4 }]}>
            <User size={14} color={colors.gray[400]} />
            <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 4)]}>
              {item.user?.full_name || item.user?.email || t('common.unknown')}
            </Text>
          </View>
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 2 }]}>
            <Calendar size={14} color={colors.gray[400]} />
            <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 4)]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          {item.ip_address && (
            <Text style={[sharedStyles.subtitle, { marginTop: 2, fontSize: 11 }]}>
              IP: {item.ip_address}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
      <SimpleHeader title={t('audit.title')} onBack={() => router.back()} />

      <View style={sharedStyles.pageContent}>
        {/* Stats */}
        {stats && (
          <Section title={t('audit.stats.title')}>
            <View style={[getFlexDirection(isRTL), { flexWrap: 'wrap', justifyContent: 'space-between' }]}>
              <View style={{ width: '48%', backgroundColor: '#f0f9ff', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0369a1' }}>
                  {stats.total_events}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {t('audit.stats.totalEvents')}
                </Text>
              </View>
              <View style={{ width: '48%', backgroundColor: '#fff7ed', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
                  {stats.period_days}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {t('audit.stats.last30Days')}
                </Text>
              </View>
            </View>
          </Section>
        )}

        {/* Filter Toggle */}
        <TouchableOpacity
          style={[sharedStyles.secondaryButton, getFlexDirection(isRTL), { marginBottom: 12 }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} color={colors.primary} />
          <Text style={[sharedStyles.secondaryButtonText, getMarginStart(isRTL, 8)]}>
            {t('common.filter')}
          </Text>
        </TouchableOpacity>

        {/* Filters */}
        {showFilters && (
          <View style={[sharedStyles.card, { marginBottom: 12 }]}>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
                {t('audit.filterByAction')}
              </Text>
              <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: colors.white }}>
                <Picker
                  selectedValue={actionFilter}
                  onValueChange={(value) => setActionFilter(value)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label={t('common.all')} value="" />
                  {actions.map((action) => (
                    <Picker.Item
                      key={action}
                      label={t(`audit.actions.${action}`)}
                      value={action}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
                {t('audit.filterByEntity')}
              </Text>
              <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: colors.white }}>
                <Picker
                  selectedValue={entityFilter}
                  onValueChange={(value) => setEntityFilter(value)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label={t('common.all')} value="" />
                  {entities.map((entity) => (
                    <Picker.Item
                      key={entity}
                      label={t(`audit.entities.${entity}`)}
                      value={entity}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        )}

        {/* Audit Logs List */}
        {logs.length > 0 ? (
          <FlatList
            data={logs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={sharedStyles.emptyState}>
            <FileText size={48} color={colors.gray[300]} />
            <Text style={sharedStyles.emptyStateText}>
              {t('audit.noLogs')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
