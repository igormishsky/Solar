import { create } from 'zustand';
import { ModalIdType } from '@/constants';

interface AppState {
  // Sidebar/Navigation
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Loading states
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Modal states - using typed modal IDs
  activeModal: ModalIdType | null;
  modalData: Record<string, unknown> | null;
  openModal: (modalId: ModalIdType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  isModalOpen: (modalId: ModalIdType) => boolean;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: Date;
  duration?: number;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // Loading
  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  // Modal
  activeModal: null,
  modalData: null,
  openModal: (modalId, data = {}) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  isModalOpen: (modalId) => get().activeModal === modalId,

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

export const useSidebar = () => useAppStore((state) => ({
  isOpen: state.isSidebarOpen,
  toggle: state.toggleSidebar,
  setOpen: state.setSidebarOpen,
}));

export const useModal = () => useAppStore((state) => ({
  activeModal: state.activeModal,
  modalData: state.modalData,
  open: state.openModal,
  close: state.closeModal,
  isOpen: state.isModalOpen,
}));

export const useNotifications = () => useAppStore((state) => ({
  notifications: state.notifications,
  add: state.addNotification,
  remove: state.removeNotification,
  clear: state.clearNotifications,
}));
