import React from 'react';
import { useLocation } from 'react-router-dom';
import { useFlyoraAI } from '../../context/FlyoraAIContext';
import { Headphones, Bot, X } from 'lucide-react';

export const FlyoraAIFloatingButton: React.FC = () => {
  const { isOpen, openAI, closeAI } = useFlyoraAI();
  const location = useLocation();

  // Only show floating assistant on the Dashboard
  if (location.pathname !== '/dashboard') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-5 sm:right-8 z-40 flex items-center gap-2 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Pill: Ask Flyora AI PRO */}
      {!isOpen && (
        <div
          onClick={() => openAI()}
          className="bg-white rounded-full py-2 px-3.5 border border-slate-100 shadow-[0_4px_20px_rgba(10,22,40,0.06)] hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Headphones size={16} className="text-flyora-teal" />
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            Ask Flyora AI
          </span>
          <span className="bg-teal-50 text-flyora-teal text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide border border-teal-200/60">
            PRO
          </span>
        </div>
      )}

      {/* Circular Flyora Teal bot button */}
      <button
        onClick={() => (isOpen ? closeAI() : openAI())}
        aria-label="Toggle Flyora AI Assistant"
        className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-slate-900 shadow-slate-900/30 rotate-90'
            : 'bg-gradient-to-tr from-flyora-teal to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-teal-600/30'
        }`}
      >
        {isOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <Bot size={22} className="text-white" />
        )}
      </button>
    </div>
  );
};
