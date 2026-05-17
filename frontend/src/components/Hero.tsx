import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ChevronDown, TrendingUp, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { useCountUp } from '../hooks/useCountUp';

interface HeroProps {
  onCallRequest: () => void;
  onGetStarted?: (role: 'investor' | 'brand_owner') => void;
}

const STATS = [
  { label: 'Active Brands', target: 500, suffix: '+', duration: 1500 },
  { label: 'Investors', target: 10000, suffix: '+', duration: 2000 },
  { label: 'Cities Covered', target: 50, suffix: '+', duration: 1000 },
];

function StatCounter({ target, suffix, label, duration }: { target: number; suffix: string; label: string; duration: number }) {
  const { ref, value } = useCountUp(target, duration);
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className="text-2xl md:text-3xl font-black text-white"
      >
        {value.toLocaleString('en-IN')}{suffix}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
}

export default function Hero({ onCallRequest, onGetStarted }: HeroProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  return (
    <div className="relative py-10 md:py-16 min-h-[300px] w-full overflow-hidden flex items-center bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      <div className="container-safe relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="flex flex-col gap-6 w-full max-w-5xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                <ShieldCheck className="h-3 w-3 text-brand-indigo" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                  India's Trusted Business Directory
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl text-white font-black leading-[1.1] tracking-tight">
                Find Your Perfect <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  Business Opportunity
                </span>
              </h1>
              <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
                Connect with verified brands, secure dealership rights, and launch profitable business ventures across India's Tier 2 and Tier 3 cities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="relative" ref={pickerRef}>
                <Button
                  onClick={() => setShowPicker(!showPicker)}
                  className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20"
                >
                  Get Started <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                {showPicker && (
                  <div className="absolute top-16 left-0 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => { onGetStarted?.('investor'); setShowPicker(false); }}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-blue-50 transition-colors text-left group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">Investor</p>
                        <p className="text-[10px] text-slate-500 font-medium">Find franchise opportunities</p>
                      </div>
                    </button>
                    <div className="h-px bg-slate-100 mx-4" />
                    <button
                      onClick={() => { onGetStarted?.('brand_owner'); setShowPicker(false); }}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-orange-50 transition-colors text-left group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                        <Briefcase className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">Brand Owner</p>
                        <p className="text-[10px] text-slate-500 font-medium">List your business opportunity</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Animated stats strip */}
            <div className="flex items-center gap-8 md:gap-16 pt-8 border-t border-white/5 mt-4">
              {STATS.map((stat) => (
                <StatCounter key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
}
