import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, FileText, Shield, ChevronRight } from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { SimpleHeader } from '@/components/ui';
import {
  sharedStyles,
  colors,
  getFlexDirection,
  getTextAlign,
  getMarginStart,
} from '@/styles';

export default function AdminScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isRTL } = useLanguageStore();
  const { user } = useAuthStore();

  // Only administrators can access this page
  if (user?.role !== 'administrator') {
    return (
      <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
        <SimpleHeader title={t('admin.title')} onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Shield size={48} color={colors.gray[400]} />
          <Text style={[sharedStyles.emptyStateText, { marginTop: 16 }]}>
            {t('errors.unauthorized')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const adminSections = [
    {
      id: 'users',
      title: t('admin.userManagement'),
      description: t('users.title'),
      icon: Users,
      route: '/admin/users',
      color: colors.primary,
      bgColor: '#fff7ed',
    },
    {
      id: 'audit',
      title: t('admin.auditLogs'),
      description: t('audit.title'),
      icon: FileText,
      route: '/admin/audit',
      color: '#0369a1',
      bgColor: '#f0f9ff',
    },
  ];

  return (
    <SafeAreaView style={sharedStyles.pageContainer} edges={['bottom']}>
      <SimpleHeader title={t('admin.title')} onBack={() => router.back()} />

      <ScrollView style={sharedStyles.pageContent}>
        {adminSections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[sharedStyles.card, { marginBottom: 12 }]}
            onPress={() => router.push(section.route as never)}
          >
            <View style={[getFlexDirection(isRTL), { justifyContent: 'space-between', alignItems: 'center' }]}>
              <View style={[getFlexDirection(isRTL), { alignItems: 'center', flex: 1 }]}>
                <View
                  style={[
                    sharedStyles.iconContainer,
                    getMarginStart(isRTL, 12),
                    { backgroundColor: section.bgColor },
                  ]}
                >
                  <section.icon size={24} color={section.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[sharedStyles.title, getTextAlign(isRTL)]}>
                    {section.title}
                  </Text>
                  <Text style={[sharedStyles.subtitle, getTextAlign(isRTL), { marginTop: 2 }]}>
                    {section.description}
                  </Text>
                </View>
              </View>
              <ChevronRight
                size={20}
                color={colors.gray[400]}
                style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
