import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Send,
  Eye,
  ChevronRight,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import {
  useProjectForms,
  useUpdateFormStatus,
  useInitializeProjectForms,
} from '@/hooks';
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
import { FORM_TYPES } from '@/constants';
import { FormStatus } from '@/types/database.types';

type Form = {
  id: string;
  form_type: string;
  form_name: string;
  form_name_he: string;
  status: FormStatus;
  signed_by: string | null;
  signed_at: string | null;
  document_url: string | null;
  created_at: string;
};

const STATUS_CONFIGS: Record<FormStatus, { icon: React.ReactNode; color: string; bg: string }> = {
  draft: {
    icon: <Clock size={16} color={colors.gray[500]} />,
    color: colors.gray[500],
    bg: colors.gray[100],
  },
  review: {
    icon: <Eye size={16} color={colors.status.info.text} />,
    color: colors.status.info.text,
    bg: colors.status.info.bg,
  },
  signature_pending: {
    icon: <AlertCircle size={16} color={colors.status.warning.text} />,
    color: colors.status.warning.text,
    bg: colors.status.warning.bg,
  },
  submitted: {
    icon: <Send size={16} color={colors.status.info.text} />,
    color: colors.status.info.text,
    bg: colors.status.info.bg,
  },
  approved: {
    icon: <CheckCircle2 size={16} color={colors.status.success.text} />,
    color: colors.status.success.text,
    bg: colors.status.success.bg,
  },
  rejected: {
    icon: <XCircle size={16} color={colors.status.error.text} />,
    color: colors.status.error.text,
    bg: colors.status.error.bg,
  },
};

export default function ProjectFormsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();
  const language = useLanguageStore((state) => state.language);

  const { data: forms = [], isLoading, refetch } = useProjectForms(id);
  const updateFormStatus = useUpdateFormStatus();
  const initializeForms = useInitializeProjectForms();

  const handleInitializeForms = async () => {
    try {
      await initializeForms.mutateAsync(id);
      refetch();
      Alert.alert(t('common.success'), 'Forms initialized successfully');
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
  };

  const handleStatusChange = (formId: string, formName: string, currentStatus: FormStatus) => {
    const statusOptions: FormStatus[] = ['draft', 'review', 'signature_pending', 'submitted', 'approved', 'rejected'];

    Alert.alert(
      'Update Status',
      `Change status for "${formName}"`,
      statusOptions.map((status) => ({
        text: t(`forms.statuses.${status}`),
        onPress: async () => {
          if (status !== currentStatus) {
            try {
              await updateFormStatus.mutateAsync({ id: formId, status });
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.general'));
            }
          }
        },
      }))
    );
  };

  const getCompletionStats = () => {
    const total = forms.length;
    const approved = forms.filter((f) => f.status === 'approved').length;
    const pending = forms.filter((f) => f.status === 'signature_pending').length;
    const inProgress = forms.filter((f) => ['review', 'submitted'].includes(f.status)).length;
    return { total, approved, pending, inProgress };
  };

  const stats = getCompletionStats();

  const renderFormItem = (form: Form) => {
    const config = STATUS_CONFIGS[form.status];
    const formName = language === 'he' ? form.form_name_he : form.form_name;

    return (
      <TouchableOpacity
        key={form.id}
        style={[
          sharedStyles.card,
          { marginBottom: 12, borderLeftWidth: 4, borderLeftColor: config.color },
        ]}
        onPress={() => handleStatusChange(form.id, formName, form.status)}
      >
        <View style={[getFlexDirection(isRTL), { alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={{ flex: 1 }}>
            <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
              {formName}
            </Text>
            <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginTop: 8, gap: 8 }]}>
              <View style={[sharedStyles.badge, { backgroundColor: config.bg }]}>
                <View style={[getFlexDirection(isRTL), { alignItems: 'center' }]}>
                  {config.icon}
                  <Text style={[sharedStyles.badgeText, getMarginStart(isRTL, 4), { color: config.color }]}>
                    {t(`forms.statuses.${form.status}`)}
                  </Text>
                </View>
              </View>
              {form.signed_at && (
                <Text style={sharedStyles.caption}>
                  {new Date(form.signed_at).toLocaleDateString()}
                </Text>
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
        title={t('nav.forms')}
        isRTL={isRTL}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Progress Stats */}
        {forms.length > 0 && (
          <View style={[sharedStyles.card, { marginBottom: 16 }]}>
            <Text style={[sharedStyles.title, getTextAlign(isRTL), { marginBottom: 12 }]}>
              Form Progress
            </Text>
            <View style={[getFlexDirection(isRTL), { justifyContent: 'space-around' }]}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.status.success.text }}>
                  {stats.approved}
                </Text>
                <Text style={sharedStyles.caption}>Approved</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.status.warning.text }}>
                  {stats.pending}
                </Text>
                <Text style={sharedStyles.caption}>Pending</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.status.info.text }}>
                  {stats.inProgress}
                </Text>
                <Text style={sharedStyles.caption}>In Progress</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.gray[500] }}>
                  {stats.total}
                </Text>
                <Text style={sharedStyles.caption}>Total</Text>
              </View>
            </View>
            {/* Progress Bar */}
            <View
              style={{
                height: 8,
                backgroundColor: colors.gray[200],
                borderRadius: 4,
                marginTop: 16,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%`,
                  backgroundColor: colors.status.success.text,
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={[sharedStyles.caption, { marginTop: 8, textAlign: 'center' }]}>
              {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}% Complete
            </Text>
          </View>
        )}

        {/* Initialize Forms Button (if no forms exist) */}
        {forms.length === 0 && !isLoading && (
          <TouchableOpacity
            style={[sharedStyles.primaryButton, getFlexDirection(isRTL), { marginBottom: 16 }]}
            onPress={handleInitializeForms}
            disabled={initializeForms.isPending}
          >
            {initializeForms.isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Plus size={20} color={colors.white} />
                <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
                  Initialize Required Forms
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Forms List */}
        {isLoading ? (
          <LoadingIndicator />
        ) : forms.length > 0 ? (
          <>
            <Text style={[sharedStyles.title, getTextAlign(isRTL), { marginBottom: 12 }]}>
              Required Forms ({forms.length})
            </Text>
            {forms.map(renderFormItem)}
          </>
        ) : (
          <EmptyState
            icon={<FileText size={48} color={colors.gray[300]} />}
            title={t('forms.noForms')}
            description="Click the button above to initialize all required forms for this project"
          />
        )}

        {/* Form Types Reference */}
        {forms.length === 0 && (
          <View style={[sharedStyles.card, { marginTop: 16 }]}>
            <Text style={[sharedStyles.title, getTextAlign(isRTL), { marginBottom: 12 }]}>
              Forms that will be created:
            </Text>
            {FORM_TYPES.map((formType, index) => (
              <View
                key={formType.type}
                style={[
                  getFlexDirection(isRTL),
                  {
                    paddingVertical: 8,
                    borderBottomWidth: index < FORM_TYPES.length - 1 ? 1 : 0,
                    borderBottomColor: colors.gray[100],
                  },
                ]}
              >
                <Text style={[sharedStyles.subtitle, { flex: 1 }, getTextAlign(isRTL)]}>
                  {index + 1}. {language === 'he' ? formType.name_he : formType.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
