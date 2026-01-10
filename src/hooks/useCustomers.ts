import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';
import { Tables, InsertTables, UpdateTables } from '@/types/database.types';

type Customer = Tables<'customers'>;
type CustomerInsert = InsertTables<'customers'>;
type CustomerUpdate = UpdateTables<'customers'>;

interface CustomerFilters {
  customer_type?: string;
  city?: string;
  query?: string;
}

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: async () => {
      let query = supabase.from('customers').select('*');

      if (filters?.customer_type) {
        query = query.eq('customer_type', filters.customer_type);
      }

      if (filters?.city) {
        query = query.or(`residential_city.ilike.%${filters.city}%,property_city.ilike.%${filters.city}%`);
      }

      if (filters?.query) {
        query = query.or(
          `first_name.ilike.%${filters.query}%,last_name.ilike.%${filters.query}%,phone_primary.ilike.%${filters.query}%,email.ilike.%${filters.query}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Customer;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: CustomerInsert) => {
      const { data, error } = await (supabase
        .from('customers') as any)
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerUpdate }) => {
      const { data: updated, error } = await (supabase
        .from('customers') as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Customer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(data.id) });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}
