import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Plane, Search, Plus, Filter, Bell, ChevronDown, Edit2, Trash2, X, CalendarDays, Package, CreditCard, ShieldCheck, CheckCircle2, XCircle, Eye, User, Mail, Phone, MapPin, ArrowRight, Wallet } from 'lucide-react';
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
  const userName = localStorage.getItem('flyora_user_name') || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [trips, setTrips] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [selectedTripForRequests, setSelectedTripForRequests] = useState<any | null>(null);

  const [selectedBookingToInspect, setSelectedBookingToInspect] = useState<any | null>(null);
  const [inspectImgIndex, setInspectImgIndex] = useState<number>(0);
  const [inspectZoomImg, setInspectZoomImg] = useState<string | null>(null);

  const [allAvailableSenderRequests, setAllAvailableSenderRequests] = useState<any[]>([]);
  const [selectedTripToMatchSender, setSelectedTripToMatchSender] = useState<any | null>(null);
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
      if (Array.isArray(data.availableSenders)) {
        setAllAvailableSenderRequests(data.availableSenders);
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

  // Form states
  const [formData, setFormData] = useState({
    departureCity: '',
    arrivalCity: '',
    travelDate: '',
    availableWeight: '',
    pricePerKg: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAction()) return;
    try {
      const payload = {
        flight_number: "TRIP",
        airline: "TRAVELER_TRIP",
        aircraft: "N/A",
        from_location: formData.departureCity,
        to_location: formData.arrivalCity,
        from_airport: "N/A",
        to_airport: "N/A",
        departure_date: formData.travelDate,
        departure_time: "12:00:00",
        arrival_date: formData.travelDate,
        arrival_time: "12:00:00",
        duration: "N/A",
        terminal_from: formData.pricePerKg.toString(),
        terminal_to: "N/A",
        seats: "1",
        capacity_weight: parseFloat(formData.availableWeight) || 23.00,
      };

      const res = await apiFetch('/api/trips/', { method: 'POST', body: JSON.stringify(payload) });
      setTrips(prev => [res.data, ...prev]);
      alert("Trip posted successfully!");
      setIsModalOpen(false);
      setFormData({ departureCity: '', arrivalCity: '', travelDate: '', availableWeight: '', pricePerKg: '' });
    } catch (err: any) {
      alert("Failed to post trip: " + err.message);
    }
  };

  const handleDeleteTrip = async (id: number) => {
    try {
      await apiFetch(`/api/trips/${id}`, { method: 'DELETE' });
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert("Failed to delete trip: " + err.message);
    }
  };

  const handleBookingAction = async (bookingId: number, action: string) => {
    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, { method: 'POST', body: JSON.stringify({ action }) });
      addToast('Request Updated', `Booking ${action.toLowerCase()}ed successfully!`, 'success');
      fetchData();
      if (action === 'ACCEPT') {
        setSelectedTripForRequests(null);
      }
    } catch (err: any) {
      addToast('Action Failed', err.message || 'Server error occurred. Please try again.', 'error');
    }
  };

  const handleOpenFindSender = (trip: any) => {
    setSelectedTripToMatchSender(trip);
    fetchData();
  };

  const handleOfferToCarry = async (senderReq: any) => {
    if (!selectedTripToMatchSender) return;
    try {
      const reqWeight = parseFloat(senderReq.capacity_weight) || 1;
      const availWeight = parseFloat(selectedTripToMatchSender.available_weight) || 0;
      const safeWeight = reqWeight > availWeight ? availWeight : reqWeight;

      const payload = {
        trip: senderReq.id,
        package_name: senderReq.aircraft || 'Package',
        package_category: senderReq.aircraft || 'General',
        package_image: "",
        weight: safeWeight > 0 ? safeWeight : 0.1,
        reward: Number((safeWeight * (parseFloat(selectedTripToMatchSender.price_per_kg) || 10.0)).toFixed(2))
      };
      await apiFetch('/api/bookings/', { method: 'POST', body: JSON.stringify(payload) });

      alert(`Offer sent to Sender!`);
      setSelectedTripToMatchSender(null);
      fetchData();
    } catch (err: any) {
      alert("Failed to send offer: " + err.message);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Trip" />

      <main className="flex-1 min-w-0 w-full max-w-full lg:ml-[240px] flex flex-col min-h-screen lg:h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex h-[80px] bg-white border-b border-slate-100 items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1.5">
                Trip <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyora-teal to-teal-500">& Earn</span>
              </h1>
              <p className="text-sm font-bold text-slate-500 max-w-md leading-relaxed">
                Manage your logistics, track active routes, and maximize your earnings with our advanced dashboard.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="relative w-full sm:w-[320px]">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search routes, weight..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-700 outline-none focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => validateAction(() => navigate('/traveler/new'))}
                className="w-full sm:w-auto bg-gradient-to-r from-flyora-teal to-teal-600 text-white px-6 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus size={18} strokeWidth={3} />
                New Trip
              </button>
            </div>
          </div>

          {/* Premium MNC-style Earnings Dashboard Card */}
          <div className="relative rounded-[32px] p-8 md:p-10 mb-10 overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0D1C33] to-[#0A1628] shadow-[0_20px_60px_rgba(10,22,40,0.15)] border border-slate-800">
            {/* Abstract Decorative Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-flyora-teal/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
            
            {/* Glossy Overlay Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
              
              {/* Earnings Section */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <Wallet size={12} className="text-teal-400" />
                  </div>
                  <span className="text-[11px] font-black tracking-[0.2em] text-teal-100 uppercase">Total Earnings</span>
                </div>
                <div className="text-5xl md:text-6xl font-black text-white tracking-tight flex items-baseline gap-2">
                  <span className="text-teal-400 text-4xl md:text-5xl">₹</span>{Math.floor(totalEarnings).toLocaleString()}<span className="text-2xl md:text-3xl text-slate-400">.{(totalEarnings % 1).toFixed(2).substring(2)}</span>
                </div>
              </div>

              {/* Stats Section */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="flex-1 lg:flex-none flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Completed</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                    <span className="text-3xl font-black text-white">{completedCount}</span>
                  </div>
                </div>

                <div className="flex-1 lg:flex-none flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Delivered</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Package size={16} className="text-blue-400" />
                    </div>
                    <span className="text-3xl font-black text-white">{deliveredCount}</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-800">My Trips</h2>
            <div className="relative">
              <button className="bg-flyora-teal text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm shadow-teal-500/20 hover:bg-teal-600 transition">
                <Filter size={16} /> Filter
              </button>
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {trips.filter(t => filterText === '' || t.status === filterText).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[24px] p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                <Plane size={32} />
              </div>
              <h3 className="text-slate-700 font-bold mb-1">No trips found</h3>
              <p className="text-slate-500 text-sm max-w-sm">Create a new request by clicking the Create Request button or search for other terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips
                .filter(t => filterText === '' || t.status === filterText)
                .map(t => {
                  const allTripReqs = (t.bookings && t.bookings.length > 0) 
                    ? t.bookings 
                    : bookingRequests.filter(r => 
                        r.trip === t.id || String(r.trip?.id) === String(t.id) || 
                        (!r.trip && r.from_location === t.from_location && r.to_location === t.to_location)
                      );
                  
                  const tripReqs = allTripReqs.filter((r: any) => 
                    r.status !== 'CANCELLED' && r.status !== 'REJECTED'
                  );

                  let displayStatus = (t.status || 'ACTIVE').toUpperCase();
                  if (allTripReqs.length > 0) {
                    if (allTripReqs.some((r: any) => ['PAYMENT_RELEASED', 'COMPLETED', 'DELIVERED', 'RATED'].includes((r.status || '').toUpperCase()))) {
                      displayStatus = 'COMPLETED';
                    } else if (allTripReqs.some((r: any) => ['ACCEPTED', 'IN_TRANSIT', 'PAID', 'PARCEL_VERIFIED', 'ARRIVED', 'OUT_FOR_DELIVERY'].includes((r.status || '').toUpperCase()))) {
                      displayStatus = allTripReqs.some((r: any) => (r.status || '').toUpperCase() === 'ACCEPTED') ? 'ACCEPTED' : 'ACTIVE';
                    } else if (allTripReqs.every((r: any) => ['REJECTED', 'CANCELLED'].includes((r.status || '').toUpperCase()))) {
                      displayStatus = 'REJECTED';
                    } else if (allTripReqs.some((r: any) => ['PENDING', 'REQUEST_SENT', 'REQUEST_RECEIVED', 'WAITING_TRAVELLER'].includes((r.status || '').toUpperCase()))) {
                      displayStatus = 'PENDING';
                    }
                  }

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
                    <div key={t.id} className="group bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(13,148,136,0.08)] transition-all duration-300 relative overflow-hidden flex flex-col">
                      {/* Decorative top border gradient based on status */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${
                        displayStatus.toUpperCase() === 'ACTIVE' ? 'from-emerald-400 to-emerald-500' : 
                        displayStatus.toUpperCase() === 'ACCEPTED' ? 'from-teal-400 to-teal-500' :
                        (displayStatus.toUpperCase() === 'PAYMENT_RELEASED' || displayStatus.toUpperCase() === 'COMPLETED') ? 'from-blue-400 to-blue-500' :
                        displayStatus.toUpperCase() === 'PENDING' ? 'from-amber-400 to-amber-500' :
                        (displayStatus.toUpperCase() === 'REJECTED' || displayStatus.toUpperCase() === 'CANCELLED') ? 'from-rose-400 to-rose-500' :
                        'from-slate-300 to-slate-400'
                      }`}></div>

                      <div className="p-6 flex-1 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                              <Plane size={14} className="text-slate-400 transform -rotate-45" />
                            </div>
                            <span className="text-xs font-black text-slate-700 tracking-tight">TRIP #{t.id}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${getStatusStyle(displayStatus)}`}>
                            {displayStatus}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-xs font-bold text-slate-600 mb-6 w-fit border border-slate-100 shadow-sm">
                          <CalendarDays size={14} className="text-flyora-teal" />
                          {t.departure_date}
                        </div>

                        {/* Route Timeline */}
                        <div className="flex items-center justify-between relative mb-8">
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-slate-200 border-t-2 border-dashed border-slate-200 z-0"></div>
                          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center z-10 text-flyora-teal border border-teal-100 shadow-sm">
                            <Plane size={12} className="transform rotate-90" />
                          </div>
                          
                          <div className="relative z-10 flex flex-col items-start bg-white pr-4">
                            <div className="text-[10px] font-black text-flyora-teal uppercase tracking-widest mb-1">Departure</div>
                            <div className="text-sm font-extrabold text-slate-800 capitalize">{t.from_location}</div>
                          </div>
                          
                          <div className="relative z-10 flex flex-col items-end bg-white pl-4">
                            <div className="text-[10px] font-black text-flyora-teal uppercase tracking-widest mb-1">Arrival</div>
                            <div className="text-sm font-extrabold text-slate-800 capitalize">{t.to_location}</div>
                          </div>
                        </div>

                        {/* Stats/Details */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="flex flex-col gap-1 p-3 rounded-xl bg-teal-50/50 border border-teal-100/50 hover:bg-teal-50 transition-colors">
                            <span className="text-[10px] font-bold text-teal-600/70 uppercase">Available Space</span>
                            <div className="flex items-center gap-1.5 text-xs font-black text-teal-800">
                              <Package size={14} /> {t.available_weight} KG
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 p-3 rounded-xl bg-teal-50/50 border border-teal-100/50 hover:bg-teal-50 transition-colors">
                            <span className="text-[10px] font-bold text-teal-600/70 uppercase">Price per KG</span>
                            <div className="flex items-center gap-1.5 text-xs font-black text-teal-800">
                              <CreditCard size={14} /> ₹{t.price_per_kg}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                          <button
                            onClick={() => navigate(`/trip/${t.id}`)}
                            className="flex-1 bg-slate-900 hover:bg-flyora-teal text-white text-[11px] font-black uppercase tracking-wider px-4 py-3 rounded-xl shadow-md hover:shadow-teal-500/25 transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-flyora-teal"
                          >
                            <Eye size={14} /> Manage Requests
                            {tripReqs.length > 0 && (
                              <span className="bg-white text-flyora-teal w-5 h-5 rounded-full flex items-center justify-center text-[10px] ml-1">
                                {tripReqs.length}
                              </span>
                            )}
                          </button>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteTrip(t.id); }} 
                            className="w-11 h-11 shrink-0 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm" 
                            title="Delete Trip"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </main>

      {/* Post Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Post a Trip</h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill in your travel details to share your extra space.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              {/* Travel Details */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center text-xs">1</div>
                  Travel Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Departure City <span className="text-red-500">*</span></label>
                    <input type="text" name="departureCity" required value={formData.departureCity} onChange={handleInputChange} placeholder="e.g. Mumbai" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Arrival City <span className="text-red-500">*</span></label>
                    <input type="text" name="arrivalCity" required value={formData.arrivalCity} onChange={handleInputChange} placeholder="e.g. Dubai" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Travel Date <span className="text-red-500">*</span></label>
                    <input type="date" name="travelDate" required value={formData.travelDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                </div>
              </div>

              {/* Capacity & Pricing */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center text-xs">2</div>
                  Capacity & Pricing
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Available Weight (KG) <span className="text-red-500">*</span></label>
                    <input type="number" step="0.1" min="0.1" name="availableWeight" required value={formData.availableWeight} onChange={handleInputChange} placeholder="e.g. 10" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Price Per KG ($) <span className="text-red-500">*</span></label>
                    <input type="number" step="0.01" min="0" name="pricePerKg" required value={formData.pricePerKg} onChange={handleInputChange} placeholder="e.g. 8.5" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-flyora-teal hover:bg-teal-600 shadow-lg shadow-teal-500/20 transition">Post Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Requests Modal */}
      {selectedTripForRequests && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedTripForRequests(null) }}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Pending Requests</h3>
                <p className="text-xs text-slate-500 mt-0.5">Senders who want to book space on your trip.</p>
              </div>
              <button onClick={() => setSelectedTripForRequests(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {(() => {
                const tripReqs = bookingRequests.filter(r => r.trip === selectedTripForRequests.id && r.status === 'REQUEST_SENT');

                if (tripReqs.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <p className="text-slate-500 text-sm max-w-sm">No pending requests for this trip.</p>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-4">
                    {tripReqs.map((br: any) => {
                      const isKycApproved = br.sender?.is_kyc_verified || br.sender?.kyc_status === 'APPROVED';
                      return (
                        <div key={br.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-flyora-teal/30 transition">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{br.package_category || 'Parcel'}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span className="text-xs font-bold text-emerald-700">{br.weight} KG</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              {isKycApproved ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <ShieldCheck size={12} /> KYC Verified
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <ShieldCheck size={12} /> KYC Pending
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mt-1.5">
                              Sender: {br.sender_name || br.sender?.name || 'Verified Sender'}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 font-medium">
                              Offered Reward: <strong className="text-emerald-600">₹{br.reward || br.agreed_price || 0}</strong>
                            </div>
                            {(br.receiver_name || br.receiver?.name || br.receiver_phone || br.receiver?.phone) && (
                              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 rounded-md px-2 py-1 mt-1.5 flex items-center gap-1.5 w-fit">
                                <User size={12} className="text-emerald-600" />
                                <span>Receiver: <strong>{br.receiver_name || br.receiver?.name || 'Receiver'}</strong></span>
                                {(br.receiver_phone || br.receiver?.phone) && (
                                  <span className="text-emerald-700 font-mono text-[11px] font-bold">({br.receiver_phone || br.receiver?.phone})</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setInspectImgIndex(0);
                                setSelectedBookingToInspect(br);
                              }}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                            >
                              <Eye size={14} /> Inspect Details & Photos
                            </button>
                            <button onClick={() => handleBookingAction(br.id, 'ACCEPT')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition">
                              Accept
                            </button>
                            <button onClick={() => handleBookingAction(br.id, 'REJECT')} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg transition">
                              Decline
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Request Inspection Modal for Traveler */}
      {selectedBookingToInspect && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedBookingToInspect(null)}>
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Parcel Delivery Request #{selectedBookingToInspect.id}</h3>
                  <p className="text-xs text-slate-500">Review package photos and sender details before accepting</p>
                </div>
              </div>
              <button onClick={() => setSelectedBookingToInspect(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Sender Profile & KYC Status Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs">
                      {selectedBookingToInspect.sender_name?.slice(0,2)?.toUpperCase() || 'SD'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{selectedBookingToInspect.sender_name || selectedBookingToInspect.sender?.name || 'Sender'}</h4>
                      <p className="text-xs text-slate-500">{selectedBookingToInspect.sender?.email || 'Registered Sender'}</p>
                    </div>
                  </div>

                  {/* Sender KYC Status Badge */}
                  {selectedBookingToInspect.sender?.is_kyc_verified || selectedBookingToInspect.sender?.kyc_status === 'APPROVED' ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <ShieldCheck size={15} className="text-emerald-600" /> KYC Verified ✅
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <ShieldCheck size={15} className="text-amber-500" /> KYC Pending ⚠️
                    </span>
                  )}
                </div>
              </div>

              {/* Package Photos Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Package Photos</p>
                  <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {(() => {
                      const rawImgs = selectedBookingToInspect.accepted_parcel_types || [];
                      const pImg = selectedBookingToInspect.package_image || selectedBookingToInspect.package?.image;
                      const allImgs: string[] = Array.isArray(rawImgs) ? [...rawImgs] : [];
                      if (pImg && pImg.length > 30 && !allImgs.includes(pImg)) allImgs.unshift(pImg);
                      const validImgs = allImgs.filter(img => img && (img.startsWith('data:image') || img.startsWith('http') || img.startsWith('/')));
                      return `${validImgs.length} Photo${validImgs.length !== 1 ? 's' : ''}`;
                    })()}
                  </span>
                </div>

                {(() => {
                  const rawImgs = selectedBookingToInspect.accepted_parcel_types || [];
                  const pImg = selectedBookingToInspect.package_image || selectedBookingToInspect.package?.image;
                  const allImgs: string[] = Array.isArray(rawImgs) ? [...rawImgs] : [];
                  if (pImg && pImg.length > 30 && !allImgs.includes(pImg)) allImgs.unshift(pImg);
                  const validImgs = allImgs.filter(img => img && (img.startsWith('data:image') || img.startsWith('http') || img.startsWith('/')));

                  if (validImgs.length === 0) {
                    return (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium">
                        No package photos attached by sender for this request.
                      </div>
                    );
                  }

                  const activePhoto = validImgs[inspectImgIndex] || validImgs[0];

                  return (
                    <div className="space-y-2">
                      <div
                        className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900 aspect-video flex items-center justify-center relative cursor-zoom-in group shadow-sm"
                        onClick={() => setInspectZoomImg(activePhoto)}
                      >
                        <img src={activePhoto} alt="Package Photo" className="w-full h-full object-contain bg-slate-950/90" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-[2px]">
                          <Eye size={16} /> Click to Enlarge Photo
                        </div>
                      </div>
                      {validImgs.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                          {validImgs.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setInspectImgIndex(idx)}
                              className={`w-14 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${
                                inspectImgIndex === idx ? 'border-teal-500 scale-105 ring-2 ring-teal-300' : 'border-slate-200 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Parcel Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Package Name & Category</p>
                  <p className="text-sm font-black text-slate-800">{selectedBookingToInspect.package_name || selectedBookingToInspect.package?.name || 'Parcel'}</p>
                  <p className="text-xs text-slate-500 capitalize">{selectedBookingToInspect.package_category || selectedBookingToInspect.package?.category || 'General'}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Weight & Offered Reward</p>
                  <p className="text-sm font-black text-slate-800">{selectedBookingToInspect.weight} KG Space Required</p>
                  <p className="text-xs font-bold text-emerald-600">₹{selectedBookingToInspect.reward || selectedBookingToInspect.agreed_price || 0} Reward Payment</p>
                </div>
              </div>

              {/* Designated Receiver Details */}
              {(selectedBookingToInspect.receiver_name || selectedBookingToInspect.receiver?.name || selectedBookingToInspect.receiver_phone || selectedBookingToInspect.receiver?.phone) && (
                <div className="bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-slate-50 rounded-2xl p-4 border border-emerald-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300/60">
                      <User size={12} /> Designated Receiver
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Delivery Contact</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">
                        {selectedBookingToInspect.receiver_name || selectedBookingToInspect.receiver?.name || 'Receiver'}
                      </h4>
                      {(selectedBookingToInspect.receiver_address || selectedBookingToInspect.receiver?.address) && (
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-1 font-medium">
                          <MapPin size={12} className="text-emerald-600 shrink-0" />
                          <span>{selectedBookingToInspect.receiver_address || selectedBookingToInspect.receiver?.address}</span>
                        </p>
                      )}
                    </div>
                    {(selectedBookingToInspect.receiver_phone || selectedBookingToInspect.receiver?.phone) && (
                      <a
                        href={`tel:${selectedBookingToInspect.receiver_phone || selectedBookingToInspect.receiver?.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition shadow-sm w-fit"
                        title="Call Receiver"
                      >
                        <Phone size={13} />
                        <span>{selectedBookingToInspect.receiver_phone || selectedBookingToInspect.receiver?.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50 flex-shrink-0">
              <button
                onClick={() => {
                  handleBookingAction(selectedBookingToInspect.id, 'ACCEPT');
                  setSelectedBookingToInspect(null);
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} /> Accept Request
              </button>
              <button
                onClick={() => {
                  handleBookingAction(selectedBookingToInspect.id, 'REJECT');
                  setSelectedBookingToInspect(null);
                }}
                className="px-4 py-3 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <XCircle size={16} /> Decline Request
              </button>
            </div>

          </div>
        </div>
      )}

      {inspectZoomImg && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setInspectZoomImg(null)}>
          <img src={inspectZoomImg} alt="Zoom" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" />
          <button className="absolute top-4 right-4 bg-white/20 text-white p-3 rounded-full hover:bg-white/30"><X size={20} /></button>
        </div>
      )}

      {/* Find Sender Modal */}
      {selectedTripToMatchSender && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedTripToMatchSender(null) }}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Available Senders ({allAvailableSenderRequests.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Matching route: {selectedTripToMatchSender.from_location} to {selectedTripToMatchSender.to_location}</p>
              </div>
              <button onClick={() => setSelectedTripToMatchSender(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {(() => {
                const matchedRequests = allAvailableSenderRequests.filter((r: any) =>
                  r.from_location?.toLowerCase().includes(selectedTripToMatchSender.from_location?.toLowerCase()) &&
                  r.to_location?.toLowerCase().includes(selectedTripToMatchSender.to_location?.toLowerCase())
                );

                const displayRequests = matchedRequests.length > 0 ? matchedRequests : allAvailableSenderRequests;

                if (displayRequests.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-200 shadow-sm">
                        <Search size={32} />
                      </div>
                      <h4 className="text-slate-700 font-bold mb-1">No Senders Found</h4>
                      <p className="text-slate-500 text-sm max-w-sm">No active sender requests are currently registered in the system. Try again later.</p>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-4">
                    {matchedRequests.length === 0 && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium mb-2">
                        No exact route match found. Showing all active sender requests instead.
                      </div>
                    )}
                    {displayRequests.map((req: any) => (
                      <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-flyora-teal/30 transition">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">SE</div>
                            <span className="text-xs font-bold text-slate-700">Sender Package</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-xs text-slate-500">{req.departure_date}</span>
                          </div>
                          <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mt-2">
                            {req.from_location} <Plane size={14} className="text-slate-400 rotate-90" /> {req.to_location}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Package Weight: <span className="font-bold text-slate-700">{req.capacity_weight} KG</span> • Category: <span className="font-bold text-slate-700">{req.aircraft}</span>
                          </div>
                        </div>
                        {(() => {
                          const isTooHeavy = parseFloat(req.capacity_weight) > parseFloat(selectedTripToMatchSender.available_weight);
                          return (
                            <button
                              onClick={() => handleOfferToCarry(req)}
                              className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition whitespace-nowrap bg-flyora-teal hover:bg-teal-600`}
                            >
                              {isTooHeavy ? 'Offer Partial' : 'Offer to Carry'}
                            </button>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <KycValidationModal isOpen={isKycModalOpen} onClose={closeKycModal} kycStatus={kycStatus} />
    </div>
  );
};

export default TravelerPage;
