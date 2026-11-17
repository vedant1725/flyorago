import React, { useState, useRef, useEffect } from 'react';
import { useFlyoraAI } from '../../context/FlyoraAIContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, X, Maximize2, Minimize2, Send, Copy, Check,
  Trash2, Plus, ArrowRight, Bot, User, Mic, Paperclip, Zap, ShieldCheck
} from 'lucide-react';

export const FlyoraAIChatWindow: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Floating AI Chat window is exclusive to Dashboard
  if (!isOpen || location.pathname !== '/dashboard') return null;

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

  const handlePromptClick = (promptText: string) => {
    sendMessage(promptText);
  };

  return (
    <div
      className={`fixed z-[1000] bg-white shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border border-slate-200/90 ${
        isExpanded
          ? 'inset-4 md:inset-10 rounded-3xl'
          : 'bottom-6 right-6 w-[94vw] sm:w-[440px] h-[640px] max-h-[85vh] rounded-3xl'
      }`}
      style={{
        boxShadow: '0 25px 60px -15px rgba(13, 148, 136, 0.25), 0 0 1px 1px rgba(0,0,0,0.05)'
      }}
    >
      {/* Top Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-flyora-navy via-slate-900 to-teal-950 text-white flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-flyora-teal to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/30">
              <Bot size={22} />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-white tracking-tight">Flyora AI</h3>
              <span className="px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-extrabold text-[10px] tracking-wide border border-teal-400/30">
                PRO ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1 mt-0.5">
              <Sparkles size={11} className="text-amber-400" /> Luggage Match & Escrow Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <button
            onClick={() => createNewChat()}
            className="p-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
            title="Start New Chat"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => toggleExpand()}
            className="p-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors hidden sm:block"
            title={isExpanded ? 'Restore Size' : 'Expand Window'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={() => closeAI()}
            className="p-2 rounded-xl hover:bg-white/10 hover:text-rose-400 transition-colors"
            title="Close Assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/60 px-5 pt-2 shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'chat'
              ? 'border-flyora-teal text-flyora-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Chat Conversation</span>
        </button>
        <button
          onClick={() => setActiveTab('shortcuts')}
          className={`pb-2.5 px-3 text-xs font-black transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'shortcuts'
              ? 'border-flyora-teal text-flyora-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap size={13} className="text-amber-500" />
          <span>Quick Prompts</span>
        </button>
      </div>

      {/* Messages List Area */}
      {activeTab === 'chat' ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = (msg as any).role === 'user' || msg.sender === 'user';
            const messageText = (msg as any).content || msg.text || '';
            const actions = msg.actions || [];

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`relative group max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-tr from-flyora-teal to-teal-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-medium">{messageText}</div>

                  {/* Action Navigation Pills */}
                  {!isUser && actions && actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5 pt-2 border-t border-slate-100">
                      {actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            navigate(act.path);
                            if (window.innerWidth < 768) closeAI();
                          }}
                          className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-flyora-teal font-bold text-[11px] border border-teal-200/60 transition flex items-center gap-1 active:scale-95"
                        >
                          <span>{act.label}</span>
                          <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(messageText, msg.id)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User size={15} />
                  </div>
                )}
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex gap-3 text-xs justify-start items-center">
              <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200 animate-pulse">
                <Bot size={15} />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm text-slate-500 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-2">Flyora AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/40">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
            Suggested Intelligent Prompts
          </h4>
          {suggestedPrompts.map((p, i) => {
            const promptText = typeof p === 'string' ? p : p.prompt || p.title;
            const promptTitle = typeof p === 'string' ? p : p.title || p.prompt;
            return (
              <button
                key={i}
                onClick={() => {
                  handlePromptClick(promptText);
                  setActiveTab('chat');
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-400 hover:bg-teal-50/30 text-xs font-bold text-slate-700 hover:text-teal-900 transition flex items-center justify-between group shadow-sm"
              >
                <span>{promptTitle}</span>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about trips, luggage, escrow security..."
            disabled={isGenerating}
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/10 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 p-2 rounded-xl bg-flyora-teal hover:bg-teal-700 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};
