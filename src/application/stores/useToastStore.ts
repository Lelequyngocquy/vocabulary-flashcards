import { create } from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  isError: boolean;
  showToast: (message: string, isError?: boolean) => void;
  hideToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  visible: false,
  isError: false,

  showToast: (message: string, isError = false) => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    set({ message, visible: true, isError });

    toastTimer = setTimeout(() => {
      set({ visible: false });
      toastTimer = null;
    }, 3000);
  },

  hideToast: () => {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    set({ visible: false });
  },
}));
