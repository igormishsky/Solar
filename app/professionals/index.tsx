import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Plus,
  Users,
  Phone,
  ChevronRight,
  AlertTriangle,
  Building2,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useProfessionals, useExpiringLicenses } from '@/hooks';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';
import {
  SimpleHeader,
  LoadingIndicator,
  EmptyState,
} from '@/components';
import { PROFESSIONAL_TYPES } from '@/constants';
import { ProfessionalType } from '@/types/database.types';

type Professional = {
  id: string;
  name: string;
  professional_type: ProfessionalType;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  license_expiry: string | null;
  is_electrician: boolean;
};

export default function ProfessionalsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProfessionalType | undefined>();

  const { data: professionals = [], isLoading } = useProfessionals({
    query: searchQuery,
    professional_type: selectedType,
  });
  const { data: expiringLicenses = [] } = useExpiringLicenses(30);

  const isLicenseExpiring = (professionalId: string) => {
    return expiringLicenses.some((p) => p.id === professionalId);
  };

  const isLicenseExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const renderProfessionalItem = ({ item }: { item: Professional }) => {
    const expiring = isLicenseExpiring(item.id);
    const expired = isLicenseExpired(item.license_expiry);

    return (
      <TouchableOpacity
        style={[
          sharedStyles.card,
          (expiring || expired) && { borderLeftWidth: 4, borderLeftColor: expired ? colors.status.error.text : colors.status.warning.text },
        ]}
        onPress={() => router.push(`/professionals/${item.id}`)}
      >
        <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', flex: 1 }]}>
            <View style={[sharedStyles.iconContainer, getMarginStart(isRTL, 12)]}>
              <Building2 size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
                {item.name}
              </Text>
              {item.company_name && (
                <Text style={[sharedStyles.subtitle, { marginTop: 2 }, getTextAlign(isRTL)]}>
                  {item.company_name}
                </Text>
              )}
              <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 8 }]}>
                <View style={[sharedStyles.badge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[sharedStyles.badgeText, { color: colors.primary }]}>
                    {t(`professionals.types.${item.professional_type}`)}
                  </Text>
                </View>
                {(expiring || expired) && (
                  <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
                    <AlertTriangle size={14} color={expired ? colors.status.error.text : colors.status.warning.text} />
                    <Text
                      style={[
                        sharedStyles.caption,
                        getMarginStart(isRTL, 4),
                        { color: expired ? colors.status.error.text : colors.status.warning.text },
                      ]}
                    >
                      {expired ? t('professionals.licenseExpired') : t('professionals.licenseExpiring')}
                    </Text>
                  </View>
                )}
              </View>
              {item.phone && (
                <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 6 }]}>
                  <Phone size={14} color={colors.gray[400]} />
                  <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 4)]}>
                    {item.phone}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <ChevronRight
            size={20}
            color={colors.gray[400]}
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['top']}>
      <SimpleHeader
        title={t('professionals.title')}
        isRTL={isRTL}
      />

      <View style={sharedStyles.pageContent}>
        {/* Search Bar */}
        <View style={[sharedStyles.searchBar, getFlexDirection(isRTL)]}>
          <Search size={20} color={colors.gray[400]} />
          <TextInput
            style={[sharedStyles.searchInput, getTextAlign(isRTL)]}
            placeholder={t('professionals.searchProfessionals')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Type Filter */}
        <View style={{ marginBottom: 16 }}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[undefined, ...PROFESSIONAL_TYPES]}
            keyExtractor={(item) => item || 'all'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  sharedStyles.badge,
                  {
                    marginRight: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: selectedType === item ? colors.primary : colors.gray[100],
                  },
                ]}
                onPress={() => setSelectedType(item)}
              >
                <Text
                  style={[
                    sharedStyles.badgeText,
                    { color: selectedType === item ? colors.white : colors.gray[600] },
                  ]}
                >
                  {item ? t(`professionals.types.${item}`) : t('common.all')}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Expiring Licenses Warning */}
        {expiringLicenses.length > 0 && (
          <View
            style={[
              sharedStyles.card,
              { backgroundColor: colors.status.warning.bg, marginBottom: 16 },
            ]}
          >
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <AlertTriangle size={20} color={colors.status.warning.text} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8), { color: colors.status.warning.text }]}>
                {expiringLicenses.length} {t('professionals.licenseExpiring')}
              </Text>
            </View>
          </View>
        )}

        {/* Add Professional Button */}
        <TouchableOpacity
          style={[sharedStyles.primaryButton, getFlexDirection(isRTL)]}
          onPress={() => router.push('/professionals/new')}
        >
          <Plus size={20} color={colors.white} />
          <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
            {t('professionals.addProfessional')}
          </Text>
        </TouchableOpacity>

        {/* Professional List */}
        {isLoading ? (
          <LoadingIndicator />
        ) : professionals.length > 0 ? (
          <FlatList
            data={professionals}
            renderItem={renderProfessionalItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon={<Users size={48} color={colors.gray[300]} />}
            title={t('professionals.noProfessionals')}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
