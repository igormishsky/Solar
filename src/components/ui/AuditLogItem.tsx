import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  LogIn,
  LogOut,
  Shield,
  Upload,
  FileX,
  Send,
  Check,
  X,
} from 'lucide-react-native';
import {
  colors,
  spacing,
  typography,
  sharedStyles,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';
import { AuditAction, EntityType, Json } from '@/types/database.types';

type AuditLogItemProps = {
  log: {
    id: string;
    action: AuditAction;
    entity_type: EntityType;
    entity_id: string;
    old_values: Json | null;
    new_values: Json | null;
    created_at: string;
    users?: {
      email: string;
      full_name: string | null;
    } | null;
  };
  isRTL: boolean;
  onPress?: () => void;
  showDetails?: boolean;
  style?: ViewStyle;
};

const ACTION_ICONS: Record<AuditAction, typeof Plus> = {
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
  STATUS_CHANGE: RefreshCw,
  LOGIN: LogIn,
  LOGOUT: LogOut,
  PERMISSION_CHANGE: Shield,
  FILE_UPLOAD: Upload,
  FILE_DELETE: FileX,
  FORM_SUBMIT: Send,
  FORM_APPROVE: Check,
  FORM_REJECT: X,
};

const ACTION_COLORS: Record<AuditAction, { bg: string; text: string }> = {
  CREATE: colors.status.success,
  UPDATE: colors.status.info,
  DELETE: colors.status.error,
  STATUS_CHANGE: colors.status.warning,
  LOGIN: colors.status.info,
  LOGOUT: { bg: colors.gray[100], text: colors.gray[500] },
  PERMISSION_CHANGE: colors.status.warning,
  FILE_UPLOAD: colors.status.success,
  FILE_DELETE: colors.status.error,
  FORM_SUBMIT: colors.status.info,
  FORM_APPROVE: colors.status.success,
  FORM_REJECT: colors.status.error,
};

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  STATUS_CHANGE: 'Status Changed',
  LOGIN: 'Logged In',
  LOGOUT: 'Logged Out',
  PERMISSION_CHANGE: 'Permissions Changed',
  FILE_UPLOAD: 'File Uploaded',
  FILE_DELETE: 'File Deleted',
  FORM_SUBMIT: 'Form Submitted',
  FORM_APPROVE: 'Form Approved',
  FORM_REJECT: 'Form Rejected',
};

const ENTITY_LABELS: Record<EntityType, string> = {
  customer: 'Customer',
  project: 'Project',
  task: 'Task',
  professional: 'Professional',
  form: 'Form',
  document: 'Document',
  user: 'User',
};

function formatChanges(oldValues: Json | null, newValues: Json | null): string[] {
  if (!oldValues && !newValues) return [];

  const changes: string[] = [];
  const oldObj = (oldValues || {}) as Record<string, unknown>;
  const newObj = (newValues || {}) as Record<string, unknown>;

  // For CREATE, show new values
  if (!oldValues && newValues) {
    const keys = Object.keys(newObj).slice(0, 3);
    keys.forEach((key) => {
      if (newObj[key] !== null && newObj[key] !== undefined) {
        changes.push(`${key}: ${String(newObj[key]).slice(0, 30)}`);
      }
    });
    return changes;
  }

  // For UPDATE/STATUS_CHANGE, show changed values
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  allKeys.forEach((key) => {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      const oldVal = oldObj[key] !== undefined ? String(oldObj[key]).slice(0, 15) : '(empty)';
      const newVal = newObj[key] !== undefined ? String(newObj[key]).slice(0, 15) : '(empty)';
      changes.push(`${key}: ${oldVal} -> ${newVal}`);
    }
  });

  return changes.slice(0, 3);
}

export function AuditLogItem({
  log,
  isRTL,
  onPress,
  showDetails = false,
  style,
}: AuditLogItemProps) {
  const IconComponent = ACTION_ICONS[log.action] || Pencil;
  const actionColor = ACTION_COLORS[log.action] || colors.status.info;
  const actionLabel = ACTION_LABELS[log.action] || log.action;
  const entityLabel = ENTITY_LABELS[log.entity_type] || log.entity_type;

  const userName = log.users?.full_name || log.users?.email || 'Unknown User';
  const timestamp = new Date(log.created_at);
  const formattedDate = timestamp.toLocaleDateString();
  const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const changes = showDetails ? formatChanges(log.old_values, log.new_values) : [];

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        getFlexDirection(isRTL),
        sharedStyles.listItem,
        { alignItems: 'flex-start' },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={[
          sharedStyles.iconContainerSmall,
          { backgroundColor: actionColor.bg },
        ]}
      >
        <IconComponent size={16} color={actionColor.text} />
      </View>

      <View style={[{ flex: 1 }, getMarginStart(isRTL, spacing.md)]}>
        <View style={[getFlexDirection(isRTL), { alignItems: 'center', flexWrap: 'wrap' }]}>
          <Text
            style={[
              sharedStyles.title,
              getTextAlign(isRTL),
              { fontSize: typography.fontSize.md },
            ]}
          >
            {actionLabel}
          </Text>
          <View
            style={[
              sharedStyles.badge,
              { backgroundColor: colors.gray[100], marginHorizontal: spacing.xs },
            ]}
          >
            <Text style={[sharedStyles.badgeText, { color: colors.gray[600] }]}>
              {entityLabel}
            </Text>
          </View>
        </View>

        <Text style={[sharedStyles.caption, getTextAlign(isRTL), { marginTop: spacing.xs }]}>
          by {userName}
        </Text>

        <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
          {formattedDate} at {formattedTime}
        </Text>

        {showDetails && changes.length > 0 && (
          <View style={{ marginTop: spacing.sm, backgroundColor: colors.gray[50], padding: spacing.sm, borderRadius: 4 }}>
            {changes.map((change, index) => (
              <Text
                key={index}
                style={[sharedStyles.caption, getTextAlign(isRTL), { color: colors.gray[600] }]}
                numberOfLines={1}
              >
                {change}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Container>
  );
}
