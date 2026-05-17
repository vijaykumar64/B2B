export const queryKeys = {
  opportunities: {
    all: () => ['opportunities'] as const,
    lists: () => [...queryKeys.opportunities.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.opportunities.lists(), filters] as const,
  },
  applications: {
    all: () => ['applications'] as const,
  },
  conversations: {
    all: () => ['conversations'] as const,
    unreadCount: () => [...queryKeys.conversations.all(), 'unreadCount'] as const,
  },
  notifications: {
    all: () => ['notifications'] as const,
  },
};
