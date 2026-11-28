import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Lock, Navigation, PackageCheck,
  Star, Globe, Plane, UserCheck,
  Check, ArrowRight, Sparkles, Zap
} from 'lucide-react';

const FEATURES = [
  {
    icon: UserCheck,
    title: 'KYC Verified Travellers',
    desc: 'Government-issued ID and biometric face verification are required before anyone can accept a shipment.',
  },
  {
    icon: Lock,
    title: 'Bank-Grade Escrow Vault',
    desc: 'Funds are securely vaulted upon booking and only released to the carrier after dynamic OTP delivery confirmation.',
  },
  {
    icon: Navigation,
    title: 'Smart Route Matching',
    desc: 'Our proprietary engine matches parcels with travellers flying on existing commercial flight itineraries.',
  },
  {
    icon: PackageCheck,
    title: 'Unsealed Safety Inspection',
    desc: 'Mandatory open-box visual inspection during package handover ensures 100% aviation customs compliance.',
  },
  {
    icon: Star,
    title: 'Bilateral Community Reviews',
    desc: 'Double-blind rating system maintains high accountability and trust across global transit corridors.',
  },
  {
    icon: Globe,
    title: 'Global Delivery Network',
    desc: 'Seamless intercity and international shipping across India, USA, UK, Canada, UAE, and Europe.',
  },
];

const TIMELINE_STEPS = [
  { label: 'Carrier Identity Vetted', detail: 'Passport & Biometric KYC Approved', icon: UserCheck, tag: 'KYC Verified' },
  { label: 'Safety Handover Check', detail: 'Package Inspected & Sealed Together', icon: PackageCheck, tag: 'Inspection OK' },
  { label: 'Escrow Vault Locked', detail: 'Funds Secured in FDIC-Grade Vault', icon: Lock, tag: '100% Escrow' },
  { label: 'Flight Transit Active', detail: 'Real-Time Flight & Waypoint Tracking', icon: Plane, tag: 'In Transit' },
  { label: 'Dynamic OTP Handover', detail: 'Recipient Confirms 6-Digit Code', icon: Check, tag: 'Delivered' },
  { label: 'Automated Carrier Payout', detail: 'Direct Payout Released to Carrier', icon: Sparkles, tag: 'Payout Settled' },
];

const WhyChoose: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(3);

  return (
    <section
      className="relative py-20 lg:py-28 bg-[#F8FAFC] border-b border-slate-200/60 overflow-hidden select-none"
      id="why-choose"
      aria-label="Why Choose Flyorago"
    >
      {/* Background Architectural Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-teal-200/80 shadow-xs mb-3.5">
            <span className="w-2 h-2 rounded-full bg-flyora-teal" />
            <span className="text-[11px] font-bold text-flyora-teal-dark tracking-wide uppercase">
              Enterprise Trust Architecture
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-flyora-navy tracking-tight leading-[1.16] mb-3">
            Built on Trust. Designed for Speed.
          </h2>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-normal max-w-xl">
            Verified travelers, secure escrow payments, and reliable delivery across global flight corridors.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Column: 6 Feature Cards in Clean 2x3 Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-200 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal mb-4">
                      <Icon size={18} strokeWidth={2.2} />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-flyora-navy mb-2 tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Live Shipment Trust Simulator (Clean, Professional, Zero Gimmicks) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-[0_12px_40px_rgba(10,22,40,0.06)] p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-xs">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-flyora-navy leading-tight">Live Shipment Engine</h3>
                    <span className="text-[11px] text-slate-400 font-medium">End-to-End Escrow Milestones</span>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Active
                </span>
              </div>

              {/* Transit Route Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-6 flex items-center justify-between text-xs font-bold text-flyora-navy">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>New York (JFK)</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 font-normal text-[11px]">
                  <span>✈ Direct Flight</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>London (LHR)</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="space-y-4">
                {TIMELINE_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isPassed = idx <= activeStepIndex;
                  const isCurrent = idx === activeStepIndex;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveStepIndex(idx)}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                            isPassed
                              ? 'bg-flyora-teal text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <StepIcon size={12} />
                        </div>
                        {idx !== TIMELINE_STEPS.length - 1 && (
                          <div className={`w-0.5 h-6 transition-colors ${
                            idx < activeStepIndex ? 'bg-flyora-teal' : 'bg-slate-200'
                          }`} />
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-between pt-0.5">
                        <div>
                          <p className={`text-xs font-bold leading-none ${
                            isPassed ? 'text-flyora-navy' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-1">
                            {step.detail}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isCurrent
                            ? 'bg-teal-50 text-flyora-teal-dark border border-teal-200'
                            : isPassed
                            ? 'bg-slate-50 text-slate-500'
                            : 'text-slate-300'
                        }`}>
                          {step.tag}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Escrow Guarantee Pill */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Financial Escrow Guarantee</span>
              <span className="font-bold text-flyora-teal-dark flex items-center gap-1">
                <Check size={13} strokeWidth={3} /> 100% Refundable
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default WhyChoose;
