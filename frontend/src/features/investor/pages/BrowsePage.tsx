import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import FindFranchise from '../../../components/FindFranchise';
import { SkeletonCard } from '../../../components/skeletons/SkeletonCard';
import { EmptyState } from '../../../components/EmptyState';
import { useOpportunities } from '../../../hooks/useOpportunities';
import { useFilteredOpportunities } from '../../../hooks/useFilteredOpportunities';
import { useFiltersStore } from '../../../stores/filtersStore';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { queryKeys } from '../../../lib/queryKeys';

interface BrowsePageProps {
  typeFilter?: 'franchise' | 'dealership' | 'distribution';
}

const PAGE_TITLES: Record<string, string> = {
  franchise: 'Franchise Opportunities',
  dealership: 'Dealership Opportunities',
  distribution: 'Distribution Opportunities',
};

const TYPE_MAP: Record<string, 'brand' | 'dealership' | 'distribution'> = {
  franchise: 'brand',
  dealership: 'dealership',
  distribution: 'distribution',
};

export default function BrowsePage({ typeFilter }: BrowsePageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { opportunities, isLoading, error } = useOpportunities();
  const filteredOpps = useFilteredOpportunities(opportunities);
  const { searchQuery, setSearchQuery } = useFiltersStore();

  usePageMeta(typeFilter ? PAGE_TITLES[typeFilter] : 'Browse Opportunities');

  // Apply the route-level type filter on top of global store filters
  const typeFiltered = useMemo(() => {
    if (!typeFilter) return filteredOpps;
    const typeValue = TYPE_MAP[typeFilter];
    return filteredOpps.filter((o) => o.type === typeValue);
  }, [filteredOpps, typeFilter]);

  const handleViewDetails = (id: string) => {
    navigate(`/opportunity/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container-safe py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-safe py-16">
        <EmptyState
          title="Couldn't load listings"
          description="There was a problem fetching opportunities. Please try again."
          action={
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.list() })}
              className="mt-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <FindFranchise
      key={typeFilter ?? 'all'}
      opportunities={typeFiltered}
      onViewDetails={handleViewDetails}
      typeFilter={typeFilter ? TYPE_MAP[typeFilter] : undefined}
      globalSearchQuery={searchQuery}
      onGlobalSearchChange={setSearchQuery}
    />
  );
}
