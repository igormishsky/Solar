export const queryKeys = {
  // Auth & User
  user: {
    profile: ['user', 'profile'] as const,
    settings: ['user', 'settings'] as const,
  },

  // Customers
  customers: {
    all: ['customers'] as const,
    list: (filters?: object) => ['customers', 'list', filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    search: (query: string) => ['customers', 'search', query] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    list: (filters?: object) => ['projects', 'list', filters] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    byCustomer: (customerId: string) => ['projects', 'customer', customerId] as const,
    stages: (projectId: string) => ['projects', 'stages', projectId] as const,
  },

  // Tasks
  tasks: {
    all: ['tasks'] as const,
    list: (filters?: object) => ['tasks', 'list', filters] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    byProject: (projectId: string) => ['tasks', 'project', projectId] as const,
    byAssignee: (userId: string) => ['tasks', 'assignee', userId] as const,
    upcoming: (days?: number) => ['tasks', 'upcoming', days] as const,
  },

  // Professionals
  professionals: {
    all: ['professionals'] as const,
    list: (filters?: object) => ['professionals', 'list', filters] as const,
    detail: (id: string) => ['professionals', 'detail', id] as const,
    byType: (type: string) => ['professionals', 'type', type] as const,
    expiringLicenses: (days?: number) => ['professionals', 'expiring', days] as const,
  },

  // Forms
  forms: {
    all: ['forms'] as const,
    list: (filters?: object) => ['forms', 'list', filters] as const,
    detail: (id: string) => ['forms', 'detail', id] as const,
    byProject: (projectId: string) => ['forms', 'project', projectId] as const,
    templates: ['forms', 'templates'] as const,
  },

  // Documents
  documents: {
    all: ['documents'] as const,
    list: (filters?: object) => ['documents', 'list', filters] as const,
    byProject: (projectId: string) => ['documents', 'project', projectId] as const,
    byCustomer: (customerId: string) => ['documents', 'customer', customerId] as const,
  },

  // Dashboard
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    recentActivity: ['dashboard', 'activity'] as const,
    upcomingTasks: ['dashboard', 'upcoming'] as const,
  },

  // Monitoring (Phase 2)
  monitoring: {
    systems: ['monitoring', 'systems'] as const,
    performance: (systemId: string, range?: string) => ['monitoring', 'performance', systemId, range] as const,
    alerts: ['monitoring', 'alerts'] as const,
  },
};
