import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ArrowRight, Building2, Globe, IndianRupee, MapPin, Info, X, ShieldCheck, Image as ImageIcon, Tag, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import { ScrollArea } from './ui/scroll-area';
import { BUSINESS_SECTORS } from '../constants';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const DEFAULT_QUESTIONS = [
  { id: 'experience', question: 'Do you have prior business experience?', type: 'select', options: ['Yes, in same industry', 'Yes, in different industry', 'No'] },
  { id: 'budget', question: 'What is your liquid capital for this venture?', type: 'select', options: ['₹2L - ₹5L', '₹5L - ₹10L', '₹10L - ₹20L', '₹20L+'] },
  { id: 'timing', question: 'How soon are you looking to start?', type: 'select', options: ['Immediately', 'Within 3 months', '3-6 months', 'Just exploring'] }
];

export default function CreateOpportunityModal({ isOpen, onClose, onSubmit, initialData }: CreateOpportunityModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialData || {
    brand_name: '',
    brand_logo_url: '',
    type: '', // Clear type initially for step 1 select
    category: '',
    investment_range: '',
    minInvestment: '',
    maxInvestment: '',
    description: '',
    location: 'Pan India',
    space_req: '',
    roiMonths: '',
    usp: '',
    image: '',
    logo: '',
    unitPhotos: [] as string[],
    franchisorProfile: '',
    unitsAvailable: 1,
    locationsLookingFor: [] as string[],
    customQuestions: DEFAULT_QUESTIONS,
    successStories: [],
    status: 'draft',
    visibilitySettings: {
      showROI: true,
      showFranchisorProfile: true,
      showSupportDetails: true,
      showDetailedModels: true,
      showUnitPhotos: true,
      showSuccessStories: true
    },
    // Franchise Details
    franchiseFee: '',
    monthlyRoyalty: '',
    breakEvenMonths: '',
    // Dealership Details
    marginPerUnitRange: '',
    performanceBonusDetails: '',
    // Distribution Details
    territoryDefinition: '',
    warehouseSqFt: '',
    creditPeriodDays: ''
  });

  const typeOptions = [
    { 
      id: 'brand', 
      label: 'Franchise', 
      desc: 'Standardized model with franchise fees & royalty', 
      icon: <Building2 className="h-6 w-6" />,
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    { 
      id: 'dealership', 
      label: 'Dealership', 
      desc: 'Sales agency for products with unit-specific margins', 
      icon: <Tag className="h-6 w-6" />,
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    { 
      id: 'distribution', 
      label: 'Distribution', 
      desc: 'Regional warehousing and B2B supply chain network', 
      icon: <Globe className="h-6 w-6" />,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
  ];

  const handleTypeSelect = (typeId: string) => {
    setFormData(prev => ({ ...prev, type: typeId }));
    setStep(2);
  };

  const [newLocation, setNewLocation] = useState('');

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        customQuestions: initialData.customQuestions || DEFAULT_QUESTIONS,
        successStories: initialData.successStories || [],
        unitPhotos: initialData.unitPhotos || [],
        locationsLookingFor: initialData.locationsLookingFor || []
      });
    }
  }, [initialData]);

  const addLocation = () => {
    if (newLocation.trim()) {
      setFormData(prev => ({
        ...prev,
        locationsLookingFor: [...(prev.locationsLookingFor || []), newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (loc: string) => {
    setFormData(prev => ({
      ...prev,
      locationsLookingFor: prev.locationsLookingFor?.filter(l => l !== loc) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format investment_range string from min/max
    const minVal = parseFloat(formData.minInvestment);
    const maxVal = parseFloat(formData.maxInvestment);
    let rangeStr = 'Flexible';
    
    if (!isNaN(minVal)) {
      if (minVal >= 10000000) rangeStr = `₹${(minVal/10000000).toFixed(1)}Cr+`;
      else if (minVal >= 100000) rangeStr = `₹${Math.floor(minVal/100000)}L - ₹${Math.floor(maxVal/100000)}L`;
      else rangeStr = `₹${minVal/1000}K - ₹${maxVal/1000}K`;
    }

    const submissionData = {
      ...formData,
      minInvestment: minVal || 0,
      maxInvestment: maxVal || 0,
      investment_range: rangeStr,
      is_verified: formData.is_verified || false, // Default to false unless already set
      updatedAt: new Date().toISOString()
    };

    onSubmit(submissionData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] w-[95vw] sm:w-full max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-[2rem] border-none shadow-2xl">
      <DialogHeader className="p-6 pb-4 border-b border-slate-50 shrink-0">
        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
          {step === 1 ? 'Select Business Model' : 'Create Opportunity'}
        </DialogTitle>
        <DialogDescription className="text-xs font-medium text-slate-500">
          {step === 1 
            ? 'Choose the path that matches your brand\'s growth strategy for Indian markets.' 
            : 'Complete your listing details to start receiving high-quality investor leads.'}
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-6 pb-10 custom-scrollbar">
        <div className="py-2">
          {step === 1 ? (
            <div className="space-y-4 py-8">
              <div className="grid gap-4">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTypeSelect(opt.id)}
                    className="flex items-center gap-6 p-6 rounded-[2rem] border-2 border-slate-100 bg-white hover:border-slate-900 hover:shadow-xl transition-all group text-left"
                  >
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${opt.color}`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{opt.label}</h4>
                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3 text-slate-600 text-xs mt-6">
                 <ShieldCheck className="h-4 w-4 shrink-0 text-brand-indigo" />
                 <p className="font-bold">Verified profiles receive 4x more engagement from serious Indian investors.</p>
              </div>

              <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] py-8">
                Step 1 of 2: Listing Categorization
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 py-6">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-4"
              >
                <ArrowRight className="h-3 w-3 rotate-180" />
                Change Model Selection
              </button>

              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3 text-orange-800 text-xs">
                <Info className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-bold mb-1 uppercase tracking-wider">Listing as: {typeOptions.find(o => o.id === formData.type)?.label}</p>
                  <p className="opacity-80">Please fill out the following brand identity and model-specific economics.</p>
                </div>
              </div>

              {/* Section 1: Brand Identity */}
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-slate-600" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand Identity</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Brand Name / Listing Title</Label>
                    <Input 
                      required
                      placeholder="e.g. Visionary Tech Solutions"
                      value={formData.brand_name}
                      className="h-12 rounded-xl border-white bg-white"
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_name: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 opacity-60">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Current Model</Label>
                      <div className="h-12 flex items-center px-4 rounded-xl bg-white/50 border border-white font-bold text-xs uppercase tracking-wider">
                        {typeOptions.find(o => o.id === formData.type)?.label}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Business Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(val: string) => setFormData(prev => ({ ...prev, category: val }))}
                        required
                      >
                        <SelectTrigger className="h-12 rounded-xl border-white bg-white">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_SECTORS.map(sector => (
                            <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Operational Model</Label>
                      <Select 
                        value={formData.businessModel} 
                        onValueChange={(val: string) => setFormData(prev => ({ ...prev, businessModel: val }))}
                        required
                      >
                        <SelectTrigger className="h-12 rounded-xl border-white bg-white">
                          <SelectValue placeholder="Select Model (FOFO, COCO, etc.)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FOFO">FOFO (Franchise Owned Franchise Operated)</SelectItem>
                          <SelectItem value="COCO">COCO (Company Owned Company Operated)</SelectItem>
                          <SelectItem value="FOCO">FOCO (Franchise Owned Company Operated)</SelectItem>
                          <SelectItem value="COFO">COFO (Company Owned Franchise Operated)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Core Value Proposition (USP)</Label>
                    <Input 
                      required
                      placeholder="e.g. Low investment with high ROI in tier 2 cities"
                      value={formData.usp}
                      className="h-12 rounded-xl border-white bg-white"
                      onChange={(e) => setFormData(prev => ({ ...prev, usp: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

          {/* Section 2: Branding & Visuals */}
          <div className="p-6 bg-white rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-slate-600" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Branding & Visuals</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ImageUpload 
                  label="Primary Brand Logo" 
                  onUpload={(url) => setFormData(prev => ({ ...prev, logo: url }))} 
                  value={formData.logo} 
                />
                <p className="text-[10px] text-slate-400 font-bold px-2">Square logo (1:1) works best for brand recognition.</p>
              </div>
              <div className="space-y-4">
                <ImageUpload 
                  label="Main Cover Image" 
                  onUpload={(url) => setFormData(prev => ({ ...prev, image: url }))} 
                  value={formData.image} 
                />
                <p className="text-[10px] text-slate-400 font-bold px-2">Landscape photo (16:9) of product or unit.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Label className="text-sm font-bold">Network Summary</Label>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Total Target Units / Dealers</Label>
                <Input 
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.unitsAvailable}
                  className="h-10 rounded-xl"
                  onChange={(e) => setFormData(prev => ({ ...prev, unitsAvailable: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <Label className="text-sm font-bold flex items-center justify-between">
               Operational Unit Photos (Max 4)
               <span className="text-[9px] text-slate-400 font-black uppercase">Build Investor Trust</span>
             </Label>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUpload 
                  label="Upload Unit Photo" 
                  onUpload={(url) => {
                    if(url) {
                      if ((formData.unitPhotos || []).length >= 4) {
                        toast.error("Maximum 4 photos allowed", {
                          description: "Please remove an existing photo to upload a new one."
                        });
                        return;
                      }
                      setFormData(prev => ({ ...prev, unitPhotos: [...(prev.unitPhotos || []), url] }));
                    }
                  }} 
                />
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Photo URL Attachment</Label>
                   <Input 
                    placeholder="https://..."
                    className="h-10 rounded-xl text-xs"
                    id="unit-photo-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        if (input.value) {
                          if ((formData.unitPhotos || []).length >= 4) {
                            toast.error("Maximum 4 photos allowed", {
                              description: "Please remove an existing photo to add a new one."
                            });
                            return;
                          }
                          setFormData(prev => ({ ...prev, unitPhotos: [...(prev.unitPhotos || []), input.value] }));
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <p className="text-[9px] text-slate-400 italic font-medium">Max 4 photos of actual working outlets or sample displays.</p>
                </div>
             </div>

             {/* Display existing unit photos */}
             {formData.unitPhotos && formData.unitPhotos.length > 0 && (
               <div className="flex flex-wrap gap-2 pt-2">
                 {formData.unitPhotos.map((url, idx) => (
                   <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                     <img src={url} alt={`Unit ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     <button 
                       type="button"
                       onClick={() => setFormData(prev => ({ ...prev, unitPhotos: prev.unitPhotos.filter((_, i) => i !== idx) }))}
                       className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <X className="h-3 w-3" />
                     </button>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* Section 3: Targeted Expansion Regions & Priorities */}
          <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border-2 border-slate-100/50 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-black uppercase tracking-tight text-slate-900">Targeted Expansion & Priority</Label>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Where do you want to open units next?</p>
              </div>
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-blue-600">IN</div>
                <div className="h-6 w-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-green-600">MH</div>
                <div className="h-6 w-6 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-red-600">DL</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Pan India', 'North India', 'South India', 'Tier 2 Cities', 'Metro Only'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      if (!formData.locationsLookingFor?.includes(preset)) {
                        setFormData(prev => ({
                          ...prev,
                          locationsLookingFor: [...(prev.locationsLookingFor || []), preset]
                        }));
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:text-blue-600 transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input 
                    placeholder="Enter City, State or Region..."
                    value={newLocation}
                    className="h-12 pl-10 rounded-xl border-slate-200 bg-white shadow-inner focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newLocation.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            locationsLookingFor: [...(prev.locationsLookingFor || []), newLocation.trim()]
                          }));
                          setNewLocation('');
                        }
                      }
                    }}
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={() => {
                    if (newLocation.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        locationsLookingFor: [...(prev.locationsLookingFor || []), newLocation.trim()]
                      }));
                      setNewLocation('');
                    }
                  }} 
                  className="h-12 px-6 bg-slate-900 border-none text-white font-black text-[10px] uppercase tracking-widest rounded-xl"
                >
                  Add Priority
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {formData.locationsLookingFor && formData.locationsLookingFor.length > 0 ? (
                  formData.locationsLookingFor.map((loc, idx) => (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={loc + idx}
                      className="group flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border-2 border-slate-100 shadow-sm transition-all hover:border-blue-200"
                    >
                      <div className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-red-500 animate-pulse' : idx === 1 ? 'bg-orange-400' : 'bg-blue-400'}`} />
                      <span className="text-xs font-black text-slate-900">{loc}</span>
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          locationsLookingFor: prev.locationsLookingFor.filter(l => l !== loc)
                        }))} 
                        className="ml-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <div className="w-full py-8 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No Location Priorities Added Yet</p>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold italic px-2">First 3 locations are treated as "High Priority" and highlighted to matching investors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Removed redundant fields as they are now consolidated above */}
          </div>

          {/* Section 4: Model Economics - Always Required */}
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <IndianRupee className="h-4 w-4 text-blue-600" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Economics & Space</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Starting Capital Required (₹)</Label>
                <Input 
                  type="number"
                  required
                  placeholder="e.g. 500000"
                  value={formData.minInvestment}
                  className="h-12 rounded-xl border-white bg-white"
                  onChange={(e) => setFormData(prev => ({ ...prev, minInvestment: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Maximum Investment Range (₹)</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 1500000"
                  value={formData.maxInvestment}
                  className="h-12 rounded-xl border-white bg-white"
                  onChange={(e) => setFormData(prev => ({ ...prev, maxInvestment: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Carpet Area Requirement (Sq Ft)</Label>
                <Input 
                  placeholder="e.g. 200 - 500"
                  value={formData.space_req}
                  className="h-12 rounded-xl border-white bg-white"
                  onChange={(e) => setFormData(prev => ({ ...prev, space_req: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Expansion Coverage</Label>
                <Input 
                  placeholder="e.g. Andhra Pradesh & Telangana"
                  value={formData.location}
                  className="h-12 rounded-xl border-white bg-white"
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Category Specific Logic Sections */}
          {formData.type === 'brand' && (
            <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Franchise Model Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Franchise Fee (₹)</Label>
                  <Input 
                    placeholder="e.g. 6L"
                    value={formData.franchiseFee}
                    className="h-12 rounded-xl border-indigo-100 bg-white"
                    onChange={(e) => setFormData(prev => ({ ...prev, franchiseFee: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Royalty %</Label>
                  <Input 
                    placeholder="e.g. 6% of GMV"
                    value={formData.monthlyRoyalty}
                    className="h-12 rounded-xl border-indigo-100 bg-white"
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyRoyalty: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Projected Break-even (Mo)</Label>
                  <Input 
                    placeholder="e.g. 18"
                    type="number"
                    value={formData.breakEvenMonths}
                    className="h-12 rounded-xl border-indigo-100 bg-white"
                    onChange={(e) => setFormData(prev => ({ ...prev, breakEvenMonths: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'dealership' && (
            <div className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4 text-amber-600" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400">Dealership Model Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Margin per Unit (₹)</Label>
                  <Input 
                    placeholder="e.g. 5k - 12k"
                    value={formData.marginPerUnitRange}
                    className="h-12 rounded-xl border-amber-100 bg-white"
                    onChange={(e) => setFormData(prev => ({ ...prev, marginPerUnitRange: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Target Incentive</Label>
                  <Input 
                    placeholder="e.g. Quarterly Bonus"
                    value={formData.performanceBonusDetails}
                    className="h-12 rounded-xl border-amber-100 bg-white"
                    onChange={(e) => setFormData(prev => ({ ...prev, performanceBonusDetails: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'distribution' && (
            <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-emerald-600" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Distribution Model Details</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Territory Definition</Label>
                  <Input 
                    placeholder="e.g. Single District"
                    value={formData.territoryDefinition}
                    className="h-12 rounded-xl border-emerald-100 bg-white"
                    onChange={(e) => setFormData(prev => ({ ...prev, territoryDefinition: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Warehouse Space (sq ft)</Label>
                  <Input 
                    placeholder="e.g. 1000"
                    type="number"
                    value={formData.warehouseSqFt}
                    className="h-12 rounded-xl border-emerald-100 bg-white"
                    onChange={(e) => setFormData(prev => ({ ...prev, warehouseSqFt: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Credit Period (Days)</Label>
                  <Input 
                    placeholder="e.g. 7-14"
                    value={formData.creditPeriodDays}
                    className="h-12 rounded-xl border-emerald-100 bg-white"
                    onChange={(e) => setFormData(prev => ({ ...prev, creditPeriodDays: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-bold">Comprehensive Brand Profile</Label>
            <Textarea 
              placeholder="Detail your brand heritage, market position, and vision..."
              value={formData.franchisorProfile}
              onChange={(e) => setFormData(prev => ({ ...prev, franchisorProfile: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Opportunity Description</Label>
            <Textarea 
              required
              placeholder="Describe your brand and the opportunity..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-bold flex items-center justify-between">
              Screening Questions
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Investors must answer these</span>
            </Label>
            <div className="space-y-3">
              {formData.customQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 group relative">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
                     <Button 
                       type="button"
                       variant="ghost" 
                       size="sm" 
                       className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 hover:text-red-500"
                       onClick={() => setFormData(prev => ({
                         ...prev,
                         customQuestions: prev.customQuestions.filter(innerQ => innerQ.id !== q.id)
                       }))}
                     >
                       <X className="h-3.5 w-3.5" />
                     </Button>
                   </div>
                   <div className="space-y-2">
                     <Input 
                       value={q.question}
                       onChange={(e) => {
                         const newQuestions = [...formData.customQuestions];
                         newQuestions[idx].question = e.target.value;
                         setFormData(prev => ({ ...prev, customQuestions: newQuestions }));
                       }}
                       placeholder="Type your custom question here..."
                       className="bg-white text-xs font-bold"
                     />
                     <div className="flex gap-2">
                       <Select 
                        value={q.type}
                        onValueChange={(val: string) => {
                          const newQuestions = [...formData.customQuestions];
                          newQuestions[idx].type = val;
                          setFormData(prev => ({ ...prev, customQuestions: newQuestions }));
                        }}
                       >
                         <SelectTrigger className="h-8 text-[10px] font-bold bg-white w-[120px]">
                           <SelectValue placeholder="Response Type" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="text">Text Answer</SelectItem>
                           <SelectItem value="select">Multiple Choice</SelectItem>
                         </SelectContent>
                       </Select>
                       
                       {q.type === 'select' && (
                         <div className="flex-1">
                           <Input 
                             placeholder="Options (comma separated)"
                             value={q.options?.join(', ') || ''}
                             onChange={(e) => {
                               const newQuestions = [...formData.customQuestions];
                               newQuestions[idx].options = e.target.value.split(',').map(s => s.trim());
                               setFormData(prev => ({ ...prev, customQuestions: newQuestions }));
                             }}
                             className="h-8 text-[10px] font-bold bg-white"
                           />
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 border-dashed rounded-2xl border-slate-300 text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest bg-slate-50/50"
                onClick={() => {
                  const newQ = { id: `q_${Date.now()}`, question: '', type: 'text' };
                  setFormData(prev => ({ ...prev, customQuestions: [...prev.customQuestions, newQ as any] }));
                }}
              >
                + Add New Custom Screening Question
              </Button>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <Label className="text-sm font-black uppercase tracking-widest text-slate-500">Visibility & Privacy (Investor View)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { id: 'showROI', label: 'ROI Sheets' },
                 { id: 'showFranchisorProfile', label: 'Brand Heritage' },
                 { id: 'showSupportDetails', label: 'Support Systems' },
                 { id: 'showDetailedModels', label: 'Business Models' },
                 { id: 'showUnitPhotos', label: 'Operational Photos' },
                 { id: 'showSuccessStories', label: 'Success Stories' }
               ].map(setting => (
                 <label key={setting.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-600"
                      checked={(formData.visibilitySettings as any)?.[setting.id]}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          visibilitySettings: {
                            ...(prev.visibilitySettings || {}),
                            [setting.id]: e.target.checked
                          }
                        }));
                      }}
                    />
                    <span className="text-xs font-bold text-slate-700">{setting.label}</span>
                 </label>
               ))}
            </div>
          </div>

          {formData.tempCredentials && (
            <div className="bg-slate-900 rounded-[2.5rem] p-4 md:p-8 text-white space-y-4">
               <div className="flex items-center gap-3 mb-2">
                 <ShieldCheck className="h-6 w-6 text-green-500" />
                 <h4 className="font-black text-lg uppercase tracking-tight">Admin Handoff Details</h4>
               </div>
               <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Login UserID (Share with Brand)</p>
                   <p className="font-black text-lg text-orange-400">{formData.tempCredentials.userId}</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Generated Password</p>
                   <p className="font-black text-lg text-orange-400">{formData.tempCredentials.password || 'Visionary@2026'}</p>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 italic">Share these credentials with the brand owner for them to review and take over the listing.</p>
               </div>
            </div>
          )}

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <Label className="text-sm font-bold flex items-center justify-between">
              Success Stories
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Investor Testimonials</span>
            </Label>
            <div className="space-y-4">
              {formData.successStories?.map((ss: any, idx: number) => (
                <div key={ss.id} className="p-4 rounded-2xl bg-white border border-slate-100 space-y-3 relative group">
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2 h-7 w-7 p-0 rounded-lg hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setFormData((prev: any) => ({
                      ...prev,
                      successStories: prev.successStories.filter((innerSS: any) => innerSS.id !== ss.id)
                    }))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  
                  <div className="flex gap-4">
                    <img 
                      src={ss.investorPhoto} 
                      alt={ss.investorName} 
                      className="h-12 w-12 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-black">{ss.investorName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{ss.district}, {ss.state}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 italic italic">"{ss.story}"</p>
                </div>
              ))}
              
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add New Story</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-4">
                      <ImageUpload 
                        label="Investor Photo" 
                        onUpload={(url) => { if(url) (document.getElementById('new-ss-photo') as HTMLInputElement).value = url; }}
                      />
                      <Input 
                        placeholder="Investor Name" 
                        className="h-10 text-[11px] font-bold rounded-xl" 
                        id="new-ss-name"
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Location Details</Label>
                      <Input 
                        placeholder="State" 
                        className="h-9 text-[11px] font-bold rounded-xl" 
                        id="new-ss-state"
                      />
                      <Input 
                        placeholder="District" 
                        className="h-9 text-[11px] font-bold rounded-xl" 
                        id="new-ss-district"
                      />
                      <Input 
                        placeholder="Photo URL (Optional)" 
                        className="h-9 text-[9px] font-bold rounded-xl bg-white" 
                        id="new-ss-photo"
                      />
                   </div>
                </div>

                <Textarea 
                  placeholder="Share the success story..." 
                  className="min-h-[60px] text-[11px] font-medium rounded-xl" 
                  id="new-ss-story"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  className="w-full h-9 bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest"
                  onClick={() => {
                    const name = (document.getElementById('new-ss-name') as HTMLInputElement).value;
                    const photo = (document.getElementById('new-ss-photo') as HTMLInputElement).value;
                    const state = (document.getElementById('new-ss-state') as HTMLInputElement).value;
                    const district = (document.getElementById('new-ss-district') as HTMLInputElement).value;
                    const story = (document.getElementById('new-ss-story') as HTMLTextAreaElement).value;
                    
                    if (!name || !story) {
                      toast.error("Please fill name and story");
                      return;
                    }

                    const newSS = {
                      id: `ss_${Date.now()}`,
                      investorName: name,
                      investorPhoto: photo || `https://picsum.photos/seed/${name}/400/400`,
                      state,
                      district,
                      story,
                      date: new Date().toISOString()
                    };

                    setFormData((prev: any) => ({
                      ...prev,
                      successStories: [...(prev.successStories || []), newSS]
                    }));

                    // Reset fields
                    (document.getElementById('new-ss-name') as HTMLInputElement).value = '';
                    (document.getElementById('new-ss-photo') as HTMLInputElement).value = '';
                    (document.getElementById('new-ss-state') as HTMLInputElement).value = '';
                    (document.getElementById('new-ss-district') as HTMLInputElement).value = '';
                    (document.getElementById('new-ss-story') as HTMLTextAreaElement).value = '';
                  }}
                >
                  Save Story
                </Button>
              </div>
            </div>
          </div>

              <DialogFooter className="pt-4 px-0">
                <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10">
                  Publish Listing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </div>
    </DialogContent>
    </Dialog>
  );
}
