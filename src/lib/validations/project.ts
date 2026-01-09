import { z } from 'zod';

export const projectSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled']).default('pending'),
  current_stage: z.enum([
    'request_opened',
    'payment_processed',
    'department_response',
    'sync_compliance_request',
    'sync_request',
    'sync_complete',
    'commercial_activation',
    'standing_order_form',
  ]).default('request_opened'),

  // System specifications
  system_size_kw: z.number().positive('System size must be positive').optional(),
  panel_count: z.number().int().positive('Panel count must be a positive integer').optional(),
  inverter_model: z.string().max(100, 'Inverter model must be 100 characters or less').optional(),
  estimated_annual_production: z.number().positive('Production estimate must be positive').optional(),

  // Timeline
  start_date: z.string().optional(),
  estimated_completion_date: z.string().optional(),
  actual_completion_date: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const projectSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled']).optional(),
  customer_id: z.string().uuid().optional(),
});

export type ProjectSearchParams = z.infer<typeof projectSearchSchema>;

export const installationStageSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  stage: z.enum([
    'request_opened',
    'payment_processed',
    'department_response',
    'sync_compliance_request',
    'sync_request',
    'sync_complete',
    'commercial_activation',
    'standing_order_form',
  ]),
  completed: z.boolean().default(false),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export type InstallationStageFormData = z.infer<typeof installationStageSchema>;
