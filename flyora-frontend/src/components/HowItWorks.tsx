import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, CreditCard, Briefcase, PackageCheck, Star,
  ArrowRight, Sparkles, Shield, Zap, Globe, CheckCircle2,
  ChevronRight, Play
} from 'lucide-react';

// ─── Step data ────────────────────────────────────────────────────────────────
const STEPS = [
  {
    step: 1,
    icon: Search,
    title: 'Find or Post a Trip',
    desc: 'Senders find travelers going to their destination, or travelers post available luggage space.',
    color: '#14b8a6',
    lightColor: 'rgba(20,184,166,0.08)',
    borderColor: 'rgba(20,184,166,0.2)',
    shadowColor: 'rgba(20,184,166,0.25)',
    gradient: 'from-teal-500 to-cyan-500',
    tag: 'Step 1',
    detail: 'AI-powered matching',
    stat: '2 min avg.',
  },
  {
    step: 2,
    icon: CreditCard,
    title: 'Book & Pay Securely',
    desc: "Choose your match, agree on terms, and pay safely through Flyorago's secure escrow system.",
    color: '#6366f1',
    lightColor: 'rgba(99,102,241,0.08)',
    borderColor: 'rgba(99,102,241,0.2)',
    shadowColor: 'rgba(99,102,241,0.25)',
    gradient: 'from-indigo-500 to-purple-500',
    tag: 'Step 2',
    detail: 'Escrow protected',
    stat: '100% safe',
  },
  {
    step: 3,
    icon: Briefcase,
    title: 'Traveler Carries Package',
    desc: 'The verified traveler picks up the package and carries it safely to the destination.',
    color: '#f59e0b',
    lightColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.2)',
    shadowColor: 'rgba(245,158,11,0.25)',
    gradient: 'from-amber-500 to-orange-500',
    tag: 'Step 3',
    detail: 'KYC verified only',
    stat: 'Real-time tracking',
  },
  {
    step: 4,
    icon: PackageCheck,
    title: 'Delivered with Care',
    desc: 'Package is handed to the recipient at the destination, securely and on time.',
    color: '#10b981',
    lightColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.2)',
    shadowColor: 'rgba(16,185,129,0.25)',
    gradient: 'from-emerald-500 to-teal-500',
    tag: 'Step 4',
    detail: 'GPS confirmed',
    stat: '99.2% on-time',
  },
  {
    step: 5,
    icon: Star,
    title: 'Release & Review',
    desc: 'Payment is released to the traveler once delivery is confirmed. Both parties leave a review.',
    color: '#d97706',
    lightColor: 'rgba(217,119,6,0.08)',
    borderColor: 'rgba(217,119,6,0.2)',
    shadowColor: 'rgba(217,119,6,0.22)',
    gradient: 'from-amber-500 to-yellow-500',
    tag: 'Step 5',
    detail: 'Instant payout',
    stat: '4.9★ avg. rating',
  },
];

// ─── Hook: Intersection Observer ─────────────────────────────────────────────
function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// ─── Animated counter ─────────────────────────────────────────────────────────
const AnimatedNumber: React.FC<{ value: number; suffix?: string; duration?: number }> = ({
  value, suffix = '', duration = 1500
}) => {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const tick = () => {
      const pct = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setDisplay(Math.round(ease * value));
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, value, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
};

// ─── Step Card Component ──────────────────────────────────────────────────────
const StepCard: React.FC<{ step: typeof STEPS[0]; index: number; isActive: boolean; onClick: () => void; globalInView: boolean }> = ({
  step, index, isActive, onClick, globalInView
}) => {
  const Icon = step.icon;
  const delay = index * 120;

  return (
    <div
      className="group cursor-pointer select-none"
      style={{
        opacity: globalInView ? 1 : 0,
        transform: globalInView ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
      onClick={onClick}
      id={`step-${step.step}`}
    >
      <div
        className="relative rounded-2xl p-6 h-full transition-all duration-500 overflow-hidden"
        style={{
          background: isActive ? `linear-gradient(135deg, ${step.lightColor}, rgba(255,255,255,0.95))` : 'rgba(255,255,255,0.7)',
          border: `1.5px solid ${isActive ? step.borderColor : 'rgba(0,0,0,0.06)'}`,
          boxShadow: isActive
            ? `0 20px 60px ${step.shadowColor}, 0 4px 16px rgba(0,0,0,0.06)`
            : '0 2px 12px rgba(0,0,0,0.04)',
          transform: isActive ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        }}
      >
        {/* Shimmer overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }}
        />

        {/* Active step glow */}
        {isActive && (
          <div
            className="absolute -inset-1 rounded-2xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at top left, ${step.shadowColor} 0%, transparent 70%)`,
              opacity: 0.4,
              zIndex: -1,
            }}
          />
        )}

        {/* Step number badge */}
        <div className="flex items-center justify-between mb-5">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300"
            style={{
              background: isActive ? step.lightColor : 'rgba(0,0,0,0.04)',
              color: isActive ? step.color : '#94a3b8',
              border: `1px solid ${isActive ? step.borderColor : 'transparent'}`,
            }}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-white font-black"
              style={{ background: isActive ? `linear-gradient(135deg, ${step.color}, ${step.color}cc)` : '#cbd5e1', fontSize: '8px' }}
            >
              {step.step}
            </span>
            {step.tag}
          </div>

          {/* Animated check when active */}
          <div
            className="transition-all duration-400"
            style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-90deg)' }}
          >
            <CheckCircle2 size={18} style={{ color: step.color }} />
          </div>
        </div>

        {/* Icon */}
        <div className="mb-4 relative">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${step.color}, ${step.color}cc)`
                : 'rgba(0,0,0,0.05)',
              boxShadow: isActive ? `0 8px 24px ${step.shadowColor}` : 'none',
              transform: isActive ? 'rotate(-3deg) scale(1.1)' : 'rotate(0deg) scale(1)',
            }}
          >
            <Icon
              size={24}
              style={{ color: isActive ? '#fff' : '#94a3b8', transition: 'all 0.4s' }}
            />
          </div>
          {/* Floating micro-dot */}
          {isActive && (
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
              style={{ background: step.color, opacity: 0.5 }}
            />
          )}
        </div>

        {/* Text */}
        <h3
          className="text-[15px] font-black mb-2 leading-snug transition-colors duration-300"
          style={{ color: isActive ? '#0f172a' : '#475569' }}
        >
          {step.title}
        </h3>
        <p className="text-[12.5px] text-slate-400 leading-relaxed font-medium mb-4 line-clamp-3">
          {step.desc}
        </p>

        {/* Detail stat chip */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: isActive ? step.borderColor : 'rgba(0,0,0,0.05)' }}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{step.detail}</span>
          <span
            className="text-[11px] font-black px-2 py-0.5 rounded-full transition-all duration-300"
            style={{
              background: isActive ? step.lightColor : 'rgba(0,0,0,0.04)',
              color: isActive ? step.color : '#94a3b8',
            }}
          >
            {step.stat}
          </span>
        </div>

        {/* Bottom hover bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
          }}
        />
      </div>
    </div>
  );
};

// ─── Main Section ─────────────────────────────────────────────────────────────
const HowItWorks: React.FC = () => {
  const [sectionRef, inView] = useInView(0.1);
  const [headerRef, headerInView] = useInView(0.2);
  const [activeStep, setActiveStep] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance active step
  useEffect(() => {
    if (!inView || !autoPlay) return;
    autoTimer.current = setInterval(() => {
      setActiveStep(prev => (prev + 1) % STEPS.length);
    }, 2800);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [inView, autoPlay]);

  // Progress bar
  useEffect(() => {
    if (!inView) return;
    const target = ((activeStep + 1) / STEPS.length) * 100;
    setProgressWidth(target);
  }, [activeStep, inView]);

  const handleStepClick = (idx: number) => {
    setActiveStep(idx);
    setAutoPlay(false);
    if (autoTimer.current) clearInterval(autoTimer.current);
  };

  const activeData = STEPS[activeStep];

  return (
    <section
      className="relative py-28 overflow-hidden"
      id="how-it-works"
      aria-label="How Flyorago works"
      style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 40%, #f0fdf8 100%)' }}
    >
      {/* ── Background decoration ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Blobs */}
        <div
          className="absolute -top-40 right-[-100px] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }}
        />
        {/* Floating orbs */}
        {[
          { top: '15%', left: '5%', size: 8, color: '#14b8a6', delay: 0 },
          { top: '70%', left: '90%', size: 6, color: '#6366f1', delay: 1.5 },
          { top: '40%', left: '95%', size: 10, color: '#f59e0b', delay: 0.8 },
          { top: '85%', left: '15%', size: 7, color: '#10b981', delay: 2 },
          { top: '25%', left: '88%', size: 5, color: '#f43f5e', delay: 1.2 },
        ].map((o, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              top: o.top, left: o.left,
              width: o.size, height: o.size,
              background: o.color,
              opacity: 0.4,
              animationDelay: `${o.delay}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">

        {/* ── Section Header ── */}
        <div
          ref={headerRef}
          className="text-center mb-16"
          style={{
            opacity: headerInView ? 1 : 0,
            transform: headerInView ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.1), rgba(99,102,241,0.08))',
                border: '1px solid rgba(20,184,166,0.2)',
              }}
            >
              <Sparkles size={13} className="text-teal-500" />
              <span className="text-xs font-black text-teal-600 uppercase tracking-widest">Simple. Secure. Smart.</span>
              <Sparkles size={13} className="text-indigo-500" />
            </div>
          </div>

          {/* Main title */}
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-5 leading-tight"
            id="how-it-works-heading"
          >
            How{' '}
            <span
              className="relative inline-block"
              style={{
                background: 'linear-gradient(135deg, #14b8a6, #38bdf8, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Flyorago
              {/* Underline squiggle */}
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                style={{ height: '6px' }}
              >
                <path
                  d="M0,4 Q25,0 50,4 Q75,8 100,4 Q125,0 150,4 Q175,8 200,4"
                  fill="none"
                  stroke="url(#waveGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </span>{' '}
            Works
          </h2>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            We make global shipping easy by connecting senders with trusted travelers{' '}
            <span className="text-teal-600 font-bold">in just a few steps.</span>
          </p>

        </div>

        {/* ── Progress bar + step indicator ── */}
        <div
          ref={sectionRef}
          className="mb-8"
          style={{
            opacity: inView ? 1 : 0,
            transition: 'opacity 0.6s ease 0.2s',
          }}
        >
          {/* Step dots navigation */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleStepClick(i)}
                className="relative transition-all duration-400 rounded-full"
                style={{
                  width: activeStep === i ? '32px' : '8px',
                  height: '8px',
                  background: activeStep === i
                    ? `linear-gradient(90deg, ${s.color}, ${s.color}cc)`
                    : activeStep > i ? s.color : '#e2e8f0',
                  boxShadow: activeStep === i ? `0 0 12px ${s.shadowColor}` : 'none',
                }}
                aria-label={`Go to step ${s.step}`}
              />
            ))}
          </div>

          {/* Progress track */}
          <div className="max-w-xs mx-auto h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressWidth}%`,
                background: `linear-gradient(90deg, #14b8a6, ${activeData.color})`,
                boxShadow: `0 0 8px ${activeData.shadowColor}`,
              }}
            />
          </div>

          {/* Auto-play toggle */}
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all duration-200"
              style={{
                background: autoPlay ? activeData.lightColor : 'rgba(0,0,0,0.04)',
                color: autoPlay ? activeData.color : '#94a3b8',
                border: `1px solid ${autoPlay ? activeData.borderColor : 'transparent'}`,
              }}
            >
              <Play size={9} className={autoPlay ? 'text-current' : 'text-slate-400'} />
              {autoPlay ? 'Auto-playing' : 'Paused — click a step'}
            </button>
          </div>
        </div>

        {/* ── Step Cards Grid ── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          style={{ alignItems: 'stretch' }}
        >
          {STEPS.map((step, idx) => (
            <StepCard
              key={step.step}
              step={step}
              index={idx}
              isActive={activeStep === idx}
              onClick={() => handleStepClick(idx)}
              globalInView={inView}
            />
          ))}
        </div>

        {/* ── Active Step Detail Panel ── */}
        <div
          className="mt-8 rounded-3xl overflow-hidden transition-all duration-500"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1) 0.4s, background 0.5s ease',
            background: `linear-gradient(135deg, ${activeData.lightColor}, rgba(255,255,255,0.95))`,
            border: `1.5px solid ${activeData.borderColor}`,
            boxShadow: `0 8px 40px ${activeData.shadowColor}`,
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 px-8 py-6">
            {/* Step icon large */}
            <div
              className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${activeData.color}, ${activeData.color}cc)`,
                boxShadow: `0 12px 32px ${activeData.shadowColor}`,
              }}
            >
              {React.createElement(activeData.icon, { size: 30, color: '#fff' })}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: activeData.lightColor, color: activeData.color, border: `1px solid ${activeData.borderColor}` }}
                >
                  {activeData.tag}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{activeData.detail}</span>
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-1">{activeData.title}</h4>
              <p className="text-sm text-slate-500 font-medium max-w-lg">{activeData.desc}</p>
            </div>

            {/* Stat + navigation arrows */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: activeData.color }}>{activeData.stat}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Performance</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStepClick((activeStep - 1 + STEPS.length) % STEPS.length)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: activeData.lightColor, color: activeData.color, border: `1px solid ${activeData.borderColor}` }}
                >
                  <ChevronRight size={16} className="rotate-180" />
                </button>
                <button
                  onClick={() => handleStepClick((activeStep + 1) % STEPS.length)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${activeData.color}, ${activeData.color}cc)`, color: '#fff' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trust badges strip ── */}
        <div
          className="mt-10 grid grid-cols-3 sm:grid-cols-5 gap-3"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1) 0.6s',
          }}
        >
          {[
            { icon: Shield, label: 'KYC Verified', sub: '100% trusted' },
            { icon: Zap, label: 'Escrow Safe', sub: 'Zero loss' },
            { icon: Globe, label: '120+ Countries', sub: 'Global reach' },
            { icon: Star, label: '4.9★ Rating', sub: '12K+ reviews' },
            { icon: CheckCircle2, label: 'On-time', sub: '99.2% rate' },
          ].map((b, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl transition-all duration-300 hover:scale-105 group cursor-default"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                backdropFilter: 'blur(8px)',
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: `${STEPS[i]?.lightColor || 'rgba(20,184,166,0.08)'}` }}
              >
                <b.icon size={16} style={{ color: STEPS[i]?.color || '#14b8a6' }} />
              </div>
              <div className="text-center">
                <p className="text-[12px] font-black text-slate-700">{b.label}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div
          className="text-center mt-14"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1) 0.7s',
          }}
        >
          <Link
            to="/signup"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl active:scale-[0.97] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0d9488, #14b8a6, #38bdf8)',
              boxShadow: '0 8px 32px rgba(20,184,166,0.35)',
            }}
            id="how-it-works-cta"
          >
            {/* Shine sweep */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            <Sparkles size={16} className="relative z-10" />
            <span className="relative z-10">Start shipping today — it's free</span>
            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <p className="text-sm text-slate-400 font-medium mt-3">
            No credit card required · Join 50,000+ users
          </p>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
