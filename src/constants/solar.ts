import { InstallationStage, FormStatus, ProfessionalType, ProjectStatus, TaskStatus, TaskPriority } from '@/types/database.types';

/**
 * Installation stages for solar projects per IEC (Israel Electric Corporation) requirements.
 * These stages represent the progression of a solar installation from initial request to activation.
 */
export const INSTALLATION_STAGES: InstallationStage[] = [
  'request_opened',
  'payment_processed',
  'department_response',
  'sync_compliance_request',
  'sync_request',
  'sync_complete',
  'commercial_activation',
  'standing_order_form',
] as const;

/**
 * Form types required for Israeli solar installation projects.
 * Each form includes English and Hebrew names as per regulatory requirements.
 */
export const FORM_TYPES = [
  { type: 'layout_plan', name: 'Layout Plan + Grounding', name_he: 'תכנית פריסה + הארקות' },
  { type: 'pv_agreement', name: 'PV Agreement', name_he: 'הסכם PV' },
  { type: 'electrician_declaration', name: 'Executing Electrician Declaration', name_he: 'הצהרת חשמלאי מבצע' },
  { type: 'installation_submission', name: 'Installation Submission for Inspection', name_he: 'הגשת ההתקנה לביקורת' },
  { type: 'inverter_calibration', name: 'Inverter Calibration Affidavit', name_he: 'תצהיר כיול ממיר' },
  { type: 'constructor_approval', name: 'Constructor Approval', name_he: 'אישור קונסטרוקטור' },
  { type: 'regulation_24', name: 'Installation Declaration per Regulation 24', name_he: 'הצהרת התקנה לפי תקנה 24' },
  { type: 'pv_inspection', name: 'PV Installation Inspection Form', name_he: 'טופס ביקורת התקנת PV' },
  { type: 'form_1400', name: 'Form 1400', name_he: 'טופס 1400' },
  { type: 'permit_exempt', name: 'Permit-Exempt Work Report', name_he: 'דוח עבודה פטורה מהיתר' },
  { type: 'threshold_compliance', name: 'Central Form for Threshold Compliance', name_he: 'טופס מרכזי לעמידה בסף' },
] as const;

export type FormType = typeof FORM_TYPES[number]['type'];

/**
 * Professional types involved in solar installation projects.
 */
export const PROFESSIONAL_TYPES: ProfessionalType[] = [
  'installing_company',
  'installing_contractor',
  'planner',
  'inspecting_electrician',
  'constructor',
] as const;

/**
 * Project status values.
 */
export const PROJECT_STATUSES: ProjectStatus[] = [
  'pending',
  'in_progress',
  'completed',
  'on_hold',
  'cancelled',
] as const;

/**
 * Task status values.
 */
export const TASK_STATUSES: TaskStatus[] = [
  'pending',
  'in_progress',
  'completed',
] as const;

/**
 * Task priority values.
 */
export const TASK_PRIORITIES: TaskPriority[] = [
  'low',
  'medium',
  'high',
  'urgent',
] as const;

/**
 * Form status values.
 */
export const FORM_STATUSES: FormStatus[] = [
  'draft',
  'review',
  'signature_pending',
  'submitted',
  'approved',
  'rejected',
] as const;

/**
 * Customer type values.
 */
export const CUSTOMER_TYPES = [
  'private',
  'business',
  'institutional',
] as const;

export type CustomerType = typeof CUSTOMER_TYPES[number];

/**
 * Days before license expiry to show warning.
 */
export const LICENSE_EXPIRY_WARNING_DAYS = 30;

/**
 * Default pagination settings.
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;
