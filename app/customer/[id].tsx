import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Zap,
  FileText,
  FolderKanban,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCustomer, useUpdateCustomer, useDeleteCustomer, useCustomerProjects } from '@/hooks';
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
    return <LoadingScreen />;
  }

  if (error || !customer) {
    return <ErrorScreen message={t('errors.notFound')} />;
  }

  const displayData = isEditing ? editData : customer;

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['top']}>
      <DetailHeader
        title={t('customers.customerDetails')}
        isRTL={isRTL}
        isEditing={isEditing}
        isSaving={updateCustomer.isPending}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={handleDelete}
      />

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
          <InfoRow
            icon={<Phone size={16} color={colors.gray[400]} />}
            text={displayData.phone_primary || '-'}
            isRTL={isRTL}
            style={{ marginTop: 8 }}
          />
          {displayData.phone_secondary && (
            <InfoRow
              icon={<Phone size={16} color={colors.gray[400]} />}
              text={displayData.phone_secondary}
              isRTL={isRTL}
            />
          )}
          {displayData.email && (
            <InfoRow
              icon={<Mail size={16} color={colors.gray[400]} />}
              text={displayData.email}
              isRTL={isRTL}
            />
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
          <Field
            label=""
            value={isEditing ? editData.notes : customer.notes}
            isRTL={isRTL}
            editable={isEditing}
            multiline
            numberOfLines={4}
            onChangeText={updateField('notes')}
          />
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
