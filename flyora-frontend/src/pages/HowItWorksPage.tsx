import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  PlaneTakeoff, PackageCheck, Wallet,
  Box, Map, Smartphone, ShieldCheck,
  Star, Globe, CreditCard, Sparkles, ArrowRight,
  Zap, CheckCircle2, Lock, Navigation, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

// ─── Step Data ────────────────────────────────────────────────────────────────
const TRAVELER_STEPS = [
  {
    id: '01',
    title: 'List Your Trip',
    description: "Tell us where you're flying, your departure date, and how much luggage space you have available. Your trip instantly becomes discoverable to verified senders.",
    icon: PlaneTakeoff,
    color: '#0d9488', // Teal
    light: 'rgba(13,148,136,0.08)',
    border: 'rgba(13,148,136,0.2)',
    tag: 'Step 01',
  },
  {
    id: '02',
    title: 'Accept Parcel',
    description: "Review delivery requests that match your route. Accept only the packages you're comfortable carrying after reviewing details and verification.",
    icon: PackageCheck,
    color: '#4f46e5', // Indigo
    light: 'rgba(79,70,229,0.08)',
    border: 'rgba(79,70,229,0.2)',
    tag: 'Step 02',
  },
  {
    id: '03',
    title: 'Deliver & Earn',
    description: "Meet the sender, complete pickup verification, carry the package during your trip, and deliver it safely. Once delivery is confirmed, receive your earnings.",
    icon: Wallet,
    color: '#059669', // Emerald
    light: 'rgba(5,150,105,0.08)',
    border: 'rgba(5,150,105,0.2)',
    tag: 'Step 03',
  },
];

const SENDER_STEPS = [
  {
    id: '01',
    title: 'List Your Package',
    description: 'Add pickup location, destination, package size, weight, and preferred delivery date in just a few clicks.',
    icon: Box,
    color: '#9333ea', // Purple
    light: 'rgba(147,51,234,0.08)',
    border: 'rgba(147,51,234,0.2)',
    tag: 'Step 01',
  },
  {
    id: '02',
    title: 'We Match a Carrier',
    description: 'Flyorago intelligently connects your shipment with a verified traveler already flying to your destination.',
    icon: Map,
    color: '#d97706', // Amber
    light: 'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.2)',
    tag: 'Step 02',
  },
  {
    id: '03',
    title: 'Track & Receive',
    description: 'Track progress, receive status updates, and confirm delivery securely once your package arrives.',
    icon: Smartphone,
    color: '#0284c7', // Sky Blue
    light: 'rgba(2,132,199,0.08)',
    border: 'rgba(2,132,199,0.2)',
    tag: 'Step 03',
  },
];

const WHY_IT_WORKS = [
  {
    title: 'Verified Travelers',
    desc: 'Strict KYC & Passport identity checks on all carriers.',
    icon: ShieldCheck,
    color: '#0d9488',
    glow: 'rgba(13,148,136,0.25)',
  },
  {
    title: 'Secure Escrow Payments',
    desc: 'Funds held safely until recipient confirms handover.',
    icon: CreditCard,
    color: '#4f46e5',
    glow: 'rgba(79,70,229,0.25)',
  },
  {
    title: 'Transparent Reviews',
    desc: '4.9★ community ratings & verified peer feedback.',
    icon: Star,
    color: '#d97706',
    glow: 'rgba(217,119,6,0.25)',
  },
  {
    title: 'Live Tracking',
    desc: 'Real-time flight status & delivery GPS updates.',
    icon: Map,
    color: '#0284c7',
    glow: 'rgba(2,132,199,0.25)',
  },
  {
    title: 'Affordable Delivery',
    desc: 'Save up to 60% compared to traditional international couriers.',
    icon: Wallet,
    color: '#059669',
    glow: 'rgba(5,150,105,0.25)',
  },
  {
    title: 'Trusted Global Community',
    desc: 'Over 50,000+ verified users across 120+ countries.',
    icon: Globe,
    color: '#9333ea',
    glow: 'rgba(147,51,234,0.25)',
  },
];

// ─── Step Card Component ──────────────────────────────────────────────────────
const StepCard: React.FC<{ step: typeof TRAVELER_STEPS[0]; idx: number; inView: boolean }> = ({ step, idx, inView }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = step.icon;

  return (
    <div
      className="group relative rounded-3xl p-7 sm:p-8 cursor-default transition-all duration-400 overflow-hidden flex flex-col justify-between"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
        transition: `opacity 0.65s cubic-bezier(0.4,0,0.2,1) ${idx * 120}ms, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) ${idx * 120}ms`,
        background: hovered ? step.light : '#ffffff',
        border: `1.5px solid ${hovered ? step.border : 'rgba(226,232,240,0.9)'}`,
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.06), 0 4px 16px ${step.light}`
          : '0 4px 16px rgba(15,23,42,0.03)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Watermark Step Number */}
      <span className="text-6xl font-black text-slate-100 absolute top-4 right-6 pointer-events-none select-none group-hover:text-slate-200/80 transition-colors">
        {step.id}
      </span>

      <div>
        {/* Step Badge */}
        <div className="flex items-center justify-between mb-6">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
            style={{ background: step.light, color: step.color, border: `1px solid ${step.border}` }}
          >
            {step.tag}
          </span>
        </div>

        {/* Icon Box */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 shadow-xs"
          style={{
            background: hovered ? step.color : step.light,
            transform: hovered ? 'scale(1.1) rotate(-3deg)' : 'scale(1)',
          }}
        >
          <Icon size={26} style={{ color: hovered ? '#ffffff' : step.color, transition: 'color 0.25s' }} />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          {step.description}
        </p>
      </div>

      {/* Bottom Accent Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-400"
        style={{
          background: step.color,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
        }}
      />
    </div>
  );
};

// ─── Main How It Works Page ──────────────────────────────────────────────────
const HowItWorksPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [travelerRef, travelerInView] = useInView(0.1);
  const [senderRef, senderInView] = useInView(0.1);
  const [whyRef, whyInView] = useInView(0.1);

  const [hoveredWhy, setHoveredWhy] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />

      <main className="flex-1">

        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section
          className="relative pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-slate-900 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hiw_hero_bg.png)' }}
        >
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs" />

          <div className="container-flyora max-w-5xl relative z-10 text-center px-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-black uppercase tracking-widest mb-6">
              <Sparkles size={13} />
              HOW FLYORAGO WORKS
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.15] tracking-tight">
              One Journey. <br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Endless Possibilities.
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium">
              Whether you're flying abroad or sending a package internationally, Flyorago connects verified travelers and senders through a secure, transparent, and trusted platform.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-10 bg-white" style={{ borderTopLeftRadius: '100%', borderTopRightRadius: '100%' }} />
        </section>

        {/* ─── 1. FOR TRAVELERS SECTION ───────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-white relative" ref={travelerRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section Header */}
            <div
              className="text-center mb-16"
              style={{
                opacity: travelerInView ? 1 : 0,
                transform: travelerInView ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                  <PlaneTakeoff size={13} className="text-teal-600" />
                  EARN WHILE YOU FLY
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                For{' '}
                <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                  Travelers
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium">
                Turn your unused luggage allowance into extra cash on trips you're already taking in 3 easy steps.
              </p>
            </div>

            {/* 3 Step Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {TRAVELER_STEPS.map((step, idx) => (
                <StepCard key={step.id} step={step} idx={idx} inView={travelerInView} />
              ))}
            </div>

            {/* CTA Link */}
            <div className="text-center mt-12">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <Sparkles size={14} />
                <span>Post Your Trip Now</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </section>

        {/* ─── 2. FOR SENDERS SECTION ─────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-slate-50/70 relative border-t border-slate-200/60" ref={senderRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section Header */}
            <div
              className="text-center mb-16"
              style={{
                opacity: senderInView ? 1 : 0,
                transform: senderInView ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                  <Box size={13} className="text-indigo-600" />
                  SAVE UP TO 60%
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                For{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  Senders
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium">
                Send packages internationally through verified carriers already flying to your destination.
              </p>
            </div>

            {/* 3 Step Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {SENDER_STEPS.map((step, idx) => (
                <StepCard key={step.id} step={step} idx={idx} inView={senderInView} />
              ))}
            </div>

            {/* CTA Link */}
            <div className="text-center mt-12">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <Sparkles size={14} />
                <span>Send a Package Now</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </section>

        {/* ─── 3. WHY IT WORKS SECTION (Neon Dark Glassmorphism) ────────── */}
        <section
          ref={whyRef}
          className="py-24 lg:py-32 bg-slate-950 text-white relative overflow-hidden"
        >
          {/* Background Ambient Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[120px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

            {/* Header */}
            <div
              className="text-center mb-16"
              style={{
                opacity: whyInView ? 1 : 0,
                transform: whyInView ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-extrabold uppercase tracking-widest mb-4">
                <ShieldCheck size={13} />
                TRUSTED & AUTOMATED PLATFORM
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
                Why It{' '}
                <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  Works
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium">
                Engineered with multi-layer identity checks, escrow protection, and real-time tracking for complete peace of mind.
              </p>
            </div>

            {/* 6 Feature Glass Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHY_IT_WORKS.map((item, idx) => {
                const Icon = item.icon;
                const isHovered = hoveredWhy === idx;

                return (
                  <div
                    key={idx}
                    className="group relative rounded-3xl p-6 sm:p-7 backdrop-blur-xl border transition-all duration-400 overflow-hidden flex items-start gap-4 cursor-default"
                    style={{
                      opacity: whyInView ? 1 : 0,
                      transform: whyInView ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
                      transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${idx * 90}ms, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${idx * 90}ms`,
                      background: isHovered ? 'rgba(30, 41, 59, 0.85)' : 'rgba(15, 23, 42, 0.65)',
                      borderColor: isHovered ? item.color : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: isHovered
                        ? `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${item.glow}`
                        : '0 4px 20px rgba(0,0,0,0.2)',
                    }}
                    onMouseEnter={() => setHoveredWhy(idx)}
                    onMouseLeave={() => setHoveredWhy(null)}
                  >
                    {/* Icon Circle */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: isHovered ? item.color : 'rgba(255,255,255,0.08)',
                        color: isHovered ? '#ffffff' : item.color,
                        transform: isHovered ? 'scale(1.1) rotate(-3deg)' : 'scale(1)',
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    {/* Content */}
                    <div>
                      <h4
                        className="text-lg font-black text-white mb-1 leading-snug transition-colors"
                        style={{ color: isHovered ? '#ffffff' : '#f8fafc' }}
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    {/* Top Glow Accent Line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 transition-all duration-400"
                      style={{
                        background: item.color,
                        opacity: isHovered ? 1 : 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
