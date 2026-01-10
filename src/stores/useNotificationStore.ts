import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  subscribeToRealtime: (userId: string) => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  subscribeToRealtime: (userId: string) => {
    // Subscribe to project updates
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          const { addNotification } = get();
          if (payload.eventType === 'INSERT') {
            addNotification({
              type: 'info',
              title: 'New Project',
              message: `Project "${(payload.new as any).name}" was created`,
              data: { projectId: (payload.new as any).id },
            });
          } else if (payload.eventType === 'UPDATE') {
            const oldStatus = (payload.old as any)?.status;
            const newStatus = (payload.new as any)?.status;
            if (oldStatus !== newStatus && newStatus === 'completed') {
              addNotification({
                type: 'success',
                title: 'Project Completed',
                message: `Project "${(payload.new as any).name}" has been completed`,
                data: { projectId: (payload.new as any).id },
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to task updates
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${userId}`,
        },
        (payload) => {
          const { addNotification } = get();
          if (payload.eventType === 'INSERT') {
            addNotification({
              type: 'info',
              title: 'New Task Assigned',
              message: `You have been assigned: "${(payload.new as any).title}"`,
              data: { taskId: (payload.new as any).id },
            });
          } else if (payload.eventType === 'UPDATE') {
            const task = payload.new as any;
            if (task.due_date) {
              const dueDate = new Date(task.due_date);
              const now = new Date();
              const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays <= 1 && diffDays >= 0) {
                addNotification({
                  type: 'warning',
                  title: 'Task Due Soon',
                  message: `Task "${task.title}" is due ${diffDays === 0 ? 'today' : 'tomorrow'}`,
                  data: { taskId: task.id },
                });
              }
            }
          }
        }
      )
      .subscribe();

    // Subscribe to form status changes
    const formsChannel = supabase
      .channel('forms-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'forms',
        },
        (payload) => {
          const { addNotification } = get();
          const form = payload.new as any;
          if (form.status === 'signature_pending') {
            addNotification({
              type: 'warning',
              title: 'Signature Required',
              message: `Form "${form.form_name}" requires your signature`,
              data: { formId: form.id, projectId: form.project_id },
            });
          } else if (form.status === 'approved') {
            addNotification({
              type: 'success',
              title: 'Form Approved',
              message: `Form "${form.form_name}" has been approved`,
              data: { formId: form.id, projectId: form.project_id },
            });
          } else if (form.status === 'rejected') {
            addNotification({
              type: 'error',
              title: 'Form Rejected',
              message: `Form "${form.form_name}" has been rejected`,
              data: { formId: form.id, projectId: form.project_id },
            });
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(formsChannel);
    };
  },
}));

// Helper hook for easy notification access
export const useNotifications = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const clearAll = useNotificationStore((state) => state.clearAll);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
};
