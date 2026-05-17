import React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Phone, User, MessageSquare, Clock, MapPin, CircleDollarSign, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { Label } from './ui/label';

interface CallRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'investor' | 'brand';
  user?: any;
}

export default function CallRequestModal({ isOpen, onClose, type, user }: CallRequestModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [budget, setBudget] = React.useState('2l-10l');
  const [preferredTime, setPreferredTime] = React.useState('anytime');
  const [step, setStep] = React.useState<'details' | 'otp' | 'success'>('details');
  const [otp, setOtp] = React.useState('');
  const [formData, setFormData] = React.useState<any>(null);

  const startOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const payload = {
      type,
      name: data.get('name') as string,
      phone: data.get('phone') as string,
      authorised_phone: data.get('authorised_phone') as string || '',
      budget,
      preferredTime,
      message: (data.get('message') as string) || '',
      city: (data.get('city') as string) || '',
      status: 'pending' as const,
      timestamp: new Date().toISOString(),
      userId: user?.id || null,
      userEmail: user?.email || null
    };
    
    setFormData(payload);
    setStep('otp');
    toast.info("OTP Sent!", {
      description: `A 6-digit verification code has been sent to ${payload.phone}`
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (otp !== '123456') { // Mock OTP
      toast.error("Invalid OTP", { description: "Please enter 123456 for testing." });
      setLoading(false);
      return;
    }

    try {
      await api.post('/callbacks', {
        ...formData,
        verified: true,
        otp_verified_at: new Date().toISOString()
      });

      setStep('success');
      toast.success("Verification Successful!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit callback request");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    setFormData(null);
    setOtp('');
    onClose();
  };

  if (step === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px] text-center p-12">
          <div className="flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Request Received!</h3>
              <p className="text-slate-500 font-medium">
                Our expert expansion team has been notified. You will get a call back on your verified number shortly.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full bg-slate-900 rounded-xl font-bold h-12">
              Got it, thanks!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (step === 'otp') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Verify Phone Number</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit code to <span className="font-bold text-slate-900">{formData?.phone}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleVerifyOtp} className="space-y-6 py-4 text-center">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enter 6-Digit OTP</Label>
              <Input 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="h-16 text-3xl text-center font-black tracking-[0.5em] rounded-2xl border-2 border-slate-100 focus:border-orange-500"
                placeholder="000000"
                required
              />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Testing? Use code: <span className="text-orange-600">123456</span>
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-slate-900 h-14 rounded-2xl font-black text-lg">
              {loading ? 'Verifying...' : 'Verify & Request Callback'}
            </Button>
            
            <button 
              type="button" 
              onClick={() => setStep('details')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
            >
              Go Back & Change Number
            </button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <Phone className="h-4 w-4" />
            </div>
            {type === 'investor' ? 'Expert Guidance' : 'Brand Expansion Support'}
          </DialogTitle>
          <DialogDescription>
            {type === 'investor' 
              ? "Confused about which brand to pick? Our consultants will guide you through the best options for your budget."
              : "Looking to scale your brand? Request a call with our expansion experts to discuss your growth strategy."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={startOtpVerification} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Brand / Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="name" required defaultValue={user?.name || ''} className="pl-10" placeholder="Enter name" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Phone Number (For OTP)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="phone" required type="tel" defaultValue={user?.phone || ''} className="pl-10" placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>

          {type === 'brand' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Authorised Contact Number</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input name="authorised_phone" required type="tel" className="pl-10" placeholder="Alternate official number" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold italic">Required for brand verification audits.</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Investment Budget</label>
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Select value={budget} onValueChange={setBudget} required>
                <SelectTrigger className="pl-10 h-11 rounded-xl">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-2l">Under ₹2 Lakh</SelectItem>
                  <SelectItem value="2l-10l">₹2L - ₹10 Lakh</SelectItem>
                  <SelectItem value="10l-50l">₹10L - ₹50 Lakh</SelectItem>
                  <SelectItem value="above-50l">₹50 Lakh +</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Preferred Time</label>
            <Select value={preferredTime} onValueChange={setPreferredTime}>
              <SelectTrigger className="w-full h-11 rounded-xl">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anytime">Anytime (10 AM - 7 PM)</SelectItem>
                <SelectItem value="morning">Morning (10 AM - 1 PM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (1 PM - 4 PM)</SelectItem>
                <SelectItem value="evening">Evening (4 PM - 7 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Brief Message (Optional)</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea 
                name="message"
                className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pl-10 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about your requirements..."
              />
            </div>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full bg-slate-950 hover:bg-slate-900 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest">
            {loading ? (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                Verifying...
              </span>
            ) : 'Send OTP & Request Callback'}
          </Button>
        </form>
        
        <DialogFooter className="sm:justify-center">
          <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest">
            Available Mon-Sat | 10:00 AM to 07:00 PM
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
