import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Building2, 
  ShieldCheck,
  ArrowRight,
  Info,
  Scale,
  Sparkles,
  ArrowLeft,
  Users,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  X,
  Clock,
  Heart,
  Share2,
  Package,
  Layers,
  Zap,
  Target
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { Opportunity, User } from '../types';
import { toast } from 'sonner';
import { formatResponseTime } from '../lib/utils';
import { api } from '../lib/api';
import OpportunityCard from './OpportunityCard';
import { PhoneCall } from 'lucide-react';

interface OpportunityDetailViewProps {
  opportunity: Opportunity;
  allOpportunities: Opportunity[];
  onBack: () => void;
  onApply: (id: string) => void;
  onEnquire: (opportunity: Opportunity) => void;
  isLoggedIn: boolean;
  user: User | null;
  onLoginClick: (mode?: 'login' | 'signup') => void;
  onViewOpportunity: (id: string) => void;
}


interface ImageGalleryProps {
  mainImage: string;
  brandName: string;
  additionalImages: string[];
}

function ImageGallery({ mainImage, brandName, additionalImages }: ImageGalleryProps) {
  const allImages = [mainImage, ...additionalImages];
  const [activeImage, setActiveImage] = useState(mainImage);

  return (
    <div className="space-y-4">
      <div className="aspect-video sm:aspect-[21/9] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 relative group">
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImage}
            src={activeImage} 
            alt={brandName} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>
      
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative h-16 w-24 md:h-20 md:w-32 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                activeImage === img ? 'border-blue-600 scale-95 shadow-lg' : 'border-slate-100 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OpportunityDetailView({ 
  opportunity, 
  allOpportunities,
  onBack, 
  onApply,
  onEnquire,
  isLoggedIn,
  user,
  onLoginClick,
  onViewOpportunity
}: OpportunityDetailViewProps) {
  const [showConnectPopup, setShowConnectPopup] = useState(false);
  const [brandOwner, setBrandOwner] = useState<User | null>(null);
  const [isRequestingCallback, setIsRequestingCallback] = useState(false);
  const [hasRequestedCallback, setHasRequestedCallback] = useState(false);

  const handleRequestCallback = async () => {
    if (!isLoggedIn) {
      onLoginClick('login');
      return;
    }

    setIsRequestingCallback(true);
    try {
      await api.post('/callbacks', {
        userId: user?.id,
        userEmail: user?.email,
        userPhone: user?.phone || '',
        userName: user?.name || 'Investor',
        opportunityId: opportunity.id,
        brandName: opportunity.brand_name,
        brandOwnerUid: opportunity.owner_uid,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        type: 'brand_callback'
      });
      toast.success("Callback request sent! The brand will contact you soon.");
      setHasRequestedCallback(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to request callback");
    } finally {
      setIsRequestingCallback(false);
    }
  };

  useEffect(() => {
    const fetchOwner = async () => {
      if (opportunity.owner_uid) {
        try {
          const data = await api.get(`/users/${opportunity.owner_uid}`);
          if (data.user) setBrandOwner(data.user as User);
        } catch (_) {}
      }
    };
    fetchOwner();
  }, [opportunity.owner_uid]);

  const responseRateText = formatResponseTime(
    brandOwner?.totalResponseTime || 0,
    brandOwner?.responseCount || 0
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConnectPopup(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [opportunity.id]);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Bottom Apply for Mobile - Compressed */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-100 z-[60] lg:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <Button 
          onClick={() => onEnquire(opportunity)}
          className="w-full bg-slate-900 h-10 rounded font-bold text-[10px] uppercase tracking-widest shadow-lg"
        >
          {isLoggedIn ? 'Direct Enquiry' : 'Unlock Access'}
          <MessageSquare className="ml-2 h-3.5 w-3.5 opacity-70" />
        </Button>
      </div>

      {/* Top Navigation */}
      <div className="sticky top-0 z-[55] w-full pt-6 px-4 pointer-events-none">
        <div className="container-safe pointer-events-auto">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded border border-slate-100 text-slate-900 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>
      </div>

      <main className="container-safe py-1 pb-32 lg:pb-24">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* Header Content */}
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row items-start gap-4 md:p-8">
                <div className="h-20 w-20 md:h-32 md:w-32 rounded bg-slate-50 border border-slate-100 p-2 md:p-4 shadow-sm shrink-0">
                  <img 
                    src={opportunity.brand_logo_url || opportunity.logo || opportunity.image} 
                    alt={opportunity.brand_name || 'Brand'} 
                    className="h-full w-full object-contain filter grayscale contrast-125"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Listing Ref: {opportunity.id.slice(-8).toUpperCase()}</span>
                    <span className="h-px w-4 md:w-8 bg-slate-100" />
                    <Badge className={`border-none font-black text-[9px] uppercase tracking-[0.1em] px-3 py-1 rounded-full shadow-sm ${
                      opportunity.type === 'dealership' ? 'bg-amber-100 text-amber-700' :
                      opportunity.type === 'distribution' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {opportunity.type === 'dealership' ? <MapPin className="h-3 w-3 mr-1 inline" /> :
                       opportunity.type === 'distribution' ? <Package className="h-3 w-3 mr-1 inline" /> :
                       <Building2 className="h-3 w-3 mr-1 inline" />}
                      {opportunity.type === 'dealership' ? 'Dealership' :
                       opportunity.type === 'distribution' ? 'Distribution' :
                       'Franchise'}
                    </Badge>
                    {opportunity.is_verified && (
                      <div className="flex items-center gap-3 ml-1">
                        <Badge className="bg-green-500 text-white border-none font-bold text-[8px] md:text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                          Verified
                        </Badge>
                        <div className="flex items-center gap-4 ml-2">
                          <button 
                            className="p-1.5 rounded-full hover:bg-slate-50 transition-colors text-slate-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success("Added to favorites");
                            }}
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1.5 rounded-full hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(window.location.href);
                              toast.success("Link copied to clipboard");
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    <span className="h-px w-4 md:w-8 bg-slate-100" />
                    <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[8px] md:text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 ml-1">
                      <Clock className="h-3 w-3" />
                      {responseRateText}
                    </Badge>
                  </div>
                  <h1 className="text-2xl lg:text-4xl text-slate-950 font-black leading-tight">{opportunity.brand_name || 'Anonymous Brand'}</h1>
                  <p className="text-xs md:text-base text-slate-500 font-medium leading-relaxed max-w-xl">
                    {opportunity.usp || "Official Business Expansion Partner"}
                  </p>
                </div>
              </div>

              {/* Improved Image Gallery */}
              <ImageGallery 
                mainImage={opportunity.image} 
                brandName={opportunity.brand_name || 'Brand'} 
                additionalImages={opportunity.unitPhotos || []} 
              />
            </div>


            {/* Core Intelligence Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 border-y border-slate-100 py-10">
              <MetricItem label="Category" value={opportunity.category || 'Various'} />
              <MetricItem label="Space Required" value={opportunity.space_req || 'As Required'} />
              <MetricItem label="Investment" value={opportunity.investment_range || `₹${opportunity.minInvestment?.toLocaleString()} – ₹${opportunity.maxInvestment?.toLocaleString()}`} />
              <MetricItem label="Employees Req" value={opportunity.employees_req || '2-4 Members'} />
              {opportunity.type === 'brand' && <>
                <MetricItem label="ROI Period" value={opportunity.roiMonths ? `${opportunity.roiMonths} Months` : opportunity.roi || 'N/A'} />
                <MetricItem label="Presence" value={opportunity.presenceCount || 'Expanding'} />
              </>}
              {opportunity.type === 'dealership' && <>
                <MetricItem label="Margin / Unit" value={opportunity.marginPerUnitRange || 'On enquiry'} />
                <MetricItem label="Showroom Req" value={opportunity.showroomLayoutReq || 'As per brand'} />
              </>}
              {opportunity.type === 'distribution' && <>
                <MetricItem label="Credit Period" value={opportunity.creditPeriodDays ? `${opportunity.creditPeriodDays} Days` : 'N/A'} />
                <MetricItem label="Warehouse" value={opportunity.warehouseSqFt ? `${opportunity.warehouseSqFt} sq ft` : 'As Required'} />
              </>}
            </div>

            {/* Product Specifications Section */}
            <div className="space-y-10 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">
                  {opportunity.type === 'dealership' ? 'Showroom Requirements' : opportunity.type === 'distribution' ? 'Warehouse & Fleet Requirements' : 'Unit Requirements'}
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    Unit Infrastructure
                  </h4>
                  <div className="space-y-4">
                    <SpecItem label="Store Format" value={opportunity.businessModel || 'As per brand'} />
                    <SpecItem label="Space Required" value={opportunity.space_req || 'Confirm with brand'} />
                    <SpecItem label="Market Tier" value={opportunity.tierTarget || 'All Tiers'} />
                    <SpecItem label="Locations Sought" value={opportunity.locationsLookingFor?.slice(0, 2).join(', ') || opportunity.location || 'PAN India'} />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Operational Specs
                  </h4>
                  <div className="space-y-4">
                    <SpecItem label="Staff Requirement" value={opportunity.employees_req || 'Confirm with brand'} />
                    <SpecItem label="National Presence" value={opportunity.presenceCount || 'Expanding'} />
                    <SpecItem label="Units Available" value={opportunity.unitsAvailable ? `${opportunity.unitsAvailable}+ Units` : 'Multiple Slots'} />
                    <SpecItem label="Business Model" value={opportunity.businessModel || 'As per brand'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Overview */}
            <div className="space-y-10">
               <div className="space-y-4">
                  <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">Business Opportunity</h3>
                  <div className="text-base text-slate-600 leading-relaxed max-w-3xl font-normal space-y-6">
                    <p>{opportunity.description}</p>
                  </div>
               </div>

               {/* Type-Specific Detailed Views */}
               {opportunity.type === 'brand' && (
                 <div className="space-y-12 pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-indigo-600" />
                      </div>
                      <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">Operational View</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Scale className="h-3 w-3" />
                          Detailed Financials
                        </h4>
                        <div className="space-y-4">
                          <SpecItem label="Franchise Fee" value={opportunity.franchiseFee || 'On enquiry'} />
                          <SpecItem label="Setup Cost" value={opportunity.setupCost || 'On enquiry'} />
                          <SpecItem label="Monthly Royalty" value={opportunity.monthlyRoyalty || 'On enquiry'} />
                          <SpecItem label="Break-even Period" value={opportunity.breakEvenMonths ? `${opportunity.breakEvenMonths} Months` : 'On enquiry'} />
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck className="h-3 w-3" />
                          Training & Support
                        </h4>
                        <div className="space-y-4">
                          <SpecItem label="Training Duration" value={opportunity.trainingDays ? `${opportunity.trainingDays} Days` : 'On enquiry'} />
                          <SpecItem label="Training Recipient" value={opportunity.trainingFor || 'Owner & Staff'} />
                          <SpecItem label="Marketing Support" value={opportunity.marketingSupport || 'On enquiry'} />
                          <SpecItem label="SOP Manual" value={opportunity.sopManualGiven ? 'Provided' : 'On-site Training'} />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                       <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                         <Sparkles className="h-4 w-4" />
                         Success Insight
                       </h4>
                       <p className="text-sm text-blue-800/80 leading-relaxed italic">
                         {opportunity.breakEvenMonths
                           ? `Average time to reach break-even for this model is ${opportunity.breakEvenMonths} months, assuming standard local marketing is followed.`
                           : 'Contact the brand for a detailed ROI projection based on your city and investment level.'}
                       </p>
                    </div>
                 </div>
               )}

               {opportunity.type === 'dealership' && (
                 <div className="space-y-12 pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Package className="h-4 w-4 text-amber-600" />
                      </div>
                      <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">Sales View</h3>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hero Products</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(opportunity.heroProducts || []).map((prod, idx) => (
                           <div key={idx} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 group">
                              <div className="aspect-square bg-white p-4">
                                <img src={prod.image} className="w-full h-full object-contain mix-blend-multiply" />
                              </div>
                              <div className="p-3 text-[10px] font-bold text-center uppercase tracking-wider text-slate-600">
                                {prod.name}
                              </div>
                           </div>
                        ))}
                        {(!opportunity.heroProducts || opportunity.heroProducts.length === 0) && (
                          <div className="col-span-full py-8 text-center text-slate-400 text-xs italic">
                            Product catalog available upon enquiry
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" />
                            Margin & Earnings
                          </h4>
                          <div className="space-y-4">
                            <SpecItem label="Margin per Unit" value={opportunity.marginPerUnitRange || 'On enquiry'} />
                            <SpecItem label="Performance Bonus" value={opportunity.performanceBonusDetails || 'On enquiry'} />
                            <SpecItem label="Inventory Credit" value={opportunity.creditPeriodDays ? `${opportunity.creditPeriodDays} Days` : 'On enquiry'} />
                          </div>
                       </div>

                       <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3" />
                            Post-Sales Support
                          </h4>
                          <div className="space-y-4">
                            <SpecItem label="After-Sales/Spares" value={opportunity.afterSalesServiceDetails || 'On enquiry'} />
                            <SpecItem label="Showroom Layout" value={opportunity.showroomLayoutReq || 'On enquiry'} />
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {opportunity.type === 'distribution' && (
                 <div className="space-y-12 pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                      </div>
                      <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">Network View</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                       <div className="p-6 bg-slate-50 rounded-2xl space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Territory Coverage</p>
                          <p className="text-sm font-black text-slate-900">{opportunity.territoryDefinition || "Exclusive Area Assigned"}</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-2xl space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Retailers</p>
                          <p className="text-sm font-black text-slate-900">{opportunity.existingRetailerCount || 200}+ Shops Waiting</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-2xl space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Fleet Req</p>
                          <p className="text-sm font-black text-slate-900">{opportunity.deliveryVansRequired ? `${opportunity.deliveryVansRequired} Vans Needed` : '1-2 Vans Needed'}</p>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Logistics & Inventory
                          </h4>
                          <div className="space-y-4">
                            <SpecItem label="Stock Arrival" value={opportunity.stockArrivalFrequency || 'On enquiry'} />
                            <SpecItem label="Warehouse Req" value={opportunity.warehouseSqFt ? `${opportunity.warehouseSqFt} sq ft` : 'On enquiry'} />
                          </div>
                       </div>

                       <div className="bg-slate-50 rounded-2xl p-8 space-y-6">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Scale className="h-3 w-3" />
                            Financial Terms
                          </h4>
                          <div className="space-y-4">
                            <SpecItem label="Credit Period" value={opportunity.creditPeriodDays ? `${opportunity.creditPeriodDays} Days` : 'On enquiry'} />
                            <SpecItem label="Existing Retailers" value={opportunity.existingRetailerCount ? `${opportunity.existingRetailerCount}+ Shops` : 'On enquiry'} />
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {opportunity.franchisorProfile && (
                 <div className="space-y-4 pt-4">
                    <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">Brand Heritage & Vision</h3>
                    <div className="text-base text-slate-600 leading-relaxed max-w-3xl font-normal">
                      <p>{opportunity.franchisorProfile}</p>
                    </div>
                 </div>
               )}

               <div className="grid md:grid-cols-2 gap-12 pt-4">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                       <MapPin className="h-3 w-3" />
                       Preferred Location
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {opportunity.locationsLookingFor?.map(loc => (
                          <span key={loc} className="flex items-center gap-1 text-xs font-bold text-slate-900 border border-slate-100 px-3 py-1.5 rounded bg-slate-50">
                             <MapPin className="h-3 w-3 text-slate-400" />
                             {loc}
                          </span>
                       ))}
                       {(!opportunity.locationsLookingFor || opportunity.locationsLookingFor.length === 0) && (
                         <span className="flex items-center gap-1 text-xs font-bold text-slate-900 border border-slate-100 px-3 py-1.5 rounded bg-slate-50">
                           <MapPin className="h-3 w-3 text-slate-400" />
                           {opportunity.location || 'Open to All Locations'}
                         </span>
                       )}
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                       <Users className="h-3 w-3" />
                       Entrepreneur Profile
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                       Ideal for motivated individuals looking to scale {opportunity.category} business. Dedicated focus required. No prior experience strictly needed as brand provides full SOP and support.
                    </p>
                 </div>
               </div>
            </div>

            {/* How to Apply */}
            <div className="space-y-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">How to Apply</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: 1, title: 'Submit Interest', desc: 'Click "Connect with Brand" and share your investment profile.' },
                  { step: 2, title: 'Brand Review', desc: `The brand team reviews your profile. ${responseRateText}.` },
                  { step: 3, title: 'Discovery Call', desc: 'Schedule a call with the brand team to discuss territory and investment details.' },
                  { step: 4, title: 'Agreement & Setup', desc: `Sign the partnership agreement and begin onboarding${opportunity.trainingDays ? ` within ${opportunity.trainingDays} days` : ''}.` },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="relative flex flex-col gap-3 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">{step}</div>
                    <h4 className="text-sm font-black text-slate-900">{title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Highlights */}
            <div className="space-y-10 pt-8">
               <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">Strategic Advantages</h3>
               <div className="grid md:grid-cols-3 gap-6">
                  <HighlightItem title="High Demand" text="Strong market appetite in small cities and towns." icon={<TrendingUp className="h-4 w-4 text-blue-600" />} />
                  <HighlightItem title="End-to-End Support" text="Training, supply chain and marketing provided by HQ." icon={<ShieldCheck className="h-4 w-4 text-green-600" />} />
                  <HighlightItem title="Scalable Model" text="Standardized SOPs make it easy to open multiple units." icon={<Sparkles className="h-4 w-4 text-orange-600" />} />
               </div>
            </div>

            {/* Intelligence Access Block */}
            <section id="business-case" className="relative">
               {!isLoggedIn && (
                  <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-md rounded border border-slate-100 flex items-center justify-center p-12 text-center">
                     <div className="max-w-md space-y-8">
                        <div className="space-y-3">
                           <h4 className="text-3xl text-slate-950 font-bold">Extra Details Hidden</h4>
                           <p className="text-slate-500 font-normal leading-relaxed text-sm">
                               Money plans, profit charts, and full details are only for members.
                           </p>
                        </div>
                        <Button 
                          onClick={() => onLoginClick('login')}
                          className="bg-slate-900 hover:bg-slate-800 h-11 px-10 rounded font-bold text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
                        >
                           Sign In to See
                        </Button>
                     </div>
                  </div>
               )}
               
               <div className={`space-y-16 transition-all ${!isLoggedIn ? 'blur-sm scale-[0.99] opacity-40 pointer-events-none grayscale' : ''}`}>
                  {/* ROI & Success Stories */}
                  <div className="grid md:grid-cols-2 gap-12">
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-2">Money Plans</h4>
                        <div className="space-y-4">
                           <div className="flex items-end gap-3 text-slate-900">
                              <span className="text-6xl font-bold tracking-tighter leading-none">{opportunity.roiMonths ? `${opportunity.roiMonths}` : (opportunity.roi || '18-24')}</span>
                              <span className="text-sm font-bold uppercase tracking-widest pb-1">Months ROI</span>
                           </div>
                           <p className="text-slate-500 text-sm leading-relaxed font-normal">
                              Most business owners get their money back in 18 to 24 months.
                           </p>
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 pb-2">Brand Strength</h4>
                        <ul className="space-y-4">
                           <li className="flex gap-3 items-start">
                              <div className="h-4 w-4 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                              </div>
                              <span className="text-sm font-bold text-slate-900">Help with Online Marketing</span>
                           </li>
                           <li className="flex gap-3 items-start">
                              <div className="h-4 w-4 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                              </div>
                              <span className="text-sm font-bold text-slate-900">Good Quality Checks & Rules</span>
                           </li>
                           <li className="flex gap-3 items-start">
                              <div className="h-4 w-4 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                              </div>
                              <span className="text-sm font-bold text-slate-900">Special Training for Your Team</span>
                           </li>
                        </ul>
                     </div>
                  </div>

                  {/* Visual Proof */}
                  {opportunity.unitPhotos && opportunity.unitPhotos.length > 0 && (
                    <div className="space-y-8">
                      <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">Gallery of Operational Units</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {opportunity.unitPhotos.map((photo, i) => (
                           <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 group relative grayscale hover:grayscale-0 transition-all duration-700 bg-slate-50">
                              <img src={photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success Stories */}
                  {opportunity.successStories && opportunity.successStories.length > 0 && (
                    <div className="space-y-8">
                       <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">Partner Success Stories</h3>
                       <div className="grid gap-6">
                         {opportunity.successStories.map((story: any) => (
                           <div key={story.id} className="p-6 md:p-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                              <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0">
                                 <img src={story.investorPhoto} className="w-full h-full object-cover" />
                              </div>
                              <div className="space-y-3 flex-1">
                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h5 className="text-lg font-black text-slate-900">{story.investorName}</h5>
                                    <Badge className="bg-white text-slate-600 border-slate-100 rounded-lg px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                                       {story.district}, {story.state}
                                    </Badge>
                                 </div>
                                 <p className="text-slate-600 text-base italic leading-relaxed font-medium">"{story.story}"</p>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}

                  {/* Lead Capture Bottom Section */}
                  <div className="pt-16 border-t border-slate-100">
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white space-y-10 relative overflow-hidden">
                       {/* Background Accents */}
                       <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32" />
                       <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -ml-32 -mb-32" />

                       <div className="space-y-4 max-w-xl relative z-10">
                          <h3 className="text-3xl md:text-4xl font-black leading-tight text-white">Request a Callback from a Brand Expert</h3>
                          <p className="text-slate-400 font-medium">Get a detailed evaluation of your profile and discuss {opportunity.brand_name}'s roadmap in your city.</p>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8 relative z-10">
                          <div className="space-y-4">
                             <label className="group flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                <div className="pt-0.5">
                                   <input type="checkbox" className="h-5 w-5 rounded border-white/20 bg-transparent text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900" />
                                </div>
                                <div className="space-y-1">
                                   <span className="text-sm font-bold block text-white/90">I have the required investment ready</span>
                                   <span className="text-[10px] text-white/40 uppercase tracking-widest">₹{opportunity.minInvestment?.toLocaleString()} - ₹{opportunity.maxInvestment?.toLocaleString()} Range</span>
                                </div>
                             </label>

                             <label className="group flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                <div className="pt-0.5">
                                   <input type="checkbox" className="h-5 w-5 rounded border-white/20 bg-transparent text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900" />
                                </div>
                                <div className="space-y-1">
                                   <span className="text-sm font-bold block text-white/90">I have commercial property available</span>
                                   <span className="text-[10px] text-white/40 uppercase tracking-widest">{opportunity.space_req || "As per brand requirement"}</span>
                                </div>
                             </label>
                          </div>

                          <div className="flex flex-col justify-end gap-4">
                             <Button 
                                onClick={() => onEnquire(opportunity)}
                                className="w-full bg-blue-600 hover:bg-blue-500 h-16 rounded-2xl text-base font-black uppercase tracking-widest shadow-2xl shadow-blue-900/20 group"
                             >
                                Apply Now & Connect
                                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                             </Button>
                             <Button 
                                onClick={handleRequestCallback}
                                disabled={isRequestingCallback || hasRequestedCallback}
                                variant="outline"
                                className="w-full border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white h-16 rounded-2xl text-base font-black uppercase tracking-widest transition-all"
                             >
                                {hasRequestedCallback ? 'Callback Requested' : 'Request Call Back'}
                                <PhoneCall className={`ml-3 h-5 w-5 opacity-70 ${isRequestingCallback ? 'animate-pulse' : ''}`} />
                             </Button>
                             <p className="text-center text-[10px] text-white/30 uppercase tracking-[0.2em]">Verified Business Opportunity. No hidden charges.</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Related Products / Recommended Section */}
                  <div className="space-y-10 pt-16 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-indigo-600" />
                          <h3 className="text-xl text-slate-950 font-black uppercase tracking-tight">Related Opportunities</h3>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 px-6 uppercase tracking-widest">Hand-picked matches based on your interest</p>
                      </div>
                      <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest gap-2" onClick={onBack}>
                        View All
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {allOpportunities
                        .filter(opp => opp.id !== opportunity.id && (opp.category === opportunity.category))
                        .slice(0, 2)
                        .map(relatedOpp => (
                          <OpportunityCard 
                            key={relatedOpp.id}
                            opportunity={relatedOpp}
                            onViewDetails={onViewOpportunity}
                          />
                        ))}
                      {allOpportunities
                        .filter(opp => opp.id !== opportunity.id && (opp.category === opportunity.category)).length === 0 && (
                          allOpportunities
                            .filter(opp => opp.id !== opportunity.id)
                            .slice(0, 2)
                            .map(relatedOpp => (
                              <OpportunityCard 
                                key={relatedOpp.id}
                                opportunity={relatedOpp}
                                onViewDetails={onViewOpportunity}
                              />
                            ))
                        )}
                    </div>
                  </div>
               </div>
            </section>
          </div>

          {/* Right Sidebar: Sticky Actions */}
          <div className="space-y-12">
             <div className="sticky top-28 space-y-12">
                 <div className="p-10 bg-slate-50 border border-slate-100 rounded-lg space-y-8">
                   <div className="space-y-3">
                      <p className="text-[10px] font-bold text-brand-indigo uppercase tracking-[0.2em]">Ready to Start?</p>
                      <h4 className="text-3xl text-slate-950 font-bold leading-tight">Connect with Brand</h4>
                   </div>

                   <p className="text-[13px] text-slate-500 font-normal leading-relaxed">
                      Discuss unit locations, investment breakdown and expansion timelines directly with the brand founder.
                   </p>

                   <div className="space-y-3">
                      <Button
                        onClick={() => onEnquire(opportunity)}
                        className="w-full bg-slate-900 hover:bg-slate-800 h-14 rounded font-bold text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98]"
                      >
                        Connect with Brand
                        <MessageSquare className="ml-3 h-4 w-4 opacity-50" />
                      </Button>
                      
                      <Button 
                        onClick={handleRequestCallback}
                        disabled={isRequestingCallback || hasRequestedCallback}
                        variant="outline"
                        className="w-full border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 h-14 rounded font-bold text-xs uppercase tracking-[0.2em] transition-all group"
                      >
                        {hasRequestedCallback ? 'Callback Requested' : 'Request Call Back'}
                        <PhoneCall className={`ml-3 h-4 w-4 opacity-50 transition-transform ${isRequestingCallback ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                      </Button>
                   </div>

                   <div className="pt-8 border-t border-slate-200 space-y-5">
                      <div className="flex items-center gap-3">
                         <ShieldCheck className="h-4 w-4 text-slate-400" />
                         <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Validated Partnership</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Users className="h-4 w-4 text-slate-400" />
                         <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Founder Access</span>
                      </div>
                   </div>

                   {brandOwner && (
                     <div className="pt-6 border-t border-slate-200 space-y-4">
                       <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Brand Representative</p>
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                           {brandOwner.photoURL ? (
                             <img src={brandOwner.photoURL} className="h-full w-full object-cover" referrerPolicy="no-referrer" alt={brandOwner.name} />
                           ) : (
                             <span className="text-sm font-black text-slate-500">{brandOwner.name?.charAt(0)?.toUpperCase()}</span>
                           )}
                         </div>
                         <div>
                           <p className="text-sm font-black text-slate-900">{brandOwner.name}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Brand Owner</p>
                         </div>
                       </div>
                       {brandOwner.bio && (
                         <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{brandOwner.bio}</p>
                       )}
                       <div className="flex items-center gap-2">
                         <Clock className="h-3 w-3 text-slate-400" />
                         <span className="text-[10px] font-bold text-slate-500">{responseRateText}</span>
                       </div>
                     </div>
                   )}
                </div>

                <div className="p-4 md:p-8 border border-slate-100 rounded-lg space-y-6">
                   <div className="space-y-3">
                      <h5 className="text-lg text-slate-950 serif italic">Complex ROI Query?</h5>
                      <p className="text-[11px] font-normal text-slate-500 leading-relaxed uppercase tracking-widest">
                         Connect with an Institutional Advisor for local demographic mapping.
                      </p>
                   </div>
                   <Button variant="outline" className="w-full border-slate-200 h-11 rounded font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50">
                      Advisor Consultation
                   </Button>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Timed Engagement Popup */}
      <AnimatePresence>
        {showConnectPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/20 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-md w-full bg-white border border-slate-100 p-10 shadow-2xl relative"
            >
               <button 
                onClick={() => setShowConnectPopup(false)}
                className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"
               >
                 <X className="h-5 w-5" />
               </button>

               <div className="space-y-8">
                  <div className="space-y-3">
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Expert Help</span>
                     <h4 className="text-3xl text-slate-950 font-bold">Need More Help?</h4>
                     <p className="text-slate-500 font-normal leading-relaxed text-sm">
                        If you want to know more, you can talk directly to our **Expert Team**.
                     </p>
                  </div>

                  <div className="flex flex-col gap-3">
                     <Button 
                       onClick={() => setShowConnectPopup(false)}
                       className="w-full bg-slate-900 h-12 rounded font-bold text-[10px] uppercase tracking-widest shadow-lg"
                     >
                        Talk to Us Now
                     </Button>
                     <Button 
                       variant="ghost"
                       onClick={() => {
                         setShowConnectPopup(false);
                         onBack();
                       }}
                       className="w-full h-12 rounded font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900"
                     >
                        Go Back to Menu
                     </Button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-xl font-bold text-slate-950 tracking-tight">{value}</p>
    </div>
  );
}

function SpecItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/50 pb-2">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
      <span className="text-xs font-black text-slate-900">{value}</span>
    </div>
  );
}

function HighlightItem({ title, text, icon }: { title: string, text: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-4 p-6 rounded-3xl border border-slate-100 bg-white hover:border-slate-300 transition-colors">
       <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
          {icon}
       </div>
       <div className="space-y-2">
         <h4 className="font-black text-slate-950 text-xs uppercase tracking-widest">{title}</h4>
         <p className="text-sm text-slate-500 font-medium leading-relaxed">{text}</p>
       </div>
    </div>
  );
}

