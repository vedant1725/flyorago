import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, ChevronDown, User, ShieldCheck, BadgeCheck, Clock, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface HeaderProfileDropdownProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  compact?: boolean;
}

export const HeaderProfileDropdown: React.FC<HeaderProfileDropdownProps> = ({
  userName: propName,
  userEmail: propEmail,
  userAvatar: propAvatar,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userName, setUserName] = useState(propName || localStorage.getItem('flyora_user_name') || 'User Account');
  const [userEmail, setUserEmail] = useState(propEmail || localStorage.getItem('flyora_user_email') || 'user@flyorago.com');
  const [userAvatar, setUserAvatar] = useState(propAvatar || localStorage.getItem('flyora_user_avatar') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('flyora_user_role') || '');
  const [kycStatus, setKycStatus] = useState<string>(
    localStorage.getItem('flyora_kyc_status') || 'NOT_SUBMITTED'
  );

  useEffect(() => {
    const syncProfile = () => {
      setUserName(localStorage.getItem('flyora_user_name') || 'User Account');
      setUserEmail(localStorage.getItem('flyora_user_email') || 'user@flyorago.com');
      setUserAvatar(localStorage.getItem('flyora_user_avatar') || '');
      setUserRole(localStorage.getItem('flyora_user_role') || '');
      setKycStatus(localStorage.getItem('flyora_kyc_status') || 'NOT_SUBMITTED');
    };

    const userId = localStorage.getItem('flyora_user_id');
    if (userId && userId !== 'undefined' && userId !== 'null') {
      apiFetch(`/api/kyc/status/${userId}`)
        .then((res) => {
          if (res.status === 'success' && res.data) {
            setKycStatus(res.data.status);
            localStorage.setItem('flyora_kyc_status', res.data.status);
          }
        })
        .catch((err) => console.error('Error fetching KYC status in profile dropdown:', err));
    }

    window.addEventListener('storage', syncProfile);
    window.addEventListener('profileUpdated', syncProfile);
    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('profileUpdated', syncProfile);
    };
  }, []);

  useEffect(() => {
    if (propName) setUserName(propName);
    if (propEmail) setUserEmail(propEmail);
    if (propAvatar !== undefined) setUserAvatar(propAvatar);
  }, [propName, propEmail, propAvatar]);

  // Resolve Real Display Name: Prefer propName > userName state > localStorage flyora_user_name > email prefix
  const rawEmail = userEmail || localStorage.getItem('flyora_user_email') || '';
  const emailPrefix = rawEmail.includes('@') ? rawEmail.split('@')[0] : rawEmail;
  const resolvedName = (userName && userName !== 'User Account' && userName !== 'Flyora User')
    ? userName
    : (localStorage.getItem('flyora_user_name') || emailPrefix || 'User');

  const displayName = resolvedName.trim();

  // Compute clean 1 or 2 letter Initials from the REAL Name (e.g. "Akash Sharma" -> "AS", "Akash" -> "A")
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0] ? nameParts[0].slice(0, 2).toUpperCase() : 'U');

  // Compute Role Subtitle dynamically (No longer hardcoded as "Admin User")
  const normalizedRole = (userRole || localStorage.getItem('flyora_user_role') || '').toLowerCase();
  const roleDisplay = normalizedRole === 'admin'
    ? 'Admin'
    : normalizedRole === 'traveler'
      ? 'Traveler'
      : normalizedRole === 'sender'
        ? 'Sender'
        : (kycStatus === 'APPROVED' ? 'Verified Member' : 'Member');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getKycBadge = () => {
    const status = (kycStatus || '').toUpperCase();
    if (status === 'APPROVED' || status === 'VERIFIED') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded-full">
          <BadgeCheck size={11} /> Approved
        </span>
      );
    }
    if (status === 'PENDING' || status === 'UNDER_REVIEW') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full animate-pulse">
          <Clock size={11} /> Under Review
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/25 px-2 py-0.5 rounded-full">
          <ShieldAlert size={11} /> Rejected
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-slate-500/15 text-slate-500 border border-slate-300 px-2 py-0.5 rounded-full">
        Not Verified
      </span>
    );
  };

  const handleGoHome = () => {
    setIsOpen(false);
    navigate('/');
  };

  const initiateLogout = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('flyora_user_id');
    localStorage.removeItem('flyora_user_name');
    localStorage.removeItem('flyora_user_role');
    localStorage.removeItem('flyora_user_email');
    localStorage.removeItem('flyora_access_token');
    localStorage.removeItem('flyora_refresh_token');
    localStorage.removeItem('flyora_kyc_status');
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Trigger Profile Pill */}
      {compact ? (
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-flyora-teal to-teal-600 text-white flex items-center justify-center text-xs font-black shadow-sm border border-teal-200 focus:outline-none hover:opacity-90 transition-opacity"
          aria-label="User Profile Menu"
        >
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/60 transition-all cursor-pointer focus:outline-none select-none"
        >
          {userAvatar ? (
            <img src={userAvatar} alt={displayName} className="w-8 h-8 rounded-full object-cover border border-teal-200 shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-flyora-teal to-teal-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
              {initials}
            </div>
          )}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-extrabold text-slate-800 leading-tight max-w-[130px] truncate" title={displayName}>
              {displayName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              {roleDisplay} <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </span>
          </div>
        </button>
      )}

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200/80 shadow-2xl z-50 p-2 transform transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {/* Header User Details */}
          <div className="px-3 py-3 border-b border-slate-100 mb-1">
            <p className="text-xs font-black text-slate-900 truncate" title={displayName}>{displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
          </div>

          {/* Menu Actions */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handleGoHome}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-flyora-teal hover:bg-teal-50/80 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Home size={14} />
              </div>
              <span>Go to Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-flyora-teal hover:bg-teal-50/80 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <User size={14} />
              </div>
              <span>My Profile</span>
            </button>

            {/* KYC Status Option - Navigates to /kyc */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/kyc');
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-flyora-teal hover:bg-teal-50/80 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <ShieldCheck size={14} />
                </div>
                <span>KYC Status</span>
              </div>
              {getKycBadge()}
            </button>

            <div className="h-px bg-slate-100 my-1" />

            <button
              type="button"
              onClick={initiateLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100/80 text-rose-600 flex items-center justify-center">
                <LogOut size={14} />
              </div>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Simple Clean Logout Confirmation Modal (Portal) ─── */}
      {showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with soft blur */}
          <div 
            className="absolute inset-0 bg-[#0A1628]/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          
          {/* Simple Clean Modal without top strip/patti */}
          <div className="relative bg-white w-full max-w-sm rounded-[24px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(10,22,40,0.18)] border border-slate-200/90 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            
            {/* Soft Brand Icon */}
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-flyora-teal mb-3.5">
              <LogOut size={22} strokeWidth={2.2} />
            </div>
            
            {/* Text Content */}
            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">Confirm Log Out</h3>
            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
              Are you sure you want to sign out of FlyoraGo? You can sign back in at any time.
            </p>
            
            {/* Action Buttons */}
            <div className="flex w-full gap-2.5">
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-flyora-teal hover:bg-[#0F766E] text-white shadow-md shadow-teal-500/20 transition flex items-center justify-center"
                onClick={confirmLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
