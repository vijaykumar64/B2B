import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Phone, Mail, TrendingUp, Plus, Edit2,
  Clock, CheckCircle2, XCircle, ArrowRight, Sparkles,
  ShieldCheck, MapPin, CircleDollarSign, HelpCircle,
  MessageSquare, RefreshCw, Eye, ChevronDown, ChevronUp,
  User as UserIcon, BarChart2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { toast } from 'sonner';
import type { User, Opportunity, Application, CallbackRequest } from '../types';
import CreateOpportunityModal from './CreateOpportunityModal';

interface BrandOwnerPanelProps {
  user: User;
  opportunities: Opportunity[];
  activeTab?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'New Lead',  color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  viewed:   { label: 'Viewed',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  reviewed: { label: 'Reviewed',  color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  agreement:{ label: 'Agreement', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  setup:    { label: 'Setup',     color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  completed:{ label: 'Converted', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { label: 'Rejected',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

function StatCard({ title, value, icon, sub }: { title: string; value: string; icon: React.ReactNode; sub?: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrandOwnerPanel({ user, opportunities, activeTab = 'brand-opportunities' }: BrandOwnerPanelProps) {
  const [leads, setLeads] = useState<Application[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Opportunity | null>(null);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [investorProfiles, setInvestorProfiles] = useState<Record<string, any>>({});

  const myBrands = opportunities.filter(
    o => o.owner_uid === user.id || o.owner_uid === 'demo-brand-1' || o.owner_uid === 'dev-admin-id'
  );

  useEffect(() => {
    if (user.isDemo) { setLoading(false); return; }
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [leadsData, cbData] = await Promise.all([
          api.get('/applications').catch(() => ({ applications: [] })),
          api.get('/callbacks').catch(() => ({ callbacks: [] })),
        ]);
        setLeads(leadsData.applications || leadsData || []);
        setCallbacks(cbData.callbacks || cbData || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user.id, user.isDemo]);

  const filteredLeads = leads.filter(l =>
    leadFilter === 'all' ? true : l.status === leadFilter
  );

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await api.patch(`/applications/${leadId}`, { status, lastUpdate: new Date().toISOString() });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: status as any } : l));
      toast.success('Lead status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleCallbackDone = async (id: string) => {
    try {
      await api.patch(`/callbacks/${id}`, { status: 'completed', completedAt: new Date().toISOString() });
      setCallbacks(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' as any } : c));
      toast.success('Callback marked as done');
    } catch { toast.error('Failed to update'); }
  };

  const handleSaveBrand = async (data: any) => {
    if (!editingBrand) {
      try {
        await api.post('/opportunities', { ...data, owner_uid: user.id, status: 'pending' });
        toast.success('Listing submitted for review!');
      } catch (e: any) { toast.error(e.message || 'Failed to create listing'); }
    } else {
      try {
        await api.patch(`/opportunities/${editingBrand.id}`, data);
        toast.success('Listing updated!');
      } catch (e: any) { toast.error(e.message || 'Failed to update'); }
    }
  };

  const pendingCallbacks = callbacks.filter(c => c.status === 'pending');
  const conversionRate = leads.length > 0
    ? Math.round((leads.filter(l => l.status === 'completed').length / leads.length) * 100)
    : 0;

  const handleExpandLead = async (lead: Application) => {
    if (expandedLeadId === lead.id) { setExpandedLeadId(null); return; }
    setExpandedLeadId(lead.id);
    if (lead.userId && !investorProfiles[lead.userId]) {
      try {
        const data = await api.get(`/users/${lead.userId}`);
        if (data?.user) setInvestorProfiles(prev => ({ ...prev, [lead.userId]: data.user }));
      } catch (_) {}
    }
  };

  const getLeadsTrend = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      leads: leads.filter(l => l.dateApplied?.startsWith(date)).length,
    }));
  };

  const getStatusBreakdown = () =>
    ['pending', 'reviewed', 'agreement', 'completed', 'rejected']
      .map(s => ({ name: STATUS_CONFIG[s]?.label || s, value: leads.filter(l => l.status === s).length }))
      .filter(s => s.value > 0);

  const PIE_COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444'];
  const trendData = getLeadsTrend();
  const statusData = getStatusBreakdown();

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Welcome back, {user.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {myBrands.length > 0
              ? `Managing ${myBrands.length} listing${myBrands.length > 1 ? 's' : ''}`
              : 'Start by listing your first brand opportunity'}
          </p>
        </div>
        {!user.is_verified && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-400 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Verification pending — upload documents to get verified badge
          </div>
        )}
        {user.is_verified && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Verified Brand
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Listings" value={myBrands.length.toString()} icon={<Building2 className="h-5 w-5" />} sub="Active opportunities" />
        <StatCard title="Total Leads" value={leads.length.toString()} icon={<Users className="h-5 w-5" />} sub="Investor inquiries" />
        <StatCard title="Callbacks Pending" value={pendingCallbacks.length.toString()} icon={<Phone className="h-5 w-5" />} sub="Need follow-up" />
        <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={<TrendingUp className="h-5 w-5" />} sub="Leads converted" />
      </div>

      {/* Analytics Charts */}
      {leads.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-4 w-4 text-primary" />
                <p className="text-xs font-black text-foreground uppercase tracking-widest">Leads — Last 7 Days</p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={trendData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="brandLeadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="leads" stroke="#f97316" fill="url(#brandLeadGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-xs font-black text-foreground uppercase tracking-widest">Lead Status Breakdown</p>
              </div>
              {statusData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="60%" height={140}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={0}>
                        {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {statusData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-[10px] font-bold text-muted-foreground flex-1">{item.name}</span>
                        <span className="text-[10px] font-black text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">No lead data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── My Listings Tab ── */}
      {activeTab === 'brand-opportunities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-foreground">My Brand Listings</h2>
              <p className="text-sm text-muted-foreground">Your opportunities visible to investors</p>
            </div>
            <Button
              onClick={() => { setEditingBrand(null); setIsListingModalOpen(true); }}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </Button>
          </div>

          {myBrands.length === 0 ? (
            <Card className="border-dashed border-2 border-border bg-muted/20">
              <CardContent className="py-16 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-lg">No listings yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    List your brand opportunity and get discovered by thousands of verified investors across India.
                  </p>
                </div>
                <Button
                  onClick={() => { setEditingBrand(null); setIsListingModalOpen(true); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List Your Brand
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {myBrands.map(brand => (
                <Card key={brand.id} className="bg-card border-border overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="relative h-36 overflow-hidden bg-muted">
                    {brand.image && (
                      <img
                        src={brand.image}
                        alt={brand.brand_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-card p-1 shadow-md">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.brand_name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <Building2 className="h-full w-full text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-white font-black text-sm drop-shadow-md">{brand.brand_name}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-1 rounded-full',
                        brand.status === 'published'
                          ? 'bg-green-500/90 text-white'
                          : brand.status === 'pending'
                            ? 'bg-yellow-500/90 text-white'
                            : 'bg-muted/90 text-foreground'
                      )}>
                        {brand.status === 'published' ? 'Live' : brand.status === 'pending' ? 'Under Review' : brand.status}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{brand.location || '—'}</span>
                      <span className="flex items-center gap-1"><CircleDollarSign className="h-3 w-3" />
                        ₹{((brand.minInvestment || 0) / 100000).toFixed(0)}L – {((brand.maxInvestment || 0) / 100000).toFixed(0)}L
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{brand.description || 'No description added yet.'}</p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingBrand(brand); setIsListingModalOpen(true); }}
                        className="flex-1 rounded-lg border-border text-xs font-semibold"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" />Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-lg border-border text-xs font-semibold"
                        onClick={() => toast.info('Investor preview coming soon')}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Leads Tab ── */}
      {activeTab === 'brand-leads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-foreground">Investor Leads</h2>
              <p className="text-sm text-muted-foreground">People interested in your brand</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'pending', 'reviewed', 'completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setLeadFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    leadFilter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label}
                  {f === 'all' && leads.length > 0 && (
                    <span className="ml-1.5 bg-primary-foreground/20 text-primary-foreground rounded-full px-1.5 py-0.5 text-[9px] font-black">
                      {leads.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pending callbacks alert */}
          {pendingCallbacks.length > 0 && (
            <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black text-green-700 dark:text-green-400 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {pendingCallbacks.length} Callback{pendingCallbacks.length > 1 ? 's' : ''} Requested
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {pendingCallbacks.map(cb => (
                  <div key={cb.id} className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
                    <div>
                      <p className="font-bold text-sm text-foreground">{cb.userName}</p>
                      <p className="text-xs text-muted-foreground">{cb.userPhone || cb.userEmail} · {cb.brandName}</p>
                    </div>
                    <div className="flex gap-2">
                      {cb.userPhone && (
                        <a href={`tel:${cb.userPhone}`}>
                          <Button size="sm" className="h-8 px-3 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold">
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCallbackDone(cb.id)}
                        className="h-8 px-3 rounded-lg text-xs font-bold border-border"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground">No leads yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {myBrands.length === 0
                    ? 'Add a listing first to start receiving investor inquiries'
                    : 'Your listing is live — investor inquiries will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map(lead => {
                const statusCfg = STATUS_CONFIG[lead.status] ?? { label: lead.status, color: 'bg-muted text-foreground' };
                const location = [
                  lead.responses?.find(r => r.questionId === 'district')?.answer,
                  lead.responses?.find(r => r.questionId === 'state')?.answer,
                ].filter(Boolean).join(', ');
                const investment = lead.responses?.find(r => r.questionId === 'investment')?.answer;

                return (
                  <Card key={lead.id} className="bg-card border-border hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm flex-shrink-0">
                          {(lead.userName || 'U').charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-foreground text-sm">{lead.userName || 'Anonymous'}</p>
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', statusCfg.color)}>
                              {statusCfg.label}
                            </span>
                            {lead.isManualEntry && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Manual</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                            {lead.opportunityName && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.opportunityName}</span>}
                            {location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>}
                            {investment && <span className="flex items-center gap-1"><CircleDollarSign className="h-3 w-3" />{investment}</span>}
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(lead.dateApplied).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                          {lead.userPhone && (
                            <a href={`tel:${lead.userPhone}`}>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-border" title={`Call ${lead.userName}`}>
                                <Phone className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                            </a>
                          )}
                          {lead.userEmail && (
                            <a href={`mailto:${lead.userEmail}`}>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg border-border" title={`Email ${lead.userName}`}>
                                <Mail className="h-3.5 w-3.5 text-blue-600" />
                              </Button>
                            </a>
                          )}
                          {lead.status === 'pending' && (
                            <Button size="sm" onClick={() => handleUpdateStatus(lead.id, 'reviewed')} className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold">
                              Review
                            </Button>
                          )}
                          {lead.status === 'reviewed' && (
                            <Button size="sm" onClick={() => handleUpdateStatus(lead.id, 'agreement')} className="h-8 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold">
                              Agreement
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleExpandLead(lead)} className="h-8 w-8 p-0 rounded-lg text-muted-foreground">
                            {expandedLeadId === lead.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Investor Profile */}
                      {expandedLeadId === lead.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <UserIcon className="h-3 w-3" /> Investor Profile
                          </p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {[
                              { label: 'Email', value: lead.userEmail },
                              { label: 'Phone', value: lead.userPhone },
                              { label: 'Location', value: location || '—' },
                              { label: 'Investment Ready', value: investment || '—' },
                              ...(investorProfiles[lead.userId] ? [
                                { label: 'Bio', value: investorProfiles[lead.userId].bio || '—' },
                                { label: 'Experience', value: investorProfiles[lead.userId].isExistingBusiness ? 'Existing Business Owner' : 'First-time Investor' },
                              ] : []),
                            ].filter(f => f.value).map(field => (
                              <div key={field.label} className="bg-muted rounded-xl px-4 py-3">
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{field.label}</p>
                                <p className="text-xs font-bold text-foreground">{field.value}</p>
                              </div>
                            ))}
                          </div>

                          {lead.responses && lead.responses.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Application Responses</p>
                              {lead.responses.map(r => (
                                <div key={r.questionId} className="flex gap-3 text-xs bg-muted/50 rounded-xl px-4 py-2.5">
                                  <span className="font-bold text-muted-foreground min-w-[120px] shrink-0">{r.question}</span>
                                  <span className="font-black text-foreground">{r.answer}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            {lead.status !== 'completed' && lead.status !== 'rejected' && (
                              <Button size="sm" onClick={() => handleUpdateStatus(lead.id, 'completed')} className="h-8 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold">
                                Mark Converted
                              </Button>
                            )}
                            {lead.status !== 'rejected' && (
                              <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(lead.id, 'rejected')} className="h-8 px-4 rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold">
                                Reject
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Support Tab ── */}
      {activeTab === 'support' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="text-lg font-black text-foreground">Help & Support</h2>
            <p className="text-sm text-muted-foreground">Get help with your brand listing and leads</p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: <Building2 className="h-5 w-5" />,
                title: 'Listing not approved?',
                body: 'Our team reviews all listings within 24–48 hours. If your listing is pending for more than 48 hours, reach out to us.',
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: 'How do I manage leads?',
                body: 'Go to the Leads tab. You can view each investor\'s details, call them directly, update their status, and move them through your pipeline.',
              },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                title: 'How to get verified?',
                body: 'Upload your GST certificate, business registration document, or any official proof of your brand. Verification adds a badge to your listing and improves visibility.',
              },
              {
                icon: <TrendingUp className="h-5 w-5" />,
                title: 'How to improve my listing visibility?',
                body: 'Add high-quality images, a detailed description, accurate investment range, and success stories. Verified listings rank higher in investor searches.',
              },
            ].map((item, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-5 flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6" />
                <p className="font-black text-lg">Need direct support?</p>
              </div>
              <p className="text-primary-foreground/80 text-sm">Our expert team is available Mon–Sat, 9 AM to 7 PM IST.</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a href="mailto:support@bharatbrand.in">
                  <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-xl font-bold text-xs">
                    <Mail className="h-4 w-4 mr-2" />Email Us
                  </Button>
                </a>
                <a href="tel:+918888888888">
                  <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-xl font-bold text-xs">
                    <Phone className="h-4 w-4 mr-2" />Call Support
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CreateOpportunityModal
        isOpen={isListingModalOpen}
        onClose={() => { setIsListingModalOpen(false); setEditingBrand(null); }}
        onSubmit={handleSaveBrand}
        initialData={editingBrand}
      />
    </div>
  );
}
