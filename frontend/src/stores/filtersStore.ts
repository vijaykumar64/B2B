import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FiltersStore {
  searchQuery: string;
  selectedCategory: string;
  selectedLocation: string;
  selectedBusinessType: string;
  selectedState: string;
  selectedDistrict: string;
  selectedModel: string;
  selectedInvestmentRange: string | null;
  showVerifiedOnly: boolean;
  showInterestedOnly: boolean;
  nearbySort: boolean;
  interestedIds: string[];
  isCategoriesExpanded: boolean;
  maxInvestment: number;

  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  setSelectedLocation: (l: string) => void;
  setSelectedBusinessType: (t: string) => void;
  setSelectedState: (s: string) => void;
  setSelectedDistrict: (d: string) => void;
  setSelectedModel: (m: string) => void;
  setSelectedInvestmentRange: (r: string | null) => void;
  setShowVerifiedOnly: (v: boolean) => void;
  setShowInterestedOnly: (v: boolean) => void;
  setNearbySort: (v: boolean) => void;
  toggleInterested: (id: string) => void;
  setIsCategoriesExpanded: (v: boolean) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  searchQuery: '',
  selectedCategory: 'All',
  selectedLocation: 'All',
  selectedBusinessType: 'All',
  selectedState: 'All',
  selectedDistrict: 'All',
  selectedModel: 'All',
  selectedInvestmentRange: null,
  showVerifiedOnly: false,
  showInterestedOnly: false,
  nearbySort: false,
  isCategoriesExpanded: false,
  maxInvestment: 5000000,
};

export const useFiltersStore = create<FiltersStore>()(
  persist(
    (set, get) => ({
      ...defaultFilters,
      interestedIds: [],

      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      setSelectedLocation: (l) => set({ selectedLocation: l }),
      setSelectedBusinessType: (t) => set({ selectedBusinessType: t }),
      setSelectedState: (s) => set({ selectedState: s, selectedDistrict: 'All' }),
      setSelectedDistrict: (d) => set({ selectedDistrict: d }),
      setSelectedModel: (m) => set({ selectedModel: m }),
      setSelectedInvestmentRange: (r) => set({ selectedInvestmentRange: r }),
      setShowVerifiedOnly: (v) => set({ showVerifiedOnly: v }),
      setShowInterestedOnly: (v) => set({ showInterestedOnly: v }),
      setNearbySort: (v) => set({ nearbySort: v }),
      setIsCategoriesExpanded: (v) => set({ isCategoriesExpanded: v }),

      toggleInterested: (id) => {
        const current = get().interestedIds;
        set({
          interestedIds: current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id],
        });
      },

      resetFilters: () => set(defaultFilters),
    }),
    {
      name: 'filters-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist interestedIds across sessions — filters reset on new visit
      partialize: (state) => ({ interestedIds: state.interestedIds }),
    }
  )
);
