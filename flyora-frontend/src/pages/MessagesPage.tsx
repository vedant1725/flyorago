import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, Send, Paperclip,
  Image, Mic, CheckCheck, Circle, Star, Info, Volume2, Download, Eye
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Sidebar } from '../components/Sidebar';
import './dashboard.css';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text?: string;
  time: string;
  type: 'text' | 'image' | 'file' | 'voice';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  voiceDuration?: string;
  seen?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  verified: boolean;
  rating?: number;
  tripsCompleted?: number;
  packagesDelivered?: number;
  messages: Message[];
}

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await apiFetch('/api/chat/conversations');
        if (res.status === 'success' && Array.isArray(res.data)) {
          const loadedConvs = res.data.map((c: any) => ({
            id: c.id.toString(),
            name: c.participant_name || 'User',
            avatar: c.participant_name ? c.participant_name[0].toUpperCase() : 'U',
            role: 'Participant',
            lastMessage: c.last_message_content || 'No messages yet.',
            time: c.last_message_time ? new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            unreadCount: 0,
            online: false,
            verified: true,
            messages: []
          }));
          setConversations(loadedConvs);
          if (loadedConvs.length > 0) {
            setSelectedConvId(loadedConvs[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConvId) return;
    const fetchMessages = async () => {
      try {
        const res = await apiFetch(`/api/chat/conversations/${selectedConvId}/messages`);
        if (res.status === 'success' && Array.isArray(res.data)) {
          const loadedMessages = res.data.map((m: any) => ({
            id: m.id.toString(),
            sender: m.is_sender ? 'me' : 'them',
            text: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            seen: m.read,
          }));
          setConversations(prev => prev.map(c => {
            if (c.id === selectedConvId) {
              return { ...c, messages: loadedMessages };
            }
            return c;
          }));
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, [selectedConvId]);


  const activeConv = useMemo(() => {
    return conversations.find(c => c.id === selectedConvId) || conversations[0];
  }, [conversations, selectedConvId]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [conversations, searchQuery]);

  // Scroll to bottom when active conversation or messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Mark messages as read
    if (activeConv && activeConv.unreadCount > 0) {
      setConversations(prev => prev.map(c => {
        if (c.id === activeConv.id) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      }));
    }
  }, [selectedConvId, activeConv?.messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMessage: Message = {
      id: `msg-custom-${Date.now()}`,
      sender: 'me',
      text: typedMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      seen: false
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedConvId) {
        return {
          ...c,
          lastMessage: newMessage.text,
          time: 'Just now',
          messages: [...c.messages, newMessage]
        };
      }
      return c;
    }));

    setTypedMessage('');

    // Trigger a mock auto-reply after 1.5s
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMessage: Message = {
        id: `msg-reply-${Date.now()}`,
        sender: 'them',
        text: `Got your message! Let's keep moving forward with our transaction.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        seen: false
      };
      
      setConversations(prev => prev.map(c => {
        if (c.id === selectedConvId) {
          return {
            ...c,
            lastMessage: replyMessage.text,
            time: 'Just now',
            messages: [...c.messages, replyMessage]
          };
        }
        return c;
      }));
    }, 2000);
  };

  return (
    <div className="fly-dashboard-shell messages-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Messages" />

        {/* Main Panel */}
        <main className="fly-main-panel flex flex-row p-0 min-h-[calc(100vh-140px)] gap-0 overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm">
          
          {/* Chat List Column */}
          <div className="w-[320px] shrink-0 border-r border-gray-100 flex flex-col h-full bg-slate-50/20">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="dash-input pl-9 text-xs w-full py-2 bg-white"
                />
              </div>
            </div>

            {/* Conversations Stream */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50/70">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-4 text-left flex gap-3 hover:bg-slate-50/70 transition-all ${
                    selectedConvId === conv.id ? 'bg-teal-50/40 border-l-[3px] border-flyora-teal pl-[13px]' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flyora-teal to-teal-500 text-white flex items-center justify-center font-bold text-sm">
                      {conv.avatar}
                    </div>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-xs font-black text-flyora-navy truncate">{conv.name}</span>
                      <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">{conv.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium truncate mb-1">{conv.role}</p>
                    <p className="text-[11px] text-gray-500 truncate leading-snug font-medium">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 self-center w-5 h-5 rounded-full bg-flyora-teal text-white text-[9px] font-black flex items-center justify-center shadow-teal">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))}
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-xs text-gray-400 font-bold">No chats found.</div>
              )}
            </div>
          </div>

          {/* Active Chat Window Column */}
          <div className="flex-1 flex flex-col h-full bg-white relative">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm/5 z-10">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flyora-teal to-teal-500 text-white flex items-center justify-center font-bold text-sm">
                      {activeConv.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-flyora-navy">{activeConv.name}</span>
                        {activeConv.verified && (
                          <BadgeCheck size={14} className="text-flyora-teal" />
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {activeConv.role} • {activeConv.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/10">
                  {activeConv.messages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-3.5 text-xs font-semibold ${
                          isMe ? 'bg-gradient-to-br from-flyora-teal to-teal-600 text-white shadow-teal' : 'bg-slate-100 text-flyora-navy'
                        }`}>
                          {/* Text Message */}
                          {msg.type === 'text' && <p className="leading-relaxed">{msg.text}</p>}

                          {/* Image Message */}
                          {msg.type === 'image' && (
                            <div className="space-y-2">
                              <img src={msg.mediaUrl} alt="attachment" className="rounded-xl max-h-48 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.mediaUrl)} />
                              <p className="text-[10px] opacity-80">{msg.text}</p>
                            </div>
                          )}

                          {/* File Attachment */}
                          {msg.type === 'file' && (
                            <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-xl border border-white/10">
                              <FileText size={20} className={isMe ? 'text-white' : 'text-flyora-teal'} />
                              <div className="text-left min-w-0">
                                <p className="font-bold truncate text-[11px]">{msg.fileName}</p>
                                <p className="text-[9px] opacity-75">{msg.fileSize}</p>
                              </div>
                              <button type="button" className="ml-2 w-7 h-7 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center text-white" onClick={() => alert(`Downloading ${msg.fileName}`)}>
                                <Download size={12} />
                              </button>
                            </div>
                          )}

                          {/* Voice Message */}
                          {msg.type === 'voice' && (
                            <div className="flex items-center gap-3.5 min-w-[200px]">
                              <button type="button" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
                                <Volume2 size={14} />
                              </button>
                              <div className="flex-1 h-1.5 bg-white/30 rounded relative overflow-hidden">
                                <span className="absolute left-0 top-0 bottom-0 w-1/3 bg-white" />
                              </div>
                              <span className="text-[10px] opacity-85 font-mono">{msg.voiceDuration}</span>
                            </div>
                          )}

                          {/* Time & Read Status */}
                          <div className="flex justify-end items-center gap-1 mt-1.5 text-[9px] opacity-70">
                            <span>{msg.time}</span>
                            {isMe && (
                              <CheckCheck size={12} className={msg.seen ? 'text-teal-200' : 'text-white/60'} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 text-gray-400 rounded-2xl py-2.5 px-4 text-xs font-bold animate-pulse">
                        Typing...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Form Area */}
                <form className="p-4 border-t border-gray-100 bg-white flex gap-2 items-center" onSubmit={handleSendMessage}>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" className="w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center text-gray-400 hover:text-flyora-teal" onClick={() => alert('Select Image attachment')} title="Attach Image">
                      <Image size={16} />
                    </button>
                    <button type="button" className="w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center text-gray-400 hover:text-flyora-teal" onClick={() => alert('Select Document attachment')} title="Attach File">
                      <Paperclip size={16} />
                    </button>
                    <button type="button" className="w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center text-gray-400 hover:text-flyora-teal" onClick={() => alert('Start recording audio')} title="Record Audio">
                      <Mic size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="dash-input text-xs w-full py-2.5"
                  />
                  <button type="submit" className="w-9 h-9 rounded-xl bg-flyora-teal text-white flex items-center justify-center shadow-teal hover:bg-teal-600 transition-colors shrink-0">
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/5">
                <Headphones size={42} className="text-gray-200 mb-3" />
                <div className="text-sm font-bold text-flyora-navy">Select a Conversation</div>
                <p className="text-xs text-gray-400 mt-1 max-w-xs font-semibold">Choose a sender or traveler from the sidebar to start chat details.</p>
              </div>
            )}
          </div>

          {/* User Profile Panel Column (Right Side) */}
          {activeConv && (
            <div className="w-[280px] shrink-0 border-l border-gray-100 flex flex-col h-full bg-slate-50/10 p-5">
              <div className="text-center pb-5 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-flyora-teal to-teal-500 text-white flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-teal">
                  {activeConv.avatar}
                </div>
                <h4 className="text-xs font-black text-flyora-navy">{activeConv.name}</h4>
                <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>{activeConv.role}</span>
                  {activeConv.verified && (
                    <span className="text-flyora-teal bg-teal-50 px-1.5 py-0.5 rounded font-black">Verified</span>
                  )}
                </div>
              </div>

              {/* User Ratings & Stats */}
              <div className="mt-5 space-y-4 flex-1">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1">User Metrics</div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-white border border-gray-100 p-2.5 rounded-xl text-center">
                      <div className="text-xs font-bold text-gray-400">Completed</div>
                      <div className="text-xs font-black text-flyora-navy mt-1">
                        {activeConv.tripsCompleted !== undefined ? `${activeConv.tripsCompleted} Trips` : `${activeConv.packagesDelivered} Packages`}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-100 p-2.5 rounded-xl text-center">
                      <div className="text-xs font-bold text-gray-400">Rating</div>
                      <div className="text-xs font-black text-flyora-navy mt-1 flex items-center justify-center gap-0.5">
                        <Star size={11} className="fill-amber-400 text-amber-400" /> {activeConv.rating || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-teal-50/50 border border-teal-100/50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1.5 text-flyora-teal">
                    <ShieldCheck size={14} strokeWidth={2.4} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Transaction Info</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                    This chat corresponds to package space logistics. Make sure all items are documented in detail on the booking log.
                  </p>
                </div>
              </div>

              {/* Safety notice */}
              <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 leading-relaxed font-bold">
                Never accept payments outside Flyora Escrow Guarantee to ensure fraud protection.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;
