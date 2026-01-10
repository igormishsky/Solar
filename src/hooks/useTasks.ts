import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables, InsertTables, UpdateTables, TaskPriority, TaskStatus } from '@/types/database.types';
import { addDays } from 'date-fns';

type Task = Tables<'tasks'>;
type TaskInsert = InsertTables<'tasks'>;
type TaskUpdate = UpdateTables<'tasks'>;

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  project_id?: string;
  query?: string;
}

interface TaskWithRelations extends Task {
  projects?: {
    id: string;
    name: string;
  };
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  users?: {
    id: string;
    full_name: string;
  };
}

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          projects (
            id,
            name
          ),
          customers (
            id,
            first_name,
            last_name
          )
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      const { data, error } = await query.order('due_date', { ascending: true });
      if (error) throw error;
      return data as TaskWithRelations[];
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            id,
            name
          ),
          customers (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as TaskWithRelations;
    },
    enabled: !!id,
  });
}

export function useUpcomingTasks(days: number = 7) {
  return useQuery({
    queryKey: queryKeys.tasks.upcoming(days),
    queryFn: async () => {
      const endDate = addDays(new Date(), days).toISOString();

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            id,
            name
          ),
          customers (
            id,
            first_name,
            last_name
          )
        `)
        .neq('status', 'completed')
        .lte('due_date', endDate)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as TaskWithRelations[];
    },
  });
}

export function useMyTasks(userId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.byAssignee(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            id,
            name
          ),
          customers (
            id,
            first_name,
            last_name
          )
        `)
        .eq('assigned_to', userId)
        .neq('status', 'completed')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as TaskWithRelations[];
    },
    enabled: !!userId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { data, error } = await (supabase
        .from('tasks') as any)
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskUpdate }) => {
      const { data: updated, error } = await (supabase
        .from('tasks') as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(data.id) });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const updateData: TaskUpdate = {
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      };

      const { data, error } = await (supabase
        .from('tasks') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(data.id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
