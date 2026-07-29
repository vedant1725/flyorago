import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Lock, CheckCircle, LifeBuoy,
  Plane, Package, CheckCircle2, Sparkles,
  ArrowRight, Shield, Zap
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

// ─── Trust Cards Data ─────────────────────────────────────────────────────────
const TRUST_CARDS = [
  {
    title: 'Verified Users',
    description: 'Every traveller and sender completes identity verification before using Flyorago.',
    icon: ShieldCheck,
    color: '#0d9488', // Teal
    light: 'rgba(13,148,136,0.08)',
    border: 'rgba(13,148,136,0.2)',
  },
  {
    title: 'Secure Escrow',
    description: 'Payments are held safely and released only after successful delivery confirmation.',
    icon: Lock,
    color: '#4f46e5', // Indigo
    light: 'rgba(79,70,229,0.08)',
    border: 'rgba(79,70,229,0.2)',
  },
  {
    title: 'Delivery Proof',
    description: 'Pickup and delivery are confirmed with OTP, status updates, and proof of handover.',
    icon: CheckCircle,
    color: '#059669', // Emerald
    light: 'rgba(5,150,105,0.08)',
    border: 'rgba(5,150,105,0.2)',
  },
  {
    title: 'Dispute Protection',
    description: 'Our support team helps resolve shipment issues fairly, quickly, and transparently.',
    icon: LifeBuoy,
    color: '#9333ea', // Purple
    light: 'rgba(147,51,234,0.08)',
    border: 'rgba(147,51,234,0.2)',
  },
];

const CTASection: React.FC = () => {
  const [sectionRef, inView] = useInView(0.1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-24 bg-white overflow-hidden"
      id="trust-safety"
      aria-label="Trust and Safety"
    >
      {/* ── Background Elements ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Outer Hero Card Container ── */}
        <div
          className="relative bg-gradient-to-br from-teal-50/40 via-white to-indigo-50/30 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-[0_16px_50px_rgba(15,23,42,0.06)] overflow-hidden"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(32px)',
            transition: 'all 0.75s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Top Rainbow Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-sky-400 via-indigo-500 to-purple-500" />

          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

            {/* ══════════════════════════════════════════════════════════
                LEFT SIDE: Featured Image & Live Trust Shield
            ══════════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[42%] relative shrink-0">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-md group">
                <img
                  src="/images/Built for Safe Global Shipping.png"
                  alt="Built for Safe Global Shipping"
                  className="w-full h-[320px] sm:h-[380px] object-contain object-center group-hover:scale-105 transition-transform duration-700 p-2"
                />

                {/* Glass Floating Security Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/80 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight">100% Identity Verified</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">Escrow & Fraud Protection</p>
                    </div>
                  </div>

                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                RIGHT SIDE: Trust & Safety Content + 4 Cards
            ══════════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[58%]">

              {/* Tag Badge */}
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                  <Shield size={12} className="text-teal-600" />
                  TRUST & SAFETY
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-3 leading-tight tracking-tight">
                Built for{' '}
                <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                  Safe Global Shipping
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium max-w-xl">
                Every package, traveller, and payment is protected through identity verification, secure escrow holding, and proof of handover.
              </p>

              {/* 4 Micro Trust Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                {TRUST_CARDS.map((card, idx) => {
                  const Icon = card.icon;
                  const isHovered = hoveredIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="group rounded-2xl p-4 cursor-default transition-all duration-300 flex items-start gap-3.5 overflow-hidden relative"
                      style={{
                        opacity: inView ? 1 : 0,
                        transform: inView ? 'translateY(0)' : 'translateY(20px)',
                        transition: `opacity 0.5s cubic-bezier(0.4,0,0.2,1) ${idx * 90}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${idx * 90}ms`,
                        background: isHovered ? card.light : '#ffffff',
                        border: `1.5px solid ${isHovered ? card.border : 'rgba(226,232,240,0.9)'}`,
                        boxShadow: isHovered ? `0 10px 28px rgba(0,0,0,0.05), 0 2px 8px ${card.light}` : '0 2px 6px rgba(15,23,42,0.02)',
                      }}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                        style={{
                          background: isHovered ? card.color : card.light,
                          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                        }}
                      >
                        <Icon size={18} style={{ color: isHovered ? '#ffffff' : card.color, transition: 'color 0.25s' }} />
                      </div>

                      {/* Text */}
                      <div>
                        <h3
                          className="font-bold text-[14px] mb-1 leading-tight transition-colors duration-200"
                          style={{ color: isHovered ? '#0f172a' : '#1e293b' }}
                        >
                          {card.title}
                        </h3>
                        <p className="text-[11.5px] text-slate-500 leading-snug font-medium">
                          {card.description}
                        </p>
                      </div>

                      {/* Accent Bottom Line */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300"
                        style={{
                          background: card.color,
                          opacity: isHovered ? 1 : 0,
                          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons & Badges — Clean Stacked Layout (Zero Overlap) */}
              <div className="pt-4 border-t border-slate-200/60 space-y-4">
                {/* Row 1: CTA Buttons */}
                <div className="flex items-center gap-3">
                  <Link
                    to="/signup"
                    className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Plane size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Post Trip</span>
                  </Link>

                  <Link
                    to="/signup"
                    className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-extrabold text-xs shadow-xs hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Package size={14} />
                    <span>Send Package</span>
                  </Link>
                </div>

                {/* Row 2: Trust Pills (Dedicated Full-Width Strip) */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    'KYC Verified',
                    'Escrow Protected',
                    'Delivery Confirmed',
                    'Support Available',
                  ].map((badge, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-600 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 size={12} className="text-teal-600" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default CTASection;
