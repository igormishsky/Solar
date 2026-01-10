import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, requirePermission, requireRole } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { supabase } from '../lib';

const router = Router();

// GET /api/audit - List audit logs (admin/manager only)
router.get(
  '/',
  requireRole('administrator', 'manager'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const {
      action,
      entity_type,
      entity_id,
      user_id,
      start_date,
      end_date,
      page = 1,
      limit = 50
    } = req.query;

    let dbQuery = supabase
      .from('audit_logs')
      .select('*, user:users(id, full_name, email)', { count: 'exact' });

    if (action) {
      dbQuery = dbQuery.eq('action', action);
    }

    if (entity_type) {
      dbQuery = dbQuery.eq('entity_type', entity_type);
    }

    if (entity_id) {
      dbQuery = dbQuery.eq('entity_id', entity_id);
    }

    if (user_id) {
      dbQuery = dbQuery.eq('user_id', user_id);
    }

    if (start_date) {
      dbQuery = dbQuery.gte('created_at', start_date);
    }

    if (end_date) {
      dbQuery = dbQuery.lte('created_at', end_date);
    }

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

// GET /api/audit/entity/:type/:id - Get audit logs for a specific entity
router.get(
  '/entity/:type/:id',
  requirePermission('audit:read'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { type, id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('*, user:users(id, full_name, email)', { count: 'exact' })
      .eq('entity_type', type)
      .eq('entity_id', id)
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

// GET /api/audit/stats - Get audit statistics
router.get(
  '/stats',
  requireRole('administrator'),
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

    // Get entity type counts
    const { data: entityCounts, error: entityError } = await supabase
      .from('audit_logs')
      .select('entity_type')
      .gte('created_at', startDate.toISOString());

    if (entityError) throw new AppError(entityError.message, 500);

    // Count by action
    const byAction: Record<string, number> = {};
    actionCounts?.forEach((log) => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    });

    // Count by entity
    const byEntity: Record<string, number> = {};
    entityCounts?.forEach((log) => {
      byEntity[log.entity_type] = (byEntity[log.entity_type] || 0) + 1;
    });

    res.json({
      period_days: Number(days),
      total_events: actionCounts?.length || 0,
      by_action: byAction,
      by_entity: byEntity,
    });
  })
);

export default router;
