/**
 * React Query key factory for consistent cache management.
 * Uses a helper function to reduce repetition while maintaining type safety.
 */

type QueryKeyParams = string | number | object | undefined;

/**
 * Creates a query key factory for a given entity.
 * Reduces boilerplate while maintaining the same functionality.
 */
const createEntityKeys = <T extends string>(entity: T) => ({
  all: [entity] as const,
  list: (filters?: object) => [entity, 'list', filters] as const,
  detail: (id: string) => [entity, 'detail', id] as const,
  search: (query: string) => [entity, 'search', query] as const,
});

/**
 * Creates extended query keys with additional custom keys.
 */
const createEntityKeysWithExtras = <
  T extends string,
  E extends Record<string, (...args: QueryKeyParams[]) => readonly unknown[]>
>(
  entity: T,
  extras: (base: T) => E
) => ({
  ...createEntityKeys(entity),
  ...extras(entity),
});

export const queryKeys = {
  // Auth & User
  user: {
    profile: ['user', 'profile'] as const,
    settings: ['user', 'settings'] as const,
  },

  // Customers
  customers: createEntityKeys('customers'),

  // Projects - with extra keys for related queries
  projects: createEntityKeysWithExtras('projects', (base) => ({
    byCustomer: (customerId: string) => [base, 'customer', customerId] as const,
    stages: (projectId: string) => [base, 'stages', projectId] as const,
  })),

  // Tasks - with extra keys for assignments and scheduling
  tasks: createEntityKeysWithExtras('tasks', (base) => ({
    byProject: (projectId: string) => [base, 'project', projectId] as const,
    byAssignee: (userId: string) => [base, 'assignee', userId] as const,
    upcoming: (days?: number) => [base, 'upcoming', days] as const,
  })),

  // Professionals - with extra keys for type filtering and license tracking
  professionals: createEntityKeysWithExtras('professionals', (base) => ({
    byType: (type: string) => [base, 'type', type] as const,
    expiringLicenses: (days?: number) => [base, 'expiring', days] as const,
  })),

  // Forms - with extra keys for project forms and templates
  forms: createEntityKeysWithExtras('forms', (base) => ({
    byProject: (projectId: string) => [base, 'project', projectId] as const,
    templates: [base, 'templates'] as const,
  })),

  // Documents - with extra keys for project and customer documents
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

  // Monitoring
  monitoring: {
    systems: ['monitoring', 'systems'] as const,
    stats: ['monitoring', 'stats'] as const,
    project: (projectId: string) => ['monitoring', 'project', projectId] as const,
    performance: (systemId: string, range?: string) =>
      ['monitoring', 'performance', systemId, range] as const,
    alerts: ['monitoring', 'alerts'] as const,
  },
};

/**
 * Helper to invalidate all queries for an entity.
 * Usage: queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
 */
export const invalidateEntity = (entity: keyof typeof queryKeys) =>
  queryKeys[entity as 'customers'].all;
