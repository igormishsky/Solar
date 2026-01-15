import { UserRole } from '@/types/database.types';

// Define all permissions in the system
export type Permission =
  | 'customers:read'
  | 'customers:create'
  | 'customers:update'
  | 'customers:delete'
  | 'projects:read'
  | 'projects:create'
  | 'projects:update'
  | 'projects:delete'
  | 'tasks:read'
  | 'tasks:create'
  | 'tasks:update'
  | 'tasks:delete'
  | 'professionals:read'
  | 'professionals:create'
  | 'professionals:update'
  | 'professionals:delete'
  | 'documents:read'
  | 'documents:upload'
  | 'documents:delete'
  | 'forms:read'
  | 'forms:update'
  | 'forms:approve'
  | 'reports:view'
  | 'reports:export'
  | 'settings:view'
  | 'settings:update'
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete';

// Role-based permission matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  administrator: [
    // Full access to everything
    'customers:read', 'customers:create', 'customers:update', 'customers:delete',
    'projects:read', 'projects:create', 'projects:update', 'projects:delete',
    'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete',
    'professionals:read', 'professionals:create', 'professionals:update', 'professionals:delete',
    'documents:read', 'documents:upload', 'documents:delete',
    'forms:read', 'forms:update', 'forms:approve',
    'reports:view', 'reports:export',
    'settings:view', 'settings:update',
    'users:read', 'users:create', 'users:update', 'users:delete',
  ],
  manager: [
    // Dashboard, reporting, project management, but no user management
    'customers:read', 'customers:create', 'customers:update',
    'projects:read', 'projects:create', 'projects:update',
    'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete',
    'professionals:read', 'professionals:create', 'professionals:update',
    'documents:read', 'documents:upload',
    'forms:read', 'forms:update', 'forms:approve',
    'reports:view', 'reports:export',
    'settings:view',
  ],
  office_staff: [
    // Customer management, documentation, basic project views
    'customers:read', 'customers:create', 'customers:update',
    'projects:read', 'projects:create', 'projects:update',
    'tasks:read', 'tasks:create', 'tasks:update',
    'professionals:read',
    'documents:read', 'documents:upload',
    'forms:read', 'forms:update',
    'reports:view',
    'settings:view',
  ],
  field_technician: [
    // Mobile task updates, progress tracking
    'customers:read',
    'projects:read',
    'tasks:read', 'tasks:update', // Can only update assigned tasks
    'professionals:read',
    'documents:read', 'documents:upload',
    'forms:read',
    'settings:view',
  ],
  viewer: [
    // Read-only access
    'customers:read',
    'projects:read',
    'tasks:read',
    'professionals:read',
    'documents:read',
    'forms:read',
    'reports:view',
    'settings:view',
  ],
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((permission) => hasPermission(role, permission));
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((permission) => hasPermission(role, permission));
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Check if role is administrator
export function isAdmin(role: UserRole | undefined): boolean {
  return role === 'administrator';
}
