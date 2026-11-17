import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import {
  Package, Search, Plus, Filter, Plane, Shield, CreditCard,
  CalendarDays, Eye, Wallet, ArrowRight, Trash2, X, Upload, CheckCircle2, Send
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { LocationAutocomplete } from '../components/ui/LocationAutocomplete';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import '../pages/dashboard.css';

const SenderPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { validateAction, isModalOpen: isKycModalOpen, closeModal: closeKycModal, kycStatus } = useKycValidation();

  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestToMatch, setSelectedRequestToMatch] = useState<any | null>(null);
  const [selectedBookingToPay, setSelectedBookingToPay] = useState<any | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [allAvailableTrips, setAllAvailableTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id?: any; email?: string } | null>(null);
  const [platformFee, setPlatformFee] = useState<number>(10.00);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const res = await apiFetch('/api/profiles/me/');
      if (res?.data) {
        setCurrentUser({
          id: res.data.user?.id || res.data.id || res.data.userId,
          email: res.data.user?.email || res.data.email
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const { lastMessage } = useSocket();

  useEffect(() => {
    if (lastMessage) {
      fetchData();
    }
  }, [lastMessage]);

  const fetchData = async () => {
    try {
      const cachedReqs = sessionStorage.getItem('flyora_sender_requests');
      if (cachedReqs && requests.length === 0) setRequests(JSON.parse(cachedReqs));
      const cachedBookings = sessionStorage.getItem('flyora_sender_bookings');
      if (cachedBookings && bookings.length === 0) setBookings(JSON.parse(cachedBookings));
    } catch (e) {}

    try {
      const overviewRes = await apiFetch('/api/sender/dashboard-overview/');
      const data = overviewRes?.data || {};

      if (data.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email });
      }

      const tripsData = data.trips || [];
      const senderReqs = tripsData.filter((t: any) => t.airline === 'SENDER_REQUEST');
      setRequests(senderReqs);
      try {
        sessionStorage.setItem('flyora_sender_requests', JSON.stringify(senderReqs));
      } catch (e) {}

      const bookingsData = data.bookings || [];
      setBookings(bookingsData);
      try {
        sessionStorage.setItem('flyora_sender_bookings', JSON.stringify(bookingsData));
      } catch (e) {}

      if (data.availableTravelers) {
        setAllAvailableTrips(data.availableTravelers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTravelers = async () => {
    try {
      const res = await apiFetch('/api/trips/');
      const trips = res.data || res.results || (Array.isArray(res) ? res : []);
      setAllAvailableTrips(trips.filter((t: any) => t.airline !== 'SENDER_REQUEST'));
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchData();
    fetchTravelers();

    const fetchPlatformFeeSetting = async () => {
      try {
        const res = await apiFetch('/api/payments/settings/');
        if (res?.data?.platform_fee !== undefined) {
          setPlatformFee(Number(res.data.platform_fee));
        }
      } catch (err) {
        console.error("Failed to load platform fee", err);
      }
    };
    fetchPlatformFeeSetting();
  }, []);

  const handleOpenFindTraveler = (req: any) => {
    setSelectedRequestToMatch(req);
    fetchTravelers();
  };

  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    deliveryDate: '',
    weight: '',
    category: '',
    description: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAction()) return;
    if (files.length === 0) {
      alert("Please upload at least 1 photo of the package.");
      return;
    }

    try {
      const imageBase64List = await Promise.all(
        files.map(file => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        }))
      );

      const validImages = imageBase64List.filter(img => img && img.length > 20);

      const payload = {
        flight_number: "REQ",
        airline: "SENDER_REQUEST",
        aircraft: formData.category,
        from_location: formData.pickup,
        to_location: formData.dropoff,
        from_airport: formData.description.slice(0, 150),
        to_airport: "N/A",
        departure_date: formData.deliveryDate,
        departure_time: "12:00:00",
        arrival_date: formData.deliveryDate,
        arrival_time: "12:00:00",
        duration: "N/A",
        terminal_from: (formData.receiverName || 'Receiver').slice(0, 50),
        terminal_to: (formData.receiverPhone || '').slice(0, 30),
        notes: JSON.stringify({
          receiver_name: formData.receiverName,
          receiver_phone: formData.receiverPhone,
          receiver_address: formData.receiverAddress || formData.dropoff
        }),
        seats: "1",
        capacity_weight: parseFloat(formData.weight) || 1.0,
        accepted_parcel_types: validImages,
      };

      const res = await apiFetch('/api/trips/', { method: 'POST', body: JSON.stringify(payload) });

      try {
        await apiFetch('/api/bookings/', {
          method: 'POST',
          body: JSON.stringify({
            sender_trip: res.data?.id,
            package_name: `${formData.category || 'General'} Parcel`,
            package_category: formData.category || 'General',
            weight: parseFloat(formData.weight) || 1.0,
            reward: 50.0,
            receiver_name: formData.receiverName || 'Receiver',
            receiver_phone: formData.receiverPhone || '',
            receiver_address: formData.receiverAddress || formData.dropoff
          })
        });
      } catch (e) {}

      setRequests([res.data, ...requests]);
      addToast?.("Request created successfully!", "success");
      setIsModalOpen(false);
      setFormData({ pickup: '', dropoff: '', deliveryDate: '', weight: '', category: '', description: '', receiverName: '', receiverPhone: '', receiverAddress: '' });
      setFiles([]);
    } catch (err: any) {
      alert("Failed to create request: " + err.message);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this package request?")) return;
    try {
      await apiFetch(`/api/trips/${id}/`, { method: 'DELETE' });
      setRequests(prev => prev.filter(r => r.id !== id));
      addToast?.("Package request cancelled", "success");
    } catch (err: any) {
      alert("Failed to delete request: " + err.message);
    }
  };

  const handleSendRequestToTraveler = async (travelerTrip: any) => {
    if (!selectedRequestToMatch || isSendingRequest) return;
    setIsSendingRequest(true);
    try {
      const reqWeight = parseFloat(selectedRequestToMatch.capacity_weight) || 1;
      const availWeight = parseFloat(travelerTrip.available_weight) || 0;
      const safeWeight = reqWeight > availWeight ? availWeight : reqWeight;

      let recName = selectedRequestToMatch.receiver_name || '';
      let recPhone = selectedRequestToMatch.receiver_phone || '';
      let recAddr = selectedRequestToMatch.receiver_address || selectedRequestToMatch.to_location || '';
      if (!recName && selectedRequestToMatch.terminal_from && selectedRequestToMatch.terminal_from !== 'N/A') {
        recName = selectedRequestToMatch.terminal_from;
      }
      if (!recPhone && selectedRequestToMatch.terminal_to && selectedRequestToMatch.terminal_to !== 'N/A') {
        recPhone = selectedRequestToMatch.terminal_to;
      }
      try {
        if (selectedRequestToMatch.notes) {
          const parsed = JSON.parse(selectedRequestToMatch.notes);
          if (parsed.receiver_name) recName = parsed.receiver_name;
          if (parsed.receiver_phone) recPhone = parsed.receiver_phone;
          if (parsed.receiver_address) recAddr = parsed.receiver_address;
        }
      } catch (e) {}

      const payload = {
        trip: travelerTrip.id,
        sender_trip: selectedRequestToMatch.id,
        package_name: selectedRequestToMatch.aircraft || selectedRequestToMatch.package_name || 'Parcel',
        package_category: selectedRequestToMatch.aircraft || 'General',
        package_image: JSON.stringify(selectedRequestToMatch.accepted_parcel_types || []),
        weight: safeWeight > 0 ? safeWeight : 0.1,
        reward: Number((safeWeight * (parseFloat(travelerTrip.price_per_kg) || 10.0)).toFixed(2)),
        receiver_name: recName || 'Receiver',
        receiver_phone: recPhone || '',
        receiver_address: recAddr || ''
      };
      await apiFetch('/api/bookings/', { method: 'POST', body: JSON.stringify(payload) });

      await fetchData();
      addToast?.("Request sent to traveler successfully!", "success");
      setSelectedRequestToMatch(null);
    } catch (err: any) {
      alert("Failed to send request: " + err.message);
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleDepositEscrow = async (bookingId: number) => {
    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, { method: 'POST', body: JSON.stringify({ action: 'PAY' }) });
      addToast?.("Payment successful! Funds are securely held in escrow.", "success");
      setSelectedBookingToPay(null);
      fetchData();
    } catch (err: any) {
      alert("Payment failed: " + err.message);
    }
  };

  // Metrics computation
  const inTransitCount = useMemo(() => {
    return bookings.filter((b: any) =>
      b.status === 'IN_TRANSIT' || b.status === 'OUT_FOR_DELIVERY' || b.status === 'ARRIVED'
    ).length;
  }, [bookings]);

  const deliveredCount = useMemo(() => {
    return bookings.filter((b: any) =>
      b.status === 'DELIVERED' || b.status === 'PAYMENT_RELEASED'
    ).length;
  }, [bookings]);

  const pendingCount = useMemo(() => {
    return requests.filter((r: any) => {
      const linkedBk = bookings.find(b =>
        (b.sender_trip && String(b.sender_trip) === String(r.id)) ||
        (b.trip && String(b.trip) === String(r.id)) ||
        (b.trip_details && String(b.trip_details.id) === String(r.id))
      );
      if (!linkedBk) return r.status === 'Active' || !r.status;
      return linkedBk.status === 'PENDING' || linkedBk.status === 'REQUESTED' || r.status === 'Active';
    }).length;
  }, [requests, bookings]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    const q = (filterText || headerSearchQuery).toLowerCase().trim();
    return requests.filter(req => {
      const matchesSearch = !q ||
        (req.aircraft && req.aircraft.toLowerCase().includes(q)) ||
        (req.from_location && req.from_location.toLowerCase().includes(q)) ||
        (req.to_location && req.to_location.toLowerCase().includes(q)) ||
        (req.from_airport && req.from_airport.toLowerCase().includes(q)) ||
        (req.capacity_weight && String(req.capacity_weight).includes(q)) ||
        (String(req.id).includes(q));

      if (!statusFilter) return matchesSearch;

      const linkedBk = bookings.find(b =>
        (b.sender_trip && String(b.sender_trip) === String(req.id)) ||
        (b.trip && String(b.trip) === String(req.id)) ||
        (b.trip_details && String(b.trip_details.id) === String(req.id))
      );

      const cardStatus = linkedBk ? (
        linkedBk.status === 'PAYMENT_RELEASED' || linkedBk.status === 'DELIVERED' ? 'Delivered' :
        linkedBk.status === 'IN_TRANSIT' || linkedBk.status === 'OUT_FOR_DELIVERY' ? 'In Transit' :
        linkedBk.status === 'ACCEPTED' ? 'Accepted' : 'Pending'
      ) : (req.status || 'Active');

      const matchesStatus = cardStatus.toLowerCase().includes(statusFilter.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  }, [requests, bookings, filterText, headerSearchQuery, statusFilter]);

  const getStatusBadge = (cardStatus: string) => {
    const s = (cardStatus || '').toUpperCase();
    if (s.includes('DELIVERED') || s.includes('COMPLETED') || s.includes('PAID') || s.includes('RELEASED')) {
      return {
        cls: 'bg-blue-50 text-blue-600 border-blue-200',
        gradient: 'from-blue-400 to-blue-500'
      };
    }
    if (s.includes('IN_TRANSIT') || s.includes('OUT_FOR_DELIVERY') || s.includes('TRANSIT')) {
      return {
        cls: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        gradient: 'from-emerald-400 to-emerald-500'
      };
    }
    if (s.includes('ACCEPTED') || s.includes('VERIFIED')) {
      return {
        cls: 'bg-teal-50 text-teal-700 border-teal-200',
        gradient: 'from-teal-400 to-teal-500'
      };
    }
    if (s.includes('CANCELLED') || s.includes('REJECTED')) {
      return {
        cls: 'bg-rose-50 text-rose-600 border-rose-200',
        gradient: 'from-rose-400 to-rose-500'
      };
    }
    return {
      cls: 'bg-amber-50 text-amber-600 border-amber-200',
      gradient: 'from-amber-400 to-amber-500'
    };
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      <Sidebar activeItem="Sender" />

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
                placeholder="Search parcels, destinations..."
                className="flex-1 bg-transparent text-sm text-slate-800 font-medium border-0 outline-none ring-0 placeholder:text-slate-400"
              />
              {headerSearchQuery ? (
                <button onClick={() => setHeaderSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-md">
                  Ctrl K
                </kbd>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        {/* ─── Main Content Container ─── */}
        <div className="px-4 sm:px-8 xl:px-10 space-y-6 sm:space-y-8 relative z-20">

          {/* ─── Title & Action Bar ─── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>My</span>
                <span className="text-flyora-teal">Packages</span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 max-w-xl">
                Send packages across cities with verified travelers. Fast, transparent, and secured by escrow.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="relative hidden sm:block w-64 md:w-72">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                  placeholder="Search parcels, routes..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-flyora-teal focus:ring-2 focus:ring-teal-500/10 transition shadow-xs"
                />
              </div>

              <button
                onClick={() => validateAction(() => navigate('/sender/new'))}
                className="w-full sm:w-auto justify-center bg-flyora-teal hover:bg-[#0F766E] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 hover:-translate-y-0.5 transition flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Create Request</span>
              </button>
            </div>
          </div>

          {/* ─── Premium MNC Dark Overview Card ─── */}
          <div className="relative rounded-2xl sm:rounded-[28px] p-5 sm:p-8 bg-[#0A1628] shadow-[0_20px_50px_rgba(10,22,40,0.18)] border border-slate-800 overflow-hidden">
            {/* Abstract glow */}
            <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-flyora-teal/15 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[70px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
              {/* Left Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <Package size={13} className="text-teal-400" />
                  </div>
                  <span className="text-[11px] font-black tracking-[0.2em] text-teal-300 uppercase">
                    PACKAGE OVERVIEW
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>SEND A</span>
                  <span className="text-flyora-teal">PACKAGE</span>
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1 max-w-md">
                  Connect with verified travelers flying to your destination and deliver safely.
                </p>
              </div>

              {/* Right Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition min-w-[95px] text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-2xl sm:text-3xl font-black text-white">{requests.length.toString().padStart(2, '0')}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition min-w-[95px] text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Transit</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">{inTransitCount.toString().padStart(2, '0')}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition min-w-[95px] text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivered</p>
                  <p className="text-2xl sm:text-3xl font-black text-cyan-400">{deliveredCount.toString().padStart(2, '0')}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition min-w-[95px] text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending</p>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">{pendingCount.toString().padStart(2, '0')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Package Requests Header & Filter ─── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-flyora-teal rounded-full" />
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Package Requests</h2>
            </div>

            <div className="relative inline-block">
              <button className="bg-flyora-teal hover:bg-[#0F766E] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition">
                <Filter size={14} />
                <span>Filter</span>
                {statusFilter && <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">{statusFilter}</span>}
              </button>
              <select
                aria-label="Filter packages by status"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Accepted">Accepted</option>
              </select>
            </div>
          </div>

          {/* ─── Requests List or Empty State ─── */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-[28px] p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(10,22,40,0.03)]">
              <div className="w-16 h-16 bg-teal-50/60 rounded-full flex items-center justify-center text-flyora-teal mb-4 border border-teal-100">
                <Package size={28} />
              </div>
              <h3 className="text-slate-800 font-black text-lg mb-1">No package requests found</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm font-medium mb-6">
                Create a new request by clicking the Create Request button or search for other terms.
              </p>
              <button
                onClick={() => validateAction(() => navigate('/sender/new'))}
                className="bg-flyora-teal hover:bg-[#0F766E] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-teal-500/20 hover:-translate-y-0.5 transition flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Create Request</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {filteredRequests.map(req => {
                const linkedBk = bookings.find(b =>
                  (b.sender_trip && String(b.sender_trip) === String(req.id)) ||
                  (b.trip && String(b.trip) === String(req.id)) ||
                  (b.trip_details && String(b.trip_details.id) === String(req.id))
                );

                const cardStatus = linkedBk ? (
                  linkedBk.status === 'PAYMENT_RELEASED' || linkedBk.status === 'DELIVERED' || linkedBk.status === 'DISPUTED' || linkedBk.status === 'DISPUTE_RESOLVED' ? 'Delivered' :
                  linkedBk.status === 'IN_TRANSIT' ? 'In Transit' :
                  linkedBk.status === 'OUT_FOR_DELIVERY' || linkedBk.status === 'ARRIVED' ? 'Out For Delivery' :
                  linkedBk.status === 'PARCEL_VERIFIED' ? 'Parcel Verified' :
                  linkedBk.payment_status === 'Escrow Hold' || linkedBk.payment_status === 'PAID' || linkedBk.status === 'PAID' ? 'Paid' :
                  linkedBk.status === 'ACCEPTED' ? 'Accepted' : linkedBk.status
                ) : (req.status === 'Active' ? 'Active' : 'Requested');

                const badge = getStatusBadge(cardStatus);

                return (
                  <div
                    key={req.id}
                    className="group bg-white rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgba(10,22,40,0.03)] hover:shadow-[0_12px_32px_rgba(13,148,136,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col"
                  >
                    {/* Top Status Gradient Bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${badge.gradient}`} />

                    <div className="p-5 sm:p-6 flex-1 flex flex-col">
                      {/* Card Header */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
                            <Package size={16} className="text-flyora-teal" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">
                              Parcel #{req.id}
                            </span>
                            <span className="text-xs font-black text-slate-800 tracking-tight">
                              {req.aircraft || 'General Parcel'}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-2xs ${badge.cls}`}>
                          {cardStatus.replace(/[^A-Za-z ]/g, '').trim()}
                        </span>
                      </div>

                      {/* Route Section */}
                      <div className="bg-slate-50/70 rounded-2xl p-3.5 mb-4 border border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pickup</p>
                            <p className="text-xs font-black text-slate-800 truncate" title={req.from_location}>
                              {req.from_location}
                            </p>
                          </div>

                          <div className="flex flex-col items-center px-2 shrink-0">
                            <div className="flex items-center gap-1 text-flyora-teal">
                              <span className="w-1.5 h-1.5 rounded-full bg-flyora-teal" />
                              <div className="w-8 border-t border-dashed border-flyora-teal/40" />
                              <ArrowRight size={12} className="text-flyora-teal" />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                              <CalendarDays size={10} /> {req.departure_date}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dropoff</p>
                            <p className="text-xs font-black text-slate-800 truncate" title={req.to_location}>
                              {req.to_location}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Info Chips */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50/60 border border-teal-100 text-teal-800 text-xs font-bold">
                          <Package size={13} className="text-flyora-teal" />
                          <span>{req.capacity_weight} kg</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-bold">
                          <span>Category:</span>
                          <span className="text-slate-800 font-black">{req.aircraft || 'General'}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 gap-2 mt-auto">
                        <button
                          onClick={() => navigate(`/booking/${req.id}`)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition flex items-center gap-1.5"
                          title="View Request Details"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>

                        {(!linkedBk || (linkedBk.status !== 'ACCEPTED' && linkedBk.status !== 'PAID' && linkedBk.status !== 'IN_TRANSIT' && linkedBk.status !== 'DELIVERED')) && (
                          <button
                            onClick={() => handleOpenFindTraveler(req)}
                            className="flex-1 bg-slate-900 hover:bg-flyora-teal text-white text-xs font-black py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Search size={13} />
                            <span>Find Traveler</span>
                          </button>
                        )}

                        {linkedBk && linkedBk.status === 'ACCEPTED' && (
                          <button
                            onClick={() => setSelectedBookingToPay(linkedBk)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Wallet size={13} />
                            <span>Pay Escrow</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition shrink-0"
                          title="Cancel Request"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* ─── Create Request Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Create New Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">Fill in all details to post a new shipment request.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              {/* Route Details */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center text-xs">1</div>
                  Route Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Pickup Location <span className="text-red-500">*</span></label>
                    <LocationAutocomplete
                      name="pickup"
                      value={formData.pickup}
                      onChange={(val) => setFormData(prev => ({ ...prev, pickup: val }))}
                      placeholder="Type city or airport (e.g. Mumbai, Surat, AMD)..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Drop-off Location <span className="text-red-500">*</span></label>
                    <LocationAutocomplete
                      name="dropoff"
                      value={formData.dropoff}
                      onChange={(val) => setFormData(prev => ({ ...prev, dropoff: val }))}
                      placeholder="Type city or airport (e.g. Delhi, Bangalore, BLR)..."
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Delivery By Date <span className="text-red-500">*</span></label>
                    <input type="date" name="deliveryDate" required value={formData.deliveryDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center text-xs">2</div>
                  Package Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Weight (KG) <span className="text-red-500">*</span></label>
                    <input type="number" step="0.1" min="0.1" name="weight" required value={formData.weight} onChange={handleInputChange} placeholder="e.g. 5.5" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category <span className="text-red-500">*</span></label>
                    <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition">
                      <option value="">Select Category</option>
                      <option value="Documents">Documents</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Food/Perishables">Food/Perishables</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description <span className="text-red-500">*</span></label>
                    <textarea name="description" required value={formData.description} onChange={handleInputChange} placeholder="Describe the item(s)..." rows={3} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition resize-none"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Package Photos ({files.length}/5) <span className="text-red-500">*</span></label>

                    <div className="flex flex-wrap gap-3 mb-3">
                      {files.map((file, index) => (
                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeFile(index)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      {files.length < 5 && (
                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-teal-500 hover:text-teal-500 transition cursor-pointer bg-white">
                          <Upload size={16} className="mb-1" />
                          <span className="text-[9px] font-bold uppercase">Add</span>
                          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                        </label>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">Min 1, Max 5 photos of the actual package/items.</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Receiver Information */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-teal-50 text-teal-600 flex items-center justify-center text-xs">3</div>
                  Receiver Information (Recipient at Destination)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Receiver Full Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="receiverName" 
                      required 
                      value={formData.receiverName} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Rahul Sharma" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Receiver Contact Phone <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="receiverPhone" 
                      required 
                      value={formData.receiverPhone} 
                      onChange={handleInputChange} 
                      placeholder="e.g. +91 9876543210" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Receiver Delivery Address / Landmark</label>
                    <input 
                      type="text" 
                      name="receiverAddress" 
                      value={formData.receiverAddress} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Flat 402, Shivalik Heights, Surat" 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-flyora-teal hover:bg-[#0F766E] shadow-lg shadow-teal-500/20 transition">Create Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Find Traveler Modal ─── */}
      {selectedRequestToMatch && (() => {
        try {
          const reqFrom = String(selectedRequestToMatch?.from_location || '').toLowerCase().trim();
          const reqTo = String(selectedRequestToMatch?.to_location || '').toLowerCase().trim();
          const reqWeight = parseFloat(selectedRequestToMatch?.capacity_weight) || 1.0;

          const fuzzyMatch = (locA: any, locB: any): boolean => {
            if (!locA || !locB) return false;
            const a = String(locA).toLowerCase().replace(/[().,]/g, ' ').trim();
            const b = String(locB).toLowerCase().replace(/[().,]/g, ' ').trim();
            if (!a || !b) return false;
            if (a === b || a.includes(b) || b.includes(a)) return true;
            const tokensA = a.split(/\s+/).filter((w: string) => w.length >= 3);
            const tokensB = b.split(/\s+/).filter((w: string) => w.length >= 3);
            return tokensA.some((ta: string) => tokensB.some((tb: string) => ta === tb || ta.includes(tb) || tb.includes(ta)));
          };

          const currentUserId = currentUser?.id ? String(currentUser.id) : (localStorage.getItem('flyora_user_id') || '');
          const currentUserEmail = (currentUser?.email || localStorage.getItem('flyora_user_email') || '').toLowerCase().trim();

          const otherUsersTrips = (Array.isArray(allAvailableTrips) ? allAvailableTrips : []).filter((t: any) => {
            if (!t) return false;
            if (t.airline === 'SENDER_REQUEST') return false;
            
            // Exclude trips belonging to current user
            const tripUserId = t.user ? (typeof t.user === 'object' ? String(t.user.id || '') : String(t.user)) : '';
            if (currentUserId && tripUserId && currentUserId === tripUserId) return false;
            
            const travelerEmail = (t.traveler_email || (typeof t.user === 'object' ? t.user.email : '') || '').toLowerCase().trim();
            if (currentUserEmail && travelerEmail && currentUserEmail === travelerEmail) return false;
            
            return true;
          });

          const fullRouteTrips = otherUsersTrips.filter((t: any) => {
            const fromMatch = fuzzyMatch(t?.from_location || '', reqFrom) || fuzzyMatch(t?.from_airport || '', reqFrom);
            const toMatch = fuzzyMatch(t?.to_location || '', reqTo) || fuzzyMatch(t?.to_airport || '', reqTo);
            return fromMatch && toMatch;
          });

          const perfectMatches = fullRouteTrips.filter((t: any) => (parseFloat(t?.available_weight) || 0) >= reqWeight);

          const fromLabel = String(selectedRequestToMatch?.from_location || 'Origin');
          const toLabel = String(selectedRequestToMatch?.to_location || 'Destination');

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedRequestToMatch(null); }}>
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Available Matching Travelers ({perfectMatches.length})</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Matching route: {fromLabel} to {toLabel}</p>
                  </div>
                  <button onClick={() => setSelectedRequestToMatch(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
                  {perfectMatches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-3">
                        <Search size={28} />
                      </div>
                      <h4 className="text-slate-800 font-bold text-base mb-1">No Matching Travelers Found</h4>
                      <p className="text-slate-500 text-xs max-w-md leading-relaxed">
                        No travelers from other users are currently flying on route <span className="font-bold text-slate-800">{fromLabel} → {toLabel}</span> with at least <span className="font-bold text-emerald-600">{reqWeight} KG</span> available baggage space.
                      </p>
                      <p className="text-slate-400 text-[11px] mt-3 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        ✨ Note: Only travelers with matching route AND sufficient available space (≥ {reqWeight} KG) are shown.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between mb-3">
                          <span>✅ Matching Route & Available Space Travelers</span>
                          <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">{perfectMatches.length} Match{perfectMatches.length > 1 ? 'es' : ''}</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {perfectMatches.map((t: any) => {
                            const avail = parseFloat(t?.available_weight) || 0;
                            const name = t?.traveler_name || 
                              (t?.user && typeof t.user === 'object' && t.user.first_name ? `${t.user.first_name} ${t.user.last_name || ''}`.trim() : null) || 
                              (typeof t?.user === 'string' ? t.user : null) ||
                              (t?.traveler_email ? t.traveler_email.split('@')[0] : null) || 
                              'Verified Traveler';
                            
                            const isAlreadyRequested = Array.isArray(bookings) && bookings.some((b: any) =>
                              b &&
                              (Number(b.trip?.id || b.trip_id || b.trip) === Number(t.id)) &&
                              (Number(b.sender_trip?.id || b.sender_trip_id || b.sender_trip) === Number(selectedRequestToMatch?.id)) &&
                              b.status !== 'CANCELLED' && b.status !== 'REJECTED'
                            );

                            const initialLetter = (name && typeof name === 'string' && name.trim().length > 0) ? name.trim().charAt(0).toUpperCase() : 'T';

                            return (
                              <div key={t.id || Math.random()} className="bg-white border border-emerald-200 hover:border-teal-400 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">
                                        {initialLetter}
                                      </div>
                                      <span className="text-xs font-bold text-slate-800">{name}</span>
                                      <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0" />
                                      <span className="text-xs text-slate-500">{String(t.departure_date || '')}</span>
                                    </div>
                                    <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5 min-w-0">
                                      <span className="truncate max-w-[130px]" title={String(t.from_location || '')}>{String(t.from_location || '')}</span>
                                      <Plane size={12} className="text-teal-500 rotate-90 shrink-0" />
                                      <span className="truncate max-w-[130px]" title={String(t.to_location || '')}>{String(t.to_location || '')}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                                      <span>Space: <strong className="text-emerald-700">{avail} KG Available</strong></span>
                                      <span>•</span>
                                      <span>Airline: <strong className="text-slate-700">{t.airline && t.airline !== 'TRAVELER_TRIP' ? String(t.airline) : 'Commercial'}</strong></span>
                                    </div>
                                  </div>

                                  {isAlreadyRequested ? (
                                    <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs">
                                      <CheckCircle2 size={14} className="text-emerald-600" /> Request Sent
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={isSendingRequest}
                                      onClick={() => handleSendRequestToTraveler(t)}
                                      className="px-4 py-2.5 bg-flyora-teal hover:bg-[#0F766E] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Send size={13} /> {isSendingRequest ? 'Sending...' : 'Send Request'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        } catch (modalErr) {
          console.error("Error rendering Find Traveler Modal:", modalErr);
          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-2xl max-w-md w-full text-center shadow-2xl">
                <p className="text-sm font-bold text-slate-800">Unable to load travelers</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">An error occurred while displaying matching travelers.</p>
                <button
                  type="button"
                  onClick={() => setSelectedRequestToMatch(null)}
                  className="px-4 py-2 bg-flyora-teal text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          );
        }
      })()}

      {/* ─── Secure Escrow Payment Modal ─── */}
      {selectedBookingToPay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedBookingToPay(null) }}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={18} className="text-flyora-teal" /> Secure Escrow Payment
              </h3>
              <button onClick={() => setSelectedBookingToPay(null)} className="text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
            </div>

            <div className="p-6">
              {(() => {
                const travelerReward = Number(selectedBookingToPay.reward) || (Number(selectedBookingToPay.weight) * (Number(selectedBookingToPay.trip_price_per_kg) || 10.0)) || 0;
                return (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                      <span>Traveler Reward:</span>
                      <span className="text-slate-800 font-black">₹{travelerReward.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                      <span>Platform Service Fee:</span>
                      <span className="text-slate-800 font-black">₹{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center text-sm font-black text-slate-800">
                      <span>Total Escrow Amount:</span>
                      <span className="text-flyora-teal text-base font-black">
                        ₹{(travelerReward + platformFee).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Card Number</label>
                  <input type="text" placeholder="**** **** **** 1234" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">CVV</label>
                    <input type="text" placeholder="***" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-xs text-blue-800 flex items-start gap-2 leading-relaxed font-medium">
                  <Shield className="shrink-0 mt-0.5 text-blue-600" size={16} />
                  Don't worry, your payment is secured in our escrow system. It will remain on hold until the delivery is confirmed.
                </p>
              </div>

              <button
                onClick={() => handleDepositEscrow(selectedBookingToPay.id)}
                className="w-full py-3.5 bg-flyora-teal hover:bg-[#0F766E] text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
              >
                Confirm Payment <Plane size={16} className="rotate-45" />
              </button>
            </div>
          </div>
        </div>
      )}

      <KycValidationModal isOpen={isKycModalOpen} onClose={closeKycModal} kycStatus={kycStatus} />
    </div>
  );
};

export default SenderPage;
