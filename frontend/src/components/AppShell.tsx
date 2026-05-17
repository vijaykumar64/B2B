import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { AppModals } from './AppModals';
import { useAuthInit } from '../hooks/useAuthInit';
import { useAppSocket } from '../hooks/useAppSocket';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useFiltersStore } from '../stores/filtersStore';
import { Toaster } from './ui/sonner';
import Footer from './Footer';

const ROUTE_TO_TAB: Record<string, string> = {
  '/': 'landing',
  '/find-franchise': 'find-franchise',
  '/find-dealership': 'find-dealership',
  '/find-distribution': 'find-distribution',
  '/messages': 'messages',
  '/profile': 'profile',
  '/status': 'status',
  '/ask-ai': 'ai',
  '/brand': 'brand-opportunities',
  '/brand/leads': 'brand-leads',
  '/admin': 'admin',
};

const TAB_TO_ROUTE: Record<string, string> = {
  landing: '/',
  'find-franchise': '/find-franchise',
  'find-dealership': '/find-dealership',
  'find-distribution': '/find-distribution',
  messages: '/messages',
  profile: '/profile',
  status: '/status',
  ai: '/ask-ai',
  'brand-opportunities': '/brand',
  'brand-leads': '/brand/leads',
  admin: '/admin',
};

export function AppShell() {
  useAuthInit();
  useAppSocket();

  const navigate = useNavigate();
  const { pathname, state: locationState } = useLocation();

  const { user, isAuthReady, logout } = useAuthStore();
  const { openAuthModal, openCallModal, openFeedbackModal, unreadMessagesCount } = useUIStore();
  const { searchQuery, showVerifiedOnly, setShowVerifiedOnly, setSearchQuery } = useFiltersStore();

  // Role-based redirect after auth ready — skipped if user explicitly navigated back to home
  useEffect(() => {
    if (!isAuthReady || !user) return;
    if ((locationState as any)?.skipRoleRedirect) return;
    if (user.role === 'brand_owner' && pathname === '/') navigate('/brand');
    else if (user.role === 'admin' && pathname === '/') navigate('/admin');
  }, [isAuthReady, user?.role, pathname, locationState]);

  const activeTab = ROUTE_TO_TAB[pathname] ?? 'landing';

  const handleTabChange = (tab: string) => {
    const route = TAB_TO_ROUTE[tab];
    if (route) navigate(route);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearchChange = (query: string, source?: 'nav' | 'hero') => {
    setSearchQuery(query);
    if (query.trim()) {
      const searchTabs = ['landing', 'find-franchise', 'find-dealership', 'find-distribution'];
      if (!searchTabs.includes(activeTab)) navigate('/');

      if (source === 'nav' || !searchTabs.includes(activeTab)) {
        setTimeout(() => {
          const el = document.getElementById('trending-section');
          if (el) {
            const rect = el.getBoundingClientRect();
            if (query.length > 2 && (rect.top > 300 || rect.top < -100)) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden w-full flex flex-col pt-20">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onCallRequest={openCallModal}
        user={user}
        onLoginClick={(mode) => openAuthModal(mode ?? 'signup')}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        unreadMessagesCount={unreadMessagesCount}
        showVerifiedOnly={showVerifiedOnly}
        onShowVerifiedOnlyChange={setShowVerifiedOnly}
        onFeedbackClick={openFeedbackModal}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AppModals />
      <Toaster />
    </div>
  );
}
