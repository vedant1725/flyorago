import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Plus, Filter, Bell, ChevronDown, Upload, X, Edit2, Trash2, Plane, Shield, CreditCard, CalendarDays, Eye, Wallet } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
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
      // Get Sender's own requests (stored as Trips with airline SENDER_REQUEST)
      const tripsRes = await apiFetch('/api/trips/?user_only=true');
      const tripsData = tripsRes.data || tripsRes.results || (Array.isArray(tripsRes) ? tripsRes : []);
      const senderReqs = tripsData.filter((t: any) => t.airline === 'SENDER_REQUEST');
      setRequests(senderReqs);

      if (senderReqs.length > 0 && senderReqs[0].traveler_email) {
        setCurrentUser(prev => ({
          ...prev,
          email: senderReqs[0].traveler_email,
          id: senderReqs[0].user || prev?.id
        }));
      }

      // Get Sender's bookings to check for accepted requests
      const bookingsRes = await apiFetch('/api/bookings/?user_only=true');
      const bookingsData = bookingsRes.data || bookingsRes.results || (Array.isArray(bookingsRes) ? bookingsRes : []);
      setBookings(bookingsData);
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
    description: ''
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
        terminal_from: "N/A",
        terminal_to: "N/A",
        seats: "1",
        capacity_weight: parseFloat(formData.weight) || 1.0,
        accepted_parcel_types: validImages,
      };

      const res = await apiFetch('/api/trips/', { method: 'POST', body: JSON.stringify(payload) });
      setRequests([res.data, ...requests]);
      alert("Request created successfully!");
      setIsModalOpen(false);
      setFormData({ pickup: '', dropoff: '', deliveryDate: '', weight: '', category: '', description: '' });
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

      const payload = {
        trip: travelerTrip.id,
        sender_trip: selectedRequestToMatch.id,
        package_name: selectedRequestToMatch.aircraft || selectedRequestToMatch.package_name || 'Parcel',
        package_category: selectedRequestToMatch.aircraft || 'General',
        package_image: JSON.stringify(selectedRequestToMatch.accepted_parcel_types || []),
        weight: safeWeight > 0 ? safeWeight : 0.1, // Ensure it's at least > 0 if there's any anomaly
        reward: 0
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
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Sender" />

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
            <h1 className="text-2xl font-extrabold text-flyora-teal tracking-tight mb-1">My <span className="text-slate-800">Package</span></h1>
            <p className="text-sm text-slate-500 font-medium">Your global network of verified travelers fast, safe, reliable</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="relative w-full md:w-[400px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by parcel name...."
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
              <div className="text-[10px] font-black tracking-widest text-white/70 mb-1 uppercase">SENDER</div>
              <div className="text-3xl md:text-4xl font-black tracking-tight mb-2">SEND A PACKAGE</div>
              <div className="text-sm font-medium text-white/90">Find trusted traveler worldwide</div>
            </div>

            <div className="relative z-10 flex items-center gap-8 md:gap-12 bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
              <div className="text-center">
                <div className="text-[10px] font-black tracking-widest text-white/70 mb-1 uppercase">Total</div>
                <div className="text-3xl font-black">{requests.length.toString().padStart(2, '0')}</div>
              </div>
              <div className="text-center hidden sm:block">
                <div className="text-[10px] font-black tracking-widest text-white/70 mb-1 uppercase">In Transit</div>
                <div className="text-3xl font-black">00</div>
              </div>
              <div className="text-center hidden sm:block">
                <div className="text-[10px] font-black tracking-widest text-white/70 mb-1 uppercase">Delivered</div>
                <div className="text-3xl font-black">00</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black tracking-widest text-white/70 mb-1 uppercase">Pending</div>
                <div className="text-3xl font-black">{(requests.filter(r => r.status === 'Active').length).toString().padStart(2, '0')}</div>
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
                    linkedBk.status === 'PAYMENT_RELEASED' || linkedBk.status === 'DELIVERED' || linkedBk.status === 'DISPUTED' || linkedBk.status === 'DISPUTE_RESOLVED' || linkedBk.status === 'DISPUTE_REJECTED' ? 'Completed ✅' :
                    linkedBk.status === 'IN_TRANSIT' ? 'In Transit ✈️' :
                    linkedBk.status === 'OUT_FOR_DELIVERY' || linkedBk.status === 'ARRIVED' ? 'Out For Delivery 🚚' :
                    linkedBk.status === 'PARCEL_VERIFIED' || linkedBk.status === 'PARCEL_VERIFIED' ? 'Parcel Verified 📷' :
                    linkedBk.payment_status === 'Escrow Hold' || linkedBk.payment_status === 'PAID' || linkedBk.status === 'PAID' || linkedBk.status === 'PAID' ? 'Paid ✅' :
                    linkedBk.status === 'ACCEPTED' ? 'Accepted ✅' : linkedBk.status
                  ) : (req.status === 'Active' ? 'Active' : 'Requested');

                  return (
                    <div key={req.id} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <CalendarDays size={14} className="text-flyora-teal" />
                          {req.departure_date}
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-6 h-6 bg-slate-50 rounded flex items-center justify-center text-slate-400 hover:text-flyora-teal transition">
                            <Edit2 size={12} />
                          </button>
                          <span className={`text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                            cardStatus.includes('PAYMENT_RELEASED') ? 'bg-emerald-600' :
                            cardStatus.includes('PAID') ? 'bg-emerald-500' :
                            cardStatus.includes('IN_TRANSIT') ? 'bg-teal-600' :
                            cardStatus.includes('OUT_FOR_DELIVERY') ? 'bg-indigo-600' :
                            cardStatus.includes('ACCEPTED') ? 'bg-teal-500' : 'bg-amber-500'
                          }`}>
                            {cardStatus}
                          </span>
                        </div>
                      </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {req.aircraft?.substring(0, 2).toUpperCase() || 'PK'}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">Parcel Id - #{req.id}</div>
                        <div className="text-sm font-bold text-flyora-teal">{req.aircraft || 'Package'}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 relative mb-6">
                      <div className="absolute left-[5px] top-2 bottom-2 w-px border-l-2 border-dashed border-slate-200"></div>

                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-white mt-0.5 z-10"></div>
                        <div className="w-full">
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">From</div>
                          <div className="text-sm font-bold text-slate-800 flex justify-between items-center">{req.from_location} <ChevronDown size={14} className="text-slate-400" /></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 rounded-full bg-slate-300 mt-0.5 z-10"></div>
                        <div className="w-full">
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">To</div>
                          <div className="text-sm font-bold text-slate-800 flex justify-between items-center">{req.to_location} <ChevronDown size={14} className="text-slate-400" /></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-flyora-teal bg-white text-xs font-bold">
                        <Package size={14} /> {req.capacity_weight}kg
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-flyora-teal bg-white text-xs font-bold">
                        <span className="w-3 h-3 border border-current rounded-sm"></span> 7cm x 4cm x 55cm
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-5 gap-2">
                      <button
                        onClick={() => navigate(`/booking/${req.id}`)}
                        className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1"
                        title="View Full Package Request Details"
                      >
                        <Eye size={13} /> View Details
                      </button>
                      {(!linkedBk || (linkedBk.status !== 'ACCEPTED' && linkedBk.status !== 'PAID' && linkedBk.status !== 'IN_TRANSIT' && linkedBk.status !== 'PAYMENT_RELEASED' && linkedBk.status !== 'DELIVERED' && linkedBk.status !== 'OUT_FOR_DELIVERY')) && (
                        <button
                          onClick={() => handleOpenFindTraveler(req)}
                          className="flex-1 bg-flyora-teal text-white hover:bg-teal-600 text-[10px] font-black uppercase tracking-wider py-2 rounded-xl shadow-sm shadow-teal-500/20 transition flex items-center justify-center gap-1"
                        >
                          Find Traveler
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
                    <input type="text" name="pickup" required value={formData.pickup} onChange={handleInputChange} placeholder="e.g. Mumbai" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Drop-off Location <span className="text-red-500">*</span></label>
                    <input type="text" name="dropoff" required value={formData.dropoff} onChange={handleInputChange} placeholder="e.g. Dubai" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 transition" />
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

                // 1. Exclude Current User's Own Traveler Trips (Self-Match Exclusion)
                const otherUsersTrips = allAvailableTrips.filter((t: any) => {
                  if (t.airline === 'SENDER_REQUEST') return false;
                  if (currentUser?.id && String(t.user) === String(currentUser.id)) return false;
                  if (currentUser?.email && t.traveler_email && t.traveler_email.toLowerCase() === currentUser.email.toLowerCase()) return false;
                  if (selectedRequestToMatch.traveler_email && t.traveler_email && t.traveler_email.toLowerCase() === selectedRequestToMatch.traveler_email.toLowerCase()) return false;
                  return true;
                });

                // 2. Strict AI Route & Weight Capacity Matching
                const matchedTrips = otherUsersTrips.filter((t: any) => {
                  const tFrom = (t.from_location || '').toLowerCase().trim();
                  const tTo = (t.to_location || '').toLowerCase().trim();
                  const tFromAirport = (t.from_airport || '').toLowerCase().trim();
                  const tToAirport = (t.to_airport || '').toLowerCase().trim();
                  const availWeight = parseFloat(t.available_weight) || 0;

                  const fromMatch = tFrom.includes(reqFrom) || reqFrom.includes(tFrom) || (tFromAirport && tFromAirport.includes(reqFrom));
                  const toMatch = tTo.includes(reqTo) || reqTo.includes(tTo) || (tToAirport && tToAirport.includes(reqTo));
                  const weightMatch = availWeight >= reqWeight;

                  return fromMatch && toMatch && weightMatch;
                });

                if (matchedTrips.length === 0) {
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
                        ✨ Note: Your own traveler trips created on this account are automatically excluded.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-3">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between">
                      <span>AI Route & Weight Matched Travelers</span>
                      <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">{matchedTrips.length} Match{matchedTrips.length > 1 ? 'es' : ''}</span>
                    </div>
                    {matchedTrips.map((t: any) => (
                      <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-teal-400 transition">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-extrabold">TR</div>
                            <span className="text-xs font-bold text-slate-800">{t.traveler_name || t.traveler_email?.split('@')[0] || 'Verified Traveler'}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-xs text-slate-500">{t.departure_date}</span>
                          </div>
                          <div className="text-sm font-black text-slate-800 flex items-center gap-2 mt-1.5">
                            {t.from_location} <Plane size={14} className="text-teal-500 rotate-90" /> {t.to_location}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span>Baggage Space: <strong className="text-emerald-700 font-bold">{t.available_weight} KG Available</strong></span>
                            <span>•</span>
                            <span>Airline: <strong className="text-slate-700">{t.airline || 'Commercial'}</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendRequestToTraveler(t)}
                          className="px-4 py-2.5 bg-flyora-teal hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap flex items-center justify-center gap-1"
                        >
                          Send Request to Traveler
                        </button>
                      </div>
                    ))}
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
              <div className="text-center mb-6">
                <div className="text-4xl font-black text-slate-800 mb-1">$25.00</div>
                <div className="text-sm text-slate-500">Total amount to pay</div>
              </div>

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
