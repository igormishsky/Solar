/**
 * Modal ID constants for type-safe modal management.
 * Use these constants instead of magic strings when opening/checking modals.
 */
export const ModalId = {
  // Customer modals
  CUSTOMER_FORM: 'customer-form',
  CUSTOMER_DELETE: 'customer-delete',
  CUSTOMER_VIEW: 'customer-view',

  // Project modals
  PROJECT_FORM: 'project-form',
  PROJECT_DELETE: 'project-delete',
  PROJECT_VIEW: 'project-view',
  PROJECT_STAGE: 'project-stage',

  // Task modals
  TASK_FORM: 'task-form',
  TASK_DELETE: 'task-delete',
  TASK_VIEW: 'task-view',

  // Professional modals
  PROFESSIONAL_FORM: 'professional-form',
  PROFESSIONAL_DELETE: 'professional-delete',
  PROFESSIONAL_VIEW: 'professional-view',

  // Document modals
  DOCUMENT_UPLOAD: 'document-upload',
  DOCUMENT_VIEW: 'document-view',

  // Settings modals
  SETTINGS_PROFILE: 'settings-profile',
  SETTINGS_PASSWORD: 'settings-password',

  // Confirmation modals
  CONFIRM_ACTION: 'confirm-action',
} as const;

export type ModalIdType = (typeof ModalId)[keyof typeof ModalId];
