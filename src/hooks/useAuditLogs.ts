import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables, AuditAction, AuditEntityType } from '@/types/database.types';

type AuditLog = Tables<'audit_logs'> & {
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
};

interface AuditLogFilters {
  action?: AuditAction;
  entity_type?: AuditEntityType;
  entity_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*, user:users(id, full_name, email)');

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }

      if (filters?.entity_id) {
        query = query.eq('entity_id', filters.entity_id);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}

export function useEntityAuditLogs(entityType: AuditEntityType, entityId: string) {
  return useQuery({
    queryKey: queryKeys.auditLogs.byEntity(entityType, entityId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, user:users(id, full_name, email)')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!entityType && !!entityId,
  });
}

export function useUserAuditLogs(userId: string) {
  return useQuery({
    queryKey: queryKeys.auditLogs.byUser(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, user:users(id, full_name, email)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!userId,
  });
}

interface AuditStats {
  period_days: number;
  total_events: number;
  by_action: Record<string, number>;
  by_entity: Record<string, number>;
}

export function useAuditStats(days: number = 30) {
  return useQuery({
    queryKey: queryKeys.auditLogs.stats(days),
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, entity_type')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const byAction: Record<string, number> = {};
      const byEntity: Record<string, number> = {};

      data?.forEach((log) => {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
        byEntity[log.entity_type] = (byEntity[log.entity_type] || 0) + 1;
      });

      return {
        period_days: days,
        total_events: data?.length || 0,
        by_action: byAction,
        by_entity: byEntity,
      } as AuditStats;
    },
  });
}
