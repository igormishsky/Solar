import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables, InsertTables } from '@/types/database.types';

type Document = Tables<'documents'>;
type DocumentInsert = InsertTables<'documents'>;

interface DocumentFilters {
  project_id?: string;
  customer_id?: string;
}

export function useDocuments(filters?: DocumentFilters) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: async () => {
      let query = supabase.from('documents').select('*');

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Document;
    },
    enabled: !!id,
  });
}

export function useProjectDocuments(projectId: string) {
  return useQuery({
    queryKey: ['documents', 'project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!projectId,
  });
}

export function useCustomerDocuments(customerId: string) {
  return useQuery({
    queryKey: ['documents', 'customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!customerId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      name,
      projectId,
      customerId,
      uploadedBy,
    }: {
      file: { uri: string; type: string; name: string };
      name: string;
      projectId?: string;
      customerId?: string;
      uploadedBy?: string;
    }) => {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: fileName,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          project_id: projectId,
          customer_id: customerId,
          uploaded_by: uploadedBy,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Document;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: ['documents', 'project', variables.projectId] });
      }
      if (variables.customerId) {
        queryClient.invalidateQueries({ queryKey: ['documents', 'customer', variables.customerId] });
      }
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
