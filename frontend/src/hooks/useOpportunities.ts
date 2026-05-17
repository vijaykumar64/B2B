import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import type { Opportunity } from '../types';

export function useOpportunities() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.opportunities.list(),
    queryFn: async () => {
      const data = await api.get('/opportunities');
      return (data.opportunities || data || []) as Opportunity[];
    },
  });

  return { opportunities: data ?? [], isLoading, error };
}
