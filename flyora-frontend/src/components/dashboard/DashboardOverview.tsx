import React from 'react';
import {
  Wallet, Lock, Plane, List, PlusCircle, Sparkles,
  TrendingUp, ArrowUpRight, Clock
} from 'lucide-react';
import Button from '../ui/Button';

interface DashboardOverviewData {
  stats: {
    activeTripsCount: number;
    activeShipmentsCount: number;
    walletBalance: number;
    escrowBalance: number;
  };
  matches: {
    travelMatches: any[];
    shipmentMatches: any[];
    totalMatchesCount: number;
  };
}

interface Props {
  overview: DashboardOverviewData;
  userName: string;
  onRefresh: () => void;
  onNewTrip: () => void;
  onNewShipment: () => void;
  onViewMatches: () => void;
}

const DashboardOverview: React.FC<Props> = ({ overview, userName, onRefresh, onNewTrip, onNewShipment, onViewMatches }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const totalEarnings = overview.stats.walletBalance + overview.stats.escrowBalance;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="dash-welcome">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-flyora-teal-light/80">
              {greeting}
            </span>
            <span className="text-[10px] text-white/20">•</span>
            <span className="text-[10px] font-bold text-white/30">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
            Welcome back, <span className="text-gradient-teal" style={{ WebkitTextFillColor: 'unset', background: 'linear-gradient(135deg, #14B8A6, #2DD4BF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{userName}</span>
          </h1>
          <p className="text-sm text-white/40 font-medium max-w-lg">
            Manage your flights, shipments, and earnings from your centralized command center.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-5">
            <button onClick={onNewTrip} className="dash-quick-action">
              <Plane size={15} className="text-flyora-teal-light transform -rotate-45" />
              Register Flight
            </button>
            <button onClick={onNewShipment} className="dash-quick-action">
              <PlusCircle size={15} className="text-flyora-teal-light" />
              Post Shipment
            </button>
            <button onClick={onRefresh} className="dash-quick-action">
              <TrendingUp size={15} className="text-flyora-teal-light" />
              Refresh Stats
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="dash-stat-card">
          <div className="stat-glow" style={{ background: '#0D9488' }} />
          <div className="flex items-start justify-between mb-3">
            <div className="stat-icon" style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)' }}>
              <TrendingUp size={22} className="text-flyora-teal" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight size={10} /> Live
            </span>
          </div>
          <div className="stat-value">${totalEarnings.toFixed(0)}</div>
          <div className="stat-label mt-1">Total Portfolio</div>
        </div>

        {/* Wallet */}
        <div className="dash-stat-card">
          <div className="stat-glow" style={{ background: '#6366f1' }} />
          <div className="flex items-start justify-between mb-3">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Wallet size={22} className="text-indigo-500" />
            </div>
          </div>
          <div className="stat-value">${overview.stats.walletBalance.toFixed(0)}</div>
          <div className="stat-label mt-1">Wallet Balance</div>
        </div>

        {/* Active Trips */}
        <div className="dash-stat-card">
          <div className="stat-glow" style={{ background: '#f59e0b' }} />
          <div className="flex items-start justify-between mb-3">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <Plane size={22} className="text-amber-500 transform -rotate-45" />
            </div>
          </div>
          <div className="stat-value">{overview.stats.activeTripsCount}</div>
          <div className="stat-label mt-1">Active Flights</div>
        </div>

        {/* Shipments */}
        <div className="dash-stat-card">
          <div className="stat-glow" style={{ background: '#8b5cf6' }} />
          <div className="flex items-start justify-between mb-3">
            <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <List size={22} className="text-violet-500" />
            </div>
          </div>
          <div className="stat-value">{overview.stats.activeShipmentsCount}</div>
          <div className="stat-label mt-1">Shipment Requests</div>
        </div>
      </div>

      {/* Matches Preview */}
      <div className="dash-content-card">
        <div className="dash-content-card-header">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-flyora-teal" />
            <h3 className="text-sm font-black text-flyora-navy uppercase tracking-wide">Smart Matches</h3>
            {overview.matches.totalMatchesCount > 0 && (
              <span className="text-[9px] font-black bg-flyora-teal text-white px-2 py-0.5 rounded-full">{overview.matches.totalMatchesCount} Found</span>
            )}
          </div>
          {overview.matches.totalMatchesCount > 0 && (
            <button onClick={onViewMatches} className="text-xs font-bold text-flyora-teal hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </button>
          )}
        </div>
        <div className="dash-content-card-body">
          {overview.matches.totalMatchesCount === 0 ? (
            <div className="dash-empty">
              <ArrowUpRight size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-bold mb-1">No matches yet</p>
              <p className="text-[10px] max-w-sm mx-auto leading-relaxed">Create trips or shipments on matching routes to compute smart matches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overview.matches.travelMatches.slice(0, 2).map((match: any, idx: number) => (
                <div key={idx} className="dash-match-card traveler">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-flyora-teal bg-teal-50 px-2 py-0.5 rounded-full">Traveler Match</span>
                    <span className="text-[9px] font-bold text-emerald-500">Reward Available</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Your trip:</p>
                  <p className="text-xs font-extrabold text-flyora-navy mb-2">{match.tripDetails}</p>
                  <div className="p-2.5 bg-white border border-gray-100 rounded-lg mb-3">
                    <h4 className="font-bold text-xs text-flyora-navy">{match.shipment?.title}</h4>
                    <p className="text-[10px] text-gray-400">Sender: {match.shipment?.fullName} • {match.shipment?.weight}kg</p>
                    <p className="text-[10px] font-black text-flyora-teal mt-1">Reward: ${match.shipment?.pricePaid}</p>
                  </div>
                  <Button variant="teal" size="sm" fullWidth onClick={onViewMatches}>
                    Connect & Earn
                  </Button>
                </div>
              ))}
              {overview.matches.shipmentMatches.slice(0, 2).map((match: any, idx: number) => (
                <div key={idx} className="dash-match-card sender">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Sender Match</span>
                    <span className="text-[9px] font-bold text-blue-500">Capacity Available</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Your shipment:</p>
                  <p className="text-xs font-extrabold text-flyora-navy mb-2">{match.shipmentDetails}</p>
                  <div className="p-2.5 bg-white border border-gray-100 rounded-lg mb-3">
                    <h4 className="font-bold text-xs text-flyora-navy">Traveler Route</h4>
                    <p className="text-[10px] text-gray-400">Traveler: {match.trip?.fullName} • {match.trip?.availableWeight}kg</p>
                    <p className="text-[10px] font-black text-blue-600 mt-1">Rate: ${match.trip?.pricePerKg}/kg</p>
                  </div>
                  <Button variant="secondary" size="sm" fullWidth className="border-blue-200 text-blue-600 hover:bg-blue-50/50" onClick={onViewMatches}>
                    Book Capacity
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Footer */}
      <div className="flex items-center justify-center gap-2 py-2">
        <Clock size={12} className="text-gray-300" />
        <span className="text-[10px] text-gray-300 font-medium">Last synced: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default DashboardOverview;
