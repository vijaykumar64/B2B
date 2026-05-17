import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import { queryKeys } from '../lib/queryKeys';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { ChatRoom } from '../types';

export function useAppSocket() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUnreadMessagesCount = useUIStore((s) => s.setUnreadMessagesCount);

  useEffect(() => {
    const socket = getSocket();

    const syncOpportunities = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all() });
    };
    const syncApplications = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all() });
    };
    const syncConversations = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.unreadCount() });
    };

    socket.on('opportunities:sync', syncOpportunities);
    socket.on('applications:sync', syncApplications);
    socket.on('conversations:updated', syncConversations);

    return () => {
      socket.off('opportunities:sync', syncOpportunities);
      socket.off('applications:sync', syncApplications);
      socket.off('conversations:updated', syncConversations);
    };
  }, [queryClient]);

  // Fetch unread count whenever user changes
  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const { api } = await import('../lib/api');
        const data = await api.get('/conversations');
        const conversations: ChatRoom[] = data.conversations || data || [];
        let count = 0;
        conversations.forEach((conv) => {
          if (conv.unreadCount && conv.unreadCount[user.id]) {
            count += conv.unreadCount[user.id];
          }
        });
        setUnreadMessagesCount(count);
      } catch (_) {}
    };

    fetchUnreadCount();

    const socket = getSocket();
    socket.on('conversations:updated', fetchUnreadCount);

    return () => {
      socket.off('conversations:updated', fetchUnreadCount);
    };
  }, [user?.id]);
}
