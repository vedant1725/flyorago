import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Lock, Navigation, PackageCheck,
  Star, Globe, Plane, UserCheck,
  Check, ArrowRight, Sparkles, Zap,
  CheckCircle2, Shield
} from 'lucide-react';

// ─── useInView hook ───────────────────────────────────────────────────────────
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

// ─── Trust Feature Cards data ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon: UserCheck, title: 'KYC Verified Travellers',
    desc: 'Every traveller is identity verified before accepting parcel requests.',
    color: '#0d9488', light: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.18)',
  },
  {
    icon: Lock, title: 'Escrow Protected Payments',
    desc: 'Payments stay protected until delivery is successfully confirmed.',
    color: '#4f46e5', light: 'rgba(79,70,229,0.08)', border: 'rgba(79,70,229,0.18)',
  },
  {
    icon: Navigation, title: 'Smart Route Matching',
    desc: 'Match packages with travellers already flying on the same route.',
    color: '#9333ea', light: 'rgba(147,51,234,0.08)', border: 'rgba(147,51,234,0.18)',
  },
  {
    icon: PackageCheck, title: 'Secure Delivery Process',
    desc: 'Pickup, transit, and delivery steps are tracked with confirmation.',
    color: '#059669', light: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.18)',
  },
  {
    icon: Star, title: 'Transparent Reviews',
    desc: 'Ratings and reviews help build a trusted global community.',
    color: '#d97706', light: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.18)',
  },
  {
    icon: Globe, title: 'Global Community',
    desc: 'Connect with travellers and senders across international routes.',
    color: '#0284c7', light: 'rgba(2,132,199,0.08)', border: 'rgba(2,132,199,0.18)',
  },
];

// ─── Timeline steps with precise details ──────────────────────────────────────
const TIMELINE = [
  { label: 'Traveller Verified', sub: 'Passport & Identity Checked', color: '#0d9488', icon: UserCheck, badge: 'KYC ✓' },
  { label: 'Package Accepted', sub: 'Dimensions & Weight Agreed', color: '#4f46e5', icon: PackageCheck, badge: 'Confirmed' },
  { label: 'Escrow Activated', sub: 'Funds Locked in Smart Vault', color: '#9333ea', icon: Lock, badge: 'Protected' },
  { label: 'In Transit', sub: 'Live Flight & GPS Track Active', color: '#d97706', icon: Plane, badge: 'Live Track' },
  { label: 'Delivered', sub: 'OTP & Signature Confirmed', color: '#059669', icon: Check, badge: 'On-Time' },
  { label: 'Payment Released', sub: 'Instant Payout to Traveller', color: '#0d9488', icon: Sparkles, badge: 'Paid Out ✓' },
];

// ─── Feature Card Component ───────────────────────────────────────────────────
const FeatureCard: React.FC<{ f: typeof FEATURES[0]; idx: number; inView: boolean }> = ({ f, idx, inView }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = f.icon;
  return (
    <div
      className="group relative rounded-2xl p-5 cursor-default transition-all duration-400 overflow-hidden"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
        transition: `opacity 0.55s cubic-bezier(0.4,0,0.2,1) ${idx * 75}ms, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${idx * 75}ms`,
        background: hovered ? f.light : '#ffffff',
        border: `1.5px solid ${hovered ? f.border : 'rgba(226,232,240,0.9)'}`,
        boxShadow: hovered
          ? `0 14px 36px rgba(0,0,0,0.06), 0 4px 12px ${f.light}`
          : '0 2px 8px rgba(0,0,0,0.03)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 transition-all duration-300"
        style={{
          background: hovered ? f.color : f.light,
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <Icon size={18} style={{ color: hovered ? '#ffffff' : f.color, transition: 'color 0.25s' }} />
      </div>

      {/* Content */}
      <h3
        className="font-bold text-[14px] mb-1.5 leading-snug transition-colors duration-250"
        style={{ color: hovered ? '#0f172a' : '#1e293b' }}
      >
        {f.title}
      </h3>
      <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{f.desc}</p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-400"
        style={{
          background: f.color,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
        }}
      />
    </div>
  );
};

// ─── Clean Animated Route Bar (No Clipping) ───────────────────────────────────
const RouteFlightBar: React.FC<{ inView: boolean }> = ({ inView }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const interval = setInterval(() => {
      current += 0.9;
      if (current > 100) current = 0;
      setProgress(current);
    }, 30);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/60">
      {/* Airport Route Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
          <span className="font-extrabold text-slate-800 text-[12px]">NY (JFK)</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/80">
          <Plane size={10} className="text-teal-600" />
          <span>Direct Flight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-slate-800 text-[12px]">London (LHR)</span>
          <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
        </div>
      </div>

      {/* Track Bar */}
      <div className="relative h-5 flex items-center px-1">
        {/* Track Line */}
        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-sky-400 to-indigo-500 rounded-full"
            style={{ width: `${progress}%`, transition: 'width 0.07s linear' }}
          />
        </div>

        {/* Gliding Airplane Icon */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `calc(${Math.min(Math.max(progress, 4), 94)}% - 10px)` }}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-sm text-white border border-white">
            <Plane size={9} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WhyChoose: React.FC = () => {
  const [sectionRef, inView] = useInView(0.08);
  const [cardRef, cardInView] = useInView(0.1);
  const [activeTimeline, setActiveTimeline] = useState(-1);

  // Animate timeline steps sequentially when in view
  useEffect(() => {
    if (!cardInView) return;
    let i = 0;
    const interval = setInterval(() => {
      setActiveTimeline(i);
      i++;
      if (i >= TIMELINE.length) {
        clearInterval(interval);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [cardInView]);

  return (
    <section
      className="relative py-20 lg:py-24 overflow-hidden bg-slate-50/50"
      id="why-choose"
      aria-label="Why choose Flyorago"
    >
      {/* Subtle Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[450px] h-[450px] rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={sectionRef} className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-stretch">

          {/* ══════════════════════════════════════════════════════════
              LEFT — Header + Feature Grid (55% Width)
          ══════════════════════════════════════════════════════════ */}
          <div className="w-full lg:w-[55%] flex flex-col justify-between">

            <div>
              {/* Tag Badge */}
              <div
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 font-extrabold text-[10px] uppercase tracking-widest mb-4">
                  <Zap size={12} className="text-teal-600" />
                  WHY FLYORAGO?
                </span>

                {/* Section Title */}
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 mb-3.5 leading-[1.15] tracking-tight">
                  Built on{' '}
                  <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                    Trust.
                  </span>
                  <br />
                  Designed for{' '}
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Global Delivery.
                  </span>
                </h2>

                {/* Subtitle */}
                <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed mb-6 max-w-xl font-medium">
                  Flyorago connects verified travellers and senders through a{' '}
                  <strong className="text-teal-700 font-semibold">secure, transparent,</strong> and technology-driven delivery experience.
                </p>
              </div>

              {/* 2×3 Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {FEATURES.map((f, idx) => (
                  <FeatureCard key={idx} f={f} idx={idx} inView={inView} />
                ))}
              </div>
            </div>

            {/* Bottom CTA Actions */}
            <div
              className="mt-7 flex items-center gap-4 flex-wrap"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1) 500ms',
              }}
            >
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <Sparkles size={13} />
                <span>Get Started Free</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-teal-600 transition-colors group"
              >
                See how it works <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT — Ultra-Clean, Zero-Overlap Timeline Card (45% Width)
          ══════════════════════════════════════════════════════════ */}
          <div
            ref={cardRef}
            className="w-full lg:w-[45%] flex"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateX(0)' : 'translateX(30px)',
              transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 150ms',
            }}
          >
            <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col justify-between">

              <div>
                {/* Card Header Bar */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 via-white to-teal-50/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 shadow-sm flex-shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[16px] text-slate-900 leading-tight">Shipment Trust</h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Live Delivery Security Engine</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-700 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-[10px] font-extrabold tracking-wide uppercase">Active</span>
                    </div>
                  </div>

                  {/* Clean Badges Row */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-100 text-teal-700 font-bold text-[10px]">
                      🔒 Escrow Protected
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px]">
                      🛡️ KYC Verified
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-100 text-purple-700 font-bold text-[10px]">
                      📡 Live GPS
                    </span>
                  </div>
                </div>

                {/* Animated Flight Route Bar */}
                <div className="p-4 border-b border-slate-100">
                  <RouteFlightBar inView={cardInView} />
                </div>

                {/* ─── Ultra-Clean Modular Stepper Timeline ─────────────────── */}
                <div className="p-5 space-y-0">
                  {TIMELINE.map((step, idx) => {
                    const Icon = step.icon;
                    const isPassed = idx <= activeTimeline;
                    const isActive = idx === activeTimeline;
                    const isLast = idx === TIMELINE.length - 1;

                    return (
                      <div key={idx} className="flex items-stretch gap-3.5 group">
                        {/* Column 1: Step Circle Icon + Perfect Connecting Vertical Line Segment */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          {/* Circle Icon */}
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 flex-shrink-0 z-10"
                            style={{
                              background: isPassed ? step.color : '#f1f5f9',
                              color: isPassed ? '#ffffff' : '#94a3b8',
                              boxShadow: isActive ? `0 0 0 3px ${step.color}28, 0 3px 10px ${step.color}35` : 'none',
                            }}
                          >
                            <Icon size={12} />
                          </div>

                          {/* Line segment connecting to next step (NO hardcoded pixel left offsets!) */}
                          {!isLast && (
                            <div
                              className="w-[2px] flex-1 my-1 rounded-full transition-colors duration-400"
                              style={{
                                background: isPassed && idx < activeTimeline
                                  ? step.color
                                  : '#e2e8f0',
                                minHeight: '22px',
                              }}
                            />
                          )}
                        </div>

                        {/* Column 2: Title & Subtitle */}
                        <div className={`flex-1 min-w-0 ${!isLast ? 'pb-3.5' : 'pb-0'}`}>
                          <p
                            className="text-[13px] font-extrabold leading-tight transition-colors duration-300"
                            style={{ color: isPassed ? '#0f172a' : '#94a3b8' }}
                          >
                            {step.label}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium leading-none mt-1 truncate">
                            {step.sub}
                          </p>
                        </div>

                        {/* Column 3: Status Badge */}
                        <div className={`flex-shrink-0 ${!isLast ? 'pb-3.5' : 'pb-0'} flex items-start`}>
                          {isPassed ? (
                            <span
                              className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border"
                              style={{
                                background: `${step.color}10`,
                                color: step.color,
                                borderColor: `${step.color}30`,
                              }}
                            >
                              {step.badge}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-300">Pending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Escrow Guarantee Banner — Cleanly Separated */}
                <div className="px-5 pb-3 pt-1">
                  <div className="bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-indigo-50/60 border border-teal-200/70 rounded-2xl p-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                        <CheckCircle2 size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 leading-tight">Escrow Guarantee</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">100% Refundable Protection</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-teal-600 text-white px-2 py-0.5 rounded-md flex-shrink-0">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Trust Metrics Bar */}
              <div className="p-4 bg-slate-50/90 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[15px] font-black text-teal-600">99.2%</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">On-Time</p>
                </div>
                <div className="border-x border-slate-200/70 px-1">
                  <p className="text-[15px] font-black text-indigo-600">100%</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">KYC Checked</p>
                </div>
                <div>
                  <p className="text-[15px] font-black text-amber-600">4.9★</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Rating</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
