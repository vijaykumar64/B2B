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
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Users,
  Activity,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  UserCircle,
  Mail,
  Phone,
  Calendar,
  Share2,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Award,
  ShieldCheck,
  MapPin,
  Save,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  UserPlus,
  MessageSquare,
  History,
  Info,
  X,
  FileText,
  CheckSquare,
  Store
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { User, UserActivity, Application, Influencer, PlatformConfig, FieldAgentRequest, Opportunity } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { seedDemoData } from '../lib/demoData';
import CreateOpportunityModal from './CreateOpportunityModal';

interface AdminDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function AdminDashboard({ activeTab: activeTabProp, onTabChange }: AdminDashboardProps = {}) {
  const [internalTab, setInternalTab] = useState('overview');
  const currentTab = activeTabProp ?? internalTab;

  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [callbacks, setCallbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Opportunity | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [leadSortOption, setLeadSortOption] = useState<'dateApplied' | 'lastUpdate'>('lastUpdate');
  const [reviewingOpp, setReviewingOpp] = useState<Opportunity | null>(null);
  const [reviewBrandOwner, setReviewBrandOwner] = useState<User | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const logAdminAction = async (userId: string, actionDesc: string, details?: any) => {
    try {
      const userData = await api.get(`/users/${userId}`);
      if (userData) {
        const actions = userData.admin_actions || [];
        await api.patch(`/users/${userId}`, {
          admin_actions: [
            ...actions,
            {
              action: actionDesc,
              timestamp: new Date().toISOString(),
              adminName: 'Platform Admin',
              description: actionDesc,
              changes: details || null
            }
          ]
        });
      }
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get('/users');
        setAllUsers(Array.isArray(data) ? data : data.users || []);
      } catch (_) {}
    };
    fetchUsers();

    const socket = getSocket();
    socket.on('users:updated', fetchUsers);

    return () => {
      socket.off('users:updated', fetchUsers);
    };
  }, []);

  // Professional Analytics Data Generation
  const getActivityData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      views: activities.filter(a => a.timestamp.startsWith(date) && a.type === 'view_details').length,
      leads: applications.filter(a => a.dateApplied.startsWith(date)).length,
      interests: activities.filter(a => a.timestamp.startsWith(date) && a.type === 'interested').length,
    }));
  };

  const getSectorData = () => {
    const sectors = [...new Set(opportunities.map(o => o.category))];
    return sectors.map(sector => ({
      name: sector,
      value: opportunities.filter(o => o.category === sector).length,
      demand: activities.filter(a => a.opportunityId && opportunities.find(o => o.id === a.opportunityId)?.category === sector).length
    })).sort((a, b) => b.demand - a.demand);
  };

  const activityData = getActivityData();
  const sectorData = getSectorData();
  const CHART_COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#6366f1', '#a5b4fc'];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [activitiesData, applicationsData, opportunitiesData, callbacksData] = await Promise.all([
          api.get('/activities'),
          api.get('/applications'),
          api.get('/opportunities'),
          api.get('/callbacks')
        ]);
        setActivities(Array.isArray(activitiesData) ? activitiesData : activitiesData.activities || []);
        setApplications(Array.isArray(applicationsData) ? applicationsData : applicationsData.applications || []);
        setOpportunities(Array.isArray(opportunitiesData) ? opportunitiesData : opportunitiesData.opportunities || []);
        setCallbacks(Array.isArray(callbacksData) ? callbacksData : callbacksData.callbacks || []);
      } catch (_) {}
      setLoading(false);
    };

    fetchAll();

    const socket = getSocket();
    socket.on('opportunities:sync', fetchAll);
    socket.on('applications:sync', fetchAll);
    socket.on('activities:sync', fetchAll);

    return () => {
      socket.off('opportunities:sync', fetchAll);
      socket.off('applications:sync', fetchAll);
      socket.off('activities:sync', fetchAll);
    };
  }, []);

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/opportunities/${id}`, { is_verified: !currentStatus });

      const opp = opportunities.find(o => o.id === id);
      if (opp?.owner_uid) {
        await logAdminAction(opp.owner_uid, `Brand verification status changed to ${!currentStatus ? 'Verified' : 'Unverified'}`);
      }

      setOpportunities(prev => prev.map(o => o.id === id ? { ...o, is_verified: !currentStatus } : o));
      toast.success(currentStatus ? "Verification removed" : "Opportunity verified successfully!");
    } catch (error) {
      toast.error("Failed to update verification status");
    }
  };

  const handleReviewBrand = async (opp: Opportunity) => {
    setReviewingOpp(opp);
    setReviewBrandOwner(null);
    if (opp.owner_uid) {
      setReviewLoading(true);
      try {
        const data = await api.get(`/users/${opp.owner_uid}`);
        if (data?.user) setReviewBrandOwner(data.user);
      } catch (_) {} finally { setReviewLoading(false); }
    }
  };

  const handleApproveFromReview = async () => {
    if (!reviewingOpp) return;
    try {
      await api.patch(`/opportunities/${reviewingOpp.id}`, { status: 'published', is_verified: true });
      if (reviewingOpp.owner_uid) await logAdminAction(reviewingOpp.owner_uid, 'Listing approved and published by admin');
      setOpportunities(prev => prev.map(o => o.id === reviewingOpp.id ? { ...o, status: 'published', is_verified: true } : o));
      toast.success('Listing approved and published!');
      setReviewingOpp(null);
    } catch { toast.error('Failed to approve'); }
  };

  const handleRejectFromReview = async () => {
    if (!reviewingOpp) return;
    try {
      await api.patch(`/opportunities/${reviewingOpp.id}`, { status: 'rejected' });
      if (reviewingOpp.owner_uid) await logAdminAction(reviewingOpp.owner_uid, 'Listing rejected by admin');
      setOpportunities(prev => prev.map(o => o.id === reviewingOpp.id ? { ...o, status: 'rejected' as any } : o));
      toast.error('Listing rejected.');
      setReviewingOpp(null);
    } catch { toast.error('Failed to reject'); }
  };

  const handleCreateListing = async (data: any) => {
    try {
      const brandId = `brand-${(data.brand_name || data.name || "brand").replace(/\s+/g, '-').toLowerCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const defaultPassword = "Visionary@2026";

      await api.post('/opportunities', {
        ...data,
        owner_uid: brandId,
        is_verified: false,
        status: 'draft',
        image: data.image || `https://picsum.photos/seed/${(data.brand_name || data.name || "brand").replace(/\s+/g, '-').toLowerCase()}/1600/1200`,
        createdAt: new Date().toISOString(),
        tempCredentials: { userId: brandId, password: defaultPassword }
      });

      await api.post('/auth/register', {
        uid: brandId,
        name: `${data.brand_name || data.name} Admin`,
        email: `${brandId}@visionary.com`,
        password: defaultPassword,
        role: 'brand_owner',
        admin_actions: [
          {
            action: 'Account Created',
            timestamp: new Date().toISOString(),
            adminName: 'Platform Admin',
            description: 'Brand account and initial listing created by platform admin.'
          }
        ]
      });

      toast.success(`Brand account created: ${brandId}. Share details with owner.`);
    } catch (error) {
      toast.error("Failed to create brand listing");
    }
  };

  const handleUpdateListing = async (data: any) => {
    if (!editingBrand) {
      await handleCreateListing(data);
      return;
    }

    try {
      const { id, ...updateData } = data;
      await api.patch(`/opportunities/${editingBrand.id}`, updateData);
      setOpportunities(prev => prev.map(o => o.id === editingBrand.id ? { ...o, ...updateData } : o));
      toast.success("Listing updated successfully!");
      setIsListingModalOpen(false);
      setEditingBrand(null);
    } catch (error) {
      toast.error("Failed to update listing");
    }
  };

  const filteredActivities = activities.filter(a => 
    (a.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.type || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApplications = applications.filter(a => 
    (a.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.opportunityName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const dateA = new Date(leadSortOption === 'lastUpdate' ? a.lastUpdate : a.dateApplied).getTime();
    const dateB = new Date(leadSortOption === 'lastUpdate' ? b.lastUpdate : b.dateApplied).getTime();
    return dateB - dateA;
  });

  const filteredAllUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone?.includes(searchQuery)
  );

  const handleResetData = async () => {
    if (!window.confirm("CRITICAL: This will wipe ALL transactional data (Users, Opportunities, Leads, Activities, Influencers) and re-seed from scratch. Continue?")) return;
    
    setLoading(true);
    try {
      const { clearAndSeedData } = await import('../lib/demoData');
      await clearAndSeedData();
      toast.success("System reset and re-seeded successfully!");
    } catch (error) {
      console.error("Reset Error:", error);
      toast.error("Failed to reset system data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Admin Control Center</h2>
          <p className="text-slate-500 mt-1">Monitor platform activity and manage network growth</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleResetData}
            disabled={loading}
            className="rounded-2xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold hidden md:flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Wipe & Re-Seed System
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              const result = await seedDemoData();
              if (result) toast.success("15+ verified brands seeded to your catalog!");
              else toast.info("Brands are already seeded.");
            }}
            className="rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 font-bold hidden md:flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Seed Demo Data
          </Button>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm w-full md:w-96">
            <Search className="h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search network..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus-visible:ring-0 p-0 h-auto text-sm font-medium"
            />
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => { setInternalTab(v); onTabChange?.(v); }} className="space-y-8">
        {/* Hide internal tab bar when sidebar is controlling navigation */}
        {activeTabProp === undefined && (
          <TabsList className="bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-2 h-auto flex-wrap">
            {[
              { value: 'overview', label: 'Overview' },
              { value: 'approvals', label: 'Approvals' },
              { value: 'opportunities', label: 'Brands & Listings' },
              { value: 'leads', label: 'Lead Monitor' },
              { value: 'callbacks', label: 'Call Requests' },
              { value: 'users', label: 'User Registry' }
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
              >
                {tab.label}
                {tab.value === 'approvals' && (opportunities.filter(o => o.status === 'pending' || o.status === 'submitted').length > 0 || allUsers.filter(u => u.verification_docs?.some(d => d.status === 'pending')).length > 0) && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white animate-pulse">
                    {opportunities.filter(o => o.status === 'pending' || o.status === 'submitted').length + allUsers.filter(u => u.role === 'brand_owner' && u.verification_docs?.some(d => d.status === 'pending')).length}
                  </span>
                )}
                {tab.value === 'callbacks' && callbacks.filter(c => c.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] text-white">
                    {callbacks.filter(c => c.status === 'pending').length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        
        <TabsContent value="approvals" className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-900">Approvals</h3>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Listing Approvals */}
            <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <CardHeader className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">Listing Approvals</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Pending Brand Submissions</CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-none rounded-lg px-2 py-1 font-black text-[10px] tracking-widest uppercase">
                    {opportunities.filter(o => o.status === 'pending' || o.status === 'submitted').length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y divide-slate-100">
                    {opportunities.filter(o => o.status === 'pending' || o.status === 'submitted').length === 0 ? (
                      <div className="py-20 text-center text-slate-400 font-bold">All listings are approved.</div>
                    ) : (
                      opportunities
                        .filter(o => o.status === 'pending' || o.status === 'submitted')
                        .map(opp => (
                          <div key={opp.id} className="p-8 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-4 mb-6">
                              <img src={opp.logo || opp.image} className="h-12 w-12 rounded-xl object-cover border border-slate-100" referrerPolicy="no-referrer" />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-black text-slate-900 truncate">{opp.brand_name}</h4>
                                <p className="text-xs font-bold text-slate-500">{opp.category} • {opp.location}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="p-3 bg-slate-50 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Investment</p>
                                <p className="text-xs font-bold text-slate-900">{opp.investment_range}</p>
                              </div>
                              <div className="p-3 bg-slate-50 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Created At</p>
                                <p className="text-xs font-bold text-slate-900">{new Date(opp.createdAt || Date.now()).toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReviewBrand(opp)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 font-black text-[9px] uppercase tracking-widest"
                              >
                                Review Profile
                              </Button>
                              <Button
                                onClick={async () => {
                                  try {
                                    await api.patch(`/opportunities/${opp.id}`, { status: 'published', is_verified: true });
                                    setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, status: 'published', is_verified: true } : o));
                                    toast.success("Listing Approved and Published!");
                                  } catch (error) {
                                    toast.error("Failed to approve listing");
                                  }
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 font-black text-[9px] uppercase tracking-widest"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => { setEditingBrand(opp); setIsListingModalOpen(true); }}
                                className="border-slate-200 h-10 rounded-xl px-4"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Brand Verification Requests */}
            <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <CardHeader className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">Brand Verification</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">KYC & DOCUMENT REVIEWS</CardDescription>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-none rounded-lg px-2 py-1 font-black text-[10px] tracking-widest uppercase">
                    {allUsers.filter(u => u.role === 'brand_owner' && u.verification_docs?.some(d => d.status === 'pending')).length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y divide-slate-100">
                    {allUsers.filter(u => u.role === 'brand_owner' && u.verification_docs?.some(d => d.status === 'pending')).length === 0 ? (
                      <div className="py-20 text-center text-slate-400 font-bold">No verification requests.</div>
                    ) : (
                      allUsers
                        .filter(u => u.role === 'brand_owner' && u.verification_docs?.some(d => d.status === 'pending'))
                        .map(brandUser => (
                          <div key={brandUser.id} className="p-8 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                                {brandUser.name?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-black text-slate-900 truncate">{brandUser.name}</h4>
                                <p className="text-xs font-bold text-slate-500">{brandUser.email}</p>
                              </div>
                            </div>

                            <div className="space-y-3 mb-6">
                              {brandUser.verification_docs?.filter(d => d.status === 'pending').map((docu, idx) => (
                                <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <p className="text-xs font-black text-slate-900">{docu.type}</p>
                                      <p className="text-[9px] font-bold text-slate-400">Uploaded {new Date(docu.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => window.open(docu.url, '_blank')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={async () => {
                                  try {
                                    const updatedDocs = brandUser.verification_docs?.map(d =>
                                      d.status === 'pending' ? { ...d, status: 'verified' as const } : d
                                    );
                                    await api.patch(`/users/${brandUser.id}`, {
                                      verification_docs: updatedDocs,
                                      is_verified: true
                                    });
                                    const brandOpps = opportunities.filter(o => o.owner_uid === brandUser.id);
                                    for (const opp of brandOpps) {
                                      await api.patch(`/opportunities/${opp.id}`, { is_verified: true });
                                    }
                                    setAllUsers(prev => prev.map(u => u.id === brandUser.id ? { ...u, verification_docs: updatedDocs, is_verified: true } : u));
                                    setOpportunities(prev => prev.map(o => o.owner_uid === brandUser.id ? { ...o, is_verified: true } : o));
                                    toast.success("Brand Verified Successfully!");
                                  } catch (error) {
                                    toast.error("Failed to verify brand");
                                  }
                                }}
                                className="flex-1 bg-slate-900 text-white rounded-xl h-10 font-black text-[9px] uppercase tracking-widest"
                              >
                                Mark as Verified
                              </Button>
                              <Button
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const updatedDocs = brandUser.verification_docs?.map(d =>
                                      d.status === 'pending' ? { ...d, status: 'rejected' as const } : d
                                    );
                                    await api.patch(`/users/${brandUser.id}`, { verification_docs: updatedDocs });
                                    setAllUsers(prev => prev.map(u => u.id === brandUser.id ? { ...u, verification_docs: updatedDocs } : u));
                                    toast.error("Application Rejected");
                                  } catch (error) {
                                    toast.error("Update failed");
                                  }
                                }}
                                className="border-red-100 text-red-600 hover:bg-red-50 h-10 rounded-xl px-4"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Activities" value={activities.length.toString()} icon={<Activity className="h-5 w-5 text-blue-600" />} />
            <StatCard title="Total Applications" value={applications.length.toString()} icon={<Users className="h-5 w-5 text-orange-600" />} />
            <StatCard title="Active Brands" value={[...new Set(applications.map(a => a.opportunityId))].length.toString()} icon={<Building2 className="h-5 w-5 text-green-600" />} />
            <StatCard title="Live Units" value={applications.filter(a => a.status === 'completed').length.toString()} icon={<CheckCircle2 className="h-5 w-5 text-purple-600" />} />
          </div>
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <CardHeader className="p-4 md:p-8 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-orange-100 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                        Platform Growth Trends
                      </CardTitle>
                      <CardDescription className="font-medium">Investor interest and lead velocity (7-day window)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-8 pt-0 h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                      />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="views" name="Intent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                      <Area type="monotone" dataKey="leads" name="Conversions" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-2 gap-4 md:p-8">
                <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <CardHeader className="p-4 md:p-8 pb-4">
                    <CardTitle className="text-lg font-black flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-green-100 flex items-center justify-center">
                        <PieChartIcon className="h-5 w-5 text-green-600" />
                      </div>
                      Sector Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-8 pt-0 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {sectorData.slice(0, 4).map((s, i) => (
                        <div key={s.name} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                          <span className="text-[10px] font-black text-slate-600 uppercase truncate">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <CardHeader className="p-4 md:p-8 pb-4">
                    <CardTitle className="text-lg font-black flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-purple-100 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      Lead Velocity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-8 pt-0 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData.slice(-5)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                        <RechartsTooltip />
                        <Bar dataKey="leads" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <CardHeader className="p-4 md:p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  System Logs
                </CardTitle>
                <CardDescription className="font-medium">Real-time platform events</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[800px]">
                  <div className="divide-y divide-slate-50">
                    {filteredActivities.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 font-medium">No activities found.</div>
                    ) : (
                      filteredActivities
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((activity) => (
                          <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className={`rounded-lg px-2 py-0.5 font-black text-[9px] uppercase tracking-widest border-none ${getActivityColor(activity.type)}`}>
                                {activity.type.replace('_', ' ')}
                              </Badge>
                              <span className="text-[9px] text-slate-400 font-black uppercase">
                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 font-black text-xs shrink-0">
                                {activity.userName?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate">{activity.userName}</p>
                                <p className="text-[10px] text-slate-500 font-bold truncate opacity-60">@{activity.userPhone || 'system'}</p>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="callbacks" className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <Phone className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-900">Call Requests</h3>
          </div>
          <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <CardHeader className="p-4 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black">Expert Callback Requests</CardTitle>
                  <CardDescription>Verified brand and investor expansion consultations</CardDescription>
                </div>
                <Badge className="bg-slate-100 text-slate-600 border-none rounded-lg px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                  {callbacks.length} TOTAL REQUESTS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Requestor</th>
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Type</th>
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</th>
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Status</th>
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {callbacks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">No callback requests yet.</td>
                      </tr>
                    ) : (
                      callbacks.map((call) => (
                        <tr key={call.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                          <td className="px-4 md:px-4 md:px-8 py-4 md:py-4 md:py-6">
                            <div>
                              <p className="font-black text-slate-900 truncate max-w-[120px] md:max-w-none">{call.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(call.timestamp).toLocaleDateString()}</p>
                              <Badge className={`sm:hidden rounded-lg px-2 mt-1 py-0 font-black text-[8px] uppercase tracking-widest border-none ${
                                 call.type === 'brand' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {call.type === 'brand' ? 'BRAND' : 'INVESTOR'}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 md:px-4 md:px-8 py-4 md:py-6 hidden sm:table-cell">
                            <Badge className={`rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none ${
                               call.type === 'brand' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {call.type === 'brand' ? 'BRAND' : 'INVESTOR'}
                            </Badge>
                          </td>
                          <td className="px-4 md:px-4 md:px-8 py-4 md:py-4 md:py-6 space-y-1">
                            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-900">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {call.phone}
                              {call.verified && (
                                <Badge variant="outline" className="hidden sm:inline-flex text-[8px] bg-green-50 text-green-700 border-green-100">OTP Verified</Badge>
                              )}
                            </div>
                            {call.authorised_phone && (
                              <p className="text-[9px] font-medium text-slate-500">Official: {call.authorised_phone}</p>
                            )}
                            <div className="md:hidden mt-2">
                               <Select
                                value={call.status}
                                onValueChange={async (val) => {
                                  try {
                                    await api.patch(`/callbacks/${call.id}`, { status: val });
                                    setCallbacks(prev => prev.map(c => c.id === call.id ? { ...c, status: val } : c));
                                    toast.success(`Request marked as ${val}`);
                                  } catch (error) {
                                    toast.error("Update failed");
                                  }
                                }}
                               >
                                  <SelectTrigger className="h-7 text-[8px] font-black uppercase tracking-widest rounded-lg border-slate-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending" className="text-[10px] font-black">PENDING</SelectItem>
                                    <SelectItem value="contacted" className="text-[10px] font-black">CONTACTED</SelectItem>
                                    <SelectItem value="completed" className="text-[10px] font-black">RESOLVED</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                          </td>
                          <td className="px-4 md:px-4 md:px-8 py-4 md:py-6 hidden md:table-cell">
                             <Select
                              value={call.status}
                              onValueChange={async (val) => {
                                try {
                                  await api.patch(`/callbacks/${call.id}`, { status: val });
                                  setCallbacks(prev => prev.map(c => c.id === call.id ? { ...c, status: val } : c));
                                  toast.success(`Request marked as ${val}`);
                                } catch (error) {
                                  toast.error("Update failed");
                                }
                              }}
                             >
                                <SelectTrigger className="h-8 text-[9px] font-black uppercase tracking-widest rounded-lg border-slate-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending" className="text-[10px] font-black">PENDING</SelectItem>
                                  <SelectItem value="contacted" className="text-[10px] font-black">CONTACTED</SelectItem>
                                  <SelectItem value="completed" className="text-[10px] font-black">RESOLVED</SelectItem>
                                </SelectContent>
                             </Select>
                          </td>
                          <td className="px-4 md:px-4 md:px-8 py-4 md:py-4 md:py-6">
                             <div className="flex gap-2">
                               <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg border-slate-200"
                                onClick={() => {
                                  toast.info(`${call.name}'s Message: ${call.message || 'No message provided.'}`, {
                                    duration: 5000
                                  });
                                }}
                               >
                                 <MessageSquare className="h-3.5 w-3.5" />
                               </Button>
                               {call.type === 'brand' && (
                                 <Button 
                                  size="icon" 
                                  className="h-8 w-8 bg-slate-900 rounded-lg"
                                  onClick={() => {
                                    setIsListingModalOpen(true);
                                  }}
                                 >
                                   <Building2 className="h-3.5 w-3.5" />
                                 </Button>
                               )}
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-900">Users</h3>
          </div>
          <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <CardHeader className="p-4 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <CardTitle className="text-2xl font-black">User Registry</CardTitle>
                  <CardDescription>Manage all {allUsers.length} active members in your network</CardDescription>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search registry..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 h-10 w-full md:w-64 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold focus:bg-white focus:ring-slate-900 transition-all"
                      />
                   </div>
                   <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
                     <Users className="h-4 w-4 text-slate-400" />
                     <span className="text-xs font-black text-slate-600">{filteredAllUsers.length} Results</span>
                   </div>
                   <Button variant="outline" className="rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2">
                     <Filter className="h-4 w-4" /> Filter
                   </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Member</th>
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Role</th>
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">Interests</th>
                      <th className="px-4 md:px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAllUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group text-xs">
                        <td className="px-4 md:px-4 md:px-8 py-4 md:py-4 md:py-6">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 font-black transition-all group-hover:scale-110 shrink-0">
                              {u.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 leading-none mb-1 truncate">{u.name}</p>
                              <Badge variant="outline" className="sm:hidden rounded-lg px-2 py-0 font-black text-[8px] uppercase tracking-widest border-none bg-slate-100 text-slate-700">
                                {u.role.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-4 md:px-8 py-4 md:py-6 hidden sm:table-cell">
                          <Badge variant="outline" className={`rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none ${
                            u.role === 'admin' ? 'bg-slate-900 text-white' :
                            u.role === 'brand_owner' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 md:px-4 md:px-8 py-4 md:py-6">
                          <div className="space-y-1">
                            <p className="text-[10px] md:text-xs font-bold text-slate-900">{u.phone}</p>
                            <p className="hidden md:block text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-4 md:px-4 md:px-8 py-4 md:py-6 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {u.interestedCategories?.length ? (
                              u.interestedCategories.slice(0, 2).map(cat => (
                                <span key={cat} className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase tracking-tight text-slate-500">{cat}</span>
                              ))
                            ) : (
                              <span className="text-[9px] font-black uppercase text-slate-300">Generic</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-8 py-4 md:py-6">
                           <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-slate-900">
                             <UserCircle className="h-5 w-5" />
                           </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <Store className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-900">Brands & Listings</h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <StatCard title="Total Listings" value={opportunities.length.toString()} icon={<Building2 className="h-5 w-5 text-blue-600" />} />
            <StatCard title="Verified Brands" value={opportunities.filter(o => o.is_verified).length.toString()} icon={<ShieldCheck className="h-5 w-5 text-green-600" />} />
            <StatCard title="Pending Review" value={opportunities.filter(o => !o.is_verified).length.toString()} icon={<Clock className="h-5 w-5 text-orange-600" />} />
          </div>

          <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <CardHeader className="p-4 md:p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    Brand Opportunities Management
                  </CardTitle>
                  <CardDescription className="font-medium">Verify and manage all brand listings on the platform</CardDescription>
                </div>
                <Button 
                  onClick={() => setIsListingModalOpen(true)}
                  className="bg-slate-900 border-none rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 gap-2"
                >
                  <Activity className="h-4 w-4" />
                  List New Brand
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="divide-y divide-slate-50">
                  {opportunities.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 font-medium">No opportunities found.</div>
                  ) : (
                    opportunities.map((opp) => (
                      <div key={opp.id} className="p-4 md:p-8 hover:bg-slate-50 transition-colors group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex items-start gap-6">
                            <div className="relative">
                              <img 
                                src={opp.image} 
                                alt={opp.brand_name} 
                                className="h-16 w-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              {opp.is_verified && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                  <ShieldCheck className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <p className="text-lg font-black text-slate-900">{opp.brand_name}</p>
                                {opp.status === 'verified' ? (
                                  <Badge className="bg-green-100 text-green-700 border-none rounded-lg px-2 py-0.5 font-black text-[10px] tracking-widest uppercase">
                                    VERIFIED
                                  </Badge>
                                ) : opp.status === 'submitted' ? (
                                  <Badge className="bg-blue-100 text-blue-700 border-none rounded-lg px-2 py-0.5 font-black text-[10px] tracking-widest uppercase animate-pulse">
                                    REVIEW REQUIRED
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-100 text-orange-700 border-none rounded-lg px-2 py-0.5 font-black text-[10px] tracking-widest uppercase">
                                    DRAFT / HANDOFF
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {opp.category} • {opp.type} • {opp.investment_range}
                              </p>

                              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-6">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-black uppercase text-slate-400">Response Rate</span>
                                  <div className="flex items-center gap-2">
                                     <span className="text-xs font-black text-orange-600">{opp.response_time_score || 'N/A'}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            {opp.status === 'submitted' && (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await api.patch(`/opportunities/${opp.id}`, { status: 'verified', is_verified: true });
                                    setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, status: 'verified', is_verified: true } : o));
                                    toast.success("Opportunity verified & live!");
                                  } catch (error) {
                                    toast.error("Failed to verify opportunity");
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 shadow-lg shadow-green-200"
                              >
                                Approve & Verify
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant={opp.is_verified ? "outline" : "default"}
                              onClick={() => handleToggleVerification(opp.id, opp.is_verified)}
                              className={`rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 ${opp.is_verified ? "border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 hover:bg-red-50" : "bg-slate-900 hover:bg-slate-800"}`}
                            >
                              {opp.is_verified ? "Revoke" : opp.status === 'submitted' ? "Reject" : "Force Verify"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-8">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-black text-slate-900">Lead Monitor</h3>
          </div>
          <Card className="border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <CardHeader className="p-4 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black">Lead & View Monitor</CardTitle>
                  <CardDescription>Track which investors are viewing or applying to brands</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Sort Leads By</span>
                    <Select value={leadSortOption} onValueChange={(v: any) => setLeadSortOption(v)}>
                      <SelectTrigger className="w-48 h-10 border-slate-200 rounded-xl font-bold text-xs bg-slate-50">
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dateApplied">Application Date</SelectItem>
                        <SelectItem value="lastUpdate">Last Update (Newest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                   <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">User / Lead</th>
                       <th className="px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Brand Target</th>
                       <th className="px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Type / Activity</th>
                       <th className="px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status & Source</th>
                       <th className="px-4 md:px-8 py-3 md:py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{leadSortOption === 'lastUpdate' ? 'Last Activity' : 'Application Date'}</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {sortedApplications.map((app) => (
                       <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <div>
                              <p className="font-black text-slate-900">{app.userName}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{app.userEmail}</p>
                            </div>
                         </td>
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <p className="font-black text-orange-600">{app.opportunityName}</p>
                         </td>
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <Badge className="bg-purple-100 text-purple-700 border-none rounded-lg px-2 py-0.5 font-black text-[10px] tracking-widest uppercase">
                               APPLICATION (DIRECT LEAD)
                            </Badge>
                         </td>
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <Badge className={`rounded-lg px-2 py-0.5 font-black text-[10px] tracking-widest uppercase border-none ${
                               getStatusColor(app.status)
                            }`}>
                               {app.status || 'NEW'}
                            </Badge>
                         </td>
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <span className="text-xs font-medium text-slate-500">
                              {new Date(leadSortOption === 'lastUpdate' ? (app.lastUpdate || app.dateApplied) : app.dateApplied).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </td>
                       </tr>
                     ))}
                     {filteredActivities.filter(a => a.type === 'view_details' || a.type === 'interested').map((act) => (
                       <tr key={act.id} className="hover:bg-slate-50/50 transition-colors bg-slate-50/20">
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <div>
                              <p className="font-black text-slate-900">{act.userName || 'Anonymous Visitor'}</p>
                              {act.userEmail && <p className="text-[10px] font-bold text-slate-400 uppercase">{act.userEmail}</p>}
                            </div>
                         </td>
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <p className="font-black text-blue-600">{act.opportunityName || 'A Brand'}</p>
                         </td>
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <Badge className={`rounded-lg px-2 py-0.5 font-black text-[10px] tracking-widest uppercase border-none ${
                               act.type === 'view_details' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                               {act.type === 'view_details' ? 'PAGE VIEWED' : 'INTEREST INDICATED'}
                            </Badge>
                         </td>
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Activity Log</span>
                         </td>
                         <td className="px-4 md:px-8 py-4 md:py-6">
                            <span className="text-xs font-medium text-slate-500">
                              {new Date(act.timestamp).toLocaleString()}
                            </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateOpportunityModal
        isOpen={isListingModalOpen}
        onClose={() => {
          setIsListingModalOpen(false);
          setEditingBrand(null);
        }}
        onSubmit={handleUpdateListing}
        initialData={editingBrand}
      />

      {/* Brand Review Panel */}
      {reviewingOpp && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between rounded-t-[2rem]">
              <div>
                <h3 className="text-xl font-black text-slate-900">Brand Review</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Review profile before approving to listing</p>
              </div>
              <button onClick={() => setReviewingOpp(null)} className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Listing Details */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Details</p>
                <div className="flex items-start gap-4">
                  <img src={reviewingOpp.logo || reviewingOpp.image} className="h-16 w-16 rounded-2xl object-cover border border-slate-100" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{reviewingOpp.brand_name}</h4>
                    <p className="text-xs text-slate-500 font-bold">{reviewingOpp.category} • {reviewingOpp.location}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-black px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 uppercase tracking-widest">{reviewingOpp.status}</span>
                      <span className="text-xs font-bold text-slate-500">{reviewingOpp.type}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{reviewingOpp.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Investment', value: reviewingOpp.investment_range || `₹${(reviewingOpp.minInvestment||0).toLocaleString()} – ₹${(reviewingOpp.maxInvestment||0).toLocaleString()}` },
                    { label: 'Space Req', value: reviewingOpp.space_req || 'N/A' },
                    { label: 'Listed On', value: new Date(reviewingOpp.createdAt || Date.now()).toLocaleDateString('en-IN') },
                  ].map(f => (
                    <div key={f.label} className="p-3 bg-slate-50 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="text-xs font-black text-slate-900">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Owner Profile */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Owner Profile</p>
                {reviewLoading ? (
                  <div className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                ) : reviewBrandOwner ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                        {reviewBrandOwner.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{reviewBrandOwner.name}</p>
                        <p className="text-xs text-slate-500">{reviewBrandOwner.email} • {reviewBrandOwner.phone || 'No phone'}</p>
                      </div>
                      {reviewBrandOwner.is_verified && (
                        <ShieldCheck className="h-5 w-5 text-green-500 ml-auto" />
                      )}
                    </div>
                    {reviewBrandOwner.bio && <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4 leading-relaxed">{reviewBrandOwner.bio}</p>}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'State', value: reviewBrandOwner.state || 'Not set' },
                        { label: 'District', value: reviewBrandOwner.district || 'Not set' },
                        { label: 'Role', value: reviewBrandOwner.role },
                        { label: 'Docs Submitted', value: reviewBrandOwner.verification_docs?.length ? `${reviewBrandOwner.verification_docs.length} document(s)` : 'None' },
                      ].map(f => (
                        <div key={f.label} className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                          <p className="text-xs font-black text-slate-900">{f.value}</p>
                        </div>
                      ))}
                    </div>
                    {reviewBrandOwner.verification_docs && reviewBrandOwner.verification_docs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</p>
                        {reviewBrandOwner.verification_docs.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-xs font-bold text-slate-900">{doc.type}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${doc.status === 'verified' ? 'bg-green-100 text-green-700' : doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{doc.status}</span>
                            </div>
                            {doc.url && <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => window.open(doc.url, '_blank')}><Eye className="h-3 w-3 mr-1" />View</Button>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No brand owner profile found for this listing.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button onClick={handleApproveFromReview} className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 rounded-2xl font-black text-xs uppercase tracking-widest">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Approve & Publish
                </Button>
                <Button onClick={handleRejectFromReview} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-12 rounded-2xl font-black text-xs uppercase tracking-widest">
                  Reject Listing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VerificationToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-2 py-1 rounded-md text-[9px] font-black tracking-tighter transition-all ${
        active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function getActivityColor(type: string) {
  switch (type) {
    case 'apply': return 'bg-green-100 text-green-700';
    case 'view_details': return 'bg-blue-100 text-blue-700';
    case 'shortlist': return 'bg-red-100 text-red-700';
    case 'search': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700';
    case 'reviewed': return 'bg-blue-100 text-blue-700';
    case 'pending': return 'bg-orange-100 text-orange-700';
    case 'agreement': return 'bg-purple-100 text-purple-700';
    case 'setup': return 'bg-indigo-100 text-indigo-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}
