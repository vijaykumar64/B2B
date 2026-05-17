import { useEffect } from 'react';
import { api, isAuthenticated, clearAuthToken } from '../lib/api';
import { onSessionExpired } from '../lib/authEvents';
import { connectSocket } from '../lib/socket';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { User } from '../types';

export function useAuthInit() {
  const { setUser, setAuthReady, logout } = useAuthStore();
  const { openCompleteProfile } = useUIStore();

  useEffect(() => {
    // Register the session-expired handler once so api.ts can call it
    // without a circular import between api.ts ↔ authStore.ts
    onSessionExpired(() => {
      logout();
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!isAuthenticated()) {
        setAuthReady(true);
        return;
      }

      try {
        const data = await api.get('/auth/me');
        if (mounted && data.user) {
          const userData: User = { ...data.user, isLoggedIn: true };
          setUser(userData);

          if (!userData.phone && !userData.isDemo && userData.role !== 'admin') {
            openCompleteProfile();
          }

          const token = localStorage.getItem('token');
          if (token) {
            const socket = connectSocket(token);
            socket.on('user:updated', (updatedUser: User) => {
              if (mounted) setUser({ ...updatedUser, isLoggedIn: true });
            });
          }
        }
      } catch (_) {
        await clearAuthToken();
      } finally {
        if (mounted) setAuthReady(true);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);
}
