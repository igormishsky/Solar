import { supabase } from './supabase';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PERMISSION_CHANGE'
  | 'FILE_UPLOAD'
  | 'FILE_DELETE'
  | 'FORM_SUBMIT'
  | 'FORM_APPROVE'
  | 'FORM_REJECT';

export type EntityType =
  | 'customer'
  | 'project'
  | 'task'
  | 'professional'
  | 'form'
  | 'document'
  | 'user';

export interface AuditLogEntry {
  user_id: string | null;
  action: AuditAction;
  entity_type: EntityType;
  entity_id: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AuditLogRecord extends AuditLogEntry {
  id: string;
  created_at: string;
}

/**
 * Creates an audit log entry in the database.
 * This function should be called after successful operations to maintain a complete audit trail.
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<AuditLogRecord | null> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: entry.user_id,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        old_values: entry.old_values || null,
        new_values: entry.new_values || null,
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null,
        metadata: entry.metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create audit log:', error);
      return null;
    }

    return data as AuditLogRecord;
  } catch (err) {
    console.error('Audit logging error:', err);
    return null;
  }
}

/**
 * Helper function to extract relevant changes between old and new values.
 * Filters out unchanged values to keep audit logs clean.
 */
export function extractChanges(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
): { old: Record<string, unknown>; new: Record<string, unknown> } {
  const changedOld: Record<string, unknown> = {};
  const changedNew: Record<string, unknown> = {};

  // Fields to exclude from audit logs (sensitive or unnecessary)
  const excludeFields = ['updated_at', 'created_at'];

  for (const key of Object.keys(newValues)) {
    if (excludeFields.includes(key)) continue;

    if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
      changedOld[key] = oldValues[key];
      changedNew[key] = newValues[key];
    }
  }

  return { old: changedOld, new: changedNew };
}

/**
 * Get client IP address from request headers.
 * Handles proxied requests through X-Forwarded-For header.
 */
export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

/**
 * Get user agent from request headers.
 */
export function getUserAgent(req: { headers: Record<string, string | string[] | undefined> }): string {
  const userAgent = req.headers['user-agent'];
  return typeof userAgent === 'string' ? userAgent : 'unknown';
}
