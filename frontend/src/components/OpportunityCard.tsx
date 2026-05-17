import React from 'react';
import { Opportunity } from '../types';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Building2, CheckCircle2, TrendingUp, MapPin, ArrowRight, Package, Heart, ShieldCheck, Flame, Scale, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: (id: string) => void;
  isInterested?: boolean;
  onToggleInterest?: (id: string) => void;
  matchingScore?: number;
  matchingReason?: string;
  isLoggedIn?: boolean;
  hideTypeBadge?: boolean;
}

export default function OpportunityCard({
  opportunity,
  onViewDetails,
  isInterested = false,
  onToggleInterest,
  matchingScore,
  matchingReason,
  isLoggedIn = false,
  hideTypeBadge = false,
}: OpportunityCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="group h-full flex flex-col overflow-hidden border-border bg-card transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-xl">
        <div className="p-4 flex flex-col flex-grow">
          {/* Header Section: Hero Image with Logo Overlay */}
          <div className="relative h-40 md:h-48 w-full rounded-lg border border-border overflow-hidden bg-muted mb-3 md:mb-5 group-hover:border-border/80 transition-colors">
            {/* Background Image */}
            <img
              src={opportunity.image || `https://picsum.photos/seed/${opportunity.id}/800/600`}
              alt={opportunity.brand_name || 'Brand Opportunity'}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            
            {/* Top-Left Logo Overlay */}
            <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 z-10 flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-12 md:w-12 bg-white rounded shadow-sm border border-slate-100 flex items-center justify-center p-1 md:p-1.5 ring-2 ring-white shrink-0">
                {(opportunity.brand_logo_url || opportunity.logo) ? (
                  <img 
                    src={opportunity.brand_logo_url || opportunity.logo} 
                    alt={opportunity.brand_name || 'Logo'} 
                    className="max-h-full max-w-full object-contain" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="text-slate-300"><Building2 className="h-4 w-4 md:h-6 md:w-6" /></div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                 <h3 className="text-white font-bold text-sm md:text-lg leading-none drop-shadow-md truncate">{opportunity.brand_name || 'Premium Brand'}</h3>
                 <p className="text-white/80 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-0.5 md:mt-1 drop-shadow-sm truncate">{opportunity.category}</p>
              </div>
            </div>

            {/* Top-Right Badges Overlay */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
              {opportunity.is_verified && (
                <div className="flex items-center gap-1.5 bg-green-600/95 backdrop-blur-sm text-white px-2.5 py-1 rounded-full shadow-lg border border-white/20">
                  <ShieldCheck className="h-3.5 w-3.5 fill-current" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                </div>
              )}
              
              {!hideTypeBadge && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border border-white/20 backdrop-blur-sm ${
                  opportunity.type === 'dealership' ? 'bg-amber-500/95 text-white' :
                  opportunity.type === 'distribution' ? 'bg-emerald-600/95 text-white' :
                  'bg-indigo-600/95 text-white'
                }`}>
                  {opportunity.type === 'dealership' ? <MapPin className="h-3 w-3" /> :
                   opportunity.type === 'distribution' ? <Package className="h-3 w-3" /> :
                   <Building2 className="h-3 w-3" />}
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {opportunity.type === 'dealership' ? 'Dealership' :
                     opportunity.type === 'distribution' ? 'Distribution' :
                     'Franchise'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 px-1 flex-grow">
            <div className="flex justify-between items-center mt-1">
              <div className="flex flex-col min-w-0 flex-1">
                 <h3 className="text-sm font-black text-foreground line-clamp-1 pr-2">{opportunity.brand_name || "Premium Brand"}</h3>
                 <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">
                   Verified Opportunity
                 </p>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg shrink-0">
                 <MapPin className="h-3 w-3" />
                 <span className="max-w-[60px] truncate">{opportunity.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 py-3 border-y border-border/60">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Investment</span>
                <p className="text-xs font-black text-foreground">
                  ₹{opportunity.minInvestment?.toLocaleString()} – {opportunity.maxInvestment?.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Space Req</span>
                <p className="text-xs font-black text-foreground">{opportunity.space_req || '200–500 sft'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Employees</span>
                <p className="text-xs font-black text-foreground">{opportunity.employees_req || '2–4 Members'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Presence</span>
                <p className="text-xs font-black text-foreground">{(opportunity as any).presenceCount?.split(' ')[0] || '100+'} Outlets</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Model</span>
                <p className="text-xs font-black text-foreground">{opportunity.businessModel || 'FOFO'}</p>
              </div>
            </div>
          </div>

          <div className="pt-5 px-1">
            <Button
              onClick={() => onViewDetails(opportunity.id)}
              aria-label={`View details for ${opportunity.brand_name || 'this opportunity'}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl font-bold transition-all text-xs shadow-sm group/btn active:scale-[0.98]"
            >
              View Details
              <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function VerificationDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-200'}`} />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
  );
}
