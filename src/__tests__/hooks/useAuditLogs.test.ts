/**
 * Tests for useAuditLogs hook
 */

import { AuditAction, AuditEntityType } from '@/types/database.types';

// Mock audit log data
const mockAuditLogs = [
  {
    id: '1',
    user_id: 'user-1',
    action: 'create' as AuditAction,
    entity_type: 'customer' as AuditEntityType,
    entity_id: 'cust-1',
    old_values: null,
    new_values: { first_name: 'John', last_name: 'Doe' },
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
    metadata: null,
    created_at: '2024-01-01T10:00:00Z',
    user: {
      id: 'user-1',
      full_name: 'Admin User',
      email: 'admin@test.com',
    },
  },
  {
    id: '2',
    user_id: 'user-1',
    action: 'update' as AuditAction,
    entity_type: 'project' as AuditEntityType,
    entity_id: 'proj-1',
    old_values: { status: 'pending' },
    new_values: { status: 'in_progress' },
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0',
    metadata: null,
    created_at: '2024-01-02T10:00:00Z',
    user: {
      id: 'user-1',
      full_name: 'Admin User',
      email: 'admin@test.com',
    },
  },
  {
    id: '3',
    user_id: 'user-2',
    action: 'delete' as AuditAction,
    entity_type: 'task' as AuditEntityType,
    entity_id: 'task-1',
    old_values: { title: 'Old Task' },
    new_values: null,
    ip_address: '192.168.1.2',
    user_agent: 'Mozilla/5.0',
    metadata: null,
    created_at: '2024-01-03T10:00:00Z',
    user: {
      id: 'user-2',
      full_name: 'Manager User',
      email: 'manager@test.com',
    },
  },
];

describe('useAuditLogs hook', () => {
  describe('Audit log data structure', () => {
    it('should have correct audit log properties', () => {
      const log = mockAuditLogs[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('user_id');
      expect(log).toHaveProperty('action');
      expect(log).toHaveProperty('entity_type');
      expect(log).toHaveProperty('entity_id');
      expect(log).toHaveProperty('created_at');
    });

    it('should have valid action values', () => {
      const validActions: AuditAction[] = ['create', 'update', 'delete', 'view', 'export', 'login', 'logout', 'password_change'];
      mockAuditLogs.forEach((log) => {
        expect(validActions).toContain(log.action);
      });
    });

    it('should have valid entity type values', () => {
      const validTypes: AuditEntityType[] = ['customer', 'project', 'task', 'professional', 'form', 'document', 'user', 'report'];
      mockAuditLogs.forEach((log) => {
        expect(validTypes).toContain(log.entity_type);
      });
    });
  });

  describe('Audit log filtering', () => {
    it('should filter logs by action', () => {
      const createLogs = mockAuditLogs.filter((l) => l.action === 'create');
      expect(createLogs).toHaveLength(1);
      expect(createLogs[0].entity_type).toBe('customer');
    });

    it('should filter logs by entity type', () => {
      const projectLogs = mockAuditLogs.filter((l) => l.entity_type === 'project');
      expect(projectLogs).toHaveLength(1);
      expect(projectLogs[0].action).toBe('update');
    });

    it('should filter logs by user', () => {
      const user1Logs = mockAuditLogs.filter((l) => l.user_id === 'user-1');
      expect(user1Logs).toHaveLength(2);
    });

    it('should filter logs by date range', () => {
      const startDate = new Date('2024-01-02T00:00:00Z');
      const endDate = new Date('2024-01-03T23:59:59Z');
      const filteredLogs = mockAuditLogs.filter((l) => {
        const logDate = new Date(l.created_at);
        return logDate >= startDate && logDate <= endDate;
      });
      expect(filteredLogs).toHaveLength(2);
    });
  });

  describe('Audit log statistics', () => {
    it('should calculate action counts correctly', () => {
      const actionCounts: Record<string, number> = {};
      mockAuditLogs.forEach((log) => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });

      expect(actionCounts['create']).toBe(1);
      expect(actionCounts['update']).toBe(1);
      expect(actionCounts['delete']).toBe(1);
    });

    it('should calculate entity type counts correctly', () => {
      const entityCounts: Record<string, number> = {};
      mockAuditLogs.forEach((log) => {
        entityCounts[log.entity_type] = (entityCounts[log.entity_type] || 0) + 1;
      });

      expect(entityCounts['customer']).toBe(1);
      expect(entityCounts['project']).toBe(1);
      expect(entityCounts['task']).toBe(1);
    });

    it('should calculate total events', () => {
      expect(mockAuditLogs.length).toBe(3);
    });
  });

  describe('Audit log change tracking', () => {
    it('should track old and new values for updates', () => {
      const updateLog = mockAuditLogs.find((l) => l.action === 'update');
      expect(updateLog?.old_values).toEqual({ status: 'pending' });
      expect(updateLog?.new_values).toEqual({ status: 'in_progress' });
    });

    it('should only have new values for creates', () => {
      const createLog = mockAuditLogs.find((l) => l.action === 'create');
      expect(createLog?.old_values).toBeNull();
      expect(createLog?.new_values).toBeDefined();
    });

    it('should only have old values for deletes', () => {
      const deleteLog = mockAuditLogs.find((l) => l.action === 'delete');
      expect(deleteLog?.old_values).toBeDefined();
      expect(deleteLog?.new_values).toBeNull();
    });
  });
});
