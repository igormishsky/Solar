import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tables, InsertTables, UpdateTables, FormStatus } from '@/types/database.types';
import { FORM_TYPES } from '@/constants';
import { queryKeys } from '@/lib/queryKeys';

type Form = Tables<'forms'>;
type FormInsert = InsertTables<'forms'>;
type FormUpdate = UpdateTables<'forms'>;

interface FormFilters {
  project_id?: string;
  status?: FormStatus;
  form_type?: string;
}

export function useForms(filters?: FormFilters) {
  return useQuery({
    queryKey: queryKeys.forms.list(filters),
    queryFn: async () => {
      let query = supabase.from('forms').select('*');
      if (filters?.project_id) query = query.eq('project_id', filters.project_id);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.form_type) query = query.eq('form_type', filters.form_type);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Form[];
    },
  });
}

export function useForm(id: string) {
  return useQuery({
    queryKey: queryKeys.forms.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Form;
    },
    enabled: !!id,
  });
}

export function useProjectForms(projectId: string) {
  return useQuery({
    queryKey: queryKeys.forms.byProject(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Form[];
    },
    enabled: !!projectId,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form: FormInsert) => {
      const { data, error } = await supabase.from('forms').insert(form).select().single();
      if (error) throw error;
      return data as Form;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.byProject(data.project_id) });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormUpdate }) => {
      const { data: updated, error } = await supabase
        .from('forms')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated as Form;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.byProject(data.project_id) });
    },
  });
}

export function useUpdateFormStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, signedBy }: { id: string; status: FormStatus; signedBy?: string }) => {
      const updateData: FormUpdate = {
        status,
        signed_by: signedBy,
        signed_at: status === 'approved' ? new Date().toISOString() : undefined,
      };
      const { data, error } = await supabase
        .from('forms')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Form;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.byProject(data.project_id) });
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('forms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
  });
}

export function useInitializeProjectForms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const formsToCreate: FormInsert[] = FORM_TYPES.map((formType) => ({
        project_id: projectId,
        form_type: formType.type,
        form_name: formType.name,
        form_name_he: formType.name_he,
        status: 'draft' as FormStatus,
      }));
      const { data, error } = await supabase.from('forms').insert(formsToCreate).select();
      if (error) throw error;
      return data as Form[];
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.byProject(projectId) });
    },
  });
}
