import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase } from '../lib';

const router = Router();

const taskSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  customer_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  due_date: z.string().optional().nullable(),
});

router.get(
  '/',
  requirePermission('tasks:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { status, priority, assigned_to, project_id, query, page = 1, limit = 50 } = req.query;

    let dbQuery = supabase
      .from('tasks')
      .select(`*, projects (id, name), customers (id, first_name, last_name)`, { count: 'exact' });

    if (status) dbQuery = dbQuery.eq('status', status);
    if (priority) dbQuery = dbQuery.eq('priority', priority);
    if (assigned_to) dbQuery = dbQuery.eq('assigned_to', assigned_to);
    if (project_id) dbQuery = dbQuery.eq('project_id', project_id);
    if (query) dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    const offset = (Number(page) - 1) * Number(limit);
    dbQuery = dbQuery.order('due_date', { ascending: true }).range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await dbQuery;
    if (error) throw new AppError(error.message, 500);

    res.json({ data, pagination: { page: Number(page), limit: Number(limit), total: count } });
  })
);

router.get(
  '/:id',
  requirePermission('tasks:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, projects (id, name), customers (id, first_name, last_name)`)
      .eq('id', req.params.id)
      .single();
    if (error) throw new AppError('Task not found', 404);
    res.json(data);
  })
);

router.post(
  '/',
  requirePermission('tasks:create'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const validatedData = taskSchema.parse(req.body);
    const { data, error } = await supabase.from('tasks').insert(validatedData).select().single();
    if (error) throw new AppError(error.message, 500);
    res.status(201).json(data);
  })
);

router.put(
  '/:id',
  requirePermission('tasks:update'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const validatedData = taskSchema.partial().parse(req.body);
    const { data, error } = await supabase
      .from('tasks')
      .update(validatedData)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

router.patch(
  '/:id/status',
  requirePermission('tasks:update'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { status } = req.body;
    const updateData: any = {
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    };
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

router.delete(
  '/:id',
  requirePermission('tasks:delete'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { error } = await supabase.from('tasks').delete().eq('id', req.params.id);
    if (error) throw new AppError(error.message, 500);
    res.status(204).send();
  })
);

export default router;
