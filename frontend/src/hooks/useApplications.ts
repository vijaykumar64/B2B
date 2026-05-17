import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { useAuthStore } from '../stores/authStore';
import type { Application } from '../types';

export function useApplications() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.applications.all(),
    queryFn: async () => {
      const data = await api.get('/applications');
      return (data.applications || data || []) as Application[];
    },
    enabled: !!user && !user.isDemo,
  });

  return { applications: data ?? [], isLoading, error };
}
