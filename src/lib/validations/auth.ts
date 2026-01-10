import { z } from 'zod';
import { field, password, withPasswordConfirmation } from './builders';

export const loginSchema = z.object({
  email: field.emailRequired(),
  password: password.required(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signUpSchema = withPasswordConfirmation(
  z.object({
    email: field.emailRequired(),
    password: password.strong(),
    confirmPassword: password.confirm(),
    fullName: field.required('Full name', 100),
  })
);

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const resetPasswordSchema = z.object({
  email: field.emailRequired(),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const newPasswordSchema = withPasswordConfirmation(
  z.object({
    password: password.strong(),
    confirmPassword: password.confirm(),
  })
);

export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

export const changePasswordSchema = withPasswordConfirmation(
  z.object({
    currentPassword: password.required(),
    password: password.strong(),
    confirmPassword: password.confirm(),
  })
);

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
