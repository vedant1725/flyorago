import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, ArrowLeft,
  Calendar, CheckCircle2, AlertTriangle, Download, Printer
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Sidebar } from '../components/Sidebar';
import './dashboard.css';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Trips', icon: Plane },
  { label: 'Shipments', icon: Package },
  { label: 'Bookings', icon: CalendarDays },
  { label: 'Wallet', icon: Wallet, active: true },
  { label: 'Earnings', icon: CreditCard },
  { label: 'Messages', icon: Headphones },
  { label: 'Support', icon: Gift },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
];

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        // Clean ID format
        const cleanId = id ? id.replace('#TXN', '').replace('#', '') : '';
        const res = await apiFetch(`/api/wallet/transactions/${cleanId}`);
        if (res.status === 'success' && res.data) {
          const t = res.data;
          const isCredit = ['Deposit', 'Payment Received', 'Refund'].includes(t.type);
          setTx({
            id: `#TXN${t.id}`,
            description: t.description || 'Wallet transaction',
            date: t.created_at ? new Date(t.created_at).toLocaleString() : 'Just now',
            category: t.type || 'Transfer',
            type: isCredit ? 'credit' : 'debit',
            amount: parseFloat(t.amount) || 0.00,
            status: t.status || 'Completed',
            reference: t.refId || `REF-${t.id}`
          });
        }
      } catch (err) {
        console.error('Failed to fetch transaction details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

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

  if (loading) {
    return (
      <div className="fly-dashboard-shell">
        <div className="fly-dashboard-layout p-8 text-center text-teal-400 font-bold">
          Loading Transaction Details...
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="fly-dashboard-shell">
        <div className="fly-dashboard-layout p-8 text-center">
          <h2 className="text-xl font-black text-flyora-navy">Transaction Not Found</h2>
          <p className="text-xs text-gray-400 mt-2">The transaction reference #{id} does not exist.</p>
          <button type="button" className="fly-btn fly-btn-primary mt-4" onClick={() => navigate('/wallet')}>
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fly-dashboard-shell transaction-details-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Wallet" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="fly-topbar">
            <button type="button" className="flex items-center gap-1 text-xs font-black text-flyora-navy" onClick={() => navigate('/wallet')}>
              <ArrowLeft size={14} /> Back to Wallet
            </button>

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
              <div className="flex items-center gap-3">
                <h1 className="trips-header__title">Transaction {tx.id}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                  tx.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                }`}>{tx.status}</span>
              </div>
              <p className="trips-header__subtitle">Payment Reference: {tx.reference}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="fly-btn fly-btn-secondary" onClick={() => alert('Printing invoice...')}>
                <Printer size={14} className="mr-1 inline" /> Print Invoice
              </button>
              <button type="button" className="fly-btn fly-btn-primary" onClick={() => alert('Downloading PDF receipt...')}>
                <Download size={14} className="mr-1 inline" /> Download PDF
              </button>
            </div>
          </section>

          {/* Detailed Transaction Card */}
          <section className="fly-card w-full mt-6">
            <div className="text-center py-6 border-b border-gray-100">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Transaction Amount</div>
              <div className={`text-4xl font-black mt-2 ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-2 font-semibold">{tx.description}</p>
            </div>

            <div className="py-6 space-y-4 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <strong className="text-flyora-navy font-extrabold">{tx.date}</strong>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <strong className="text-flyora-navy font-extrabold">{tx.category}</strong>
              </div>
              <div className="flex justify-between">
                <span>Reference Number:</span>
                <strong className="text-flyora-navy font-mono font-bold">{tx.reference}</strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Provider:</span>
                <strong className="text-flyora-navy font-extrabold">Flyora Payout Network</strong>
              </div>
            </div>

            <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex gap-3 text-xs font-bold text-flyora-teal leading-relaxed mt-4">
              <ShieldCheck size={18} strokeWidth={2.4} className="shrink-0" />
              <div>
                <span>Secure Escrow Protection Logged</span>
                <p className="text-[10px] text-teal-600 font-medium mt-0.5">
                  This transaction is fully protected and monitored by the Flyora Secure Ledger. For billing disputes, contact support.
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default TransactionDetailsPage;
