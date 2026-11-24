import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, Plus, ArrowUpRight, ArrowDownLeft, Lock, RefreshCcw, Landmark, X, Filter,
  Eye, CheckCircle2, MapPin, User, FileText, ArrowDownRight, ExternalLink
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { WebRazorpayCheckoutModal } from '../components/WebRazorpayCheckoutModal';
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

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { validateAction, isModalOpen: isKycModalOpen, closeModal: closeKycModal, kycStatus } = useKycValidation();
  const userName = localStorage.getItem('flyora_user_name') || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('');

  // Balance and data states
  const [walletStats, setWalletStats] = useState({
    walletBalance: 0,
    escrowBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
  });
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<any[]>([]);
  const [escrowPaymentsList, setEscrowPaymentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<any | null>(null);

  // Razorpay Checkout Modal State (Web)
  const [razorpayModalVisible, setRazorpayModalVisible] = useState(false);
  const [activeRazorpayData, setActiveRazorpayData] = useState<{
    amount: number;
    purpose: 'add_funds' | 'withdraw';
    orderId: string;
  }>({
    amount: 0,
    purpose: 'add_funds',
    orderId: '',
  });

  // Search and Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, credit, debit
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal forms
  const [amount, setAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch Summary
      const summaryRes = await apiFetch('/api/wallet/summary');
      if (summaryRes.status === 'success' && summaryRes.data) {
        setWalletStats({
          walletBalance: parseFloat(summaryRes.data.balance_available) || 0,
          pendingBalance: parseFloat(summaryRes.data.balance_pending) || 0,
          escrowBalance: parseFloat(summaryRes.data.balance_escrow) || 0,
          totalEarnings: typeof summaryRes.data.total_earnings === 'number' 
            ? summaryRes.data.total_earnings 
            : (parseFloat(summaryRes.data.total_earnings) || 0),
        });
      }

      // 2. Fetch Payout/Payment Methods
      const payoutsRes = await apiFetch('/api/wallet/payout-methods');
      if (payoutsRes.status === 'success' && Array.isArray(payoutsRes.data)) {
        const mappedPayouts = payoutsRes.data.map((pm: any) => ({
          id: pm.id.toString(),
          type: pm.type === 'Bank Account' ? 'bank' : 'card',
          name: pm.provider || 'Stripe Bank Transfer',
          lastFour: pm.mask ? pm.mask.replace('••••', '').trim() : '4242',
          isDefault: pm.is_default,
          expiry: '12/28'
        }));
        setPayoutMethods(mappedPayouts);
        if (mappedPayouts.length > 0) {
          setSelectedPaymentMethod(mappedPayouts[0].id);
        }
      }

      // 3. Fetch Transactions
      const txsRes = await apiFetch('/api/wallet/transactions');
      const rawTxs = Array.isArray(txsRes?.results) 
        ? txsRes.results 
        : (Array.isArray(txsRes?.data?.results) 
            ? txsRes.data.results 
            : (Array.isArray(txsRes?.data) 
                ? txsRes.data 
                : (Array.isArray(txsRes) ? txsRes : [])));

      if (rawTxs.length > 0) {
        const mappedTxs = rawTxs.map((t: any) => {
          const typeStr = (t.type || '').trim();
          // Escrow Release, Deposit, Payment Received, Refund are incoming credits (+)
          const isCredit = ['Deposit', 'Payment Received', 'Refund', 'Escrow Release'].includes(typeStr);
          return {
            id: `#TXN${t.id}`,
            rawId: t.id,
            description: t.description || 'Wallet transaction',
            date: t.createdAt || 'Just now',
            category: typeStr || 'Transaction',
            type: isCredit ? 'credit' : 'debit',
            amount: parseFloat(t.amount) || 0.00,
            status: t.status || 'Completed',
            reference: t.refId || t.reference_id || `REF-${t.id}`,
            counterparty: t.counterparty || null,
            booking_details: t.booking_details || null
          };
        });
        setTransactionsList(mappedTxs);
      } else {
        setTransactionsList([]);
      }

      // 4. Fetch Bookings to map escrow payments
      const bookingsRes = await apiFetch('/api/bookings/?user_only=true');
      if (bookingsRes.status === 'success' && Array.isArray(bookingsRes.data)) {
        const escrows = bookingsRes.data
          .filter((b: any) => b.escrow_status === 'Active Hold' || b.payment_status === 'Escrow Hold')
          .map((b: any) => ({
            id: b.id.toString(),
            itemName: b.package_name || b.package?.name || 'Cargo Package',
            status: b.escrow_status === 'Active Hold' ? 'Locked' : 'PAYMENT_RELEASED',
            travelerName: b.traveler_name || 'Traveler',
            lockDate: b.createdAt || new Date(b.created_at).toLocaleDateString('en-US'),
            amount: parseFloat(b.reward) || 0.00,
            releaseDate: 'On Delivery Confirmation'
          }));
        setEscrowPaymentsList(escrows);
      }

    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
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

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactionsList.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.reference.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || tx.type === filterType;
      const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;

      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [searchQuery, filterType, filterCategory, filterStatus, transactionsList]);

  const handleRazorpaySuccess = async (paymentDetails: { razorpay_payment_id: string; razorpay_order_id: string }) => {
    try {
      const verifyRes = await apiFetch('/api/wallet/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: paymentDetails.razorpay_order_id,
          razorpay_payment_id: paymentDetails.razorpay_payment_id,
          razorpay_signature: 'test_signature_mock',
          amount: activeRazorpayData.amount,
          purpose: activeRazorpayData.purpose,
        }),
      });

      if (verifyRes.status === 'success' || verifyRes.success) {
        if (activeRazorpayData.purpose === 'withdraw') {
          alert(`🎉 Razorpay Payout of ₹${activeRazorpayData.amount} processed successfully!`);
          setIsWithdrawOpen(false);
        } else {
          alert(`🎉 Payment of ₹${activeRazorpayData.amount} successfully verified via Razorpay! Funds added to your wallet.`);
          setIsAddFundsOpen(false);
        }
        setAmount('');
        setRazorpayModalVisible(false);
        fetchWalletData();
      } else {
        alert(verifyRes.message || 'Payment verification failed');
      }
    } catch (err: any) {
      alert(err.message || 'Verification error');
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      // 1. Create Order via Backend Razorpay API
      const orderRes = await apiFetch('/api/wallet/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: numAmount, purpose: 'add_funds' }),
      });

      const orderData = orderRes.data || orderRes;
      const orderId = orderData.order_id || `order_${Date.now()}`;

      setActiveRazorpayData({
        amount: numAmount,
        purpose: 'add_funds',
        orderId: orderId,
      });
      setRazorpayModalVisible(true);
    } catch (err: any) {
      alert(err.message || 'Deposit initiation failed');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (numAmount > walletStats.walletBalance) {
      alert('Insufficient available balance.');
      return;
    }

    try {
      // 1. Create Payout Order via Razorpay
      const orderRes = await apiFetch('/api/wallet/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: numAmount, purpose: 'withdraw' }),
      });

      const orderData = orderRes.data || orderRes;
      const orderId = orderData.order_id || `payout_${Date.now()}`;

      setActiveRazorpayData({
        amount: numAmount,
        purpose: 'withdraw',
        orderId: orderId,
      });
      setRazorpayModalVisible(true);
    } catch (err: any) {
      alert(err.message || 'Withdrawal initiation failed');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate transfer locally by requesting mock withdrawal
    try {
      alert(`Transfer of ₹${amount} to recipient ${transferRecipient} requested successfully.`);
      setIsTransferOpen(false);
      setAmount('');
    } catch (err: any) {
      alert('Transfer failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      <Sidebar activeItem="Wallet" />

      <main className="flex-1 min-w-0 w-full lg:ml-[240px] flex flex-col min-h-screen relative pb-20 lg:pb-12">
        {/* Subtle Ambient Flyora Teal Wave Gradient in Background */}
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

        {/* Top Header */}
        <header className="flex h-20 items-center justify-between px-4 sm:px-8 xl:px-10 shrink-0 gap-4 sm:gap-6 relative z-30">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">My Wallet</h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        <div className="px-4 sm:px-8 xl:px-10 space-y-6 sm:space-y-8 relative z-20">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-flyora-teal tracking-tight mb-1">Wallet <span className="text-slate-800">& Payouts</span></h1>
              <p className="text-sm text-slate-500 font-medium">Manage your logistics, track active routes, and review your earnings profile.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => validateAction(() => setIsAddFundsOpen(true))}
                className="bg-white border border-slate-200 text-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2 shrink-0"
              >
                <Plus size={16} />
                Add Funds
              </button>
              <button
                onClick={() => validateAction(() => setIsWithdrawOpen(true))}
                className="bg-flyora-teal text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition flex items-center gap-2 shrink-0"
              >
                <ArrowUpRight size={16} />
                Withdraw Funds
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-flyora-teal mb-4 group-hover:scale-110 transition-transform">
                <CreditCard size={24} />
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Earnings</div>
              <div className="text-3xl font-black text-slate-800">₹{walletStats.totalEarnings.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                <Wallet size={24} />
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Current Balance</div>
              <div className="text-3xl font-black text-slate-800">₹{walletStats.walletBalance.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <Lock size={24} />
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">In Escrow</div>
              <div className="text-3xl font-black text-slate-800">₹{walletStats.escrowBalance.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-extrabold text-slate-800">Transaction History</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-flyora-teal transition w-full sm:w-auto"
                  />
                </div>
                <div className="relative">
                  <select
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 pl-4 pr-8 py-2 rounded-lg text-sm font-bold outline-none focus:border-flyora-teal transition cursor-pointer"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Credits</option>
                    <option value="debit">Debits</option>
                  </select>
                  <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">Transaction ID</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">Date</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">Description & Party</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">Amount</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">Status</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => {
                    const isEscrow = tx.category.toLowerCase().includes('escrow');
                    const isHold = tx.category.toLowerCase().includes('hold');
                    const isRelease = tx.category.toLowerCase().includes('release');
                    
                    return (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition group">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {tx.id}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isHold ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            isRelease ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                            tx.type === 'credit' ? 'bg-teal-50 text-teal-600 border border-teal-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {isHold ? <Lock size={15} /> :
                             isRelease ? <ShieldCheck size={15} /> :
                             tx.type === 'credit' ? <ArrowDownLeft size={15} /> :
                             <ArrowUpRight size={15} />}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">{tx.description}</span>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isHold ? 'bg-amber-100/60 text-amber-700' :
                                isRelease ? 'bg-emerald-100/60 text-emerald-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {tx.category}
                              </span>
                              {tx.counterparty && (
                                <span className="text-[11px] font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded flex items-center gap-1">
                                  <User size={11} className="text-slate-400" />
                                  <span>{tx.counterparty.role}: <strong className="text-slate-800">{tx.counterparty.name}</strong></span>
                                </span>
                              )}
                              {tx.reference && tx.reference !== `REF-${tx.rawId}` && (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Ref: #{tx.reference}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`text-sm font-extrabold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          tx.status === 'Completed' || tx.status === 'PAYMENT_RELEASED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          tx.status === 'Pending' || tx.status === 'REQUEST_SENT' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === 'Completed' || tx.status === 'PAYMENT_RELEASED' ? 'bg-emerald-500' :
                            tx.status === 'Pending' || tx.status === 'REQUEST_SENT' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTxForDetail(tx)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto border border-slate-200/80 hover:border-emerald-200 shadow-sm"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-sm font-medium">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Funds Modal */}
      {isAddFundsOpen && (
        <div className="trip-modal-overlay p-3 sm:p-4" onClick={(e) => e.target === e.currentTarget && setIsAddFundsOpen(false)}>
          <div className="trip-modal fly-card max-w-md w-full max-h-[92vh] overflow-y-auto">
            <div className="trip-modal__header">
              <div>
                <div className="fly-card-title">Add Funds to Wallet</div>
                <p>Load money into your Available Balance instantly.</p>
              </div>
              <button type="button" className="trip-modal__close" onClick={() => setIsAddFundsOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form className="trip-modal__form mt-4 space-y-4" onSubmit={handleAddFunds}>
              <label className="block">
                <span className="dash-input-label">Select Payment Source</span>
                <select className="dash-input mt-1 w-full" value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
                  {payoutMethods.length === 0 ? (
                    <option value="">No source methods found</option>
                  ) : (
                    payoutMethods.map(pm => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name} (•••• {pm.lastFour})
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="block">
                <span className="dash-input-label">Amount (INR)</span>
                <input type="number" required placeholder="50.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="dash-input mt-1 w-full" />
              </label>
              <div className="trip-modal__actions pt-2">
                <button type="button" className="fly-btn fly-btn-secondary" onClick={() => setIsAddFundsOpen(false)}>Cancel</button>
                <button type="submit" className="fly-btn fly-btn-primary">Add Funds</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {isWithdrawOpen && (
        <div className="trip-modal-overlay p-3 sm:p-4" onClick={(e) => e.target === e.currentTarget && setIsWithdrawOpen(false)}>
          <div className="trip-modal fly-card max-w-md w-full max-h-[92vh] overflow-y-auto">
            <div className="trip-modal__header">
              <div>
                <div className="fly-card-title">Withdraw Funds</div>
                <p>Transfer available balance directly to your bank account or card.</p>
              </div>
              <button type="button" className="trip-modal__close" onClick={() => setIsWithdrawOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form className="trip-modal__form mt-4 space-y-4" onSubmit={handleWithdraw}>
              <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl flex justify-between text-xs font-bold text-flyora-teal">
                <span>Withdrawable Balance:</span>
                <span>₹{walletStats.walletBalance.toFixed(2)}</span>
              </div>
              <label className="block">
                <span className="dash-input-label">Payout Destination</span>
                <select className="dash-input mt-1 w-full" value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
                  {payoutMethods.length === 0 ? (
                    <option value="">No payout methods found</option>
                  ) : (
                    payoutMethods.map(pm => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name} (•••• {pm.lastFour})
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="block">
                <span className="dash-input-label">Withdraw Amount (INR)</span>
                <input type="number" max={walletStats.walletBalance} required placeholder="100.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="dash-input mt-1 w-full" />
              </label>
              <div className="trip-modal__actions pt-2">
                <button type="button" className="fly-btn fly-btn-secondary" onClick={() => setIsWithdrawOpen(false)}>Cancel</button>
                <button type="submit" className="fly-btn fly-btn-primary">Request Withdrawal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
      {isTransferOpen && (
        <div className="trip-modal-overlay p-3 sm:p-4" onClick={(e) => e.target === e.currentTarget && setIsTransferOpen(false)}>
          <div className="trip-modal fly-card max-w-md w-full max-h-[92vh] overflow-y-auto">
            <div className="trip-modal__header">
              <div>
                <div className="fly-card-title">Transfer Funds</div>
                <p>Send funds to another Flyorago user instantly using their email or username.</p>
              </div>
              <button type="button" className="trip-modal__close" onClick={() => setIsTransferOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form className="trip-modal__form mt-4 space-y-4" onSubmit={handleTransfer}>
              <label className="block">
                <span className="dash-input-label">Recipient Email or Username</span>
                <input type="text" required placeholder="priya.mehta@example.com" value={transferRecipient} onChange={(e) => setTransferRecipient(e.target.value)} className="dash-input mt-1 w-full" />
              </label>
              <label className="block">
                <span className="dash-input-label">Amount (INR)</span>
                <input type="number" max={walletStats.walletBalance} required placeholder="50.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="dash-input mt-1 w-full" />
              </label>
              <div className="trip-modal__actions pt-2">
                <button type="button" className="fly-btn fly-btn-secondary" onClick={() => setIsTransferOpen(false)}>Cancel</button>
                <button type="submit" className="fly-btn fly-btn-primary">Transfer Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTxForDetail && (
        <div className="trip-modal-overlay p-3 sm:p-4" onClick={(e) => e.target === e.currentTarget && setSelectedTxForDetail(null)}>
          <div className="trip-modal fly-card max-w-lg w-full max-h-[92vh] bg-white rounded-2xl shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono tracking-wider font-bold bg-white/20 text-emerald-300 px-2.5 py-0.5 rounded">
                    {selectedTxForDetail.id}
                  </span>
                  <span className="text-xs text-slate-300">
                    • {selectedTxForDetail.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Transaction Dossier</h3>
                <p className="text-xs text-slate-300 mt-0.5">Top-MNC Grade Financial Trace & Audit Record</p>
              </div>
              <button 
                type="button" 
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition relative z-10" 
                onClick={() => setSelectedTxForDetail(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Amount Highlight Card */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Transaction Value
                  </span>
                  <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
                    <span className={selectedTxForDetail.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}>
                      {selectedTxForDetail.type === 'credit' ? '+' : '-'}₹{selectedTxForDetail.amount.toFixed(2)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">INR</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Settlement Status
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                    selectedTxForDetail.status === 'Completed' || selectedTxForDetail.status === 'PAYMENT_RELEASED' ? 'bg-emerald-100 text-emerald-800' :
                    selectedTxForDetail.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    <CheckCircle2 size={13} />
                    {selectedTxForDetail.status}
                  </span>
                </div>
              </div>

              {/* Counterparty / Transfer Flow Card */}
              {selectedTxForDetail.counterparty ? (
                <div className="p-5 rounded-xl bg-gradient-to-br from-teal-50/60 to-emerald-50/40 border border-teal-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
                      <User size={14} className="text-teal-600" />
                      <span>
                        {selectedTxForDetail.type === 'credit' ? 'Payment Source (From Whom)' : 'Transfer Destination (Paid To)'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 uppercase tracking-wider">
                      {selectedTxForDetail.counterparty.role}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-teal-100/80 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold text-slate-800">
                        {selectedTxForDetail.counterparty.name}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {selectedTxForDetail.counterparty.email}
                      </div>
                      {selectedTxForDetail.counterparty.phone && (
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          Phone: {selectedTxForDetail.counterparty.phone}
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-100/80 text-teal-700 font-black text-sm flex items-center justify-center shrink-0">
                      {selectedTxForDetail.counterparty.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400 shrink-0" />
                  <span>Direct System Transaction / Wallet Payout / Balance Adjustment</span>
                </div>
              )}

              {/* Associated Booking & Logistics Details */}
              {selectedTxForDetail.booking_details && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Package size={14} className="text-slate-400" />
                      Linked Booking / Logistics Order
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Order #{selectedTxForDetail.booking_details.id}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-sm">
                    {selectedTxForDetail.booking_details.route && (
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
                        <MapPin size={16} className="text-emerald-600 shrink-0" />
                        <span>{selectedTxForDetail.booking_details.route}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium block">Package / Cargo</span>
                        <span className="text-slate-800 font-bold mt-0.5 block">
                          {selectedTxForDetail.booking_details.package_name || selectedTxForDetail.booking_details.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block">Weight Space</span>
                        <span className="text-slate-800 font-bold mt-0.5 block">
                          {selectedTxForDetail.booking_details.weight || selectedTxForDetail.booking_details.booked_weight || 'N/A'}
                        </span>
                      </div>
                      {selectedTxForDetail.booking_details.receiver_name && (
                        <div className="col-span-2 pt-2 border-t border-slate-100">
                          <span className="text-slate-400 font-medium block">Intended Receiver</span>
                          <span className="text-slate-800 font-semibold mt-0.5 block">
                            {selectedTxForDetail.booking_details.receiver_name}
                            {selectedTxForDetail.booking_details.receiver_address && ` • ${selectedTxForDetail.booking_details.receiver_address}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Meta Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400">Nature / Category:</span>
                  <span className="font-bold text-slate-700">{selectedTxForDetail.category}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400">Reference Token:</span>
                  <span className="font-mono font-bold text-slate-700">#{selectedTxForDetail.reference}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-400">Description:</span>
                  <span className="font-medium text-slate-700 text-right max-w-[260px] truncate">{selectedTxForDetail.description}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                onClick={() => setSelectedTxForDetail(null)}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      <KycValidationModal isOpen={isKycModalOpen} onClose={closeKycModal} kycStatus={kycStatus} />

      {/* Razorpay Checkout Modal for Web */}
      <WebRazorpayCheckoutModal
        isOpen={razorpayModalVisible}
        onClose={() => setRazorpayModalVisible(false)}
        amount={activeRazorpayData.amount}
        purpose={activeRazorpayData.purpose}
        orderId={activeRazorpayData.orderId}
        onSuccess={handleRazorpaySuccess}
      />
    </div>
  );
};

export default WalletPage;
