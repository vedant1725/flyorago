import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, Camera, Trash2, Save, CheckCircle2,
  Mail, Phone, MessageCircle, Send, Users, ShieldCheck, Headphones,
  Search, X, UserRound, ArrowRight, Copy, Check, Globe, AlertTriangle, Clock
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

  // Delete Account Request State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [deletionRequestedAt, setDeletionRequestedAt] = useState<string | null>(null);
  const [existingDeleteReason, setExistingDeleteReason] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isCancellingDeletion, setIsCancellingDeletion] = useState(false);

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

    const fetchDeletionStatus = async () => {
      try {
        const res = await apiFetch('/api/profiles/delete-request/');
        if (res?.status === 'success' && res.data) {
          setDeletionRequested(!!res.data.deletion_requested);
          setDeletionRequestedAt(res.data.deletion_requested_at || null);
          setExistingDeleteReason(res.data.deletion_reason || '');
        }
      } catch (err) {
        console.error('Failed to fetch deletion status', err);
      }
    };
    fetchDeletionStatus();
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

  const handleOpenDeleteModal = () => {
    setDeleteError('');
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const handleSubmitDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDelete(true);
    setDeleteError('');
    try {
      const res = await apiFetch('/api/profiles/delete-request/', {
        method: 'POST',
        body: JSON.stringify({ reason: deleteReason.trim() }),
      });
      if (res?.status === 'success' || res?.data?.deletion_requested) {
        setDeletionRequested(true);
        setDeletionRequestedAt(res.data?.deletion_requested_at || new Date().toISOString());
        setExistingDeleteReason(deleteReason.trim());
        setShowDeleteModal(false);
        setShowSuccessModal(true);
      } else {
        setDeleteError(res?.message || 'Failed to submit account deletion request.');
      }
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to connect to server.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleCancelDeleteRequest = async () => {
    if (!window.confirm('Do you want to cancel your account deletion request and keep your FlyoraGo account?')) {
      return;
    }
    setIsCancellingDeletion(true);
    try {
      const res = await apiFetch('/api/profiles/delete-request/', {
        method: 'DELETE',
      });
      if (res?.status === 'success' || res?.data?.deletion_requested === false) {
        setDeletionRequested(false);
        setDeletionRequestedAt(null);
        setExistingDeleteReason('');
        setDeleteReason('');
        setSuccessMsg('Account deletion request has been cancelled.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel deletion request.');
    } finally {
      setIsCancellingDeletion(false);
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

      {/* Danger Zone: Account Deletion Request Status */}
      {deletionRequested ? (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs animate-in fade-in">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300 flex items-center gap-1.5">
                <Clock size={12} className="text-amber-700" /> Deletion Request Under Admin Review
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-800">
              Your Account Deletion Request is Pending Admin Approval
            </h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              You submitted a request to permanently delete your account{deletionRequestedAt ? ` on ${new Date(deletionRequestedAt).toLocaleDateString()}` : ''}. The FlyoraGo administration team is reviewing your active trips and escrow bookings. You can continue using your account normally until approved, or cancel this request at any time below.
            </p>
            {existingDeleteReason && (
              <div className="text-xs bg-white/90 border border-amber-200 rounded-xl p-2.5 text-slate-700">
                <span className="font-bold text-slate-900">Submitted Reason: </span>
                <span className="italic">"{existingDeleteReason}"</span>
              </div>
            )}
          </div>
          <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleCancelDeleteRequest}
              disabled={isCancellingDeletion}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition shadow-2xs text-center cursor-pointer"
            >
              {isCancellingDeletion ? 'Cancelling Request...' : 'Cancel Deletion Request'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-base font-black text-rose-900 mb-1">Delete Account</h2>
            <p className="text-xs text-rose-700 font-medium max-w-lg">
              Submit a formal account deletion request to the FlyoraGo administration team. Your account will be safely closed after compliance review.
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleOpenDeleteModal} 
            className="bg-white border border-rose-300 text-rose-600 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-600 hover:text-white transition shrink-0 shadow-2xs cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      )}
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

      {/* ─── Delete Account Request Modal ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0A1628]/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isSubmittingDelete && setShowDeleteModal(false)}
          />

          {/* Dialog Card */}
          <form 
            onSubmit={handleSubmitDeleteRequest}
            className="relative bg-white w-full max-w-md rounded-[26px] sm:rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center z-10 max-h-[92vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !isSubmittingDelete && setShowDeleteModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              disabled={isSubmittingDelete}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* Warning Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3.5 text-amber-600 shadow-xs">
              <AlertTriangle size={26} strokeWidth={2.2} />
            </div>

            {/* Badge */}
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-2.5 bg-amber-50 text-amber-800 border-amber-200">
              Admin Review Required
            </span>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-2">
              Request Account Deletion
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-4 leading-relaxed max-w-sm">
              Account deletion requests are submitted to our administration team for compliance verification. You will <strong>not</strong> be logged out immediately.
            </p>

            {/* Reason Field */}
            <div className="w-full text-left mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Reason for Leaving (Optional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Help us understand why you are closing your account (e.g., duplicate account, no longer traveling, etc.)..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-flyora-teal outline-none transition resize-none"
              />
            </div>

            {/* Information Box */}
            <div className="w-full p-3.5 mb-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-1.5 text-xs text-slate-600">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-flyora-teal" />
                <span>How Deletion Review Works:</span>
              </div>
              <ul className="text-[11px] leading-snug space-y-1 pl-1 text-slate-500">
                <li>• Admin checks for any active luggage trips or in-transit parcels.</li>
                <li>• Pending escrow balances will be settled prior to account closure.</li>
                <li>• You can keep using your account until the admin confirms deletion.</li>
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
                type="submit"
                disabled={isSubmittingDelete}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingDelete ? (
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Submit Deletion Request</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmittingDelete}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Keep Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Deletion Request Submitted Confirmation Modal ─── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0A1628]/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowSuccessModal(false)}
          />

          {/* Dialog Card */}
          <div className="relative bg-white w-full max-w-md rounded-[26px] sm:rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center z-10">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4 text-flyora-teal shadow-xs">
              <CheckCircle2 size={32} strokeWidth={2.2} />
            </div>

            {/* Badge */}
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-2.5 bg-teal-50 text-flyora-teal border-teal-200">
              Request Sent to Admin
            </span>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-2">
              Request Submitted Successfully!
            </h3>

            {/* Subtitle / Details */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-5 leading-relaxed max-w-sm">
              Your account deletion request has been forwarded to the FlyoraGo admin dashboard. An administrator will review your account status before processing.
            </p>

            <div className="w-full p-4 mb-5 rounded-2xl bg-teal-50/60 border border-teal-200 text-left space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-black text-flyora-teal text-xs">
                <Clock size={14} />
                <span>What happens next?</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                • You remain active and logged in.
              </p>
              <p className="text-[11px] text-slate-600 leading-snug">
                • The admin will verify no packages are in-transit and approve deletion.
              </p>
              <p className="text-[11px] text-slate-600 leading-snug">
                • If you change your mind, you can cancel your request from Settings anytime.
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-flyora-teal hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-500/20 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Got It, Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
