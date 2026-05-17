import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, TrendingUp, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from './ui/button';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-12 border-t border-slate-900">
      <div className="container-safe">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white/10 rounded flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight serif uppercase">SCALE<span className="text-white opacity-50 font-sans font-black tracking-tighter">UP</span></span>
            </div>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed font-normal">
              The institutional-grade platform for strategic brand expansion in the world's fastest-growing economy. We build high-yield brand partner ecosystems.
            </p>
            <div className="flex gap-2">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Instagram, label: 'Instagram' }
              ].map(social => (
                <button 
                  key={social.label} 
                  className="h-10 w-10 border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center rounded-lg transition-all"
                  title={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">Marketplace</h4>
            <ul className="space-y-2">
              {['Premium Brands', 'Growth Opportunities', 'Managed Verticals', 'Corporate Ventures'].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-xs font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">Resources</h4>
            <ul className="space-y-2">
              {['Investment Guide', 'Due Diligence Report', 'Market Intelligence', 'Strategic Support'].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors text-xs font-medium">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 py-8 border-y border-white/5 mb-12">
          <div className="flex items-center gap-4 md:p-4">
            <div className="h-10 w-10 rounded border border-white/10 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Corporate Hotline</p>
              <p className="text-lg font-bold tracking-tight text-white serif italic">+91 75699 59475</p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:p-4 md:justify-end">
            <div className="h-10 w-10 rounded border border-white/10 flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Electronic Correspondence</p>
              <p className="text-lg font-bold tracking-tight text-white serif italic">desk@scaleup.solutions</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 italic serif">© 2024 ScaleUp Solutions. India Portfolio.</p>
          <div className="flex items-center gap-4 md:p-4">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
              <ShieldCheck className="h-3 w-3 text-slate-600" />
              Verified Escrow
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
              <ShieldCheck className="h-3 w-3 text-slate-600" />
              GDPR Compliant
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
