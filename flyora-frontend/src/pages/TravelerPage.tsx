import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import {
  Plane, Search, Plus, Filter, CalendarDays, Package, CreditCard,
  CheckCircle2, Trash2, Eye, TrendingUp, X, BarChart2
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import '../pages/dashboard.css';

const TravelerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { validateAction, isModalOpen: isKycModalOpen, closeModal: closeKycModal, kycStatus } = useKycValidation();

  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [trips, setTrips] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [deliveredCount, setDeliveredCount] = useState<number>(0);

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/traveler/dashboard-overview/');
      const data = res?.data || {};

      if (Array.isArray(data.trips)) {
        setTrips(data.trips.filter((t: any) => t.airline !== 'SENDER_REQUEST'));
      }
      if (Array.isArray(data.bookings)) {
        setBookingRequests(data.bookings);
      }
      if (typeof data.total_earnings === 'number') {
        setTotalEarnings(data.total_earnings);
      }
      if (typeof data.completed_trips === 'number') {
        setCompletedCount(data.completed_trips);
      }
      if (typeof data.delivered_packages === 'number') {
        setDeliveredCount(data.delivered_packages);
      }
    } catch (err: any) {
      console.error("Error fetching traveler overview:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { lastMessage } = useSocket();

  useEffect(() => {
    if (lastMessage) {
      fetchData();
    }
  }, [lastMessage]);

  const handleDeleteTrip = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      const res = await apiFetch(`/api/trips/${id}/`, { method: 'DELETE' });
      if (res?.status === 'success' || res?.data) {
        addToast?.("Trip deleted successfully", "success");
        setTrips(prev => prev.filter(t => t.id !== id));
      }
    } catch (err: any) {
      console.error("Failed to delete trip:", err);
      addToast?.("Failed to delete trip", "error");
    }
  };

  // Filtered trips list
  const filteredTrips = useMemo(() => {
    const q = (filterText || headerSearchQuery).toLowerCase().trim();
    return trips.filter(t => {
      const matchesSearch = !q ||
        (t.from_location && t.from_location.toLowerCase().includes(q)) ||
        (t.to_location && t.to_location.toLowerCase().includes(q)) ||
        (t.available_weight && String(t.available_weight).includes(q));
      const matchesStatus = !statusFilter || (t.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [trips, filterText, headerSearchQuery, statusFilter]);

  const getStatusStyle = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (s === 'ACCEPTED') return 'bg-teal-50 text-teal-700 border-teal-200';
    if (s === 'PAYMENT_RELEASED' || s === 'COMPLETED') return 'bg-blue-50 text-blue-600 border-blue-200';
    if (s === 'PENDING') return 'bg-amber-50 text-amber-600 border-amber-200';
    if (s === 'CANCELLED' || s === 'REJECTED') return 'bg-rose-50 text-rose-600 border-rose-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      <Sidebar activeItem="Trip" />

      <main className="flex-1 min-w-0 w-full lg:ml-[240px] flex flex-col min-h-screen relative pb-20 lg:pb-12">
        {/* Subtle Ambient Flyora Teal Background Wave */}
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

        {/* ─── Top Header (Global Search + Notification + Profile) ─── */}
        <header className="flex h-20 items-center justify-between px-4 sm:px-8 xl:px-10 shrink-0 gap-4 sm:gap-6 relative z-30">
          {/* Global Search Pill */}
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center gap-3 bg-white border border-slate-200/80 hover:border-slate-300 rounded-full px-4 py-2.5 shadow-[0_2px_8px_rgba(10,22,40,0.02)] transition-all">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={e => setHeaderSearchQuery(e.target.value)}
                placeholder="Search routes, weight..."
                className="flex-1 bg-transparent text-sm text-slate-800 font-medium border-0 outline-none ring-0 placeholder:text-slate-400"
              />
              {headerSearchQuery ? (
                <button onClick={() => setHeaderSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              ) : (
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full select-none">
                  Ctrl K
                </span>
              )}
            </div>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        {/* ─── Body Content (Exact Dashboard Padding px-4 sm:px-8 xl:px-10) ─── */}
        <div className="px-4 sm:px-8 xl:px-10 space-y-6 sm:space-y-8 relative z-20">

          {/* ─── Title & Actions Row (Trip & Earn) ─── */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-tight">
                Trip <span className="text-flyora-teal">& Earn</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 max-w-lg leading-relaxed">
                Manage your logistics, track active routes, and maximize your earnings with our advanced dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              {/* Search routes, weight input */}
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                  placeholder="Search routes, weight..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-700 outline-none focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>

              {/* + New Trip button */}
              <button
                onClick={() => validateAction(() => navigate('/traveler/new'))}
                className="bg-flyora-teal hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>New Trip</span>
              </button>
            </div>
          </div>

          {/* ─── Total Earnings Dark Banner Card ─── */}
          <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-[#051E28] border border-teal-900/30 shadow-[0_12px_40px_rgba(5,30,40,0.18)] overflow-hidden text-white">
            {/* Ambient Background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-flyora-teal/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">

              {/* Left: Total Earnings */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-flyora-teal/20 text-flyora-teal-bright flex items-center justify-center">
                    <BarChart2 size={13} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                    TOTAL EARNINGS
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-1.5">
                  <span className="text-flyora-teal text-3xl sm:text-4xl font-extrabold">₹</span>
                  <span>{Math.floor(totalEarnings).toLocaleString()}</span>
                  <span className="text-2xl sm:text-3xl text-white/70">.{(totalEarnings % 1).toFixed(2).substring(2)}</span>
                </div>
              </div>

              {/* Right: Completed & Delivered Counters */}
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="h-12 w-px bg-slate-700/50 hidden sm:block mr-2" />

                {/* Completed Box */}
                <div className="flex-1 sm:flex-initial bg-white/5 border border-white/10 rounded-2xl py-3 px-5 flex flex-col items-center justify-center min-w-[95px] backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    COMPLETED
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-2xl font-black text-white">{completedCount}</span>
                  </div>
                </div>

                {/* Delivered Box */}
                <div className="flex-1 sm:flex-initial bg-white/5 border border-white/10 rounded-2xl py-3 px-5 flex flex-col items-center justify-center min-w-[95px] backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    DELIVERED
                  </span>
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-blue-400" />
                    <span className="text-2xl font-black text-white">{deliveredCount}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ─── My Trips Section ─── */}
          <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-1 h-5 bg-flyora-teal rounded-full inline-block"></span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  My Trips
                </h2>
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button className="bg-flyora-teal hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95">
                  <Filter size={14} />
                  <span>{statusFilter ? statusFilter : 'Filter'}</span>
                </button>
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Content: Empty State (Identical to Screenshot) OR Trip Cards */}
            {filteredTrips.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100/90 shadow-[0_4px_25px_rgba(10,22,40,0.02)] p-12 sm:p-16 flex flex-col items-center justify-center text-center">
                {/* Airplane Outline Circle */}
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <Plane size={24} className="transform -rotate-45" />
                </div>

                <h3 className="text-slate-900 text-base sm:text-lg font-black mb-1.5">
                  No trips found
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed mb-6 font-medium">
                  Create a new request by clicking the Create Request button or search for other terms.
                </p>

                <button
                  onClick={() => validateAction(() => navigate('/traveler/new'))}
                  className="bg-flyora-teal hover:bg-teal-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg shadow-teal-600/20 hover:shadow-xl transition-all transform active:scale-95 flex items-center gap-1.5"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Create Request</span>
                </button>
              </div>
            ) : (
              /* Trip Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTrips.map(t => {
                  const allTripReqs = (t.bookings && t.bookings.length > 0)
                    ? t.bookings
                    : bookingRequests.filter(r =>
                      r.trip === t.id || String(r.trip?.id) === String(t.id) ||
                      (!r.trip && r.from_location === t.from_location && r.to_location === t.to_location)
                    );

                  const tripReqs = allTripReqs.filter((r: any) =>
                    r.status !== 'CANCELLED' && r.status !== 'REJECTED'
                  );

                  const displayStatus = (t.status || 'ACTIVE').toUpperCase();

                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100/90 shadow-[0_4px_20px_rgba(10,22,40,0.03)] hover:shadow-lg transition-all p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-black text-slate-700 tracking-tight">TRIP #{t.id}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusStyle(displayStatus)}`}>
                            {displayStatus}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-4 bg-slate-50 px-3 py-1.5 rounded-lg w-fit border border-slate-100">
                          <CalendarDays size={14} className="text-flyora-teal" />
                          <span>{t.departure_date}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm font-bold text-slate-800 mb-4">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">From</p>
                            <p className="truncate max-w-[120px]">{t.from_location}</p>
                          </div>
                          <Plane size={16} className="text-flyora-teal rotate-90 shrink-0" />
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">To</p>
                            <p className="truncate max-w-[120px]">{t.to_location}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Space</p>
                            <p className="text-xs font-black text-slate-800">{t.available_weight} KG</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Rate</p>
                            <p className="text-xs font-black text-flyora-teal">₹{t.price_per_kg}/kg</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => navigate(`/trip/${t.id}`)}
                          className="flex-1 bg-slate-900 hover:bg-flyora-teal text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye size={14} />
                          <span>Requests</span>
                          {tripReqs.length > 0 && (
                            <span className="bg-white text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                              {tripReqs.length}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(t.id)}
                          className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors"
                          title="Delete Trip"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      <KycValidationModal isOpen={isKycModalOpen} onClose={closeKycModal} kycStatus={kycStatus} />
    </div>
  );
};

export default TravelerPage;
