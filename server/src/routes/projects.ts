import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { status, customer_id, query, page = 1, limit = 50 } = req.query;

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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const validatedData = projectSchema.parse(req.body);

    const { data, error } = await supabase
      .from('projects')
      .insert(validatedData)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Create installation stages
    const stages = [
      'request_opened',
      'payment_processed',
      'department_response',
      'sync_compliance_request',
      'sync_request',
      'sync_complete',
      'commercial_activation',
      'standing_order_form',
    ];

    await supabase.from('installation_stages').insert(
      stages.map((stage) => ({
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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const validatedData = projectSchema.partial().parse(req.body);

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
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw new AppError(error.message, 500);
    res.status(204).send();
  })
);

// PUT /api/projects/:id/stages/:stage
router.put(
  '/:id/stages/:stage',
  requirePermission('projects:update'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { id, stage } = req.params;
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
