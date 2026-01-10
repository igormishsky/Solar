import { Router, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase } from '../lib';

const router = Router();

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

router.get('/', requirePermission('professionals:read'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { professional_type, is_electrician, query } = req.query as any;
  let dbQuery = supabase.from('professionals').select('*', { count: 'exact' });
  if (professional_type) dbQuery = dbQuery.eq('professional_type', professional_type);
  if (is_electrician !== undefined) dbQuery = dbQuery.eq('is_electrician', is_electrician === 'true');
  if (query) dbQuery = dbQuery.or(`name.ilike.%${query}%,company_name.ilike.%${query}%,email.ilike.%${query}%`);
  const { data, error, count } = await dbQuery.order('name', { ascending: true });
  if (error) throw new AppError(error.message, 500);
  res.json({ data, total: count });
}));

router.get('/:id', requirePermission('professionals:read'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const { data, error } = await supabase.from('professionals').select('*').eq('id', id).single();
  if (error) throw new AppError('Professional not found', 404);
  res.json(data);
}));

router.post('/', requirePermission('professionals:create'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = professionalSchema.parse(req.body as any);
  const { data, error } = await supabase.from('professionals').insert(validatedData as any).select().single();
  if (error) throw new AppError(error.message, 500);
  res.status(201).json(data);
}));

router.put('/:id', requirePermission('professionals:update'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const validatedData = professionalSchema.partial().parse(req.body as any);
  const { data, error } = await supabase.from('professionals').update(validatedData as any).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json(data);
}));

router.delete('/:id', requirePermission('professionals:delete'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const { error } = await supabase.from('professionals').delete().eq('id', id);
  if (error) throw new AppError(error.message, 500);
  res.status(204).send();
}));

router.get('/expiring/:days', requirePermission('professionals:read'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { days } = req.params as any;
  const daysNum = parseInt(days) || 30;
  const endDate = new Date(Date.now() + daysNum * 24 * 60 * 60 * 1000).toISOString();
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
