import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, Camera, Trash2, Save, CheckCircle2,
  Mail, Phone, MessageCircle, Send, Users, ShieldCheck, Headphones,
  Search, X, UserRound, ArrowRight, Copy, Check, Globe
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { NotificationDropdown } from '../components/ui/NotificationDropdown';
import { apiFetch } from '../utils/api';
import './dashboard.css';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'notifications' | 'invite' | 'guidelines' | 'support'>('profile');

  // Saved user profile values from localStorage
  const savedFullName = localStorage.getItem('flyora_user_name') || 'User';
  const nameParts = savedFullName.trim().split(/\s+/);
  const defaultFirst = nameParts[0] || 'User';
  const defaultLast = nameParts.slice(1).join(' ') || 'Sharma';

  // Profile Form State
  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
  const [email, setEmail] = useState(localStorage.getItem('flyora_user_email') || '');
  const [phone, setPhone] = useState(localStorage.getItem('flyora_user_phone') || '+91 98765 43210');
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem('flyora_user_avatar') || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Notification Preferences
  const [pushNotify, setPushNotify] = useState(true);
  const [emailTripNotify, setEmailTripNotify] = useState(true);
  const [escrowNotify, setEscrowNotify] = useState(true);

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fullName = `${firstName} ${lastName}`.trim() || 'User Account';
  const initials = fullName
    .split(/\s+/)
    .map(n => (n ? n[0] : ''))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch('/api/auth/me/');
        if (res.status === 'success' && res.data) {
          const d = res.data;
          if (!localStorage.getItem('flyora_user_name')) {
            setFirstName(d.first_name || defaultFirst);
            setLastName(d.last_name || defaultLast);
            localStorage.setItem('flyora_user_name', `${d.first_name || defaultFirst} ${d.last_name || defaultLast}`.trim());
          }
          if (!localStorage.getItem('flyora_user_email') && d.email) {
            setEmail(d.email);
            localStorage.setItem('flyora_user_email', d.email);
          }
          if (!localStorage.getItem('flyora_user_phone') && d.phone_number) {
            setPhone(d.phone_number);
            localStorage.setItem('flyora_user_phone', d.phone_number);
          }
          if (!localStorage.getItem('flyora_user_avatar') && (d.avatar || d.avatar_url)) {
            const avatarVal = d.avatar || d.avatar_url;
            setUserAvatar(avatarVal);
            localStorage.setItem('flyora_user_avatar', avatarVal);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings user data', err);
      }
    };
    fetchUser();
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
      setUserAvatar(base64String);
      localStorage.setItem('flyora_user_avatar', base64String);
      window.dispatchEvent(new Event('profileUpdated'));

      setSuccessMsg('Profile photo updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);

      try {
        await apiFetch('/api/profiles/me', {
          method: 'PATCH',
          body: JSON.stringify({ avatar: base64String, avatar_url: base64String }),
        });
      } catch (err) {
        console.error('Background sync notice for avatar:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const updatedEmail = email.trim();
    const updatedPhone = phone.trim();

    localStorage.setItem('flyora_user_name', updatedFullName);
    localStorage.setItem('flyora_user_email', updatedEmail);
    localStorage.setItem('flyora_user_phone', updatedPhone);
    if (userAvatar) {
      localStorage.setItem('flyora_user_avatar', userAvatar);
    }

    window.dispatchEvent(new Event('profileUpdated'));

    setSuccessMsg('Profile settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3500);

    try {
      await apiFetch('/api/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: updatedEmail,
          phone_number: updatedPhone,
          avatar: userAvatar,
          avatar_url: userAvatar,
        })
      });
    } catch (err) {
      console.log('Background sync notice:', err);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await apiFetch('/api/profiles/me/', { method: 'DELETE' });
      if (res?.status === 'success' || res?.message) {
        localStorage.clear();
        sessionStorage.clear();
        setShowDeleteModal(false);
        navigate('/login', { replace: true });
      } else {
        setDeleteError(res?.message || 'Failed to delete account. Please try again.');
      }
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to connect to server.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(`https://flyorago.me/signup?ref=${firstName.toLowerCase()}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Tab switch options
  const subTabs = [
    { id: 'profile', label: 'My Profile', icon: UserRound },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'invite', label: 'Invite Friends', icon: Users },
    { id: 'guidelines', label: 'Guidelines', icon: ShieldCheck },
    { id: 'support', label: 'Help & Support', icon: Headphones },
  ];

  /* ───────────────────────────────────────────────────────────── */
  /* TAB 1: Profile Settings                                      */
  /* ───────────────────────────────────────────────────────────── */
  const renderProfile = () => (
    <div className="space-y-6">
      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-[28px] p-4 sm:p-8 shadow-[0_4px_20px_rgba(10,22,40,0.03)] relative">
        {successMsg && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-800 text-sm font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} className="text-flyora-teal" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Avatar & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8 pb-6 border-b border-slate-100">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer group shrink-0" 
            title="Click to change profile photo"
          >
            {userAvatar ? (
              <img src={userAvatar} alt={fullName} className="w-20 h-20 rounded-2xl object-cover border-2 border-flyora-teal shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-teal-50 border-2 border-flyora-teal overflow-hidden flex items-center justify-center text-2xl font-black text-flyora-teal shadow-md">
                {initials}
              </div>
            )}
            
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-flyora-teal rounded-full text-white flex items-center justify-center border-2 border-white hover:bg-[#0F766E] transition shadow-sm group-hover:scale-110"
            >
              <Camera size={13} />
            </button>

            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-800">Profile Information</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Click the avatar to upload a fresh photo (max 5MB). Update your personal details below.
            </p>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">First Name</span>
            <input 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              required 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-flyora-teal outline-none transition" 
            />
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Last Name</span>
            <input 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-flyora-teal outline-none transition" 
            />
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</span>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-flyora-teal outline-none transition" 
              />
            </div>
          </label>

          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Phone Number</span>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-flyora-teal outline-none transition" 
              />
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            className="bg-flyora-teal hover:bg-[#0F766E] text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-teal-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> Save Profile Changes
          </button>
        </div>
      </form>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-50/70 border border-rose-200/80 rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-base font-black text-rose-900 mb-1">Delete Account</h2>
          <p className="text-xs text-rose-700 font-medium max-w-lg">
            This will permanently close your traveler and sender profile and wipe your personal booking records.
          </p>
        </div>
        <button 
          type="button" 
          onClick={handleDeleteAccount} 
          className="bg-white border border-rose-300 text-rose-600 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-600 hover:text-white transition shrink-0 shadow-2xs"
        >
          Delete Account
        </button>
      </div>
    </div>
  );

  /* ───────────────────────────────────────────────────────────── */
  /* TAB 2: Notifications Settings                                */
  /* ───────────────────────────────────────────────────────────── */
  const renderNotifications = () => (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-[28px] p-4 sm:p-8 shadow-[0_4px_20px_rgba(10,22,40,0.03)] space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Notification Preferences</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Choose how you want FlyoraGo to keep you updated about matches, luggage space, and payments.</p>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Push Notifications */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-flyora-teal flex items-center justify-center shrink-0 border border-teal-100">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Browser & Mobile Push Notifications</h3>
                <p className="text-xs text-slate-500 font-medium">Receive real-time alerts when travelers match or message you.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={pushNotify} onChange={() => setPushNotify(!pushNotify)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-flyora-teal"></div>
            </label>
          </div>

          {/* Email Trip Updates */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Mail size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Email Flight & Delivery Summaries</h3>
                <p className="text-xs text-slate-500 font-medium">Get journey receipts, flight itinerary updates, and booking PDFs.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={emailTripNotify} onChange={() => setEmailTripNotify(!emailTripNotify)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-flyora-teal"></div>
            </label>
          </div>

          {/* Escrow & Payment Alerts */}
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Escrow Security & Payout Alerts</h3>
                <p className="text-xs text-slate-500 font-medium">Instant alerts when payments are deposited into escrow or released to wallet.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={escrowNotify} onChange={() => setEscrowNotify(!escrowNotify)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-flyora-teal"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  /* ───────────────────────────────────────────────────────────── */
  /* TAB 3: Invite Friends                                        */
  /* ───────────────────────────────────────────────────────────── */
  const renderInvite = () => (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(10,22,40,0.03)] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4">
          <span className="px-3 py-1 rounded-full bg-teal-50 text-flyora-teal text-[10px] font-black uppercase tracking-widest border border-teal-200/70 inline-block">
            REFERRAL PROGRAM
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Invite Friends & Earn Bonus Luggage Credits
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-lg">
            Invite your traveler and sender friends to FlyoraGo. When they complete their first delivery, both of you earn ₹250 wallet credits!
          </p>

          {/* Copy Link Input Bar */}
          <div className="flex items-center gap-2 max-w-md pt-2">
            <input 
              type="text" 
              readOnly 
              value={`https://flyorago.me/signup?ref=${firstName.toLowerCase()}`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none"
            />
            <button
              onClick={handleCopyInviteLink}
              className="px-4 py-2.5 rounded-xl bg-flyora-teal hover:bg-[#0F766E] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal shrink-0">
          <Users size={72} strokeWidth={1.5} />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(10,22,40,0.03)]">
        <h3 className="font-black text-slate-800 text-sm mb-4 uppercase tracking-wider">Share via Platforms</h3>
        <div className="flex flex-wrap gap-3">
          <a href={`https://api.whatsapp.com/send?text=Join%20FlyoraGo%20and%20monetize%20your%20luggage%20space!%20https://flyorago.me/signup?ref=${firstName.toLowerCase()}`} target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black flex items-center gap-2 border border-emerald-200 hover:bg-emerald-100 transition"><MessageCircle size={15} /> WhatsApp</a>
          <a href={`mailto:?subject=Join%20FlyoraGo&body=Hey,%20check%20out%20FlyoraGo%20for%20peer-to-peer%20luggage%20delivery:%20https://flyorago.me/signup?ref=${firstName.toLowerCase()}`} className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-black flex items-center gap-2 border border-red-200 hover:bg-red-100 transition"><Mail size={15} /> Email</a>
          <button onClick={handleCopyInviteLink} className="px-5 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-black flex items-center gap-2 border border-blue-200 hover:bg-blue-100 transition"><Send size={15} /> Telegram</button>
          <button onClick={handleCopyInviteLink} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-black flex items-center gap-2 border border-slate-200 hover:bg-slate-200 transition"><Globe size={15} /> Direct Share</button>
        </div>
      </div>
    </div>
  );

  /* ───────────────────────────────────────────────────────────── */
  /* TAB 4: Community Guidelines                                  */
  /* ───────────────────────────────────────────────────────────── */
  const renderGuidelines = () => (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(10,22,40,0.03)] space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Community Guidelines</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          To keep FlyoraGo safe, trusted, and respectful for travelers and senders, all users must adhere to these policies:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Physical Inspection Required", desc: "Travelers must physically inspect all contents before accepting any parcel for travel." },
          { title: "Strictly Prohibited Goods", desc: "Never carry hazardous substances, contraband, unpackaged perishables, or illegal materials." },
          { title: "Secure Escrow Only", desc: "Never exchange off-platform cash. All payments must stay secured in Flyora Escrow." },
          { title: "OTP Handover Verification", desc: "Only release package at dropoff upon matching the secure receiver OTP code." },
          { title: "Honest Space & Weight", desc: "Accurately declare parcel weight and dimensions to avoid airline overweight baggage penalties." },
          { title: "Respect & Communication", desc: "Maintain respectful, prompt communication between travelers and senders at all times." }
        ].map((rule, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-flyora-teal flex items-center justify-center shrink-0 border border-teal-100 mt-0.5">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800">{rule.title}</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">{rule.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-800 text-xs font-medium flex items-center gap-2">
        <ShieldCheck size={16} className="text-flyora-teal shrink-0" />
        <span>Failure to follow community guidelines may result in trust score deduction, payout freeze, or account termination.</span>
      </div>
    </div>
  );

  /* ───────────────────────────────────────────────────────────── */
  /* TAB 5: Help & Support                                        */
  /* ───────────────────────────────────────────────────────────── */
  const renderSupport = () => (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(10,22,40,0.03)] text-left">
        <span className="px-3 py-1 rounded-full bg-teal-50 text-flyora-teal text-[10px] font-black uppercase tracking-widest border border-teal-200/70 inline-block mb-3">
          24/7 SUPPORT DESK
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Help & Customer Support
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-xl">
          Got questions about your trip, baggage booking, or escrow release? Our dedicated support team is available 24/7.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8">
          {/* Email Support */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:border-flyora-teal transition cursor-pointer group">
            <div className="w-12 h-12 bg-teal-50 text-flyora-teal rounded-xl flex items-center justify-center mb-4 border border-teal-100 group-hover:scale-105 transition-transform">
              <Mail size={22} />
            </div>
            <h3 className="font-black text-slate-800 text-sm mb-1">Email Support</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">For detailed inquiries & disputes</p>
            <p className="text-xs font-black text-flyora-teal group-hover:text-teal-700 flex items-center gap-1.5">
              support@flyorago.me <ArrowRight size={13} />
            </p>
          </div>

          {/* Call Support */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:border-flyora-teal transition cursor-pointer group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 border border-blue-100 group-hover:scale-105 transition-transform">
              <Phone size={22} />
            </div>
            <h3 className="font-black text-slate-800 text-sm mb-1">Toll-Free Helpline</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">Instant phone assistance</p>
            <p className="text-xs font-black text-flyora-teal group-hover:text-teal-700 flex items-center gap-1.5">
              +91 1800 200 4567 <ArrowRight size={13} />
            </p>
          </div>

          {/* WhatsApp Support */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:border-flyora-teal transition cursor-pointer group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 border border-emerald-100 group-hover:scale-105 transition-transform">
              <MessageCircle size={22} />
            </div>
            <h3 className="font-black text-slate-800 text-sm mb-1">WhatsApp Live Chat</h3>
            <p className="text-xs text-slate-500 font-medium mb-3">Quick questions & tracking help</p>
            <p className="text-xs font-black text-flyora-teal group-hover:text-teal-700 flex items-center gap-1.5">
              Chat on WhatsApp <ArrowRight size={13} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans relative overflow-x-hidden">
      <Sidebar 
        activeItem="Settings" 
        activeSubItem={activeSubTab} 
        onSubItemClick={(id) => setActiveSubTab(id as any)} 
      />

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
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center gap-3 bg-white border border-slate-200/80 hover:border-slate-300 rounded-full px-4 py-2.5 shadow-[0_2px_8px_rgba(10,22,40,0.02)] transition-all">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={e => setHeaderSearchQuery(e.target.value)}
                placeholder="Search settings, preferences..."
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

        {/* ─── Main Content Container (Consistent px-4 sm:px-8 xl:px-10 margins) ─── */}
        <div className="px-4 sm:px-8 xl:px-10 space-y-6 sm:space-y-8 relative z-20">

          {/* ─── Page Title & Sub-tabs switcher bar ─── */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>Account &amp;</span>
                <span className="text-flyora-teal">Settings</span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 max-w-xl">
                Manage your personal profile, notification preferences, community guidelines, and support.
              </p>
            </div>

            {/* Quick Horizontal Sub-tab Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {subTabs.map(tab => {
                const Icon = tab.icon;
                const isSelected = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-flyora-teal text-white shadow-md shadow-teal-500/20'
                        : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Active Tab Content ─── */}
          <div>
            {activeSubTab === 'profile' && renderProfile()}
            {activeSubTab === 'notifications' && renderNotifications()}
            {activeSubTab === 'invite' && renderInvite()}
            {activeSubTab === 'guidelines' && renderGuidelines()}
            {activeSubTab === 'support' && renderSupport()}
          </div>

        </div>
      </main>

      {/* ─── Delete Account Confirmation Modal ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0A1628]/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />

          {/* Dialog Card */}
          <div className="relative bg-white w-full max-w-md rounded-[26px] sm:rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center z-10 max-h-[92vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              disabled={isDeleting}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* Danger Icon */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-3.5 text-rose-600 shadow-xs">
              <Trash2 size={26} strokeWidth={2.2} />
            </div>

            {/* Badge */}
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-2.5 bg-rose-50 text-rose-700 border-rose-200/80">
              Permanent Action
            </span>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-2">
              Delete Account
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-4 leading-relaxed max-w-sm">
              Are you sure you want to delete your FlyoraGo account? All your personal profile records, bookings, and active trips will be permanently erased.
            </p>

            {/* Warning Box */}
            <div className="w-full p-3.5 mb-5 rounded-2xl bg-rose-50/60 border border-rose-100 text-left space-y-1.5 text-xs text-rose-800">
              <div className="font-bold flex items-center gap-1.5">
                <span>⚠️ Important Information:</span>
              </div>
              <ul className="text-[11px] text-rose-700 leading-snug space-y-1 pl-1">
                <li>• This action cannot be reversed or undone.</li>
                <li>• Any pending transactions or deliveries must be completed first.</li>
                <li>• You will be immediately logged out upon deletion.</li>
              </ul>
            </div>

            {deleteError && (
              <div className="w-full p-3 mb-4 rounded-xl bg-red-100 border border-red-200 text-red-700 text-xs font-semibold text-center">
                {deleteError}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={confirmDeleteAccount}
                disabled={isDeleting}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <span>Deleting Account...</span>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Permanently Delete My Account</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel &amp; Keep Account
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
