import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Users, 
  Activity, 
  ArrowRight,
  MapPin,
  TrendingUp,
  MessageSquare,
  Building2,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  BarChart3,
  Filter,
  MoreVertical,
  Zap,
  Target,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  X,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Opportunity, Application, User, CallbackRequest } from '../types';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import CreateOpportunityModal from './CreateOpportunityModal';
import ManualLeadModal from './ManualLeadModal';
import ImageUpload from './ImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';
import { ScrollArea as ScrollAreaUI } from './ui/scroll-area';

interface BrandDashboardProps {
  user: User;
  opportunities: Opportunity[];
  activeTab?: string;
  onPreviewAsInvestor?: (id: string) => void;
  onFeedbackClick?: () => void;
}

export default function BrandDashboard({ user, opportunities, activeTab = 'brand-leads', onPreviewAsInvestor, onFeedbackClick }: BrandDashboardProps) {
  const [myLeads, setMyLeads] = useState<Application[]>([]);
  const [callbackRequests, setCallbackRequests] = useState<CallbackRequest[]>([]);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Opportunity | null>(null);
  const [activeLeadFilter, setActiveLeadFilter] = useState('all');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  const [isManualLeadOpen, setIsManualLeadOpen] = useState(false);
  
  const myBrands = opportunities.filter(o => o.owner_uid === user.id || o.owner_uid === 'demo-brand-1' || o.owner_uid === 'dev-admin-id');

  const handleUpdateBrand = async (data: any) => {
    if (!editingBrand) {
      try {
        await api.post('/opportunities', {
          ...data,
          owner_uid: user.id || 'dev-admin-id',
          is_verified: user.is_verified || false,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        toast.success("Unit listed successfully! It will be visible once approved by Admin.");
      } catch (error: any) {
        toast.error(error.message || "Failed to create listing");
      }
    } else {
      try {
        await api.patch(`/opportunities/${editingBrand.id}`, {
          ...data,
          updatedAt: new Date().toISOString()
        });
        toast.success("Brand details updated!");
      } catch (error: any) {
        toast.error(error.message || "Failed to update listing");
      }
    }
  };

  // Analytics Data for Brand Owner
  const funnelData = [
    { name: 'Initial Intent', value: myLeads.length },
    { name: 'Engaged', value: myLeads.filter(l => l.status !== 'pending').length },
    { name: 'Agreement Phase', value: myLeads.filter(l => l.status === 'agreement').length },
    { name: 'Converted', value: myLeads.filter(l => l.status === 'completed').length },
  ];

  const intakeData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      leads: myLeads.filter(l => l.dateApplied.startsWith(dateStr)).length,
    };
  }).reverse();

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      await api.patch(`/applications/${leadId}`, { status: newStatus, lastUpdate: new Date().toISOString() });
      setMyLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus as any } : l));
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleAddNote = async (leadId: string) => {
    if (!noteInput.trim()) return;
    try {
      const lead = myLeads.find(l => l.id === leadId);
      const currentNotes = lead?.notes ? `${lead.notes}\n\n[${new Date().toLocaleDateString()}] ${noteInput}` : `[${new Date().toLocaleDateString()}] ${noteInput}`;
      await api.patch(`/applications/${leadId}`, {
        notes: currentNotes,
        lastUpdate: new Date().toISOString()
      });
      setNoteInput('');
      setExpandedLeadId(null);
      toast.success("Note added tracking lead interaction");
    } catch (error: any) {
      toast.error(error.message || "Failed to add note");
    }
  };

  const handleMarkCallbackCompleted = async (id: string) => {
    try {
      await api.patch(`/callbacks/${id}`, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      setCallbackRequests(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' as any } : c));
      toast.success("Callback marked as completed");
    } catch (error: any) {
      toast.error(error.message || "Failed to update callback");
    }
  };

  const handleAddManualLead = async (data: any) => {
    try {
      await api.post('/applications', {
        ...data,
        type: 'brand',
        userId: 'manual_entry',
        dateApplied: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        isManualEntry: true,
        owner_uid: user.id || 'dev-admin-id'
      });
      toast.success("Manual lead added successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to add manual lead");
    }
  };

  useEffect(() => {
    if (!user.id || user.isDemo) return;

    const fetchLeads = async () => {
      try {
        const data = await api.get('/applications');
        setMyLeads(data.applications || data || []);
      } catch (_) {}
    };

    const fetchCallbacks = async () => {
      try {
        const data = await api.get('/callbacks');
        setCallbackRequests(data.callbacks || data || []);
      } catch (_) {}
    };

    fetchLeads();
    fetchCallbacks();

    const socket = getSocket();
    socket.on('applications:sync', fetchLeads);

    return () => {
      socket.off('applications:sync', fetchLeads);
    };
  }, [user.id, user.role, user.isDemo]);

  return (
    <div className="space-y-10">
      {/* Verification Banner */}
      {!user.is_verified && (
        <Card className="border-orange-100 bg-orange-50/50 rounded-[2.5rem] overflow-hidden shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">Get Verified Verification</h3>
                  <p className="text-sm font-medium text-slate-600 mt-1 max-w-md">
                    Upload your business registration documents to gain the <span className="text-green-600 font-bold">Verified</span> badge and appear higher in investor searches.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setIsVerificationModalOpen(true)}
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-12 px-8 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10"
              >
                Upload Documents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'brand-leads' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900">Lead Manager</h2>
              <p className="text-slate-500 mt-1">Manage and track your verified investor leads</p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={onFeedbackClick}
                variant="outline"
                className="hidden md:flex border-slate-200 text-slate-500 shadow-sm rounded-2xl h-14 px-6 font-bold transition-all hover:bg-slate-50"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Feedback
              </Button>
              <Button 
                onClick={() => setIsManualLeadOpen(true)}
                variant="outline"
                className="border-slate-200 text-slate-900 shadow-sm rounded-2xl h-14 px-6 font-bold transition-all"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Lead
              </Button>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Total Leads" value={myLeads.length.toString()} icon={<Users className="h-5 w-5 text-blue-600" />} />
            <StatCard title="Super Leads" value={myLeads.filter(l => l.status === 'pending').length.toString()} icon={<Sparkles className="h-5 w-5 text-orange-600" />} />
            <StatCard title="Callbacks" value={callbackRequests.filter(c => c.status === 'pending').length.toString()} icon={<Phone className="h-5 w-5 text-green-600" />} />
            <StatCard title="Conversion" value={`${myLeads.length > 0 ? Math.floor((myLeads.filter(l => l.status === 'completed').length / myLeads.length) * 100) : 0}%`} icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} />
            <StatCard title="Avg. Response" value="4.2h" icon={<Clock className="h-5 w-5 text-purple-600" />} />
          </div>

          {/* Callback Requests Priority Section */}
          {callbackRequests.some(c => c.status === 'pending') && (
            <div className="bg-green-50/50 rounded-[2.5rem] p-4 md:p-8 border border-green-100 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-200">
                     <Phone className="h-5 w-5" />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900 leading-tight">Pending Callbacks</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Investors requesting more details</p>
                   </div>
                 </div>
                 <Badge className="bg-green-100 text-green-700 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">{callbackRequests.filter(c => c.status === 'pending').length} Requests</Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {callbackRequests.filter(c => c.status === 'pending').map(req => (
                   <div key={req.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                     <div className="flex items-start justify-between mb-4">
                        <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-black text-xs">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.brandName}</p>
                           <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-0.5">Callback Requested</p>
                        </div>
                     </div>
                     <h4 className="font-black text-lg text-slate-900">{req.userName}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6 truncate">{req.userEmail}</p>
                     
                     <div className="flex gap-2">
                       <Button 
                        onClick={() => handleMarkCallbackCompleted(req.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 font-black text-[9px] uppercase tracking-widest"
                       >
                         Mark Done
                       </Button>
                       <Button 
                        onClick={() => { window.location.href = `mailto:${req.userEmail}`; }}
                        variant="outline" 
                        className="h-10 w-10 rounded-xl border-slate-200 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                       >
                         <Mail className="h-4 w-4" />
                       </Button>
                       {req.userPhone && (
                         <Button 
                           onClick={() => { window.location.href = `tel:${req.userPhone}`; }}
                           variant="outline" 
                           className="h-10 w-10 rounded-xl border-slate-200 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
                         >
                           <Phone className="h-4 w-4" />
                         </Button>
                       )}
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* Priority Super Lead Section */}
          {myLeads.some(l => l.status === 'pending') && (
            <div className="bg-slate-50 rounded-[2.5rem] p-4 md:p-8 border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200">
                     <Sparkles className="h-5 w-5" />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900 leading-tight">Priority Super Leads</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Immediate Action Recommended</p>
                   </div>
                 </div>
                 <Badge className="bg-orange-100 text-orange-700 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">{myLeads.filter(l => l.status === 'pending').length} High Intent Investors</Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {myLeads.filter(l => l.status === 'pending').slice(0, 3).map(lead => (
                   <div key={lead.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                     <div className="flex items-start justify-between mb-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                          {lead.userName?.charAt(0)}
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lead.responses?.find(r => r.questionId === 'investment')?.answer || 'Premium'}</p>
                           <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-0.5">Hot Match</p>
                        </div>
                     </div>
                     <h4 className="font-black text-lg text-slate-900 group-hover:text-orange-600 transition-colors">{lead.userName}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6 truncate">{lead.responses?.find(r => r.questionId === 'district')?.answer}, {lead.responses?.find(r => r.questionId === 'state')?.answer}</p>
                     
                     <div className="flex gap-2">
                       <Button 
                        onClick={() => { setExpandedLeadId(lead.id); setActiveLeadFilter('pending'); }} 
                        className="flex-1 bg-slate-900 text-white rounded-xl h-10 font-black text-[9px] uppercase tracking-widest"
                       >
                         Manage Lead
                       </Button>
                       <Button 
                        onClick={() => { window.location.href = `tel:${lead.userPhone}`; }}
                        variant="outline" 
                        className="h-10 w-10 rounded-xl border-slate-200 p-0"
                       >
                         <Phone className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'brand-opportunities' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900">My Opportunity</h2>
              <p className="text-slate-500 mt-1">Manage your brand listing and growth data</p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={onFeedbackClick}
                variant="outline"
                className="hidden md:flex border-slate-200 text-slate-500 shadow-sm rounded-2xl h-14 px-6 font-bold transition-all hover:bg-slate-50"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Feedback
              </Button>
              <Button 
                onClick={() => {
                  setEditingBrand(null);
                  setIsListingModalOpen(true);
                }}
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-14 px-4 md:px-8 font-bold transition-all shadow-xl"
              >
                <Plus className="mr-2 h-5 w-5" />
                List New Unit
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-3">
            <StatCard title="Active Listings" value={myBrands.length.toString()} icon={<Building2 className="h-5 w-5 text-orange-600" />} />
            <StatCard title="Total Listing Views" value="---" icon={<TrendingUp className="h-5 w-5 text-blue-600" />} />
            <StatCard title="Lead Generation Rate" value={`${myBrands.length > 0 ? 'High' : 'N/A'}`} icon={<Sparkles className="h-5 w-5 text-green-600" />} />
          </div>
        </>
      )}

      {activeTab === 'brand-opportunities' && (
        <div className="space-y-8">
           {myBrands.length === 0 ? (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="bg-slate-900 rounded-[2.5rem] p-10 text-center text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
                 <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                   <div className="h-20 w-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center backdrop-blur-md border border-white/20">
                     <Sparkles className="h-10 w-10 text-orange-400" />
                   </div>
                   <h3 className="text-3xl font-black tracking-tight">Your Brand Journey Starts Here</h3>
                   <p className="text-slate-300 font-medium text-lg leading-relaxed">
                     You haven't listed an opportunity yet. Once you fill out the listing form, your brand will be showcased to thousands of verified investors exactly like the interactive demo below.
                   </p>
                   <Button 
                     onClick={() => setIsListingModalOpen(true)}
                     className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-14 px-10 font-black tracking-widest text-sm uppercase shadow-xl hover:scale-105 transition-all mt-4"
                   >
                     List Your First Opportunity
                   </Button>
                 </div>
               </div>

               {/* Interactive Demo View */}
               <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-4 md:p-8 md:p-12 space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-3">
                     <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                     <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Live Investor Preview Demo</h4>
                   </div>
                   <Badge variant="outline" className="text-[10px] font-black uppercase bg-white border-slate-200">Simulated View</Badge>
                 </div>
                 
                 <div className="opacity-80 scale-[0.98] pointer-events-none filter sepia-[0.1]">
                   {/* We simulate what an expanded view looks like */}
                   <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                     <div className="w-full md:w-[40%] bg-slate-100 h-64 md:h-auto relative">
                       <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="demo" />
                       <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-900/80 to-transparent">
                          <h2 className="text-3xl font-black text-white tracking-tight">{(user as any)?.brandName || 'Your Brand Name'}</h2>
                          <p className="text-white/80 font-bold mt-1 uppercase text-xs tracking-widest">Premium {(user as any)?.opportunityType || 'Brand Opportunity'}</p>
                       </div>
                     </div>
                     <div className="w-full md:w-[60%] p-4 md:p-8 md:p-10 space-y-8">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:p-8">
                         <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Investment Scope</p>
                           <p className="text-xl font-bold text-slate-900 mt-1">₹15L - ₹40L</p>
                         </div>
                         <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected ROI</p>
                           <p className="text-xl font-bold text-slate-900 mt-1">14-18 Months</p>
                         </div>
                       </div>
                       <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">What they see about you</p>
                         <p className="text-sm text-slate-600 font-medium leading-relaxed">
                           This sections securely displays your verified brand details, the screening questions you select,
                           and the success stories you upload. Investors must answer your questions before generating a Super Lead!
                         </p>
                       </div>
                       <Button disabled className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">
                         Apply & Become Partner (Investor View)
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           ) : (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               {myBrands.map((brand) => (
                 <Card key={brand.id} className="border-slate-100 rounded-[2rem] overflow-hidden shadow-sm group">
                   <div className="h-40 overflow-hidden relative">
                     <img src={brand.image} alt={brand.brand_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                     <div className="absolute bottom-4 left-6 flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-white p-1.5 shadow-xl">
                         <img src={brand.logo} alt={brand.brand_name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                       </div>
                       <h4 className="text-xl font-black text-white">{brand.brand_name}</h4>
                     </div>
                   </div>
                   <CardContent className="p-4 md:p-8">
                      <p className="text-xs font-medium text-slate-500 line-clamp-2">{brand.description}</p>
                      <div className="flex items-center gap-4 mt-6">
                         <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                           <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{brand.successStories?.length || 0} Success Stories</span>
                         </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                         <div className="flex items-center gap-2 self-start sm:self-auto">
                           <div className="h-2 w-2 rounded-full bg-green-500" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Active</span>
                         </div>
                         <div className="flex gap-2 w-full sm:w-auto">
                           <Button 
                             onClick={() => onPreviewAsInvestor && onPreviewAsInvestor(brand.id)}
                             variant="outline" 
                             className="flex-1 sm:flex-none rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-3"
                           >
                             Preview Investor View
                           </Button>
                           <Button 
                             onClick={() => {
                               setEditingBrand(brand);
                               setIsListingModalOpen(true);
                             }}
                             variant="outline" 
                             className="flex-1 sm:flex-none rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-3"
                            >
                             Edit
                           </Button>
                         </div>
                      </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
        </div>
      )}

      {activeTab === 'brand-leads' && (
        <div className="space-y-10">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <CardHeader className="bg-white p-4 md:p-8 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-xl font-black">Lead Command Pipeline</CardTitle>
                      <CardDescription className="font-semibold">Professional investor screening and status tracking</CardDescription>
                    </div>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar max-w-full">
                       {['all', 'pending', 'reviewed', 'setup'].map(f => (
                         <button 
                           key={f}
                           onClick={() => setActiveLeadFilter(f)}
                           className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                             activeLeadFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                           }`}
                         >
                           {f}
                         </button>
                       ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="divide-y divide-slate-100">
                      {myLeads.filter(l => activeLeadFilter === 'all' || l.status === activeLeadFilter).length > 0 ? 
                       myLeads.filter(l => activeLeadFilter === 'all' || l.status === activeLeadFilter).map((lead) => (
                        <div key={lead.id} className="p-4 md:p-8 hover:bg-slate-50/50 transition-colors group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                              <div className="h-14 w-14 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center font-black text-slate-900 group-hover:scale-110 transition-transform">
                                {lead.userName?.charAt(0) || 'U'}
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-lg font-black text-slate-900">{lead.userName || 'Premium Investor'}</h4>
                                <div className="flex items-center gap-3">
                                  <Badge className={`rounded-lg px-2 py-0.5 font-black text-[9px] uppercase tracking-widest border-none ${
                                    lead.status === 'viewed' ? 'bg-slate-100 text-slate-700' :
                                    lead.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                    lead.status === 'agreement' ? 'bg-purple-100 text-purple-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {lead.status === 'viewed' ? 'Basic Lead' : lead.status === 'pending' ? 'Super Lead' : lead.status}
                                  </Badge>
                                  <span className="text-[10px] font-black text-slate-400 uppercase">UID: {lead.id.slice(-6)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <select 
                                onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                value={lead.status}
                                className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest focus:ring-slate-900"
                              >
                                <option value="viewed">Basic Lead (Viewed)</option>
                                <option value="pending">Super Lead (Submitted)</option>
                                <option value="reviewed">Qualified</option>
                                <option value="agreement">Send Agreement</option>
                                <option value="setup">Start Setup</option>
                                <option value="completed">Live Unit</option>
                                <option value="rejected">Archive</option>
                              </select>
                              <Button 
                                variant="outline" 
                                onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                                className="h-10 px-4 rounded-xl border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest"
                              >
                                {expandedLeadId === lead.id ? 'Hide Details' : 'Details & Notes'}
                              </Button>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => { window.location.href = `tel:${lead.userPhone || ''}`; }}
                                  className="h-10 w-10 p-0 rounded-xl bg-green-50 text-green-600 border border-green-100 hover:bg-green-100"
                                  title="Call Investor"
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button 
                                  onClick={() => { window.location.href = `mailto:${lead.userEmail}`; }}
                                  className="h-10 w-10 p-0 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100"
                                  title="Mail Investor"
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {expandedLeadId === lead.id && (
                            <div className="mt-6 pt-6 border-t border-slate-200/50 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                              {/* Investor Profile Section */}
                              <div className="grid md:grid-cols-2 gap-4 md:p-8">
                                <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                    <Target className="h-5 w-5 text-orange-600" />
                                    <h5 className="text-sm font-black uppercase tracking-widest text-slate-900 underline decoration-orange-500 decoration-2 underline-offset-4">Investor Profile Snapshot</h5>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <ProfileField label="Investment Range" value={lead.responses?.find(r => r.questionId === 'investment')?.answer || '₹5L - ₹10L'} />
                                    <ProfileField label="Business Status" value={lead.responses?.find(r => r.question?.toLowerCase().includes('business'))?.answer || 'Inquiry Only'} />
                                    <ProfileField label="State / Region" value={lead.responses?.find(r => r.questionId === 'state')?.answer || 'Pending'} />
                                    <ProfileField label="District / City" value={lead.responses?.find(r => r.questionId === 'district')?.answer || 'Pending'} />
                                  </div>

                                  <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Health & AI Match</p>
                                      <Badge className="bg-orange-600 text-white border-none text-[8px] font-black">{lead.status === 'pending' ? '92% MATCH' : '65% MATCH'}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: lead.status === 'pending' ? '92%' : '65%' }} />
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-bold italic">AI Recommendation: {lead.status === 'pending' ? 'This is a hot lead with required capital. Immediate callback advised.' : 'Investor is exploring options in your sector. High ROI focus.'}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    <h5 className="text-sm font-black uppercase tracking-widest text-slate-900 underline decoration-blue-500 decoration-2 underline-offset-4">Internal Management</h5>
                                  </div>

                                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Notes</Label>
                                      {lead.notes ? (
                                        <div className="bg-blue-50 rounded-2xl p-4 text-xs font-bold text-slate-700 whitespace-pre-wrap border border-blue-100 shadow-inner">
                                          {lead.notes}
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
                                          <MessageSquare className="h-5 w-5 text-slate-200 mb-2" />
                                          <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">No internal notes yet</p>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex gap-2">
                                      <input 
                                        className="flex-1 h-12 rounded-xl border border-slate-200 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300" 
                                        placeholder="Add private note (e.g. Called, not pick UP)..." 
                                        value={noteInput}
                                        onChange={(e) => setNoteInput(e.target.value)}
                                        onKeyDown={(e) => { if(e.key === 'Enter') handleAddNote(lead.id); }}
                                      />
                                      <Button 
                                        onClick={() => handleAddNote(lead.id)}
                                        className="h-12 px-6 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col gap-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Actions</p>
                                    <div className="grid grid-cols-3 gap-3">
                                      <Button 
                                        variant="outline" 
                                        className="rounded-2xl border-slate-100 bg-slate-50 font-black text-[10px] uppercase tracking-widest h-12 hover:bg-slate-100"
                                        onClick={() => { window.location.href = `tel:${lead.userPhone}`; }}
                                      >
                                        <Phone className="mr-2 h-4 w-4 text-green-600" /> Dial
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        className="rounded-2xl border-slate-100 bg-slate-50 font-black text-[10px] uppercase tracking-widest h-12 hover:bg-slate-100"
                                        onClick={() => { window.location.href = `mailto:${lead.userEmail}`; }}
                                      >
                                        <Mail className="mr-2 h-4 w-4 text-blue-600" /> Email
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        className="rounded-2xl border-slate-100 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest h-12 hover:bg-slate-800"
                                        onClick={() => { 
                                          // For now, switch to messages tab. 
                                          // In a real app we'd pass the chat ID.
                                          const messagesTab = document.querySelector('[data-tab="messages"]');
                                          if (messagesTab) (messagesTab as HTMLElement).click();
                                        }}
                                      >
                                        <MessageSquare className="mr-2 h-4 w-4 text-white" /> Chat
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Custom Question Responses */}
                              {lead.responses && lead.responses.length > 0 && (
                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                  <div className="flex items-center gap-3">
                                    <Filter className="h-5 w-5 text-purple-600" />
                                    <h5 className="text-sm font-black uppercase tracking-widest text-slate-900 underline decoration-purple-500 decoration-2 underline-offset-4">Questionnaire Responses</h5>
                                  </div>
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    {lead.responses.filter(r => !['name', 'email', 'mobile', 'state', 'district', 'investment'].includes(r.questionId)).map((resp, idx) => (
                                      <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:bg-white transition-all hover:shadow-sm">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{resp.question}</p>
                                        <p className="text-xs font-bold text-slate-900">{resp.answer}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="grid sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-100/50">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                 <Building2 className="h-4 w-4" />
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applying For</p>
                                 <p className="text-xs font-bold text-slate-900">{lead.opportunityName}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                 <MapPin className="h-4 w-4" />
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Region</p>
                                 <p className="text-xs font-bold text-slate-900">{lead.responses?.find(r => (r.question || "").toLowerCase().includes('location'))?.answer || 'Global Expansion'}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                 <TrendingUp className="h-4 w-4" />
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Investment Readiness</p>
                                 <p className="text-xs font-bold text-slate-900">High Qualified</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                          <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                            <MessageSquare className="h-10 w-10 text-slate-300" />
                          </div>
                          <h4 className="text-xl font-black text-slate-900">Quiet Phase</h4>
                          <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">No active leads match your filter criteria. Marketing engine is active.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-4 md:p-8 text-white">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
                    <Target className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight">Strategic Alert</h4>
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none">Market Intelligence</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                     <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">High Demand Spot</p>
                     <p className="text-sm font-bold text-slate-300">Investors in <span className="text-white">Warangal (TS)</span> are looking for your sector.</p>
                     <Button variant="link" className="text-orange-400 p-0 h-auto font-black text-[10px] uppercase tracking-widest mt-3">Expand Now <ArrowUpRight className="ml-1 h-3 w-3" /></Button>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                     <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Competition Edge</p>
                     <p className="text-sm font-bold text-slate-300">You are the <span className="text-white">Top 3 Brand</span> in your category this week.</p>
                  </div>
                </div>
              </div>

              <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <CardHeader className="p-4 md:p-8">
                  <CardTitle className="text-xl font-black">Lead Health</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-8 pt-0 space-y-8">
                   <div>
                     <div className="flex justify-between items-center mb-3">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Conversations</span>
                       <span className="text-blue-600 font-black">74%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600 rounded-full" style={{ width: '74%' }} />
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between items-center mb-3">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Follow-up Speed</span>
                       <span className="text-green-600 font-black">92%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-600 rounded-full" style={{ width: '92%' }} />
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Support Section for Admins or general */}
      {activeTab === 'support' && (
        <div className="space-y-8">
           <div className="grid lg:grid-cols-2 gap-10">
              <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <CardHeader className="p-4 md:p-8 border-b border-slate-100 bg-white">
                  <CardTitle className="text-2xl font-black">Help & Support</CardTitle>
                  <CardDescription>Direct line to our expansion consultants</CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-8 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a href="tel:+919876543210" className="flex flex-col items-center justify-center p-4 md:p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group">
                      <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Phone className="h-6 w-6 text-orange-600" />
                      </div>
                      <p className="text-sm font-black text-slate-900">Call Support</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">9 AM - 7 PM</p>
                    </a>
                    <button className="flex flex-col items-center justify-center p-4 md:p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                      <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-black text-slate-900">Email Query</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">24h Response</p>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Submit Query / Complaint</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <select className="h-12 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold focus:ring-orange-500">
                         <option>Query</option>
                         <option>Suggestion</option>
                         <option>Complaint</option>
                         <option>Technical Issue</option>
                       </select>
                       <input placeholder="Subject" className="h-12 rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-bold focus:ring-orange-500" />
                    </div>
                    <textarea 
                      placeholder="Describe your doubt or requirement in detail..." 
                      className="w-full h-32 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-xs font-bold focus:ring-orange-500"
                    />
                    <Button className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200">
                      Submit to Support
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                 <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Zap className="h-32 w-32" />
                    </div>
                    <h4 className="text-2xl font-black mb-6">Expert Guidance</h4>
                    <p className="text-slate-400 leading-relaxed font-medium mb-8">
                      Doubtful about a specific region? Our market expert Rajesh is assigned to your account. 
                      You can schedule a consultation specifically for geographic expansion strategies.
                    </p>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-orange-600 flex items-center justify-center font-black">R</div>
                      <div>
                        <p className="font-black text-white">Rajesh Kumar</p>
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Regional Growth Expert</p>
                      </div>
                      <Button size="sm" className="ml-auto bg-white text-slate-900 hover:bg-slate-100 font-black text-[9px] uppercase tracking-widest rounded-lg">Book Call</Button>
                    </div>
                 </div>

                 <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                   <CardHeader className="p-4 md:p-8">
                     <CardTitle className="text-lg font-black">Support Guidelines</CardTitle>
                   </CardHeader>
                   <CardContent className="p-4 md:p-8 pt-0 space-y-4">
                      {[
                        "Standard verification takes 24-48 business hours.",
                        "Investment margins must be clearly stated for better conversion.",
                        "Direct calls to investors are only allowed after lead qualification.",
                        "Complaints are resolved within an average of 4 business hours."
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-slate-600">{item}</p>
                        </div>
                      ))}
                   </CardContent>
                 </Card>
              </div>
           </div>
        </div>
      )}

      <CreateOpportunityModal 
        isOpen={isListingModalOpen} 
        onClose={() => {
          setIsListingModalOpen(false);
          setEditingBrand(null);
        }} 
        initialData={editingBrand}
        onSubmit={handleUpdateBrand}
      />

      <ManualLeadModal 
        isOpen={isManualLeadOpen} 
        onClose={() => setIsManualLeadOpen(false)} 
        onSubmit={handleAddManualLead} 
        opportunities={myBrands} 
      />

      {/* Brand Verification Modal */}
      <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] border-none p-0 overflow-hidden bg-slate-50">
          <DialogHeader className="p-8 bg-white border-b border-slate-100">
            <div className="h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900 leading-tight">Brand Verification</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Upload business documents to verify your brand's legitimacy.
            </DialogDescription>
          </DialogHeader>

          <ScrollAreaUI className="max-h-[60vh] p-8">
            <div className="space-y-8">
              <div className="grid gap-6">
                <div className="p-6 bg-white rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">GST Certificate</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Required for all Indian Brands</p>
                    </div>
                    {user.verification_docs?.find(d => d.type === 'GST')?.status === 'verified' ? (
                      <Badge className="bg-green-100 text-green-700 border-none rounded-lg px-2 py-0.5 font-black text-[8px] uppercase tracking-widest">Verified</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-none rounded-lg px-2 py-0.5 font-black text-[8px] uppercase tracking-widest">Pending</Badge>
                    )}
                  </div>
                  
                  <ImageUpload 
                    label="Upload GST (Image/PDF Screenshot)" 
                    onUpload={async (url) => {
                      if (!url) return;
                      try {
                        const docs = user.verification_docs || [];
                        const existingIdx = docs.findIndex(d => d.type === 'GST');
                        const newDoc = {
                          type: 'GST',
                          url,
                          status: 'pending' as const,
                          uploadedAt: new Date().toISOString()
                        };
                        
                        let updatedDocs;
                        if (existingIdx >= 0) {
                          updatedDocs = [...docs];
                          updatedDocs[existingIdx] = newDoc;
                        } else {
                          updatedDocs = [...docs, newDoc];
                        }

                        await api.patch(`/users/${user.id}`, {
                          verification_docs: updatedDocs
                        });
                        toast.success("GST Certificate uploaded for review!");
                      } catch (error) {
                        toast.error("Failed to update documents");
                      }
                    }} 
                    value={user.verification_docs?.find(d => d.type === 'GST')?.url || ''}
                  />
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Trade License / Incorporation</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Proof of Registered Business</p>
                    </div>
                  </div>
                  
                  <ImageUpload 
                    label="Upload Certificate" 
                    onUpload={async (url) => {
                      if (!url) return;
                      try {
                        const docs = user.verification_docs || [];
                        const existingIdx = docs.findIndex(d => d.type === 'Incorporation');
                        const newDoc = {
                          type: 'Incorporation',
                          url,
                          status: 'pending' as const,
                          uploadedAt: new Date().toISOString()
                        };
                        
                        let updatedDocs;
                        if (existingIdx >= 0) {
                          updatedDocs = [...docs];
                          updatedDocs[existingIdx] = newDoc;
                        } else {
                          updatedDocs = [...docs, newDoc];
                        }

                        await api.patch(`/users/${user.id}`, {
                          verification_docs: updatedDocs
                        });
                        toast.success("Incorporation document uploaded for review!");
                      } catch (error) {
                        toast.error("Failed to update documents");
                      }
                    }} 
                    value={user.verification_docs?.find(d => d.type === 'Incorporation')?.url || ''}
                  />
                </div>
              </div>

              {user.verification_docs && user.verification_docs.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {user.verification_docs.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{d.type}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Uploaded {new Date(d.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className={`rounded-lg px-2 py-0.5 font-black text-[8px] uppercase tracking-widest border-none ${
                          d.status === 'verified' ? 'bg-green-100 text-green-700' : 
                          d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {d.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollAreaUI>

          <DialogFooter className="p-8 bg-white border-t border-slate-100">
            <Button 
              onClick={() => setIsVerificationModalOpen(false)}
              className="w-full bg-slate-900 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10"
            >
              Done / Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</p>
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </CardContent>
    </Card>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
      <p className="text-xs font-bold text-slate-900 truncate">{value}</p>
    </div>
  );
}
