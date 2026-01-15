import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables, AuditAction, EntityType } from '@/types/database.types';

type AuditLog = Tables<'audit_logs'> & {
  users?: {
    email: string;
    full_name: string | null;
  } | null;
};

interface AuditLogFilters {
  entity_type?: EntityType;
  entity_id?: string;
  user_id?: string;
  action?: AuditAction;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AuditLogStats {
  period_days: number;
  total_events: number;
  by_action: Record<string, number>;
  by_entity: Record<string, number>;
}

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: queryKeys.audit.list(filters),
    queryFn: async () => {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('audit_logs')
        .select('*, users:user_id(email, full_name)', { count: 'exact' });

      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }

      if (filters?.entity_id) {
        query = query.eq('entity_id', filters.entity_id);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: data as AuditLog[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      } as AuditLogResponse;
    },
  });
}

export function useEntityHistory(entityType: EntityType, entityId: string) {
  return useQuery({
    queryKey: queryKeys.audit.entity(entityType, entityId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, users:user_id(email, full_name)')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!entityType && !!entityId,
  });
}

export function useUserAuditHistory(userId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: queryKeys.audit.user(userId, page),
    queryFn: async () => {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: data as AuditLog[],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      } as AuditLogResponse;
    },
    enabled: !!userId,
  });
}

export function useAuditStats(days = 30) {
  return useQuery({
    queryKey: queryKeys.audit.stats(days),
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, entity_type')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Aggregate stats
      const byAction: Record<string, number> = {};
      const byEntity: Record<string, number> = {};

      for (const log of data || []) {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
        byEntity[log.entity_type] = (byEntity[log.entity_type] || 0) + 1;
      }

      return {
        period_days: days,
        total_events: data?.length || 0,
        by_action: byAction,
        by_entity: byEntity,
      } as AuditLogStats;
    },
  });
}
