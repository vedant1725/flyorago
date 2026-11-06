import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, Scale, DollarSign, FileText } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Sidebar } from '../components/Sidebar';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { LocationAutocomplete } from '../components/ui/LocationAutocomplete';
import { useKycValidation } from '../hooks/useKycValidation';
import { KycValidationModal } from '../components/ui/KycValidationModal';
import '../pages/dashboard.css';

const CreateSenderRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { validateAction, isModalOpen, closeModal, kycStatus } = useKycValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    deliveryDate: '',
    weight: '',
    category: 'Electronics',
    description: '',
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
      if (!userId) throw new Error("User not found in local storage.");

      // Calculate calculated price based on weight
      const weightNum = parseFloat(formData.weight) || 1;
      const pricePerKg = 15;
      const calculatedReward = (weightNum * pricePerKg).toFixed(2);

      // Save to /api/trips/ as a SENDER_REQUEST so SenderPage & Dashboard statistics recognize it
      const tripPayload = {
        traveler: userId,
        from_location: formData.pickup,
        to_location: formData.dropoff,
        departure_date: formData.deliveryDate,
        departure_time: "10:00:00",
        arrival_date: formData.deliveryDate,
        arrival_time: "12:30:00",
        capacity_weight: weightNum,
        available_weight: weightNum,
        price_per_kg: pricePerKg,
        airline: "SENDER_REQUEST",
        flight_number: formData.category,
        terminal_from: (formData.receiverName || 'Receiver').slice(0, 50),
        terminal_to: (formData.receiverPhone || '').slice(0, 30),
        notes: JSON.stringify({
          receiver_name: formData.receiverName,
          receiver_phone: formData.receiverPhone,
          receiver_address: formData.receiverAddress || formData.dropoff
        }),
        status: "REQUEST_CREATED"
      };

      const res = await apiFetch('/api/trips/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tripPayload)
      });

      if (res.data) {
        // Create an accompanying booking if needed
        try {
          const bookingPayload = {
            sender_trip: res.data.id,
            package_name: `${formData.category} Parcel (${formData.weight} kg)`,
            package_category: formData.category,
            description: formData.description || `${formData.category} item for delivery`,
            weight: weightNum,
            from_location: formData.pickup,
            to_location: formData.dropoff,
            delivery_date: formData.deliveryDate,
            reward: calculatedReward,
            receiver_name: formData.receiverName || "Receiver",
            receiver_phone: formData.receiverPhone || "+91 9876543210",
            receiver_address: formData.receiverAddress || formData.dropoff
          };
          await apiFetch('/api/bookings/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload)
          });
        } catch (bkErr) {
          console.warn("Booking creation note:", bkErr);
        }

        navigate('/sender');
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to create request");
      setIsSubmitting(false);
    }
  };

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
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-0.5">Create New Request</h1>
                <p className="text-xs font-medium text-slate-500">Post a shipment request with real Indian transit locations</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Route */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-flyora-teal border border-teal-100">
                    <MapPin size={16} />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Route Details (All India Search)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
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

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
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

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><Calendar size={12} /> Delivery By Date <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" name="deliveryDate" required value={formData.deliveryDate} onChange={handleInputChange} 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Package */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-flyora-teal border border-teal-100">
                    <Package size={16} />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Package Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><Scale size={12} /> Weight (kg) <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" name="weight" required value={formData.weight} onChange={handleInputChange} 
                      placeholder="e.g. 5" min="0.1" step="0.1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category <span className="text-rose-500">*</span></label>
                    <select 
                      name="category" value={formData.category} onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Documents">Documents</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Food & Sweets">Food & Sweets</option>
                      <option value="Medicines">Medicines</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><FileText size={12} /> Description</label>
                    <textarea 
                      name="description" rows={3} value={formData.description} onChange={handleInputChange} 
                      placeholder="Brief description of the package items..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Receiver Information */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Receiver Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Receiver Name</label>
                    <input 
                      type="text" name="receiverName" value={formData.receiverName} onChange={handleInputChange} 
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Receiver Phone</label>
                    <input 
                      type="text" name="receiverPhone" value={formData.receiverPhone} onChange={handleInputChange} 
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Delivery Address</label>
                    <input 
                      type="text" name="receiverAddress" value={formData.receiverAddress} onChange={handleInputChange} 
                      placeholder="e.g. Apartment, Street, Landmark"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 transition-all"
                    />
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
                  {isSubmitting ? 'Posting Request...' : 'Post Request'}
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

export default CreateSenderRequestPage;
