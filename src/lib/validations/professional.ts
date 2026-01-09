import { z } from 'zod';
import { field, enums } from './builders';

export const professionalSchema = z.object({
  professional_type: enums.professionalType,
  name: field.required('Name', 100),
  company_name: field.optional(100),
  company_id: field.optional(20),
  id_number: field.idNumber(),
  email: field.email(),
  phone: field.phoneOptional(15),
  license_type: field.optional(50),
  license_number: field.optional(50),
  license_expiry: field.date(),
  license_document_url: field.url(),
  is_electrician: z.boolean().default(false),
});

export type ProfessionalFormData = z.infer<typeof professionalSchema>;

export const professionalSearchSchema = z.object({
  query: field.query(),
  professional_type: enums.professionalType.optional(),
  is_electrician: z.boolean().optional(),
});

export type ProfessionalSearchParams = z.infer<typeof professionalSearchSchema>;

export const projectProfessionalSchema = z.object({
  project_id: field.uuid('project ID'),
  professional_id: field.uuid('professional ID'),
  role: field.optional(100),
});

export type ProjectProfessionalFormData = z.infer<typeof projectProfessionalSchema>;
