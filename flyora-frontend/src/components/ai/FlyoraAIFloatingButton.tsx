import React from 'react';
import { useFlyoraAI } from '../../context/FlyoraAIContext';
import { Sparkles, Bot, X, MessageSquare, Zap } from 'lucide-react';

export const FlyoraAIFloatingButton: React.FC = () => {
  const { isOpen, openAI, closeAI } = useFlyoraAI();

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex items-center gap-3 select-none">
      {/* Floating Pill Badge (Gemini / Copilot Style) */}
      {!isOpen && (
        <div
          onClick={() => openAI()}
          className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 text-slate-800 font-extrabold text-xs border border-teal-200/80 shadow-2xl shadow-teal-500/10 backdrop-blur-xl cursor-pointer hover:scale-105 transition-all duration-300 group border-l-4 border-l-flyora-teal"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative"></span>
          </div>
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-700 bg-clip-text text-transparent">
            Ask Flyora AI
          </span>
          <span className="px-1.5 py-0.5 rounded-full bg-teal-50 text-flyora-teal text-[10px] font-black uppercase tracking-wider border border-teal-200">
            PRO
          </span>
        </div>
      )}

      {/* Advanced Google / Copilot Style Floating Trigger Button */}
      <button
        onClick={() => (isOpen ? closeAI() : openAI())}
        aria-label="Toggle Flyora AI Assistant"
        className={`relative group w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen
            ? 'bg-slate-900 border-2 border-slate-700 shadow-slate-900/40 rotate-90'
            : 'bg-gradient-to-tr from-flyora-teal via-teal-600 to-emerald-400 shadow-teal-500/40 hover:shadow-teal-500/60'
        }`}
      >
        {/* Outer Pulsing Glow Aura */}
        {!isOpen && (
          <>
            <span className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 opacity-40 animate-pulse blur-md group-hover:opacity-75 transition duration-500"></span>
            <span className="absolute -inset-0.5 rounded-3xl bg-white/20 animate-spin-slow"></span>
          </>
        )}

        {isOpen ? (
          <X size={26} className="text-white transition-transform duration-300" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot size={28} className="text-white drop-shadow-md transition-transform duration-300 group-hover:scale-110" />
            <Sparkles size={14} className="absolute -top-2 -right-2 text-amber-300 animate-pulse drop-shadow-sm" />
            <Zap size={10} className="absolute -bottom-1 -left-1 text-cyan-200 animate-bounce" />
          </div>
        )}
      </button>
    </div>
  );
};
