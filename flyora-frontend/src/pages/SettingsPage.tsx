import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, Camera, Trash2, Save,
  Mail, Phone, MessageCircle, Send, Users
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { apiFetch } from '../utils/api';
import './dashboard.css';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'notifications' | 'invite' | 'guidelines' | 'support'>('profile');
  
  // Profile Form State
  const [firstName, setFirstName] = useState(userName.split(' ')[0] || '');
  const [lastName, setLastName] = useState(userName.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Notification State
  const [pushNotify, setPushNotify] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiFetch('/api/auth/me/');
        if (res.status === 'success' && res.data) {
          const d = res.data;
          setFirstName(d.first_name || firstName);
          setLastName(d.last_name || lastName);
          setEmail(d.email || email);
          setPhone(d.phone_number || phone);
        }
      } catch (err) {
        console.error('Failed to fetch settings user data', err);
      }
    };
    fetchUser();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile saved successfully!');
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
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-flyora-teal overflow-hidden flex items-center justify-center text-xl font-bold text-flyora-teal">
              {initials}
            </div>
            <button type="button" className="absolute -bottom-1 -right-1 w-6 h-6 bg-flyora-teal rounded-full text-white flex items-center justify-center border-2 border-white hover:bg-teal-600 transition">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
            <p className="text-xs text-slate-500">Update your personal details here.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">First Name</span>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[12px] text-sm text-slate-800 focus:border-flyora-teal outline-none transition" />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Last Name</span>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[12px] text-sm text-slate-800 focus:border-flyora-teal outline-none transition" />
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</span>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-[12px] text-sm text-slate-800 focus:border-flyora-teal outline-none transition" />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</span>
            <div className="flex gap-2">
              <div className="flex items-center justify-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-[12px] text-sm font-semibold text-slate-700">
                +1
              </div>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[12px] text-sm text-slate-800 focus:border-flyora-teal outline-none transition" />
            </div>
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-flyora-teal text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition flex items-center gap-2">
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
          {/* Fallback avatar since we don't have the 3D asset */}
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
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 border border-slate-200 rounded-full cursor-pointer hover:bg-slate-50 transition">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-tight">{userName}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">Account Settings <ChevronDown size={10} /></span>
              </div>
            </div>
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
