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
import { z } from 'zod';
import { Picker } from '@react-native-picker/picker';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';

import { useLanguageStore } from '@/stores/useLanguageStore';
import { useCreateUser } from '@/hooks/useUsers';
import { SimpleHeader, Button, Section } from '@/components/ui';
import { UserRole } from '@/types/database.types';
import { colors } from '@/styles';

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  role: z.enum(['administrator', 'manager', 'office_staff', 'field_technician', 'viewer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function NewUserScreen() {
  const { t } = useTranslation();
  const { isRTL } = useLanguageStore();
  const createUser = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      phone: '',
      role: 'viewer',
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser.mutateAsync({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone || null,
        role: data.role as UserRole,
      });
      Alert.alert(
        t('common.success'),
        t('users.createSuccess'),
        [{ text: t('common.confirm'), onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.general'));
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

  const roles: UserRole[] = ['administrator', 'manager', 'office_staff', 'field_technician', 'viewer'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['bottom']}>
      <SimpleHeader title={t('users.addUser')} onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Section title={t('users.userDetails')}>
            {/* Full Name */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
                {t('users.fullName')} *
              </Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}>
                  <User size={20} color="#f97316" />
                </View>
                <Controller
                  control={control}
                  name="full_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={errors.full_name ? errorInputStyle : inputStyle}
                      placeholder={t('users.fullName')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.full_name && (
                <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
                  {errors.full_name.message}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
                {t('users.email')} *
              </Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}>
                  <Mail size={20} color="#f97316" />
                </View>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={errors.email ? errorInputStyle : inputStyle}
                      placeholder={t('users.email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
              {errors.email && (
                <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Phone */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
                {t('users.phone')}
              </Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}>
                  <Phone size={20} color="#f97316" />
                </View>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyle}
                      placeholder={t('users.phone')}
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
              </View>
            </View>

            {/* Role */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
                {t('users.role')} *
              </Text>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: colors.white }}>
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={{ height: 50 }}
                    >
                      {roles.map((role) => (
                        <Picker.Item
                          key={role}
                          label={t(`users.roles.${role}`)}
                          value={role}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
              <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
                {t(`users.roleDescriptions.${control._formValues.role}`)}
              </Text>
            </View>

            {/* Password */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
                {t('users.password')} *
              </Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}>
                  <Lock size={20} color="#f97316" />
                </View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ flex: 1, position: 'relative' }}>
                      <TextInput
                        style={errors.password ? errorInputStyle : inputStyle}
                        placeholder={t('users.password')}
                        secureTextEntry={!showPassword}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <View style={{ position: 'absolute', right: isRTL ? undefined : 12, left: isRTL ? 12 : undefined, top: 12 }}>
                        {showPassword ? (
                          <EyeOff size={20} color="#6b7280" onPress={() => setShowPassword(false)} />
                        ) : (
                          <Eye size={20} color="#6b7280" onPress={() => setShowPassword(true)} />
                        )}
                      </View>
                    </View>
                  )}
                />
              </View>
              {errors.password && (
                <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, textAlign: isRTL ? 'right' : 'left' }}>
                {t('users.confirmPassword')} *
              </Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center', marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}>
                  <Lock size={20} color="#f97316" />
                </View>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ flex: 1, position: 'relative' }}>
                      <TextInput
                        style={errors.confirmPassword ? errorInputStyle : inputStyle}
                        placeholder={t('users.confirmPassword')}
                        secureTextEntry={!showConfirmPassword}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      <View style={{ position: 'absolute', right: isRTL ? undefined : 12, left: isRTL ? 12 : undefined, top: 12 }}>
                        {showConfirmPassword ? (
                          <EyeOff size={20} color="#6b7280" onPress={() => setShowConfirmPassword(false)} />
                        ) : (
                          <Eye size={20} color="#6b7280" onPress={() => setShowConfirmPassword(true)} />
                        )}
                      </View>
                    </View>
                  )}
                />
              </View>
              {errors.confirmPassword && (
                <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, textAlign: isRTL ? 'right' : 'left' }}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            <Button
              title={t('common.create')}
              onPress={handleSubmit(onSubmit)}
              isLoading={createUser.isPending}
              fullWidth
              isRTL={isRTL}
            />
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
