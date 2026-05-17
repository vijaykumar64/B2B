import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Rocket, 
  Globe, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  MessageSquare, 
  UserCheck, 
  AlertCircle,
  Plus,
  LayoutDashboard,
  Settings,
  Search,
  Filter,
  Clock,
  Calendar
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { motion } from 'motion/react';
import { User, Application, Opportunity, UserActivity, AppNotification } from '../types';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { 
  Eye, 
  BarChart3, 
  FolderLock, 
  UserCircle, 
  PlusCircle,
  Camera,
  FileCheck,
  Handshake,
  UserPlus,
  Lock,
  Building2,
  Truck
} from 'lucide-react';
// import BrandOnboarding from './BrandOnboarding';
import CreateOpportunityModal from './CreateOpportunityModal';
import ManualLeadModal from './ManualLeadModal';
import MarketIntelligence from './MarketIntelligence';
import { calculateInterestScore, getInterestLevel, getInterestColor } from '../lib/utils/scoring';
import { createNotification } from '../lib/notifications';

interface ExpansionSectionProps {
  onCallRequest: () => void;
  user: User | null;
}

export default function ExpansionSection({ onCallRequest, user }: ExpansionSectionProps) {
  const [activeView, setActiveView] = useState<'marketing' | 'dashboard'>('marketing');
  const [brandApplications, setBrandApplications] = useState<Application[]>([]);
  const [brandOpportunities, setBrandOpportunities] = useState<Opportunity[]>([]);
  const [brandActivities, setBrandActivities] = useState<UserActivity[]>([]);
  const [reminders, setReminders] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isManualLeadModalOpen, setIsManualLeadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.role === 'brand_owner' && user.id && !user.isDemo) {
      setActiveView('dashboard');

      const fetchData = async () => {
        try {
          const [appsData, oppsData, activitiesData, notifsData] = await Promise.all([
            api.get('/applications'),
            api.get('/opportunities'),
            api.get('/activities').catch(() => ({ activities: [] })),
            api.get('/notifications'),
          ]);
          setBrandApplications(appsData.applications || appsData || []);
          setBrandOpportunities(oppsData.opportunities || oppsData || []);
          setBrandActivities(activitiesData.activities || []);
          const allNotifs = notifsData.notifications || notifsData || [];
          setReminders(allNotifs.filter((n: AppNotification) => n.type === 'reminder'));
        } catch (_) {}
      };

      fetchData();

      const hasCompletedOnboarding = localStorage.getItem(`onboarding_${user.id}`);
      if (!hasCompletedOnboarding) setShowOnboarding(true);

      const socket = getSocket();
      socket.on('applications:sync', fetchData);
      socket.on('opportunities:sync', fetchData);

      return () => {
        socket.off('applications:sync', fetchData);
        socket.off('opportunities:sync', fetchData);
      };
    }
  }, [user?.id, user?.role, user?.isDemo]);

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'true');
      setShowOnboarding(false);
      toast.success("Welcome to your Brand Dashboard!");
    }
  };

  const handleCreateListing = async (data: any) => {
    try {
      await api.post('/opportunities', {
        ...data,
        owner_uid: user?.id,
        is_verified: false,
        createdAt: new Date().toISOString()
      });
      toast.success("New listing published successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create listing");
    }
  };

  const handleUpdateLead = async (id: string, updates: any) => {
    try {
      if (updates.followUp) {
        const appData = brandApplications.find(a => a.id === id);
        if (appData) {
          const currentFollowUps = appData.followUps || [];
          const newFollowUp = {
            date: new Date().toISOString(),
            note: updates.followUp,
            reminderDate: updates.reminderDate,
            createdBy: 'brand' as const
          };
          await api.patch(`/applications/${id}`, {
            followUps: [...currentFollowUps, newFollowUp],
            lastUpdate: new Date().toISOString()
          });

          if (updates.reminderDate) {
            await createNotification({
              userId: user?.id || '',
              title: `Reminder: Follow up with ${appData.userName}`,
              message: `Scheduled follow-up for ${appData.opportunityName}: ${updates.followUp}`,
              type: 'reminder',
              timestamp: updates.reminderDate,
              actionRequired: true,
              link: 'leads'
            });
            if (appData.userId) {
              await createNotification({
                userId: appData.userId,
                title: 'Follow-up Scheduled',
                message: `The brand owner of ${appData.opportunityName} has scheduled a follow-up with you on ${new Date(updates.reminderDate).toLocaleDateString()}.`,
                type: 'update',
                link: 'status'
              });
            }
          }
        }
      } else {
        await api.patch(`/applications/${id}`, { ...updates, lastUpdate: new Date().toISOString() });
      }

      toast.success("Lead updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update lead");
    }
  };

  if (activeView === 'dashboard') {
    return (
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">Brand Dashboard</h2>
            <p className="text-slate-500 mt-1">Manage your brand opportunities and lead network across Bharat</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              className="rounded-xl font-bold border-slate-200 hover:bg-slate-50"
              onClick={() => setIsManualLeadModalOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Manual Lead
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 rounded-xl font-bold shadow-lg shadow-orange-200"
              onClick={() => setIsListingModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Listing
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl border border-slate-100">
              <Settings className="h-5 w-5 text-slate-400" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Leads" value={brandApplications.length.toString()} icon={<Users className="h-5 w-5 text-blue-600" />} />
          <StatCard title="Detail Views" value={brandActivities.filter(a => a.type === 'view_details').length.toString()} icon={<Eye className="h-5 w-5 text-orange-600" />} />
          <StatCard title="Agreements" value={brandApplications.filter(a => a.status === 'agreement').length.toString()} icon={<Handshake className="h-5 w-5 text-green-600" />} />
          <StatCard title="Live Units" value={brandApplications.filter(a => a.status === 'completed').length.toString()} icon={<CheckCircle2 className="h-5 w-5 text-purple-600" />} />
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="leads" className="w-full">
              <TabsList className="mb-8 flex-wrap h-auto gap-2 bg-slate-50 p-1.5 rounded-[1.25rem] border border-slate-100">
                {[
                  { value: 'leads', label: 'Leads', icon: LayoutDashboard },
                  { value: 'views', label: 'Views', icon: Eye },
                  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { value: 'intelligence', label: 'Market AI', icon: Globe },
                  { value: 'vault', label: 'Vault', icon: FolderLock },
                  { value: 'completed', label: 'Live', icon: Building2 }
                ].map(tab => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
                  >
                    <tab.icon className="h-3.5 w-3.5 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="leads" className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input 
                      placeholder="Search by name, email or brand..." 
                      className="pl-10 h-11 bg-slate-50 border-none rounded-xl font-medium focus:ring-orange-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] h-11 bg-slate-50 border-none rounded-xl font-bold text-[10px] uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5" />
                        <SelectValue placeholder="All Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">New Leads</SelectItem>
                      <SelectItem value="reviewed">Shortlisted</SelectItem>
                      <SelectItem value="agreement">Legal/LOI</SelectItem>
                      <SelectItem value="setup">Setup Phase</SelectItem>
                      <SelectItem value="completed">Live / Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold">Loading leads...</p>
                  </div>
                ) : brandApplications.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No leads yet</h3>
                    <p className="text-slate-500">Your listings are live. Leads will appear here soon.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {brandApplications
                      .filter(app => {
                        const matchesSearch = 
                          app.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.opportunityName?.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map(app => (
                      <Card key={app.id} className="overflow-hidden border-slate-200 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
                        <CardHeader className="p-6 bg-slate-50/50 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-700 font-black text-lg">
                                {app.userName?.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg font-black">{app.userName}</CardTitle>
                                  {(() => {
                                    const score = calculateInterestScore(app.userId, app.opportunityId, brandActivities);
                                    return (
                                      <Badge 
                                        variant="outline" 
                                        className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md border-none ${getInterestColor(score)}`}
                                      >
                                        {getInterestLevel(score)} SCORE
                                      </Badge>
                                    );
                                  })()}
                                </div>
                                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                  {app.userEmail} • {app.userPhone}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={`${getStatusColor(app.status)} px-3 py-1 rounded-lg font-bold text-[10px] tracking-widest uppercase`}>
                                {app.status}
                              </Badge>
                              <span className="text-[10px] font-bold text-slate-300">Applying for {app.opportunityName}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                          {/* Workflow Steps Indicator */}
                          <div className="flex items-center justify-between px-4">
                            {[
                              { id: 'pending', label: 'Lead', icon: Users },
                              { id: 'reviewed', label: 'Review', icon: FileCheck },
                              { id: 'agreement', label: 'Legal', icon: Handshake },
                              { id: 'setup', label: 'Setup', icon: Camera },
                              { id: 'completed', label: 'Live', icon: CheckCircle2 }
                            ].map((step, idx) => {
                              const isActive = app.status === step.id;
                              const isPast = ['pending', 'reviewed', 'agreement', 'setup', 'completed'].indexOf(app.status) > idx;
                              return (
                                <div key={step.id} className="flex flex-col items-center gap-2 relative">
                                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                                    isActive ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200 scale-110' : 
                                    isPast ? 'bg-green-500 border-green-500 text-white' : 
                                    'bg-white border-slate-100 text-slate-300'
                                  }`}>
                                    <step.icon className="h-5 w-5" />
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>{step.label}</span>
                                  {idx < 4 && (
                                    <div className={`absolute left-12 top-5 h-[2px] w-8 sm:w-16 lg:w-24 ${isPast ? 'bg-green-500' : 'bg-slate-100'}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {app.responses && app.responses.length > 0 && (
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                              <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-4">Investor Profile</p>
                              <div className="grid gap-6 sm:grid-cols-2">
                                {app.responses.map((r, idx) => (
                                  <div key={idx} className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.question}</p>
                                    <p className="text-sm font-bold text-slate-900">{r.answer}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:p-8 text-sm">
                            <div className="space-y-4">
                              <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Documents</p>
                              <div className="space-y-2">
                                {app.documents?.map(doc => (
                                  <div key={doc.name} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <span className="font-bold text-slate-700">{doc.name}</span>
                                    <div className="flex gap-1">
                                      <button 
                                        onClick={() => handleUpdateLead(app.id, { documentUpdate: { name: doc.name, status: 'verified' } })}
                                        className={`p-1.5 rounded-lg transition-colors ${doc.status === 'verified' ? 'text-green-600 bg-green-50' : 'text-slate-300 hover:text-green-600 hover:bg-green-50'}`}
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateLead(app.id, { documentUpdate: { name: doc.name, status: 'rejected' } })}
                                        className={`p-1.5 rounded-lg transition-colors ${doc.status === 'rejected' ? 'text-red-600 bg-red-50' : 'text-slate-300 hover:text-red-600 hover:bg-red-50'}`}
                                      >
                                        <AlertCircle className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Follow-ups</p>
                              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {app.followUps?.map((f, i) => (
                                  <div key={i} className="text-xs bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                    <p className="font-black text-blue-800 mb-1 uppercase tracking-widest text-[9px]">{new Date(f.date).toLocaleDateString()}</p>
                                    <p className="text-blue-700 font-medium">{f.note}</p>
                                  </div>
                                ))}
                                  <FollowUpForm onAdd={(note, reminderDate) => handleUpdateLead(app.id, { followUp: note, reminderDate })} />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-0 flex justify-end gap-3 border-t border-slate-50 mt-4">
                          {app.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="sm" className="rounded-xl font-bold text-slate-500" onClick={() => handleUpdateLead(app.id, { status: 'rejected' })}>Reject</Button>
                              <Button size="sm" className="bg-orange-600 rounded-xl font-bold px-6" onClick={() => handleUpdateLead(app.id, { status: 'reviewed' })}>Accept Lead</Button>
                            </>
                          )}
                          {app.status === 'reviewed' && (
                            <>
                              <Button variant="ghost" size="sm" className="rounded-xl font-bold text-slate-500" onClick={() => handleUpdateLead(app.id, { status: 'rejected' })}>Reject Brand</Button>
                              <Button size="sm" className="bg-blue-600 rounded-xl font-bold px-6" onClick={() => handleUpdateLead(app.id, { status: 'agreement' })}>Move to Legal</Button>
                            </>
                          )}
                          {app.status === 'agreement' && (
                            <Button size="sm" className="bg-green-600 rounded-xl font-bold px-6" onClick={() => handleUpdateLead(app.id, { status: 'setup' })}>Finalize Agreement</Button>
                          )}
                          {app.status === 'setup' && (
                            <Button size="sm" className="bg-purple-600 gap-2 rounded-xl font-bold px-6" onClick={() => {
                              const photo = prompt("Enter setup photo URL:");
                              if (photo) handleUpdateLead(app.id, { status: 'completed', setupPhoto: photo });
                            }}>
                              <Camera className="h-4 w-4" />
                              Upload Setup Photo
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-8">
                <div className="grid gap-4 md:p-8 sm:grid-cols-2">
                  {brandApplications.filter(a => a.status === 'completed').length === 0 ? (
                    <div className="col-span-2 py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                      <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-900">No live opportunities yet</h3>
                      <p className="text-slate-500">Complete the setup process for your leads to see them here.</p>
                    </div>
                  ) : (
                    brandApplications.filter(a => a.status === 'completed').map(app => (
                      <Card key={app.id} className="overflow-hidden rounded-[2rem] border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="aspect-video relative bg-slate-100 overflow-hidden">
                          {app.setupPhoto ? (
                            <img src={app.setupPhoto} alt="Setup" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-300">
                              <Camera className="h-12 w-12" />
                            </div>
                          )}
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-green-600 text-white border-none px-3 py-1 rounded-lg font-black text-[10px] tracking-widest">LIVE</Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h4 className="font-black text-slate-900 text-lg">{app.userName}</h4>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {app.opportunityName} • {new Date(app.lastUpdate).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="views">
                <Card className="rounded-[2rem] border-slate-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 md:p-8 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Views</p>
                        <p className="text-4xl font-black text-slate-900">{brandActivities.filter(a => a.type === 'view_details').length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg. Engagement</p>
                        <p className="text-4xl font-black text-slate-900">
                          {(() => {
                            const durations = brandActivities.filter(a => a.duration).map(a => a.duration!);
                            if (durations.length === 0) return '0s';
                            const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
                            return `${Math.round(avg)}s`;
                          })()}
                        </p>
                      </div>
                    </div>
                    <ScrollArea className="h-[500px]">
                      <div className="divide-y divide-slate-50">
                        {brandActivities.filter(a => a.type === 'view_details').length === 0 ? (
                          <div className="py-20 text-center text-slate-400 font-bold">No views recorded yet.</div>
                        ) : (
                          brandActivities
                            .filter(a => a.type === 'view_details')
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((activity) => {
                              const isInterested = brandActivities.some(ba => ba.userId === activity.userId && (ba.type === 'interested' || ba.type === 'apply'));
                              
                              return (
                                <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm">
                                      {isInterested ? activity.userName?.charAt(0) : '?'}
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                                        {isInterested ? activity.userName : 'Anonymous Lead'}
                                        {(() => {
                                          const score = calculateInterestScore(activity.userId, activity.opportunityId!, brandActivities);
                                          return (
                                            <Badge variant="secondary" className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md ${getInterestColor(score)}`}>
                                              {getInterestLevel(score)}
                                            </Badge>
                                          );
                                        })()}
                                      </p>
                                      <p className="text-xs font-bold text-slate-400 mt-0.5">
                                        {isInterested ? (
                                          <>
                                            {activity.userEmail} • {activity.userPhone || 'No Phone'}
                                          </>
                                        ) : (
                                          <span className="italic opacity-60">Details locked until investor marks interest</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(activity.timestamp).toLocaleDateString()}</p>
                                    <p className="text-[10px] font-bold text-slate-300 mt-1">
                                      {activity.duration ? `Spent ${activity.duration}s` : new Date(activity.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8">
                <div className="grid gap-4 md:p-8 sm:grid-cols-2">
                  <Card className="p-4 md:p-8 rounded-[2rem] border-slate-200">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Interest by Region</h4>
                    <div className="space-y-6">
                      {[
                        { region: 'Maharashtra', count: 45, color: 'bg-orange-500' },
                        { region: 'Gujarat', count: 32, color: 'bg-blue-500' },
                        { region: 'Karnataka', count: 28, color: 'bg-green-500' },
                        { region: 'Punjab', count: 15, color: 'bg-purple-500' }
                      ].map(r => (
                        <div key={r.region} className="space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                            <span className="text-slate-600">{r.region}</span>
                            <span className="text-slate-900">{r.count}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${r.count}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full ${r.color} rounded-full`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-4 md:p-8 rounded-[2rem] border-slate-200 flex flex-col items-center justify-center text-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Lead Quality Index</h4>
                    <div className="relative h-40 w-40 mb-6">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
                        <motion.circle 
                          cx="18" cy="18" r="16" fill="none" 
                          className="stroke-orange-500" 
                          strokeWidth="3" 
                          strokeDasharray="100"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 25 }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900">75%</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium max-w-[200px]">
                      Your leads show a high conversion potential for Tier 2 markets.
                    </p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="intelligence">
                <MarketIntelligence />
              </TabsContent>

              <TabsContent value="vault" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { name: 'Partnership Agreement Template', size: '1.2 MB', date: '2026-04-01' },
                    { name: 'Brand Operational Manual', size: '4.5 MB', date: '2026-03-15' },
                    { name: 'Marketing Assets Pack', size: '128 MB', date: '2026-04-10' },
                    { name: 'Legal Disclaimers', size: '450 KB', date: '2026-04-12' }
                  ].map(doc => (
                    <Card key={doc.name} className="p-4 flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                          <p className="text-[10px] text-slate-500">{doc.size} • Updated {doc.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <PlusCircle className="h-4 w-4 text-slate-400" />
                      </Button>
                    </Card>
                  ))}
                </div>
                <Button className="w-full border-dashed border-2 bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload New Document
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-900">
              <Clock className="h-6 w-6 text-orange-600" />
              Upcoming Reminders
            </h3>
            <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
              <ScrollArea className="h-[280px]">
                <CardContent className="p-4 space-y-3">
                  {reminders.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                        <Calendar className="h-6 w-6 text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No reminders set</p>
                    </div>
                  ) : (
                    reminders.map(reminder => (
                      <div key={reminder.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-orange-200 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-slate-900 leading-tight line-clamp-2">{reminder.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{reminder.message}</p>
                          </div>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white border-slate-200 shrink-0">
                            {new Date(reminder.timestamp || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </ScrollArea>
              {reminders.length > 0 && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                    {reminders.length} Scheduled Follow-ups
                  </p>
                </div>
              )}
            </Card>

            <h3 className="text-xl font-black flex items-center gap-3 text-slate-900">
              <UserCircle className="h-6 w-6 text-orange-600" />
              Brand Profile
            </h3>
            <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
              <CardContent className="p-4 md:p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-300 border border-slate-100 shadow-inner">
                    LOGO
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">{user?.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Retail & Food Services</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Company Description</Label>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">Leading retail brand focused on bringing premium experiences to Tier 2 & 3 markets across India.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Founded</Label>
                      <p className="text-sm font-black text-slate-900">2018</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Headquarters</Label>
                      <p className="text-sm font-black text-slate-900">Bangalore, IN</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl font-bold border-slate-200">Edit Profile</Button>
              </CardContent>
            </Card>

            <h3 className="text-xl font-black flex items-center gap-3 text-slate-900">
              <Settings className="h-6 w-6 text-orange-600" />
              Your Offerings
            </h3>
            <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
              <CardContent className="p-6 space-y-4">
                {[
                  { title: 'Standard Model', sub: 'Active in 12 cities', icon: Building2, color: 'text-blue-600', active: true },
                  { title: 'Express Model', sub: 'Active in 4 states', icon: Globe, color: 'text-green-600', active: true },
                  { title: 'Rural Expansion', sub: 'Active in 2 zones', icon: Truck, color: 'text-orange-600', active: true },
                  { title: 'Master Partner', sub: 'Currently disabled', icon: Users, color: 'text-purple-600', active: false }
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border border-slate-50 ${item.active ? 'bg-slate-50/50' : 'bg-slate-50 opacity-40'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-900">{item.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                    <div className={`h-6 w-10 rounded-full relative transition-colors ${item.active ? 'bg-green-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-slate-900 rounded-xl font-bold mt-4">Update Offerings</Button>
              </CardContent>
            </Card>

            <Card className="bg-orange-600 border-none rounded-[2rem] shadow-lg shadow-orange-100 text-white overflow-hidden relative">
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-xs font-black uppercase tracking-widest opacity-80">Expansion Tip</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm font-bold leading-relaxed">
                  Brands offering multiple operational models see 40% faster growth in Tier 3 markets. 
                </p>
                <Button variant="link" className="text-white p-0 h-auto font-black text-[10px] uppercase tracking-widest mt-4 hover:no-underline opacity-80 hover:opacity-100">
                  Read Strategy Guide <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* <BrandOnboarding 
          isOpen={showOnboarding} 
          onClose={() => setShowOnboarding(false)} 
          onComplete={handleOnboardingComplete} 
        /> */}

        <CreateOpportunityModal 
          isOpen={isListingModalOpen}
          onClose={() => setIsListingModalOpen(false)}
          onSubmit={handleCreateListing}
        />

        <ManualLeadModal 
          isOpen={isManualLeadModalOpen}
          onClose={() => setIsManualLeadModalOpen(false)}
          opportunities={brandOpportunities}
          onSubmit={async (data) => {
            try {
              const selectedOpp = brandOpportunities.find(o => o.id === data.opportunityId);
              await api.post('/applications', {
                ...data,
                userId: 'manual-lead',
                isManualEntry: true,
                brandOwnerId: user?.id,
                opportunityName: selectedOpp?.brand_name || 'Direct Inquiry',
                status: 'pending',
                dateApplied: new Date().toISOString(),
                lastUpdate: new Date().toISOString()
              });
              toast.success("Manual lead added successfully!");
            } catch (error) {
              toast.error("Failed to add lead");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Scale Your Brand Across India
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          We help medium-sized businesses transform into national chains. 
          Leverage our network in Tier 2 & 3 cities to expand rapidly and securely.
        </p>
      </div>

      <div className="grid gap-4 md:p-8 md:grid-cols-3">
        <ExpansionCard 
          icon={<Rocket className="h-6 w-6 text-orange-600" />}
          title="Brand Modeling"
          description="We design your business model, operational manuals, and store formats tailored for Indian markets."
        />
        <ExpansionCard 
          icon={<Users className="h-6 w-6 text-blue-600" />}
          title="Partner Sourcing"
          description="Access our database of 50,000+ verified potential partners specifically looking for Tier 2 & 3 opportunities."
        />
        <ExpansionCard 
          icon={<ShieldCheck className="h-6 w-6 text-green-600" />}
          title="Legal Framework"
          description="Complete legal support for partnership agreements, brand protection, and regulatory compliance in India."
        />
      </div>

      <div className="py-12 bg-slate-50 rounded-3xl px-4 md:px-8 border border-slate-100">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-slate-900">Why Brands Choose Us Only</h3>
          <p className="text-slate-600 mt-2">The most comprehensive expansion ecosystem in Bharat</p>
        </div>
        <div className="grid gap-4 md:p-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Globe className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900">Tier 2/3 Specialist</h4>
            <p className="text-sm text-slate-600 leading-relaxed">We don't just focus on metros. Our strength lies in deep-rooted networks across 500+ small towns in India.</p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900">Verified Leads Only</h4>
            <p className="text-sm text-slate-600 leading-relaxed">Every investor is pre-screened for financial capacity and business background before they reach your dashboard.</p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900">Real-time Dashboard</h4>
            <p className="text-sm text-slate-600 leading-relaxed">Manage your entire expansion pipeline, track document verification, and follow up with leads in one professional interface.</p>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900">Zero Listing Fee</h4>
            <p className="text-sm text-slate-600 leading-relaxed">Expand your presence without upfront capital. We believe in your brand’s potential and offer 100% free professional listings.</p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-none bg-slate-900 text-white shadow-2xl">
        <div className="grid md:grid-cols-2">
          <div className="p-4 md:p-8 md:p-12">
            <Badge className="bg-orange-600 text-white mb-4">New Feature</Badge>
            <h3 className="text-2xl font-bold mb-4">Ready to scale?</h3>
            <p className="text-slate-300 mb-8">
              Our "Scale-Up" program is designed for businesses with 2-5 successful outlets 
              looking to reach 50+ locations in 24 months.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
                <span>Market feasibility study for 100+ cities</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
                <span>End-to-end investor management</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
                <span>Supply chain optimization for Tier 3</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 p-4 md:p-8 md:p-12 flex flex-col justify-center">
            <h4 className="text-xl font-bold mb-6">Get a Free Expansion Audit</h4>
            <div className="space-y-4">
              <Input className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" placeholder="Business Name" />
              <Input className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" placeholder="Current Outlets" />
              <Input className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" placeholder="Contact Number" />
              <Button 
                onClick={onCallRequest}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Request Audit & Call
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ExpansionCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-slate-100 hover:border-orange-200 transition-colors">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-slate-600">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function FollowUpForm({ onAdd }: { onAdd: (note: string, reminderDate?: string) => void }) {
  const [note, setNote] = useState('');
  const [reminderDays, setReminderDays] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    let reminderDate: string | undefined;
    if (reminderDays !== '0') {
      const date = new Date();
      date.setDate(date.getDate() + parseInt(reminderDays));
      reminderDate = date.toISOString();
    }
    
    onAdd(note, reminderDate);
    setNote('');
    setReminderDays('0');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <Input 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add follow-up note..." 
          className="h-10 text-xs rounded-xl pr-10 border-slate-200 focus:ring-orange-500"
        />
        <button type="submit" className="absolute right-3 top-2.5 text-slate-300 hover:text-orange-600 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-slate-400" />
        <Select value={reminderDays} onValueChange={setReminderDays}>
          <SelectTrigger className="h-7 text-[9px] font-black uppercase tracking-widest border-none bg-slate-50 rounded-lg w-auto min-w-[120px]">
            <SelectValue placeholder="No Reminder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0" className="text-[10px] font-bold">No Reminder</SelectItem>
            <SelectItem value="1" className="text-[10px] font-bold">Reminder: 1 Day</SelectItem>
            <SelectItem value="3" className="text-[10px] font-bold">Reminder: 3 Days</SelectItem>
            <SelectItem value="7" className="text-[10px] font-bold">Reminder: 1 Week</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-orange-100 transition-all group">
      <CardContent className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
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


