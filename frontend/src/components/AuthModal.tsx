import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Lock, Mail, ArrowRight, Briefcase, TrendingUp, Phone, ShieldCheck, MapPin, CircleDollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { api, setAuthToken } from '../lib/api';
import { connectSocket } from '../lib/socket';
import { useAuthStore } from '../stores/authStore';

import { BUSINESS_SECTORS, INVESTMENT_RANGES, INDIA_STATES_DISTRICTS } from '../constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
  initialMode?: 'login' | 'signup';
  initialRole?: 'investor' | 'brand_owner';
}

export default function AuthModal({ isOpen, onClose, onLogin, initialMode = 'signup', initialRole }: AuthModalProps) {
  const setStoreUser = useAuthStore((s) => s.setUser);
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'investor' | 'brand_owner'>(initialRole || 'investor');
  const [interestType, setInterestType] = useState<string>('brand');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [otpStage, setOtpStage] = useState(false);
  const [formDataCache, setFormDataCache] = useState<any>(null);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [selectedState, setSelectedState] = useState<string>('');
  const [adminMode, setAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  React.useEffect(() => {
    setIsLogin(initialMode === 'login');
    setRole(initialRole || 'investor');
    setAdminMode(false);
    setAdminEmail('');
    setAdminPassword('');
  }, [initialMode, initialRole, isOpen]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;
    setLoading(true);
    try {
      const data = await api.post('/auth/email-login', { email: adminEmail.trim(), password: adminPassword });
      if (data.user?.role !== 'admin') {
        toast.error('This account does not have admin privileges');
        return;
      }
      setAuthToken(data.token, data.refreshToken);
      connectSocket(data.token);
      const adminUser = { ...data.user, isLoggedIn: true };
      setStoreUser(adminUser);
      onLogin(adminUser);
      toast.success(`Welcome back, ${data.user.name}!`);
      setAdminMode(false);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    );
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());
    setFormDataCache(data);
    setOtpStage(true);
    toast.success("OTP Sent!", { description: "Demo OTP: 111111" });
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate OTP — must be 111111
    const enteredOtp = otpValue.join('');
    if (enteredOtp !== '111111') {
      toast.error('Invalid OTP. Use 111111 to continue.');
      return;
    }

    setLoading(true);

    const phone = ((formDataCache.phone as string) || '7569959475').replace(/\s+/g, '');
    const name = (formDataCache.name as string) || 'User';

    // Auto-generate credentials behind scenes (same scheme as before)
    const email = `${phone}@visionaryowners.com`;
    const password = `Visionary@${phone}`;

    const investment_range = formDataCache.investmentRange as string;
    const isExistingBusiness = formDataCache.isExistingBusiness === 'true';
    const expansionGoal = formDataCache.expansionGoal as string;
    const selectedInterestType = formDataCache.interestType as string;
    const state = formDataCache.state as string;
    const district = formDataCache.district as string;

    const brandName = formDataCache.brandName as string;
    const outletCount = formDataCache.outletCount as string;

    try {
      if (isLogin) {
        const data = await api.post('/auth/login', { phone });
        setAuthToken(data.token, data.refreshToken);
        connectSocket(data.token);
        const loginUser = { ...data.user, isLoggedIn: true };
        setStoreUser(loginUser);
        onLogin(loginUser);
        toast.success("Welcome back!");
      } else {
        // Build payload, stripping null/undefined so Zod optional fields stay clean
        const rawData = {
          name,
          phone,
          role,
          ...(role === 'investor' && state ? { state } : {}),
          ...(role === 'investor' && district ? { district } : {}),
          ...(role === 'investor' && investment_range ? { investment_range } : {}),
          ...(role === 'investor' ? { isExistingBusiness } : {}),
          ...(role === 'investor' && selectedInterestType ? { interestType: selectedInterestType } : {}),
          ...(role === 'investor' ? { interestedCategories: selectedSectors.length > 0 ? selectedSectors : ['Other'] } : {}),
          ...(role === 'brand_owner' && brandName ? { brandName } : {}),
          ...(role === 'brand_owner' && outletCount ? { outletCount } : {}),
        };

        let data: any;
        try {
          data = await api.post('/auth/register', rawData);
        } catch (regErr: any) {
          if (regErr.message?.includes('already exists') || regErr.message?.includes('duplicate')) {
            // Account already exists — log in instead
            data = await api.post('/auth/login', { phone });
            toast.success("Welcome back (Existing account detected)!");
          } else {
            throw regErr;
          }
        }

        setAuthToken(data.token, data.refreshToken);
        connectSocket(data.token);
        const regUser = { ...data.user, isLoggedIn: true };
        setStoreUser(regUser);
        onLogin(regUser);
        if (!data.user?.isLoggedIn) toast.success("Account created successfully!");
      }

      setOtpStage(false);
      onClose();
    } catch (error: any) {
      console.error("Auth error:", error);
      // Rate-limited or backend unreachable — fall back to a local demo session
      // so the OTP 111111 shortcut always works during development
      if (
        error.message?.toLowerCase().includes('too many') ||
        error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('429') ||
        error.message?.toLowerCase().includes('network') ||
        error.message?.toLowerCase().includes('failed to fetch')
      ) {
        const phone = ((formDataCache.phone as string) || '7569959475').replace(/\s+/g, '');
        const demoUser = {
          id: `demo-${phone}`,
          name: (formDataCache.name as string) || 'Demo User',
          phone,
          email: `${phone}@visionaryowners.com`,
          role,
          isDemo: true,
          isLoggedIn: true,
          createdAt: new Date().toISOString(),
        };
        setStoreUser(demoUser as any);
        onLogin(demoUser);
        setOtpStage(false);
        onClose();
        toast.info('Logged in as demo user (backend rate-limited — restart the server to clear)');
        return;
      }
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error("Google login requires VITE_GOOGLE_CLIENT_ID to be configured in .env");
      return;
    }

    const gsi = (window as any).google?.accounts?.id;
    if (!gsi) {
      toast.error("Google Identity Services failed to load. Please refresh and try again.");
      return;
    }

    setLoading(true);

    gsi.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          // Send the raw Google credential to the backend for server-side verification
          const data = await api.post('/auth/google', {
            credential: response.credential,
          });
          setAuthToken(data.token, data.refreshToken);
          connectSocket(data.token);
          const googleUser = { ...data.user, isLoggedIn: true };
          setStoreUser(googleUser);
          onLogin(googleUser);
          toast.success("Logged in with Google!");
          onClose();
        } catch (err: any) {
          toast.error(err.message || "Google login failed");
        } finally {
          setLoading(false);
        }
      },
    });

    gsi.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setLoading(false);
        toast.error("Google popup was blocked. Please allow popups and try again.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[92vh] overflow-y-auto p-0 border-0 shadow-2xl rounded-2xl bg-background">
        {/* Decorative header gradient */}
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

        <div className="px-6 py-6 sm:px-8">

          {/* ── Admin Login Panel ── */}
          {adminMode ? (
            <div>
              <DialogHeader className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-md">
                    <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black tracking-tight text-foreground">Admin Portal</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">Restricted to platform administrators</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      autoComplete="username"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="pl-10 h-11 rounded-xl bg-muted/50 border-border focus:border-primary focus:bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Enter password"
                      className="pl-10 h-11 rounded-xl bg-muted/50 border-border focus:border-primary focus:bg-background"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm shadow-md"
                >
                  {loading ? 'Verifying...' : 'Sign In as Admin'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <button
                onClick={() => setAdminMode(false)}
                className="w-full mt-5 text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to regular login
              </button>
            </div>
          ) : (
          <>
          <DialogHeader className="mb-5">
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
              {isLogin ? 'Welcome back' : 'Join ScaleUp Bharat'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {isLogin
                ? 'Sign in to access exclusive brand details and track your journey.'
                : role === 'investor'
                  ? 'Connect with verified franchise and business opportunities across India.'
                  : 'List your brand and connect with thousands of qualified investors.'}
            </DialogDescription>
          </DialogHeader>

          {!isLogin && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setRole('investor')}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all text-center ${
                role === 'investor'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                  : 'border-border bg-muted/30 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/10'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${role === 'investor' ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className={`font-bold text-sm leading-tight ${role === 'investor' ? 'text-orange-700 dark:text-orange-400' : 'text-foreground'}`}>Investor</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Find opportunities</p>
              </div>
            </button>

            <button
              onClick={() => setRole('brand_owner')}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all text-center ${
                role === 'brand_owner'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                  : 'border-border bg-muted/30 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/10'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${role === 'brand_owner' ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className={`font-bold text-sm leading-tight ${role === 'brand_owner' ? 'text-orange-700 dark:text-orange-400' : 'text-foreground'}`}>Brand Owner</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">List your brand</p>
              </div>
            </button>
          </div>
        )}

        {otpStage ? (
          <form onSubmit={handleOtpSubmit} className="space-y-6 py-2">
            <div className="space-y-4 text-center">
              <div className="h-16 w-16 mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Verify your number</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Code sent to +91 {formDataCache?.phone}
                </p>
                <p className="text-xs font-semibold text-orange-500 mt-1 bg-orange-50 dark:bg-orange-950/30 rounded-lg py-1 px-3 inline-block">Demo OTP: 111111</p>
              </div>
              <div className="flex justify-center gap-2 mt-6">
                {otpValue.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-border bg-muted/50 text-foreground focus:border-primary focus:bg-background focus:ring-0 transition-colors outline-none"
                    value={digit}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      const val = target.value.replace(/[^0-9]/g, '');
                      const newOtp = [...otpValue];
                      newOtp[index] = val;
                      setOtpValue(newOtp);
                      if (val && target.nextSibling) {
                        (target.nextSibling as HTMLInputElement).focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (e.key === 'Backspace' && !otpValue[index] && target.previousSibling) {
                        (target.previousSibling as HTMLInputElement).focus();
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-md">
              {loading ? 'Verifying...' : 'Verify & Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <button type="button" onClick={() => setOtpStage(false)} className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              ← Back to edit number
            </button>
            {!isLogin && (
              <button
                type="button"
                onClick={() => { setRole(role === 'investor' ? 'brand_owner' : 'investor'); setOtpStage(false); }}
                className="w-full text-center text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors mt-1"
              >
                Switch to {role === 'investor' ? 'Brand Owner' : 'Investor'} account instead
              </button>
            )}
          </form>
        ) : (
        <>
        {/* Google Login */}
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 rounded-xl border-border bg-background hover:bg-muted font-semibold flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              <span className="bg-background px-3">or use mobile number</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleInitialSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="phone" required className="pl-10 h-11 rounded-xl bg-muted/50 border-border" defaultValue="7569959475" placeholder="10-digit mobile number" />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {role === 'brand_owner' ? 'Authorized Person Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input name="name" required className="pl-10 h-11 rounded-xl bg-muted/50 border-border" placeholder="Enter your full name" />
                </div>
              </div>

              {role === 'brand_owner' && !isLogin && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Brand Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input name="brandName" required className="pl-10 h-11 rounded-xl bg-muted/50 border-border" placeholder="Official brand name" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Current Outlets</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input name="outletCount" type="number" required className="pl-10 h-11 rounded-xl bg-muted/50 border-border" placeholder="e.g. 5" />
                    </div>
                  </div>
                </div>
              )}

              {role === 'investor' && (
                <div className="space-y-3 pt-1">
                  <input type="hidden" name="interestType" value="brand" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Business Status</label>
                      <select name="isExistingBusiness" required className="flex h-11 w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">Select Status</option>
                        <option value="false">New to Business</option>
                        <option value="true">Existing Owner</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">State</label>
                      <select
                        name="state"
                        required
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select State</option>
                        {Object.keys(INDIA_STATES_DISTRICTS).sort().map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">District / City</label>
                      <select
                        name="district"
                        required
                        disabled={!selectedState}
                        className="flex h-11 w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      >
                        <option value="">Select District</option>
                        {selectedState && INDIA_STATES_DISTRICTS[selectedState]?.sort().map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Investment Sectors</label>
                    <div className="flex flex-wrap gap-2">
                      {BUSINESS_SECTORS.map((sector) => (
                        <button
                          key={sector}
                          type="button"
                          onClick={() => toggleSector(sector)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            selectedSectors.includes(sector)
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-muted text-muted-foreground border-border hover:border-orange-300 hover:text-orange-600'
                          }`}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Investment Range</label>
                    <select name="investmentRange" required className="flex h-11 w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Select Range</option>
                      {INVESTMENT_RANGES.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-md mt-2">
            {loading ? 'Processing...' : (isLogin ? 'Send OTP' : 'Create Account')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {!isLogin && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const demoUser = {
                  id: 'demo-user-local',
                  name: (new FormData(document.querySelector('form') as HTMLFormElement)).get('name') as string || 'Demo User',
                  email: (new FormData(document.querySelector('form') as HTMLFormElement)).get('email') as string || 'demo@example.com',
                  phone: '7569959475',
                  role,
                  isDemo: true,
                  isLoggedIn: true,
                  createdAt: new Date().toISOString()
                };
                setStoreUser(demoUser as any);
                onLogin(demoUser);
                onClose();
                toast.success("Entered in Demo Mode (Local Only)");
              }}
              className="w-full text-xs font-semibold text-muted-foreground hover:text-orange-600"
            >
              Skip — try demo mode
            </Button>
          )}

          {role === 'brand_owner' && !isLogin && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200 dark:border-orange-900">
              <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2">Prefer expert guidance?</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => { onClose(); toast.success("Our expert advisor will call you within 15 minutes."); }}
                className="w-full h-9 rounded-lg text-xs font-bold border-orange-300 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-950/40"
              >
                Get Expert Assistance
              </Button>
            </div>
          )}

        </form>
        </>
        )}

          <div className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); }}
              className="font-semibold text-orange-500 hover:text-orange-600 hover:underline"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <button
              onClick={() => setAdminMode(true)}
              className="text-[10px] font-semibold text-muted-foreground/50 hover:text-muted-foreground uppercase tracking-widest transition-colors"
            >
              Admin Access
            </button>
          </div>
          </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
