import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase, FORM_TYPES } from '../lib';

const router = Router();

router.get('/project/:projectId', requirePermission('forms:read'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params as any;
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw new AppError(error.message, 500);
  res.json({ data });
}));

router.post('/project/:projectId/initialize', requirePermission('forms:update'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params as any;
  const formsToCreate = FORM_TYPES.map((formType) => ({
    project_id: projectId,
    form_type: formType.type,
    form_name: formType.name,
    form_name_he: formType.name_he,
    status: 'draft',
  }));
  const { data, error } = await supabase.from('forms').insert(formsToCreate as any).select();
  if (error) throw new AppError(error.message, 500);
  res.status(201).json({ data });
}));

router.patch('/:id/status', requirePermission('forms:update'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const { status, signed_by } = req.body as any;
  const updateData: any = { status };
  if (status === 'approved' || status === 'submitted') {
    updateData.signed_by = signed_by || req.user?.id;
    updateData.signed_at = new Date().toISOString();
  }
  const { data, error } = await supabase.from('forms').update(updateData).eq('id', id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json(data);
}));

router.patch('/:id/approve', requirePermission('forms:approve'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const { data, error } = await supabase
    .from('forms')
    .update({ status: 'approved', signed_by: req.user?.id, signed_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new AppError(error.message, 500);
  res.json(data);
}));

router.patch('/:id/reject', requirePermission('forms:approve'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const { data, error } = await supabase
    .from('forms')
    .update({ status: 'rejected', signed_by: req.user?.id, signed_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new AppError(error.message, 500);
  res.json(data);
}));

export default router;
