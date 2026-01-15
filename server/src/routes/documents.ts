import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { uploadSingle, handleMulterError, requireFile } from '../middleware/upload';
import { supabase } from '../lib';
import {
  uploadToS3,
  deleteFromS3,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  generateUniqueFilename,
  generateS3Key,
  extractKeyFromUrl,
  isS3Configured,
} from '../lib/s3';
import { logCustomAction } from '../middleware/audit';

const router = Router();

// Validation schemas
const documentMetadataSchema = z.object({
  name: z.string().min(1).max(255),
  project_id: z.string().uuid().optional().nullable(),
  customer_id: z.string().uuid().optional().nullable(),
});

const presignedUrlSchema = z.object({
  filename: z.string().min(1),
  content_type: z.string().min(1),
  entity_type: z.enum(['project', 'customer', 'form']),
  entity_id: z.string().uuid(),
});

// GET /api/documents/project/:projectId - Get documents for a project
router.get(
  '/project/:projectId',
  requirePermission('documents:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*, uploaded_by_user:uploaded_by(email, full_name)')
      .eq('project_id', req.params.projectId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  })
);

// GET /api/documents/customer/:customerId - Get documents for a customer
router.get(
  '/customer/:customerId',
  requirePermission('documents:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*, uploaded_by_user:uploaded_by(email, full_name)')
      .eq('customer_id', req.params.customerId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);
    res.json({ data });
  })
);

// GET /api/documents/:id - Get single document
router.get(
  '/:id',
  requirePermission('documents:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*, uploaded_by_user:uploaded_by(email, full_name)')
      .eq('id', req.params.id)
      .single();

    if (error) throw new AppError('Document not found', 404);
    res.json(data);
  })
);

// GET /api/documents/:id/download - Get presigned download URL
router.get(
  '/:id/download',
  requirePermission('documents:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Get document from database
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !document) throw new AppError('Document not found', 404);

    if (!isS3Configured) {
      // Return the stored URL directly if S3 is not configured
      res.json({ url: document.file_url });
      return;
    }

    // Extract S3 key from URL and generate presigned URL
    const key = extractKeyFromUrl(document.file_url);
    if (!key) {
      // If we can't extract the key, return the original URL
      res.json({ url: document.file_url });
      return;
    }

    const presignedUrl = await getPresignedDownloadUrl(key);
    res.json({ url: presignedUrl });
  })
);

// POST /api/documents/upload - Upload a file directly
router.post(
  '/upload',
  requirePermission('documents:upload'),
  uploadSingle,
  handleMulterError,
  requireFile,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const file = req.file!;
    const metadata = documentMetadataSchema.parse(req.body);

    // Determine entity type and ID for S3 key
    let entityType: 'project' | 'customer' = 'project';
    let entityId = metadata.project_id || metadata.customer_id || 'general';

    if (metadata.customer_id && !metadata.project_id) {
      entityType = 'customer';
      entityId = metadata.customer_id;
    }

    // Generate unique filename and S3 key
    const uniqueFilename = generateUniqueFilename(file.originalname, file.mimetype);
    const s3Key = generateS3Key(entityType, entityId, uniqueFilename);

    let fileUrl: string;

    if (isS3Configured) {
      // Upload to S3
      const result = await uploadToS3(file.buffer, s3Key, file.mimetype);
      fileUrl = result.url;
    } else {
      // S3 not configured - store as data URL for development
      const base64 = file.buffer.toString('base64');
      fileUrl = `data:${file.mimetype};base64,${base64.slice(0, 100)}...`; // Truncated for storage
      console.warn('S3 not configured. File not actually stored.');
    }

    // Save document metadata to database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        name: metadata.name || file.originalname,
        file_url: fileUrl,
        file_type: file.mimetype,
        file_size: file.size,
        project_id: metadata.project_id || null,
        customer_id: metadata.customer_id || null,
        uploaded_by: req.user?.id,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Log the upload action
    await logCustomAction(req, 'FILE_UPLOAD', 'document', data.id, null, {
      name: data.name,
      file_type: data.file_type,
      file_size: data.file_size,
    });

    res.status(201).json(data);
  })
);

// POST /api/documents/presigned-upload - Get presigned URL for direct upload
router.post(
  '/presigned-upload',
  requirePermission('documents:upload'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!isS3Configured) {
      throw new AppError('S3 is not configured. Direct upload not available.', 503);
    }

    const { filename, content_type, entity_type, entity_id } = presignedUrlSchema.parse(req.body);

    // Generate unique filename and S3 key
    const uniqueFilename = generateUniqueFilename(filename, content_type);
    const s3Key = generateS3Key(entity_type, entity_id, uniqueFilename);

    // Generate presigned upload URL
    const uploadUrl = await getPresignedUploadUrl(s3Key, content_type);

    res.json({
      upload_url: uploadUrl,
      file_key: s3Key,
      file_url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`,
    });
  })
);

// POST /api/documents - Create document record (for presigned upload completion)
router.post(
  '/',
  requirePermission('documents:upload'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { name, file_url, file_type, file_size, project_id, customer_id } = req.body;

    const { data, error } = await supabase
      .from('documents')
      .insert({
        name,
        file_url,
        file_type,
        file_size,
        project_id: project_id || null,
        customer_id: customer_id || null,
        uploaded_by: req.user?.id,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);

    // Log the upload action
    await logCustomAction(req, 'FILE_UPLOAD', 'document', data.id, null, {
      name: data.name,
      file_type: data.file_type,
      file_size: data.file_size,
    });

    res.status(201).json(data);
  })
);

// DELETE /api/documents/:id - Delete document
router.delete(
  '/:id',
  requirePermission('documents:delete'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    // Get document first to get file URL
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !document) {
      throw new AppError('Document not found', 404);
    }

    // Delete from S3 if configured
    if (isS3Configured && document.file_url) {
      const key = extractKeyFromUrl(document.file_url);
      if (key) {
        try {
          await deleteFromS3(key);
        } catch (err) {
          console.error('Failed to delete file from S3:', err);
          // Continue with database deletion even if S3 fails
        }
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', req.params.id);

    if (error) throw new AppError(error.message, 500);

    // Log the deletion
    await logCustomAction(req, 'FILE_DELETE', 'document', req.params.id, document, null);

    res.status(204).send();
  })
);

export default router;
