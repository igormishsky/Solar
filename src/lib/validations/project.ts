import { z } from 'zod';
import { field, num, enums } from './builders';

export const projectSchema = z.object({
  customer_id: field.uuid('customer ID'),
  name: field.required('Project name', 100),
  description: field.notes(500),
  status: enums.projectStatus.default('pending'),
  current_stage: enums.installationStage.default('request_opened'),

  // System specifications
  system_size_kw: num.positive('System size'),
  panel_count: num.positiveInt('Panel count'),
  inverter_model: field.optional(100),
  estimated_annual_production: num.positive('Production estimate'),

  // Timeline
  start_date: field.date(),
  estimated_completion_date: field.date(),
  actual_completion_date: field.date(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const projectSearchSchema = z.object({
  query: field.query(),
  status: enums.projectStatus.optional(),
  customer_id: z.string().uuid().optional(),
});

export type ProjectSearchParams = z.infer<typeof projectSearchSchema>;

export const installationStageSchema = z.object({
  project_id: field.uuid('project ID'),
  stage: enums.installationStage,
  completed: z.boolean().default(false),
  notes: field.notes(500),
});

export type InstallationStageFormData = z.infer<typeof installationStageSchema>;
