import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, Star, Mail, Phone,
  MapPin, CheckCircle2, User, Lock, Edit3, Trash2, Plus, X, Camera
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../utils/api';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import './dashboard.css';

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  date: string;
  comment: string;
  role: 'Sender' | 'Traveler';
  packageDetails?: string;
}

const mockReviews: Review[] = [];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local storage profile state
  const [userName, setUserName] = useState(localStorage.getItem('flyora_user_name') || 'Vedant Sharma');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('flyora_user_email') || 'vedant.sharma@example.com');
  const [userPhone, setUserPhone] = useState(localStorage.getItem('flyora_user_phone') || '+91 98765 43210');
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem('flyora_user_avatar') || '');
  const [userBio, setUserBio] = useState(localStorage.getItem('flyora_user_bio') || 'Passionate international traveler and tech enthusiast. Happy to carry safe documents and verified items.');
  const [userLanguages, setUserLanguages] = useState(localStorage.getItem('flyora_user_languages') || 'English, Hindi, German');

  const initials = (userName || 'User')
    .trim()
    .split(/\s+/)
    .map(n => (n ? n[0] : ''))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  // UI State
  const [activeSubTab, setActiveSubTab] = useState<'details' | 'prefs' | 'reviews' | 'kyc'>('details');
  const [successMessage, setSuccessMessage] = useState('');

  // Saved Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddrTag, setNewAddrTag] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [isAddingAddr, setIsAddingAddr] = useState(false);

  // Preferences State
  const [prefFragile, setPrefFragile] = useState(true);
  const [prefElectronics, setPrefElectronics] = useState(true);
  const [prefDocuments, setPrefDocuments] = useState(true);
  const [prefLiquid, setPrefLiquid] = useState(false);

  // KYC Stats
  const [kycStatus, setKycStatus] = useState('UNVERIFIED');
  const [completedTrips, setCompletedTrips] = useState(0);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profRes, addrRes] = await Promise.all([
          apiFetch('/api/profiles/me'),
          apiFetch('/api/profiles/addresses')
        ]);

        if (profRes.status === 'success' && profRes.data) {
          const d = profRes.data;
          
          // Only initialize from backend if local storage does NOT already have user customization
          if (!localStorage.getItem('flyora_user_name') && (d.first_name || d.last_name)) {
            const fetchedName = `${d.first_name || ''} ${d.last_name || ''}`.trim();
            setUserName(fetchedName);
            localStorage.setItem('flyora_user_name', fetchedName);
          }
          if (!localStorage.getItem('flyora_user_email') && d.email) {
            setUserEmail(d.email);
            localStorage.setItem('flyora_user_email', d.email);
          }
          if (!localStorage.getItem('flyora_user_phone') && d.phone_number) {
            setUserPhone(d.phone_number);
            localStorage.setItem('flyora_user_phone', d.phone_number);
          }
          if (!localStorage.getItem('flyora_user_avatar') && (d.avatar || d.avatar_url)) {
            const avatarVal = d.avatar || d.avatar_url;
            setUserAvatar(avatarVal);
            localStorage.setItem('flyora_user_avatar', avatarVal);
          }
          if (!localStorage.getItem('flyora_user_bio') && d.bio) {
            setUserBio(d.bio);
            localStorage.setItem('flyora_user_bio', d.bio);
          }
          if (!localStorage.getItem('flyora_user_languages') && d.languages) {
            setUserLanguages(d.languages);
            localStorage.setItem('flyora_user_languages', d.languages);
          }

          setPrefFragile(d.pref_fragile ?? true);
          setPrefElectronics(d.pref_electronics ?? true);
          setPrefDocuments(d.pref_documents ?? true);
          setPrefLiquid(d.pref_liquid ?? false);
          setKycStatus(d.kyc_status || 'UNVERIFIED');
          setCompletedTrips(Number(d.completed_trips) || 0);
          setRating(Number(d.rating) || 0);
        }

        if (addrRes.status === 'success' && Array.isArray(addrRes.data)) {
          setAddresses(addrRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile from API:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      // 1. Immediately update UI state & LocalStorage
      setUserAvatar(base64String);
      localStorage.setItem('flyora_user_avatar', base64String);
      window.dispatchEvent(new Event('profileUpdated'));
      setSuccessMessage('Profile photo updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);

      // 2. Sync to API in background
      try {
        await apiFetch('/api/profiles/me', {
          method: 'PATCH',
          body: JSON.stringify({ avatar: base64String, avatar_url: base64String }),
        });
      } catch (err) {
        console.error('API notice updating avatar:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = userName.trim();
    const trimmedEmail = userEmail.trim();
    const trimmedPhone = userPhone.trim();
    const trimmedBio = userBio.trim();
    const trimmedLanguages = userLanguages.trim();

    // 1. Immediately persist ALL updated fields into LocalStorage
    localStorage.setItem('flyora_user_name', trimmedName);
    localStorage.setItem('flyora_user_email', trimmedEmail);
    localStorage.setItem('flyora_user_phone', trimmedPhone);
    localStorage.setItem('flyora_user_bio', trimmedBio);
    localStorage.setItem('flyora_user_languages', trimmedLanguages);
    if (userAvatar) {
      localStorage.setItem('flyora_user_avatar', userAvatar);
    }

    // 2. Dispatch custom event so top headers and profile dropdown update live
    window.dispatchEvent(new Event('profileUpdated'));

    // 3. Show success notification
    setSuccessMessage('Profile details & preferences saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3500);

    // 4. Optionally sync with backend
    try {
      const nameParts = trimmedName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await apiFetch('/api/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: trimmedEmail,
          phone_number: trimmedPhone,
          bio: trimmedBio,
          languages: trimmedLanguages,
          avatar: userAvatar,
          avatar_url: userAvatar,
          pref_fragile: prefFragile,
          pref_electronics: prefElectronics,
          pref_documents: prefDocuments,
          pref_liquid: prefLiquid
        })
      });
    } catch (err) {
      console.log('Background sync notice:', err);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    try {
      const res = await apiFetch('/api/profiles/addresses', {
        method: 'POST',
        body: JSON.stringify({ tag: newAddrTag, text: newAddrText.trim() })
      });
      if (res.status === 'success' && res.data) {
        setAddresses([...addresses, res.data]);
        setNewAddrText('');
        setIsAddingAddr(false);
      }
    } catch (err) {
      console.error('Failed to add address:', err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiFetch(`/api/profiles/addresses/${id}`, { method: 'DELETE' });
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar activeItem="Settings" />

      <main className="flex-1 lg:ml-[240px] flex flex-col h-[calc(100vh-60px)] lg:h-screen overflow-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex h-[80px] bg-white border-b border-slate-100 items-center justify-between px-8 shrink-0">
          <label className="flex-1 max-w-[400px] bg-slate-50 border border-slate-200 rounded-full flex items-center gap-3 px-4 py-2">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search profile settings..." className="w-full bg-transparent border-0 outline-none text-xs text-slate-700 placeholder-slate-400 font-medium" />
          </label>

          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
            >
              <Bell size={18} />
            </button>

            <HeaderProfileDropdown />
          </div>
        </header>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">

          {/* User Profile Header */}
          <section className="bg-white rounded-[16px] border border-slate-200 p-6 sm:p-8 mb-6 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full lg:w-auto">
              {/* Profile Avatar Upload Circle */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group shrink-0 cursor-pointer"
                title="Click to upload profile photo"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-teal-50/50" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-flyora-teal to-teal-600 text-white flex items-center justify-center text-3xl font-black shadow-md border-4 border-teal-50/50">
                    {initials}
                  </div>
                )}
                
                <div className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]">
                  <Camera size={22} className="mb-1" />
                  <span className="text-[10px] font-bold">Change Photo</span>
                </div>

                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-flyora-teal text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                  <Camera size={14} />
                </div>

                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange} 
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left pt-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{userName}</h1>
                  <span className="text-emerald-500 flex items-center" title="KYC Verified"><BadgeCheck size={20} strokeWidth={2.5} /></span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mt-3 text-sm text-slate-500 font-semibold">
                  <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {userEmail}</span>
                  <span className="hidden sm:block text-slate-300">•</span>
                  <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {userPhone}</span>
                </div>
              </div>
            </div>

            {/* Stats Box */}
            <div className="flex gap-6 bg-slate-50 border border-slate-100 p-4 rounded-[14px] shrink-0 w-full sm:w-auto justify-center">
              <div className="text-center px-2">
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Completed</div>
                <div className="text-xl font-black text-slate-900 mt-1">{completedTrips} Trips</div>
              </div>
              <div className="w-px bg-slate-200" />
              <div className="text-center px-2">
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Rating</div>
                <div className="text-xl font-black text-slate-900 mt-1 flex items-center justify-center gap-1.5">
                  <Star size={18} className="fill-amber-400 text-amber-400" /> {Number(rating) > 0 ? Number(rating).toFixed(1) : 'N/A'}
                </div>
              </div>
            </div>
          </section>

          {/* Sub Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/60 border border-slate-200/80 rounded-[14px] w-full mb-8 scrollbar-hide">
            {[
              { id: 'details', label: 'Edit Details' },
              { id: 'prefs', label: 'Addresses & Prefs' },
              { id: 'reviews', label: `Reviews (${mockReviews.length})` },
              { id: 'kyc', label: 'Identity KYC' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-[10px] text-sm font-bold transition-all whitespace-nowrap ${
                  activeSubTab === tab.id 
                    ? 'bg-white text-flyora-teal shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-300/30 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Details */}
          {activeSubTab === 'details' && (
            <article className="bg-white rounded-[16px] border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="border-b border-slate-100 pb-5 mb-8 flex flex-col gap-1.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Profile Information</h3>
                <p className="text-sm text-slate-500 font-medium">Update your core traveler details displayed to searchers.</p>
              </div>

              <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {successMessage && (
                  <div className="col-span-1 sm:col-span-2 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold rounded-[12px] flex items-center gap-2">
                    <CheckCircle2 size={16} /> {successMessage}
                  </div>
                )}

                <div className="col-span-1">
                  <label className="block">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</span>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        required 
                        className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" 
                      />
                    </div>
                  </label>
                </div>

                <div className="col-span-1">
                  <label className="block">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Languages Spoken</span>
                    <input 
                      type="text" 
                      value={userLanguages} 
                      onChange={(e) => setUserLanguages(e.target.value)} 
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" 
                      placeholder="English, Hindi" 
                    />
                  </label>
                </div>

                <div className="col-span-1">
                  <label className="block">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</span>
                    <input 
                      type="email" 
                      value={userEmail} 
                      onChange={(e) => setUserEmail(e.target.value)} 
                      required 
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" 
                    />
                  </label>
                </div>

                <div className="col-span-1">
                  <label className="block">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</span>
                    <input 
                      type="text" 
                      value={userPhone} 
                      onChange={(e) => setUserPhone(e.target.value)} 
                      required 
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" 
                    />
                  </label>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio Details</span>
                    <textarea 
                      rows={4} 
                      value={userBio} 
                      onChange={(e) => setUserBio(e.target.value)} 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all resize-none" 
                    />
                  </label>
                </div>

                <div className="col-span-1 sm:col-span-2 pt-2">
                  <button type="submit" className="h-12 px-8 bg-flyora-teal hover:bg-teal-600 text-white text-sm font-bold rounded-[12px] shadow-sm transition-all inline-flex items-center justify-center cursor-pointer">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </article>
          )}

          {/* Tab: Prefs & Addresses */}
          {activeSubTab === 'prefs' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <article className="bg-white rounded-[16px] border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col gap-1.5">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Traveler Cargo Preferences</h3>
                  <p className="text-sm text-slate-500 font-medium">Select package categories you accept.</p>
                </div>
                <div className="space-y-4 pt-2">
                  {[
                    { state: prefFragile, setter: setPrefFragile, label: 'Fragile items allowed', desc: 'Glassware, boxed perfumes, mugs etc.' },
                    { state: prefElectronics, setter: setPrefElectronics, label: 'Electronics & Devices', desc: 'Laptops, phones, watches, headphones.' },
                    { state: prefDocuments, setter: setPrefDocuments, label: 'Corporate Documents', desc: 'Academic files, commercial invoices, letters.' },
                    { state: prefLiquid, setter: setPrefLiquid, label: 'Liquids / Cosmetics (No alcohol)', desc: 'Creams, shampoos, oils.' }
                  ].map((pref, i) => (
                    <label key={i} className="flex items-start gap-4 p-4 rounded-[12px] border border-slate-100 hover:border-teal-100 hover:bg-teal-50/30 cursor-pointer transition-colors">
                      <input type="checkbox" checked={pref.state} onChange={(e) => pref.setter(e.target.checked)} className="mt-1 w-5 h-5 rounded-[6px] border-slate-300 text-flyora-teal focus:ring-flyora-teal" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{pref.label}</div>
                        <p className="text-xs text-slate-500 font-semibold mt-1">{pref.desc}</p>
                      </div>
                    </label>
                  ))}
                  <div className="pt-4">
                    <button type="button" onClick={handleProfileSave} className="h-12 px-8 bg-flyora-teal hover:bg-teal-600 text-white text-sm font-bold rounded-[12px] shadow-sm transition-all inline-flex items-center justify-center">Save Preferences</button>
                  </div>
                </div>
              </article>

              <article className="bg-white rounded-[16px] border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-6">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Saved Addresses</h3>
                    <p className="text-sm text-slate-500 font-medium">Manage pickup/delivery drops.</p>
                  </div>
                  <button type="button" className="text-sm font-bold text-flyora-teal flex items-center gap-1.5 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-[8px] transition-colors" onClick={() => setIsAddingAddr(true)}>
                    <Plus size={16} strokeWidth={2.5} /> Add
                  </button>
                </div>
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-8 text-sm text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[12px]">No addresses saved.</div>
                  ) : addresses.map(a => (
                    <div key={a.id} className="p-4 border border-slate-200 rounded-[12px] bg-slate-50 flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] font-black uppercase tracking-widest bg-slate-200/70 text-slate-600 px-2 py-1 rounded-[6px] mb-2">{a.tag}</span>
                        <p className="text-sm text-slate-800 font-bold leading-relaxed">{a.text}</p>
                      </div>
                      <button type="button" className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-[8px] transition-colors shrink-0" onClick={() => handleDeleteAddress(a.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}

        </div>
      </main>

      {/* Add Address Modal */}
      {isAddingAddr && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-black text-slate-900">Add Saved Address</h3>
              <button type="button" className="text-slate-400 hover:text-slate-600 p-1" onClick={() => setIsAddingAddr(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAddress} className="space-y-4">
              <label className="block">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Tag</span>
                <select value={newAddrTag} onChange={(e) => setNewAddrTag(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal outline-none">
                  <option value="Home">Home</option>
                  <option value="Work / Office">Work / Office</option>
                  <option value="Warehouse / Drop">Warehouse / Drop</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Address Line</span>
                <input type="text" required placeholder="House No, Building, Street, City, ZIP, Country" value={newAddrText} onChange={(e) => setNewAddrText(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal outline-none" />
              </label>

              <div className="pt-4 flex gap-3">
                <button type="button" className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-[12px]" onClick={() => setIsAddingAddr(false)}>Cancel</button>
                <button type="submit" className="flex-1 h-12 bg-flyora-teal hover:bg-teal-600 text-white text-sm font-bold rounded-[12px]">Add Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
