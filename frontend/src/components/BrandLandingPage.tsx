import React from 'react';
import { 
  Plus, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Zap, 
  MessageSquare, 
  ArrowRight,
  CheckCircle2,
  Building2,
  Globe,
  ChartBar,
  Star
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';

interface BrandLandingPageProps {
  onStartSignUp: () => void;
  isLoggedIn: boolean;
  onGoToDashboard: () => void;
}

export default function BrandLandingPage({ onStartSignUp, isLoggedIn, onGoToDashboard }: BrandLandingPageProps) {
  const benefits = [
    {
      icon: <Zap className="h-6 w-6 text-brand-indigo" />,
      title: "Free Lifetime Listing",
      description: "No subscription fees. List your franchise, dealership or distribution models for free forever."
    },
    {
      icon: <Users className="h-6 w-6 text-brand-indigo" />,
      title: "Qualified Leads Only",
      description: "We filter investors based on budget, city, and available space. No more junk calls or spam."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-brand-indigo" />,
      title: "Internal Chat System",
      description: "Manage all your leads and conversations within our app. Keep your personal WhatsApp private."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-brand-indigo" />,
      title: "Trust & Verification",
      description: "Get 'Verified' badges by uploading documents. Verified brands get 3x more enquiries."
    },
    {
      icon: <Globe className="h-6 w-6 text-brand-indigo" />,
      title: "Nationwide Reach",
      description: "Reach potential partners in Tier 2 and Tier 3 cities across all Indian states."
    },
    {
      icon: <ChartBar className="h-6 w-6 text-brand-indigo" />,
      title: "Lead Dashboard",
      description: "Monitor your expansion progress with our powerful lead management dashboard."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Profile",
      description: "Sign up and build your brand profile in under 2 minutes."
    },
    {
      number: "02",
      title: "List Opportunities",
      description: "Add your franchise, dealership, or agency models with photos."
    },
    {
      number: "03",
      title: "Receive Leads",
      description: "Get real-time alerts when qualified investors show interest."
    },
    {
      number: "04",
      title: "Expand Faster",
      description: "Chat with leads directly and sign up new partners."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-10 md:pt-20 md:pb-16 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,115,232,0.05),transparent)] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-brand-indigo/10 text-brand-indigo hover:bg-brand-indigo/20 border-none rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest mb-6">
              For Brands & Franchisors
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
              The Largest Marketplace to <br />
              <span className="text-brand-indigo">Find New Partners in India</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
              Stop chasing cold leads. Bharat Brand connects you with qualified investors from Tier 2 and Tier 3 cities who are ready to invest in your brand.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <Button 
                  onClick={onGoToDashboard}
                  className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-16 px-10 text-lg font-black shadow-2xl shadow-slate-900/20 w-full sm:w-auto"
                >
                  Go to Brand Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  onClick={onStartSignUp}
                  className="bg-brand-indigo text-white hover:bg-brand-indigo/90 rounded-2xl h-16 px-10 text-lg font-black shadow-2xl shadow-brand-indigo/20 w-full sm:w-auto"
                >
                  List Your Brand For FREE
                  <Plus className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span className="font-bold text-slate-900">500+ Active Brands</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="font-bold text-slate-900">20k+ Verified Investors</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span className="font-bold text-slate-900">Verified Marketplace</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 px-10">Why Brands Trust Bharat Brand</h2>
            <p className="text-slate-500 font-medium">Built for rapid expansion in the Indian market.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-brand-indigo/10 group-hover:scale-110 transition-all">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote / Stats */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-indigo/10 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
              "We received more qualified ROI from Tier 3 cities in 2 months than we did through offline consultants in a year."
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">— Leading F&B Chain Partner</p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 px-10">4 Steps to Your Next Partner</h2>
            <p className="text-slate-500 font-medium">Simple, transparent, and built for speed.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-[28px] left-[50%] w-full h-[2px] bg-slate-100 -z-10" />
                )}
                <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-brand-indigo font-black text-xl mb-6 shadow-sm group-hover:bg-brand-indigo group-hover:text-white transition-all">
                  {step.number}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-4xl bg-white rounded-[3rem] p-12 md:p-20 text-center border border-slate-100 shadow-2xl shadow-slate-200/50">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Ready to expand your brand?</h2>
          <p className="text-xl text-slate-500 font-medium mb-10">Join 500+ successful brands listing their growth opportunities on Bharat Brand.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Button 
                onClick={onGoToDashboard}
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-16 px-10 text-lg font-black shadow-2xl shadow-slate-900/20 w-full sm:w-auto"
              >
                Access Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button 
                onClick={onStartSignUp}
                className="bg-brand-indigo text-white hover:bg-brand-indigo/90 rounded-2xl h-16 px-10 text-lg font-black shadow-2xl shadow-brand-indigo/20 w-full sm:w-auto"
              >
                List Brand For Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
          <p className="mt-6 text-sm text-slate-400 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}
