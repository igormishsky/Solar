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
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { signUp, isLoading } = useAuthStore();
  const { isRTL } = useLanguageStore();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    try {
      await signUp(data.email, data.password, data.fullName);
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
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#fff7ed',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Sun size={36} color="#f97316" />
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 4,
            }}
          >
            {t('auth.createAccount')}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>
            {t('app.name')}
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

        {/* Full Name Input */}
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
            {t('auth.fullName')}
          </Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: errors.fullName ? '#ef4444' : '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlign: isRTL ? 'right' : 'left',
                }}
                placeholder={t('auth.fullName')}
                autoCapitalize="words"
                autoComplete="name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.fullName?.message && (
            <Text
              style={{
                color: '#ef4444',
                fontSize: 12,
                marginTop: 4,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {String(errors.fullName.message)}
            </Text>
          )}
        </View>

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
          {errors.email?.message && (
            <Text
              style={{
                color: '#ef4444',
                fontSize: 12,
                marginTop: 4,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {String(errors.email.message)}
            </Text>
          )}
        </View>

        {/* Password Input */}
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
                autoComplete="new-password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password?.message && (
            <Text
              style={{
                color: '#ef4444',
                fontSize: 12,
                marginTop: 4,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {String(errors.password.message)}
            </Text>
          )}
        </View>

        {/* Confirm Password Input */}
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
            {t('auth.confirmPassword')}
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: errors.confirmPassword ? '#ef4444' : '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  textAlign: isRTL ? 'right' : 'left',
                }}
                placeholder={t('auth.confirmPassword')}
                secureTextEntry
                autoComplete="new-password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.confirmPassword?.message && (
            <Text
              style={{
                color: '#ef4444',
                fontSize: 12,
                marginTop: 4,
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {String(errors.confirmPassword.message)}
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
              {t('auth.signUp')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Text style={{ color: '#6b7280' }}>{t('auth.alreadyHaveAccount')}</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={{ color: '#f97316', fontWeight: '600' }}>
                {t('auth.signIn')}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
