import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import OpportunityCard from './components/OpportunityCard';
import ApplicationStatus from './components/ApplicationStatus';
import OpportunityDetailView from './components/OpportunityDetailView';
import ExpansionSection from './components/ExpansionSection';
import CallRequestModal from './components/CallRequestModal';
import AuthModal from './components/AuthModal';
import CustomQuestionsModal from './components/CustomQuestionsModal';
import AdminDashboard from './components/AdminDashboard';
import BrandDashboard from './components/BrandDashboard';
import BrandLandingPage from './components/BrandLandingPage';
import AIBusinessConsultant from './components/AIBusinessConsultant';
import LeadInbox from './components/LeadInbox';
import CompleteProfileModal from './components/CompleteProfileModal';
import FindFranchise from './components/FindFranchise';
import UserProfile from './components/UserProfile';
import FeedbackModal from './components/FeedbackModal';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import { CONSULTING_SERVICES, BUSINESS_SECTORS, INDIA_STATES_DISTRICTS } from './constants';
import { Application, Opportunity, User, ChatRoom } from './types';
import { Toaster } from './components/ui/sonner';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Label } from './components/ui/label';
import { toast } from 'sonner';
import { seedDemoData } from './lib/demoData';
import { createNotification } from './lib/notifications';
import { motion, AnimatePresence } from 'motion/react';
import { api, clearAuthToken, isAuthenticated } from './lib/api';
import { connectSocket, disconnectSocket, getSocket } from './lib/socket';
import {
  TrendingUp,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Phone,
  Mail,
  FileText,
  UserCheck,
  Instagram,
  Twitter,
  Linkedin,
  Headphones,
  Filter,
  LogOut,
  Heart,
  Building2,
  Globe,
  Scale,
  Bell,
  BarChart3,
  X,
  Sparkles,
  Search
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callModalType, setCallModalType] = useState<'investor' | 'brand'>('investor');

  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!isAuthenticated()) {
        setIsAuthReady(true);
        return;
      }

      try {
        const data = await api.get('/auth/me');
        if (mounted && data.user) {
          const userData: User = { ...data.user, isLoggedIn: true };
          setUser(userData);
          if (!userData.phone && !userData.isDemo) {
            setIsCompleteProfileOpen(true);
          }

          const token = localStorage.getItem('token');
          if (token) {
            const socket = connectSocket(token);
            socket.on('user:updated', (updatedUser: User) => {
              if (mounted) setUser({ ...updatedUser, isLoggedIn: true });
            });
          }
        }
      } catch (_) {
        await clearAuthToken();
      } finally {
        if (mounted) setIsAuthReady(true);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Capture referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      localStorage.setItem('referralCode', ref);
    } else {
      const savedRef = localStorage.getItem('referralCode');
      if (savedRef) setReferralCode(savedRef);
    }
  }, []);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [viewingOpportunityId, setViewingOpportunityId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleEnquire = async (opportunity: Opportunity) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      if (!opportunity.id || !opportunity.owner_uid) {
        console.error("Enquiry failed: Missing opportunity data", { id: opportunity.id, owner: opportunity.owner_uid });
        toast.error("This opportunity cannot be enquired at the moment. Missing brand data.");
        return;
      }

      // Check if conversation already exists
      const convsData = await api.get('/conversations');
      const existing = (convsData.conversations || convsData || []).find((c: any) =>
        c.investor_uid === user.id &&
        c.brand_uid === opportunity.owner_uid &&
        (c.opportunityId === opportunity.id || c.opportunityId?._id === opportunity.id)
      );

      if (existing) {
        setSelectedChatId(existing._id || existing.id);
        setActiveTab('messages');
        setViewingOpportunityId(null);
      } else {
        // ENFORCE PROFILE: Check if user has basic profile fields
        if (!user.investment_range || !user.state || !user.district) {
          setSelectedOpportunity(opportunity);
          setIsQuestionsModalOpen(true);
          toast.info("Please complete your investor profile first.");
          return;
        }

        const result = await api.post('/conversations', {
          brand_uid: opportunity.owner_uid,
          opportunityId: opportunity.id,
          opportunityName: opportunity.brand_name,
          brandName: opportunity.brand_name,
        });

        const chatId = result.conversation?._id || result.conversation?.id || result._id || result.id;
        setSelectedChatId(chatId);
        setActiveTab('messages');
        setViewingOpportunityId(null);
      }
    } catch (error) {
      toast.error("Failed to start conversation. Please try again.");
      console.error(error);
    }
  };
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSelectedBusinessType('All');
    setSelectedState('All');
    setSelectedDistrict('All');
    setSelectedModel('All');
    setSelectedInvestmentRange(null);
    setSearchQuery('');
  };

  const handleSearchChange = (query: string, source: 'nav' | 'hero' = 'nav') => {
    setSearchQuery(query);
    if (query.trim()) {
      // Clear basic filters when searching globally to avoid confusion
      setSelectedCategory('All');
      setSelectedLocation('All');
      setSelectedBusinessType('All');
      setSelectedState('All');
      setSelectedDistrict('All');
      setSelectedModel('All');
      setSelectedInvestmentRange(null);

      // If we are on a tab that doesn't show opportunities, switch to landing
      const searchTabs = ['landing', 'find-franchise', 'find-dealership', 'find-distribution'];
      if (!searchTabs.includes(activeTab)) {
        setActiveTab('landing');
      }

      // Auto-scroll to results IF we are not already typing in the Hero (to avoid moving target)
      // OR if we just switched back from another tab
      if (source === 'nav' || !searchTabs.includes(activeTab)) {
        // Use a slight timeout to ensure tab change reflects in DOM if needed
        setTimeout(() => {
          const resultsSection = document.getElementById('trending-section');
          if (resultsSection) {
            // Only scroll if we aren't already near the results and query has some length
            // We avoid scrolling on every keystroke if they are already in the results area
            const rect = resultsSection.getBoundingClientRect();
            if (query.length > 2 && (rect.top > 300 || rect.top < -100)) {
              resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 300); // Increased delay for smoother transition
      }
    }
  };

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const data = await api.get('/conversations');
        const conversations: ChatRoom[] = data.conversations || data || [];
        let count = 0;
        conversations.forEach(conv => {
          if (conv.unreadCount && conv.unreadCount[user.id]) {
            count += conv.unreadCount[user.id];
          }
        });
        setUnreadMessagesCount(count);
      } catch (_) {}
    };

    fetchUnreadCount();

    const socket = getSocket();
    socket.on('conversations:updated', fetchUnreadCount);

    return () => {
      socket.off('conversations:updated', fetchUnreadCount);
    };
  }, [user?.id]);
  const [maxInvestment, setMaxInvestment] = useState<number>(5000000);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedModel, setSelectedModel] = useState<string>('All');

  useEffect(() => {
    if (user?.interestedCategories && user.interestedCategories.length > 0) {
      setSelectedCategory(user.interestedCategories[0]);
    } else {
      setSelectedCategory('All');
    }
    setIsCategoriesExpanded(false);
    setViewingOpportunityId(null);
  }, [activeTab, user?.id]);

  useEffect(() => {
    if (!isAuthReady) return;

    const fetchOpportunities = async () => {
      try {
        const data = await api.get('/opportunities');
        const opps: Opportunity[] = data.opportunities || data || [];
        setOpportunities(opps);
        if (opps.length === 0 && user?.role === 'admin') {
          seedDemoData().then(seeded => {
            if (seeded) toast.success("Welcome! Demo data has been seeded.");
          });
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    };

    const fetchApplications = async () => {
      if (!user || user.isDemo) return;
      try {
        const data = await api.get('/applications');
        const apps: Application[] = data.applications || data || [];
        setApplications(apps);
      } catch (_) {}
    };

    fetchOpportunities();
    fetchApplications();

    const socket = getSocket();
    socket.on('opportunities:sync', fetchOpportunities);
    socket.on('applications:sync', fetchApplications);

    return () => {
      socket.off('opportunities:sync', fetchOpportunities);
      socket.off('applications:sync', fetchApplications);
    };
  }, [isAuthReady, user?.id, user?.role]);

  const [viewStartTime, setViewStartTime] = useState<number | null>(null);

  const trackActivity = async (type: string, opportunityId?: string, opportunityName?: string, metadata?: any, duration?: number) => {
    if (!user) return;
    try {
      const opp = opportunityId ? opportunities.find(o => o.id === opportunityId) : null;
      await api.post('/activities', {
        userId: user.id,
        userName: user.name || 'Anonymous',
        userEmail: user.email || 'No Email',
        userPhone: user.phone || null,
        type,
        opportunityId: opportunityId || null,
        opportunityName: opportunityName || null,
        owner_uid: opp?.owner_uid || null,
        metadata: metadata || null,
        duration: duration || null,
        referralCode: referralCode || null,
        timestamp: new Date().toISOString()
      });
    } catch (_) {}
  };

  const openCallModal = (type: 'investor' | 'brand') => {
    if (!user) {
      setCallModalType(type);
      setIsAuthModalOpen(true);
      toast.info("Please sign up to request expert guidance");
      return;
    }
    setCallModalType(type);
    setIsCallModalOpen(true);
  };

  const handleViewDetails = async (id: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      toast.info("Please sign in to view full brand details and investment insights.");
      return;
    }
    setViewingOpportunityId(id);
    const opp = opportunities.find(o => o.id === id);
    if (opp && opp.id) {
      setSelectedOpportunity(opp);
      try {
        const checkData = await api.get(`/applications/check?opportunityId=${opp.id}`);
        if (!checkData.exists) {
          await api.post('/applications', {
            opportunityId: id,
            opportunityName: opp.brand_name,
            owner_uid: opp.owner_uid,
            type: opp.type,
            status: 'viewed',
            dateApplied: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
          });
        }
      } catch (_) {}
    }
  };

  const closeDetailsModal = () => {
    if (viewStartTime && selectedOpportunity) {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000);
      trackActivity('view_duration', selectedOpportunity.id, selectedOpportunity.brand_name, { duration }, duration);
    }
    setViewingOpportunityId(null);
    setSelectedOpportunity(null);
    setViewStartTime(null);
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // If brand owner tries to access landing page, redirect to brand-opportunities
    if (user?.role === 'brand_owner' && activeTab === 'landing') {
      setActiveTab('brand-opportunities');
    }
  }, [user?.role, activeTab]);

  const [interestedIds, setInterestedIds] = useState<string[]>([]);
  const [showInterestedOnly, setShowInterestedOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const toggleInterest = (id: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setInterestedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    const opportunity = opportunities.find(o => o.id === id);
    if (opportunity) {
      const isInterested = !interestedIds.includes(id);
      trackActivity(isInterested ? 'interested' : 'unshortlist', id, opportunity.brand_name);
      toast.success(isInterested ? "Marked as Interested" : "Removed from Interest list");
    }
  };

  const handleApply = async (id: string, responses?: any[]) => {
    const opportunity = opportunities.find(o => o.id === id);
    if (!opportunity) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Always show the questions modal first to collect mandatory investor details
    if (!responses) {
      setSelectedOpportunity(opportunity);
      setIsQuestionsModalOpen(true);
      return;
    }

    const userPhone = responses?.find(r => r.questionId === 'mobile')?.answer || '';

    try {
      await api.post('/applications', {
        opportunityId: id,
        opportunityName: opportunity.brand_name,
        owner_uid: opportunity.owner_uid,
        type: opportunity.type,
        userPhone: userPhone,
        status: 'pending',
        dateApplied: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        responses: responses || [],
        referralCode: referralCode || null
      });

      trackActivity('apply', opportunity.id, opportunity.brand_name);

      // Notify Brand Owner about new application
      if (opportunity.owner_uid) {
        await createNotification({
          userId: opportunity.owner_uid,
          title: `New Application: ${opportunity.brand_name}`,
          message: `${user?.name} has applied for your listing. Please review the investor profile.`,
          type: 'application',
          actionRequired: true,
          link: 'leads'
        });

        // Schedule a follow-up reminder for the Brand Owner (simulated for now)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        await createNotification({
          userId: opportunity.owner_uid,
          title: 'Review Reminder',
          message: `Pending application from ${user?.name} for ${opportunity.brand_name} requires your review.`,
          type: 'reminder',
          timestamp: tomorrow.toISOString(),
          actionRequired: true
        });
      }

      toast.success(`Application submitted for ${opportunity.brand_name}!`, {
        description: "You can track the status in the 'Track Status' tab.",
      });
      setActiveTab('status');
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
      console.error(error);
    }
  };

  const [selectedInvestmentRange, setSelectedInvestmentRange] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbySort, setNearbySort] = useState(false);

  const FILTER_INVESTMENT_RANGES = [
    { id: 'all', label: 'Any Budget', min: 0, max: Infinity },
    { id: '10k-1L', label: '10k to 1 Lakh', min: 10000, max: 100000 },
    { id: '1L-5L', label: '1 Lakh to 5 Lakh', min: 100000, max: 500000 },
    { id: '5L-10L', label: '5 Lakh to 10 Lakh', min: 500000, max: 1000000 },
    { id: '10L-50L', label: '10 Lakh to 50 Lakh', min: 1000000, max: 5000000 },
    { id: '50L-1Cr', label: '50 Lakh to 1 Crore', min: 5000000, max: 10000000 },
    { id: '1Cr+', label: 'More than 1 Crore', min: 10000000, max: Infinity },
  ];

  const filteredOpportunities = opportunities.filter(o => {
    // Stage 1: Basic Filters (Category, Investment, Location, Description, Tags)
    const search = searchQuery.toLowerCase().trim();
    if (!search) return true;

    const searchableText = `${o.brand_name || ""} ${o.category || ""} ${o.description || ""} ${o.tags?.join(" ") || ""}`.toLowerCase();
    const locationText = (o.location || "").toLowerCase();

    // Direct match
    if (searchableText.includes(search) || locationText.includes(search)) return true;

    // Fuzzy word match: check if individual words from search query match
    const searchWords = search.split(/\s+/).filter(w => w.length > 2);
    if (searchWords.length > 0) {
      const matchesSomeWords = searchWords.some(word =>
        searchableText.includes(word) || locationText.includes(word)
      );
      if (matchesSomeWords) return true;
    }

    // Category Filter
    if (selectedCategory !== 'All' && o.category !== selectedCategory) return false;

    // Business Type Filter
    if (selectedBusinessType !== 'All' && o.type !== selectedBusinessType) return false;

    // Operational Model Filter
    if (selectedModel !== 'All' && !(o.businessModel || "").toLowerCase().includes(selectedModel.toLowerCase())) return false;

    // Location Filter
    if (selectedLocation !== 'All' && !(o.location || "").toLowerCase().includes(selectedLocation.toLowerCase())) return false;

    // State Filter
    const isPanIndia = (o.location || "").toLowerCase().includes("pan india");
    if (selectedState !== 'All' && !isPanIndia && !(o.location || "").toLowerCase().includes(selectedState.toLowerCase())) return false;

    // District Filter
    if (selectedDistrict !== 'All' && !isPanIndia && !(o.location || "").toLowerCase().includes(selectedDistrict.toLowerCase())) return false;

    // Investment Range Filter
    if (selectedInvestmentRange && selectedInvestmentRange !== 'all') {
      const range = FILTER_INVESTMENT_RANGES.find(r => r.id === selectedInvestmentRange);
      if (range) {
        const oppMin = o.minInvestment || 0;
        const oppMax = o.maxInvestment || oppMin;
        // Check if the opportunity's range overlaps with selected filter range
        if (oppMax < range.min || oppMin > range.max) return false;
      }
    }

    // Verified Filter
    if (showVerifiedOnly && !o.is_verified) return false;

    // Status Filter: Hide non-published items from non-admins and non-owners
    const isOwner = user && o.owner_uid === user.id;
    const isAdmin = user && user.role === 'admin';
    if (!isAdmin && !isOwner && o.status !== 'published') return false;

    return true;
  });

  // No type-based separation anymore
  const finalResults = filteredOpportunities;

  // Sorting
  finalResults.sort((a, b) => {
    // If nearby sort is active, we prioritize "Pan India" or items matching user location hint
    if (nearbySort) {
      const aIsPan = (a.location || "").toLowerCase().includes('pan india');
      const bIsPan = (b.location || "").toLowerCase().includes('pan india');
      if (aIsPan && !bIsPan) return -1;
      if (!aIsPan && bIsPan) return 1;
    }
    return (a.brand_name || "").localeCompare(b.brand_name || "");
  });

  const categories = ['All', ...BUSINESS_SECTORS];

  const { suggestedOpportunities, isStrongRelated } = React.useMemo(() => {
    if (filteredOpportunities.length > 0 || !searchQuery.trim()) {
      return { suggestedOpportunities: [], isStrongRelated: false };
    }

    const search = searchQuery.toLowerCase().trim();
    const searchWords = search.split(/\s+/).filter(w => w.length > 2);

    // Try to find related brands (same category or similar name)
    const related = opportunities.filter(o => {
      const categoryText = (o.category || "").toLowerCase();
      const nameText = (o.brand_name || "").toLowerCase();

      const isRelatedCategory = categoryText.includes(search);
      const isRelatedName = searchWords.length > 0 && searchWords.some(word => nameText.includes(word));

      return (isRelatedCategory || isRelatedName) && o.id;
    });

    if (related.length > 0) {
      return { suggestedOpportunities: related.slice(0, 3), isStrongRelated: true };
    }

    // If no direct "related", just show some verified trending ones
    return {
      suggestedOpportunities: opportunities.filter(o => o.is_verified).slice(0, 3),
      isStrongRelated: false
    };
  }, [opportunities, filteredOpportunities, searchQuery]);
  const states = ['All', ...Object.keys(INDIA_STATES_DISTRICTS)];
  const districts = selectedState !== 'All' ? ['All', ...INDIA_STATES_DISTRICTS[selectedState]] : ['All'];
  const businessTypes = ['All'];

  const categoryCounts = opportunities
    .reduce((acc, o) => {
      acc[o.category] = (acc[o.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const totalCount = opportunities.length;

  useEffect(() => {
    if (user) {
      if (user.role === 'brand_owner' && activeTab === 'landing') {
        setActiveTab('brand-opportunities');
      } else if (user.role === 'admin' && activeTab === 'landing') {
        setActiveTab('admin');
      }
    }
  }, [user, activeTab]);

  const handleLogout = async () => {
    try {
      await clearAuthToken(); // revokes token on server + clears localStorage
      disconnectSocket();
      setUser(null);
      toast.success("Successfully logged out");
      setActiveTab('landing');
    } catch (_) {
      // Even if server call fails, clear local state
      disconnectSocket();
      setUser(null);
      setActiveTab('landing');
    }
  };

  return (
    <div className={`min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden w-full flex flex-col ${viewingOpportunityId ? 'pt-0' : 'pt-20'}`}>
      {!viewingOpportunityId && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCallRequest={openCallModal}
          user={user}
          searchQuery={searchQuery}
          unreadMessagesCount={unreadMessagesCount}
          showVerifiedOnly={showVerifiedOnly}
          onShowVerifiedOnlyChange={setShowVerifiedOnly}
          onSearchChange={handleSearchChange}
          opportunities={opportunities}
          onFeedbackClick={() => setIsFeedbackModalOpen(true)}
          onLoginClick={(mode) => { setAuthMode(typeof mode === 'string' ? mode : 'signup'); setIsAuthModalOpen(true); }}
          onLogout={handleLogout}
        />
      )}

      <main>
        <AnimatePresence mode="wait">
          {viewingOpportunityId ? (
            <motion.div
              key="opportunity-detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              {opportunities.find(o => o.id === viewingOpportunityId) && (
                <OpportunityDetailView
                  opportunity={opportunities.find(o => o.id === viewingOpportunityId)!}
                  allOpportunities={opportunities}
                  onBack={() => setViewingOpportunityId(null)}
                  onApply={handleApply}
                  onEnquire={handleEnquire}
                  isLoggedIn={!!user}
                  user={user}
                  onLoginClick={(mode) => { setAuthMode(typeof mode === 'string' ? mode : 'signup'); setIsAuthModalOpen(true); }}
                  onViewOpportunity={handleViewDetails}
                />
              )}
            </motion.div>
          ) : (
            <>
              {activeTab === 'brand-landing' && (
                <motion.div
                  key="brand-landing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <BrandLandingPage
                    onStartSignUp={() => {
                      setAuthMode('signup');
                      setIsAuthModalOpen(true);
                    }}
                    isLoggedIn={!!user}
                    onGoToDashboard={() => setActiveTab('brand-leads')}
                  />
                </motion.div>
              )}

              {activeTab === 'landing' && (!user || user.role === 'investor') && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Hero
                    onCallRequest={() => openCallModal('investor')}
                  />

                  {/* Random/Featured Data Sections */}
                  <div id="trending-section" className="bg-slate-50 py-6 md:py-8 border-b border-slate-100">
                    <div className="container-safe">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 md:mb-10">
                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                            <Sparkles className="h-3 w-3 text-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Featured Picks</span>
                          </div>
                          <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                            {searchQuery ? (
                              <>Search <span className="text-blue-600 italic">Results</span></>
                            ) : (
                              <>Trending <span className="text-blue-600 italic">Opportunities</span></>
                            )}
                          </h2>
                          <p className="text-slate-500 font-bold max-w-xl text-base">
                            {searchQuery ? `Showing matching opportunities for "${searchQuery}"` : "Handpicked franchises, dealerships, and distributions ready for expansion in your territory."}
                          </p>
                        </div>
                        <Button
                          onClick={() => setActiveTab('find-franchise')}
                          className="rounded-full h-14 px-10 bg-slate-900 border-none text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                        >
                          View All Brands
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                        {opportunities.length > 0 ? (
                          searchQuery ? (
                            filteredOpportunities.length > 0 ? (
                              filteredOpportunities.map((opp) => (
                                <OpportunityCard
                                  key={opp.id}
                                  opportunity={opp}
                                  onViewDetails={handleViewDetails}
                                />
                              ))
                            ) : isStrongRelated ? (
                              <>
                                <div className="col-span-full mb-8">
                                  <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <Sparkles className="h-5 w-5 text-blue-600" />
                                    <p className="text-sm font-bold text-slate-700">
                                      We found these recommendations matching your search for <span className="text-blue-600">"{searchQuery}"</span>
                                    </p>
                                    <Button
                                      variant="link"
                                      onClick={resetFilters}
                                      className="ml-auto text-[10px] font-black uppercase tracking-widest text-blue-600"
                                    >
                                      Reset
                                    </Button>
                                  </div>
                                </div>

                                {suggestedOpportunities.map((opp) => (
                                  <OpportunityCard
                                    key={`suggested-${opp.id}`}
                                    opportunity={opp}
                                    onViewDetails={handleViewDetails}
                                  />
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
                                    <Button
                                      variant="outline"
                                      onClick={resetFilters}
                                      className="mt-6 rounded-full border-2 border-blue-100 hover:border-blue-200 text-blue-600 font-black uppercase tracking-widest text-[10px] px-8 h-12"
                                    >
                                      Explore All Opportunities
                                    </Button>
                                  </div>
                                </div>

                                <div className="col-span-full mb-8">
                                  <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-slate-100" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verified Trending Brands</span>
                                    <div className="h-px flex-1 bg-slate-100" />
                                  </div>
                                </div>

                                {suggestedOpportunities.map((opp) => (
                                  <OpportunityCard
                                    key={`suggested-fallback-${opp.id}`}
                                    opportunity={opp}
                                    onViewDetails={handleViewDetails}
                                  />
                                ))}
                              </>
                            )
                          ) : (
                            [...opportunities]
                              .sort(() => 0.5 - Math.random())
                              .slice(0, 6)
                              .map((opp) => (
                                <OpportunityCard
                                  key={opp.id}
                                  opportunity={opp}
                                  onViewDetails={handleViewDetails}
                                />
                              ))
                          )
                        ) : (
                          Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-[450px] bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 animate-pulse" />
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Filter Bar */}
                  <div className={`sticky top-14 md:top-20 z-30 transition-all duration-300 ${
                    isScrolled
                      ? 'bg-white/80 backdrop-blur-xl py-2 border-b border-slate-100 shadow-sm'
                      : 'bg-white py-4 border-b border-slate-100'
                  }`}>
                    <div className="container-safe">
                      <div className={`flex flex-col ${isScrolled ? 'gap-1' : 'gap-6'}`}>
                        {/* Sector Categories - Hide on scroll */}
                        <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar transition-all ${
                          isScrolled ? 'h-0 opacity-0 mb-0' : 'pb-2 opacity-100'
                        }`}>
                           {categories.map(cat => (
                             <button
                               key={cat}
                               onClick={() => setSelectedCategory(cat)}
                               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                                 selectedCategory === cat
                                   ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                   : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                               }`}
                             >
                               {cat}
                             </button>
                           ))}
                        </div>

                        <div className={`flex flex-wrap items-center ${isScrolled ? 'gap-2 justify-center sm:justify-start' : 'gap-4'}`}>
                          <div className="flex-1 overflow-hidden" />

                          {/* Location/Investment Dropdowns - Hide on scroll to keep it simple */}
                          {!isScrolled && (
                            <>
                              {/* Location Dropdown (State/City) */}
                              <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                            <div className="relative group">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-brand-indigo" />
                              <select
                                value={selectedState}
                                onChange={(e) => {
                                  setSelectedState(e.target.value);
                                  setSelectedDistrict('All');
                                }}
                                className={`${isScrolled ? 'h-10 text-[10px]' : 'h-12 text-xs'} w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none`}
                              >
                                {states.map(s => <option key={s} value={s}>{s === 'All' ? 'State' : s}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* District / City Dropdown */}
                          <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                            <div className="relative group">
                              <Building2 className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-indigo" />
                              <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={selectedState === 'All'}
                                className={`${isScrolled ? 'h-10 text-[10px]' : 'h-12 text-xs'} w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none disabled:opacity-50`}
                              >
                                {districts.map(d => <option key={d} value={d}>{d === 'All' ? 'City' : d}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Investment Range Dropdown */}
                          <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                            <div className="relative group">
                              <BarChart3 className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-indigo" />
                              <select
                                value={selectedInvestmentRange || 'all'}
                                onChange={(e) => setSelectedInvestmentRange(e.target.value)}
                                className={`${isScrolled ? 'h-10 text-[10px]' : 'h-12 text-xs'} w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none`}
                              >
                                {FILTER_INVESTMENT_RANGES.map(range => (
                                  <option key={range.id} value={range.id}>{range.label}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Business Type Dropdown */}
                          <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                            <div className="relative group">
                              <Building2 className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-indigo" />
                              <select
                                value={selectedBusinessType}
                                onChange={(e) => setSelectedBusinessType(e.target.value)}
                                className={`${isScrolled ? 'h-10 text-[10px]' : 'h-12 text-xs'} w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none`}
                              >
                                <option value="All">Type</option>
                                <option value="brand">Franchise</option>
                                <option value="dealership">Dealership</option>
                                <option value="distribution">Distribution</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Operational Model Dropdown */}
                          <div className="flex-1 min-w-[140px] md:min-w-[200px]">
                            <div className="relative group">
                              <Globe className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-indigo" />
                              <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className={`${isScrolled ? 'h-10 text-[10px]' : 'h-12 text-xs'} w-full pl-9 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-brand-indigo transition-all font-bold appearance-none outline-none`}
                              >
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

                      {/* Reset Button */}
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSelectedCategory('All');
                              setSelectedState('All');
                              setSelectedDistrict('All');
                              setSelectedInvestmentRange('all');
                              setSelectedBusinessType('All');
                              setSelectedModel('All');
                              setSearchQuery('');
                              setShowVerifiedOnly(false);
                            }}
                            className={`${isScrolled ? 'h-10 px-3' : 'h-12 px-6'} rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 font-black text-[9px] uppercase tracking-widest gap-2`}
                          >
                            <X className="h-3 w-3" />
                            {isScrolled ? '' : 'Clear'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Institutional-Grade Briefing centerpiece */}
              <section className="bg-slate-950 py-10 md:py-16 relative overflow-hidden border-y border-white/5">
                <div className="absolute inset-0 z-0 opacity-20">
                   <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(51,65,85,0.3),transparent)]" />
                </div>

                <div className="container-safe relative z-10">
                  <div className="grid lg:grid-cols-1 sm:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/5 backdrop-blur-md">
                         <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                         <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-300">
                           Regulatory & Compliance Oversight
                         </span>
                      </div>

                      <h2 className="text-4xl lg:text-5xl text-white serif italic leading-[1.1]">
                         Institutional Grade <br/>
                         <span className="text-slate-500">Market Intelligence.</span>
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
                       <BriefItem
                          title="Fiscal Health Modeling"
                          text="Rigorous P&L validation and historical tax compliance auditing."
                          dark
                       />
                       <BriefItem
                          title="Operational Vetting"
                          text="Backend support architecture mapping and field audits for sustainability."
                          dark
                       />
                       <BriefItem
                          title="Market Density Index"
                          text="Proprietary regional demand heatmaps for optimized territory selection."
                          dark
                       />
                       <BriefItem
                          title="Legal & IP Clearance"
                          text="Exclusive verification of trademark standing and regulatory clearance."
                          dark
                       />
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <FAQ />
            </motion.div>
          )}

          {activeTab === 'brand-listing' && (
            <motion.div
              key="brand-listing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
            >
              <div className="grid lg:grid-cols-1 sm:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-4 py-1.5 rounded-full font-black text-xs tracking-widest uppercase">
                      Limited Time: ₹0 Listing Fee
                    </Badge>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl leading-tight">
                      Scale Your Brand <br />
                      <span className="text-orange-600">Across Bharat, Professionally.</span>
                    </h2>
                    <p className="mt-6 text-xl text-slate-600 leading-relaxed font-medium">
                      India's most integrated expansion platform. List your brand for <span className="text-green-600 font-black italic">FREE</span> and access verified local investors in 500+ cities.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <h3 className="font-black text-slate-900 mb-2">Verified Reach</h3>
                      <p className="text-sm text-slate-500 font-medium">Get your brand in front of 50k+ pre-screened investors ready for expansion.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Globe className="h-6 w-6" />
                      </div>
                      <h3 className="font-black text-slate-900 mb-2">Zero Listing Fee</h3>
                      <p className="text-sm text-slate-500 font-medium">No upfront charges. Register now and list your brand opportunity for free.</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <ShieldCheck className="h-24 w-24" />
                    </div>
                    <div className="relative z-10 flex items-center gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-orange-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <TrendingUp className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-lg font-black italic">"Our mission is to democratize business ownership across Tier 2 & 3 Bharat."</p>
                        <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mt-2">Professional Listing Guarantee</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="glass rounded-[3.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/50 border-4 border-white bg-white/80 backdrop-blur-xl">
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Onboarding Open</span>
                      </div>
                      <h3 className="text-3xl font-black text-slate-900">List Your Brand</h3>
                      <p className="text-slate-500 text-sm font-semibold mt-1">Join 500+ premium brands scaling with us.</p>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); toast.success("Request received! Our onboarding team will contact you within 24 hours."); }}>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Brand Name</Label>
                        <Input placeholder="e.g. Apollo Diagnostics" className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-sm font-bold" required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Opportunity Type</Label>
                          <select className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold focus:ring-orange-500">
                            <option>Franchise</option>
                            <option>Dealership</option>
                            <option>Distribution</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Current Outlets</Label>
                          <Input type="number" placeholder="0" className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-sm font-bold" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Authorized Contact</Label>
                        <Input type="tel" placeholder="+91 XXXXX XXXXX" className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-sm font-bold" required />
                      </div>

                      <div className="pt-4">
                        <Button className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98]">
                          Submit FREE Listing
                        </Button>
                        <p className="text-center text-[10px] text-slate-400 font-bold mt-4 flex items-center justify-center gap-2">
                          <ShieldCheck className="h-3 w-3" />
                          GDPR & Privacy Compliant • 100% Secure Listing
                        </p>
                      </div>
                    </form>
                  </div>

                  {/* Floating Trust Indicator */}
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verified Platform</p>
                      <p className="text-[10px] font-bold text-slate-400">Zero Upfront Charges</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'find-franchise' && (
            <motion.div
              key="find-franchise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FindFranchise
                opportunities={opportunities}
                onViewDetails={handleViewDetails}
                typeFilter="brand"
                globalSearchQuery={searchQuery}
                onGlobalSearchChange={handleSearchChange}
              />
            </motion.div>
          )}

          {activeTab === 'find-dealership' && (
            <motion.div
              key="find-dealership"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FindFranchise
                opportunities={opportunities}
                onViewDetails={handleViewDetails}
                typeFilter="dealership"
                globalSearchQuery={searchQuery}
                onGlobalSearchChange={handleSearchChange}
              />
            </motion.div>
          )}

          {activeTab === 'find-distribution' && (
            <motion.div
              key="find-distribution"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FindFranchise
                opportunities={opportunities}
                onViewDetails={handleViewDetails}
                typeFilter="distribution"
                globalSearchQuery={searchQuery}
                onGlobalSearchChange={handleSearchChange}
              />
            </motion.div>
          )}

          {(activeTab === 'brand-opportunities' || activeTab === 'brand-leads') && (
            <motion.div
              key="brand-dashboards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
            >
              <BrandDashboard
                user={user!}
                opportunities={opportunities}
                activeTab={activeTab}
                onPreviewAsInvestor={(id) => setViewingOpportunityId(id)}
                onFeedbackClick={() => setIsFeedbackModalOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
            >
              <AdminDashboard />
            </motion.div>
          )}

          {activeTab === 'status' && (
            <motion.div
              key="status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Track Applications</h2>
                <p className="mt-2 text-slate-600">Real-time updates on your brand partnership journey.</p>
              </div>
              <ApplicationStatus applications={applications} />
            </motion.div>
          )}

          {activeTab === 'messages' && user && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
            >
              <LeadInbox user={user} initialChatId={selectedChatId} />
            </motion.div>
          )}

          {activeTab === 'profile' && user && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
            >
              <UserProfile
                user={user}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

          {activeTab === 'ask-ai' && (
            <motion.div
              key="ask-ai"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8"
            >
              <div className="mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">Scaling Guru</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">AI Business Strategist • Online</p>
                </div>
              </div>
              <AIBusinessConsultant
                opportunities={opportunities}
                user={user}
                onLoginClick={() => setIsAuthModalOpen(true)}
                inlineMode={true}
              />
            </motion.div>
          )}
          </>
          )}
        </AnimatePresence>
      </main>

      <div className="md:hidden h-24" /> {/* Spacer for bottom nav */}

      <Footer />

      <CallRequestModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        type={callModalType}
        user={user}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(u) => {
          setUser(u);
          if (u.role === 'brand_owner') {
            setActiveTab('brand-opportunities');
          }
        }}
        initialMode={authMode}
      />
      {user && (
        <CompleteProfileModal
          isOpen={isCompleteProfileOpen}
          onClose={() => setIsCompleteProfileOpen(false)}
          user={user}
        />
      )}
      <CustomQuestionsModal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        opportunity={selectedOpportunity}
        user={user}
        onSubmit={(responses) => handleApply(selectedOpportunity!.id, responses)}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        user={user}
      />
      <Toaster position="bottom-right" />
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
       <select
         value={value}
         onChange={(e) => onChange(e.target.value)}
         className="bg-transparent text-[11px] font-bold text-slate-950 focus:outline-none cursor-pointer"
       >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
       </select>
    </div>
  );
}

function BriefItem({ title, text, dark }: { title: string, text: string, dark?: boolean }) {
  return (
    <div className="space-y-2">
       <h4 className={`font-bold text-[11px] uppercase tracking-widest border-b pb-2 ${
         dark ? 'text-white border-white/10' : 'text-slate-950 border-slate-100'
       }`}>{title}</h4>
       <p className={`text-[13px] font-normal leading-relaxed italic serif ${
         dark ? 'text-slate-400' : 'text-slate-500'
       }`}>{text}</p>
    </div>
  );
}
