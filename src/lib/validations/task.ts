import { z } from 'zod';
import { field, enums } from './builders';

export const taskSchema = z.object({
  title: field.required('Task title', 200),
  description: field.notes(1000),
  project_id: field.uuidOptional('project ID'),
  customer_id: field.uuidOptional('customer ID'),
  assigned_to: field.uuidOptional('user ID'),
  priority: enums.taskPriority.default('medium'),
  status: enums.taskStatus.default('pending'),
  due_date: field.date(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const taskSearchSchema = z.object({
  query: field.query(),
  status: enums.taskStatus.optional(),
  priority: enums.taskPriority.optional(),
  assigned_to: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
});

export type TaskSearchParams = z.infer<typeof taskSearchSchema>;

export const taskStatusUpdateSchema = z.object({
  status: enums.taskStatus,
});

export type TaskStatusUpdate = z.infer<typeof taskStatusUpdateSchema>;
