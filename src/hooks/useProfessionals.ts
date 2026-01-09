import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables, InsertTables, UpdateTables, ProfessionalType } from '@/types/database.types';
import { addDays } from 'date-fns';

type Professional = Tables<'professionals'>;
type ProfessionalInsert = InsertTables<'professionals'>;
type ProfessionalUpdate = UpdateTables<'professionals'>;

interface ProfessionalFilters {
  professional_type?: ProfessionalType;
  is_electrician?: boolean;
  query?: string;
}

export function useProfessionals(filters?: ProfessionalFilters) {
  return useQuery({
    queryKey: queryKeys.professionals.list(filters),
    queryFn: async () => {
      let query = supabase.from('professionals').select('*');

      if (filters?.professional_type) {
        query = query.eq('professional_type', filters.professional_type);
      }

      if (filters?.is_electrician !== undefined) {
        query = query.eq('is_electrician', filters.is_electrician);
      }

      if (filters?.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,company_name.ilike.%${filters.query}%,email.ilike.%${filters.query}%`
        );
      }

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      return data as Professional[];
    },
  });
}

export function useProfessional(id: string) {
  return useQuery({
    queryKey: queryKeys.professionals.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Professional;
    },
    enabled: !!id,
  });
}

export function useProfessionalsByType(type: ProfessionalType) {
  return useQuery({
    queryKey: queryKeys.professionals.byType(type),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('professional_type', type)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Professional[];
    },
  });
}

export function useExpiringLicenses(days: number = 30) {
  return useQuery({
    queryKey: queryKeys.professionals.expiringLicenses(days),
    queryFn: async () => {
      const endDate = addDays(new Date(), days).toISOString();

      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .not('license_expiry', 'is', null)
        .lte('license_expiry', endDate)
        .order('license_expiry', { ascending: true });

      if (error) throw error;
      return data as Professional[];
    },
  });
}

export function useCreateProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (professional: ProfessionalInsert) => {
      const { data, error } = await supabase
        .from('professionals')
        .insert(professional)
        .select()
        .single();

      if (error) throw error;
      return data as Professional;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.professionals.all });
    },
  });
}

export function useUpdateProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProfessionalUpdate }) => {
      const { data: updated, error } = await supabase
        .from('professionals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Professional;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.professionals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.professionals.detail(data.id) });
    },
  });
}

export function useDeleteProfessional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('professionals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.professionals.all });
    },
  });
}

export function useAssignProfessionalToProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      professionalId,
      role,
    }: {
      projectId: string;
      professionalId: string;
      role?: string;
    }) => {
      const { data, error } = await supabase
        .from('project_professionals')
        .insert({
          project_id: projectId,
          professional_id: professionalId,
          role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
    },
  });
}

export function useRemoveProfessionalFromProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      professionalId,
    }: {
      projectId: string;
      professionalId: string;
    }) => {
      const { error } = await supabase
        .from('project_professionals')
        .delete()
        .eq('project_id', projectId)
        .eq('professional_id', professionalId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
    },
  });
}
