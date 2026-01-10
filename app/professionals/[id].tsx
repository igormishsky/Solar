import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  Phone,
  Mail,
  FileText,
  Calendar,
  AlertTriangle,
  User,
  Award,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useProfessional, useUpdateProfessional, useDeleteProfessional } from '@/hooks';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';
import {
  Section,
  Field,
  DetailHeader,
  LoadingScreen,
  ErrorScreen,
  InfoRow,
} from '@/components';
import { LICENSE_EXPIRY_WARNING_DAYS } from '@/constants';

export default function ProfessionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});

  const { data: professional, isLoading, error } = useProfessional(id);
  const updateProfessional = useUpdateProfessional();
  const deleteProfessional = useDeleteProfessional();

  const handleEdit = () => {
    if (professional) {
      setEditData({
        name: professional.name || '',
        company_name: professional.company_name || '',
        company_id: professional.company_id || '',
        id_number: professional.id_number || '',
        email: professional.email || '',
        phone: professional.phone || '',
        license_type: professional.license_type || '',
        license_number: professional.license_number || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfessional.mutateAsync({ id, data: editData });
      setIsEditing(false);
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.confirm'),
      'Are you sure you want to delete this professional?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProfessional.mutateAsync(id);
              router.back();
            } catch (err) {
              Alert.alert(t('common.error'), t('errors.general'));
            }
          },
        },
      ]
    );
  };

  const updateField = (field: string) => (value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !professional) {
    return <ErrorScreen message={t('errors.notFound')} />;
  }

  const isLicenseExpired = professional.license_expiry
    ? new Date(professional.license_expiry) < new Date()
    : false;

  const isLicenseExpiringSoon = professional.license_expiry
    ? new Date(professional.license_expiry) < new Date(Date.now() + LICENSE_EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000)
    : false;

  const displayData = isEditing ? editData : professional;

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['top']}>
      <DetailHeader
        title={t('professionals.professionalDetails')}
        isRTL={isRTL}
        isEditing={isEditing}
        isSaving={updateProfessional.isPending}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={handleDelete}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Professional Header Card */}
        <View style={[sharedStyles.card, { marginBottom: 16 }]}>
          <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Building2 size={32} color={colors.primary} />
            </View>
            <View style={[{ flex: 1 }, getMarginStart(isRTL, 16)]}>
              <Text style={[sharedStyles.title, getTextAlign(isRTL), { fontSize: 20 }]}>
                {displayData.name}
              </Text>
              <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
                {t(`professionals.types.${professional.professional_type}`)}
              </Text>
              {professional.is_electrician && (
                <View style={[sharedStyles.badge, { backgroundColor: colors.status.info.bg, marginTop: 8, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[sharedStyles.badgeText, { color: colors.status.info.text }]}>
                    {t('professionals.isElectrician')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* License Warning */}
        {(isLicenseExpired || isLicenseExpiringSoon) && (
          <View
            style={[
              sharedStyles.card,
              {
                marginBottom: 16,
                backgroundColor: isLicenseExpired ? colors.status.error.bg : colors.status.warning.bg,
              },
            ]}
          >
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <AlertTriangle
                size={24}
                color={isLicenseExpired ? colors.status.error.text : colors.status.warning.text}
              />
              <Text
                style={[
                  sharedStyles.title,
                  getMarginStart(isRTL, 12),
                  { color: isLicenseExpired ? colors.status.error.text : colors.status.warning.text },
                ]}
              >
                {isLicenseExpired ? t('professionals.licenseExpired') : t('professionals.licenseExpiring')}
              </Text>
            </View>
            <Text
              style={[
                sharedStyles.subtitle,
                { marginTop: 8, color: isLicenseExpired ? colors.status.error.text : colors.status.warning.text },
              ]}
            >
              Expiry: {new Date(professional.license_expiry!).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Contact Information */}
        <Section
          title={t('customers.personalInfo')}
          icon={<User size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <Field
            label={t('professionals.name')}
            value={displayData.name}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('name')}
          />
          <Field
            label={t('professionals.companyName')}
            value={displayData.company_name}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('company_name')}
          />
          <Field
            label={t('professionals.companyId')}
            value={displayData.company_id}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('company_id')}
          />
          <Field
            label={t('customers.idNumber')}
            value={displayData.id_number}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('id_number')}
          />
          {professional.phone && (
            <InfoRow
              icon={<Phone size={16} color={colors.gray[400]} />}
              text={professional.phone}
              isRTL={isRTL}
              style={{ marginTop: 8 }}
            />
          )}
          {professional.email && (
            <InfoRow
              icon={<Mail size={16} color={colors.gray[400]} />}
              text={professional.email}
              isRTL={isRTL}
            />
          )}
        </Section>

        {/* License Information */}
        <Section
          title={t('professionals.licenseType')}
          icon={<Award size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <Field
            label={t('professionals.licenseType')}
            value={displayData.license_type}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('license_type')}
          />
          <Field
            label={t('professionals.licenseNumber')}
            value={displayData.license_number}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('license_number')}
          />
          <View style={{ marginBottom: 12 }}>
            <Text style={[sharedStyles.caption, getTextAlign(isRTL), { marginBottom: 4 }]}>
              {t('professionals.licenseExpiry')}
            </Text>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
              <Calendar size={16} color={colors.gray[400]} />
              <Text
                style={[
                  sharedStyles.subtitle,
                  getMarginStart(isRTL, 8),
                  {
                    fontSize: 15,
                    color: isLicenseExpired
                      ? colors.status.error.text
                      : isLicenseExpiringSoon
                      ? colors.status.warning.text
                      : colors.gray[700],
                  },
                ]}
              >
                {professional.license_expiry
                  ? new Date(professional.license_expiry).toLocaleDateString()
                  : '-'}
              </Text>
            </View>
          </View>
          {professional.license_document_url && (
            <TouchableOpacity
              style={[sharedStyles.primaryButton, getFlexDirection(isRTL), { marginTop: 8 }]}
            >
              <FileText size={20} color={colors.white} />
              <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
                {t('common.view')} {t('nav.documents')}
              </Text>
            </TouchableOpacity>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
