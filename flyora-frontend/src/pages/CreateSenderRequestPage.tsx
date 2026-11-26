import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, Scale, FileText, User, Phone, Home } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Sidebar } from '../components/Sidebar';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { LocationAutocomplete } from '../components/ui/LocationAutocomplete';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import { trackEvent } from '../utils/analytics';
import '../pages/dashboard.css';

const CreateSenderRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { validateAction, isModalOpen, closeModal, kycStatus } = useKycValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    weight: '',
    category: 'Electronics',
    description: '',
    deliveryDate: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAction()) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem('flyora_user_id');
      if (!userId) throw new Error("User session expired. Please log in again.");

      const weightNum = parseFloat(formData.weight) || 1;
      const rateEst = Math.max(10, Math.round(weightNum * 12));

      const payload = {
        traveler: userId,
        from_location: formData.pickup,
        to_location: formData.dropoff,
        from_airport: formData.pickup,
        to_airport: formData.dropoff,
        departure_date: formData.deliveryDate,
        departure_time: '12:00:00',
        arrival_date: formData.deliveryDate,
        arrival_time: '18:00:00',
        flight_number: `REQ-${Date.now().toString().slice(-4)}`,
        airline: 'SENDER_REQUEST',
        capacity_weight: weightNum,
        available_weight: weightNum,
        price_per_kg: rateEst,
        status: 'Active',
        notes: `[Sender Request: ${formData.category}] ${formData.description || ''} | To: ${formData.receiverName || 'Recipient'} (${formData.receiverPhone || 'N/A'}) - ${formData.receiverAddress || 'N/A'}`
      };

      const res = await apiFetch('/api/trips/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.data || res.status === 'success') {
        trackEvent('package_listed', { weight_kg: weightNum, category: formData.category });
        navigate('/sender');
      } else {
        throw new Error(res.message || "Failed to create sender request");
      }
    } catch (error: any) {
      console.error("Sender request creation failed:", error);
      setErrorMsg(error.message || "Failed to post request. Please check required fields.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      <Sidebar activeItem="Sender" />

      <main className="flex-1 min-w-0 w-full lg:ml-[240px] flex flex-col min-h-screen relative pb-20 lg:pb-12">
        {/* Subtle Ambient Flyora Teal Background Wave */}
        <div className="absolute top-0 right-0 w-full h-[400px] overflow-hidden pointer-events-none -z-0">
          <svg className="w-full h-full" viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none">
            <path
              d="M620 0 C860 120, 1120 40, 1440 120 L1440 0 Z"
              fill="#F0FDFA"
              fillOpacity="0.7"
            />
            <path
              d="M450 0 C680 160, 1020 180, 1440 60 L1440 0 Z"
              fill="#CCFBF1"
              fillOpacity="0.35"
            />
          </svg>
        </div>

        {/* Top Header - Aligned with Dashboard Layout */}
        <header className="flex h-20 items-center justify-between px-4 sm:px-8 xl:px-10 shrink-0 relative z-30">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all text-slate-600 shadow-sm shrink-0"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">Create Sender Request</h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block">Post a parcel delivery request to find matching verified travelers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        {/* Content Body - EXACT SAME WIDTH & PADDING AS DASHBOARD (px-4 sm:px-8 xl:px-10) */}
        <div className="px-4 sm:px-8 xl:px-10 space-y-6 relative z-20 pt-2">

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Route */}
            <section className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-[0_4px_25px_rgba(10,22,40,0.02)] transition-all">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-flyora-teal border border-teal-100/80">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Route Details (All India Search)</h2>
                  <p className="text-xs text-slate-400 font-medium">Specify pickup and destination locations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Pickup Location <span className="text-rose-500">*</span>
                  </label>
                  <LocationAutocomplete
                    name="pickup"
                    value={formData.pickup}
                    onChange={(val) => setFormData(p => ({ ...p, pickup: val }))}
                    placeholder="Type city or airport (e.g. Mumbai, Surat, AMD)..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Drop-off Location <span className="text-rose-500">*</span>
                  </label>
                  <LocationAutocomplete
                    name="dropoff"
                    value={formData.dropoff}
                    onChange={(val) => setFormData(p => ({ ...p, dropoff: val }))}
                    placeholder="Type city or airport (e.g. Delhi, Bangalore, BLR)..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Calendar size={14} className="text-flyora-teal" /> Delivery By Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    required
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Package */}
            <section className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-[0_4px_25px_rgba(10,22,40,0.02)] transition-all">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-flyora-teal border border-teal-100/80">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Package Details</h2>
                  <p className="text-xs text-slate-400 font-medium">Provide accurate dimensions, weight and contents description</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Scale size={14} className="text-flyora-teal" /> Weight (KG) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    required
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                    min="0.1"
                    step="0.1"
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Category <span className="text-rose-500">*</span></label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all cursor-pointer"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Documents">Documents</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food & Sweets">Food & Sweets</option>
                    <option value="Medicines">Medicines</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-1 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <FileText size={14} className="text-flyora-teal" /> Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of package..."
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Receiver Information */}
            <section className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-[0_4px_25px_rgba(10,22,40,0.02)] transition-all">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-flyora-teal border border-teal-100/80">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Receiver Information</h2>
                  <p className="text-xs text-slate-400 font-medium">Who will receive this parcel at the destination</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Receiver Name</label>
                  <input
                    type="text"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Receiver Phone</label>
                  <input
                    type="text"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Delivery Address</label>
                  <input
                    type="text"
                    name="receiverAddress"
                    value={formData.receiverAddress}
                    onChange={handleInputChange}
                    placeholder="e.g. Apartment, Street, Landmark"
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="flex justify-end items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-flyora-teal hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Posting Request...' : 'Post Request'}
              </button>
            </div>
          </form>

        </div>
      </main>

      <KycValidationModal isOpen={isModalOpen} onClose={closeModal} kycStatus={kycStatus} />
    </div>
  );
};

export default CreateSenderRequestPage;
