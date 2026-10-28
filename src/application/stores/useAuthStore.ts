import { create } from 'zustand';
import { UserProgress } from '@/domain/entities';
import { localStorageAdapter, STORAGE_KEYS } from '@/infrastructure/storage/localStorageAdapter';
import { setAuthTokenGetter } from '@/infrastructure/http/httpClient';

interface AuthState {
  authToken: string | null;
  username: string | null;
  userRole: string;
  isAdmin: boolean;

  // Modals state
  authModalOpen: boolean;
  forgotPassModalOpen: boolean;
  changePassModalOpen: boolean;

  // Actions
  login: (token: string, username: string, role?: string, progress?: UserProgress) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
  openForgotPasswordModal: () => void;
  closeForgotPasswordModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = localStorageAdapter.getItem(STORAGE_KEYS.AUTH_TOKEN);

  return {
    authToken: initialToken,
    username: null,
    userRole: 'USER',
    isAdmin: false,

    authModalOpen: false,
    forgotPassModalOpen: false,
    changePassModalOpen: false,

    login: (token, username, role = 'USER', _progress) => {
      const assignedRole = role || (username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER');
      localStorageAdapter.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

      set({
        authToken: token,
        username,
        userRole: assignedRole,
        isAdmin: assignedRole === 'ADMIN' || username.toLowerCase() === 'admin',
        authModalOpen: false,
      });
    },

    logout: () => {
      localStorageAdapter.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      set({
        authToken: null,
        username: null,
        userRole: 'USER',
        isAdmin: false,
        authModalOpen: true,
      });
    },

    openAuthModal: () => set({ authModalOpen: true }),
    closeAuthModal: () => set({ authModalOpen: false }),

    openChangePasswordModal: () => set({ changePassModalOpen: true }),
    closeChangePasswordModal: () => set({ changePassModalOpen: false }),

    openForgotPasswordModal: () => set({ forgotPassModalOpen: true }),
    closeForgotPasswordModal: () => set({ forgotPassModalOpen: false }),
  };
});

// Bind HTTP client to Zustand auth token dynamically
setAuthTokenGetter(() => useAuthStore.getState().authToken);
