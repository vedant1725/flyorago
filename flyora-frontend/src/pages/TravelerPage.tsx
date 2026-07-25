import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Plane, Search, Plus, Filter, Bell, ChevronDown, Edit2, Trash2, X, CalendarDays, Package, CreditCard, ShieldCheck, CheckCircle2, XCircle, Eye, User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { useSocket } from '../context/SocketContext';
import '../pages/dashboard.css';

const TravelerPage: React.FC = () => {
  const navigate = useNavigate();
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

  const fetchData = async () => {
    try {
      const tripsRes = await apiFetch('/api/trips/?user_only=true');
      const tripsData = tripsRes.data || tripsRes.results || (Array.isArray(tripsRes) ? tripsRes : []);
      setTrips(tripsData.filter((t: any) => t.airline === 'TRAVELER_TRIP'));

      const bookingsRes = await apiFetch('/api/bookings/?user_only=true');
      const bookingsData = bookingsRes.data || bookingsRes.results || (Array.isArray(bookingsRes) ? bookingsRes : []);
      setBookingRequests(bookingsData);
    } catch (err: any) {
      alert("Error fetching data: " + err.message);
      console.error(err);
    }
  };

  const fetchSenders = async () => {
    try {
      const res = await apiFetch('/api/trips/');
      const trips = res.data || res.results || (Array.isArray(res) ? res : []);
      setAllAvailableSenderRequests(trips.filter((t: any) => t.airline === 'SENDER_REQUEST'));
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSenders();
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
      alert(`Booking ${action.toLowerCase()}ed!`);
      fetchData();
      if (action === 'ACCEPT') {
        setSelectedTripForRequests(null);
      }
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  const handleOpenFindSender = (trip: any) => {
    setSelectedTripToMatchSender(trip);
    fetchSenders();
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
        reward: 0
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
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Trip" />

      <main className="flex-1 lg:ml-[240px] flex flex-col h-[calc(100vh-60px)] lg:h-screen overflow-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex h-[80px] bg-white border-b border-slate-100 items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-flyora-teal tracking-tight mb-1">Trip <span className="text-slate-800">& Earn</span></h1>
            <p className="text-sm text-slate-500 font-medium">Manage your logistics, track active routes, and review your earnings profile.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="relative w-full md:w-[400px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by routes, weight, price/kg"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-full text-sm outline-none focus:border-flyora-teal transition shadow-sm"
              />
            </div>
            <button
              onClick={() => validateAction(() => setIsModalOpen(true))}
              className="bg-flyora-teal text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition flex items-center gap-2 shrink-0"
            >
              <Plus size={16} />
              Create Request
            </button>
          </div>

          <div className="bg-flyora-teal rounded-[24px] p-8 text-white mb-10 relative overflow-hidden shadow-xl shadow-teal-500/20 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
            <div className="absolute -right-20 -top-40 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center md:text-left">
              <div className="text-[10px] font-black tracking-widest text-white/70 mb-1 uppercase">TOTAL EARNINGS</div>
              <div className="text-4xl md:text-5xl font-black tracking-tight">$6,000.00</div>
            </div>

            <div className="relative z-10 flex items-center gap-12 bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
              <div className="text-center">
                <div className="text-[10px] font-black tracking-widest text-white/70 mb-1 uppercase">TOTAL COMPLETED</div>
                <div className="text-3xl font-black">1</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black tracking-widest text-white/70 mb-1 uppercase">TOTAL DELIVERED</div>
                <div className="text-3xl font-black">0</div>
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
                  const tripReqs = bookingRequests.filter(r => 
                    (r.trip === t.id || String(r.trip?.id) === String(t.id) || (r.from_location === t.from_location && r.to_location === t.to_location)) &&
                    r.status !== 'CANCELLED' && r.status !== 'REJECTED'
                  );

                  return (
                    <div key={t.id} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-semibold text-slate-400">Trip Id - #{t.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="bg-flyora-teal text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">{t.status || 'Active'}</span>
                          <button className="text-slate-400 hover:text-flyora-teal"><ChevronDown className="-rotate-90" size={16} /></button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-6">
                        <CalendarDays size={14} className="text-flyora-teal" />
                        {t.departure_date}
                      </div>

                      <div className="flex flex-col gap-4 relative mb-6">
                        <div className="absolute left-[5px] top-2 bottom-2 w-px border-l-2 border-dashed border-flyora-teal/30"></div>

                        <div className="flex items-start gap-4">
                          <div className="w-3 h-3 rounded-full border-2 border-flyora-teal bg-white mt-0.5 z-10"></div>
                          <div className="w-full">
                            <div className="text-[9px] font-black text-flyora-teal uppercase tracking-wider mb-0.5">From</div>
                            <div className="text-sm font-bold text-slate-800 flex justify-between items-center">{t.from_location} <ChevronDown size={14} className="text-slate-400" /></div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-3 h-3 rounded-full bg-flyora-teal mt-0.5 z-10"></div>
                          <div className="w-full">
                            <div className="text-[9px] font-black text-flyora-teal uppercase tracking-wider mb-0.5">To</div>
                            <div className="text-sm font-bold text-slate-800 flex justify-between items-center">{t.to_location} <ChevronDown size={14} className="text-slate-400" /></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-flyora-teal/20 text-flyora-teal bg-flyora-teal/5 text-xs font-bold">
                          <Package size={14} /> {t.available_weight}kg
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-flyora-teal/20 text-flyora-teal bg-flyora-teal/5 text-xs font-bold">
                          <CreditCard size={14} /> ${t.price_per_kg}/kg
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                        <button
                          onClick={() => navigate(`/trip/${t.id}`)}
                          className="bg-flyora-teal hover:bg-teal-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
                        >
                          <Eye size={13} /> View Trip & Requests ({tripReqs.length})
                        </button>
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/trip/${t.id}`)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-flyora-teal hover:bg-slate-100 transition" title="View Details">
                            <Eye size={13} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTrip(t.id); }} className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition" title="Delete Trip">
                            <X size={14} strokeWidth={3} />
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
                              Offered Reward: <strong className="text-emerald-600">${br.reward || br.agreed_price || 0}</strong>
                            </div>
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
                  <p className="text-xs font-bold text-emerald-600">${selectedBookingToInspect.reward || selectedBookingToInspect.agreed_price || 0} Reward Payment</p>
                </div>
              </div>

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
