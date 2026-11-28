import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane, Package, Check, ArrowRight,
  Sparkles, TrendingUp, ShieldCheck
} from 'lucide-react';

const ChooseRole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'traveller' | 'sender'>('all');

  return (
    <section
      className="relative py-20 lg:py-28 bg-white border-b border-slate-200/60 overflow-hidden select-none"
      id="choose-role"
      aria-label="Choose Your Role"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 shadow-xs mb-3.5">
            <span className="w-2 h-2 rounded-full bg-flyora-teal" />
            <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
              Two Tailored Experiences
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-flyora-navy tracking-tight leading-[1.18] mb-4">
            Built for Travellers and Senders
          </h2>

          <p className="text-slate-500 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
            Whether you are flying internationally with extra baggage allowance or sending a vital package across borders, Flyorago gives you a verified, automated experience.
          </p>

          {/* Clean Segmented Tab Switcher */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            {[
              { id: 'all', label: 'View Both' },
              { id: 'traveller', label: 'For Travellers' },
              { id: 'sender', label: 'For Senders' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-flyora-navy shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-flyora-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* Card 1: For Travellers */}
          {(activeTab === 'all' || activeTab === 'traveller') && (
            <div className={`bg-[#F8FAFC] rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-xs flex flex-col justify-between ${
              activeTab === 'traveller' ? 'lg:col-span-2 max-w-3xl mx-auto w-full' : ''
            }`}>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal shadow-xs">
                    <Plane size={22} className="-rotate-45" />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white border border-teal-200/70 text-flyora-teal-dark font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                    <TrendingUp size={12} />
                    Earn Up to ₹35,000 / Trip
                  </span>
                </div>

                <h3 className="text-2xl font-black text-flyora-navy tracking-tight mb-2">
                  For Travellers
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-normal">
                  Monetize your unused flight luggage capacity. Offset the cost of your plane ticket by safely carrying verified items for senders.
                </p>

                {/* Steps */}
                <div className="space-y-3.5 mb-8">
                  {[
                    { title: 'Publish Flight Details', desc: 'Enter departure, destination, date, and available weight in kilograms.' },
                    { title: 'Accept Verified Requests', desc: 'Review item contents, dimensions, and agreed payout reward before accepting.' },
                    { title: 'Deliver & Collect Escrow Payout', desc: 'Complete recipient OTP confirmation upon arrival for instant funds release.' },
                  ].map((st, i) => (
                    <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-flyora-teal flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-flyora-navy">{st.title}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed mt-0.5">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/traveler"
                className="w-full py-3.5 px-6 rounded-xl bg-flyora-navy hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Register as a Traveller</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Card 2: For Senders */}
          {(activeTab === 'all' || activeTab === 'sender') && (
            <div className={`bg-[#F8FAFC] rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-xs flex flex-col justify-between ${
              activeTab === 'sender' ? 'lg:col-span-2 max-w-3xl mx-auto w-full' : ''
            }`}>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                    <Package size={22} />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white border border-indigo-200/70 text-indigo-700 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck size={12} />
                    Save up to 60% vs Couriers
                  </span>
                </div>

                <h3 className="text-2xl font-black text-flyora-navy tracking-tight mb-2">
                  For Senders
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-normal">
                  Ship urgent documents, gifts, and personal goods across international borders rapidly with flight-speed delivery and zero customs delays.
                </p>

                {/* Steps */}
                <div className="space-y-3.5 mb-8">
                  {[
                    { title: 'Create Package Listing', desc: 'Specify item description, package weight, destination city, and required delivery date.' },
                    { title: 'Match with Confirmed Flyer', desc: 'Connect with a KYC-verified traveller already flying on your target route.' },
                    { title: 'Protected Handover & Delivery', desc: 'Your payment is vaulted in escrow until the recipient enters the verified OTP.' },
                  ].map((st, i) => (
                    <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-flyora-navy">{st.title}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed mt-0.5">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/sender"
                className="w-full py-3.5 px-6 rounded-xl bg-flyora-teal hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Post a Package Request</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default ChooseRole;
