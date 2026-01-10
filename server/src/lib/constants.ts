/**
 * Shared constants for server routes.
 * Mirrors client-side constants for consistency.
 */

/**
 * Installation stages for solar projects per IEC requirements.
 */
export const INSTALLATION_STAGES = [
  'request_opened',
  'payment_processed',
  'department_response',
  'sync_compliance_request',
  'sync_request',
  'sync_complete',
  'commercial_activation',
  'standing_order_form',
] as const;

export type InstallationStage = typeof INSTALLATION_STAGES[number];

/**
 * Form types required for Israeli solar installation projects.
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
 * Professional types.
 */
export const PROFESSIONAL_TYPES = [
  'installing_company',
  'installing_contractor',
  'planner',
  'inspecting_electrician',
  'constructor',
] as const;

export type ProfessionalType = typeof PROFESSIONAL_TYPES[number];

/**
 * Default pagination settings.
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
} as const;
