import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, Plus, ArrowUpRight, Lock, RefreshCcw, Landmark, X, Filter
} from 'lucide-react';
import { apiFetch } from '../utils/api';
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
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  // Balance and data states
  const [walletStats, setWalletStats] = useState({
    walletBalance: 0,
    escrowBalance: 0,
    pendingBalance: 0,
  });
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<any[]>([]);
  const [escrowPaymentsList, setEscrowPaymentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

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
      if (txsRes.status === 'success' && Array.isArray(txsRes.data)) {
        const mappedTxs = txsRes.data.map((t: any) => {
          const isCredit = ['Deposit', 'Payment Received', 'Refund'].includes(t.type);
          return {
            id: `#TXN${t.id}`,
            rawId: t.id,
            description: t.description || 'Wallet transaction',
            date: t.createdAt || 'Just now',
            category: t.type || 'Transfer',
            type: isCredit ? 'credit' : 'debit',
            amount: parseFloat(t.amount) || 0.00,
            status: t.status || 'Completed',
            reference: t.refId || `REF-${t.id}`
          };
        });
        setTransactionsList(mappedTxs);
      }

      // 4. Fetch Bookings to map escrow payments
      const bookingsRes = await apiFetch('/api/bookings/?user_only=true');
      if (bookingsRes.status === 'success' && Array.isArray(bookingsRes.data)) {
        const escrows = bookingsRes.data
          .filter((b: any) => b.escrow_status === 'Active Hold' || b.payment_status === 'Escrow Hold')
          .map((b: any) => ({
            id: b.id.toString(),
            itemName: b.package_name || b.package?.name || 'Cargo Package',
            status: b.escrow_status === 'Active Hold' ? 'Locked' : 'Released',
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

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPM = payoutMethods.find(p => p.id === selectedPaymentMethod);
      const payload = {
        amount: parseFloat(amount) || 10.00,
        payment_method: selectedPM ? selectedPM.name : 'Visa Credit Card'
      };

      const res = await apiFetch('/api/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.status === 'success') {
        alert(`Successfully deposited $${amount} to your available balance.`);
        setIsAddFundsOpen(false);
        setAmount('');
        fetchWalletData();
      }
    } catch (err: any) {
      alert(err.message || 'Deposit failed');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      alert('Please add a payout method first.');
      return;
    }
    try {
      const payload = {
        amount: parseFloat(amount) || 10.00,
        payout_method_id: parseInt(selectedPaymentMethod)
      };

      const res = await apiFetch('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.status === 'success') {
        alert(`Withdrawal request of $${amount} processed successfully.`);
        setIsWithdrawOpen(false);
        setAmount('');
        fetchWalletData();
      }
    } catch (err: any) {
      alert(err.message || 'Withdrawal failed');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate transfer locally by requesting mock withdrawal
    try {
      alert(`Transfer of $${amount} to recipient ${transferRecipient} requested successfully.`);
      setIsTransferOpen(false);
      setAmount('');
    } catch (err: any) {
      alert('Transfer failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Wallet" />
      
      <main className="flex-1 lg:ml-[240px] flex flex-col h-[calc(100vh-60px)] lg:h-screen overflow-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex h-[80px] bg-white border-b border-slate-100 items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 border border-slate-200 rounded-full cursor-pointer hover:bg-slate-50 transition">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight">{userName}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">Account Settings <ChevronDown size={10} /></span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-flyora-teal tracking-tight mb-1">Wallet <span className="text-slate-800">& Payouts</span></h1>
              <p className="text-sm text-slate-500 font-medium">Manage your logistics, track active routes, and review your earnings profile.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsAddFundsOpen(true)}
                className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-full text-sm font-bold hover:bg-slate-50 transition flex items-center gap-2 shrink-0"
              >
                <Plus size={16} />
                Add Funds
              </button>
              <button 
                onClick={() => setIsWithdrawOpen(true)}
                className="bg-flyora-teal text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition flex items-center gap-2 shrink-0"
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
              <div className="text-3xl font-black text-slate-800">${(walletStats.walletBalance + walletStats.escrowBalance + walletStats.pendingBalance).toFixed(2)}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                <Wallet size={24} />
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Current Balance</div>
              <div className="text-3xl font-black text-slate-800">${walletStats.walletBalance.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm relative overflow-hidden group">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <Lock size={24} />
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">In Escrow</div>
              <div className="text-3xl font-black text-slate-800">${walletStats.escrowBalance.toFixed(2)}</div>
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
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">Description</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">Amount</th>
                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-slate-700">{tx.id}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500 font-medium">
                        {tx.date}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-800">{tx.description}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{tx.category}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-800'}`}>
                          {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                          tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                          tx.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 text-sm font-medium">
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
        <div className="trip-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAddFundsOpen(false)}>
          <div className="trip-modal fly-card max-w-md">
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
                <span className="dash-input-label">Amount (USD)</span>
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
        <div className="trip-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsWithdrawOpen(false)}>
          <div className="trip-modal fly-card max-w-md">
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
                <span>${walletStats.walletBalance.toFixed(2)}</span>
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
                <span className="dash-input-label">Withdraw Amount (USD)</span>
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
        <div className="trip-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsTransferOpen(false)}>
          <div className="trip-modal fly-card max-w-md">
            <div className="trip-modal__header">
              <div>
                <div className="fly-card-title">Transfer Funds</div>
                <p>Send funds to another Flyora user instantly using their email or username.</p>
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
                <span className="dash-input-label">Amount (USD)</span>
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

    </div>
  );
};

export default WalletPage;
