import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, Camera, Trash2, Save, CheckCircle2,
  Mail, Phone, MessageCircle, Send, Users, ShieldCheck, Headphones
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { HeaderProfileDropdown } from '../components/ui/HeaderProfileDropdown';
import { apiFetch } from '../utils/api';
import './dashboard.css';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved user profile values from localStorage
  const savedFullName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const nameParts = savedFullName.trim().split(/\s+/);
  const defaultFirst = nameParts[0] || 'Vedant';
  const defaultLast = nameParts.slice(1).join(' ') || 'Sharma';

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'notifications' | 'invite' | 'guidelines' | 'support'>('profile');
  
  // Profile Form State
  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
  const [email, setEmail] = useState(localStorage.getItem('flyora_user_email') || 'vedant.sharma@example.com');
  const [phone, setPhone] = useState(localStorage.getItem('flyora_user_phone') || '+91 98765 43210');
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem('flyora_user_avatar') || '');
  const [successMsg, setSuccessMsg] = useState('');

  // Notification State
  const [pushNotify, setPushNotify] = useState(false);

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

    // 1. Immediately persist to LocalStorage
    localStorage.setItem('flyora_user_name', updatedFullName);
    localStorage.setItem('flyora_user_email', updatedEmail);
    localStorage.setItem('flyora_user_phone', updatedPhone);
    if (userAvatar) {
      localStorage.setItem('flyora_user_avatar', userAvatar);
    }

    // 2. Dispatch custom event so top headers and profile dropdown update live
    window.dispatchEvent(new Event('profileUpdated'));

    // 3. Show success notification
    setSuccessMsg('Profile settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3500);

    // 4. Optionally sync with backend
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
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion requested.');
    }
  };

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Profile <span className="text-slate-900">Settings</span></h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your account preferences and settings.</p>
      </div>

      <form onSubmit={handleSaveProfile} className="bg-white border border-flyora-teal/30 rounded-[24px] p-8 shadow-sm relative mb-6">
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-4 mb-8">
          {/* Avatar upload container */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer group shrink-0" 
            title="Click to change profile photo"
          >
            {userAvatar ? (
              <img src={userAvatar} alt={fullName} className="w-16 h-16 rounded-full object-cover border-2 border-flyora-teal shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-flyora-teal overflow-hidden flex items-center justify-center text-xl font-bold text-flyora-teal shadow-sm">
                {initials}
              </div>
            )}
            
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-flyora-teal rounded-full text-white flex items-center justify-center border-2 border-white hover:bg-teal-600 transition shadow-sm group-hover:scale-110"
            >
              <Camera size={12} />
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
            <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
            <p className="text-xs text-slate-500">Click avatar or camera icon to upload photo, then update your personal details.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">First Name</span>
            <input 
              type="text" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              required 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-800 focus:border-flyora-teal outline-none transition" 
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</span>
            <input 
              type="text" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-800 focus:border-flyora-teal outline-none transition" 
            />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</span>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-800 focus:border-flyora-teal outline-none transition" 
              />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</span>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-800 focus:border-flyora-teal outline-none transition" 
              />
            </div>
          </label>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-flyora-teal text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition flex items-center gap-2 cursor-pointer"
          >
            Save Changes <Save size={16} />
          </button>
        </div>
      </form>

      <div className="bg-red-50 border border-red-100 rounded-[24px] p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Delete Account</h2>
          <p className="text-sm text-slate-500">This will shut down your profile and remove your data from our servers.</p>
        </div>
        <button type="button" onClick={handleDeleteAccount} className="bg-white border border-red-200 text-red-500 px-6 py-3 rounded-full text-sm font-bold hover:bg-red-50 transition shrink-0">
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-flyora-teal tracking-tight">Notification <span className="text-slate-900">Setting</span></h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Stay updated about what matters.</p>
      </div>
      
      <div className="bg-white border border-flyora-teal/30 rounded-[24px] p-6 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Push Notification</h3>
            <p className="text-xs text-slate-500 mt-0.5">Get notified when review completes</p>
          </div>
        </div>
        
        {/* Custom Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={pushNotify} onChange={() => setPushNotify(!pushNotify)} />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-flyora-teal"></div>
        </label>
      </div>
    </div>
  );

  const renderInvite = () => (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
      <div className="bg-white border border-flyora-teal/30 rounded-[24px] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between mb-10 overflow-hidden relative">
        <div className="relative z-10 md:max-w-[50%]">
          <h1 className="text-3xl font-extrabold text-flyora-teal tracking-tight mb-3">Invite <span className="text-slate-900">Friend</span></h1>
          <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">Join us in our journey and invite your friends to Smart experience!</p>
          <button className="bg-flyora-teal text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition flex items-center gap-2">
            <Users size={16} /> Refer a Friend
          </button>
        </div>
        <div className="mt-8 md:mt-0 relative w-64 h-64 flex-shrink-0 bg-teal-50 rounded-full flex items-center justify-center">
          <Users size={80} className="text-flyora-teal" />
        </div>
      </div>

      <h3 className="font-bold text-slate-800 mb-4">Share via Platforms</h3>
      <div className="flex flex-wrap gap-3">
        <button className="px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center gap-2 border border-emerald-100 hover:bg-emerald-100 transition"><MessageCircle size={14} /> WhatsApp</button>
        <button className="px-5 py-2.5 rounded-full bg-red-50 text-red-500 text-xs font-bold flex items-center gap-2 border border-red-100 hover:bg-red-100 transition"><Mail size={14} /> Gmail</button>
        <button className="px-5 py-2.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center gap-2 border border-blue-100 hover:bg-blue-100 transition"><Users size={14} /> Facebook</button>
        <button className="px-5 py-2.5 rounded-full bg-pink-50 text-pink-600 text-xs font-bold flex items-center gap-2 border border-pink-100 hover:bg-pink-100 transition"><Camera size={14} /> Instagram</button>
        <button className="px-5 py-2.5 rounded-full bg-sky-50 text-sky-500 text-xs font-bold flex items-center gap-2 border border-sky-100 hover:bg-sky-100 transition"><Send size={14} /> Telegram</button>
        <button className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 border border-slate-200 hover:bg-slate-200 transition"><MessageCircle size={14} /> Twitter</button>
      </div>
    </div>
  );

  const renderGuidelines = () => (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
      <h1 className="text-3xl font-extrabold text-flyora-teal tracking-tight mb-6">Community <span className="text-slate-900">Guidelines</span></h1>
      <p className="text-sm text-slate-600 mb-6 font-medium">To keep FlyoraGo safe and respectful for everyone, users must follow these community guidelines:</p>
      
      <ul className="space-y-4 mb-8">
        {[
          "Be respectful and kind to other users.",
          "Do not share harmful, abusive, hateful, or illegal content.",
          "No bullying, harassment, impersonation, or threats.",
          "Avoid sharing spam, fake information, or misleading links.",
          "Respect user privacy and personal information.",
          "Do not upload inappropriate, explicit, or offensive content.",
          "Follow all applicable laws while using the platform."
        ].map((rule, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-flyora-teal mt-2"></div>
            <span className="text-sm text-slate-600">{rule}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-500 font-medium">Violation of these guidelines may result in warnings, temporary suspension, or permanent account removal from FlyoraGo.</p>
    </div>
  );

  const renderSupport = () => (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-8 text-center">
      <div className="inline-block bg-orange-50 text-orange-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-4 border border-orange-100">
        • 24/7 Support Available
      </div>
      <h1 className="text-4xl font-extrabold text-flyora-teal tracking-tight mb-3">Help <span className="text-slate-900">& Support</span></h1>
      <p className="text-sm text-slate-500 font-medium mb-12 max-w-md mx-auto">Got questions or issues? Our support team is ready to help you out anytime.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm text-left hover:border-flyora-teal/50 transition cursor-pointer group">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
            <Mail size={24} />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Email US</h3>
          <p className="text-sm font-semibold text-flyora-teal group-hover:text-teal-700 flex items-center gap-2">support@flyorago.com ↗</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm text-left hover:border-flyora-teal/50 transition cursor-pointer group">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
            <Phone size={24} />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Call US</h3>
          <p className="text-sm font-semibold text-flyora-teal group-hover:text-teal-700 flex items-center gap-2">+1 800 555 1234 ↗</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm text-left hover:border-flyora-teal/50 transition cursor-pointer group">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Chat on Whatsapp</h3>
          <p className="text-sm font-semibold text-flyora-teal group-hover:text-teal-700 flex items-center gap-2">+1 800 555 1234 ↗</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col lg:flex-row font-sans">
      <Sidebar 
        activeItem="Settings" 
        activeSubItem={activeSubTab} 
        onSubItemClick={(id) => setActiveSubTab(id as any)} 
      />

      <main className="flex-1 lg:ml-[240px] flex flex-col h-[calc(100vh-60px)] lg:h-screen overflow-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex h-[80px] bg-white border-b border-slate-100 items-center justify-end px-8 shrink-0">
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

        <div className="flex-1 overflow-y-auto bg-[#FFFDFB]">
          {activeSubTab === 'profile' && renderProfile()}
          {activeSubTab === 'notifications' && renderNotifications()}
          {activeSubTab === 'invite' && renderInvite()}
          {activeSubTab === 'guidelines' && renderGuidelines()}
          {activeSubTab === 'support' && renderSupport()}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
