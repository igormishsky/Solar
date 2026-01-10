import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from './supabase';

// CSV Export utilities
export async function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  headers?: string[]
): Promise<void> {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first item if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Build CSV content
  const csvContent = [
    csvHeaders.join(','),
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        })
        .join(',')
    ),
  ].join('\n');

  // Save to file system
  const fileUri = `${FileSystem.documentDirectory}${filename}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Share the file
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: `Export ${filename}`,
    });
  }
}

// Export customers
export async function exportCustomers(): Promise<void> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const exportData = (data as any[]).map((customer) => ({
    'First Name': customer.first_name,
    'Last Name': customer.last_name,
    'ID Number': customer.id_number || '',
    'Phone': customer.phone_primary,
    'Phone Secondary': customer.phone_secondary || '',
    'Email': customer.email || '',
    'Type': customer.customer_type,
    'Residential City': customer.residential_city || '',
    'Residential Street': customer.residential_street || '',
    'Property City': customer.property_city || '',
    'Property Street': customer.property_street || '',
    'IEC Contract': customer.iec_contract_number || '',
    'IEC Meter': customer.iec_meter_number || '',
    'Created At': new Date(customer.created_at).toLocaleDateString(),
  }));

  await exportToCSV(exportData, `customers_${Date.now()}`);
}

// Export projects
export async function exportProjects(): Promise<void> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      customers (
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const exportData = data.map((project: any) => ({
    'Project Name': project.name,
    'Customer': project.customers
      ? `${project.customers.first_name} ${project.customers.last_name}`
      : '',
    'Status': project.status,
    'Current Stage': project.current_stage,
    'System Size (kW)': project.system_size_kw || '',
    'Panel Count': project.panel_count || '',
    'Inverter Model': project.inverter_model || '',
    'Est. Annual Production (kWh)': project.estimated_annual_production || '',
    'Start Date': project.start_date
      ? new Date(project.start_date).toLocaleDateString()
      : '',
    'Est. Completion': project.estimated_completion_date
      ? new Date(project.estimated_completion_date).toLocaleDateString()
      : '',
    'Actual Completion': project.actual_completion_date
      ? new Date(project.actual_completion_date).toLocaleDateString()
      : '',
    'Created At': new Date(project.created_at).toLocaleDateString(),
  }));

  await exportToCSV(exportData, `projects_${Date.now()}`);
}

// Export tasks
export async function exportTasks(): Promise<void> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      projects (
        name
      ),
      customers (
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const exportData = data.map((task: any) => ({
    'Title': task.title,
    'Description': task.description || '',
    'Status': task.status,
    'Priority': task.priority,
    'Project': task.projects?.name || '',
    'Customer': task.customers
      ? `${task.customers.first_name} ${task.customers.last_name}`
      : '',
    'Due Date': task.due_date
      ? new Date(task.due_date).toLocaleDateString()
      : '',
    'Completed At': task.completed_at
      ? new Date(task.completed_at).toLocaleDateString()
      : '',
    'Created At': new Date(task.created_at).toLocaleDateString(),
  }));

  await exportToCSV(exportData, `tasks_${Date.now()}`);
}

// Export professionals
export async function exportProfessionals(): Promise<void> {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  const exportData = (data as any[]).map((pro) => ({
    'Name': pro.name,
    'Type': pro.professional_type,
    'Company Name': pro.company_name || '',
    'Company ID': pro.company_id || '',
    'ID Number': pro.id_number || '',
    'Phone': pro.phone || '',
    'Email': pro.email || '',
    'License Type': pro.license_type || '',
    'License Number': pro.license_number || '',
    'License Expiry': pro.license_expiry
      ? new Date(pro.license_expiry).toLocaleDateString()
      : '',
    'Is Electrician': pro.is_electrician ? 'Yes' : 'No',
    'Created At': new Date(pro.created_at).toLocaleDateString(),
  }));

  await exportToCSV(exportData, `professionals_${Date.now()}`);
}

// Export project report (detailed)
export async function exportProjectReport(projectId: string): Promise<void> {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      customers (*),
      installation_stages (*),
      project_professionals (
        *,
        professionals (*)
      )
    `)
    .eq('id', projectId)
    .single();

  if (projectError) throw projectError;

  const projectData = project as any;

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId);

  const { data: forms } = await supabase
    .from('forms')
    .select('*')
    .eq('project_id', projectId);

  // Create a detailed report
  const reportData = [
    {
      Section: 'Project Info',
      Field: 'Name',
      Value: projectData.name,
    },
    {
      Section: 'Project Info',
      Field: 'Status',
      Value: projectData.status,
    },
    {
      Section: 'Project Info',
      Field: 'Current Stage',
      Value: projectData.current_stage,
    },
    {
      Section: 'Project Info',
      Field: 'System Size (kW)',
      Value: projectData.system_size_kw || '-',
    },
    {
      Section: 'Customer',
      Field: 'Name',
      Value: projectData.customers
        ? `${projectData.customers.first_name} ${projectData.customers.last_name}`
        : '-',
    },
    {
      Section: 'Customer',
      Field: 'Phone',
      Value: projectData.customers?.phone_primary || '-',
    },
    {
      Section: 'Customer',
      Field: 'Email',
      Value: projectData.customers?.email || '-',
    },
    ...(projectData.installation_stages || []).map((stage: any) => ({
      Section: 'Installation Stages',
      Field: stage.stage,
      Value: stage.completed ? `Completed (${new Date(stage.completed_at).toLocaleDateString()})` : 'Pending',
    })),
    ...(projectData.project_professionals || []).map((pp: any) => ({
      Section: 'Team',
      Field: pp.professionals?.professional_type || 'Unknown',
      Value: pp.professionals?.name || '-',
    })),
    ...(tasks || []).map((task: any) => ({
      Section: 'Tasks',
      Field: task.title,
      Value: `${task.status} (${task.priority})`,
    })),
    ...(forms || []).map((form: any) => ({
      Section: 'Forms',
      Field: form.form_name,
      Value: form.status,
    })),
  ];

  await exportToCSV(reportData, `project_report_${projectData.name}_${Date.now()}`);
}

// Generate summary statistics
export async function exportSummaryReport(): Promise<void> {
  const [
    { count: customersCount },
    { count: projectsCount },
    { count: activeProjectsCount },
    { count: completedProjectsCount },
    { count: tasksCount },
    { count: pendingTasksCount },
    { count: professionalsCount },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'completed'),
    supabase.from('professionals').select('*', { count: 'exact', head: true }),
  ]);

  const reportData = [
    { Metric: 'Total Customers', Value: customersCount || 0 },
    { Metric: 'Total Projects', Value: projectsCount || 0 },
    { Metric: 'Active Projects', Value: activeProjectsCount || 0 },
    { Metric: 'Completed Projects', Value: completedProjectsCount || 0 },
    { Metric: 'Total Tasks', Value: tasksCount || 0 },
    { Metric: 'Pending Tasks', Value: pendingTasksCount || 0 },
    { Metric: 'Registered Professionals', Value: professionalsCount || 0 },
    { Metric: 'Report Generated', Value: new Date().toLocaleString() },
  ];

  await exportToCSV(reportData, `summary_report_${Date.now()}`);
}
