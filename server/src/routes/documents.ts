import { Router, Response } from 'express';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase } from '../lib';

const router = Router();

router.get('/project/:projectId', requirePermission('documents:read'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { projectId } = req.params as any;
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ data });
}));

router.get('/customer/:customerId', requirePermission('documents:read'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { customerId } = req.params as any;
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ data });
}));

router.get('/:id', requirePermission('documents:read'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
  if (error) throw new AppError('Document not found', 404);
  res.json(data);
}));

router.post('/', requirePermission('documents:upload'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, file_url, file_type, file_size, project_id, customer_id } = req.body as any;
  const { data, error } = await supabase
    .from('documents')
    .insert({ name, file_url, file_type, file_size, project_id, customer_id, uploaded_by: req.user?.id } as any)
    .select()
    .single();
  if (error) throw new AppError(error.message, 500);
  res.status(201).json(data);
}));

router.delete('/:id', requirePermission('documents:delete'), asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as any;
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw new AppError(error.message, 500);
  res.status(204).send();
}));

export default router;
