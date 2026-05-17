import React from 'react';
import { Home, MapPin, ShieldCheck, User, Menu, X, LogOut, TrendingUp, Search, Users, Globe, MessageSquare, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';
import NotificationCenter from './NotificationCenter';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCallRequest: (type: 'investor' | 'brand') => void;
  user: UserType | null;
  onLoginClick: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string, source?: 'nav' | 'hero') => void;
  unreadMessagesCount?: number;
  showVerifiedOnly: boolean;
  onShowVerifiedOnlyChange: (show: boolean) => void;
  onFeedbackClick: () => void;
  opportunities?: any[];
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onCallRequest,
  user,
  onLoginClick,
  onLogout,
  searchQuery,
  onSearchChange,
  unreadMessagesCount = 0,
  showVerifiedOnly,
  onShowVerifiedOnlyChange,
  onFeedbackClick,
  opportunities = [],
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const suggestions = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 1) return [];
    const search = searchQuery.toLowerCase();
    const brandMatches = opportunities
      .filter(o => o.brand_name?.toLowerCase().includes(search))
      .slice(0, 5)
      .map(o => ({ type: 'brand', label: o.brand_name, id: o.id }));
    const categories = Array.from(new Set(opportunities.map(o => o.category)))
      .filter((c): c is string => !!c?.toLowerCase().includes(search))
      .slice(0, 3)
      .map(c => ({ type: 'category', label: c, id: c }));
    return [...brandMatches, ...categories];
  }, [searchQuery, opportunities]);

  const handleSelectSuggestion = (suggestion: { type: string; label: string; id: string }) => {
    onSearchChange(suggestion.label, 'nav');
    setShowSuggestions(false);
    setIsSearchOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => Math.max(prev - 1, 0)); }
    else if (e.key === 'Enter') {
      if (activeIndex >= 0) handleSelectSuggestion(suggestions[activeIndex]);
      else { onSearchChange(searchQuery, 'nav'); setShowSuggestions(false); setIsSearchOpen(false); }
    } else if (e.key === 'Escape') { setShowSuggestions(false); setIsSearchOpen(false); }
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when search opens
  React.useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const navItems = [
    { id: 'landing', label: 'Home', show: !user || user.role === 'investor' },
    { id: 'find-franchise', label: 'Franchise', show: true },
    { id: 'find-dealership', label: 'Dealership', show: true },
    { id: 'find-distribution', label: 'Distribution', show: true },
    { id: 'brand-opportunities', label: 'My Listings', show: user?.role === 'brand_owner' || user?.role === 'admin' },
    { id: 'brand-leads', label: 'Leads', show: user?.role === 'brand_owner' || user?.role === 'admin' },
    { id: 'messages', label: 'Messages', show: !!user },
    { id: 'admin', label: 'Admin', show: user?.role === 'admin' },
    { id: 'status', label: 'Applications', show: user?.role === 'investor' },
  ].filter(item => item.show);

  return (
    <>
      {/* ── Floating Dynamic Island Navbar ── */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="pointer-events-auto"
        >
          <AnimatePresence mode="wait">
            {isSearchOpen ? (
              /* ── Expanded Search Island ── */
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="bg-background/95 backdrop-blur-md shadow-lg shadow-black/10 border border-border rounded-2xl flex items-center gap-2 px-4 h-12 w-[min(900px,90vw)]"
                ref={searchRef}
              >
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  autoFocus
                  placeholder="Search brands, categories..."
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => { onSearchChange(e.target.value, 'nav'); setShowSuggestions(true); setActiveIndex(-1); }}
                  className="flex-1 bg-transparent text-foreground text-sm font-medium placeholder:text-muted-foreground outline-none min-w-0"
                />
                {searchQuery && (
                  <button onClick={() => onSearchChange('')} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => { setIsSearchOpen(false); setShowSuggestions(false); }}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-1 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Search suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/10 z-50"
                    >
                      <div className="p-1.5">
                        {suggestions.map((s, idx) => (
                          <button
                            key={`${s.type}-${s.id}-${idx}`}
                            onClick={() => handleSelectSuggestion(s)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
                              activeIndex === idx ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                            }`}
                          >
                            <div className={`h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              s.type === 'brand' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/50' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/50'
                            }`}>
                              <TrendingUp className="h-3 w-3" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{s.label}</p>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{s.type}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* ── Main Island ── */
              <motion.div
                key="main"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="bg-background/95 backdrop-blur-md shadow-lg shadow-black/10 border border-border rounded-2xl flex items-center h-12 px-3 gap-1"
              >
                {/* Logo */}
                <button
                  onClick={() => setActiveTab('landing')}
                  className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-accent transition-all group flex-shrink-0"
                >
                  <div className="h-6 w-6 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-foreground text-xs font-black tracking-tight hidden sm:block">
                    Bharat<span className="text-orange-500">Brand</span>
                  </span>
                </button>

                {/* Divider */}
                <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />

                {/* Nav Links */}
                <nav aria-label="Main navigation" className="hidden md:flex items-center gap-0.5">
                  {navItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      aria-current={activeTab === item.id ? 'page' : undefined}
                      className={`relative px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        activeTab === item.id
                          ? 'bg-orange-500 text-white shadow-sm shadow-orange-200 dark:shadow-orange-900/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      {item.label}
                      {item.id === 'messages' && unreadMessagesCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
                      )}
                    </button>
                  ))}
                </nav>

                {/* Divider */}
                <div className="w-px h-5 bg-border mx-1 flex-shrink-0 hidden md:block" />

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                  {/* Search button */}
                  <button
                    onClick={() => {
                      setIsSearchOpen(true);
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    }}
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    title="Search"
                    aria-label="Search"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>

                  {!user && (
                    <>
                      <button
                        onClick={() => onLoginClick('login')}
                        className="hidden sm:flex items-center text-muted-foreground hover:text-foreground px-3 h-8 rounded-xl text-[10px] font-bold hover:bg-accent transition-all"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => onLoginClick('signup')}
                        className="flex items-center bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black px-4 text-[10px] h-8 shadow-sm transition-all"
                      >
                        Get Started
                      </button>
                    </>
                  )}

                  {user && (
                    <>
                      <button
                        onClick={onFeedbackClick}
                        className="hidden sm:flex h-8 w-8 rounded-xl items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        title="Feedback"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>

                      <div className="[&_button]:text-muted-foreground [&_button:hover]:text-foreground [&_button]:rounded-xl [&_button:hover]:bg-accent">
                        <NotificationCenter user={user} />
                      </div>

                      {/* Avatar + name */}
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-accent transition-all group"
                      >
                        <div className="h-6 w-6 rounded-full overflow-hidden border border-border flex-shrink-0">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className={`h-full w-full flex items-center justify-center font-black text-[9px] text-white ${
                              user.role === 'admin' ? 'bg-purple-500' :
                              user.role === 'brand_owner' ? 'bg-orange-500' : 'bg-blue-500'
                            }`}>
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                          {user.name?.split(' ')[0] || 'User'}
                        </span>
                      </button>

                      <button
                        onClick={onLogout}
                        className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        title="Log out"
                        aria-label="Log out"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}

                  {/* Mobile menu toggle */}
                  <button
                    className="md:hidden h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                    aria-controls="mobile-menu"
                  >
                    {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Mobile Dropdown ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            id="mobile-menu"
            className="fixed top-20 left-4 right-4 z-40 bg-slate-900 rounded-3xl shadow-2xl shadow-black/50 border border-white/10 p-4 md:hidden"
          >
            {/* Mobile Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value, 'nav')}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium placeholder:text-slate-500 outline-none focus:border-white/20"
              />
            </div>

            {/* Nav Links Grid */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                  className={`relative text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === item.id
                      ? 'bg-white text-slate-900'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                  {item.id === 'messages' && unreadMessagesCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Auth / User */}
            <div className="border-t border-white/10 pt-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                    className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className={`h-full w-full flex items-center justify-center font-black text-xs text-white ${
                          user.role === 'admin' ? 'bg-purple-500' : user.role === 'brand_owner' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-black text-white truncate">{user.name}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        {user.role === 'admin' ? 'Admin' : user.role === 'brand_owner' ? 'Brand Owner' : 'Investor'}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => { onFeedbackClick(); setIsMenuOpen(false); }}
                    className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { onLogout(); setIsMenuOpen(false); }}
                    className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { onLoginClick('login'); setIsMenuOpen(false); }}
                    className="flex-1 h-10 rounded-xl border border-white/20 text-white text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { onLoginClick('signup'); setIsMenuOpen(false); }}
                    className="flex-1 h-10 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-slate-100 transition-all"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Bottom Navigation ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
        <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-1.5 flex items-center justify-around">
          <button onClick={() => setActiveTab('landing')} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${activeTab === 'landing' ? 'text-white bg-white/10' : 'text-slate-500'}`}>
            <Home className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tight">Home</span>
          </button>
          <button onClick={() => setActiveTab('find-franchise')} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${activeTab === 'find-franchise' ? 'text-white bg-white/10' : 'text-slate-500'}`}>
            <ShieldCheck className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tight">Franchise</span>
          </button>
          <button onClick={() => setActiveTab('find-dealership')} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${activeTab === 'find-dealership' ? 'text-white bg-white/10' : 'text-slate-500'}`}>
            <MapPin className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tight">Dealer</span>
          </button>
          <button onClick={() => setActiveTab('find-distribution')} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${activeTab === 'find-distribution' ? 'text-white bg-white/10' : 'text-slate-500'}`}>
            <Globe className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tight">Distribute</span>
          </button>
          {user?.role === 'brand_owner' || user?.role === 'admin' ? (
            <button onClick={() => setActiveTab('brand-leads')} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${activeTab === 'brand-leads' ? 'text-white bg-white/10' : 'text-slate-500'}`}>
              <Users className="h-5 w-5" />
              <span className="text-[9px] font-black uppercase tracking-tight">Leads</span>
            </button>
          ) : (
            <button onClick={() => setActiveTab('status')} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${activeTab === 'status' ? 'text-white bg-white/10' : 'text-slate-500'}`}>
              <TrendingUp className="h-5 w-5" />
              <span className="text-[9px] font-black uppercase tracking-tight">Apps</span>
            </button>
          )}
          <button onClick={() => { if (user) setActiveTab('profile'); else onLoginClick(); }} className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${activeTab === 'profile' ? 'text-white bg-white/10' : 'text-slate-500'}`}>
            <User className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tight">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
}
