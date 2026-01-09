import { z } from 'zod';

export const professionalSchema = z.object({
  professional_type: z.enum([
    'installing_company',
    'installing_contractor',
    'planner',
    'inspecting_electrician',
    'constructor',
  ]),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  company_name: z
    .string()
    .max(100, 'Company name must be 100 characters or less')
    .optional(),
  company_id: z
    .string()
    .max(20, 'Company ID must be 20 characters or less')
    .optional(),
  id_number: z
    .string()
    .regex(/^\d{9}$/, 'ID number must be 9 digits')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(15, 'Phone number must be 15 characters or less')
    .optional(),
  license_type: z
    .string()
    .max(50, 'License type must be 50 characters or less')
    .optional(),
  license_number: z
    .string()
    .max(50, 'License number must be 50 characters or less')
    .optional(),
  license_expiry: z.string().optional().nullable(),
  license_document_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_electrician: z.boolean().default(false),
});

export type ProfessionalFormData = z.infer<typeof professionalSchema>;

export const professionalSearchSchema = z.object({
  query: z.string().optional(),
  professional_type: z.enum([
    'installing_company',
    'installing_contractor',
    'planner',
    'inspecting_electrician',
    'constructor',
  ]).optional(),
  is_electrician: z.boolean().optional(),
});

export type ProfessionalSearchParams = z.infer<typeof professionalSearchSchema>;

export const projectProfessionalSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  professional_id: z.string().uuid('Invalid professional ID'),
  role: z.string().max(100, 'Role must be 100 characters or less').optional(),
});

export type ProjectProfessionalFormData = z.infer<typeof projectProfessionalSchema>;
