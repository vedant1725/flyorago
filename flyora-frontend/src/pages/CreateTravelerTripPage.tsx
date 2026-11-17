import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plane, MapPin, Calendar, PlaneTakeoff, PlaneLanding,
  Weight, DollarSign, Clock
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Sidebar } from '../components/Sidebar';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { LocationAutocomplete } from '../components/ui/LocationAutocomplete';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import '../pages/dashboard.css';

const CreateTravelerTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { validateAction, isModalOpen, closeModal, kycStatus } = useKycValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    departureCity: '',
    arrivalCity: '',
    travelDate: '',
    departureTime: '10:00',
    arrivalDate: '',
    arrivalTime: '12:30',
    travelMode: 'Flight',
    carrierName: '',
    availableWeight: '',
    pricePerKg: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      const weightNum = parseFloat(formData.availableWeight) || 20;
      const priceNum = parseFloat(formData.pricePerKg) || 15;
      const randomFlightNum = 'FL-' + Math.floor(100 + Math.random() * 900);

      let formattedDepDate = formData.travelDate || '';
      if (formattedDepDate.includes('/')) {
        const parts = formattedDepDate.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
          formattedDepDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
      let formattedArrDate = formData.arrivalDate || formData.travelDate || '';
      if (formattedArrDate.includes('/')) {
        const parts = formattedArrDate.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
          formattedArrDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }

      const payload = {
        traveler: userId,
        from_location: formData.departureCity,
        to_location: formData.arrivalCity,
        from_airport: formData.departureCity,
        to_airport: formData.arrivalCity,
        departure_date: formattedDepDate,
        departure_time: formData.departureTime || '10:00:00',
        arrival_date: formattedArrDate,
        arrival_time: formData.arrivalTime || '12:30:00',
        flight_number: formData.carrierName || randomFlightNum,
        airline: formData.travelMode ? `${formData.travelMode} Express` : 'Domestic Express',
        capacity_weight: weightNum,
        available_weight: weightNum,
        price_per_kg: priceNum,
        status: 'Active'
      };

      const res = await apiFetch('/api/trips/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.data || res.status === 'success') {
        navigate('/traveler');
      } else {
        throw new Error(res.message || "Failed to create trip");
      }
    } catch (error: any) {
      console.error("Trip creation failed:", error);
      setErrorMsg(error.message || "Failed to post trip. Please check required fields.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      <Sidebar activeItem="Trip" />

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
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">Post a Trip</h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block">Share your extra baggage space across Indian cities and transit hubs</p>
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
            {/* Section 1: Travel Route */}
            <section className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-[0_4px_25px_rgba(10,22,40,0.02)] transition-all">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-flyora-teal border border-teal-100/80">
                  <MapPin size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Travel Route (All India Search)</h2>
                  <p className="text-xs text-slate-400 font-medium">Type any Indian city, area, town, or transit airport</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Departure Location */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <PlaneTakeoff size={14} className="text-flyora-teal" /> Departure Location <span className="text-rose-500">*</span>
                  </label>
                  <LocationAutocomplete
                    name="departureCity"
                    value={formData.departureCity}
                    onChange={(val) => setFormData(p => ({ ...p, departureCity: val }))}
                    placeholder="e.g. Ahmedabad, Surat, Mumbai, Rajkot, Anand..."
                    required
                  />
                </div>

                {/* Arrival Location */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <PlaneLanding size={14} className="text-flyora-teal" /> Arrival Location <span className="text-rose-500">*</span>
                  </label>
                  <LocationAutocomplete
                    name="arrivalCity"
                    value={formData.arrivalCity}
                    onChange={(val) => setFormData(p => ({ ...p, arrivalCity: val }))}
                    placeholder="e.g. Delhi, Bangalore, Pune, Vadodara, Jaipur..."
                    required
                  />
                </div>

                {/* Travel Date */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Calendar size={14} className="text-flyora-teal" /> Travel Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="travelDate"
                    required
                    value={formData.travelDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                  />
                </div>

                {/* Departure Time */}
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Clock size={14} className="text-flyora-teal" /> Departure Time
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Space, Mode & Reward */}
            <section className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-[0_4px_25px_rgba(10,22,40,0.02)] transition-all">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-flyora-teal border border-teal-100/80">
                  <Weight size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Space, Mode & Pricing</h2>
                  <p className="text-xs text-slate-400 font-medium">Specify how much weight you can carry and your desired rate per KG</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Available Weight */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    Available Weight (KG) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="availableWeight"
                      required
                      value={formData.availableWeight}
                      onChange={handleInputChange}
                      placeholder="e.g. 15"
                      min="0.5"
                      step="0.5"
                      className="w-full pl-4 pr-12 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">KG</span>
                  </div>
                </div>

                {/* Price per KG */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-flyora-teal" /> Price per KG (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="pricePerKg"
                      required
                      value={formData.pricePerKg}
                      onChange={handleInputChange}
                      placeholder="e.g. 10"
                      min="1"
                      step="0.5"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                  </div>
                </div>

                {/* Travel Mode */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    Travel Mode
                  </label>
                  <select
                    name="travelMode"
                    value={formData.travelMode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/15 transition-all cursor-pointer"
                  >
                    <option value="Flight">Flight</option>
                    <option value="Train">Train (Indian Railways)</option>
                    <option value="Bus">Bus / Roadways</option>
                    <option value="Car">Personal Vehicle</option>
                  </select>
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
                {isSubmitting ? 'Publishing Trip...' : 'Publish Trip'}
              </button>
            </div>
          </form>

        </div>
      </main>

      <KycValidationModal isOpen={isModalOpen} onClose={closeModal} kycStatus={kycStatus} />
    </div>
  );
};

export default CreateTravelerTripPage;
