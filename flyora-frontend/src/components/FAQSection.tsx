import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, MessageCircleQuestion, HelpCircle,
  ShieldCheck, Lock, Package, CheckCircle2,
  Sparkles, ArrowRight, LifeBuoy, MessageSquare
} from 'lucide-react';

// ─── useInView Hook ───────────────────────────────────────────────────────────
function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── FAQ Items Data ───────────────────────────────────────────────────────────
const FAQS = [
  {
    category: 'verification',
    catLabel: 'Verification',
    question: 'How do you verify travellers?',
    answer: 'Every traveller must complete a strict government ID verification, phone verification, and a live selfie check before they can accept any package requests.',
    icon: ShieldCheck,
    color: '#0d9488',
  },
  {
    category: 'payments',
    catLabel: 'Payments',
    question: 'Are my payments safe?',
    answer: 'Absolutely. We use a secure escrow system. Your payment is securely held and only released to the traveller once you confirm successful delivery.',
    icon: Lock,
    color: '#4f46e5',
  },
  {
    category: 'items',
    catLabel: 'Allowed Items',
    question: 'What items can I send?',
    answer: 'You can send documents, electronics, gifts, and personal items. Prohibited items like dangerous goods, liquids, or illegal substances are strictly forbidden.',
    icon: Package,
    color: '#0284c7',
  },
  {
    category: 'delivery',
    catLabel: 'Delivery & OTP',
    question: 'How is the delivery confirmed?',
    answer: 'When the traveller arrives, they will ask for a unique OTP code provided to the receiver to ensure the package reaches the exact correct person.',
    icon: CheckCircle2,
    color: '#059669',
  },
  {
    category: 'support',
    catLabel: 'Support & Help',
    question: 'What happens if a package is delayed or damaged?',
    answer: 'Flyorago provides 24/7 dispute resolution and shipment coverage. Payments remain protected in escrow until all issues are resolved fairly.',
    icon: LifeBuoy,
    color: '#9333ea',
  },
];

const FAQSection: React.FC = () => {
  const [sectionRef, inView] = useInView(0.1);
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredFaqs = activeTab === 'all'
    ? FAQS
    : FAQS.filter(f => f.category === activeTab);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-24 bg-slate-50/60 overflow-hidden"
      id="faq"
      aria-label="Frequently Asked Questions"
    >
      {/* ── Background Glow ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* ══════════════════════════════════════════════════════════
              LEFT SIDE: FAQ Header & Accordion List (58% Width)
          ══════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[58%]">

            {/* Header */}
            <div
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-700 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                  <MessageCircleQuestion size={13} className="text-teal-600" />
                  GOT QUESTIONS?
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 mb-3.5 leading-tight tracking-tight">
                Frequently Asked <br />
                <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed mb-6 font-medium">
                Everything you need to know about shipping, earning, and escrow protection with Flyorago.
              </p>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap mb-8">
                {[
                  { id: 'all', label: 'All Questions' },
                  { id: 'verification', label: 'Verification' },
                  { id: 'payments', label: 'Payments' },
                  { id: 'items', label: 'Allowed Items' },
                  { id: 'delivery', label: 'Delivery & OTP' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-sm scale-[1.02]'
                        : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3.5">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                const Icon = faq.icon;

                return (
                  <div
                    key={idx}
                    className="group rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer relative"
                    style={{
                      opacity: inView ? 1 : 0,
                      transform: inView ? 'translateY(0)' : 'translateY(20px)',
                      transition: `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 80}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${idx * 80}ms, border-color 0.3s, box-shadow 0.3s`,
                      background: '#ffffff',
                      borderColor: isOpen ? faq.color : 'rgba(226,232,240,0.9)',
                      boxShadow: isOpen
                        ? `0 12px 32px rgba(15,23,42,0.06), 0 2px 8px ${faq.color}15`
                        : '0 2px 8px rgba(15,23,42,0.02)',
                    }}
                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  >
                    {/* Left Accent Color Bar when open */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-1 transition-all duration-300"
                      style={{
                        background: faq.color,
                        opacity: isOpen ? 1 : 0,
                      }}
                    />

                    {/* Question Row */}
                    <div className="p-5 flex items-center justify-between gap-4 select-none">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                          style={{
                            background: isOpen ? faq.color : `${faq.color}12`,
                            color: isOpen ? '#ffffff' : faq.color,
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <span
                            className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1 inline-block"
                            style={{ background: `${faq.color}12`, color: faq.color }}
                          >
                            {faq.catLabel}
                          </span>
                          <h3 className="font-extrabold text-[15px] text-slate-900 leading-snug">
                            {faq.question}
                          </h3>
                        </div>
                      </div>

                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 bg-slate-100"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          background: isOpen ? `${faq.color}15` : '#f1f5f9',
                          color: isOpen ? faq.color : '#64748b',
                        }}
                      >
                        <ChevronDown size={16} />
                      </div>
                    </div>

                    {/* Answer Collapsible Body */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0 pb-0'
                      }`}
                    >
                      <div className="overflow-hidden px-5 pl-[60px]">
                        <p className="text-[13.5px] text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3.5">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT SIDE: Support Image & Help Card (42% Width)
          ══════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[42%] lg:pt-12">
            <div
              className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.06)] group"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateX(0)' : 'translateX(30px)',
                transition: 'all 0.75s cubic-bezier(0.34,1.56,0.64,1) 200ms',
              }}
            >
              {/* FAQ Custom Image */}
              <div className="relative p-3 bg-gradient-to-b from-teal-50/50 via-white to-indigo-50/30">
                <img
                  src="/images/FAQ SECTION.png"
                  alt="Flyorago Global Support Team"
                  className="w-full h-auto max-h-[460px] object-contain object-center group-hover:scale-105 transition-transform duration-700 rounded-2xl"
                />
              </div>

              {/* Live Support Help Box inside Card */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">Still have questions?</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">24/7 Support Team is ready</p>
                  </div>
                </div>

                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-teal-600 transition-colors shrink-0 shadow-xs"
                >
                  <span>Contact Support</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Bottom Rainbow Hover Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQSection;
