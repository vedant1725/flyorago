import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Plane, Package, ShieldCheck, Award, ArrowRight,
  Sparkles, CheckCircle2, HeartHandshake
} from 'lucide-react';

interface WelcomeToFlyoraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeToFlyoraModal: React.FC<WelcomeToFlyoraModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/90 relative animate-in zoom-in-95 duration-250">
        
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center transition-all shadow-md"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* ─── Hero Image Section (Team Photo from About Us) ─── */}
        <div className="relative w-full overflow-hidden shrink-0 bg-slate-900 aspect-[16/10] sm:aspect-[16/9]">
          <img
            src="/images/about_team_custom.png"
            alt="FlyoraGo Founders & Team"
            className="w-full h-full object-cover object-[center_12%]"
          />
          {/* Clean, subtle bottom vignette only - keeps the founders' photos crisp, bright and fully visible */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none" />

          {/* Floating Pill on Image */}
          <div className="absolute bottom-3.5 left-5 right-5 flex items-center justify-between pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-slate-900/75 text-teal-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-1.5 shadow-md border border-white/10">
              <Sparkles size={12} className="text-flyora-teal" />
              ABOUT FLYORAGO
            </span>
            <span className="text-xs font-bold text-white/90 drop-shadow-sm hidden sm:inline">
              Community Powered Shipping
            </span>
          </div>
        </div>

        {/* ─── Modal Content Body ─── */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-4 sm:space-y-5">
          
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-snug">
              Welcome to <span className="text-flyora-teal">FlyoraGo</span>!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Every day, millions of travelers fly with unused luggage capacity, while people pay heavy courier costs. FlyoraGo securely bridges this gap by connecting verified travelers with senders worldwide.
            </p>
          </div>

          {/* ─── 4 Feature Highlights Grid ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Feature 1 */}
            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-flyora-teal flex items-center justify-center shrink-0 mt-0.5">
                <Plane size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">Monetize Extra Baggage</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  Travelers earn real money by offering verified extra suitcase space.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Package size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">60% Cheaper Shipping</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  Send urgent parcels, gifts, or documents without inflated courier rates.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">100% Escrow Protection</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  Funds remain safely locked in escrow until verified delivery confirmation.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Award size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800">AI Trust & KYC Security</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  Government ID verified members, live GPS route matching, and fraud protection.
                </p>
              </div>
            </div>

          </div>

          {/* ─── Footer Action Buttons ─── */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                navigate('/about');
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-flyora-teal hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
            >
              <span>Read Full Story & About Us</span>
              <ArrowRight size={13} />
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-flyora-teal hover:bg-[#0F766E] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-2"
            >
              <span>Explore Dashboard</span>
              <CheckCircle2 size={15} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

