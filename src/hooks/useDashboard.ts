import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

interface DashboardStats {
  activeProjects: number;
  pendingTasks: number;
  totalCustomers: number;
  systemsMonitored: number;
  completedProjectsThisMonth: number;
  newCustomersThisMonth: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Fetch all counts in parallel
      const [
        projectsResult,
        tasksResult,
        customersResult,
        completedProjectsResult,
        newCustomersResult,
      ] = await Promise.all([
        // Active projects
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'in_progress']),
        // Pending tasks
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .neq('status', 'completed'),
        // Total customers
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        // Completed projects this month
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('actual_completion_date', startOfMonth.toISOString()),
        // New customers this month
        supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString()),
      ]);

      const stats: DashboardStats = {
        activeProjects: projectsResult.count || 0,
        pendingTasks: tasksResult.count || 0,
        totalCustomers: customersResult.count || 0,
        systemsMonitored: 0, // Will be implemented with monitoring integration
        completedProjectsThisMonth: completedProjectsResult.count || 0,
        newCustomersThisMonth: newCustomersResult.count || 0,
      };

      return stats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

interface RecentActivity {
  id: string;
  type: 'project' | 'task' | 'customer';
  action: 'created' | 'updated' | 'completed';
  title: string;
  timestamp: string;
}

interface ProjectActivityData {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TaskActivityData {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentActivity,
    queryFn: async () => {
      // Fetch recent items from different tables
      const [projectsResult, tasksResult] = await Promise.all([
        supabase
          .from('projects')
          .select('id, name, status, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(limit),
        supabase
          .from('tasks')
          .select('id, title, status, created_at, updated_at, completed_at')
          .order('updated_at', { ascending: false })
          .limit(limit),
      ]);

      const activities: RecentActivity[] = [];

      // Process projects
      (projectsResult.data as ProjectActivityData[] | null)?.forEach((project) => {
        const isNew = new Date(project.created_at).getTime() === new Date(project.updated_at).getTime();
        activities.push({
          id: project.id,
          type: 'project',
          action: project.status === 'completed' ? 'completed' : isNew ? 'created' : 'updated',
          title: project.name,
          timestamp: project.updated_at,
        });
      });

      // Process tasks
      (tasksResult.data as TaskActivityData[] | null)?.forEach((task) => {
        const isNew = new Date(task.created_at).getTime() === new Date(task.updated_at).getTime();
        activities.push({
          id: task.id,
          type: 'task',
          action: task.status === 'completed' ? 'completed' : isNew ? 'created' : 'updated',
          title: task.title,
          timestamp: task.completed_at || task.updated_at,
        });
      });

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
