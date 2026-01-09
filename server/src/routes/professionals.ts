import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');

const professionalSchema = z.object({
  professional_type: z.enum(['installing_company', 'installing_contractor', 'planner', 'inspecting_electrician', 'constructor']),
  name: z.string().min(1),
  company_name: z.string().optional().nullable(),
  company_id: z.string().optional().nullable(),
  id_number: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  license_type: z.string().optional().nullable(),
  license_number: z.string().optional().nullable(),
  license_expiry: z.string().optional().nullable(),
  is_electrician: z.boolean().default(false),
});

router.get('/', requirePermission('professionals:read'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { professional_type, is_electrician, query } = req.query;
  let dbQuery = supabase.from('professionals').select('*', { count: 'exact' });
  if (professional_type) dbQuery = dbQuery.eq('professional_type', professional_type);
  if (is_electrician !== undefined) dbQuery = dbQuery.eq('is_electrician', is_electrician === 'true');
  if (query) dbQuery = dbQuery.or(`name.ilike.%${query}%,company_name.ilike.%${query}%,email.ilike.%${query}%`);
  const { data, error, count } = await dbQuery.order('name', { ascending: true });
  if (error) throw new AppError(error.message, 500);
  res.json({ data, total: count });
}));

router.get('/:id', requirePermission('professionals:read'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase.from('professionals').select('*').eq('id', req.params.id).single();
  if (error) throw new AppError('Professional not found', 404);
  res.json(data);
}));

router.post('/', requirePermission('professionals:create'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = professionalSchema.parse(req.body);
  const { data, error } = await supabase.from('professionals').insert(validatedData).select().single();
  if (error) throw new AppError(error.message, 500);
  res.status(201).json(data);
}));

router.put('/:id', requirePermission('professionals:update'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = professionalSchema.partial().parse(req.body);
  const { data, error } = await supabase.from('professionals').update(validatedData).eq('id', req.params.id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json(data);
}));

router.delete('/:id', requirePermission('professionals:delete'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { error } = await supabase.from('professionals').delete().eq('id', req.params.id);
  if (error) throw new AppError(error.message, 500);
  res.status(204).send();
}));

router.get('/expiring/:days', requirePermission('professionals:read'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const days = parseInt(req.params.days) || 30;
  const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .not('license_expiry', 'is', null)
    .lte('license_expiry', endDate)
    .order('license_expiry', { ascending: true });
  if (error) throw new AppError(error.message, 500);
  res.json({ data });
}));

export default router;
