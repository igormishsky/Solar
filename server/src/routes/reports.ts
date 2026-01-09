import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');

// Dashboard stats
router.get('/dashboard', requirePermission('reports:view'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [projectsResult, tasksResult, customersResult, completedResult, newCustomersResult] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).neq('status', 'completed'),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'completed').gte('actual_completion_date', startOfMonth.toISOString()),
    supabase.from('customers').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
  ]);

  res.json({
    activeProjects: projectsResult.count || 0,
    pendingTasks: tasksResult.count || 0,
    totalCustomers: customersResult.count || 0,
    systemsMonitored: 0,
    completedProjectsThisMonth: completedResult.count || 0,
    newCustomersThisMonth: newCustomersResult.count || 0,
  });
}));

// Summary report
router.get('/summary', requirePermission('reports:view'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const [customers, projects, activeProjects, completedProjects, tasks, pendingTasks, professionals] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'completed'),
    supabase.from('professionals').select('*', { count: 'exact', head: true }),
  ]);

  res.json({
    totalCustomers: customers.count || 0,
    totalProjects: projects.count || 0,
    activeProjects: activeProjects.count || 0,
    completedProjects: completedProjects.count || 0,
    totalTasks: tasks.count || 0,
    pendingTasks: pendingTasks.count || 0,
    registeredProfessionals: professionals.count || 0,
    generatedAt: new Date().toISOString(),
  });
}));

// Project report
router.get('/project/:projectId', requirePermission('reports:view'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`*, customers (*), installation_stages (*), project_professionals (*, professionals (*))`)
    .eq('id', req.params.projectId)
    .single();

  if (projectError) throw new AppError('Project not found', 404);

  const [tasks, forms, documents] = await Promise.all([
    supabase.from('tasks').select('*').eq('project_id', req.params.projectId),
    supabase.from('forms').select('*').eq('project_id', req.params.projectId),
    supabase.from('documents').select('*').eq('project_id', req.params.projectId),
  ]);

  res.json({
    project,
    tasks: tasks.data || [],
    forms: forms.data || [],
    documents: documents.data || [],
    generatedAt: new Date().toISOString(),
  });
}));

// Projects by status
router.get('/projects-by-status', requirePermission('reports:view'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const statuses = ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'];
  const results = await Promise.all(
    statuses.map((status) =>
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', status)
    )
  );

  res.json(
    statuses.reduce((acc, status, index) => {
      acc[status] = results[index].count || 0;
      return acc;
    }, {} as Record<string, number>)
  );
}));

// Tasks by priority
router.get('/tasks-by-priority', requirePermission('reports:view'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const results = await Promise.all(
    priorities.map((priority) =>
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('priority', priority).neq('status', 'completed')
    )
  );

  res.json(
    priorities.reduce((acc, priority, index) => {
      acc[priority] = results[index].count || 0;
      return acc;
    }, {} as Record<string, number>)
  );
}));

// Expiring licenses
router.get('/expiring-licenses', requirePermission('reports:view'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .not('license_expiry', 'is', null)
    .lte('license_expiry', endDate)
    .order('license_expiry', { ascending: true });

  if (error) throw new AppError(error.message, 500);
  res.json({ data, count: data?.length || 0 });
}));

export default router;
