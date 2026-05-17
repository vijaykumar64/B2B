import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Briefcase, UserCog, ShieldCheck, MessageSquare, TrendingUp } from 'lucide-react';

const faqs = [
  {
    question: "Is this platform free for Investors?",
    answer: "Yes, our platform is 100% free for individual investors. You can browse, research, and directly connect with multi-brand opportunities without any consultancy charges.",
    icon: <HelpCircle className="h-5 w-5 text-orange-600" />
  },
  {
    question: "How do I verify a Brand's authenticity?",
    answer: "Look for the green 'Verified' badge. This indicates the brand has undergone our multi-layer vetting process, including GST verification, operational audits, and fiscal health modeling.",
    icon: <ShieldCheck className="h-5 w-5 text-blue-600" />
  },
  {
    question: "What is the difference between FOFO and COCO?",
    answer: "FOFO (Franchise Owned Franchise Operated) means you run the daily business. COCO (Company Owned Company Operated) usually means you are a silent investor while the brand manages operations and shares profits.",
    icon: <Briefcase className="h-5 w-5 text-indigo-600" />
  },
  {
    question: "How do I communicate with the Brands?",
    answer: "Once you show interest or apply, an internal secure chat is opened. We never expose your private mobile number to brands immediately; all initial vetting happens within our professional workspace.",
    icon: <MessageSquare className="h-5 w-5 text-green-600" />
  },
  {
    question: "What if I have no prior business experience?",
    answer: "Most brands we list provide comprehensive training, SOP manuals, and marketing support. We also offer an AI Business Consultant ('Scaling Guru') within the app to help you understand market trends.",
    icon: <TrendingUp className="h-5 w-5 text-purple-600" />
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-slate-50">
      <div className="container-safe max-w-4xl">
        <div className="mb-16 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full">Help Center</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-6 tracking-tight">Investor <span className="text-orange-600">FAQs</span></h2>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto font-bold">
            Essential intelligence for sophisticated investors navigating the Indian franchise and distribution ecosystem.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-3xl border-2 transition-all duration-300 ${openIndex === index ? 'border-orange-600 shadow-xl shadow-orange-100' : 'border-slate-100'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${openIndex === index ? 'bg-orange-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                    {faq.icon}
                  </div>
                  <span className={`text-sm md:text-base font-black uppercase tracking-tight transition-colors ${openIndex === index ? 'text-slate-900' : 'text-slate-500 group-hover:text-black'}`}>
                    {faq.question}
                  </span>
                </div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${openIndex === index ? 'bg-orange-600 text-white rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 pt-2 ml-14">
                      <p className="text-slate-600 leading-relaxed font-bold text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
