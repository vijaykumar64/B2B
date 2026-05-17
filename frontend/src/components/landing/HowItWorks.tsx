import { motion } from 'motion/react';
import { Search, FileText, Rocket } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    number: '01',
    title: 'Browse Opportunities',
    description: 'Explore 500+ verified franchises, dealerships, and distribution opportunities across India — filtered by location, investment range, and category.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: FileText,
    number: '02',
    title: 'Apply in Minutes',
    description: 'Submit your investor profile with a single click. No lengthy paperwork — our AI matches you with the best-fit brands based on your interests.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Rocket,
    number: '03',
    title: 'Launch Your Business',
    description: 'Connect directly with brand owners, complete onboarding, and launch your franchise or dealership with full backend support from day one.',
    color: 'bg-green-50 text-green-600',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HowItWorks() {
  return (
    <section className="py-12 md:py-16 bg-white border-b border-slate-100">
      <div className="container-safe">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-green-700">How it works</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
            From Browse to <span className="text-green-600 italic">Launch</span> in 3 Steps
          </h2>
          <p className="text-slate-500 font-medium mt-3 max-w-xl mx-auto">
            India's simplest path to business ownership — no intermediaries, no hidden fees.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative"
        >
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-slate-100 z-0" />

          {STEPS.map((step) => (
            <motion.div key={step.number} variants={itemVariants} className="relative z-10">
              <div className="bg-white rounded-3xl border-2 border-slate-100 p-7 hover:border-slate-200 hover:shadow-lg transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.color} group-hover:scale-110 transition-transform`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-5xl font-black text-slate-100 leading-none mt-1">{step.number}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
