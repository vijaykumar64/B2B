import React, { useState, useMemo } from 'react';
import { Search, MapPin, IndianRupee, Filter, ArrowRight, X } from 'lucide-react';
import { Opportunity } from '../types';
import OpportunityCard from './OpportunityCard';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface FindFranchiseProps {
  opportunities: Opportunity[];
  onViewDetails: (id: string) => void;
  typeFilter?: 'brand' | 'dealership' | 'distribution';
  globalSearchQuery?: string;
  onGlobalSearchChange?: (query: string) => void;
}

export default function FindFranchise({ 
  opportunities, 
  onViewDetails, 
  typeFilter,
  globalSearchQuery,
  onGlobalSearchChange
}: FindFranchiseProps) {
  const [searchTerm, setSearchTerm] = useState(globalSearchQuery || '');
  
  // Sync global search to local search
  React.useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setSearchTerm(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  const handleSearchChangeLocal = (val: string) => {
    setSearchTerm(val);
    if (onGlobalSearchChange) {
      onGlobalSearchChange(val);
    }
  };
  const [customMin, setCustomMin] = useState<string>('');
  const [customMax, setCustomMax] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>(typeFilter || 'all');

  const title = useMemo(() => {
    if (typeFilter === 'dealership') return 'Find Your Perfect Dealership';
    if (typeFilter === 'distribution') return 'Find Your Distribution Network';
    return 'Find Your Perfect Franchise';
  }, [typeFilter]);

  const FILTER_INVESTMENT_RANGES = [
    { id: 'all', label: 'Any Budget', min: 0, max: Infinity },
    { id: '10k-1L', label: '10k to 1 Lakh', min: 10000, max: 100000 },
    { id: '1L-5L', label: '1 Lakh to 5 Lakh', min: 100000, max: 500000 },
    { id: '5L-10L', label: '5 Lakh to 10 Lakh', min: 500000, max: 1000000 },
    { id: '10L-50L', label: '10 Lakh to 50 Lakh', min: 1000000, max: 5000000 },
    { id: '50L-1Cr', label: '50 Lakh to 1 Crore', min: 5000000, max: 10000000 },
    { id: '1Cr+', label: 'More than 1 Crore', min: 10000000, max: Infinity },
    { id: 'custom', label: '⚙ Custom Range', min: 0, max: Infinity },
  ];

  const opportunitiesToFilter = useMemo(() => {
    return opportunities;
  }, [opportunities]);

  const typeLabel = useMemo(() => {
    if (typeFilter === 'dealership') return 'dealerships';
    if (typeFilter === 'distribution') return 'distribution networks';
    return 'franchises';
  }, [typeFilter]);

  const categories = useMemo(() => {
    const cats = new Set(opportunities.map(o => o.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const name = opp.brand_name || '';
      const category = opp.category || '';
      const location = opp.location || '';
      const description = opp.description || '';
      const search = searchTerm.toLowerCase();

      // Granular Keyword Search (Brand Name, Category, USP, Tags, Type, Model)
      const matchesSearch = !search || 
                           name.toLowerCase().includes(search) || 
                           category.toLowerCase().includes(search) ||
                           description.toLowerCase().includes(search) ||
                           (opp.usp || '').toLowerCase().includes(search) ||
                           (opp.type || '').toLowerCase().includes(search) ||
                           (opp.businessModel || '').toLowerCase().includes(search) ||
                           (opp.tags || []).some(t => t.toLowerCase().includes(search));
      
      const isPanIndia = location.toLowerCase().includes("pan india");
      const matchesLocation = !locationFilter || isPanIndia ||
                             location.toLowerCase().includes(locationFilter.toLowerCase());
      
      // Investment Limit Filter
      let matchesPrice = true;
      if (priceRange !== 'all') {
        const oppMin = opp.minInvestment || 0;
        const oppMax = opp.maxInvestment || oppMin;
        if (priceRange === 'custom') {
          const minVal = customMin ? parseFloat(customMin) * 100000 : 0;
          const maxVal = customMax ? parseFloat(customMax) * 100000 : Infinity;
          matchesPrice = !(oppMax < minVal || oppMin > maxVal);
        } else {
          const range = FILTER_INVESTMENT_RANGES.find(r => r.id === priceRange);
          if (range) {
            // Check if range overlaps
            matchesPrice = !(oppMax < range.min || oppMin > range.max);
          }
        }
      }

      const matchesCategory = selectedCategory === 'all' || opp.category === selectedCategory;
      
      // Business Type Filter
      const matchesType = selectedType === 'all' || opp.type === selectedType;

      // Operational Model Filter
      const matchesModel = selectedModel === 'all' || 
                          (opp.businessModel && opp.businessModel.toLowerCase().includes(selectedModel.toLowerCase()));

      return matchesSearch && matchesLocation && matchesPrice && matchesCategory && matchesType && matchesModel;
    });
  }, [opportunities, searchTerm, locationFilter, priceRange, customMin, customMax, selectedCategory, selectedType, selectedModel]);

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-16">
      <div className="container-safe">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-1">{title}</h1>
          <p className="text-xs text-slate-500 font-bold max-w-2xl opacity-80">Use our granular filters to find high-yield business opportunities matching your specific budget, model, and industry preference.</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City / Region</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Location hint..." 
                  className="pl-11 h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm focus-visible:ring-blue-600"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Investment Range</label>
              <select
                className="w-full h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm px-4 focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                {FILTER_INVESTMENT_RANGES.map(range => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>
              {priceRange === 'custom' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Min (Lakhs)"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    className="w-full h-10 bg-slate-100 rounded-xl font-bold text-sm px-3 border-none outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="number"
                    placeholder="Max (Lakhs)"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    className="w-full h-10 bg-slate-100 rounded-xl font-bold text-sm px-3 border-none outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}
            </div>

            {!typeFilter && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Type</label>
                <select
                  className="w-full h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm px-4 focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Any Type</option>
                  <option value="brand">Franchise</option>
                  <option value="dealership">Dealership</option>
                  <option value="distribution">Distribution</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Model (COCO/FOFO)</label>
              <select 
                className="w-full h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm px-4 focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="all">Any Model</option>
                <option value="FOFO">FOFO (Franchise Owned)</option>
                <option value="COCO">COCO (Company Owned)</option>
                <option value="FOCO">FOCO (Franchise Owned Co Op)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 8).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {cat || 'Other'}
                </button>
              ))}
              {categories.length > 8 && (
                <span className="text-[10px] font-black text-slate-400 self-center ml-2">+{categories.length - 8} More</span>
              )}
            </div>

            <Button 
              variant="ghost" 
              className="h-10 text-slate-400 hover:text-red-500 font-black uppercase tracking-widest text-[10px] gap-2 transition-colors"
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setPriceRange('all');
                setCustomMin('');
                setCustomMax('');
                setSelectedCategory('all');
                setSelectedModel('all');
                setSelectedType('all');
              }}
            >
              <X className="h-3 w-3" />
              Reset All
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Showing {filteredOpportunities.length} Results
            </h2>
          </div>

          {filteredOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredOpportunities.map(opp => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onViewDetails={onViewDetails}
                  hideTypeBadge={!!typeFilter}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <Filter className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No results found matching your criteria.</p>
              <Button 
                variant="ghost" 
                className="mt-4 text-blue-600 font-bold"
                onClick={() => {
                  setSearchTerm('');
                  setLocationFilter('');
                  setPriceRange('all');
                  setCustomMin('');
                  setCustomMax('');
                  setSelectedCategory('all');
                  setSelectedModel('all');
                  setSelectedType('all');
                }}
              >
                View all available opportunities
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
