// Form field definitions for the frontend form renderer

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'signature'
  | 'address'
  | 'group';

export interface FormFieldDefinition {
  name: string;
  label: string;
  labelHe?: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string; labelHe?: string }[];
  fields?: FormFieldDefinition[]; // For group type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormDefinition {
  type: string;
  name: string;
  nameHe: string;
  description: string;
  sections: {
    title: string;
    titleHe: string;
    fields: FormFieldDefinition[];
  }[];
}

// Customer Declaration Form
export const customerDeclarationDefinition: FormDefinition = {
  type: 'customer_declaration',
  name: 'Customer Declaration',
  nameHe: 'טופס הצהרת לקוח',
  description: 'Customer declaration form for solar installation authorization',
  sections: [
    {
      title: 'Customer Information',
      titleHe: 'פרטי לקוח',
      fields: [
        { name: 'customerName', label: 'Full Name', labelHe: 'שם מלא', type: 'text', required: true },
        { name: 'customerId', label: 'ID Number', labelHe: 'תעודת זהות', type: 'text', required: true, validation: { min: 9, max: 9 } },
        { name: 'customerPhone', label: 'Phone', labelHe: 'טלפון', type: 'phone', required: true },
        { name: 'customerEmail', label: 'Email', labelHe: 'דוא"ל', type: 'email' },
      ],
    },
    {
      title: 'Property Address',
      titleHe: 'כתובת הנכס',
      fields: [
        { name: 'propertyAddress.city', label: 'City', labelHe: 'עיר', type: 'text', required: true },
        { name: 'propertyAddress.street', label: 'Street', labelHe: 'רחוב', type: 'text', required: true },
        { name: 'propertyAddress.number', label: 'Number', labelHe: 'מספר', type: 'text', required: true },
        { name: 'propertyAddress.block', label: 'Block', labelHe: 'גוש', type: 'text' },
        { name: 'propertyAddress.parcel', label: 'Parcel', labelHe: 'חלקה', type: 'text' },
      ],
    },
    {
      title: 'IEC Information',
      titleHe: 'פרטי חברת חשמל',
      fields: [
        { name: 'iecInfo.contractNumber', label: 'Contract Number', labelHe: 'מספר חוזה', type: 'text' },
        { name: 'iecInfo.meterNumber', label: 'Meter Number', labelHe: 'מספר מונה', type: 'text' },
      ],
    },
    {
      title: 'System Specifications',
      titleHe: 'מפרט המערכת',
      fields: [
        { name: 'systemSpecs.systemSizeKw', label: 'System Size (kW)', labelHe: 'גודל המערכת (קוו"ט)', type: 'number', required: true },
        { name: 'systemSpecs.panelCount', label: 'Number of Panels', labelHe: 'מספר פאנלים', type: 'number', required: true },
      ],
    },
    {
      title: 'Declarations',
      titleHe: 'הצהרות',
      fields: [
        { name: 'declarations.ownsProperty', label: 'I own this property or have authorization', labelHe: 'אני בעל הנכס או בעל הרשאה', type: 'checkbox', required: true },
        { name: 'declarations.authorizesInstallation', label: 'I authorize the installation', labelHe: 'אני מאשר את ההתקנה', type: 'checkbox', required: true },
        { name: 'declarations.acceptsTerms', label: 'I accept the terms and conditions', labelHe: 'אני מקבל את התנאים', type: 'checkbox', required: true },
      ],
    },
    {
      title: 'Signature',
      titleHe: 'חתימה',
      fields: [
        { name: 'customerSignature', label: 'Customer Signature', labelHe: 'חתימת הלקוח', type: 'signature', required: true },
      ],
    },
  ],
};

// IEC Request Form
export const iecRequestDefinition: FormDefinition = {
  type: 'iec_request',
  name: 'IEC Request',
  nameHe: 'בקשה לחברת חשמל',
  description: 'Request form for Israel Electric Corporation connection',
  sections: [
    {
      title: 'Customer Information',
      titleHe: 'פרטי לקוח',
      fields: [
        { name: 'customerName', label: 'Full Name', labelHe: 'שם מלא', type: 'text', required: true },
        { name: 'customerId', label: 'ID Number', labelHe: 'תעודת זהות', type: 'text', required: true },
        { name: 'customerPhone', label: 'Phone', labelHe: 'טלפון', type: 'phone', required: true },
      ],
    },
    {
      title: 'Request Details',
      titleHe: 'פרטי הבקשה',
      fields: [
        {
          name: 'requestType',
          label: 'Request Type',
          labelHe: 'סוג הבקשה',
          type: 'select',
          required: true,
          options: [
            { value: 'new_connection', label: 'New Connection', labelHe: 'חיבור חדש' },
            { value: 'upgrade', label: 'Upgrade', labelHe: 'שדרוג' },
            { value: 'modification', label: 'Modification', labelHe: 'שינוי' },
          ],
        },
        { name: 'requestedCapacityKw', label: 'Requested Capacity (kW)', labelHe: 'הספק מבוקש (קוו"ט)', type: 'number', required: true },
        {
          name: 'connectionType',
          label: 'Connection Type',
          labelHe: 'סוג חיבור',
          type: 'select',
          required: true,
          options: [
            { value: 'single_phase', label: 'Single Phase', labelHe: 'חד פאזי' },
            { value: 'three_phase', label: 'Three Phase', labelHe: 'תלת פאזי' },
          ],
        },
      ],
    },
    {
      title: 'System Specifications',
      titleHe: 'מפרט המערכת',
      fields: [
        { name: 'systemSpecs.systemSizeKw', label: 'System Size (kW)', labelHe: 'גודל המערכת', type: 'number', required: true },
        { name: 'systemSpecs.panelCount', label: 'Number of Panels', labelHe: 'מספר פאנלים', type: 'number', required: true },
        { name: 'systemSpecs.inverterModel', label: 'Inverter Model', labelHe: 'דגם ממיר', type: 'text' },
      ],
    },
    {
      title: 'Notes',
      titleHe: 'הערות',
      fields: [
        { name: 'notes', label: 'Additional Notes', labelHe: 'הערות נוספות', type: 'textarea' },
      ],
    },
    {
      title: 'Signature',
      titleHe: 'חתימה',
      fields: [
        { name: 'customerSignature', label: 'Customer Signature', labelHe: 'חתימת הלקוח', type: 'signature', required: true },
      ],
    },
  ],
};

// Standing Order Form
export const standingOrderDefinition: FormDefinition = {
  type: 'standing_order',
  name: 'Standing Order',
  nameHe: 'הוראת קבע',
  description: 'Standing order payment authorization',
  sections: [
    {
      title: 'Customer Information',
      titleHe: 'פרטי לקוח',
      fields: [
        { name: 'customerName', label: 'Full Name', labelHe: 'שם מלא', type: 'text', required: true },
        { name: 'customerId', label: 'ID Number', labelHe: 'תעודת זהות', type: 'text', required: true },
        { name: 'customerPhone', label: 'Phone', labelHe: 'טלפון', type: 'phone', required: true },
        { name: 'customerEmail', label: 'Email', labelHe: 'דוא"ל', type: 'email' },
      ],
    },
    {
      title: 'Bank Details',
      titleHe: 'פרטי בנק',
      fields: [
        { name: 'bankDetails.bankName', label: 'Bank Name', labelHe: 'שם הבנק', type: 'text', required: true },
        { name: 'bankDetails.branchNumber', label: 'Branch Number', labelHe: 'מספר סניף', type: 'text', required: true },
        { name: 'bankDetails.accountNumber', label: 'Account Number', labelHe: 'מספר חשבון', type: 'text', required: true },
        { name: 'bankDetails.accountHolderName', label: 'Account Holder Name', labelHe: 'שם בעל החשבון', type: 'text', required: true },
      ],
    },
    {
      title: 'Payment Details',
      titleHe: 'פרטי תשלום',
      fields: [
        { name: 'paymentDetails.amount', label: 'Amount', labelHe: 'סכום', type: 'number', required: true },
        {
          name: 'paymentDetails.frequency',
          label: 'Payment Frequency',
          labelHe: 'תדירות תשלום',
          type: 'select',
          required: true,
          options: [
            { value: 'monthly', label: 'Monthly', labelHe: 'חודשי' },
            { value: 'quarterly', label: 'Quarterly', labelHe: 'רבעוני' },
            { value: 'annual', label: 'Annual', labelHe: 'שנתי' },
            { value: 'one_time', label: 'One Time', labelHe: 'חד פעמי' },
          ],
        },
        { name: 'paymentDetails.startDate', label: 'Start Date', labelHe: 'תאריך התחלה', type: 'date', required: true },
        { name: 'paymentDetails.purpose', label: 'Purpose', labelHe: 'מטרה', type: 'text', required: true },
      ],
    },
    {
      title: 'Authorization',
      titleHe: 'הרשאה',
      fields: [
        { name: 'authorization.authorizesDebit', label: 'I authorize the debit from my account', labelHe: 'אני מאשר חיוב מהחשבון שלי', type: 'checkbox', required: true },
        { name: 'authorization.acceptsTerms', label: 'I accept the terms and conditions', labelHe: 'אני מקבל את התנאים', type: 'checkbox', required: true },
      ],
    },
    {
      title: 'Signature',
      titleHe: 'חתימה',
      fields: [
        { name: 'customerSignature', label: 'Customer Signature', labelHe: 'חתימת הלקוח', type: 'signature', required: true },
      ],
    },
  ],
};

// Installation Declaration Form
export const installationDeclarationDefinition: FormDefinition = {
  type: 'installation_declaration',
  name: 'Installation Declaration',
  nameHe: 'הצהרת מתקין',
  description: 'Installer declaration of completed work',
  sections: [
    {
      title: 'Project Information',
      titleHe: 'פרטי הפרויקט',
      fields: [
        { name: 'customerName', label: 'Customer Name', labelHe: 'שם הלקוח', type: 'text', required: true },
      ],
    },
    {
      title: 'Installation Details',
      titleHe: 'פרטי ההתקנה',
      fields: [
        { name: 'installationDetails.installationDate', label: 'Installation Date', labelHe: 'תאריך התקנה', type: 'date', required: true },
        { name: 'installationDetails.completionDate', label: 'Completion Date', labelHe: 'תאריך סיום', type: 'date', required: true },
        {
          name: 'installationDetails.mountingType',
          label: 'Mounting Type',
          labelHe: 'סוג התקנה',
          type: 'select',
          required: true,
          options: [
            { value: 'roof_mounted', label: 'Roof Mounted', labelHe: 'על הגג' },
            { value: 'ground_mounted', label: 'Ground Mounted', labelHe: 'על הקרקע' },
            { value: 'carport', label: 'Carport', labelHe: 'סככת חניה' },
            { value: 'other', label: 'Other', labelHe: 'אחר' },
          ],
        },
      ],
    },
    {
      title: 'Compliance Declarations',
      titleHe: 'הצהרות עמידה בתקנים',
      fields: [
        { name: 'complianceDeclarations.meetsElectricalStandards', label: 'Meets electrical standards', labelHe: 'עומד בתקני חשמל', type: 'checkbox', required: true },
        { name: 'complianceDeclarations.meetsStructuralStandards', label: 'Meets structural standards', labelHe: 'עומד בתקני בנייה', type: 'checkbox', required: true },
        { name: 'complianceDeclarations.safetyTestsCompleted', label: 'Safety tests completed', labelHe: 'בדיקות בטיחות בוצעו', type: 'checkbox', required: true },
        { name: 'complianceDeclarations.documentationComplete', label: 'Documentation complete', labelHe: 'תיעוד מלא', type: 'checkbox', required: true },
      ],
    },
    {
      title: 'Installer Details',
      titleHe: 'פרטי המתקין',
      fields: [
        { name: 'installerDetails.name', label: 'Installer Name', labelHe: 'שם המתקין', type: 'text', required: true },
        { name: 'installerDetails.companyName', label: 'Company Name', labelHe: 'שם החברה', type: 'text', required: true },
        { name: 'installerDetails.licenseNumber', label: 'License Number', labelHe: 'מספר רישיון', type: 'text', required: true },
        { name: 'installerDetails.phone', label: 'Phone', labelHe: 'טלפון', type: 'phone', required: true },
      ],
    },
    {
      title: 'Signature',
      titleHe: 'חתימה',
      fields: [
        { name: 'installerSignature', label: 'Installer Signature', labelHe: 'חתימת המתקין', type: 'signature', required: true },
      ],
    },
  ],
};

// Map of all form definitions
export const formDefinitions: Record<string, FormDefinition> = {
  customer_declaration: customerDeclarationDefinition,
  iec_request: iecRequestDefinition,
  standing_order: standingOrderDefinition,
  installation_declaration: installationDeclarationDefinition,
};

// Get form definition by type
export function getFormDefinition(formType: string): FormDefinition | undefined {
  return formDefinitions[formType];
}
