import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables, InsertTables } from '@/types/database.types';

type Document = Tables<'documents'> & {
  uploaded_by_user?: {
    email: string;
    full_name: string | null;
  } | null;
};
type DocumentInsert = InsertTables<'documents'>;

interface DocumentFilters {
  project_id?: string;
  customer_id?: string;
}

export function useDocuments(filters?: DocumentFilters) {
  return useQuery({
    queryKey: queryKeys.documents.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*, uploaded_by_user:uploaded_by(email, full_name)');

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
        .select('*, uploaded_by_user:uploaded_by(email, full_name)')
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
    queryKey: queryKeys.documents.byProject(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, uploaded_by_user:uploaded_by(email, full_name)')
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
    queryKey: queryKeys.documents.byCustomer(customerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, uploaded_by_user:uploaded_by(email, full_name)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!customerId,
  });
}

interface UploadFileParams {
  file: {
    uri: string;
    type: string;
    name: string;
    size?: number;
  };
  name?: string;
  projectId?: string;
  customerId?: string;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, name, projectId, customerId }: UploadFileParams) => {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const folderPath = projectId
        ? `projects/${projectId}`
        : customerId
          ? `customers/${customerId}`
          : 'general';
      const filePath = `${folderPath}/${fileName}`;

      // Fetch the file and convert to blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, blob, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          name: name || file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size || null,
          project_id: projectId || null,
          customer_id: customerId || null,
          uploaded_by: user?.id || null,
        })
        .select('*, uploaded_by_user:uploaded_by(email, full_name)')
        .single();

      if (error) throw error;
      return data as Document;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.byProject(variables.projectId) });
      }
      if (variables.customerId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.documents.byCustomer(variables.customerId) });
      }
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get document first to delete from storage
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL and delete from storage
      if (document?.file_url) {
        try {
          const url = new URL(document.file_url);
          const pathParts = url.pathname.split('/storage/v1/object/public/documents/');
          if (pathParts.length > 1) {
            const filePath = pathParts[1];
            await supabase.storage.from('documents').remove([filePath]);
          }
        } catch (e) {
          // Ignore storage deletion errors
          console.warn('Failed to delete file from storage:', e);
        }
      }

      // Delete document record
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
    },
  });
}

// Hook to get a download URL for a document (handles both public and presigned URLs)
export function useDocumentDownloadUrl(documentId: string) {
  return useQuery({
    queryKey: ['documents', 'download', documentId],
    queryFn: async () => {
      const { data: document, error } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return document?.file_url || null;
    },
    enabled: !!documentId,
  });
}
