import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { EmptyState } from '../../../components/EmptyState';
import {
  TrendingUp, ShieldCheck, MapPin, ArrowRight, ChevronDown,
  Building2, Globe, BarChart3, X, Sparkles, Search,
} from 'lucide-react';
import Hero from '../../../components/Hero';
import OpportunityCard from '../../../components/OpportunityCard';
import FAQ from '../../../components/FAQ';
import HowItWorks from '../../../components/landing/HowItWorks';
import { SkeletonCard } from '../../../components/skeletons/SkeletonCard';
import { Button } from '../../../components/ui/button';
import { useOpportunities } from '../../../hooks/useOpportunities';
import { useFilteredOpportunities, useSuggestedOpportunities } from '../../../hooks/useFilteredOpportunities';
import { useFiltersStore } from '../../../stores/filtersStore';
import { useUIStore } from '../../../stores/uiStore';
import { BUSINESS_SECTORS, INDIA_STATES_DISTRICTS } from '../../../constants';

const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const FILTER_INVESTMENT_RANGES = [
  { id: 'all', label: 'Any Budget' },
  { id: '10k-1L', label: '10k to 1 Lakh' },
  { id: '1L-5L', label: '1 Lakh to 5 Lakh' },
  { id: '5L-10L', label: '5 Lakh to 10 Lakh' },
  { id: '10L-50L', label: '10 Lakh to 50 Lakh' },
  { id: '50L-1Cr', label: '50 Lakh to 1 Crore' },
  { id: '1Cr+', label: 'More than 1 Crore' },
];

function BriefItem({ title, text, dark }: { title: string; text: string; dark?: boolean }) {
  return (
    <div className="space-y-2">
      <h4 className={`font-bold text-[11px] uppercase tracking-widest border-b pb-2 ${dark ? 'text-white border-white/10' : 'text-slate-950 border-slate-100'}`}>{title}</h4>
      <p className={`text-[13px] font-normal leading-relaxed italic serif ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{text}</p>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  const queryClient = useQueryClient();
  const { opportunities, isLoading, error } = useOpportunities();
  const filteredOpportunities = useFilteredOpportunities(opportunities);
  usePageMeta('Home', 'Find 500+ verified franchise, dealership and distribution opportunities across India.');
  const { suggestedOpportunities, isStrongRelated } = useSuggestedOpportunities(opportunities, filteredOpportunities);

  const {
    searchQuery, selectedCategory, selectedState, selectedDistrict,
    selectedInvestmentRange, selectedBusinessType, selectedModel, showVerifiedOnly,
    setSelectedCategory, setSelectedState, setSelectedDistrict,
    setSelectedInvestmentRange, setSelectedBusinessType, setSelectedModel,
    setShowVerifiedOnly, resetFilters,
  } = useFiltersStore();

  const { openCallModal, openAuthModal } = useUIStore();

  const categories = ['All', ...BUSINESS_SECTORS];
  const states = ['All', ...Object.keys(INDIA_STATES_DISTRICTS)];
  const districts = selectedState !== 'All' ? ['All', ...(INDIA_STATES_DISTRICTS as Record<string, string[]>)[selectedState]] : ['All'];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleViewDetails = (id: string) => {
    navigate(`/opportunity/${id}`);
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <Hero
        onCallRequest={() => openCallModal('investor')}
        onGetStarted={(role) => openAuthModal('signup', role)}
      />

      {/* Featured Opportunities */}
      <div id="trending-section" className="bg-slate-50 py-6 md:py-8 border-b border-slate-100">
        <div className="container-safe">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 md:mb-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                <Sparkles className="h-3 w-3 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Featured Picks</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                {searchQuery ? <>Search <span className="text-blue-600 italic">Results</span></> : <>Trending <span className="text-blue-600 italic">Opportunities</span></>}
              </h2>
              <p className="text-slate-500 font-bold max-w-xl text-base">
                {searchQuery ? `Showing matching opportunities for "${searchQuery}"` : 'Handpicked franchises, dealerships, and distributions ready for expansion in your territory.'}
              </p>
            </div>
            <Button onClick={() => navigate('/find-franchise')} className="rounded-full h-14 px-10 bg-slate-900 border-none text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
              View All Brands <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
          >
            {opportunities.length > 0 ? (
              searchQuery ? (
                filteredOpportunities.length > 0 ? (
                  filteredOpportunities.map((opp) => (
                    <motion.div key={opp.id} variants={cardVariants}>
                      <OpportunityCard opportunity={opp} onViewDetails={handleViewDetails} />
                    </motion.div>
                  ))
                ) : isStrongRelated ? (
                  <>
                    <div className="col-span-full mb-8">
                      <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-bold text-slate-700">We found these recommendations matching your search for <span className="text-blue-600">"{searchQuery}"</span></p>
                        <Button variant="link" onClick={handleReset} className="ml-auto text-[10px] font-black uppercase tracking-widest text-blue-600">Reset</Button>
                      </div>
                    </div>
                    {suggestedOpportunities.map((opp) => (
                      <motion.div key={`suggested-${opp.id}`} variants={cardVariants}>
                        <OpportunityCard opportunity={opp} onViewDetails={handleViewDetails} />
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="col-span-full mb-8">
                      <div className="p-12 md:p-20 rounded-[3rem] border-2 border-dashed bg-white border-slate-200 text-center">
                        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Search className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900">No results found for "{searchQuery}"</h3>
                        <p className="text-slate-500 font-bold mt-2">Try different keywords or browse these verified brands:</p>
                        <Button variant="outline" onClick={handleReset} className="mt-6 rounded-full border-2 border-blue-100 hover:border-blue-200 text-blue-600 font-black uppercase tracking-widest text-[10px] px-8 h-12">
                          Explore All Opportunities
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-full mb-8">
                      <div className="flex items-center gap-4"><div className="h-px flex-1 bg-slate-100" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verified Trending Brands</span><div className="h-px flex-1 bg-slate-100" /></div>
                    </div>
                    {suggestedOpportunities.map((opp) => (
                      <motion.div key={`suggested-fallback-${opp.id}`} variants={cardVariants}>
                        <OpportunityCard opportunity={opp} onViewDetails={handleViewDetails} />
                      </motion.div>
                    ))}
                  </>
                )
              ) : (
                [...opportunities].sort(() => 0.5 - Math.random()).slice(0, 6).map((opp) => (
                  <motion.div key={opp.id} variants={cardVariants}>
                    <OpportunityCard opportunity={opp} onViewDetails={handleViewDetails} />
                  </motion.div>
                ))
              )
            ) : error ? (
              <div className="col-span-full">
                <EmptyState
                  title="Couldn't load opportunities"
                  description="There was a problem fetching listings. Please try again."
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
            ) : (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            )}
          </motion.div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className={`sticky top-14 md:top-20 z-30 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl py-2 border-b border-slate-100 shadow-sm' : 'bg-white py-4 border-b border-slate-100'}`}>
        <div className="container-safe">
          <div className={`flex flex-col ${isScrolled ? 'gap-1' : 'gap-6'}`}>
            <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar transition-all ${isScrolled ? 'h-0 opacity-0 mb-0' : 'pb-2 opacity-100'}`}>
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedCategory === cat ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}>{cat}</button>
              ))}
            </div>
            <div className={`flex flex-wrap items-center ${isScrolled ? 'gap-2 justify-center sm:justify-start' : 'gap-4'}`}>
              <div className="flex-1 overflow-hidden" />
              {!isScrolled && (
                <>
                  <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="h-12 text-xs w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none">
                        {states.map((s) => <option key={s} value={s}>{s === 'All' ? 'State' : s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                    <div className="relative group">
                      <Building2 className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={selectedState === 'All'} className="h-12 text-xs w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none disabled:opacity-50">
                        {districts.map((d) => <option key={d} value={d}>{d === 'All' ? 'City' : d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                    <div className="relative group">
                      <BarChart3 className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={selectedInvestmentRange || 'all'} onChange={(e) => setSelectedInvestmentRange(e.target.value)} className="h-12 text-xs w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none">
                        {FILTER_INVESTMENT_RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                    <div className="relative group">
                      <Building2 className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={selectedBusinessType} onChange={(e) => setSelectedBusinessType(e.target.value)} className="h-12 text-xs w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none">
                        <option value="All">Type</option>
                        <option value="brand">Franchise</option>
                        <option value="dealership">Dealership</option>
                        <option value="distribution">Distribution</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                    <div className="relative group">
                      <Globe className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="h-12 text-xs w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none">
                        <option value="All">Model</option>
                        <option value="FOFO">FOFO</option>
                        <option value="COCO">COCO</option>
                        <option value="FOCO">FOCO</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}
              <Button variant="ghost" onClick={handleReset} className={`${isScrolled ? 'h-10 px-3' : 'h-12 px-6'} rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 font-black text-[9px] uppercase tracking-widest gap-2`}>
                <X className="h-3 w-3" />{isScrolled ? '' : 'Clear'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <HowItWorks />

      {/* Market Intelligence Section */}
      <section className="bg-slate-950 py-10 md:py-16 relative overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(51,65,85,0.3),transparent)]" />
        </div>
        <div className="container-safe relative z-10">
          <div className="grid lg:grid-cols-1 sm:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/5 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-300">Regulatory & Compliance Oversight</span>
              </div>
              <h2 className="text-4xl lg:text-5xl text-white serif italic leading-[1.1]">
                Institutional Grade <br /><span className="text-slate-500">Market Intelligence.</span>
              </h2>
              <p className="text-base text-slate-400 font-normal leading-relaxed italic serif max-w-xl">
                Our multi-layer verification protocol ensures that every listing in our catalog represents a high-integrity asset backed by operational transparency.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-3">
                  <p className="text-3xl font-bold text-white serif tracking-tight">₹25Cr+</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Deployment</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <BriefItem title="Fiscal Health Modeling" text="Rigorous P&L validation and historical tax compliance auditing." dark />
              <BriefItem title="Operational Vetting" text="Backend support architecture mapping and field audits for sustainability." dark />
              <BriefItem title="Market Density Index" text="Proprietary regional demand heatmaps for optimized territory selection." dark />
              <BriefItem title="Legal & IP Clearance" text="Exclusive verification of trademark standing and regulatory clearance." dark />
            </div>
          </div>
        </div>
      </section>

      <FAQ />
    </motion.div>
  );
}
