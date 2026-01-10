import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase, INSTALLATION_STAGES } from '../lib';

const router = Router();

const projectSchema = z.object({
  customer_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
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
  system_size_kw: z.number().optional().nullable(),
  panel_count: z.number().optional().nullable(),
  inverter_model: z.string().optional().nullable(),
  estimated_annual_production: z.number().optional().nullable(),
  start_date: z.string().optional().nullable(),
  estimated_completion_date: z.string().optional().nullable(),
  actual_completion_date: z.string().optional().nullable(),
});

// GET /api/projects
router.get(
  '/',
  requirePermission('projects:read'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { status, customer_id, query, page = 1, limit = 50 } = req.query as any;

    let dbQuery = supabase
      .from('projects')
      .select(`*, customers (first_name, last_name)`, { count: 'exact' });

    if (status) dbQuery = dbQuery.eq('status', status);
    if (customer_id) dbQuery = dbQuery.eq('customer_id', customer_id);
    if (query) dbQuery = dbQuery.ilike('name', `%${query}%`);

    const offset = (Number(page) - 1) * Number(limit);
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await dbQuery;
    if (error) throw new AppError(error.message, 500);

    res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  })
);

// GET /api/projects/:id
router.get(
  '/:id',
  requirePermission('projects:read'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as any;

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        customers (id, first_name, last_name, phone_primary, email),
        installation_stages (id, stage, completed, completed_at, notes),
        project_professionals (id, role, professionals (id, name, professional_type, phone, email))
      `)
      .eq('id', id)
      .single();

    if (error) throw new AppError('Project not found', 404);
    res.json(data);
  })
);

// POST /api/projects
router.post(
  '/',
  requirePermission('projects:create'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const validatedData = projectSchema.parse(req.body as any);

    const { data, error } = await supabase
      .from('projects')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Create installation stages using shared constants
    await supabase.from('installation_stages').insert(
      INSTALLATION_STAGES.map((stage) => ({
        project_id: data.id,
        stage,
        completed: false,
      }))
    );

    res.status(201).json(data);
  })
);

// PUT /api/projects/:id
router.put(
  '/:id',
  requirePermission('projects:update'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as any;
    const validatedData = projectSchema.partial().parse(req.body as any);

    const { data, error } = await supabase
      .from('projects')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

// DELETE /api/projects/:id
router.delete(
  '/:id',
  requirePermission('projects:delete'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as any;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw new AppError(error.message, 500);
    res.status(204).send();
  })
);

// PUT /api/projects/:id/stages/:stage
router.put(
  '/:id/stages/:stage',
  requirePermission('projects:update'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id, stage } = req.params as any;
    const { completed, notes } = req.body;

    const { error } = await supabase
      .from('installation_stages')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        completed_by: req.user?.id,
        notes,
      })
      .eq('project_id', id)
      .eq('stage', stage);

    if (error) throw new AppError(error.message, 500);

    if (completed) {
      await supabase
        .from('projects')
        .update({ current_stage: stage })
        .eq('id', id);
    }

    res.json({ success: true });
  })
);

export default router;
