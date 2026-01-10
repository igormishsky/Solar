import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables, InsertTables, UpdateTables, ProjectStatus, InstallationStage } from '@/types/database.types';

type Project = Tables<'projects'>;
type ProjectInsert = InsertTables<'projects'>;
type ProjectUpdate = UpdateTables<'projects'>;

interface ProjectFilters {
  status?: ProjectStatus;
  customer_id?: string;
  query?: string;
}

interface ProjectWithCustomer extends Project {
  customers?: {
    first_name: string;
    last_name: string;
  };
}

interface ProjectDetail extends Project {
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
    phone_primary: string;
    email: string | null;
  };
  installation_stages?: Array<{
    id: string;
    stage: InstallationStage;
    completed: boolean;
    completed_at: string | null;
    notes: string | null;
  }>;
  project_professionals?: Array<{
    id: string;
    role: string | null;
    professionals?: {
      id: string;
      name: string;
      professional_type: string;
      phone: string | null;
      email: string | null;
    };
  }>;
}

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          customers (
            first_name,
            last_name
          )
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }

      if (filters?.query) {
        query = query.ilike('name', `%${filters.query}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProjectWithCustomer[];
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            phone_primary,
            email
          ),
          installation_stages (
            id,
            stage,
            completed,
            completed_at,
            notes
          ),
          project_professionals (
            id,
            role,
            professionals (
              id,
              name,
              professional_type,
              phone,
              email
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as ProjectDetail;
    },
    enabled: !!id,
  });
}

export function useCustomerProjects(customerId: string) {
  return useQuery({
    queryKey: queryKeys.projects.byCustomer(customerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!customerId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: ProjectInsert) => {
      const { data, error } = await (supabase
        .from('projects') as any)
        .insert(project)
        .select()
        .single();

      if (error) throw error;

      // Create initial installation stages
      const stages: InstallationStage[] = [
        'request_opened',
        'payment_processed',
        'department_response',
        'sync_compliance_request',
        'sync_request',
        'sync_complete',
        'commercial_activation',
        'standing_order_form',
      ];

      const projectData = data as Project;
      await (supabase.from('installation_stages') as any).insert(
        stages.map((stage) => ({
          project_id: projectData.id,
          stage,
          completed: false,
        }))
      );

      return projectData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.byCustomer(data.customer_id) });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectUpdate }) => {
      const { data: updated, error } = await (supabase
        .from('projects') as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.byCustomer(data.customer_id) });
    },
  });
}

export function useUpdateInstallationStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      stage,
      completed,
      notes,
    }: {
      projectId: string;
      stage: InstallationStage;
      completed: boolean;
      notes?: string;
    }) => {
      const { error } = await (supabase
        .from('installation_stages') as any)
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          notes,
        })
        .eq('project_id', projectId)
        .eq('stage', stage);

      if (error) throw error;

      // Update project's current stage if completing
      if (completed) {
        await (supabase
          .from('projects') as any)
          .update({ current_stage: stage })
          .eq('id', projectId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.stages(variables.projectId) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
