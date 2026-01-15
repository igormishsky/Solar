import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase } from '../lib';

const router = Router();

// Validation schemas
const auditQuerySchema = z.object({
  entity_type: z.enum(['customer', 'project', 'task', 'professional', 'form', 'document', 'user']).optional(),
  entity_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  action: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50).max(100),
});

// GET /api/audit - List audit logs (admin only)
router.get(
  '/',
  requireRole('administrator', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const query = auditQuerySchema.parse(req.query);

    let dbQuery = supabase
      .from('audit_logs')
      .select('*, users:user_id(email, full_name)', { count: 'exact' });

    if (query.entity_type) {
      dbQuery = dbQuery.eq('entity_type', query.entity_type);
    }

    if (query.entity_id) {
      dbQuery = dbQuery.eq('entity_id', query.entity_id);
    }

    if (query.user_id) {
      dbQuery = dbQuery.eq('user_id', query.user_id);
    }

    if (query.action) {
      dbQuery = dbQuery.eq('action', query.action);
    }

    if (query.start_date) {
      dbQuery = dbQuery.gte('created_at', query.start_date);
    }

    if (query.end_date) {
      dbQuery = dbQuery.lte('created_at', query.end_date);
    }

    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + query.limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) throw new AppError(error.message, 500);

    res.json({
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count,
        totalPages: Math.ceil((count || 0) / query.limit),
      },
    });
  })
);

// GET /api/audit/entity/:entityType/:entityId - Get audit history for a specific entity
router.get(
  '/entity/:entityType/:entityId',
  requireRole('administrator', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { entityType, entityId } = req.params;

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, users:user_id(email, full_name)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new AppError(error.message, 500);

    res.json(data);
  })
);

// GET /api/audit/user/:userId - Get audit history for a specific user's actions
router.get(
  '/user/:userId',
  requireRole('administrator'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

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

// GET /api/audit/stats - Get audit log statistics
router.get(
  '/stats',
  requireRole('administrator', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get action counts
    const { data: actionCounts, error: actionError } = await supabase
      .from('audit_logs')
      .select('action')
      .gte('created_at', startDate.toISOString());

    if (actionError) throw new AppError(actionError.message, 500);

    // Aggregate action counts
    const actionStats = (actionCounts || []).reduce((acc: Record<string, number>, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    // Get entity type counts
    const { data: entityCounts, error: entityError } = await supabase
      .from('audit_logs')
      .select('entity_type')
      .gte('created_at', startDate.toISOString());

    if (entityError) throw new AppError(entityError.message, 500);

    // Aggregate entity counts
    const entityStats = (entityCounts || []).reduce((acc: Record<string, number>, log) => {
      acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      period_days: Number(days),
      total_events: actionCounts?.length || 0,
      by_action: actionStats,
      by_entity: entityStats,
    });
  })
);

export default router;
