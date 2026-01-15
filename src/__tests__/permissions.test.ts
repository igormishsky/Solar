import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  isAdmin,
} from '../lib/permissions';
import { UserRole } from '../types/database.types';

describe('Permission Functions', () => {
  describe('hasPermission', () => {
    it('should return true when administrator has any permission', () => {
      expect(hasPermission('administrator', 'customers:delete')).toBe(true);
      expect(hasPermission('administrator', 'users:create')).toBe(true);
    });

    it('should return true when manager has allowed permission', () => {
      expect(hasPermission('manager', 'customers:read')).toBe(true);
      expect(hasPermission('manager', 'reports:export')).toBe(true);
    });

    it('should return false when manager lacks permission', () => {
      expect(hasPermission('manager', 'users:create')).toBe(false);
      expect(hasPermission('manager', 'customers:delete')).toBe(false);
    });

    it('should return false when viewer has limited permissions', () => {
      expect(hasPermission('viewer', 'customers:create')).toBe(false);
      expect(hasPermission('viewer', 'projects:update')).toBe(false);
    });

    it('should return true when viewer has read permission', () => {
      expect(hasPermission('viewer', 'customers:read')).toBe(true);
      expect(hasPermission('viewer', 'projects:read')).toBe(true);
    });

    it('should return false for undefined role', () => {
      expect(hasPermission(undefined, 'customers:read')).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when role has all permissions', () => {
      const permissions = ['customers:read', 'projects:read'] as const;
      expect(hasAllPermissions('administrator', [...permissions])).toBe(true);
    });

    it('should return false when role lacks any permission', () => {
      const permissions = ['customers:read', 'customers:delete'] as const;
      expect(hasAllPermissions('viewer', [...permissions])).toBe(false);
    });

    it('should return false for undefined role', () => {
      expect(hasAllPermissions(undefined, ['customers:read'])).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when role has at least one permission', () => {
      const permissions = ['customers:read', 'customers:delete'] as const;
      expect(hasAnyPermission('viewer', [...permissions])).toBe(true);
    });

    it('should return false when role has none of the permissions', () => {
      const permissions = ['users:create', 'users:delete'] as const;
      expect(hasAnyPermission('viewer', [...permissions])).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for administrator', () => {
      const permissions = getRolePermissions('administrator');
      expect(permissions.length).toBeGreaterThan(20);
      expect(permissions).toContain('users:delete');
    });

    it('should return limited permissions for viewer', () => {
      const permissions = getRolePermissions('viewer');
      expect(permissions.every(p => p.includes(':read') || p.includes(':view'))).toBe(true);
    });
  });

  describe('isAdmin', () => {
    it('should return true for administrator', () => {
      expect(isAdmin('administrator')).toBe(true);
    });

    it('should return false for other roles', () => {
      expect(isAdmin('manager')).toBe(false);
      expect(isAdmin('viewer')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isAdmin(undefined)).toBe(false);
    });
  });
});

describe('Role Hierarchy', () => {
  const roles: UserRole[] = ['administrator', 'manager', 'office_staff', 'field_technician', 'viewer'];

  it('should have administrator with most permissions', () => {
    const adminPerms = getRolePermissions('administrator');
    roles.forEach(role => {
      if (role !== 'administrator') {
        const rolePerms = getRolePermissions(role);
        expect(adminPerms.length).toBeGreaterThan(rolePerms.length);
      }
    });
  });

  it('should have viewer with fewest permissions', () => {
    const viewerPerms = getRolePermissions('viewer');
    roles.forEach(role => {
      if (role !== 'viewer') {
        const rolePerms = getRolePermissions(role);
        expect(viewerPerms.length).toBeLessThanOrEqual(rolePerms.length);
      }
    });
  });

  it('should have all roles with at least read permissions', () => {
    roles.forEach(role => {
      expect(hasPermission(role, 'customers:read')).toBe(true);
      expect(hasPermission(role, 'projects:read')).toBe(true);
    });
  });
});
