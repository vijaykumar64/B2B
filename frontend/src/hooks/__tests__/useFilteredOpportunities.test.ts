import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilteredOpportunities } from '../useFilteredOpportunities';
import { useFiltersStore } from '../../stores/filtersStore';
import type { Opportunity } from '../../types';

const makeOpp = (overrides: Partial<Opportunity>): Opportunity => ({
  id: '1',
  brand_name: 'Test Brand',
  category: 'Food',
  type: 'brand',
  location: 'Mumbai',
  description: 'A test brand',
  is_verified: true,
  status: 'published',
  minInvestment: 100000,
  maxInvestment: 500000,
  businessModel: 'FOFO',
  tags: [],
  ...overrides,
} as Opportunity);

const OPPORTUNITIES: Opportunity[] = [
  makeOpp({ id: '1', brand_name: 'Pizza Palace', category: 'Food', minInvestment: 200000, maxInvestment: 500000 }),
  makeOpp({ id: '2', brand_name: 'Tech Store', category: 'Electronics', minInvestment: 1000000, maxInvestment: 3000000 }),
  makeOpp({ id: '3', brand_name: 'Fashion Hub', category: 'Fashion', type: 'dealership', minInvestment: 50000, maxInvestment: 100000 }),
];

describe('useFilteredOpportunities', () => {
  beforeEach(() => {
    useFiltersStore.setState({
      searchQuery: '',
      selectedCategory: 'All',
      selectedBusinessType: 'All',
      selectedModel: 'All',
      selectedLocation: 'All',
      selectedState: 'All',
      selectedDistrict: 'All',
      selectedInvestmentRange: 'all',
      showVerifiedOnly: false,
      showInterestedOnly: false,
      nearbySort: false,
      interestedIds: [],
    });
  });

  it('returns all opportunities with default filters', () => {
    const { result } = renderHook(() => useFilteredOpportunities(OPPORTUNITIES));
    expect(result.current).toHaveLength(3);
  });

  it('filters by search query on brand name', () => {
    useFiltersStore.setState({ searchQuery: 'pizza' });
    const { result } = renderHook(() => useFilteredOpportunities(OPPORTUNITIES));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].brand_name).toBe('Pizza Palace');
  });

  it('filters by category', () => {
    useFiltersStore.setState({ selectedCategory: 'Electronics' });
    const { result } = renderHook(() => useFilteredOpportunities(OPPORTUNITIES));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].brand_name).toBe('Tech Store');
  });

  it('filters by business type', () => {
    useFiltersStore.setState({ selectedBusinessType: 'dealership' });
    const { result } = renderHook(() => useFilteredOpportunities(OPPORTUNITIES));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].brand_name).toBe('Fashion Hub');
  });

  it('returns empty array when no match', () => {
    useFiltersStore.setState({ searchQuery: 'zzz-nonexistent' });
    const { result } = renderHook(() => useFilteredOpportunities(OPPORTUNITIES));
    expect(result.current).toHaveLength(0);
  });
});
