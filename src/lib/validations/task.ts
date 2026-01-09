import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional(),
  project_id: z.string().uuid('Invalid project ID').optional().nullable(),
  customer_id: z.string().uuid('Invalid customer ID').optional().nullable(),
  assigned_to: z.string().uuid('Invalid user ID').optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  due_date: z.string().optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const taskSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
});

export type TaskSearchParams = z.infer<typeof taskSearchSchema>;

export const taskStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']),
});

export type TaskStatusUpdate = z.infer<typeof taskStatusUpdateSchema>;
