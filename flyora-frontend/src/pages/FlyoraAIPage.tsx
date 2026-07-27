import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useFlyoraAI } from '../context/FlyoraAIContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, Bot, User, Copy, Check, Plus, Trash2,
  ArrowRight
} from 'lucide-react';

const FlyoraAIPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    messages,
    isGenerating,
    sendMessage,
    clearChat,
    createNewChat
  } = useFlyoraAI();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    <div className="flex flex-col lg:flex-row min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-800 font-sans">
      <Sidebar activeItem="Flyora AI" />

      <main className="flex-1 min-w-0 w-full max-w-full lg:ml-[240px] pb-24 lg:pb-12 px-4 sm:px-8 pt-6 max-w-7xl mx-auto space-y-6 overflow-x-hidden flex flex-col h-screen">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-flyora-teal via-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/20">
              <Sparkles size={24} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Flyora AI Workspace</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-flyora-teal text-xs font-bold border border-teal-200">
                  Enterprise AI
                </span>
              </div>
              <p className="text-xs text-slate-500">Intelligent travel logistics assistant for Luggage Sharing, Parcels & Escrow</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={createNewChat}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-2 border border-slate-200"
            >
              <Plus size={16} /> New Chat
            </button>
            <button
              onClick={clearChat}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold text-xs transition flex items-center gap-2 border border-slate-200"
            >
              <Trash2 size={16} /> Clear Chat
            </button>
          </div>
        </div>

        {/* Chat Stream Body */}
        <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-200 shadow-xs">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-4 ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              {m.sender === 'ai' && (
                <div className="w-10 h-10 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0 text-flyora-teal shadow-xs">
                  <Bot size={22} />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-3xl p-5 text-sm leading-relaxed space-y-3 shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-flyora-teal text-white font-medium rounded-tr-none shadow-md shadow-teal-500/10'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {m.text.split('\n').map((line, idx) => {
                    if (line.startsWith('• ') || line.startsWith('1. ')) {
                      return <div key={idx} className="ml-2 font-medium my-0.5 text-slate-700">{line}</div>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <strong key={idx} className="block text-slate-900 font-bold my-1">{line.replace(/\*\*/g, '')}</strong>;
                    }
                    return <p key={idx}>{line.replace(/\*\*/g, '')}</p>;
                  })}
                </div>

                {/* Actions */}
                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
                    {m.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(act.path)}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-teal-50 text-flyora-teal font-bold text-xs border border-teal-200 transition flex items-center gap-1.5 shadow-xs"
                      >
                        <span>{act.label}</span>
                        <ArrowRight size={13} />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>{m.timestamp}</span>
                  {m.sender === 'ai' && (
                    <button
                      onClick={() => handleCopy(m.text, m.id)}
                      className="hover:text-slate-700 transition flex items-center gap-1"
                    >
                      {copiedId === m.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs border border-slate-300">
                  <User size={20} />
                </div>
              )}
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 border border-teal-200 flex items-center justify-center text-flyora-teal">
                <Bot size={20} className="animate-spin" />
              </div>
              <div className="bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-flyora-teal animate-ping"></div>
                <span className="text-xs text-slate-500 font-medium">Flyora AI is generating your response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shrink-0 space-y-3 shadow-sm">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100/80 rounded-2xl px-5 py-3 flex items-center gap-3 focus-within:bg-slate-100 transition">
              <input
                type="text"
                placeholder="Ask Flyora AI about Luggage Sharing, Parcels, Wallet & Escrow..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="w-full bg-transparent text-slate-800 text-sm font-medium focus:outline-none focus:ring-0 outline-none border-none placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="px-6 py-3.5 rounded-2xl bg-flyora-teal hover:bg-teal-600 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 transition shadow-md shadow-teal-500/20"
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>

      </main>
    </div>
  );
};

export default FlyoraAIPage;
