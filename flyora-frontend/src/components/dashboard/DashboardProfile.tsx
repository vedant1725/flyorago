import React from 'react';
import { User, Mail, Phone, Lock } from 'lucide-react';
import Button from '../ui/Button';

interface Props {
  profileName: string; setProfileName: (v: string) => void;
  profileEmail: string; setProfileEmail: (v: string) => void;
  profilePhone: string; setProfilePhone: (v: string) => void;
  profilePassword: string; setProfilePassword: (v: string) => void;
  profileLoading: boolean;
  profileMessage: { text: string; type: string };
  onSubmit: (e: React.FormEvent) => void;
}

const DashboardProfile: React.FC<Props> = ({
  profileName, setProfileName, profileEmail, setProfileEmail,
  profilePhone, setProfilePhone, profilePassword, setProfilePassword,
  profileLoading, profileMessage, onSubmit
}) => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-xl font-black text-flyora-navy">Profile Settings</h1>
      <p className="text-xs text-gray-400 mt-1 font-medium">Manage your account details and security preferences.</p>
    </div>

    {/* Profile Header Card */}
    <div className="dash-content-card">
      <div className="p-6 flex items-center gap-5 border-b border-gray-50">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-flyora-teal to-flyora-teal-light flex items-center justify-center text-white text-2xl font-black shadow-teal">
          {profileName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-black text-flyora-navy">{profileName}</h2>
          <p className="text-xs text-gray-400 font-medium">{profileEmail}</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">KYC Verified • Level 1</span>
          </div>
        </div>
      </div>
    </div>

    {/* Form */}
    <div className="dash-content-card">
      <div className="dash-content-card-header">
        <h3 className="text-sm font-black text-flyora-navy uppercase tracking-wide">Account Details</h3>
      </div>
      <div className="dash-content-card-body">
        <form className="max-w-lg space-y-5" onSubmit={onSubmit}>
          {profileMessage.text && (
            <div className={`p-3.5 border rounded-xl text-xs font-bold ${
              profileMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              {profileMessage.text}
            </div>
          )}

          <div>
            <label className="dash-input-label">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" required value={profileName} onChange={e => setProfileName(e.target.value)}
                className="dash-input pl-9" />
            </div>
          </div>

          <div>
            <label className="dash-input-label">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="email" required value={profileEmail} onChange={e => setProfileEmail(e.target.value)}
                className="dash-input pl-9" />
            </div>
          </div>

          <div>
            <label className="dash-input-label">Phone Number</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" required value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
                className="dash-input pl-9" />
            </div>
          </div>

          <div>
            <label className="dash-input-label">New Password (leave blank to keep)</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="password" placeholder="••••••••" value={profilePassword} onChange={e => setProfilePassword(e.target.value)}
                className="dash-input pl-9" />
            </div>
          </div>

          <div className="pt-2">
            <Button variant="teal" type="submit" disabled={profileLoading} className="px-8">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

export default DashboardProfile;
