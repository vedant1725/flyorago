import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, ChevronDown, User, Settings, Wallet, ShieldCheck } from 'lucide-react';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userName, setUserName] = useState(propName || localStorage.getItem('flyora_user_name') || 'User Account');
  const [userEmail, setUserEmail] = useState(propEmail || localStorage.getItem('flyora_user_email') || 'user@flyorago.com');
  const [userAvatar, setUserAvatar] = useState(propAvatar || localStorage.getItem('flyora_user_avatar') || '');

  useEffect(() => {
    const syncProfile = () => {
      setUserName(localStorage.getItem('flyora_user_name') || 'User Account');
      setUserEmail(localStorage.getItem('flyora_user_email') || 'user@flyorago.com');
      setUserAvatar(localStorage.getItem('flyora_user_avatar') || '');
    };

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

  const initials = (userName || 'User')
    .trim()
    .split(/\s+/)
    .map(n => (n ? n[0] : ''))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

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

  const handleGoHome = () => {
    setIsOpen(false);
    navigate('/');
  };

  const handleLogout = () => {
    setIsOpen(false);
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
          className="flex items-center gap-3 pl-2 pr-4 py-1.5 border border-slate-200 rounded-full cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all bg-white shadow-sm focus:outline-none"
        >
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover border border-teal-200 shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-flyora-teal to-teal-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
              {initials}
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold text-slate-800 leading-tight">{userName}</span>
            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
              Account Options <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </span>
          </div>
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200/80 shadow-2xl z-50 p-2 transform transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {/* Header User Details */}
          <div className="px-3 py-3 border-b border-slate-100 mb-1">
            <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
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
              <span>Go to Home (Landing Page)</span>
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

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/wallet');
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-flyora-teal hover:bg-teal-50/80 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Wallet size={14} />
              </div>
              <span>My Wallet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-flyora-teal hover:bg-teal-50/80 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Settings size={14} />
              </div>
              <span>Settings</span>
            </button>

            <div className="h-px bg-slate-100 my-1" />

            <button
              type="button"
              onClick={handleLogout}
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
    </div>
  );
};
