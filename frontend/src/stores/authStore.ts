import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';
import { clearAuthToken } from '../lib/api';
import { disconnectSocket } from '../lib/socket';

interface AuthStore {
  user: User | null;
  isAuthReady: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthReady: false,

      setUser: (user) => set({ user }),
      setAuthReady: (ready) => set({ isAuthReady: ready }),

      logout: async () => {
        await clearAuthToken();
        disconnectSocket();
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist the user — isAuthReady is always reset on page load
      partialize: (state) => ({ user: state.user }),
    }
  )
);
