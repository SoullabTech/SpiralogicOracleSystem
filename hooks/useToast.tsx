import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, options?: { type?: Toast['type'] }) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, options = {}) => {
    const id = Date.now().toString();
    const toast: Toast = {
      id,
      message,
      type: options.type || 'info'
    };

    set((state) => ({
      toasts: [...state.toasts, toast]
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, 5000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  }
}));

export function useToast() {
  const { addToast, removeToast, toasts } = useToastStore();

  const toast = (message: string, options?: { type?: Toast['type'] }) => {
    addToast(message, options);
  };

  return { toast, removeToast, toasts };
}