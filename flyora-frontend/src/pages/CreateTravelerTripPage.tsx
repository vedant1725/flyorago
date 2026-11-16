import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, MapPin, Calendar, PlaneTakeoff, PlaneLanding, Weight, DollarSign, Clock, Train, Bus, Car } from 'lucide-react';
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

      const payload = {
        traveler: userId,
        from_location: formData.departureCity,
        to_location: formData.arrivalCity,
        from_airport: formData.departureCity,
        to_airport: formData.arrivalCity,
        departure_date: formData.travelDate,
        departure_time: formData.departureTime || '10:00:00',
        arrival_date: formData.arrivalDate || formData.travelDate,
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Traveler" />

      <main className="flex-1 min-w-0 w-full max-w-full lg:ml-[240px] flex flex-col min-h-screen lg:h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex h-[80px] bg-white border-b border-slate-100 items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <HeaderProfileDropdown />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Page Title */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-0.5">Post a Trip</h1>
                <p className="text-xs font-medium text-slate-500">Share your extra space across any city, town, or transit hub in India</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
                <div className="flex-1 leading-relaxed">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Route */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-flyora-teal border border-teal-100">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Travel Route (All India Search)</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Type any Indian city, area, town, or airport</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <PlaneTakeoff size={12} /> Departure Location (City / Town / Hub) <span className="text-rose-500">*</span>
                    </label>
                    <LocationAutocomplete
                      name="departureCity"
                      value={formData.departureCity}
                      onChange={(val) => setFormData(p => ({ ...p, departureCity: val }))}
                      placeholder="e.g. Ahmedabad, Surat, Mumbai, Rajkot, Anand..."
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <PlaneLanding size={12} /> Arrival Location (City / Town / Hub) <span className="text-rose-500">*</span>
                    </label>
                    <LocationAutocomplete
                      name="arrivalCity"
                      value={formData.arrivalCity}
                      onChange={(val) => setFormData(p => ({ ...p, arrivalCity: val }))}
                      placeholder="e.g. Delhi, Bangalore, Pune, Vadodara..."
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Calendar size={12} /> Travel Date <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="date" name="travelDate" required value={formData.travelDate} onChange={handleInputChange} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Clock size={12} /> Departure Time
                    </label>
                    <input 
                      type="time" name="departureTime" value={formData.departureTime} onChange={handleInputChange} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Capacity, Mode & Pricing */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-flyora-teal border border-teal-100">
                    <Weight size={16} />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Space, Mode & Reward</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      Available Weight (kg) <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="number" name="availableWeight" required value={formData.availableWeight} onChange={handleInputChange} 
                      placeholder="e.g. 15" min="0.5" step="0.5"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <DollarSign size={12} /> Price per kg ($) <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="number" name="pricePerKg" required value={formData.pricePerKg} onChange={handleInputChange} 
                      placeholder="e.g. 10" min="1" step="0.5"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      Travel Mode
                    </label>
                    <select
                      name="travelMode"
                      value={formData.travelMode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    >
                      <option value="Flight">Flight</option>
                      <option value="Train">Train (Indian Railways)</option>
                      <option value="Bus">Bus / Roadways</option>
                      <option value="Car">Personal Vehicle</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-flyora-teal hover:bg-teal-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Publishing Trip...' : 'Publish Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <KycValidationModal isOpen={isModalOpen} onClose={closeModal} kycStatus={kycStatus} />
    </div>
  );
};

export default CreateTravelerTripPage;
