import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { supabase } from '../lib';

export type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'password_change';
export type EntityType = 'customer' | 'project' | 'task' | 'professional' | 'form' | 'document' | 'user' | 'report';

interface AuditLogEntry {
  user_id: string;
  action: AuditAction;
  entity_type: EntityType;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: entry.user_id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      old_values: entry.old_values,
      new_values: entry.new_values,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      metadata: entry.metadata,
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Middleware to automatically log audit events for common operations
 */
export function auditMiddleware(entityType: EntityType) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = function (body: unknown) {
      // Determine action based on HTTP method
      let action: AuditAction;
      switch (req.method) {
        case 'POST':
          action = 'create';
          break;
        case 'PUT':
        case 'PATCH':
          action = 'update';
          break;
        case 'DELETE':
          action = 'delete';
          break;
        case 'GET':
          // Only log single entity views, not list views
          if (req.params.id) {
            action = 'view';
          } else {
            return originalJson(body);
          }
          break;
        default:
          return originalJson(body);
      }

      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const entityId = req.params.id || (typeof body === 'object' && body !== null && 'id' in body ? (body as { id: string }).id : undefined);

        logAuditEvent({
          user_id: req.user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          old_values: req.method === 'PUT' || req.method === 'PATCH' ? undefined : undefined,
          new_values: req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH'
            ? (typeof body === 'object' ? body as Record<string, unknown> : undefined)
            : undefined,
          ip_address: req.ip || req.socket.remoteAddress,
          user_agent: req.headers['user-agent'],
        });
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Helper to log export events
 */
export function logExportEvent(req: AuthenticatedRequest, entityType: EntityType, metadata?: Record<string, unknown>): void {
  if (req.user) {
    logAuditEvent({
      user_id: req.user.id,
      action: 'export',
      entity_type: entityType,
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'],
      metadata,
    });
  }
}
