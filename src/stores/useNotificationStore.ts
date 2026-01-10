import { create } from 'zustand';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import {
  registerForPushNotificationsAsync,
  scheduleLocalNotification,
  addNotificationResponseListener,
  addNotificationReceivedListener,
  removeNotificationListener,
  setBadgeCount,
  type NotificationType as PushNotificationType,
} from '@/lib/notifications';
import type * as ExpoNotifications from 'expo-notifications';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// Types for Supabase realtime payloads
interface ProjectPayload {
  id: string;
  name: string;
  status?: string;
}

interface TaskPayload {
  id: string;
  title: string;
  due_date?: string;
}

interface FormPayload {
  id: string;
  form_name: string;
  status: string;
  project_id: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  pushToken: string | null;
  pushEnabled: boolean;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>, sendPush?: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  subscribeToRealtime: (userId: string) => () => void;
  initializePushNotifications: () => Promise<void>;
  setPushEnabled: (enabled: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  pushToken: null,
  pushEnabled: true,

  initializePushNotifications: async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        set({ pushToken: token, pushEnabled: true });
        console.log('Push notification token:', token);
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  },

  setPushEnabled: (enabled: boolean) => {
    set({ pushEnabled: enabled });
  },

  addNotification: (notification, sendPush = true) => {
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

    // Send push notification if enabled and on native platform
    const { pushEnabled } = get();
    if (sendPush && pushEnabled && Platform.OS !== 'web') {
      scheduleLocalNotification(
        notification.title,
        notification.message,
        notification.data
      ).catch(console.error);
    }

    // Update badge count
    if (Platform.OS === 'ios') {
      const { unreadCount } = get();
      setBadgeCount(unreadCount).catch(console.error);
    }
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
          const newProject = payload.new as ProjectPayload;
          const oldProject = payload.old as ProjectPayload | null;
          if (payload.eventType === 'INSERT') {
            addNotification({
              type: 'info',
              title: 'New Project',
              message: `Project "${newProject.name}" was created`,
              data: { projectId: newProject.id },
            });
          } else if (payload.eventType === 'UPDATE') {
            const oldStatus = oldProject?.status;
            const newStatus = newProject?.status;
            if (oldStatus !== newStatus && newStatus === 'completed') {
              addNotification({
                type: 'success',
                title: 'Project Completed',
                message: `Project "${newProject.name}" has been completed`,
                data: { projectId: newProject.id },
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
          const task = payload.new as TaskPayload;
          if (payload.eventType === 'INSERT') {
            addNotification({
              type: 'info',
              title: 'New Task Assigned',
              message: `You have been assigned: "${task.title}"`,
              data: { taskId: task.id },
            });
          } else if (payload.eventType === 'UPDATE') {
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
          const form = payload.new as FormPayload;
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
