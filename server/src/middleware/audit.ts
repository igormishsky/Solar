import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import {
  createAuditLog,
  extractChanges,
  getClientIp,
  getUserAgent,
  AuditAction,
  EntityType,
} from '../lib/audit-logger';

/**
 * Middleware factory to create audit logging middleware for specific entity types.
 * This middleware logs CREATE, UPDATE, and DELETE operations automatically.
 */
export function auditMiddleware(entityType: EntityType) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);

    // Get the old values for UPDATE operations before proceeding
    let oldValues: Record<string, unknown> | null = null;

    // Determine action based on HTTP method
    const methodToAction: Record<string, AuditAction> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    const action = methodToAction[req.method];
    if (!action) {
      return next();
    }

    // For updates and deletes, we need to capture the entity ID
    const entityId = req.params.id;

    // Override json to capture response and log audit
    res.json = function (data: Record<string, unknown>) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const auditEntry = {
          user_id: req.user?.id || null,
          action,
          entity_type: entityType,
          entity_id: entityId || (data?.id as string) || 'unknown',
          old_values: oldValues,
          new_values: action === 'DELETE' ? null : data,
          ip_address: getClientIp(req),
          user_agent: getUserAgent(req),
        };

        // Fire and forget - don't block the response
        createAuditLog(auditEntry).catch((err) => {
          console.error('Audit log failed:', err);
        });
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Helper function to manually create an audit log for custom actions.
 * Use this for actions that don't fit the standard CRUD pattern.
 */
export async function logCustomAction(
  req: AuthenticatedRequest,
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await createAuditLog({
      user_id: req.user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req),
      metadata,
    });
  } catch (err) {
    console.error('Failed to log custom action:', err);
  }
}

/**
 * Log status changes for entities like projects, tasks, and forms.
 */
export async function logStatusChange(
  req: AuthenticatedRequest,
  entityType: EntityType,
  entityId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  await logCustomAction(
    req,
    'STATUS_CHANGE',
    entityType,
    entityId,
    { status: oldStatus },
    { status: newStatus }
  );
}

/**
 * Log user authentication events.
 */
export async function logAuthEvent(
  userId: string,
  action: 'LOGIN' | 'LOGOUT',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await createAuditLog({
      user_id: userId,
      action,
      entity_type: 'user',
      entity_id: userId,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });
  } catch (err) {
    console.error('Failed to log auth event:', err);
  }
}
