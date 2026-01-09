import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');

const FORM_TYPES = [
  { type: 'layout_plan', name: 'Layout Plan + Grounding', name_he: 'תכנית פריסה + הארקות' },
  { type: 'pv_agreement', name: 'PV Agreement', name_he: 'הסכם PV' },
  { type: 'electrician_declaration', name: 'Executing Electrician Declaration', name_he: 'הצהרת חשמלאי מבצע' },
  { type: 'installation_submission', name: 'Installation Submission for Inspection', name_he: 'הגשת ההתקנה לביקורת' },
  { type: 'inverter_calibration', name: 'Inverter Calibration Affidavit', name_he: 'תצהיר כיול ממיר' },
  { type: 'constructor_approval', name: 'Constructor Approval', name_he: 'אישור קונסטרוקטור' },
  { type: 'regulation_24', name: 'Installation Declaration per Regulation 24', name_he: 'הצהרת התקנה לפי תקנה 24' },
  { type: 'pv_inspection', name: 'PV Installation Inspection Form', name_he: 'טופס ביקורת התקנת PV' },
  { type: 'form_1400', name: 'Form 1400', name_he: 'טופס 1400' },
  { type: 'permit_exempt', name: 'Permit-Exempt Work Report', name_he: 'דוח עבודה פטורה מהיתר' },
  { type: 'threshold_compliance', name: 'Central Form for Threshold Compliance', name_he: 'טופס מרכזי לעמידה בסף' },
];

router.get('/project/:projectId', requirePermission('forms:read'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('project_id', req.params.projectId)
    .order('created_at', { ascending: true });
  if (error) throw new AppError(error.message, 500);
  res.json({ data });
}));

router.post('/project/:projectId/initialize', requirePermission('forms:update'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const formsToCreate = FORM_TYPES.map((formType) => ({
    project_id: req.params.projectId,
    form_type: formType.type,
    form_name: formType.name,
    form_name_he: formType.name_he,
    status: 'draft',
  }));
  const { data, error } = await supabase.from('forms').insert(formsToCreate).select();
  if (error) throw new AppError(error.message, 500);
  res.status(201).json({ data });
}));

router.patch('/:id/status', requirePermission('forms:update'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { status, signed_by } = req.body;
  const updateData: any = { status };
  if (status === 'approved' || status === 'submitted') {
    updateData.signed_by = signed_by || req.user?.id;
    updateData.signed_at = new Date().toISOString();
  }
  const { data, error } = await supabase.from('forms').update(updateData).eq('id', req.params.id).select().single();
  if (error) throw new AppError(error.message, 500);
  res.json(data);
}));

router.patch('/:id/approve', requirePermission('forms:approve'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('forms')
    .update({ status: 'approved', signed_by: req.user?.id, signed_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) throw new AppError(error.message, 500);
  res.json(data);
}));

router.patch('/:id/reject', requirePermission('forms:approve'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('forms')
    .update({ status: 'rejected', signed_by: req.user?.id, signed_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) throw new AppError(error.message, 500);
  res.json(data);
}));

export default router;
