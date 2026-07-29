import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ShieldCheck, Eye, HeartHandshake,
  Lightbulb, Globe, Users,
  CheckCircle2, Network, Plane, UserCheck, Package, MapPin, PackageCheck,
  Sparkles, ArrowRight, Shield, Zap, Lock, Compass, Award
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

// ─── Our Values Data ──────────────────────────────────────────────────────────
const VALUES = [
  {
    title: 'Trust First',
    desc: 'Identity verification & transparent ratings build absolute confidence.',
    icon: ShieldCheck,
    color: '#0d9488',
    light: 'rgba(13,148,136,0.08)',
    border: 'rgba(13,148,136,0.2)',
  },
  {
    title: 'Transparency',
    desc: 'No hidden fees, real-time status updates, & open peer communication.',
    icon: Eye,
    color: '#4f46e5',
    light: 'rgba(79,70,229,0.08)',
    border: 'rgba(79,70,229,0.2)',
  },
  {
    title: 'Safety',
    desc: 'Escrow vault payment holding & OTP handover protection.',
    icon: HeartHandshake,
    color: '#059669',
    light: 'rgba(5,150,105,0.08)',
    border: 'rgba(5,150,105,0.2)',
  },
  {
    title: 'Innovation',
    desc: 'AI-driven route matching connects package senders with ideal travelers.',
    icon: Lightbulb,
    color: '#d97706',
    light: 'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.2)',
  },
  {
    title: 'Global Connectivity',
    desc: 'Unlocking international luggage space across 120+ countries.',
    icon: Globe,
    color: '#0284c7',
    light: 'rgba(2,132,199,0.08)',
    border: 'rgba(2,132,199,0.2)',
  },
  {
    title: 'Community Collaboration',
    desc: 'Empowering travelers to earn & senders to save through shared journeys.',
    icon: Users,
    color: '#9333ea',
    light: 'rgba(147,51,234,0.08)',
    border: 'rgba(147,51,234,0.2)',
  },
];

// ─── Why Flyorago Reasons ─────────────────────────────────────────────────────
const WHY_FLYORAGO_REASONS = [
  'Verified Global Network',
  'Modern Technology',
  'Escrow-Based Payments',
  'Secure Matching',
  'Real-Time Tracking',
  'Human-Centered Logistics',
];

const AboutUsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [storyRef, storyInView] = useInView(0.1);
  const [mvRef, mvInView] = useInView(0.1);
  const [valuesRef, valuesInView] = useInView(0.1);
  const [whyRef, whyInView] = useInView(0.1);

  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />

      <main className="flex-1">

        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-slate-900 bg-cover bg-center">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" />
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="container-flyora max-w-5xl relative z-10 text-center px-4">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-black uppercase tracking-widest mb-6">
              <Sparkles size={13} />
              ABOUT FLYORAGO
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.15] tracking-tight">
              Building the Future of <br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Community-Powered Shipping
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
              At Flyorago, every journey creates an opportunity to help someone else ship faster, cheaper, and safer.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-10 bg-white" style={{ borderTopLeftRadius: '100%', borderTopRightRadius: '100%' }} />
        </section>

        {/* ─── 1. OUR STORY SECTION ───────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-white relative" ref={storyRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left Column: Image Container with Glass Badge */}
              <div
                className="w-full lg:w-1/2 relative"
                style={{
                  opacity: storyInView ? 1 : 0,
                  transform: storyInView ? 'translateX(0)' : 'translateX(-32px)',
                  transition: 'all 0.75s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 group">
                  <img
                    src="/images/about_team_custom.png"
                    alt="Flyorago Team Discussing"
                    className="w-full h-auto max-h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Right Column: Story Text */}
              <div
                className="w-full lg:w-1/2"
                style={{
                  opacity: storyInView ? 1 : 0,
                  transform: storyInView ? 'translateX(0)' : 'translateX(32px)',
                  transition: 'all 0.75s cubic-bezier(0.34,1.56,0.64,1) 150ms',
                }}
              >
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                    <Compass size={12} className="text-teal-600" />
                    OUR JOURNEY
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                  Our{' '}
                  <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                    Story
                  </span>
                </h2>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 font-medium">
                  Millions of travelers fly every day with unused luggage capacity, while individuals and businesses pay expensive courier fees to ship items internationally.
                </p>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                  Flyorago bridges this gap by securely connecting verified travelers with senders, creating a smarter, more sustainable global delivery ecosystem.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ─── 2. OUR MISSION & VISION SECTION ───────────────────────────── */}
        <section className="py-20 lg:py-28 bg-slate-50/70 relative border-y border-slate-200/60" ref={mvRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

              {/* Mission Card */}
              <div
                className="group relative bg-white rounded-3xl p-8 lg:p-10 border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_50px_rgba(13,148,136,0.12)] hover:border-teal-300 transition-all duration-400 overflow-hidden flex flex-col justify-between"
                style={{
                  opacity: mvInView ? 1 : 0,
                  transform: mvInView ? 'translateY(0)' : 'translateY(32px)',
                  transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-600" />
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xs">
                    <Network size={28} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">Our Mission</h3>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                    To make international shipping faster, more affordable, and community-driven through trusted travelers.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-extrabold text-teal-700">
                  <CheckCircle2 size={15} /> Faster & 60% Cheaper Shipping
                </div>
              </div>

              {/* Vision Card */}
              <div
                className="group relative bg-white rounded-3xl p-8 lg:p-10 border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.12)] hover:border-indigo-300 transition-all duration-400 overflow-hidden flex flex-col justify-between"
                style={{
                  opacity: mvInView ? 1 : 0,
                  transform: mvInView ? 'translateY(0)' : 'translateY(32px)',
                  transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 150ms',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform duration-300 shadow-xs">
                    <Plane size={28} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">Our Vision</h3>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                    To become the world's most trusted peer-to-peer travel logistics platform where every flight creates value beyond transportation.
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-extrabold text-indigo-700">
                  <Globe size={15} /> Global Peer-to-Peer Network
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── 3. OUR VALUES SECTION ──────────────────────────────────────── */}
        <section className="py-20 lg:py-28 bg-white relative" ref={valuesRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section Header */}
            <div
              className="text-center mb-16"
              style={{
                opacity: valuesInView ? 1 : 0,
                transform: valuesInView ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 0.65s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                  <Award size={13} className="text-teal-600" />
                  CORE PRINCIPLES
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Our{' '}
                <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                  Values
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium">
                The core principles that guide everything we build at Flyorago.
              </p>
            </div>

            {/* 6 Value Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VALUES.map((val, idx) => {
                const Icon = val.icon;
                const isHovered = hoveredValue === idx;

                return (
                  <div
                    key={idx}
                    className="group relative rounded-3xl p-7 cursor-default transition-all duration-400 overflow-hidden flex flex-col justify-between"
                    style={{
                      opacity: valuesInView ? 1 : 0,
                      transform: valuesInView ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
                      transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${idx * 90}ms, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${idx * 90}ms`,
                      background: isHovered ? val.light : '#ffffff',
                      border: `1.5px solid ${isHovered ? val.border : 'rgba(226,232,240,0.8)'}`,
                      boxShadow: isHovered
                        ? `0 18px 45px rgba(0,0,0,0.06), 0 4px 16px ${val.light}`
                        : '0 4px 16px rgba(15,23,42,0.03)',
                    }}
                    onMouseEnter={() => setHoveredValue(idx)}
                    onMouseLeave={() => setHoveredValue(null)}
                  >
                    <div>
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 shadow-xs"
                        style={{
                          background: isHovered ? val.color : val.light,
                          transform: isHovered ? 'scale(1.1) rotate(-3deg)' : 'scale(1)',
                        }}
                      >
                        <Icon size={22} style={{ color: isHovered ? '#ffffff' : val.color, transition: 'color 0.25s' }} />
                      </div>

                      {/* Title */}
                      <h4 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                        {val.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {val.desc}
                      </p>
                    </div>

                    {/* Bottom Accent Bar */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-400"
                      style={{
                        background: val.color,
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                      }}
                    />
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ─── 4. WHY FLYORAGO? (Sci-Fi Interactive Network Visual) ──────── */}
        <section
          ref={whyRef}
          className="py-24 lg:py-32 bg-slate-950 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/images/srv_hero_bg.png')] bg-cover opacity-10 mix-blend-overlay pointer-events-none" />

          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left Column: Reasons & Bullet points */}
              <div
                className="w-full lg:w-1/2"
                style={{
                  opacity: whyInView ? 1 : 0,
                  transform: whyInView ? 'translateX(0)' : 'translateX(-32px)',
                  transition: 'all 0.75s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-extrabold uppercase tracking-widest mb-4">
                  <Zap size={13} />
                  REVOLUTIONARY LOGISTICS
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
                  Why{' '}
                  <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                    Flyorago?
                  </span>
                </h2>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 font-medium">
                  We are building a platform that puts people first. Experience a revolutionary way to ship globally while ensuring total security and trust.
                </p>

                {/* 6 Reasons 2-column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-8">
                  {WHY_FLYORAGO_REASONS.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <CheckCircle2 size={20} className="text-teal-400 shrink-0" />
                      <span className="text-white font-bold text-sm">{reason}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 text-white font-extrabold text-sm shadow-lg hover:shadow-teal-500/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Sparkles size={16} />
                  <span>Join the Community Today</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right Column: Sci-Fi Interactive Orbital Graphic */}
              <div
                className="w-full lg:w-1/2 relative h-[380px] sm:h-[450px] lg:min-h-[500px] flex items-center justify-center"
                style={{
                  opacity: whyInView ? 1 : 0,
                  transform: whyInView ? 'translateX(0)' : 'translateX(32px)',
                  transition: 'all 0.75s cubic-bezier(0.34,1.56,0.64,1) 200ms',
                }}
              >
                <div className="w-[500px] h-[500px] scale-[0.65] sm:scale-80 lg:scale-95 origin-center relative flex-shrink-0 flex items-center justify-center">

                  {/* Orbital Rings */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-white/10 animate-[spin_40s_linear_infinite]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-teal-500/30 border-dashed animate-[spin_30s_linear_infinite_reverse]">
                    <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_15px_#14B8A6]" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/10 animate-[spin_20s_linear_infinite]" />

                  {/* Central Globe */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-48 h-48 rounded-full bg-slate-900/80 border border-teal-500/40 flex items-center justify-center shadow-[0_0_80px_rgba(20,184,166,0.3)] backdrop-blur-md z-10">
                    <Globe size={110} className="text-teal-400 opacity-60 animate-[spin_60s_linear_infinite]" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-teal-500/10 to-transparent" />
                    <div className="absolute top-10 left-10 w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_#14B8A6] animate-pulse" />
                    <div className="absolute top-20 right-8 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_#818CF8] animate-pulse" />
                  </div>

                  {/* Floating Glass Badges around Globe */}
                  {[
                    { txt: 'Verified Travelers', icon: UserCheck, c: '#14b8a6', top: '40px', left: '10px' },
                    { txt: 'Secure Escrow', icon: Lock, c: '#10b981', top: '20px', right: '20px' },
                    { txt: 'Real-Time GPS', icon: MapPin, c: '#38bdf8', bottom: '100px', right: '10px' },
                    { txt: 'Global Network', icon: Globe, c: '#818cf8', bottom: '120px', left: '10px' },
                  ].map((badge, i) => {
                    const BIcon = badge.icon;
                    return (
                      <div
                        key={i}
                        className="absolute z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-bold shadow-2xl hover:bg-white/20 transition-all cursor-default"
                        style={{
                          top: badge.top, left: (badge as any).left,
                          bottom: badge.bottom, right: (badge as any).right,
                        }}
                      >
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white" style={{ background: badge.c }}>
                          <BIcon size={14} />
                        </div>
                        <span>{badge.txt}</span>
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
