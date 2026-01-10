import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, User, Shield, ChevronRight, Trash2 } from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { SimpleHeader, Badge } from '@/components/ui';
import { Tables, UserRole } from '@/types/database.types';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

type UserType = Tables<'users'>;

const getRoleBadgeVariant = (role: UserRole): 'success' | 'warning' | 'info' | 'default' => {
  switch (role) {
    case 'administrator':
      return 'success';
    case 'manager':
      return 'warning';
    case 'office_staff':
    case 'field_technician':
      return 'info';
    default:
      return 'default';
  }
};

export default function UsersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: users = [], isLoading, refetch } = useUsers({ query: searchQuery });
  const deleteUser = useDeleteUser();

  const handleDeleteUser = (user: UserType) => {
    Alert.alert(
      t('common.delete'),
      t('users.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser.mutateAsync(user.id);
              Alert.alert(t('common.success'), t('users.deleteSuccess'));
              refetch();
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.general'));
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }: { item: UserType }) => (
    <TouchableOpacity
      style={sharedStyles.card}
      onPress={() => router.push(`/admin/users/${item.id}` as never)}
    >
      <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', alignItems: 'center' }]}>
        <View style={[getFlexDirection(isRTL), { alignItems: 'center', flex: 1 }]}>
          <View style={[sharedStyles.iconContainer, getMarginStart(isRTL, 12)]}>
            {item.role === 'administrator' ? (
              <Shield size={24} color={colors.primary} />
            ) : (
              <User size={24} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
              {item.full_name || item.email}
            </Text>
            <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
              {item.email}
            </Text>
            <View style={{ marginTop: 4 }}>
              <Badge
                label={t(`users.roles.${item.role}`)}
                variant={getRoleBadgeVariant(item.role)}
              />
            </View>
          </View>
        </View>
        <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
          <TouchableOpacity
            onPress={() => handleDeleteUser(item)}
            style={{ padding: 8, marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
          >
            <Trash2 size={18} color={colors.danger} />
          </TouchableOpacity>
          <ChevronRight
            size={20}
            color={colors.gray[400]}
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
      <SimpleHeader title={t('users.title')} onBack={() => router.back()} />

      <View style={sharedStyles.pageContent}>
        {/* Search Bar */}
        <View style={[sharedStyles.searchBar, getFlexDirection(isRTL)]}>
          <Search size={20} color={colors.gray[400]} />
          <TextInput
            style={[sharedStyles.searchInput, getTextAlign(isRTL)]}
            placeholder={t('users.searchUsers')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add User Button */}
        <TouchableOpacity
          style={[sharedStyles.primaryButton, getFlexDirection(isRTL)]}
          onPress={() => router.push('/admin/users/new' as never)}
        >
          <Plus size={20} color={colors.white} />
          <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
            {t('users.addUser')}
          </Text>
        </TouchableOpacity>

        {/* User List */}
        {users.length > 0 ? (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={sharedStyles.emptyState}>
            <User size={48} color={colors.gray[300]} />
            <Text style={sharedStyles.emptyStateText}>
              {t('users.noUsers')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
