import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Building2,
  Phone,
  Mail,
  FileText,
  Calendar,
  AlertTriangle,
  Trash2,
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

type SectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isRTL: boolean;
};

function Section({ title, icon, children, isRTL }: SectionProps) {
  return (
    <View style={[sharedStyles.card, { marginBottom: 16 }]}>
      <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginBottom: 16 }]}>
        {icon}
        <Text style={[sharedStyles.title, getMarginStart(isRTL, 8), { fontSize: 18 }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string | null | undefined;
  isRTL: boolean;
  editable?: boolean;
  onChangeText?: (text: string) => void;
};

function Field({ label, value, isRTL, editable, onChangeText }: FieldProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[sharedStyles.caption, getTextAlign(isRTL), { marginBottom: 4 }]}>
        {label}
      </Text>
      {editable ? (
        <TextInput
          style={[
            sharedStyles.searchInput,
            {
              backgroundColor: colors.gray[50],
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.gray[200],
              padding: 12,
            },
            getTextAlign(isRTL),
          ]}
          value={value || ''}
          onChangeText={onChangeText}
        />
      ) : (
        <Text style={[sharedStyles.subtitle, getTextAlign(isRTL), { fontSize: 15, color: colors.gray[700] }]}>
          {value || '-'}
        </Text>
      )}
    </View>
  );
}

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

  const isLicenseExpired = professional?.license_expiry
    ? new Date(professional.license_expiry) < new Date()
    : false;

  const isLicenseExpiringSoon = professional?.license_expiry
    ? new Date(professional.license_expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false;

  if (isLoading) {
    return (
      <SafeAreaView style={[sharedStyles.pageContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !professional) {
    return (
      <SafeAreaView style={sharedStyles.pageContainer}>
        <View style={sharedStyles.emptyState}>
          <Text style={sharedStyles.emptyStateText}>{t('errors.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayData = isEditing ? editData : professional;

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['top']}>
      {/* Header */}
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
          <Text style={[{ color: colors.white, fontSize: 18, fontWeight: '600' }, getMarginStart(isRTL, 8)]}>
            {t('professionals.professionalDetails')}
          </Text>
        </TouchableOpacity>
        <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
          {isEditing ? (
            <>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <X size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={updateProfessional.isPending}>
                <Save size={24} color={colors.white} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={handleEdit}>
                <Edit2 size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Trash2 size={24} color={colors.white} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

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
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 8 }]}>
              <Phone size={16} color={colors.gray[400]} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8)]}>
                {professional.phone}
              </Text>
            </View>
          )}
          {professional.email && (
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 4 }]}>
              <Mail size={16} color={colors.gray[400]} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8)]}>
                {professional.email}
              </Text>
            </View>
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
