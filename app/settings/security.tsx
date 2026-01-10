import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff } from 'lucide-react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations/auth';
import { SimpleHeader, Button, Section } from '@/components/ui';

export default function SecuritySettingsScreen() {
  const { t } = useTranslation();
  const { changePassword, isLoading } = useAuthStore();
  const { isRTL } = useLanguageStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword(data.currentPassword, data.password);
      Alert.alert(
        t('common.success'),
        t('security.passwordChanged'),
        [{ text: t('common.confirm'), onPress: () => router.back() }]
      );
      reset();
    } catch (error) {
      const message = error instanceof Error && error.message.includes('incorrect')
        ? t('security.incorrectCurrentPassword')
        : t('security.passwordChangeError');
      Alert.alert(t('common.error'), message);
    }
  };

  const inputStyle = {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: isRTL ? 'right' as const : 'left' as const,
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ef4444',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['bottom']}>
      <SimpleHeader title={t('security.title')} onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Section title={t('security.changePassword')}>
            {/* Current Password */}
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
                {t('security.currentPassword')}
              </Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: '#fff7ed',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: isRTL ? 0 : 8,
                    marginLeft: isRTL ? 8 : 0,
                  }}
                >
                  <Lock size={20} color="#f97316" />
                </View>
                <Controller
                  control={control}
                  name="currentPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ flex: 1, position: 'relative' }}>
                      <TextInput
                        style={errors.currentPassword ? errorInputStyle : inputStyle}
                        placeholder={t('security.currentPassword')}
                        secureTextEntry={!showCurrentPassword}
                        autoComplete="password"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          right: isRTL ? undefined : 12,
                          left: isRTL ? 12 : undefined,
                          top: 12,
                        }}
                      >
                        {showCurrentPassword ? (
                          <EyeOff
                            size={20}
                            color="#6b7280"
                            onPress={() => setShowCurrentPassword(false)}
                          />
                        ) : (
                          <Eye
                            size={20}
                            color="#6b7280"
                            onPress={() => setShowCurrentPassword(true)}
                          />
                        )}
                      </View>
                    </View>
                  )}
                />
              </View>
              {errors.currentPassword && (
                <Text
                  style={{
                    color: '#ef4444',
                    fontSize: 12,
                    marginTop: 4,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {errors.currentPassword.message}
                </Text>
              )}
            </View>

            {/* New Password */}
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
                {t('security.newPassword')}
              </Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: '#fff7ed',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: isRTL ? 0 : 8,
                    marginLeft: isRTL ? 8 : 0,
                  }}
                >
                  <Lock size={20} color="#f97316" />
                </View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ flex: 1, position: 'relative' }}>
                      <TextInput
                        style={errors.password ? errorInputStyle : inputStyle}
                        placeholder={t('security.newPassword')}
                        secureTextEntry={!showNewPassword}
                        autoComplete="new-password"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          right: isRTL ? undefined : 12,
                          left: isRTL ? 12 : undefined,
                          top: 12,
                        }}
                      >
                        {showNewPassword ? (
                          <EyeOff
                            size={20}
                            color="#6b7280"
                            onPress={() => setShowNewPassword(false)}
                          />
                        ) : (
                          <Eye
                            size={20}
                            color="#6b7280"
                            onPress={() => setShowNewPassword(true)}
                          />
                        )}
                      </View>
                    </View>
                  )}
                />
              </View>
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

            {/* Confirm New Password */}
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
                {t('security.confirmNewPassword')}
              </Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: '#fff7ed',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: isRTL ? 0 : 8,
                    marginLeft: isRTL ? 8 : 0,
                  }}
                >
                  <Lock size={20} color="#f97316" />
                </View>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ flex: 1, position: 'relative' }}>
                      <TextInput
                        style={errors.confirmPassword ? errorInputStyle : inputStyle}
                        placeholder={t('security.confirmNewPassword')}
                        secureTextEntry={!showConfirmPassword}
                        autoComplete="new-password"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          right: isRTL ? undefined : 12,
                          left: isRTL ? 12 : undefined,
                          top: 12,
                        }}
                      >
                        {showConfirmPassword ? (
                          <EyeOff
                            size={20}
                            color="#6b7280"
                            onPress={() => setShowConfirmPassword(false)}
                          />
                        ) : (
                          <Eye
                            size={20}
                            color="#6b7280"
                            onPress={() => setShowConfirmPassword(true)}
                          />
                        )}
                      </View>
                    </View>
                  )}
                />
              </View>
              {errors.confirmPassword && (
                <Text
                  style={{
                    color: '#ef4444',
                    fontSize: 12,
                    marginTop: 4,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            {/* Password Requirements */}
            <View
              style={{
                backgroundColor: '#f0f9ff',
                padding: 12,
                borderRadius: 8,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#0369a1',
                  textAlign: isRTL ? 'right' : 'left',
                  lineHeight: 18,
                }}
              >
                {t('validation.minLength', { min: 8 })}
                {'\n'}• Must contain uppercase letter
                {'\n'}• Must contain lowercase letter
                {'\n'}• Must contain a number
              </Text>
            </View>

            {/* Submit Button */}
            <Button
              title={t('security.updatePassword')}
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              fullWidth
              isRTL={isRTL}
            />
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
