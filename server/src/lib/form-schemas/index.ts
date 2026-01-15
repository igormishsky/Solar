import { z } from 'zod';

// Common field types used across forms
export const commonFields = {
  // Customer information
  customerName: z.string().min(1, 'Customer name is required'),
  customerId: z.string().min(9, 'Valid ID number is required').max(9),
  customerPhone: z.string().min(9, 'Valid phone number is required'),
  customerEmail: z.string().email('Valid email is required').optional(),
  customerAddress: z.object({
    city: z.string().min(1),
    street: z.string().min(1),
    number: z.string().min(1),
    apartment: z.string().optional(),
    postalCode: z.string().optional(),
  }),

  // Property information
  propertyAddress: z.object({
    city: z.string().min(1),
    street: z.string().min(1),
    number: z.string().min(1),
    block: z.string().optional(),
    parcel: z.string().optional(),
    subParcel: z.string().optional(),
  }),

  // IEC information
  iecInfo: z.object({
    contractNumber: z.string().optional(),
    orderNumber: z.string().optional(),
    meterNumber: z.string().optional(),
    networkDivision: z.string().optional(),
  }),

  // System specifications
  systemSpecs: z.object({
    systemSizeKw: z.number().positive(),
    panelCount: z.number().int().positive(),
    panelModel: z.string().optional(),
    inverterModel: z.string().optional(),
    inverterSerialNumber: z.string().optional(),
    batteryModel: z.string().optional(),
  }),

  // Signature
  signature: z.object({
    data: z.string(), // Base64 encoded signature image
    signedBy: z.string(),
    signedAt: z.string().datetime(),
  }),

  // Date fields
  date: z.string().datetime(),
};

// Form type definitions
export type FormType =
  | 'customer_declaration'
  | 'iec_request'
  | 'sketch'
  | 'iec_agreement'
  | 'proxy'
  | 'single_line_diagram'
  | 'iec_request_number'
  | 'iec_approval_number'
  | 'inverter_notification'
  | 'installation_declaration'
  | 'standing_order';

// Customer Declaration Form (טופס הצהרת לקוח)
export const customerDeclarationSchema = z.object({
  formType: z.literal('customer_declaration'),
  customerName: commonFields.customerName,
  customerId: commonFields.customerId,
  customerPhone: commonFields.customerPhone,
  customerEmail: commonFields.customerEmail,
  propertyAddress: commonFields.propertyAddress,
  iecInfo: commonFields.iecInfo,
  systemSpecs: commonFields.systemSpecs.pick({
    systemSizeKw: true,
    panelCount: true,
  }),
  declarations: z.object({
    ownsProperty: z.boolean(),
    authorizesInstallation: z.boolean(),
    acceptsTerms: z.boolean(),
    hasNeighborConsent: z.boolean().optional(),
  }),
  customerSignature: commonFields.signature,
  date: commonFields.date,
});

// IEC Request Form (בקשה לחברת חשמל)
export const iecRequestSchema = z.object({
  formType: z.literal('iec_request'),
  customerName: commonFields.customerName,
  customerId: commonFields.customerId,
  customerPhone: commonFields.customerPhone,
  customerAddress: commonFields.customerAddress,
  propertyAddress: commonFields.propertyAddress,
  iecInfo: commonFields.iecInfo,
  requestType: z.enum(['new_connection', 'upgrade', 'modification']),
  systemSpecs: commonFields.systemSpecs,
  requestedCapacityKw: z.number().positive(),
  connectionType: z.enum(['single_phase', 'three_phase']),
  notes: z.string().optional(),
  customerSignature: commonFields.signature,
  date: commonFields.date,
});

// Sketch Form (סקיצה)
export const sketchSchema = z.object({
  formType: z.literal('sketch'),
  projectId: z.string().uuid(),
  propertyAddress: commonFields.propertyAddress,
  sketchData: z.object({
    roofType: z.enum(['flat', 'sloped', 'mixed']),
    roofOrientation: z.string(),
    roofArea: z.number().positive(),
    panelLayout: z.array(z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      angle: z.number().optional(),
    })),
    obstacles: z.array(z.object({
      type: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })).optional(),
    measurements: z.record(z.string(), z.number()).optional(),
  }),
  notes: z.string().optional(),
  preparedBy: z.string(),
  date: commonFields.date,
});

// IEC Agreement Form (הסכם לחברת חשמל)
export const iecAgreementSchema = z.object({
  formType: z.literal('iec_agreement'),
  customerName: commonFields.customerName,
  customerId: commonFields.customerId,
  propertyAddress: commonFields.propertyAddress,
  iecInfo: commonFields.iecInfo,
  agreementDetails: z.object({
    connectionCapacityKw: z.number().positive(),
    tariffType: z.string(),
    paymentMethod: z.string(),
  }),
  terms: z.object({
    acceptsIecTerms: z.boolean(),
    acceptsGridConnection: z.boolean(),
    acceptsMetering: z.boolean(),
  }),
  customerSignature: commonFields.signature,
  date: commonFields.date,
});

// Proxy Request Form (בקשת יפוי כוח)
export const proxySchema = z.object({
  formType: z.literal('proxy'),
  principalName: commonFields.customerName, // Customer granting proxy
  principalId: commonFields.customerId,
  principalAddress: commonFields.customerAddress,
  agentName: z.string().min(1, 'Agent name is required'), // Company/person receiving proxy
  agentId: z.string().min(9),
  agentCompany: z.string().optional(),
  proxyScope: z.array(z.enum([
    'iec_applications',
    'permits',
    'inspections',
    'documentation',
    'all',
  ])),
  validFrom: commonFields.date,
  validUntil: commonFields.date.optional(),
  principalSignature: commonFields.signature,
  witnessName: z.string().optional(),
  witnessSignature: commonFields.signature.optional(),
  date: commonFields.date,
});

// Single Line Diagram Form (תרשים חד קווי)
export const singleLineDiagramSchema = z.object({
  formType: z.literal('single_line_diagram'),
  projectId: z.string().uuid(),
  systemSpecs: commonFields.systemSpecs,
  electricalDetails: z.object({
    mainBreakerRating: z.string(),
    pvBreakerRating: z.string(),
    wireGauge: z.string(),
    conduitType: z.string(),
    groundingMethod: z.string(),
    protectionDevices: z.array(z.string()),
  }),
  diagramImage: z.string().optional(), // Base64 or URL
  notes: z.string().optional(),
  preparedBy: z.string(),
  licenseNumber: z.string(),
  date: commonFields.date,
});

// IEC Request Number Form (מספר בקשה מחח"י)
export const iecRequestNumberSchema = z.object({
  formType: z.literal('iec_request_number'),
  projectId: z.string().uuid(),
  requestNumber: z.string().min(1, 'Request number is required'),
  requestDate: commonFields.date,
  requestStatus: z.enum(['pending', 'processing', 'approved', 'rejected']),
  expectedResponseDate: commonFields.date.optional(),
  notes: z.string().optional(),
  submittedBy: z.string(),
  date: commonFields.date,
});

// IEC Approval Number Form (מספר אישור מחח"י)
export const iecApprovalNumberSchema = z.object({
  formType: z.literal('iec_approval_number'),
  projectId: z.string().uuid(),
  requestNumber: z.string(),
  approvalNumber: z.string().min(1, 'Approval number is required'),
  approvalDate: commonFields.date,
  approvedCapacityKw: z.number().positive(),
  connectionConditions: z.array(z.string()).optional(),
  expiryDate: commonFields.date.optional(),
  notes: z.string().optional(),
  recordedBy: z.string(),
  date: commonFields.date,
});

// Inverter Notification Form (הודעת ממיר)
export const inverterNotificationSchema = z.object({
  formType: z.literal('inverter_notification'),
  projectId: z.string().uuid(),
  customerName: commonFields.customerName,
  propertyAddress: commonFields.propertyAddress,
  inverterDetails: z.object({
    manufacturer: z.string().min(1),
    model: z.string().min(1),
    serialNumber: z.string().min(1),
    ratedPowerKw: z.number().positive(),
    firmwareVersion: z.string().optional(),
    commissioningDate: commonFields.date,
  }),
  gridSettings: z.object({
    voltageRange: z.string(),
    frequencyRange: z.string(),
    antiIslandingTest: z.boolean(),
    gridCodeCompliance: z.string(),
  }),
  installerName: z.string(),
  installerLicense: z.string(),
  installerSignature: commonFields.signature,
  date: commonFields.date,
});

// Installation Declaration Form (הצהרת מתקין)
export const installationDeclarationSchema = z.object({
  formType: z.literal('installation_declaration'),
  projectId: z.string().uuid(),
  customerName: commonFields.customerName,
  propertyAddress: commonFields.propertyAddress,
  systemSpecs: commonFields.systemSpecs,
  installationDetails: z.object({
    installationDate: commonFields.date,
    completionDate: commonFields.date,
    mountingType: z.enum(['roof_mounted', 'ground_mounted', 'carport', 'other']),
    structuralAssessment: z.boolean(),
    electricalAssessment: z.boolean(),
  }),
  complianceDeclarations: z.object({
    meetsElectricalStandards: z.boolean(),
    meetsStructuralStandards: z.boolean(),
    safetyTestsCompleted: z.boolean(),
    documentationComplete: z.boolean(),
  }),
  installerDetails: z.object({
    name: z.string(),
    companyName: z.string(),
    licenseNumber: z.string(),
    licenseExpiry: commonFields.date,
    phone: z.string(),
    email: z.string().email().optional(),
  }),
  installerSignature: commonFields.signature,
  date: commonFields.date,
});

// Standing Order Form (הוראת קבע)
export const standingOrderSchema = z.object({
  formType: z.literal('standing_order'),
  customerName: commonFields.customerName,
  customerId: commonFields.customerId,
  customerPhone: commonFields.customerPhone,
  customerEmail: commonFields.customerEmail,
  bankDetails: z.object({
    bankName: z.string().min(1),
    branchNumber: z.string().min(1),
    accountNumber: z.string().min(1),
    accountHolderName: z.string().min(1),
  }),
  paymentDetails: z.object({
    amount: z.number().positive(),
    currency: z.string().default('ILS'),
    frequency: z.enum(['monthly', 'quarterly', 'annual', 'one_time']),
    startDate: commonFields.date,
    endDate: commonFields.date.optional(),
    purpose: z.string(),
  }),
  authorization: z.object({
    authorizesDebit: z.boolean(),
    acceptsTerms: z.boolean(),
  }),
  customerSignature: commonFields.signature,
  date: commonFields.date,
});

// Form schema map
export const formSchemas: Record<FormType, z.ZodSchema> = {
  customer_declaration: customerDeclarationSchema,
  iec_request: iecRequestSchema,
  sketch: sketchSchema,
  iec_agreement: iecAgreementSchema,
  proxy: proxySchema,
  single_line_diagram: singleLineDiagramSchema,
  iec_request_number: iecRequestNumberSchema,
  iec_approval_number: iecApprovalNumberSchema,
  inverter_notification: inverterNotificationSchema,
  installation_declaration: installationDeclarationSchema,
  standing_order: standingOrderSchema,
};

// Form metadata for display
export const formMetadata: Record<FormType, { name: string; nameHe: string; description: string }> = {
  customer_declaration: {
    name: 'Customer Declaration',
    nameHe: 'טופס הצהרת לקוח',
    description: 'Customer declaration form for solar installation authorization',
  },
  iec_request: {
    name: 'IEC Request',
    nameHe: 'בקשה לחברת חשמל',
    description: 'Request form for Israel Electric Corporation connection',
  },
  sketch: {
    name: 'Installation Sketch',
    nameHe: 'סקיצה',
    description: 'Technical sketch of solar panel installation layout',
  },
  iec_agreement: {
    name: 'IEC Agreement',
    nameHe: 'הסכם לחברת חשמל',
    description: 'Agreement with Israel Electric Corporation',
  },
  proxy: {
    name: 'Power of Attorney',
    nameHe: 'בקשת יפוי כוח',
    description: 'Power of attorney for handling installation paperwork',
  },
  single_line_diagram: {
    name: 'Single Line Diagram',
    nameHe: 'תרשים חד קווי',
    description: 'Electrical single line diagram for the installation',
  },
  iec_request_number: {
    name: 'IEC Request Number',
    nameHe: 'מספר בקשה מחח"י',
    description: 'IEC request tracking number',
  },
  iec_approval_number: {
    name: 'IEC Approval Number',
    nameHe: 'מספר אישור מחח"י',
    description: 'IEC approval number and details',
  },
  inverter_notification: {
    name: 'Inverter Notification',
    nameHe: 'הודעת ממיר',
    description: 'Inverter commissioning notification form',
  },
  installation_declaration: {
    name: 'Installation Declaration',
    nameHe: 'הצהרת מתקין',
    description: 'Installer declaration of completed work',
  },
  standing_order: {
    name: 'Standing Order',
    nameHe: 'הוראת קבע',
    description: 'Standing order payment authorization',
  },
};

// Validate form data against schema
export function validateFormData(formType: FormType, data: unknown): { success: boolean; data?: unknown; errors?: z.ZodError } {
  const schema = formSchemas[formType];
  if (!schema) {
    return { success: false, errors: new z.ZodError([{ code: 'custom', message: 'Unknown form type', path: ['formType'] }]) };
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
