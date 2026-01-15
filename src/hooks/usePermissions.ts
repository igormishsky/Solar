import { useMemo } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Permission, hasPermission, hasAllPermissions, hasAnyPermission, isAdmin } from '@/lib/permissions';
import { UserRole } from '@/types/database.types';

export function usePermissions() {
  const profile = useAuthStore((state) => state.profile);
  const role = profile?.role as UserRole | undefined;

  return useMemo(() => {
    const can = (permission: Permission) => hasPermission(role, permission);

    return {
      role,
      can,
      canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
      canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
      isAdmin: isAdmin(role),

      // Resource permissions - computed on demand via can()
      customers: {
        read: can('customers:read'),
        create: can('customers:create'),
        update: can('customers:update'),
        delete: can('customers:delete'),
      },
      projects: {
        read: can('projects:read'),
        create: can('projects:create'),
        update: can('projects:update'),
        delete: can('projects:delete'),
      },
      tasks: {
        read: can('tasks:read'),
        create: can('tasks:create'),
        update: can('tasks:update'),
        delete: can('tasks:delete'),
      },
      professionals: {
        read: can('professionals:read'),
        create: can('professionals:create'),
        update: can('professionals:update'),
        delete: can('professionals:delete'),
      },
      documents: {
        read: can('documents:read'),
        upload: can('documents:upload'),
        delete: can('documents:delete'),
      },
      forms: {
        read: can('forms:read'),
        update: can('forms:update'),
        approve: can('forms:approve'),
      },
      reports: {
        view: can('reports:view'),
        export: can('reports:export'),
      },
      settings: {
        view: can('settings:view'),
        update: can('settings:update'),
      },
      users: {
        read: can('users:read'),
        create: can('users:create'),
        update: can('users:update'),
        delete: can('users:delete'),
      },
    };
  }, [role]);
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
