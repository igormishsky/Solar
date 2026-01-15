import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface NotificationPreferences {
  id?: string;
  user_id: string;
  task_assigned: boolean;
  project_status: boolean;
  form_approved: boolean;
  form_rejected: boolean;
  license_expiry: boolean;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'user_id'> = {
  task_assigned: true,
  project_status: true,
  form_approved: true,
  form_rejected: true,
  license_expiry: true,
};

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Return default preferences if none exist
      if (error && error.code === 'PGRST116') {
        return {
          user_id: user.id,
          ...DEFAULT_PREFERENCES,
        } as NotificationPreferences;
      }

      if (error) throw error;
      return data as NotificationPreferences;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as NotificationPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // This would typically call the backend API
      // For now, we'll just return a mock success
      return { success: true, message: 'Test email sent' };
    },
  });
}
