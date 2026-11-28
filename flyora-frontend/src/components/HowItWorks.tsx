import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ShieldCheck, Plane, CheckCircle2, Star,
  ArrowRight, Sparkles, Lock, Clock, Zap, Globe, Check
} from 'lucide-react';

interface WorkflowStep {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  metric: string;
  metricLabel: string;
  highlights: string[];
}

const STEPS: WorkflowStep[] = [
  {
    id: 1,
    number: '01',
    title: 'Match Trip or Package',
    subtitle: 'Smart AI Courier Matching',
    description: 'Post your verified itinerary or shipment details in under 2 minutes. Our algorithmic engine pairs senders with vetted flyers headed to the exact destination.',
    badge: 'Instant Matching',
    icon: Search,
    metric: '2 Min',
    metricLabel: 'Average Match Time',
    highlights: ['Vetted passenger itineraries', 'Autonomous routing checks', 'Instant mutual notification'],
  },
  {
    id: 2,
    number: '02',
    title: 'Escrow Vault Payment',
    subtitle: 'Institutional-Grade Security',
    description: 'Confirm the booking with total peace of mind. Payout funds are vaulted in a secure bank escrow account and only released when delivery is completed.',
    badge: '100% Escrow Protection',
    icon: Lock,
    metric: '$0 Loss',
    metricLabel: 'Financial Guarantee',
    highlights: ['Multi-currency supported', 'Zero fraud chargeback risk', 'Automated dispute arbitration'],
  },
  {
    id: 3,
    number: '03',
    title: 'Secure Handover & Transit',
    subtitle: 'Aviation Compliance & Inspection',
    description: 'The traveler and sender meet for an unsealed item safety check. The verified flyer carries the package in their dedicated baggage allowance with real-time milestones.',
    badge: 'KYC & Aviation Compliant',
    icon: Plane,
    metric: '100%',
    metricLabel: 'KYC Verified Flyers',
    highlights: ['Open-box item inspection', 'Aviation customs compliant', 'Milestone departure alerts'],
  },
  {
    id: 4,
    number: '04',
    title: 'OTP Handover & Instant Payout',
    subtitle: 'Two-Factor Recipient Verification',
    description: 'The recipient validates package receipt using a secure 6-digit dynamic OTP. Once entered, the escrow vault immediately unlocks payment directly to the flyer.',
    badge: 'Automated Settlement',
    icon: CheckCircle2,
    metric: '99.8%',
    metricLabel: 'Successful Deliveries',
    highlights: ['Dynamic 6-digit OTP code', 'Instant automated payout', 'Verified bilateral feedback'],
  },
];

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const STEP_DURATION = 6000; // 6 seconds per step for clean digestion

  // Progress counter and auto-advance
  useEffect(() => {
    if (!isAutoPlaying) {
      setProgress(100);
      return;
    }

    setProgress(0);
    const intervalTime = 50;
    const increment = (intervalTime / STEP_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    autoPlayRef.current = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, STEP_DURATION);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
    };
  }, [activeStep, isAutoPlaying]);

  const handleStepSelect = (index: number) => {
    setActiveStep(index);
    setIsAutoPlaying(false);
  };

  const current = STEPS[activeStep];
  const CurrentIcon = current.icon;

  return (
    <section
      className="relative py-20 sm:py-28 bg-[#FBFDFE] border-y border-slate-200/60 overflow-hidden select-none"
      id="how-it-works"
      aria-label="How Flyorago Works"
    >
      {/* ─── Architectural Grid Background (MNC Clean Look) ─── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-flyora-teal/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ─── Section Header (Google / Stripe Editorial Style) ─── */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200/80 shadow-[0_2px_8px_rgba(13,148,136,0.08)] mb-4">
            <span className="w-2 h-2 rounded-full bg-flyora-teal animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-flyora-teal-dark tracking-wide uppercase">
              Transparent & Verified Logistics
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-flyora-navy tracking-tight leading-[1.18] mb-4">
            How Flyorago Works
          </h2>

          <p className="text-slate-500 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
            A frictionless peer-to-peer delivery network built on biometric KYC identity verification, escrow payment vaults, and two-factor handover confirmation.
          </p>
        </div>

        {/* ─── Top Step Progression Bar ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {STEPS.map((step, idx) => {
            const isCurrent = activeStep === idx;
            const isCompleted = activeStep > idx;
            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepSelect(idx)}
                className={`group relative text-left p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-300 border flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-white border-flyora-teal shadow-[0_12px_32px_rgba(13,148,136,0.12)] -translate-y-1'
                    : 'bg-white/70 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Active Step Progress Pill Bar */}
                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl overflow-hidden bg-teal-100">
                    <div
                      className="h-full bg-flyora-teal transition-all ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black tracking-widest ${
                        isCurrent ? 'text-flyora-teal' : 'text-slate-400'
                      }`}>
                        {step.number}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isCurrent
                          ? 'bg-teal-50 text-flyora-teal-dark border border-teal-100'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {step.badge}
                      </span>
                    </div>

                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      isCurrent
                        ? 'bg-flyora-teal text-white shadow-xs'
                        : isCompleted
                        ? 'bg-teal-50 text-flyora-teal'
                        : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
                    }`}>
                      {isCompleted ? (
                        <Check size={14} strokeWidth={2.5} />
                      ) : (
                        <StepIcon size={14} strokeWidth={2} />
                      )}
                    </div>
                  </div>

                  <h3 className={`text-sm sm:text-base font-bold tracking-tight leading-snug line-clamp-1 ${
                    isCurrent ? 'text-flyora-navy' : 'text-slate-600'
                  }`}>
                    {step.title}
                  </h3>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Metric</span>
                  <span className={`font-bold ${isCurrent ? 'text-flyora-teal-dark' : 'text-slate-500'}`}>
                    {step.metric}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── Main Heroic Interactive Showcase Card ─── */}
        <div className="bg-white rounded-3xl sm:rounded-[32px] border border-slate-200/90 shadow-[0_20px_60px_rgba(10,22,40,0.06)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal">
                    <CurrentIcon size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-flyora-teal uppercase tracking-widest block">
                      Phase {current.number}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {current.subtitle}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-flyora-navy tracking-tight leading-tight mb-4">
                  {current.title}
                </h3>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                  {current.description}
                </p>

                {/* Technical Feature Checkpoints */}
                <div className="space-y-3 mb-8">
                  {current.highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-semibold">
                      <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-flyora-teal flex-shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Strip */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Link
                    to="/how-it-works"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-flyora-teal text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(13,148,136,0.3)] hover:bg-teal-700 hover:shadow-teal-600/40 transition-all group"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="text-xs font-semibold text-slate-500 hover:text-flyora-teal px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {isAutoPlaying ? 'Pause Walkthrough' : 'Resume Auto-Play'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Step {activeStep + 1} of 4</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStepSelect((activeStep - 1 + STEPS.length) % STEPS.length)}
                      aria-label="Previous step"
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-flyora-navy transition-colors text-xs"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepSelect((activeStep + 1) % STEPS.length)}
                      aria-label="Next step"
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-flyora-navy transition-colors text-xs"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Architecture Column */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-teal-50/40 to-sky-50/50 p-6 sm:p-10 lg:p-12 border-t lg:border-t-0 lg:border-l border-slate-200/70 h-full flex flex-col justify-center relative overflow-hidden">
              
              {/* Background Ambient Aura */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-flyora-teal/10 rounded-full blur-3xl pointer-events-none" />

              {/* Interactive Visual Glass Card */}
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white shadow-[0_10px_35px_rgba(10,22,40,0.06)] space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-flyora-teal to-teal-500 flex items-center justify-center text-white shadow-xs">
                      <CurrentIcon size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-flyora-navy block">Security Verification</span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Live Protocol Active
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    256-bit Encrypted
                  </span>
                </div>

                {/* Dynamic Metric Display */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/90 text-center">
                  <span className="text-3xl sm:text-4xl font-black text-flyora-navy tracking-tight block">
                    {current.metric}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {current.metricLabel}
                  </span>
                </div>

                {/* Key Verification Features */}
                <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100">
                    <span className="text-slate-500">System Status</span>
                    <span className="font-bold text-emerald-600">Operational & Insured</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100">
                    <span className="text-slate-500">Government ID Vetting</span>
                    <span className="font-bold text-flyora-navy">Passports & Aadhaar Verified</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100">
                    <span className="text-slate-500">Payment Security</span>
                    <span className="font-bold text-flyora-navy">Direct Bank Escrow Vault</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ─── Bottom MNC Trust Pillars Bar ─── */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Bank-Grade Escrow', desc: 'Zero payout before verified delivery', icon: Lock },
            { label: 'Biometric KYC Check', desc: '100% ID-verified travelers & senders', icon: ShieldCheck },
            { label: 'Global Corridors', desc: 'Connecting India, US, UK, Canada & UAE', icon: Globe },
            { label: '24/7 Priority Support', desc: 'Live dispatch team always on standby', icon: Sparkles },
          ].map((item, idx) => {
            const PillarIcon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/60 border border-slate-200/70 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal flex-shrink-0 mt-0.5">
                  <PillarIcon size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-flyora-navy tracking-tight">{item.label}</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
