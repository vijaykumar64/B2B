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
import { Label } from './ui/label';
import { Phone, User, MapPin, Building2, TrendingUp, Briefcase, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { User as UserType } from '../types';
import { INDIA_STATES_DISTRICTS, INVESTMENT_RANGES } from '../constants';

interface CompleteProfileModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompleteProfileModal({ user, isOpen, onClose }: CompleteProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(user.phone || '');
  const [selectedState, setSelectedState] = useState(user.state || '');
  const [selectedDistrict, setSelectedDistrict] = useState(user.district || '');
  const [role, setRole] = useState<'investor' | 'brand_owner' | 'admin'>(user.role || 'investor');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(fd.entries());

      const updateData: any = {
        phone: phone.replace(/\s+/g, ''),
        role: role,
        updatedAt: new Date().toISOString(),
      };

      if (role === 'investor') {
        updateData.state = data.state;
        updateData.district = data.district;
        updateData.investment_range = data.investmentRange;
        updateData.isExistingBusiness = data.isExistingBusiness === 'true';
        updateData.location = `${data.district}, ${data.state}`;
      } else {
        updateData.brandName = data.brandName;
        updateData.outletCount = data.outletCount;
      }

      await api.patch(`/users/${user.id}`, updateData);
      toast.success("Profile completed successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-3xl">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              Complete Your Profile
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              We need a few more details to help you find the best business opportunities in India.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection (If not set or to confirm) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('investor')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === 'investor' 
                    ? 'border-orange-600 bg-orange-50/50' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <TrendingUp className={`h-6 w-6 ${role === 'investor' ? 'text-orange-600' : 'text-slate-400'}`} />
                <span className="text-xs font-black uppercase tracking-widest">Investor</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('brand_owner')}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === 'brand_owner' 
                    ? 'border-orange-600 bg-orange-50/50' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <Briefcase className={`h-6 w-6 ${role === 'brand_owner' ? 'text-orange-600' : 'text-slate-400'}`} />
                <span className="text-xs font-black uppercase tracking-widest">Brand Owner</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Mobile Number (Verified WhatsApp)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input 
                    name="phone" 
                    required 
                    className="pl-10 h-12 rounded-xl focus:ring-orange-600" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit number" 
                  />
                </div>
              </div>

              {role === 'investor' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">State</Label>
                      <select 
                        name="state" 
                        required 
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:opacity-50"
                      >
                        <option value="">Select State</option>
                        {Object.keys(INDIA_STATES_DISTRICTS).sort().map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">District / City</Label>
                      <select 
                        name="district" 
                        required 
                        disabled={!selectedState}
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:opacity-50 disabled:bg-slate-50"
                      >
                        <option value="">Select District</option>
                        {selectedState && INDIA_STATES_DISTRICTS[selectedState]?.sort().map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Investment Budget</Label>
                    <select name="investmentRange" required className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm focus:ring-2 focus:ring-orange-600 outline-none">
                      <option value="">Select Budget Choice</option>
                      {INVESTMENT_RANGES.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Business Experience</Label>
                    <select name="isExistingBusiness" required className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm focus:ring-2 focus:ring-orange-600 outline-none">
                      <option value="false">I am starting my first business</option>
                      <option value="true">I am an existing business owner</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Brand Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input name="brandName" required className="pl-10 h-12 rounded-xl" placeholder="Official Business Title" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Total Outlets / Showrooms</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input name="outletCount" type="number" required className="pl-10 h-12 rounded-xl" placeholder="Ex: 5" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-200 text-white"
            >
              {loading ? 'Saving Details...' : 'Complete Profile & Explore'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
