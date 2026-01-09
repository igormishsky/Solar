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
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Zap,
  FileText,
  FolderKanban,
  Trash2,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCustomer, useUpdateCustomer, useDeleteCustomer, useCustomerProjects } from '@/hooks';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
  shadows,
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

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});

  const { data: customer, isLoading, error } = useCustomer(id);
  const { data: projects = [] } = useCustomerProjects(id);
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const handleEdit = () => {
    if (customer) {
      setEditData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone_primary: customer.phone_primary || '',
        phone_secondary: customer.phone_secondary || '',
        id_number: customer.id_number || '',
        residential_city: customer.residential_city || '',
        residential_street: customer.residential_street || '',
        residential_number: customer.residential_number || '',
        residential_apartment: customer.residential_apartment || '',
        property_city: customer.property_city || '',
        property_street: customer.property_street || '',
        property_number: customer.property_number || '',
        property_apartment: customer.property_apartment || '',
        iec_contract_number: customer.iec_contract_number || '',
        iec_order_number: customer.iec_order_number || '',
        iec_meter_number: customer.iec_meter_number || '',
        notes: customer.notes || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateCustomer.mutateAsync({ id, data: editData });
      setIsEditing(false);
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.confirm'),
      t('customers.deleteConfirm') || 'Are you sure you want to delete this customer?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer.mutateAsync(id);
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
    return (
      <SafeAreaView style={[sharedStyles.pageContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !customer) {
    return (
      <SafeAreaView style={sharedStyles.pageContainer}>
        <View style={sharedStyles.emptyState}>
          <Text style={sharedStyles.emptyStateText}>{t('errors.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayData = isEditing ? editData : customer;

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
            {t('customers.customerDetails')}
          </Text>
        </TouchableOpacity>
        <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
          {isEditing ? (
            <>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <X size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={updateCustomer.isPending}>
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
        {/* Customer Header Card */}
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
              <User size={32} color={colors.primary} />
            </View>
            <View style={[{ flex: 1 }, getMarginStart(isRTL, 16)]}>
              <Text style={[sharedStyles.title, getTextAlign(isRTL), { fontSize: 20 }]}>
                {displayData.first_name} {displayData.last_name}
              </Text>
              <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
                {t(`customers.${customer.customer_type}`)}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <Section
          title={t('customers.personalInfo')}
          icon={<User size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <Field
                label={t('customers.firstName')}
                value={displayData.first_name}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('first_name')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label={t('customers.lastName')}
                value={displayData.last_name}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('last_name')}
              />
            </View>
          </View>
          <Field
            label={t('customers.idNumber')}
            value={displayData.id_number}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('id_number')}
          />
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 8 }]}>
            <Phone size={16} color={colors.gray[400]} />
            <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8)]}>
              {displayData.phone_primary}
            </Text>
          </View>
          {displayData.phone_secondary && (
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 4 }]}>
              <Phone size={16} color={colors.gray[400]} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8)]}>
                {displayData.phone_secondary}
              </Text>
            </View>
          )}
          {displayData.email && (
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 4 }]}>
              <Mail size={16} color={colors.gray[400]} />
              <Text style={[sharedStyles.subtitle, getMarginStart(isRTL, 8)]}>
                {displayData.email}
              </Text>
            </View>
          )}
        </Section>

        {/* Residential Address */}
        <Section
          title={t('customers.residentialAddress')}
          icon={<MapPin size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
            <View style={{ flex: 2 }}>
              <Field
                label={t('customers.city')}
                value={displayData.residential_city}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('residential_city')}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Field
                label={t('customers.street')}
                value={displayData.residential_street}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('residential_street')}
              />
            </View>
          </View>
          <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <Field
                label={t('customers.number')}
                value={displayData.residential_number}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('residential_number')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label={t('customers.apartment')}
                value={displayData.residential_apartment}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('residential_apartment')}
              />
            </View>
          </View>
        </Section>

        {/* Property Address */}
        <Section
          title={t('customers.propertyAddress')}
          icon={<Building2 size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
            <View style={{ flex: 2 }}>
              <Field
                label={t('customers.city')}
                value={displayData.property_city}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('property_city')}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Field
                label={t('customers.street')}
                value={displayData.property_street}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('property_street')}
              />
            </View>
          </View>
          <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <Field
                label={t('customers.number')}
                value={displayData.property_number}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('property_number')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label={t('customers.apartment')}
                value={displayData.property_apartment}
                isRTL={isRTL}
                editable={isEditing}
                onChangeText={updateField('property_apartment')}
              />
            </View>
          </View>
        </Section>

        {/* IEC Information */}
        <Section
          title={t('customers.iecInfo')}
          icon={<Zap size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <Field
            label={t('customers.contractNumber')}
            value={displayData.iec_contract_number}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('iec_contract_number')}
          />
          <Field
            label={t('customers.orderNumber')}
            value={displayData.iec_order_number}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('iec_order_number')}
          />
          <Field
            label={t('customers.meterNumber')}
            value={displayData.iec_meter_number}
            isRTL={isRTL}
            editable={isEditing}
            onChangeText={updateField('iec_meter_number')}
          />
        </Section>

        {/* Notes */}
        <Section
          title={t('customers.notes')}
          icon={<FileText size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          {isEditing ? (
            <TextInput
              style={[
                sharedStyles.searchInput,
                {
                  backgroundColor: colors.gray[50],
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.gray[200],
                  padding: 12,
                  minHeight: 100,
                  textAlignVertical: 'top',
                },
                getTextAlign(isRTL),
              ]}
              value={editData.notes}
              onChangeText={updateField('notes')}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
              {customer.notes || '-'}
            </Text>
          )}
        </Section>

        {/* Customer Projects */}
        <Section
          title={t('nav.projects')}
          icon={<FolderKanban size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          {projects.length > 0 ? (
            projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  getFlexDirection(isRTL),
                  {
                    padding: 12,
                    backgroundColor: colors.gray[50],
                    borderRadius: 8,
                    marginBottom: 8,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
                onPress={() => router.push(`/project/${project.id}`)}
              >
                <View>
                  <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
                    {project.name}
                  </Text>
                  <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
                    {t(`projects.statuses.${project.status}`)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
              {t('projects.noProjects')}
            </Text>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
