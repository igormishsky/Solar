import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Globe,
  Bell,
  User,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

import { useAuthStore, useProfile } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

function SettingItem({
  icon,
  title,
  value,
  onPress,
  showChevron = true,
  rightElement,
}: SettingItemProps) {
  const { isRTL } = useLanguageStore();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#fff7ed',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: isRTL ? 0 : 12,
          marginLeft: isRTL ? 12 : 0,
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#1f2937',
            textAlign: isRTL ? 'right' : 'left',
          }}
        >
          {title}
        </Text>
        {value && (
          <Text
            style={{
              fontSize: 14,
              color: '#6b7280',
              marginTop: 2,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {value}
          </Text>
        )}
      </View>
      {rightElement || (showChevron && onPress && (
        <ChevronRight
          size={20}
          color="#9ca3af"
          style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
        />
      ))}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuthStore();
  const profile = useProfile();
  const { language, toggleLanguage, isRTL } = useLanguageStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profile Section */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#fff7ed',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: isRTL ? 0 : 16,
                marginLeft: isRTL ? 16 : 0,
              }}
            >
              <User size={32} color="#f97316" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#1f2937',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {profile?.full_name || t('nav.profile')}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#6b7280',
                  marginTop: 4,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {profile?.email}
              </Text>
              <View
                style={{
                  marginTop: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                  backgroundColor: '#eff6ff',
                  alignSelf: isRTL ? 'flex-end' : 'flex-start',
                }}
              >
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500' }}>
                  {profile?.role || 'viewer'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: 8,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t('settings.title')}
          </Text>

          <SettingItem
            icon={<Globe size={20} color="#f97316" />}
            title={t('settings.language')}
            value={language === 'he' ? 'עברית' : 'English'}
            onPress={toggleLanguage}
          />

          <SettingItem
            icon={<Bell size={20} color="#f97316" />}
            title={t('settings.notifications')}
            showChevron={false}
            rightElement={<Switch value={true} trackColor={{ true: '#f97316' }} />}
          />

          <SettingItem
            icon={<Shield size={20} color="#f97316" />}
            title={t('settings.security')}
            onPress={() => {}}
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <LogOut size={20} color="#dc2626" />
          <Text
            style={{
              color: '#dc2626',
              fontSize: 16,
              fontWeight: '600',
              marginLeft: isRTL ? 0 : 8,
              marginRight: isRTL ? 8 : 0,
            }}
          >
            {t('auth.logout')}
          </Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={{ alignItems: 'center', marginTop: 32, paddingBottom: 32 }}>
          <Text style={{ fontSize: 14, color: '#9ca3af' }}>{t('app.name')}</Text>
          <Text style={{ fontSize: 12, color: '#d1d5db', marginTop: 4 }}>
            v1.0.0
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: '#d1d5db',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            {t('app.copyright', { year: new Date().getFullYear() })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
