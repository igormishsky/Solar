import { z } from 'zod';

/**
 * Reusable validation schema builders to reduce duplication
 * across form validation schemas.
 */

// String field builders
export const field = {
  /**
   * Required string with min/max length
   */
  required: (name: string, max = 100) =>
    z
      .string()
      .min(1, `${name} is required`)
      .max(max, `${name} must be ${max} characters or less`),

  /**
   * Optional string with max length
   */
  optional: (max = 100) =>
    z
      .string()
      .max(max, `Must be ${max} characters or less`)
      .optional(),

  /**
   * Optional string that can also be empty string
   */
  optionalOrEmpty: (max = 100) =>
    z
      .string()
      .max(max, `Must be ${max} characters or less`)
      .optional()
      .or(z.literal('')),

  /**
   * Email field - optional by default, allows empty string
   */
  email: () =>
    z
      .string()
      .email('Invalid email address')
      .optional()
      .or(z.literal('')),

  /**
   * Required email field
   */
  emailRequired: () =>
    z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),

  /**
   * Israeli ID number (9 digits)
   */
  idNumber: () =>
    z
      .string()
      .regex(/^\d{9}$/, 'ID number must be 9 digits')
      .optional()
      .or(z.literal('')),

  /**
   * Phone number field
   */
  phone: (min = 9, max = 15) =>
    z
      .string()
      .min(min, `Phone number must be at least ${min} digits`)
      .max(max, `Phone number must be ${max} characters or less`),

  /**
   * Optional phone number
   */
  phoneOptional: (max = 15) =>
    z
      .string()
      .max(max, `Phone number must be ${max} characters or less`)
      .optional()
      .or(z.literal('')),

  /**
   * UUID field
   */
  uuid: (name = 'ID') => z.string().uuid(`Invalid ${name}`),

  /**
   * Optional UUID field
   */
  uuidOptional: (name = 'ID') =>
    z.string().uuid(`Invalid ${name}`).optional().nullable(),

  /**
   * URL field - optional, allows empty string
   */
  url: () =>
    z.string().url('Invalid URL').optional().or(z.literal('')),

  /**
   * Date string field - optional
   */
  date: () => z.string().optional().nullable(),

  /**
   * Notes/description with max length
   */
  notes: (max = 1000) =>
    z
      .string()
      .max(max, `Must be ${max} characters or less`)
      .optional(),

  /**
   * Query string for search schemas
   */
  query: () => z.string().optional(),
};

// Password builders
export const password = {
  /**
   * Basic required password
   */
  required: (min = 8) =>
    z
      .string()
      .min(1, 'Password is required')
      .min(min, `Password must be at least ${min} characters`),

  /**
   * Strong password with complexity requirements
   */
  strong: (min = 8) =>
    z
      .string()
      .min(1, 'Password is required')
      .min(min, `Password must be at least ${min} characters`)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),

  /**
   * Confirm password field
   */
  confirm: () => z.string().min(1, 'Please confirm your password'),
};

// Number builders
export const num = {
  /**
   * Positive number
   */
  positive: (name: string) =>
    z.number().positive(`${name} must be positive`).optional(),

  /**
   * Positive integer
   */
  positiveInt: (name: string) =>
    z.number().int().positive(`${name} must be a positive integer`).optional(),
};

// Common enum definitions for reuse
export const enums = {
  customerType: z.enum(['private', 'business', 'institutional']),
  projectStatus: z.enum(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled']),
  taskStatus: z.enum(['pending', 'in_progress', 'completed']),
  taskPriority: z.enum(['low', 'medium', 'high', 'urgent']),
  installationStage: z.enum([
    'request_opened',
    'payment_processed',
    'department_response',
    'sync_compliance_request',
    'sync_request',
    'sync_complete',
    'commercial_activation',
    'standing_order_form',
  ]),
  professionalType: z.enum([
    'installing_company',
    'installing_contractor',
    'planner',
    'inspecting_electrician',
    'constructor',
  ]),
};

/**
 * Helper to add password confirmation refinement
 */
export const withPasswordConfirmation = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (data: { password: string; confirmPassword: string }) =>
      data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  );
