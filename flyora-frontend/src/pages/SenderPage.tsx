import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Plus, Filter, Bell, ChevronDown, Upload, X, Edit2, Trash2, Plane, Shield, CreditCard, CalendarDays, Eye, Wallet, ArrowRight } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { LocationAutocomplete } from '../components/ui/LocationAutocomplete';
import { useSocket } from '../context/SocketContext';
import '../pages/dashboard.css';

const SenderPage: React.FC = () => {
  const navigate = useNavigate();
  const { validateAction, isModalOpen: isKycModalOpen, closeModal: closeKycModal, kycStatus } = useKycValidation();
  const userName = localStorage.getItem('flyora_user_name') || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestToMatch, setSelectedRequestToMatch] = useState<any | null>(null);
  const [filterText, setFilterText] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [allAvailableTrips, setAllAvailableTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBookingToPay, setSelectedBookingToPay] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id?: any; email?: string } | null>(null);
  const [platformFee, setPlatformFee] = useState<number>(10.00);

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
    fetchTravelers(); // Re-fetch to ensure fresh data
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
        aircraft: formData.category, // store category here
        from_location: formData.pickup,
        to_location: formData.dropoff,
        from_airport: formData.description.slice(0, 150), // description here (max 150)
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
      
      // Also create corresponding booking record with full receiver info
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
      alert("Request created successfully!");
      setIsModalOpen(false);
      setFormData({ pickup: '', dropoff: '', deliveryDate: '', weight: '', category: '', description: '', receiverName: '', receiverPhone: '', receiverAddress: '' });
      setFiles([]);
    } catch (err: any) {
      alert("Failed to create request: " + err.message);
    }
  };

  const handleDeleteRequest = async (id: number) => {
    try {
      await apiFetch(`/api/trips/${id}`, { method: 'DELETE' });
      setRequests(requests.filter(r => r.id !== id));
    } catch (err: any) {
      alert("Failed to delete request: " + err.message);
    }
  };

  const handleSendRequestToTraveler = async (travelerTrip: any) => {
    if (!selectedRequestToMatch) return;
    try {
      // Fix for float precision issues or slight mismatches: cap the requested weight to whatever the traveler has available
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
        weight: safeWeight > 0 ? safeWeight : 0.1, // Ensure it's at least > 0 if there's any anomaly
        reward: Number((safeWeight * (parseFloat(travelerTrip.price_per_kg) || 10.0)).toFixed(2)),
        receiver_name: recName || 'Receiver',
        receiver_phone: recPhone || '',
        receiver_address: recAddr || ''
      };
      await apiFetch('/api/bookings/', { method: 'POST', body: JSON.stringify(payload) });

      fetchData();

      alert(`Request sent to traveler!`);
      setSelectedRequestToMatch(null);
    } catch (err: any) {
      alert("Failed to send request: " + err.message);
    }
  };

  const handleDepositEscrow = async (bookingId: number) => {
    try {
      await apiFetch(`/api/bookings/${bookingId}/action`, { method: 'POST', body: JSON.stringify({ action: 'PAY' }) });
      alert("Payment successful! Funds are now securely held in escrow.");
      setSelectedBookingToPay(null);
      fetchData();
    } catch (err: any) {
      alert("Payment failed: " + err.message);
    }
  };

  const acceptedBookings = bookings.filter((b: any) => b.status === 'ACCEPTED' && (b.paymentStatus === 'Pending' || b.paymentStatus === 'Unpaid' || !b.paymentStatus));

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Sender" />

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
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-flyora-teal to-teal-500">Package</span>
              </h1>
              <p className="text-sm font-bold text-slate-500 max-w-md leading-relaxed">
                Send packages globally with our verified traveler network. Fast, safe, and reliable.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="relative w-full sm:w-[320px]">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by parcel name..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-700 outline-none focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => validateAction(() => navigate('/sender/new'))}
                className="w-full sm:w-auto bg-gradient-to-r from-flyora-teal to-teal-600 text-white px-6 py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus size={18} strokeWidth={3} />
                Create Request
              </button>
            </div>
          </div>

          {/* Premium MNC-style Dashboard Card for Sender */}
          <div className="relative rounded-[32px] p-8 md:p-10 mb-10 overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0D1C33] to-[#0A1628] shadow-[0_20px_60px_rgba(10,22,40,0.15)] border border-slate-800">
            {/* Abstract Decorative Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-flyora-teal/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
            
            {/* Glossy Overlay Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
              
              {/* Main Info Section */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                    <Package size={12} className="text-teal-400" />
                  </div>
                  <span className="text-[11px] font-black tracking-[0.2em] text-teal-100 uppercase">Sender Profile</span>
                </div>
                <div className="text-4xl md:text-5xl font-black text-white tracking-tight flex flex-col gap-1">
                  SEND A PACKAGE
                  <span className="text-lg md:text-xl font-medium text-slate-400 tracking-normal">Find trusted travelers worldwide</span>
                </div>
              </div>

              {/* Stats Section */}
              <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-4 lg:pb-0">
                <div className="flex-1 lg:flex-none flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors min-w-[100px]">
                  <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Total</div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-white">{requests.length.toString().padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="flex-1 lg:flex-none flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors min-w-[100px]">
                  <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">In Transit</div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-emerald-400">00</span>
                  </div>
                </div>

                <div className="flex-1 lg:flex-none flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors min-w-[100px]">
                  <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Delivered</div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-blue-400">00</span>
                  </div>
                </div>

                <div className="flex-1 lg:flex-none flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors min-w-[100px]">
                  <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">Pending</div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-amber-400">{(requests.filter(r => r.status === 'Active').length).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-800">Package Requests</h2>
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
                <option value="Active">Pending</option>
                <option value="Completed">Requested</option>
              </select>
            </div>
          </div>

          {requests.filter(r => filterText === '' || r.status === filterText).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[24px] p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                <Package size={32} />
              </div>
              <h3 className="text-slate-700 font-bold mb-1">No requests found</h3>
              <p className="text-slate-500 text-sm max-w-sm">Create a new request by clicking the Create Request button or search for other terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests
                .filter(r => filterText === '' || r.status === filterText)
                .map(req => {
                  const linkedBk = bookings.find(b => 
                    (b.sender_trip && String(b.sender_trip) === String(req.id)) ||
                    (b.trip && String(b.trip) === String(req.id)) || 
                    (b.trip_details && String(b.trip_details.id) === String(req.id))
                  );

                  const cardStatus = linkedBk ? (
                    linkedBk.status === 'PAYMENT_RELEASED' || linkedBk.status === 'DELIVERED' || linkedBk.status === 'DISPUTED' || linkedBk.status === 'DISPUTE_RESOLVED' || linkedBk.status === 'DISPUTE_REJECTED' ? 'Completed' :
                    linkedBk.status === 'IN_TRANSIT' ? 'In Transit' :
                    linkedBk.status === 'OUT_FOR_DELIVERY' || linkedBk.status === 'ARRIVED' ? 'Out For Delivery' :
                    linkedBk.status === 'PARCEL_VERIFIED' || linkedBk.status === 'PARCEL_VERIFIED' ? 'Parcel Verified' :
                    linkedBk.payment_status === 'Escrow Hold' || linkedBk.payment_status === 'PAID' || linkedBk.status === 'PAID' || linkedBk.status === 'PAID' ? 'Paid' :
                    linkedBk.status === 'ACCEPTED' ? 'Accepted' : linkedBk.status
                  ) : (req.status === 'Active' ? 'Active' : 'Requested');

                  const getStatusStyle = (status: string) => {
                    const s = (status || '').toUpperCase();
                    if (s.includes('COMPLETED') || s.includes('PAID') || s.includes('DELIVERED')) return 'bg-blue-50 text-blue-600 border-blue-200';
                    if (s.includes('ACCEPTED') || s.includes('IN_TRANSIT') || s.includes('PARCEL_VERIFIED')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
                    if (s.includes('PENDING') || s.includes('REQUESTED') || s.includes('ACTIVE')) return 'bg-amber-50 text-amber-600 border-amber-200';
                    if (s.includes('CANCELLED') || s.includes('REJECTED')) return 'bg-rose-50 text-rose-600 border-rose-200';
                    return 'bg-slate-50 text-slate-600 border-slate-200';
                  };

                  const getGradientStyle = (status: string) => {
                    const s = (status || '').toUpperCase();
                    if (s.includes('COMPLETED') || s.includes('PAID') || s.includes('DELIVERED')) return 'from-blue-400 to-blue-500';
                    if (s.includes('ACCEPTED') || s.includes('IN_TRANSIT') || s.includes('PARCEL_VERIFIED')) return 'from-emerald-400 to-emerald-500';
                    if (s.includes('PENDING') || s.includes('REQUESTED') || s.includes('ACTIVE')) return 'from-amber-400 to-amber-500';
                    if (s.includes('CANCELLED') || s.includes('REJECTED')) return 'from-rose-400 to-rose-500';
                    return 'from-slate-300 to-slate-400';
                  };

                  return (
                    <div key={req.id} className="group bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(13,148,136,0.08)] transition-all duration-300 relative overflow-hidden flex flex-col">
                      {/* Decorative top border gradient based on status */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${getGradientStyle(cardStatus)}`}></div>

                      <div className="p-6 flex-1 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                              <Package size={14} className="text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Parcel #{req.id}</span>
                              <span className="text-xs font-black text-slate-700 tracking-tight">{req.aircraft || 'Package'}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${getStatusStyle(cardStatus)}`}>
                            {cardStatus.replace(/[^A-Za-z ]/g, '').trim()}
                          </span>
                        </div>

                        {/* Route Map Design */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex-1">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup</div>
                            <div className="text-sm font-bold text-slate-800 line-clamp-1" title={req.from_location}>{req.from_location}</div>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center px-2">
                            <div className="w-full flex items-center">
                              <div className="h-[2px] w-full border-t-2 border-dashed border-slate-200"></div>
                              <ArrowRight size={14} className="text-slate-300 mx-1 shrink-0" />
                              <div className="h-[2px] w-full border-t-2 border-dashed border-slate-200"></div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                              <CalendarDays size={10} /> {req.departure_date}
                            </div>
                          </div>

                          <div className="flex-1 text-right">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dropoff</div>
                            <div className="text-sm font-bold text-slate-800 line-clamp-1" title={req.to_location}>{req.to_location}</div>
                          </div>
                        </div>

                        {/* Info Chips */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold">
                            <Package size={14} className="text-flyora-teal" /> {req.capacity_weight} kg
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold">
                            <span className="w-3 h-3 border-2 border-flyora-teal rounded-sm"></span> 7x4x55 cm
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-5 gap-2 mt-auto">
                          <button
                            onClick={() => navigate(`/booking/${req.id}`)}
                            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-2 border border-slate-200/60"
                            title="View Full Package Request Details"
                          >
                            <Eye size={14} /> Details
                          </button>
                          
                          {(!linkedBk || (linkedBk.status !== 'ACCEPTED' && linkedBk.status !== 'PAID' && linkedBk.status !== 'IN_TRANSIT' && linkedBk.status !== 'PAYMENT_RELEASED' && linkedBk.status !== 'DELIVERED' && linkedBk.status !== 'OUT_FOR_DELIVERY')) && (
                            <button
                              onClick={() => handleOpenFindTraveler(req)}
                              className="flex-1 bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-black uppercase tracking-wider py-2.5 rounded-xl shadow-lg shadow-slate-900/20 transition flex items-center justify-center gap-2"
                            >
                              <Search size={14} /> Find Traveler
                            </button>
                          )}
                          
                          {linkedBk && linkedBk.status === 'ACCEPTED' && (
                            <button
                              onClick={() => {
                                if (linkedBk) {
                                    setSelectedBookingToPay(linkedBk);
                                } else {
                                    navigate(`/booking/${req.id}`);
                                }
                              }}
                              className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 text-[10px] font-black uppercase tracking-wider py-2 rounded-xl shadow-sm shadow-emerald-500/20 transition flex items-center justify-center gap-1"
                            >
                          <Wallet size={14} /> Pay Now
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Cancel Request"
                      >
                        <X size={15} />
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

      {/* Create Request Modal */}
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
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-flyora-teal hover:bg-teal-600 shadow-lg shadow-teal-500/20 transition">Create Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Find Traveler Modal */}
      {selectedRequestToMatch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedRequestToMatch(null) }}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Available Travelers ({allAvailableTrips.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">Matching route: {selectedRequestToMatch.from_location} to {selectedRequestToMatch.to_location}</p>
              </div>
              <button onClick={() => setSelectedRequestToMatch(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {(() => {
                const reqFrom = (selectedRequestToMatch.from_location || '').toLowerCase().trim();
                const reqTo = (selectedRequestToMatch.to_location || '').toLowerCase().trim();
                const reqWeight = parseFloat(selectedRequestToMatch.capacity_weight) || 1.0;

                // Fuzzy location match - token-level word overlap
                const fuzzyMatch = (locA: string, locB: string): boolean => {
                  const a = locA.toLowerCase().replace(/[().,]/g, ' ').trim();
                  const b = locB.toLowerCase().replace(/[().,]/g, ' ').trim();
                  if (a === b || a.includes(b) || b.includes(a)) return true;
                  const tokensA = a.split(/\s+/).filter((w: string) => w.length >= 3);
                  const tokensB = b.split(/\s+/).filter((w: string) => w.length >= 3);
                  return tokensA.some((ta: string) => tokensB.some((tb: string) => ta === tb || ta.includes(tb) || tb.includes(ta)));
                };

                // 1. Exclude Current User's Own Traveler Trips
                const otherUsersTrips = allAvailableTrips.filter((t: any) => {
                  if (t.airline === 'SENDER_REQUEST') return false;
                  if (currentUser?.id && (String(t.user) === String(currentUser.id) || String(t.user?.id) === String(currentUser.id))) return false;
                  if (currentUser?.email && t.traveler_email && t.traveler_email.toLowerCase() === currentUser.email.toLowerCase()) return false;
                  return true;
                });

                // 2. Full route match (fuzzy)
                const fullRouteTrips = otherUsersTrips.filter((t: any) => {
                  const fromMatch = fuzzyMatch(t.from_location || '', reqFrom) || fuzzyMatch(t.from_airport || '', reqFrom);
                  const toMatch = fuzzyMatch(t.to_location || '', reqTo) || fuzzyMatch(t.to_airport || '', reqTo);
                  return fromMatch && toMatch;
                });

                // 3. Strict: Only show travelers where BOTH Route and Available Weight match
                const perfectMatches = fullRouteTrips.filter((t: any) => parseFloat(t.available_weight) >= reqWeight);

                if (perfectMatches.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-3">
                        <Search size={28} />
                      </div>
                      <h4 className="text-slate-800 font-bold text-base mb-1">No Matching Travelers Found</h4>
                      <p className="text-slate-500 text-xs max-w-md leading-relaxed">
                        No travelers from other users are currently flying on route <span className="font-bold text-slate-800">{selectedRequestToMatch.from_location} → {selectedRequestToMatch.to_location}</span> with at least <span className="font-bold text-emerald-600">{reqWeight} KG</span> available baggage space.
                      </p>
                      <p className="text-slate-400 text-[11px] mt-3 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        ✨ Note: Only travelers with matching route AND sufficient available space (≥ {reqWeight} KG) are shown.
                      </p>
                    </div>
                  );
                }

                const TCard = ({ t }: { t: any }) => {
                  const avail = parseFloat(t.available_weight) || 0;
                  const name = t.traveler_name || (t.user?.first_name ? `${t.user.first_name} ${t.user.last_name || ''}`.trim() : null) || t.traveler_email?.split('@')[0] || 'Verified Traveler';
                  return (
                    <div className="bg-white border border-emerald-200 hover:border-teal-400 rounded-xl p-4 shadow-xs hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">{name.charAt(0).toUpperCase()}</div>
                            <span className="text-xs font-bold text-slate-800">{name}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0" />
                            <span className="text-xs text-slate-500">{t.departure_date}</span>
                          </div>
                          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-1.5 min-w-0">
                            <span className="truncate max-w-[130px]" title={t.from_location}>{t.from_location}</span>
                            <Plane size={12} className="text-teal-500 rotate-90 shrink-0" />
                            <span className="truncate max-w-[130px]" title={t.to_location}>{t.to_location}</span>
                          </div>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                            <span>Space: <strong className="text-emerald-700">{avail} KG Available</strong></span>
                            <span>•</span>
                            <span>Airline: <strong className="text-slate-700">{t.airline && t.airline !== 'TRAVELER_TRIP' ? t.airline : 'Commercial'}</strong></span>
                          </div>
                        </div>
                        <button onClick={() => handleSendRequestToTraveler(t)} className="px-4 py-2.5 bg-flyora-teal hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap shrink-0">
                          Send Request
                        </button>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between mb-3">
                        <span>✅ Matching Route & Available Space Travelers</span>
                        <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">{perfectMatches.length} Match{perfectMatches.length > 1 ? 'es' : ''}</span>
                      </div>
                      <div className="flex flex-col gap-3">{perfectMatches.map((t: any) => <TCard key={t.id} t={t} />)}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedBookingToPay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedBookingToPay(null) }}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={18} className="text-flyora-teal" /> Secure Payment
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
                className="w-full py-3.5 bg-flyora-teal hover:bg-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2"
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
