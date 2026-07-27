import React, { useState, useRef, useEffect } from 'react';
import { useFlyoraAI } from '../../context/FlyoraAIContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, X, Maximize2, Minimize2, Send, Copy, Check,
  Trash2, Plus, ArrowRight, Bot, User, Mic, Paperclip, Zap, ShieldCheck
} from 'lucide-react';

export const FlyoraAIChatWindow: React.FC = () => {
  const navigate = useNavigate();
  const {
    isOpen,
    isExpanded,
    isMinimized,
    isGenerating,
    messages,
    suggestedPrompts,
    closeAI,
    toggleExpand,
    sendMessage,
    clearChat,
    createNewChat
  } = useFlyoraAI();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'shortcuts'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  if (!isOpen) return null;

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

  const handleActionClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) {
      closeAI();
    }
  };

  return (
    <div
      className={`fixed z-[998] transition-all duration-300 flex flex-col shadow-2xl overflow-hidden font-sans border-2 border-teal-100 bg-white/95 backdrop-blur-2xl ${
        isExpanded
          ? 'inset-2 md:inset-6 rounded-3xl text-slate-800'
          : isMinimized
          ? 'bottom-24 right-4 sm:right-8 w-80 h-16 rounded-2xl bg-white text-slate-800 shadow-2xl border-teal-300'
          : 'bottom-24 right-4 sm:right-8 w-[92vw] sm:w-[460px] h-[620px] max-h-[84vh] rounded-3xl bg-white text-slate-800'
      }`}
    >
      {/* ─── GOOGLE / COPILOT STYLE LIGHT GRADIENT HEADER ─── */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-flyora-teal via-teal-600 to-emerald-500 text-white border-b border-teal-600 flex items-center justify-between shrink-0 select-none shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white tracking-tight">Flyora AI</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider border border-white/30 flex items-center gap-1">
                <Zap size={10} className="text-amber-300 fill-amber-300" /> PRO ENGINE v2.0
              </span>
            </div>
            <p className="text-[10px] text-teal-100 font-medium">Intent-Aware Copilot & Logistics Intelligence</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={createNewChat}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition"
            title="New Chat Session"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={clearChat}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition"
            title="Clear Chat History"
          >
            <Trash2 size={17} />
          </button>
          <button
            onClick={toggleExpand}
            className="hidden sm:flex p-2 rounded-xl hover:bg-white/20 text-white transition"
            title={isExpanded ? 'Restore Size' : 'Expand Fullscreen'}
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={closeAI}
            className="p-2 rounded-xl hover:bg-rose-500/30 text-white transition"
            title="Close Assistant"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* ─── CHAT MESSAGES STREAM ─── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {m.sender === 'ai' && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-50 to-emerald-100 border-2 border-teal-200 flex items-center justify-center shrink-0 text-flyora-teal shadow-xs">
                    <Bot size={20} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-flyora-teal to-teal-600 text-white font-medium rounded-tr-none shadow-md shadow-teal-500/15'
                      : 'bg-white text-slate-800 border-2 border-slate-100 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {m.text.split('\n').map((line, idx) => {
                      if (line.startsWith('• ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                        return <div key={idx} className="ml-2 font-medium my-0.5 text-slate-700">{line}</div>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <strong key={idx} className="block text-slate-900 font-bold my-1 text-sm">{line.replace(/\*\*/g, '')}</strong>;
                      }
                      return <p key={idx}>{line.replace(/\*\*/g, '')}</p>;
                    })}
                  </div>

                  {/* AI Quick Nav Action Chips */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      {m.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act.path)}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-flyora-teal font-extrabold text-xs border border-teal-200/80 transition flex items-center gap-1.5 shadow-xs hover:scale-105"
                        >
                          <span>{act.label}</span>
                          <ArrowRight size={13} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Footer */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="font-semibold">{m.timestamp}</span>
                    {m.sender === 'ai' && (
                      <button
                        onClick={() => handleCopy(m.text, m.id)}
                        className="hover:text-slate-700 transition flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-slate-100"
                      >
                        {copiedId === m.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs border border-slate-300 shadow-xs">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isGenerating && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-flyora-teal">
                  <Bot size={18} className="animate-spin" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-flyora-teal animate-ping"></div>
                  <span className="text-xs text-slate-600 font-bold">Flyora AI is reasoning...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── SUGGESTED PROMPTS PILLS ─── */}
          {messages.length < 3 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Suggested Prompts</span>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {suggestedPrompts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => sendMessage(p.prompt)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-slate-700 hover:text-flyora-teal font-bold text-xs whitespace-nowrap border border-slate-200 hover:border-teal-300 transition shadow-xs"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── CHATGPT / GEMINI STYLE POWERFUL INPUT FORM ─── */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 shadow-lg">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div
                className="flex-1 bg-slate-100/80 rounded-2xl px-4 py-2.5 flex items-center gap-2 transition focus-within:bg-slate-100"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              >
                <input
                  type="text"
                  placeholder="Ask Flyora AI anything..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  style={{ border: 'none', outline: 'none', boxShadow: 'none', background: 'transparent' }}
                  className="w-full bg-transparent text-slate-800 text-xs sm:text-sm font-semibold border-0 outline-none ring-0 shadow-none placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-0"
                />

                <div className="flex items-center gap-1.5 text-slate-400">
                  <button
                    type="button"
                    onClick={() => sendMessage("How does luggage sharing work?")}
                    className="p-1 rounded-lg hover:text-flyora-teal hover:bg-teal-50 transition"
                    title="Quick Topic"
                  >
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isGenerating}
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-flyora-teal to-teal-600 hover:from-teal-600 hover:to-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition shadow-lg shadow-teal-500/25 shrink-0 hover:scale-105"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
