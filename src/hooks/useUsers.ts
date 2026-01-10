import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables, UpdateTables, UserRole } from '@/types/database.types';

type User = Tables<'users'>;
type UserUpdate = UpdateTables<'users'>;

interface UserFilters {
  role?: UserRole;
  query?: string;
}

interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
  phone?: string | null;
}

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: async () => {
      let query = supabase.from('users').select('*');

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.query) {
        query = query.or(
          `full_name.ilike.%${filters.query}%,email.ilike.%${filters.query}%,phone.ilike.%${filters.query}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as User[];
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as User;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create user profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: input.email,
          full_name: input.full_name,
          role: input.role || 'viewer',
          phone: input.phone,
        })
        .select()
        .single();

      if (error) {
        // Rollback: delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw error;
      }

      return data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserUpdate }) => {
      const { data: updated, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as User;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(data.id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete user via Supabase Auth (cascades to users table)
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const { error } = await supabase.auth.admin.updateUserById(id, {
        password,
      });
      if (error) throw error;
    },
  });
}
