import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Edit2, Save, X, Trash2 } from 'lucide-react-native';
import { colors, getFlexDirection, getMarginStart } from '@/styles';

type DetailHeaderProps = {
  title: string;
  isRTL: boolean;
  isEditing?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  isSaving?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancelEdit?: () => void;
  onDelete?: () => void;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
};

/**
 * A reusable header component for detail screens.
 * Supports back navigation, edit/save/cancel/delete actions.
 */
export function DetailHeader({
  title,
  isRTL,
  isEditing = false,
  showEdit = true,
  showDelete = true,
  isSaving = false,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  rightContent,
  style,
}: DetailHeaderProps) {
  const router = useRouter();

  return (
    <View
      style={[
        getFlexDirection(isRTL),
        {
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={[getFlexDirection(isRTL), { alignItems: 'center' }]}
      >
        <ArrowLeft
          size={24}
          color={colors.white}
          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
        />
        <Text
          style={[
            { color: colors.white, fontSize: 18, fontWeight: '600' },
            getMarginStart(isRTL, 8),
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>

      <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
        {rightContent}
        {isEditing ? (
          <>
            <TouchableOpacity onPress={onCancelEdit}>
              <X size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} disabled={isSaving}>
              <Save size={24} color={colors.white} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {showEdit && onEdit && (
              <TouchableOpacity onPress={onEdit}>
                <Edit2 size={24} color={colors.white} />
              </TouchableOpacity>
            )}
            {showDelete && onDelete && (
              <TouchableOpacity onPress={onDelete}>
                <Trash2 size={24} color={colors.white} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

/**
 * A simpler header variant with just back navigation.
 */
export function SimpleHeader({
  title,
  isRTL,
  rightContent,
  style,
}: Pick<DetailHeaderProps, 'title' | 'isRTL' | 'rightContent' | 'style'>) {
  const router = useRouter();

  return (
    <View
      style={[
        getFlexDirection(isRTL),
        {
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 12,
          alignItems: 'center',
          justifyContent: rightContent ? 'space-between' : 'flex-start',
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={[getFlexDirection(isRTL), { alignItems: 'center' }]}
      >
        <ArrowLeft
          size={24}
          color={colors.white}
          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
        />
        <Text
          style={[
            { color: colors.white, fontSize: 18, fontWeight: '600' },
            getMarginStart(isRTL, 8),
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
      {rightContent}
    </View>
  );
}
