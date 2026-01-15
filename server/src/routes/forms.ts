import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase, FORM_TYPES } from '../lib';
import { validateFormData, formMetadata, FormType } from '../lib/form-schemas';
import { logCustomAction, logStatusChange } from '../middleware/audit';
import { sendEmail, isEmailConfigured } from '../services/email';

const router = Router();

// Validation schemas
const formDataUpdateSchema = z.object({
  form_data: z.record(z.unknown()),
  signature_data: z.string().optional(),
});

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

// GET /api/forms/types - Get all available form types
router.get(
  '/types',
  requirePermission('forms:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json({ data: formMetadata });
  })
);

// GET /api/forms/project/:projectId - Get all forms for a project
router.get(
  '/project/:projectId',
  requirePermission('forms:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { data, error } = await supabase
      .from('forms')
      .select(`
        *,
        submitted_by_user:submitted_by(email, full_name),
        approved_by_user:approved_by(email, full_name),
        rejected_by_user:rejected_by(email, full_name)
      `)
      .eq('project_id', req.params.projectId)
      .order('created_at', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  })
);

// GET /api/forms/:id - Get single form with details
router.get(
  '/:id',
  requirePermission('forms:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { data, error } = await supabase
      .from('forms')
      .select(`
        *,
        submitted_by_user:submitted_by(email, full_name),
        approved_by_user:approved_by(email, full_name),
        rejected_by_user:rejected_by(email, full_name),
        projects:project_id(name, customer_id, customers:customer_id(*))
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw new AppError('Form not found', 404);
    res.json(data);
  })
);

// POST /api/forms/project/:projectId/initialize - Initialize all forms for a project
router.post(
  '/project/:projectId/initialize',
  requirePermission('forms:update'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Check if forms already exist
    const { data: existing } = await supabase
      .from('forms')
      .select('id')
      .eq('project_id', req.params.projectId);

    if (existing && existing.length > 0) {
      throw new AppError('Forms already initialized for this project', 400);
    }

    const formsToCreate = FORM_TYPES.map((formType) => ({
      project_id: req.params.projectId,
      form_type: formType.type,
      form_name: formType.name,
      form_name_he: formType.name_he,
      status: 'draft',
      form_version: 1,
    }));

    const { data, error } = await supabase.from('forms').insert(formsToCreate).select();
    if (error) throw new AppError(error.message, 500);

    res.status(201).json({ data });
  })
);

// PUT /api/forms/:id/data - Update form data (save draft)
router.put(
  '/:id/data',
  requirePermission('forms:update'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { form_data, signature_data } = formDataUpdateSchema.parse(req.body);

    // Get current form
    const { data: currentForm, error: fetchError } = await supabase
      .from('forms')
      .select('form_type, status, form_data, form_version')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !currentForm) {
      throw new AppError('Form not found', 404);
    }

    // Don't allow updates to approved forms
    if (currentForm.status === 'approved') {
      throw new AppError('Cannot update an approved form', 400);
    }

    // Validate form data against schema
    const validation = validateFormData(currentForm.form_type as FormType, {
      formType: currentForm.form_type,
      ...form_data,
    });

    // We allow partial saves, so don't fail on validation errors for drafts
    // Just store the data as-is

    const updateData: Record<string, unknown> = {
      form_data,
      form_version: (currentForm.form_version || 0) + 1,
      updated_at: new Date().toISOString(),
    };

    if (signature_data) {
      updateData.signature_data = signature_data;
    }

    // If form was rejected, set it back to draft on edit
    if (currentForm.status === 'rejected') {
      updateData.status = 'draft';
      updateData.rejected_by = null;
      updateData.rejected_at = null;
      updateData.rejection_reason = null;
    }

    const { data, error } = await supabase
      .from('forms')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Log the update
    await logCustomAction(req, 'UPDATE', 'form', req.params.id, currentForm.form_data, form_data);

    res.json(data);
  })
);

// POST /api/forms/:id/submit - Submit form for review
router.post(
  '/:id/submit',
  requirePermission('forms:update'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { signature_data } = req.body;

    // Get current form
    const { data: currentForm, error: fetchError } = await supabase
      .from('forms')
      .select('form_type, status, form_data, project_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !currentForm) {
      throw new AppError('Form not found', 404);
    }

    if (currentForm.status === 'approved') {
      throw new AppError('Form is already approved', 400);
    }

    if (currentForm.status === 'submitted') {
      throw new AppError('Form is already submitted for review', 400);
    }

    // Validate form data is complete
    if (!currentForm.form_data) {
      throw new AppError('Form data is required before submission', 400);
    }

    const validation = validateFormData(currentForm.form_type as FormType, {
      formType: currentForm.form_type,
      ...currentForm.form_data,
    });

    if (!validation.success) {
      throw new AppError('Form validation failed. Please complete all required fields.', 400);
    }

    const updateData: Record<string, unknown> = {
      status: 'submitted',
      submitted_by: req.user?.id,
      submitted_at: new Date().toISOString(),
    };

    if (signature_data) {
      updateData.signature_data = signature_data;
      updateData.signed_at = new Date().toISOString();
      updateData.signed_by = req.user?.id;
    }

    const { data, error } = await supabase
      .from('forms')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Log status change
    await logStatusChange(req, 'form', req.params.id, currentForm.status, 'submitted');

    // Send notification to managers (optional)
    // This would require fetching manager emails

    res.json(data);
  })
);

// PATCH /api/forms/:id/status - Update form status (legacy)
router.patch(
  '/:id/status',
  requirePermission('forms:update'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { status, signed_by } = req.body;

    // Get current form
    const { data: currentForm } = await supabase
      .from('forms')
      .select('status')
      .eq('id', req.params.id)
      .single();

    const updateData: Record<string, unknown> = { status };

    if (status === 'approved' || status === 'submitted') {
      updateData.signed_by = signed_by || req.user?.id;
      updateData.signed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('forms')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Log status change
    if (currentForm) {
      await logStatusChange(req, 'form', req.params.id, currentForm.status, status);
    }

    res.json(data);
  })
);

// POST /api/forms/:id/approve - Approve form
router.post(
  '/:id/approve',
  requirePermission('forms:approve'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Get current form
    const { data: currentForm, error: fetchError } = await supabase
      .from('forms')
      .select('status, form_name, project_id, projects:project_id(name)')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !currentForm) {
      throw new AppError('Form not found', 404);
    }

    if (currentForm.status !== 'submitted') {
      throw new AppError('Only submitted forms can be approved', 400);
    }

    const { data, error } = await supabase
      .from('forms')
      .update({
        status: 'approved',
        approved_by: req.user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Log status change
    await logStatusChange(req, 'form', req.params.id, 'submitted', 'approved');
    await logCustomAction(req, 'FORM_APPROVE', 'form', req.params.id);

    res.json(data);
  })
);

// POST /api/forms/:id/reject - Reject form
router.post(
  '/:id/reject',
  requirePermission('forms:approve'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { reason } = rejectSchema.parse(req.body);

    // Get current form
    const { data: currentForm, error: fetchError } = await supabase
      .from('forms')
      .select('status, form_name, project_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !currentForm) {
      throw new AppError('Form not found', 404);
    }

    if (currentForm.status !== 'submitted') {
      throw new AppError('Only submitted forms can be rejected', 400);
    }

    const { data, error } = await supabase
      .from('forms')
      .update({
        status: 'rejected',
        rejected_by: req.user?.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Log status change
    await logStatusChange(req, 'form', req.params.id, 'submitted', 'rejected');
    await logCustomAction(req, 'FORM_REJECT', 'form', req.params.id, null, { reason });

    res.json(data);
  })
);

// Legacy endpoints for backward compatibility
router.patch(
  '/:id/approve',
  requirePermission('forms:approve'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { data, error } = await supabase
      .from('forms')
      .update({
        status: 'approved',
        approved_by: req.user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

router.patch(
  '/:id/reject',
  requirePermission('forms:approve'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { reason } = req.body;

    const { data, error } = await supabase
      .from('forms')
      .update({
        status: 'rejected',
        rejected_by: req.user?.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

export default router;
