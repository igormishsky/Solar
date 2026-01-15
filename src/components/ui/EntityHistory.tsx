import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { History } from 'lucide-react-native';
import { useEntityHistory } from '@/hooks/useAuditLogs';
import { Section } from './Section';
import { AuditLogItem } from './AuditLogItem';
import { EmptyState } from './EmptyState';
import { colors, spacing, sharedStyles, getTextAlign } from '@/styles';
import { EntityType } from '@/types/database.types';

type EntityHistoryProps = {
  entityType: EntityType;
  entityId: string;
  isRTL: boolean;
  title?: string;
  maxItems?: number;
};

export function EntityHistory({
  entityType,
  entityId,
  isRTL,
  title = 'History',
  maxItems = 10,
}: EntityHistoryProps) {
  const { data: history, isLoading, error } = useEntityHistory(entityType, entityId);

  if (isLoading) {
    return (
      <Section title={title} icon={<History size={20} color={colors.primary} />} isRTL={isRTL}>
        <ActivityIndicator size="small" color={colors.primary} />
      </Section>
    );
  }

  if (error) {
    return (
      <Section title={title} icon={<History size={20} color={colors.primary} />} isRTL={isRTL}>
        <Text style={[sharedStyles.caption, getTextAlign(isRTL), { color: colors.status.error.text }]}>
          Failed to load history
        </Text>
      </Section>
    );
  }

  const displayHistory = history?.slice(0, maxItems) || [];

  return (
    <Section title={title} icon={<History size={20} color={colors.primary} />} isRTL={isRTL}>
      {displayHistory.length === 0 ? (
        <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
          No history available
        </Text>
      ) : (
        <FlatList
          data={displayHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AuditLogItem log={item} isRTL={isRTL} showDetails />
          )}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
      {history && history.length > maxItems && (
        <Text style={[sharedStyles.caption, getTextAlign(isRTL), { marginTop: spacing.md }]}>
          +{history.length - maxItems} more entries
        </Text>
      )}
    </Section>
  );
}
