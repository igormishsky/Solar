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
  FolderKanban,
  User,
  Phone,
  Mail,
  Calendar,
  Zap,
  CheckCircle2,
  Users,
  FileText,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useProject, useUpdateInstallationStage, useDeleteProject } from '@/hooks';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
  getStatusColors,
} from '@/styles';
import {
  Section,
  Field,
  SimpleHeader,
  LoadingScreen,
  ErrorScreen,
  InfoRow,
} from '@/components';
import { INSTALLATION_STAGES } from '@/constants';
import { InstallationStage } from '@/types/database.types';

// Types for project relations
interface InstallationStageData {
  id: string;
  stage: InstallationStage;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

interface ProfessionalData {
  name: string;
  professional_type: string;
  phone: string | null;
}

interface ProjectProfessionalData {
  id: string;
  role: string | null;
  professionals: ProfessionalData | null;
}

type StageItemProps = {
  stage: InstallationStage;
  stageData?: {
    id: string;
    completed: boolean;
    completed_at: string | null;
    notes: string | null;
  };
  index: number;
  isRTL: boolean;
  onToggle: () => void;
  t: (key: string) => string;
};

function StageItem({ stage, stageData, index, isRTL, onToggle, t }: StageItemProps) {
  const isCompleted = stageData?.completed || false;

  return (
    <TouchableOpacity
      style={[
        getFlexDirection(isRTL),
        {
          padding: 12,
          backgroundColor: isCompleted ? colors.status.success.bg : colors.gray[50],
          borderRadius: 8,
          marginBottom: 8,
          alignItems: 'center',
        },
      ]}
      onPress={onToggle}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: isCompleted ? colors.status.success.text : colors.gray[300],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isCompleted ? (
          <CheckCircle2 size={18} color={colors.white} />
        ) : (
          <Text style={{ color: colors.white, fontWeight: '600' }}>{index + 1}</Text>
        )}
      </View>
      <View style={[{ flex: 1 }, getMarginStart(isRTL, 12)]}>
        <Text
          style={[
            sharedStyles.title,
            getTextAlign(isRTL),
            { color: isCompleted ? colors.status.success.text : colors.gray[700] },
          ]}
        >
          {t(`projects.stages.${stage}`)}
        </Text>
        {stageData?.completed_at && (
          <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
            {new Date(stageData.completed_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();

  const { data: project, isLoading, error } = useProject(id);
  const updateStage = useUpdateInstallationStage();
  const deleteProject = useDeleteProject();

  const handleToggleStage = async (stage: InstallationStage, currentlyCompleted: boolean) => {
    try {
      await updateStage.mutateAsync({
        projectId: id,
        stage,
        completed: !currentlyCompleted,
      });
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.general'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.confirm'),
      'Are you sure you want to delete this project?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject.mutateAsync(id);
              router.back();
            } catch (err) {
              Alert.alert(t('common.error'), t('errors.general'));
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !project) {
    return <ErrorScreen message={t('errors.notFound')} />;
  }

  const statusColors = getStatusColors(project.status);
  const stagesMap = new Map(
    (project.installation_stages as InstallationStageData[] | undefined)?.map((s) => [s.stage, s])
  );

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['top']}>
      <SimpleHeader
        title={t('projects.projectDetails')}
        isRTL={isRTL}
        rightContent={
          <TouchableOpacity onPress={handleDelete}>
            <Trash2 size={24} color={colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Project Header Card */}
        <View style={[sharedStyles.card, { marginBottom: 16 }]}>
          <View style={[getFlexDirection(isRTL), { alignItems: 'center', marginBottom: 12 }]}>
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
              <FolderKanban size={32} color={colors.primary} />
            </View>
            <View style={[{ flex: 1 }, getMarginStart(isRTL, 16)]}>
              <Text style={[sharedStyles.title, getTextAlign(isRTL), { fontSize: 20 }]}>
                {project.name}
              </Text>
              <View style={[getFlexDirection(isRTL), { marginTop: 8, gap: 8 }]}>
                <View style={[sharedStyles.badge, { backgroundColor: statusColors.bg }]}>
                  <Text style={[sharedStyles.badgeText, { color: statusColors.text }]}>
                    {t(`projects.statuses.${project.status}`)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {project.description && (
            <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
              {project.description}
            </Text>
          )}
        </View>

        {/* Customer Info */}
        {project.customers && (
          <TouchableOpacity
            onPress={() => router.push(`/customer/${project.customers.id}`)}
          >
            <Section
              title={t('tasks.relatedCustomer')}
              icon={<User size={20} color={colors.primary} />}
              isRTL={isRTL}
            >
              <View style={[getFlexDirection(isRTL), { alignItems: 'center', justifyContent: 'space-between' }]}>
                <View>
                  <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
                    {project.customers.first_name} {project.customers.last_name}
                  </Text>
                  {project.customers.phone_primary && (
                    <InfoRow
                      icon={<Phone size={14} color={colors.gray[400]} />}
                      text={project.customers.phone_primary}
                      isRTL={isRTL}
                    />
                  )}
                  {project.customers.email && (
                    <InfoRow
                      icon={<Mail size={14} color={colors.gray[400]} />}
                      text={project.customers.email}
                      isRTL={isRTL}
                    />
                  )}
                </View>
                <ChevronRight
                  size={20}
                  color={colors.gray[400]}
                  style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                />
              </View>
            </Section>
          </TouchableOpacity>
        )}

        {/* System Specifications */}
        <Section
          title={t('projects.systemSpecs')}
          icon={<Zap size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <Field
                label={t('projects.systemSize')}
                value={project.system_size_kw ? `${project.system_size_kw} kW` : null}
                isRTL={isRTL}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label={t('projects.panelCount')}
                value={project.panel_count}
                isRTL={isRTL}
              />
            </View>
          </View>
          <Field
            label={t('projects.inverterModel')}
            value={project.inverter_model}
            isRTL={isRTL}
          />
          <Field
            label={t('projects.estimatedProduction')}
            value={project.estimated_annual_production ? `${project.estimated_annual_production} kWh` : null}
            isRTL={isRTL}
          />
        </Section>

        {/* Timeline */}
        <Section
          title={t('projects.timeline')}
          icon={<Calendar size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <View style={[getFlexDirection(isRTL), { gap: 12 }]}>
            <View style={{ flex: 1 }}>
              <Field
                label={t('projects.startDate')}
                value={project.start_date ? new Date(project.start_date).toLocaleDateString() : null}
                isRTL={isRTL}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label={t('projects.estimatedCompletion')}
                value={project.estimated_completion_date ? new Date(project.estimated_completion_date).toLocaleDateString() : null}
                isRTL={isRTL}
              />
            </View>
          </View>
          {project.actual_completion_date && (
            <Field
              label={t('projects.actualCompletion')}
              value={new Date(project.actual_completion_date).toLocaleDateString()}
              isRTL={isRTL}
            />
          )}
        </Section>

        {/* Installation Stages */}
        <Section
          title={t('projects.currentStage')}
          icon={<CheckCircle2 size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          {INSTALLATION_STAGES.map((stage, index) => (
            <StageItem
              key={stage}
              stage={stage}
              stageData={stagesMap.get(stage)}
              index={index}
              isRTL={isRTL}
              onToggle={() => handleToggleStage(stage, stagesMap.get(stage)?.completed || false)}
              t={t}
            />
          ))}
        </Section>

        {/* Assigned Professionals */}
        <Section
          title={t('projects.assignedProfessionals')}
          icon={<Users size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          {project.project_professionals && project.project_professionals.length > 0 ? (
            (project.project_professionals as ProjectProfessionalData[]).map((pp) => (
              <View
                key={pp.id}
                style={[
                  getFlexDirection(isRTL),
                  {
                    padding: 12,
                    backgroundColor: colors.gray[50],
                    borderRadius: 8,
                    marginBottom: 8,
                    alignItems: 'center',
                  },
                ]}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.primaryLight,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <User size={20} color={colors.primary} />
                </View>
                <View style={[{ flex: 1 }, getMarginStart(isRTL, 12)]}>
                  <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
                    {pp.professionals?.name}
                  </Text>
                  <Text style={[sharedStyles.caption, getTextAlign(isRTL)]}>
                    {pp.role || t(`professionals.types.${pp.professionals?.professional_type}`)}
                  </Text>
                  {pp.professionals?.phone && (
                    <InfoRow
                      icon={<Phone size={12} color={colors.gray[400]} />}
                      text={pp.professionals.phone}
                      isRTL={isRTL}
                    />
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={[sharedStyles.subtitle, getTextAlign(isRTL)]}>
              {t('professionals.noProfessionals')}
            </Text>
          )}
        </Section>

        {/* Documents & Forms Section */}
        <Section
          title={t('nav.documents')}
          icon={<FileText size={20} color={colors.primary} />}
          isRTL={isRTL}
        >
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              style={[sharedStyles.primaryButton, getFlexDirection(isRTL)]}
              onPress={() => router.push(`/project/${id}/documents`)}
            >
              <FileText size={20} color={colors.white} />
              <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
                {t('nav.documents')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                sharedStyles.primaryButton,
                getFlexDirection(isRTL),
                { backgroundColor: colors.status.info.text },
              ]}
              onPress={() => router.push(`/project/${id}/forms`)}
            >
              <FileText size={20} color={colors.white} />
              <Text style={[sharedStyles.primaryButtonText, getMarginStart(isRTL, 8)]}>
                {t('nav.forms')}
              </Text>
            </TouchableOpacity>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
