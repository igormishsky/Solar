import { useMemo } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Permission,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  isAdmin,
  canManageUsers,
  canApproveForms,
  canExportReports,
  canDelete,
} from '@/lib/permissions';
import { UserRole } from '@/types/database.types';

export function usePermissions() {
  const profile = useAuthStore((state) => state.profile);
  const role = profile?.role as UserRole | undefined;

  return useMemo(
    () => ({
      // Current user role
      role,

      // Permission checks
      can: (permission: Permission) => hasPermission(role, permission),
      canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
      canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),

      // Convenience checks
      isAdmin: isAdmin(role),
      canManageUsers: canManageUsers(role),
      canApproveForms: canApproveForms(role),
      canExportReports: canExportReports(role),
      canDeleteCustomers: canDelete(role, 'customers'),
      canDeleteProjects: canDelete(role, 'projects'),
      canDeleteTasks: canDelete(role, 'tasks'),
      canDeleteProfessionals: canDelete(role, 'professionals'),
      canDeleteDocuments: canDelete(role, 'documents'),

      // Resource-specific permissions
      customers: {
        read: hasPermission(role, 'customers:read'),
        create: hasPermission(role, 'customers:create'),
        update: hasPermission(role, 'customers:update'),
        delete: hasPermission(role, 'customers:delete'),
      },
      projects: {
        read: hasPermission(role, 'projects:read'),
        create: hasPermission(role, 'projects:create'),
        update: hasPermission(role, 'projects:update'),
        delete: hasPermission(role, 'projects:delete'),
      },
      tasks: {
        read: hasPermission(role, 'tasks:read'),
        create: hasPermission(role, 'tasks:create'),
        update: hasPermission(role, 'tasks:update'),
        delete: hasPermission(role, 'tasks:delete'),
      },
      professionals: {
        read: hasPermission(role, 'professionals:read'),
        create: hasPermission(role, 'professionals:create'),
        update: hasPermission(role, 'professionals:update'),
        delete: hasPermission(role, 'professionals:delete'),
      },
      documents: {
        read: hasPermission(role, 'documents:read'),
        upload: hasPermission(role, 'documents:upload'),
        delete: hasPermission(role, 'documents:delete'),
      },
      forms: {
        read: hasPermission(role, 'forms:read'),
        update: hasPermission(role, 'forms:update'),
        approve: hasPermission(role, 'forms:approve'),
      },
      reports: {
        view: hasPermission(role, 'reports:view'),
        export: hasPermission(role, 'reports:export'),
      },
      settings: {
        view: hasPermission(role, 'settings:view'),
        update: hasPermission(role, 'settings:update'),
      },
      users: {
        read: hasPermission(role, 'users:read'),
        create: hasPermission(role, 'users:create'),
        update: hasPermission(role, 'users:update'),
        delete: hasPermission(role, 'users:delete'),
      },
    }),
    [role]
  );
}

// Component wrapper for permission-based rendering
export function useRequirePermission(permission: Permission): boolean {
  const { can } = usePermissions();
  return can(permission);
}

// Hook to check if user can perform action on own resources only
export function useCanEditOwn(resourceUserId: string | undefined): boolean {
  const { role } = usePermissions();
  const userId = useAuthStore((state) => state.user?.id);

  // Admins and managers can edit everything
  if (role === 'administrator' || role === 'manager') return true;

  // Others can only edit their own resources
  return resourceUserId === userId;
}
