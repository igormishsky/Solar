import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sun } from 'lucide-react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, isLoading } = useAuthStore();
  const { language, toggleLanguage, isRTL } = useLanguageStore();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await signIn(data.email, data.password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(t('errors.general'));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
        }}
      >
        {/* Language Toggle */}
        <TouchableOpacity
          onPress={toggleLanguage}
          style={{
            position: 'absolute',
            top: 60,
            right: isRTL ? undefined : 24,
            left: isRTL ? 24 : undefined,
            padding: 8,
          }}
        >
          <Text style={{ color: '#f97316', fontSize: 16, fontWeight: '600' }}>
            {language === 'he' ? 'EN' : 'עב'}
          </Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#fff7ed',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Sun size={48} color="#f97316" />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 8,
            }}
          >
            {t('app.name')}
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>
            {t('auth.signInToContinue')}
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View
            style={{
              backgroundColor: '#fef2f2',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#dc2626', textAlign: 'center' }}>{error}</Text>
          </View>
        )}

        {/* Email Input */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 8,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t('auth.email')}
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: errors.email ? '#ef4444' : '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlign: isRTL ? 'right' : 'left',
                }}
                placeholder={t('auth.email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text
              style={{
                color: '#ef4444',
                fontSize: 12,
                marginTop: 4,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 8,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {t('auth.password')}
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: errors.password ? '#ef4444' : '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlign: isRTL ? 'right' : 'left',
                }}
                placeholder={t('auth.password')}
                secureTextEntry
                autoComplete="password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text
              style={{
                color: '#ef4444',
                fontSize: 12,
                marginTop: 4,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          style={{
            backgroundColor: '#f97316',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 16,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              {t('auth.signIn')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Text style={{ color: '#6b7280' }}>{t('auth.dontHaveAccount')}</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={{ color: '#f97316', fontWeight: '600' }}>
                {t('auth.signUp')}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
