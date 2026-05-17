import { useMemo } from 'react';
import { useFiltersStore } from '../stores/filtersStore';
import { useAuthStore } from '../stores/authStore';
import type { Opportunity } from '../types';

const FILTER_INVESTMENT_RANGES = [
  { id: 'all', label: 'Any Budget', min: 0, max: Infinity },
  { id: '10k-1L', label: '10k to 1 Lakh', min: 10000, max: 100000 },
  { id: '1L-5L', label: '1 Lakh to 5 Lakh', min: 100000, max: 500000 },
  { id: '5L-10L', label: '5 Lakh to 10 Lakh', min: 500000, max: 1000000 },
  { id: '10L-50L', label: '10 Lakh to 50 Lakh', min: 1000000, max: 5000000 },
  { id: '50L-1Cr', label: '50 Lakh to 1 Crore', min: 5000000, max: 10000000 },
  { id: '1Cr+', label: 'More than 1 Crore', min: 10000000, max: Infinity },
];

export function useFilteredOpportunities(opportunities: Opportunity[]) {
  const user = useAuthStore((s) => s.user);
  const {
    searchQuery,
    selectedCategory,
    selectedBusinessType,
    selectedModel,
    selectedLocation,
    selectedState,
    selectedDistrict,
    selectedInvestmentRange,
    showVerifiedOnly,
    showInterestedOnly,
    nearbySort,
    interestedIds,
  } = useFiltersStore();

  const filteredOpportunities = useMemo(() => {
    const filtered = opportunities.filter((o) => {
      const search = searchQuery.toLowerCase().trim();

      if (search) {
        const searchableText = `${o.brand_name || ''} ${o.category || ''} ${o.description || ''} ${o.tags?.join(' ') || ''}`.toLowerCase();
        const locationText = (o.location || '').toLowerCase();

        if (searchableText.includes(search) || locationText.includes(search)) return true;

        const searchWords = search.split(/\s+/).filter((w) => w.length > 2);
        if (searchWords.length > 0) {
          const matchesSomeWords = searchWords.some(
            (word) => searchableText.includes(word) || locationText.includes(word)
          );
          if (matchesSomeWords) return true;
        }

        return false;
      }

      if (selectedCategory !== 'All' && o.category !== selectedCategory) return false;
      if (selectedBusinessType !== 'All' && o.type !== selectedBusinessType) return false;
      if (selectedModel !== 'All' && !(o.businessModel || '').toLowerCase().includes(selectedModel.toLowerCase())) return false;
      if (selectedLocation !== 'All' && !(o.location || '').toLowerCase().includes(selectedLocation.toLowerCase())) return false;

      const isPanIndia = (o.location || '').toLowerCase().includes('pan india');
      if (selectedState !== 'All' && !isPanIndia && !(o.location || '').toLowerCase().includes(selectedState.toLowerCase())) return false;
      if (selectedDistrict !== 'All' && !isPanIndia && !(o.location || '').toLowerCase().includes(selectedDistrict.toLowerCase())) return false;

      if (selectedInvestmentRange && selectedInvestmentRange !== 'all') {
        const range = FILTER_INVESTMENT_RANGES.find((r) => r.id === selectedInvestmentRange);
        if (range) {
          const oppMin = o.minInvestment || 0;
          const oppMax = o.maxInvestment || oppMin;
          if (oppMax < range.min || oppMin > range.max) return false;
        }
      }

      if (showVerifiedOnly && !o.is_verified) return false;
      if (showInterestedOnly && !interestedIds.includes(o.id)) return false;

      const isOwner = user && o.owner_uid === user.id;
      const isAdmin = user && user.role === 'admin';
      if (!isAdmin && !isOwner && o.status !== 'published') return false;

      return true;
    });

    filtered.sort((a, b) => {
      if (nearbySort) {
        const aIsPan = (a.location || '').toLowerCase().includes('pan india');
        const bIsPan = (b.location || '').toLowerCase().includes('pan india');
        if (aIsPan && !bIsPan) return -1;
        if (!aIsPan && bIsPan) return 1;
      }
      return (a.brand_name || '').localeCompare(b.brand_name || '');
    });

    return filtered;
  }, [
    opportunities,
    searchQuery,
    selectedCategory,
    selectedBusinessType,
    selectedModel,
    selectedLocation,
    selectedState,
    selectedDistrict,
    selectedInvestmentRange,
    showVerifiedOnly,
    showInterestedOnly,
    nearbySort,
    interestedIds,
    user,
  ]);

  return filteredOpportunities;
}

export function useSuggestedOpportunities(opportunities: Opportunity[], filteredOpportunities: Opportunity[]) {
  const { searchQuery } = useFiltersStore();

  return useMemo(() => {
    if (filteredOpportunities.length > 0 || !searchQuery.trim()) {
      return { suggestedOpportunities: [] as Opportunity[], isStrongRelated: false };
    }

    const search = searchQuery.toLowerCase().trim();
    const searchWords = search.split(/\s+/).filter((w) => w.length > 2);

    const related = opportunities.filter((o) => {
      const categoryText = (o.category || '').toLowerCase();
      const nameText = (o.brand_name || '').toLowerCase();
      const isRelatedCategory = categoryText.includes(search);
      const isRelatedName = searchWords.length > 0 && searchWords.some((word) => nameText.includes(word));
      return (isRelatedCategory || isRelatedName) && o.id;
    });

    if (related.length > 0) {
      return { suggestedOpportunities: related.slice(0, 3), isStrongRelated: true };
    }

    return {
      suggestedOpportunities: opportunities.filter((o) => o.is_verified).slice(0, 3),
      isStrongRelated: false,
    };
  }, [opportunities, filteredOpportunities, searchQuery]);
}
