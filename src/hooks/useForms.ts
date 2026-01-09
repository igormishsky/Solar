import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tables, InsertTables, UpdateTables, FormStatus } from '@/types/database.types';

type Form = Tables<'forms'>;
type FormInsert = InsertTables<'forms'>;
type FormUpdate = UpdateTables<'forms'>;

interface FormFilters {
  project_id?: string;
  status?: FormStatus;
  form_type?: string;
}

// Define all form types as per Israeli regulations
export const FORM_TYPES = [
  { type: 'layout_plan', name: 'Layout Plan + Grounding', name_he: 'תכנית פריסה + הארקות' },
  { type: 'pv_agreement', name: 'PV Agreement', name_he: 'הסכם PV' },
  { type: 'electrician_declaration', name: 'Executing Electrician Declaration', name_he: 'הצהרת חשמלאי מבצע' },
  { type: 'installation_submission', name: 'Installation Submission for Inspection', name_he: 'הגשת ההתקנה לביקורת' },
  { type: 'inverter_calibration', name: 'Inverter Calibration Affidavit', name_he: 'תצהיר כיול ממיר' },
  { type: 'constructor_approval', name: 'Constructor Approval', name_he: 'אישור קונסטרוקטור' },
  { type: 'regulation_24', name: 'Installation Declaration per Regulation 24', name_he: 'הצהרת התקנה לפי תקנה 24' },
  { type: 'pv_inspection', name: 'PV Installation Inspection Form', name_he: 'טופס ביקורת התקנת PV' },
  { type: 'form_1400', name: 'Form 1400', name_he: 'טופס 1400' },
  { type: 'permit_exempt', name: 'Permit-Exempt Work Report', name_he: 'דוח עבודה פטורה מהיתר' },
  { type: 'threshold_compliance', name: 'Central Form for Threshold Compliance', name_he: 'טופס מרכזי לעמידה בסף' },
] as const;

export function useForms(filters?: FormFilters) {
  return useQuery({
    queryKey: ['forms', filters],
    queryFn: async () => {
      let query = supabase.from('forms').select('*');

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.form_type) {
        query = query.eq('form_type', filters.form_type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Form[];
    },
  });
}

export function useForm(id: string) {
  return useQuery({
    queryKey: ['forms', 'detail', id],
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
    queryKey: ['forms', 'project', projectId],
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
      const { data, error } = await supabase
        .from('forms')
        .insert(form)
        .select()
        .single();

      if (error) throw error;
      return data as Form;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['forms', 'project', data.project_id] });
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
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['forms', 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['forms', 'project', data.project_id] });
    },
  });
}

export function useUpdateFormStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      signedBy,
    }: {
      id: string;
      status: FormStatus;
      signedBy?: string;
    }) => {
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
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['forms', 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['forms', 'project', data.project_id] });
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
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
}

export function useInitializeProjectForms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Create all required forms for a project
      const formsToCreate: FormInsert[] = FORM_TYPES.map((formType) => ({
        project_id: projectId,
        form_type: formType.type,
        form_name: formType.name,
        form_name_he: formType.name_he,
        status: 'draft' as FormStatus,
      }));

      const { data, error } = await supabase
        .from('forms')
        .insert(formsToCreate)
        .select();

      if (error) throw error;
      return data as Form[];
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['forms', 'project', projectId] });
    },
  });
}
