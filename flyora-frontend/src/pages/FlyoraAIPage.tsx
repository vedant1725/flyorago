import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useFlyoraAI } from '../context/FlyoraAIContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, Bot, User, Copy, Check, Plus, Trash2,
  ArrowRight, Search, X, ShieldCheck, HelpCircle
} from 'lucide-react';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import '../pages/dashboard.css';

const FlyoraAIPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    messages,
    isGenerating,
    sendMessage,
    clearChat,
    createNewChat,
    suggestedPrompts
  } = useFlyoraAI();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    sendMessage(input);
    setInput('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      <Sidebar activeItem="Flyora AI" />

      <main className="flex-1 min-w-0 w-full lg:ml-[240px] flex flex-col min-h-screen relative pb-20 lg:pb-12">
        {/* Subtle Ambient Flyora Teal Background Wave */}
        <div className="absolute top-0 right-0 w-full h-[460px] overflow-hidden pointer-events-none -z-0">
          <svg className="w-full h-full" viewBox="0 0 1440 460" fill="none" preserveAspectRatio="none">
            <path
              d="M620 0 C860 130, 1120 40, 1440 140 L1440 0 Z"
              fill="#F0FDFA"
              fillOpacity="0.75"
            />
            <path
              d="M450 0 C680 180, 1020 200, 1440 70 L1440 0 Z"
              fill="#CCFBF1"
              fillOpacity="0.4"
            />
          </svg>
        </div>

        {/* ─── Top Header (Global Search + Notification + Profile) ─── */}
        <header className="flex h-20 items-center justify-between px-4 sm:px-8 xl:px-10 shrink-0 gap-4 sm:gap-6 relative z-30">
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center gap-3 bg-white border border-slate-200/80 hover:border-slate-300 rounded-full px-4 py-2.5 shadow-[0_2px_8px_rgba(10,22,40,0.02)] transition-all">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={e => setHeaderSearchQuery(e.target.value)}
                placeholder="Search Flyora AI topics..."
                className="flex-1 bg-transparent text-sm text-slate-800 font-medium border-0 outline-none ring-0 placeholder:text-slate-400"
              />
              {headerSearchQuery ? (
                <button onClick={() => setHeaderSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-md">
                  Ctrl K
                </kbd>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        {/* ─── Main Content Container (Consistent px-4 sm:px-8 xl:px-10 margins) ─── */}
        <div className="px-4 sm:px-8 xl:px-10 space-y-5 relative z-20 flex-1 flex flex-col">

          {/* ─── AI Workspace Header Card ─── */}
          <div className="bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-[0_4px_20px_rgba(10,22,40,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-flyora-teal to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
                <Bot size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">Flyora AI Workspace</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-flyora-teal text-[11px] font-black border border-teal-200/70">
                    Active Assistant
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Intelligent logistics assistant for Baggage Monetization, Escrow, KYC & Parcel Handover
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={createNewChat}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Plus size={15} /> New Chat
              </button>
              <button
                onClick={clearChat}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Trash2 size={15} /> Clear
              </button>
            </div>
          </div>

          {/* ─── Chat Stream Body ─── */}
          <div className="flex-1 bg-white p-5 sm:p-6 rounded-[28px] border border-slate-200/80 shadow-[0_4px_20px_rgba(10,22,40,0.03)] overflow-y-auto space-y-5 min-h-[380px] max-h-[550px]">
            {messages.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal mb-4">
                  <Bot size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">How can Flyora AI help you today?</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium mb-6">
                  Ask questions about posting trips, sender requests, escrow protection rules, or KYC verification.
                </p>

                {/* Suggested Prompt Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl text-left">
                  {[
                    "How does Escrow Payment guarantee safe deliveries?",
                    "How do travelers calculate luggage rates per kg?",
                    "What documents are required for KYC verification?",
                    "How does parcel handover and OTP verification work?"
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(p)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 hover:border-teal-200 text-xs font-bold text-slate-700 hover:text-flyora-teal transition text-left"
                    >
                      {p} →
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(m => (
                <div
                  key={m.id}
                  className={`flex gap-3.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-flyora-teal shadow-2xs mt-1">
                      <Bot size={18} />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                      m.sender === 'user'
                        ? 'bg-flyora-teal text-white font-medium rounded-tr-none shadow-md shadow-teal-500/10'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {m.text.split('\n').map((line, idx) => {
                        if (line.startsWith('• ') || line.startsWith('1. ')) {
                          return <div key={idx} className="ml-2 font-medium my-0.5">{line}</div>;
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <strong key={idx} className="block font-black my-1">{line.replace(/\*\*/g, '')}</strong>;
                        }
                        return <p key={idx}>{line.replace(/\*\*/g, '')}</p>;
                      })}
                    </div>

                    {/* Actions */}
                    {m.actions && m.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/60">
                        {m.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => navigate(act.path)}
                            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-flyora-teal font-bold text-xs border border-teal-200 transition flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>{act.label}</span>
                            <ArrowRight size={12} />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{m.timestamp}</span>
                      {m.sender === 'ai' && (
                        <button
                          onClick={() => handleCopy(m.text, m.id)}
                          className="hover:text-slate-700 transition flex items-center gap-1 font-bold"
                        >
                          {copiedId === m.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs border border-slate-300 mt-1">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))
            )}

            {isGenerating && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal shrink-0">
                  <Bot size={18} className="animate-spin" />
                </div>
                <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-flyora-teal animate-ping" />
                  <span className="text-xs text-slate-500 font-medium">Flyora AI is analyzing and composing reply...</span>
                </div>
              </div>
            )}
          </div>

          {/* ─── Input Bar ─── */}
          <div className="bg-white p-3 sm:p-4 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgba(10,22,40,0.03)] shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
              <input
                type="text"
                placeholder="Ask Flyora AI about parcels, traveler trips, rates, wallet & escrow..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-flyora-teal focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isGenerating}
                className="px-5 py-3 rounded-2xl bg-flyora-teal hover:bg-[#0F766E] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm shrink-0"
              >
                <Send size={15} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default FlyoraAIPage;
