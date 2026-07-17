import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, Star, Mail, Phone,
  MapPin, CheckCircle2, User, Lock, Edit3, Trash2, Plus, X
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import './dashboard.css';

// sidebarItems removed

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
  
  // Local storage profile state
  const [userName, setUserName] = useState(localStorage.getItem('flyora_user_name') || 'Vedant Sharma');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('flyora_user_email') || 'vedant.sharma@example.com');
  const [userPhone, setUserPhone] = useState(localStorage.getItem('flyora_user_phone') || '+91 98765 43210');
  const [userBio, setUserBio] = useState('Passionate international traveler and tech enthusiast. Happy to carry safe documents and verified items.');
  const [userLanguages, setUserLanguages] = useState('English, Hindi, German');
  
  const initials = userName.split(' ').map(n => n[0]).join('');

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

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profRes, addrRes] = await Promise.all([
          apiFetch('/api/profiles/me'),
          apiFetch('/api/profiles/addresses')
        ]);
        
        if (profRes.status === 'success' && profRes.data) {
          const d = profRes.data;
          setUserName(`${d.first_name || ''} ${d.last_name || ''}`.trim() || userName);
          setUserEmail(d.email || userEmail);
          setUserPhone(d.phone_number || userPhone);
          if (d.bio) setUserBio(d.bio);
          if (d.languages) setUserLanguages(d.languages);
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
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const names = userName.split(' ');
      await apiFetch('/api/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({
          bio: userBio,
          languages: userLanguages,
          pref_fragile: prefFragile,
          pref_electronics: prefElectronics,
          pref_documents: prefDocuments,
          pref_liquid: prefLiquid
        })
      });
      localStorage.setItem('flyora_user_name', userName);
      setSuccessMessage('Profile details saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
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
    <div className="fly-dashboard-shell profile-page min-h-screen bg-slate-50">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Profile" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="flex items-center justify-between gap-4 mb-6 h-[40px]">
            <label className="flex-1 max-w-[500px] h-full bg-white border border-slate-200 rounded-[12px] flex items-center gap-3 px-4 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search trips, shipments, users..." className="w-full bg-transparent border-0 outline-none text-sm text-slate-700 placeholder-slate-400 font-medium" />
            </label>

            <div className="flex items-center gap-3">
              <button type="button" className="w-[40px] h-[40px] rounded-[12px] bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-flyora-teal hover:border-teal-200 transition-colors relative shadow-sm" onClick={() => navigate('/notifications')}>
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
              </button>

              <button type="button" className="flex items-center gap-3 pl-1 pr-3 py-1 bg-transparent hover:bg-slate-200/50 rounded-full transition-colors border-0 cursor-pointer">
                <div className="w-[32px] h-[32px] rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold border border-teal-100">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-bold text-slate-800 leading-tight">{userName}</span>
                  <span className="text-[11px] font-semibold text-slate-500 leading-tight">Traveler</span>
                </div>
                <ChevronDown size={14} className="text-slate-400 ml-1 hidden sm:block" />
              </button>
            </div>
          </div>

          {/* User Profile Header - Redesigned cleanly without overlapping banners */}
          <section className="bg-white rounded-[16px] border border-slate-200 p-6 sm:p-8 mb-6 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full lg:w-auto">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-flyora-teal to-teal-600 text-white flex shrink-0 items-center justify-center text-3xl font-black shadow-md border-4 border-teal-50/50">
                {initials}
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
                      <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" />
                    </div>
                  </label>
                </div>

                <div className="col-span-1">
                  <label className="block">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Languages Spoken</span>
                    <input type="text" value={userLanguages} onChange={(e) => setUserLanguages(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" placeholder="English, Hindi" />
                  </label>
                </div>

                <div className="col-span-1">
                  <label className="block">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</span>
                    <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" />
                  </label>
                </div>

                <div className="col-span-1">
                  <label className="block">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</span>
                    <input type="text" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} required className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" />
                  </label>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio Details</span>
                    <textarea rows={4} value={userBio} onChange={(e) => setUserBio(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all resize-none" />
                  </label>
                </div>

                <div className="col-span-1 sm:col-span-2 pt-2">
                  <button type="submit" className="h-12 px-8 bg-flyora-teal hover:bg-teal-600 text-white text-sm font-bold rounded-[12px] shadow-sm transition-all inline-flex items-center justify-center">
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

          {/* Tab: Reviews */}
          {activeSubTab === 'reviews' && (
            <div className="bg-white rounded-[16px] border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-5 flex flex-col gap-1.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Reviews History</h3>
                <p className="text-sm text-slate-500 font-medium">See what others say about your trips.</p>
              </div>
              <div className="space-y-4">
                {mockReviews.length === 0 ? (
                  <div className="text-center py-12 text-sm text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-[12px]">No reviews received yet.</div>
                ) : mockReviews.map((rev) => (
                  <article key={rev.id} className="p-5 border border-slate-200 rounded-[12px] bg-slate-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-sm font-black text-slate-900">{rev.reviewerName}</div>
                        <div className="text-[11px] text-slate-500 font-bold mt-1">{rev.role} • {rev.date}</div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} size={14} className={idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 fill-slate-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{rev.comment}"</p>
                    {rev.packageDetails && (
                      <div className="mt-3 text-xs text-slate-500 font-bold">
                        Package: <span className="text-slate-800">{rev.packageDetails}</span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Tab: KYC Status */}
          {activeSubTab === 'kyc' && (
            <article className="bg-white rounded-[16px] border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="border-b border-slate-100 pb-5 mb-8 flex flex-col gap-1.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">KYC & Verification Status</h3>
                <p className="text-sm text-slate-500 font-medium">Verify your identity to unlock trust badges.</p>
              </div>

              <div className="space-y-6 max-w-xl">
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[12px] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[12px] bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck size={24} strokeWidth={2.4} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-emerald-900">Identity Verification: Level 1</div>
                    <p className="text-xs text-emerald-700 font-bold mt-1 leading-relaxed">Government ID & Face verify checks successfully approved.</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-[12px] overflow-hidden bg-white">
                  <div className="p-5 flex justify-between items-center bg-slate-50 border-b border-slate-200">
                    <span className="text-sm font-black text-slate-900">KYC Overall Status</span>
                    <span className={`text-xs font-black px-3 py-1.5 rounded-[8px] uppercase tracking-wider ${
                      kycStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      kycStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                    }`}>{kycStatus}</span>
                  </div>
                </div>

                <button type="button" className="h-12 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-[12px] transition-colors" onClick={() => navigate('/kyc')}>
                  Open KYC Verification Portal
                </button>
              </div>
            </article>
          )}

        </main>

        {/* Right Utility Sidebar - Aligned perfectly with the profile header using mt-[64px] (topbar 40px + mb 24px) */}
        <aside className="fly-utility-panel">
          <article className="bg-slate-900 rounded-[16px] border border-slate-800 text-white p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="w-12 h-12 rounded-[12px] bg-teal-500/20 text-teal-400 flex items-center justify-center mb-5 border border-teal-500/30">
              <BadgeCheck size={24} strokeWidth={2.5} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-wider mb-3 text-white">Verified Host Status</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Travelers who upload government documents and complete face matching unlock the "Verified Host" badge, boosting booking requests by 4x.
            </p>
          </article>
        </aside>

      </div>

      {/* Add Address Modal */}
      {isAddingAddr && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setIsAddingAddr(false)}>
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add Saved Address</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Register a frequent parcel pickup/drop destination.</p>
              </div>
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors" onClick={() => setIsAddingAddr(false)}>
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            <form className="p-6 space-y-5" onSubmit={handleAddAddress}>
              <label className="block">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address Label (Tag)</span>
                <select className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" value={newAddrTag} onChange={(e) => setNewAddrTag(e.target.value)}>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Billing">Billing</option>
                  <option value="Warehouse">Warehouse</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Address Line</span>
                <input type="text" required placeholder="House No, Building, Street, City, ZIP, Country" value={newAddrText} onChange={(e) => setNewAddrText(e.target.value)} className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-flyora-teal/10 outline-none transition-all" />
              </label>

              <div className="pt-4 flex gap-3">
                <button type="button" className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-[12px] transition-colors" onClick={() => setIsAddingAddr(false)}>Cancel</button>
                <button type="submit" className="flex-1 h-12 bg-flyora-teal hover:bg-teal-600 text-white text-sm font-bold rounded-[12px] shadow-sm transition-colors">Add Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
