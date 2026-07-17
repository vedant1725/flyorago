import React from 'react';
import { Shield, CreditCard, Wallet, Lock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  overview: any;
  walletHistory: any[];
}

const DashboardWallet: React.FC<Props> = ({ overview, walletHistory }) => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-xl font-black text-flyora-navy">Wallet & Escrow</h1>
      <p className="text-xs text-gray-400 mt-1 font-medium">Flyora Escrow locks payments securely until delivery is validated.</p>
    </div>

    {/* Wallet Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="dash-wallet-card">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={18} className="text-flyora-teal-light" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Available Balance</span>
          </div>
          <div className="text-3xl font-black text-white">${overview.stats.walletBalance.toFixed(2)}</div>
          <p className="text-[10px] text-white/30 mt-2 font-medium">Withdrawable to your bank account</p>
        </div>
      </div>

      <div className="dash-stat-card">
        <div className="stat-glow" style={{ background: '#3b82f6' }} />
        <div className="flex items-center gap-2 mb-3">
          <Lock size={16} className="text-blue-500" />
          <span className="stat-label">Escrow Locked</span>
        </div>
        <div className="stat-value">${overview.stats.escrowBalance.toFixed(2)}</div>
        <p className="text-[9px] text-gray-400 mt-2">Awaiting delivery confirmation</p>
      </div>

      <div className="dash-stat-card">
        <div className="stat-glow" style={{ background: '#0D9488' }} />
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-flyora-teal" />
          <span className="stat-label">Trust Level</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-extrabold text-flyora-teal">Level 1</span>
          <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Verified</span>
        </div>
        <p className="text-[9px] text-gray-400 mt-2">Instant payout processing</p>
      </div>
    </div>

    {/* Transaction History */}
    <div className="dash-content-card">
      <div className="dash-content-card-header">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-flyora-teal" />
          <h3 className="text-sm font-black text-flyora-navy uppercase tracking-wide">Transactions</h3>
        </div>
      </div>
      <div>
        {walletHistory.map(tx => (
          <div key={tx.id} className="dash-tx-row">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {tx.type === 'credit' ? <ArrowDownRight size={14} className="text-emerald-500" /> : <ArrowUpRight size={14} className="text-red-500" />}
              </div>
              <div>
                <p className="text-xs font-bold text-flyora-navy">{tx.description}</p>
                <p className="text-[9px] text-gray-400">{tx.date}</p>
              </div>
            </div>
            <span className={`text-sm font-extrabold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
              {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DashboardWallet;
