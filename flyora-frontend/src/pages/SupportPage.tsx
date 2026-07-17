import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, ArrowUpRight, Plus,
  MessageSquare, HelpCircle, FileQuestion, Mail, Phone, ChevronRight,
  MessageCircle, Clock, Send, CheckCircle2, AlertTriangle, X
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Sidebar } from '../components/Sidebar';
import './dashboard.css';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  lastUpdatedAt: string;
  messages: {
    sender: 'user' | 'agent';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Trips', icon: Plane },
  { label: 'Shipments', icon: Package },
  { label: 'Bookings', icon: CalendarDays },
  { label: 'Wallet', icon: Wallet },
  { label: 'Earnings', icon: CreditCard },
  { label: 'Messages', icon: Headphones },
  { label: 'Support', icon: Gift, active: true },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
];

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'contact'>('faq');
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Data state
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);

  // New Ticket Form
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<'Billing' | 'Technical' | 'Delivery Issue' | 'Verification'>('Technical');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newDescription, setNewDescription] = useState('');

  React.useEffect(() => {
    const fetchSupportData = async () => {
      try {
        const [faqsRes, ticketsRes] = await Promise.all([
          apiFetch('/api/support/faqs'),
          apiFetch('/api/support/tickets')
        ]);
        if (faqsRes.status === 'success' && Array.isArray(faqsRes.data)) {
          setFaqs(faqsRes.data.map((f: any) => ({
            id: f.id.toString(),
            category: f.category || 'General',
            question: f.question,
            answer: f.answer,
          })));
        }
        if (ticketsRes.status === 'success' && Array.isArray(ticketsRes.data)) {
          const loadedTickets = ticketsRes.data.map((t: any) => ({
            id: t.ticket_id || `TKT-${t.id}`,
            subject: t.subject,
            category: t.category,
            status: t.status,
            priority: t.priority,
            createdAt: new Date(t.created_at).toLocaleString(),
            lastUpdatedAt: new Date(t.updated_at).toLocaleString(),
            messages: (t.replies || []).map((r: any) => ({
              sender: r.sender_type === 'user' ? 'user' : 'agent',
              senderName: r.sender_name || 'Agent',
              text: r.message,
              timestamp: new Date(r.created_at).toLocaleString(),
            })),
          }));
          setTickets(loadedTickets);
          if (loadedTickets.length > 0) {
            setSelectedTicketId(loadedTickets[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load support data:', e);
      }
    };
    fetchSupportData();
  }, []);

  const handleSidebarClick = (label: string) => {
    const route = 
      label === 'Dashboard' ? '/dashboard' :
      label === 'Trips' ? '/trips' :
      label === 'Shipments' ? '/shipments' :
      label === 'Bookings' ? '/bookings' :
      label === 'Wallet' ? '/wallet' :
      label === 'Earnings' ? '/earnings' :
      label === 'Messages' ? '/messages' :
      label === 'Support' ? '/support' :
      label === 'Profile' ? '/profile' :
      label === 'Settings' ? '/settings' : undefined;
    if (route) navigate(route);
  };

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                            faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
      const matchesCategory = selectedFaqCategory === 'all' || faq.category === selectedFaqCategory;
      return matchesSearch && matchesCategory;
    });
  }, [faqSearch, selectedFaqCategory]);

  const activeTicket = useMemo(() => {
    return tickets.find(t => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !selectedTicketId) return;

    const newReply = {
      sender: 'user' as const,
      senderName: userName,
      text: ticketReplyText.trim(),
      timestamp: new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        return {
          ...t,
          lastUpdatedAt: newReply.timestamp,
          messages: [...t.messages, newReply]
        };
      }
      return t;
    }));

    setTicketReplyText('');

    // Trigger mock agent reply
    setTimeout(() => {
      const agentReply = {
        sender: 'agent' as const,
        senderName: 'Flyora Automated Support Agent',
        text: 'Thank you for your response. Our team has received your message and is processing it accordingly. You will be updated here shortly.',
        timestamp: new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      setTickets(prev => prev.map(t => {
        if (t.id === selectedTicketId) {
          return {
            ...t,
            lastUpdatedAt: agentReply.timestamp,
            messages: [...t.messages, agentReply]
          };
        }
        return t;
      }));
    }, 1500);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      subject: newSubject.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'Open',
      createdAt: new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      lastUpdatedAt: new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          sender: 'user',
          senderName: userName,
          text: newDescription.trim(),
          timestamp: new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setSelectedTicketId(newTicket.id);
    setActiveTab('tickets');
    setIsCreateTicketOpen(false);

    // Reset Form
    setNewSubject('');
    setNewDescription('');
  };

  return (
    <div className="fly-dashboard-shell support-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Support" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="fly-topbar">
            <label className="fly-search">
              <Search size={16} strokeWidth={2} />
              <input type="text" placeholder="Search FAQ articles..." value={faqSearch} onChange={(e) => setFaqSearch(e.target.value)} />
            </label>

            <div className="fly-topbar-actions">
              <button type="button" className="fly-icon-button fly-bell-button" aria-label="Notifications" onClick={() => navigate('/notifications')}>
                <Bell size={17} strokeWidth={2} />
                <span className="fly-badge-dot">3</span>
              </button>

              <button type="button" className="fly-profile-pill" onClick={() => navigate('/profile')}>
                <div className="fly-profile-avatar">{initials}</div>
                <div className="fly-profile-copy">
                  <span className="fly-profile-name">{userName}</span>
                  <span className="fly-profile-role">Traveler</span>
                </div>
                <ChevronDown size={14} strokeWidth={2.2} className="fly-profile-chevron" />
              </button>
            </div>
          </div>

          {/* Header */}
          <section className="trips-header fly-card">
            <div>
              <h1 className="trips-header__title">Help Center & Support</h1>
              <p className="trips-header__subtitle">Search our knowledge base, submit a ticket, or chat directly with our help desk.</p>
            </div>
            <button type="button" className="fly-btn fly-btn-primary" onClick={() => setIsCreateTicketOpen(true)}>
              <Plus size={14} strokeWidth={2.3} className="mr-1 inline" />
              Create New Ticket
            </button>
          </section>

          {/* Tab Selector */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-6">
            <button type="button" onClick={() => setActiveTab('faq')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'faq' ? 'bg-white text-flyora-navy shadow-sm' : 'text-slate-500 hover:text-flyora-navy'
            }`}>FAQs & Knowledge Base</button>
            <button type="button" onClick={() => setActiveTab('tickets')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'tickets' ? 'bg-white text-flyora-navy shadow-sm' : 'text-slate-500 hover:text-flyora-navy'
            }`}>My Support Tickets ({tickets.length})</button>
            <button type="button" onClick={() => setActiveTab('contact')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'contact' ? 'bg-white text-flyora-navy shadow-sm' : 'text-slate-500 hover:text-flyora-navy'
            }`}>Contact Support Agent</button>
          </div>

          {/* Tab: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {/* FAQ Categories Selection */}
              <div className="flex flex-wrap gap-2.5">
                {['all', 'General', 'Payments', 'Travelers', 'Senders', 'Security'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFaqCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedFaqCategory === cat ? 'bg-teal-50 border-flyora-teal text-flyora-teal' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {cat === 'all' ? 'All Articles' : cat}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-4">
                {filteredFaqs.map((faq) => {
                  const isOpen = expandedFaqId === faq.id;
                  return (
                    <article key={faq.id} className="fly-card p-0 overflow-hidden border border-gray-100 hover:border-slate-300 transition-all duration-300">
                      <button
                        type="button"
                        onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                        className="w-full p-4 text-left flex justify-between items-center bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-flyora-teal">
                            <FileQuestion size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-black text-flyora-navy">{faq.question}</span>
                            <span className="ml-3 text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{faq.category}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 bg-slate-50/30 border-t border-slate-50">
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">{faq.answer}</p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab: Tickets */}
          {activeTab === 'tickets' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Tickets List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Your Tickets</div>
                <div className="space-y-3">
                  {tickets.map(ticket => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full p-4 text-left fly-card border hover:border-slate-300 transition-all ${
                        selectedTicketId === ticket.id ? 'border-flyora-teal shadow-teal/5 bg-teal-50/10' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-flyora-teal">{ticket.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                          ticket.status === 'Open' ? 'bg-blue-50 text-blue-600' :
                          ticket.status === 'Pending Agent' ? 'bg-amber-50 text-amber-600' :
                          ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>{ticket.status}</span>
                      </div>
                      <h4 className="text-xs font-black text-flyora-navy truncate">{ticket.subject}</h4>
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-2 pt-2 border-t border-slate-100/50">
                        <span>{ticket.category}</span>
                        <span className={`uppercase text-[8px] ${
                          ticket.priority === 'Urgent' || ticket.priority === 'High' ? 'text-red-500' : 'text-slate-400'
                        }`}>{ticket.priority} Priority</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket Details Panel */}
              <div className="lg:col-span-3 flex flex-col fly-card p-0 border border-gray-100 overflow-hidden h-[500px]">
                {activeTicket ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-white">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="text-[10px] font-bold text-flyora-teal">{activeTicket.id}</span>
                          <h3 className="text-xs font-black text-flyora-navy mt-0.5">{activeTicket.subject}</h3>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Priority: {activeTicket.priority}</span>
                      </div>
                    </div>

                    {/* Chat timeline */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/10">
                      {activeTicket.messages.map((m, idx) => {
                        const isAgent = m.sender === 'agent';
                        return (
                          <div key={idx} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-semibold ${
                              isAgent ? 'bg-slate-100 text-flyora-navy' : 'bg-gradient-to-br from-flyora-teal to-teal-600 text-white shadow-teal'
                            }`}>
                              <p className="leading-relaxed">{m.text}</p>
                              <div className="flex justify-between items-center mt-2 text-[9px] opacity-75 font-bold">
                                <span>{m.senderName}</span>
                                <span>{m.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input */}
                    {activeTicket.status !== 'Closed' ? (
                      <form className="p-4 border-t border-gray-100 bg-white flex gap-2 items-center" onSubmit={handleSendTicketReply}>
                        <input
                          type="text"
                          placeholder="Type a response message..."
                          value={ticketReplyText}
                          onChange={(e) => setTicketReplyText(e.target.value)}
                          className="dash-input text-xs w-full py-2.5"
                        />
                        <button type="submit" className="w-9 h-9 rounded-xl bg-flyora-teal text-white flex items-center justify-center shadow-teal hover:bg-teal-600 transition-colors shrink-0">
                          <Send size={15} />
                        </button>
                      </form>
                    ) : (
                      <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-400 font-bold bg-slate-50/50">
                        This support ticket is closed.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/5">
                    <MessageSquare size={42} className="text-gray-200 mb-3" />
                    <div className="text-sm font-bold text-flyora-navy">Select a Ticket</div>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs font-semibold">Select an existing support ticket on the left to see conversation logs.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Contact */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Live Chat */}
              <article className="fly-card text-center hover:border-flyora-teal transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-flyora-teal flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={22} />
                  </div>
                  <h3 className="text-xs font-black text-flyora-navy uppercase tracking-wider mb-2">Live Chat</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Speak directly with a support specialist. Typical response time is under 3 minutes.
                  </p>
                </div>
                <button type="button" className="fly-btn fly-btn-primary fly-btn-full mt-6" onClick={() => alert('Starting Live Chat Client...')}>Start Live Chat</button>
              </article>

              {/* Email support */}
              <article className="fly-card text-center hover:border-flyora-teal transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
                    <Mail size={22} />
                  </div>
                  <h3 className="text-xs font-black text-flyora-navy uppercase tracking-wider mb-2">Email Support</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Submit complex queries and booking documentation. We reply within 12 hours.
                  </p>
                </div>
                <button type="button" className="fly-btn fly-btn-secondary fly-btn-full mt-6" onClick={() => alert('Compose email to support@flyorago.com')}>support@flyorago.com</button>
              </article>

              {/* Hotline support */}
              <article className="fly-card text-center hover:border-flyora-teal transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                    <Phone size={22} />
                  </div>
                  <h3 className="text-xs font-black text-flyora-navy uppercase tracking-wider mb-2">Phone Hotline</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Call for urgent cargo or flight custom issues. 24/7 support line.
                  </p>
                </div>
                <button type="button" className="fly-btn fly-btn-secondary fly-btn-full mt-6" onClick={() => alert('Dialing Flyora Payout Hotline +1 (800) 555-0199')}>+1 (800) 555-0199</button>
              </article>
            </div>
          )}

        </main>

        {/* Right Utility Panel */}
        <aside className="fly-utility-panel">
          {/* Quick Help Card */}
          <article className="fly-card fly-utility-card bg-slate-900 border-0 text-white">
            <div className="text-[10px] font-black uppercase tracking-wider text-teal-400 mb-1">Knowledge Center</div>
            <div className="text-sm font-black mb-2">Disputes & Claims</div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              If traveler and sender face cargo delivery check failures, the escrow reward is frozen automatically until evidence details are provided.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
              <Clock size={14} className="text-teal-400" />
              <span>Response: 24/7 Agent Availability</span>
            </div>
          </article>

          {/* Quick Help Link List */}
          <article className="fly-card fly-utility-card">
            <div className="fly-card-title text-sm font-bold uppercase tracking-wider mb-3">Popular FAQs</div>
            <div className="space-y-2 text-xs font-semibold text-slate-500">
              <button type="button" onClick={() => { setActiveTab('faq'); setExpandedFaqId('faq-2'); }} className="text-left w-full hover:text-flyora-teal flex justify-between items-center py-1">
                <span>What is Escrow Protection?</span>
                <ChevronRight size={13} />
              </button>
              <button type="button" onClick={() => { setActiveTab('faq'); setExpandedFaqId('faq-3'); }} className="text-left w-full hover:text-flyora-teal flex justify-between items-center py-1">
                <span>Allowed Packages checklist?</span>
                <ChevronRight size={13} />
              </button>
              <button type="button" onClick={() => { setActiveTab('faq'); setExpandedFaqId('faq-4'); }} className="text-left w-full hover:text-flyora-teal flex justify-between items-center py-1">
                <span>How verification works?</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </article>
        </aside>

      </div>

      {/* Create Ticket Modal */}
      {isCreateTicketOpen && (
        <div className="trip-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsCreateTicketOpen(false)}>
          <div className="trip-modal fly-card max-w-md">
            <div className="trip-modal__header">
              <div>
                <div className="fly-card-title">Create Support Ticket</div>
                <p>Describe your issue and submit documents to our team.</p>
              </div>
              <button type="button" className="trip-modal__close" onClick={() => setIsCreateTicketOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form className="trip-modal__form mt-4 space-y-4" onSubmit={handleCreateTicketSubmit}>
              <label className="block">
                <span className="dash-input-label">Subject</span>
                <input type="text" required placeholder="e.g. Settlement issue for Trip #9901" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="dash-input mt-1 w-full" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="dash-input-label">Category</span>
                  <select className="dash-input mt-1 w-full" value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)}>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Delivery Issue">Delivery Issue</option>
                    <option value="Verification">Verification</option>
                  </select>
                </label>
                <label className="block">
                  <span className="dash-input-label">Priority</span>
                  <select className="dash-input mt-1 w-full" value={newPriority} onChange={(e) => setNewPriority(e.target.value as any)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="dash-input-label">Description / Message</span>
                <textarea rows={4} required placeholder="Detail the issue, listing flight numbers, date, packages details, etc." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="dash-input mt-1 w-full" />
              </label>

              <div className="trip-modal__actions pt-2">
                <button type="button" className="fly-btn fly-btn-secondary" onClick={() => setIsCreateTicketOpen(false)}>Cancel</button>
                <button type="submit" className="fly-btn fly-btn-primary">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportPage;
