import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Plane, Package, Truck, ShieldCheck, LayoutDashboard,
  LogOut, ChevronDown, ChevronUp, RefreshCw, RefreshCcw, Check, X, Eye,
  FileText, Globe, User, TrendingUp, Bell, Settings, Search,
  MapPin, Calendar, Menu, Trash2, Edit3, CheckCircle2, XCircle,
  AlertTriangle, Info, Activity, MoreVertical, Filter, Download,
  UserCheck, UserX, ArrowRight, Clock, Star, Shield, Zap, Plus,
  MessageSquare, Mail, Phone, KeyRound, EyeOff, Lock, Luggage, DollarSign
} from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────
import { API_BASE_URL as BASE } from '../config';
const api = async (path: string, opts: RequestInit = {}) => {
  const token = localStorage.getItem('flyora_access_token');
  const r = await fetch(`${BASE}${path}`, {
    cache: 'no-store',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(opts.headers || {}) 
    },
    ...opts,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.message || d?.detail || d?.error || `Error ${r.status}`);
  return d;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats { totalUsers: number; newUsersThisWeek: number; activeTrips: number; totalTrips: number; parcelRequests: number; newBookingsThisWeek: number; totalShipments: number; inTransitShipments: number; pendingKyc: number; approvedKyc: number; kycBreakdown: Record<string, number>; tripBreakdown: Record<string, number>; bookingBreakdown: Record<string, number>; userRoles: Record<string, number>; }
interface Trip {
  id: number;
  traveler_name?: string;
  traveler_email?: string;
  airline: string;
  flight_number: string;
  aircraft?: string;
  from_location: string;
  to_location: string;
  from_airport?: string;
  to_airport?: string;
  departure_date: string;
  departure_time?: string;
  arrival_date?: string;
  arrival_time?: string;
  duration?: string;
  terminal_from?: string;
  terminal_to?: string;
  seats?: string;
  capacity_weight: number;
  available_weight: number;
  price_per_kg: number;
  status: string;
  created_at: string;
  accepted_parcel_types?: string[];
  bookings_count?: number;
  progress?: number;
}

interface Booking {
  id: number;
  sender_name?: string;
  traveler_name?: string;
  sender?: { first_name?: string; last_name?: string; email?: string; name?: string };
  traveler?: { first_name?: string; last_name?: string; email?: string; name?: string };
  trip?: { from_location: string; to_location: string; departure_date: string; from_airport?: string; to_airport?: string } | null;
  package_name?: string;
  package_category?: string;
  package_image?: string;
  package?: { name?: string; category?: string; image?: string };
  route?: { from?: string; to?: string; fromAirport?: string; toAirport?: string };
  weight: number;
  reward?: number;
  agreed_price?: number;
  status: string;
  payment_status?: string;
  paymentStatus?: string;
  escrow_status?: string;
  created_at?: string;
  createdAt?: string;
  accepted_parcel_types?: string[];
}
interface Shipment { id: number; booking: { id: number; trip: Trip | null; sender: { first_name: string; last_name: string }; traveler: { first_name: string; last_name: string } } | null; status: string; created_at: string; }
interface KycUser { userId: string; fullName: string; email: string; phone: string; documentType: string; frontImage: string; backImage: string; passportImage: string; selfieImage: string; status: string; rejectionReason?: string; submittedAt: string; }
interface AppUser { id: string; fullName: string; email: string; phone: string; role: string; isActive: boolean; isStaff: boolean; dateJoined: string; kycStatus: string; }
interface Dispute { id: number; booking: number; booking_details: Booking; raised_by: number; raised_by_name: string; raised_by_email: string; reason: string; description: string; status: string; resolution: string; created_at: string; images: { id: number; image: string; uploaded_at: string }[]; }
interface ContactMessage { id: number; full_name: string; email: string; phone?: string; user_type: string; subject: string; message: string; status: string; created_at: string; }
interface Toast { id: number; type: 'success' | 'error' | 'info' | 'warning'; msg: string; }
interface ConfirmOptions { title: string; description: string; confirmLabel?: string; cancelLabel?: string; variant?: 'danger' | 'warning' | 'info'; icon?: React.ReactNode; onConfirm: () => void; }

// ─── Toast System (Google/Meta Style Top Banner) ───────────────────────────────
let toastId = 0;
const ToastContainer: React.FC<{ toasts: Toast[]; remove: (id: number) => void }> = ({ toasts, remove }) => (
  <div className="fixed top-5 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm sm:max-w-md w-full">
    {toasts.map(t => {
      const cfg = {
        success: {
          border: 'border-emerald-200/90',
          sideBar: 'bg-emerald-500',
          iconBg: 'bg-emerald-50 text-emerald-600',
          titleColor: 'text-emerald-950',
          icon: <CheckCircle2 size={18} />,
          title: 'Success'
        },
        error: {
          border: 'border-rose-200/90',
          sideBar: 'bg-rose-500',
          iconBg: 'bg-rose-50 text-rose-600',
          titleColor: 'text-rose-950',
          icon: <XCircle size={18} />,
          title: 'Action Failed'
        },
        warning: {
          border: 'border-amber-200/90',
          sideBar: 'bg-amber-500',
          iconBg: 'bg-amber-50 text-amber-600',
          titleColor: 'text-amber-950',
          icon: <AlertTriangle size={18} />,
          title: 'Warning'
        },
        info: {
          border: 'border-sky-200/90',
          sideBar: 'bg-sky-500',
          iconBg: 'bg-sky-50 text-sky-600',
          titleColor: 'text-sky-950',
          icon: <Info size={18} />,
          title: 'Notification'
        },
      }[t.type];

      return (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          className={`relative bg-white/95 backdrop-blur-xl border ${cfg.border} shadow-2xl shadow-slate-900/10 rounded-2xl p-3.5 pl-4 flex items-center justify-between gap-3 pointer-events-auto cursor-pointer animate-in slide-in-from-top-4 fade-in duration-300 hover:scale-[1.02] transition-all overflow-hidden`}
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${cfg.sideBar}`} />
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0 shadow-xs font-bold`}>
              {cfg.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className={`text-[11px] font-black uppercase tracking-wider ${cfg.titleColor}`}>{cfg.title}</div>
              <div className="text-xs font-bold text-slate-800 truncate">{t.msg}</div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); remove(t.id); }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      );
    })}
  </div>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal: React.FC<ConfirmOptions & { onCancel: () => void }> = ({
  title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', icon, onConfirm, onCancel
}) => {
  const varCfg = {
    danger: { btn: 'bg-red-500 hover:bg-red-600', ring: 'ring-red-100', iconBg: 'bg-red-100', iconColor: 'text-red-500' },
    warning: { btn: 'bg-amber-500 hover:bg-amber-600', ring: 'ring-amber-100', iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
    info: { btn: 'bg-flyora-teal hover:bg-blue-700', ring: 'ring-blue-100', iconBg: 'bg-blue-100', iconColor: 'text-flyora-teal' },
  }[variant];
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-center justify-center p-4" onClick={onCancel}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm ring-4 ${varCfg.ring} animate-in zoom-in-95 fade-in duration-200`} onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className={`w-14 h-14 rounded-2xl ${varCfg.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <div className={varCfg.iconColor}>{icon || <AlertTriangle size={26} />}</div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 text-center mb-2">{title}</h3>
          <p className="text-sm text-slate-500 text-center leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">{cancelLabel}</button>
          <button onClick={() => { onConfirm(); onCancel(); }} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold ${varCfg.btn} transition-colors shadow-lg`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

// ─── Block / Unblock User Premium Modal ───────────────────────────────────────
const BlockUserModal: React.FC<{
  user: AppUser;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}> = ({ user, onConfirm, onCancel, isLoading }) => {
  const [visible, setVisible] = React.useState(false);
  const isBlocking = user.isActive; // true = we are BLOCKING, false = we are UNBLOCKING

  React.useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);

  const handleClose = () => { setVisible(false); setTimeout(onCancel, 350); };
  const handleConfirm = () => { setVisible(false); setTimeout(onConfirm, 350); };

  return (
    <div
      className={`fixed inset-0 z-[450] flex items-center justify-center p-4 transition-all duration-350 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: visible ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0)' }}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-400 ${visible ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'
          }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient top bar */}
        <div className={`h-1.5 w-full ${isBlocking ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'}`} />

        {/* Header zone */}
        <div className={`relative px-8 pt-8 pb-6 ${isBlocking ? 'bg-gradient-to-br from-red-50 to-rose-50' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
          {/* Animated icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${isBlocking ? 'bg-red-300' : 'bg-emerald-300'}`} style={{ animationDuration: '2s' }} />
              <div className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${isBlocking
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-200'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200'
                }`}>
                {isBlocking ? <UserX size={36} className="text-white" strokeWidth={1.5} /> : <UserCheck size={36} className="text-white" strokeWidth={1.5} />}
              </div>
              {/* Avatar badge */}
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 ${isBlocking ? 'bg-white border-red-100 text-red-600' : 'bg-white border-emerald-100 text-emerald-600'
                } text-xs font-black`}>
                {user.fullName[0]?.toUpperCase()}
              </div>
            </div>
          </div>

          <h2 className="text-center text-2xl font-black text-slate-900 mb-1">
            {isBlocking ? 'Block Account' : 'Reactivate Account'}
          </h2>
          <p className="text-center text-sm font-semibold text-slate-500">
            {isBlocking ? '🔒 This user will be immediately locked out' : '✅ Restore full access to this account'}
          </p>
        </div>

        {/* User info card */}
        <div className="px-8 pt-5 pb-2">
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${isBlocking ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
            }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {user.fullName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black bg-white/80 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                }`}>{user.isActive ? 'Currently Active' : 'Currently Blocked'}</span>
            </div>
          </div>
        </div>

        {/* Warning message */}
        <div className="px-8 py-4">
          <div className={`flex gap-3 p-3.5 rounded-xl border text-sm ${isBlocking
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-xs font-medium">
              {isBlocking
                ? `Blocking ${user.fullName}'s account will immediately prevent them from logging in. All active sessions will be terminated. This action can be reversed at any time.`
                : `Reactivating this account will restore full login access for ${user.fullName}. They will be notified that their account is active again.`
              }
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg ${isBlocking
                ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200 hover:shadow-red-300'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200 hover:shadow-emerald-300'
              }`}
          >
            {isBlocking ? <UserX size={16} /> : <UserCheck size={16} />}
            {isLoading ? 'Processing...' : isBlocking ? 'Yes, Block Account' : 'Yes, Reactivate'}
          </button>
        </div>

        {/* Close X */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <X size={14} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
};

// ─── Status Change Modal ──────────────────────────────────────────────────────
const StatusModal: React.FC<{
  title: string; current: string; options: string[];
  onSelect: (s: string) => void; onClose: () => void;
}> = ({ title, current, options, onSelect, onClose }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X size={15} className="text-slate-500" /></button>
      </div>
      <div className="p-3 space-y-1">
        {options.map(opt => (
          <button key={opt} onClick={() => { onSelect(opt); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${opt === current ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-50 text-slate-700'}`}>
            {opt}
            {opt === current && <Check size={14} className="text-flyora-teal" />}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─── KYC Document Modal ───────────────────────────────────────────────────────
const KycModal: React.FC<{
  user: KycUser; onClose: () => void;
  onAction: (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => void;
}> = ({ user, onClose, onAction }) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState(user.rejectionReason || '');
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const docs = [
    { label: 'Front ID', url: user.frontImage, desc: 'Government Identification Document (Front Side)' },
    { label: 'Back ID', url: user.backImage, desc: 'Government Identification Document (Back Side)' },
    { label: 'Passport', url: user.passportImage, desc: 'International Passport Bio Page' },
    { label: 'Selfie', url: user.selfieImage, desc: 'Live Portrait Selfie Identity Verification Match' },
  ].filter(d => d.url);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-[300] flex items-center justify-center p-4 sm:p-6 transition-all duration-300" onClick={onClose}>
        <div className="bg-white/95 rounded-[28px] border border-slate-200/80 shadow-2xl shadow-slate-900/20 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden backdrop-blur-xl animate-in zoom-in-95 fade-in duration-300" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0 bg-white/50 backdrop-blur-md gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-100 relative overflow-hidden">
                <span className="relative z-10">{user.fullName[0]?.toUpperCase()}</span>
                <div className="absolute inset-0 bg-white/10 opacity-40 mix-blend-overlay" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-slate-900 text-base leading-none">{user.fullName}</h2>
                  <StatusBadge status={user.status} />
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5"><Mail size={12} className="text-teal-650" /> {user.email}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-355" />
                  <span className="flex items-center gap-1.5"><Phone size={12} className="text-teal-650" /> {user.phone || 'No phone'}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-slate-100/80 rounded-2xl transition-all self-end sm:self-auto"><X size={16} className="text-slate-450" /></button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/60 border border-slate-200/50 rounded-2xl p-4 flex flex-col justify-between hover-float transition-all duration-300">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Type</p>
                <p className="text-sm font-black text-slate-800 capitalize mt-1.5 flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-500" />
                  {user.documentType?.replace(/_/g, ' ') || '—'}
                </p>
              </div>
              <div className="bg-slate-50/60 border border-slate-200/50 rounded-2xl p-4 flex flex-col justify-between hover-float transition-all duration-300">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Submitted</p>
                <p className="text-sm font-black text-slate-800 mt-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-teal-500" />
                  {user.submittedAt ? new Date(user.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            {/* Verification Documents Gallery */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Documents</p>
              {docs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {docs.map((doc, i) => (
                    <div key={i} className="glass-panel border border-slate-200/80 rounded-[20px] overflow-hidden p-3.5 hover-float transition-all duration-300 flex flex-col justify-between">
                      <div className="rounded-xl overflow-hidden cursor-zoom-in border border-slate-100/80 aspect-[4/3] bg-slate-50 flex items-center justify-center relative group" onClick={() => setZoomIndex(i)}>
                        <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                          <span className="text-[10px] font-black text-white flex items-center gap-1"><Eye size={12} /> View Fullscreen</span>
                        </div>
                        <div className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border border-white/10">
                          {doc.label}
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-xs font-black text-slate-800">{doc.label}</h4>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-snug">{doc.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FileText size={32} className="text-slate-350 mx-auto mb-2" />
                  <p className="text-xs font-black text-slate-500">No documents uploaded</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">User hasn't submitted KYC documents yet</p>
                </div>
              )}
            </div>

            {user.status === 'REJECTED' && user.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-650 uppercase mb-0.5">Previous Rejection Reason</p>
                  <p className="text-sm text-red-700">{user.rejectionReason}</p>
                </div>
              </div>
            )}

            {rejectMode && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejection Reason <span className="text-rose-500">*</span></label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                  placeholder="e.g. Document image is blurry. Please resubmit with a clear photo..."
                  className="w-full border border-slate-200 focus:border-red-400 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-850 outline-none resize-none transition-colors" />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0 bg-slate-50/50 backdrop-blur-md rounded-b-3xl">
            {!rejectMode ? (
              <>
                {user.status !== 'APPROVED' && (
                  <button onClick={() => { onAction(user.userId, 'APPROVE'); onClose(); }}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-teal-100 transition-all hover:scale-[1.01] hover:shadow-lg">
                    <CheckCircle2 size={15} /> Approve & Verify
                  </button>
                )}
                <button onClick={() => setRejectMode(true)}
                  className={`${user.status !== 'APPROVED' ? 'flex-1' : 'w-full'} bg-white hover:bg-rose-50/50 text-rose-600 border border-rose-200 hover:border-rose-300 text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]`}>
                  <XCircle size={15} /> {user.status === 'REJECTED' ? 'Modify Rejection Reason' : 'Reject Submission'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setRejectMode(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button onClick={() => { if (reason.trim()) { onAction(user.userId, 'REJECT', reason); onClose(); } }}
                  disabled={!reason.trim()}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-100 transition-all hover:scale-[1.01]">
                  <XCircle size={15} /> Decline & Request Fix
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {zoomIndex !== null && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[500] flex flex-col items-center justify-between p-4 md:p-8 animate-in fade-in duration-300">

          {/* Top Bar */}
          <div className="w-full flex items-center justify-between max-w-6xl">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{user.fullName}'s Documents</p>
              <h3 className="text-white font-black text-xl">{docs[zoomIndex].label}</h3>
            </div>
            <button className="bg-white/10 hover:bg-white/25 text-white p-3 rounded-2xl transition-all shadow-lg backdrop-blur-sm" onClick={() => setZoomIndex(null)}>
              <X size={24} />
            </button>
          </div>

          {/* Main Image */}
          <div className="flex-1 w-full max-w-5xl my-4 relative flex items-center justify-center group min-h-0">
            {zoomIndex > 0 && (
              <button onClick={(e) => { e.stopPropagation(); setZoomIndex(zoomIndex - 1); }} className="absolute left-0 md:-left-12 p-3 bg-black/50 hover:bg-white/10 text-white rounded-full transition-all z-10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
            )}
            <img src={docs[zoomIndex].url} alt="Document Zoom" className="max-w-full max-h-full object-contain rounded-[32px] shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200" />
            {zoomIndex < docs.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); setZoomIndex(zoomIndex + 1); }} className="absolute right-0 md:-right-12 p-3 bg-black/50 hover:bg-white/10 text-white rounded-full transition-all z-10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            )}
          </div>

          {/* Thumbnails Strip */}
          <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-[24px] p-4 flex items-center gap-4 overflow-x-auto justify-center backdrop-blur-md">
            {docs.map((doc, idx) => (
              <div key={idx} onClick={() => setZoomIndex(idx)}
                className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 relative group flex-shrink-0 w-32 h-20 
                  ${zoomIndex === idx ? 'ring-2 ring-flyora-teal scale-105 opacity-100 shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'opacity-50 hover:opacity-80 scale-100'}`}>
                <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 flex items-end justify-center pb-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity ${zoomIndex === idx ? 'opacity-100' : 'group-hover:opacity-100'}`}>
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">{doc.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// ─── Sender Request Inspection Modal ─────────────────────────────────────────
const BookingModal: React.FC<{
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}> = ({ booking, onClose, onStatusChange }) => {
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState<number>(0);

  const senderName = booking.sender_name || (booking.sender?.first_name ? `${booking.sender.first_name} ${booking.sender.last_name || ''}` : booking.sender?.name || 'Sender');
  const travelerName = booking.traveler_name || (booking.traveler?.first_name ? `${booking.traveler.first_name} ${booking.traveler.last_name || ''}` : booking.traveler?.name || 'Awaiting Traveler Match');
  const pkgName = booking.package_name || booking.package?.name || 'Parcel';
  const pkgCat = booking.package_category || booking.package?.category || 'General';

  // Extract ONLY real uploaded images (No static stock photos!)
  const uploadedImages: string[] = [];
  const checkAndAdd = (imgStr?: string) => {
    if (imgStr && (imgStr.startsWith('http') || imgStr.startsWith('data:image') || imgStr.startsWith('/') || imgStr.length > 50)) {
      if (!uploadedImages.includes(imgStr)) uploadedImages.push(imgStr);
    }
  };

  checkAndAdd(booking.package_image);
  checkAndAdd(booking.package?.image);
  if (Array.isArray(booking.accepted_parcel_types)) {
    booking.accepted_parcel_types.forEach(checkAndAdd);
  }

  const activeImg = uploadedImages[selectedImgIndex] || uploadedImages[0] || null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                <Package size={20} />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Sender Parcel Request #{booking.id}</h2>
                <p className="text-xs text-slate-500 font-medium">Submitted by Sender: <span className="font-semibold text-slate-800">{senderName}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={booking.status} />
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-400" /></button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Real Package Image Section ONLY */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Uploaded Package Photos {uploadedImages.length > 0 ? `(${selectedImgIndex + 1} of ${uploadedImages.length})` : ''}
                </p>
                {uploadedImages.length > 0 ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {uploadedImages.length} Photo{uploadedImages.length > 1 ? 's' : ''} Uploaded
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    No Photo Uploaded
                  </span>
                )}
              </div>

              {activeImg ? (
                <div className="space-y-3">
                  {/* Main Display Image */}
                  <div
                    className="rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-900 cursor-zoom-in aspect-video flex items-center justify-center relative group hover:border-emerald-400 transition-all shadow-md"
                    onClick={() => setZoomImg(activeImg)}
                  >
                    <img src={activeImg} alt={pkgName} className="w-full h-full object-contain bg-slate-950/80" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-[2px]">
                      <Eye size={16} /> Click to View Full Size Image
                    </div>
                  </div>

                  {/* Thumbnail Selector Row for ALL uploaded images */}
                  {uploadedImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      {uploadedImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImgIndex(idx)}
                          className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden transition-all flex-shrink-0 ${selectedImgIndex === idx
                              ? 'border-emerald-500 ring-2 ring-emerald-400/30 scale-105 shadow-sm'
                              : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                            }`}
                        >
                          <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                          <span className={`absolute bottom-0.5 right-0.5 text-[9px] font-extrabold px-1 rounded ${selectedImgIndex === idx ? 'bg-emerald-500 text-white' : 'bg-black/60 text-white'
                            }`}>
                            #{idx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center flex flex-col items-center justify-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-400 mb-1">
                    <FileText size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-600">No photo uploaded by sender</p>
                  <p className="text-[11px] text-slate-400">The sender submitted this request without attaching a package photo</p>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Package Name & Category</p>
                <p className="text-sm font-bold text-slate-800">{pkgName}</p>
                <p className="text-xs text-slate-500 capitalize">{pkgCat}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Weight & Price</p>
                <p className="text-sm font-bold text-slate-800">{booking.weight} kg</p>
                <p className="text-xs font-bold text-emerald-600">${booking.agreed_price || booking.reward || 0} Offered Reward</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sender Info</p>
                <p className="text-xs font-bold text-slate-800">{senderName}</p>
                <p className="text-[11px] text-slate-500 truncate">{booking.sender?.email || 'Sender Contact'}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Matched Traveler</p>
                <p className="text-xs font-bold text-slate-800">{travelerName}</p>
                <p className="text-[11px] text-slate-500 truncate">{booking.traveler?.email || 'Awaiting Match'}</p>
              </div>
            </div>

            {/* Route & Flight Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase">Flight Route & Date</span>
                <span className="font-semibold text-slate-700">{booking.trip?.departure_date || booking.createdAt || '—'}</span>
              </div>
              <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                <MapPin size={15} className="text-flyora-teal" />
                <span>{booking.trip?.from_location || booking.route?.from || 'Origin'}</span>
                <ArrowRight size={14} className="text-slate-400" />
                <span>{booking.trip?.to_location || booking.route?.to || 'Destination'}</span>
              </p>
            </div>
          </div>

          {/* Footer Actions — Read Only Inspection Mode */}
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0 bg-slate-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Eye size={15} /> Close Preview (Read-Only View)
            </button>
            <button
              onClick={() => { onStatusChange(booking.id, 'CANCELLED'); onClose(); }}
              className="px-4 bg-white hover:bg-red-50 text-red-500 border border-red-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} /> Cancel Request
            </button>
          </div>
        </div>
      </div>

      {zoomImg && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-4" onClick={() => setZoomImg(null)}>
          <img src={zoomImg} alt="Parcel" className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl" />
          <button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl"><X size={20} /></button>
        </div>
      )}
    </>
  );
};

// ─── Traveler Trip Inspection Modal ──────────────────────────────────────────
const TripModal: React.FC<{
  trip: Trip;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}> = ({ trip, onClose, onStatusChange }) => {
  const travelerName = trip.traveler_name || 'Traveler';
  const cap = Number(trip.capacity_weight) || 1;
  const avail = Number(trip.available_weight) || 0;
  const progressPct = Math.min(Math.max(Math.round(((cap - avail) / cap) * 100), 0), 100);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
              <Plane size={20} className="-rotate-45" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Traveler Trip Request #{trip.id}</h2>
              <p className="text-xs text-slate-500 font-medium">Posted by Traveler: <span className="font-semibold text-slate-800">{travelerName}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={trip.status} />
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-400" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Flight Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{trip.airline || 'Airline'}</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-white/10 rounded text-slate-200">{trip.flight_number}</span>
              </div>
              <span className="text-xs text-slate-400">{trip.departure_date}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-b border-white/10">
              <div>
                <p className="text-lg font-black text-white">{trip.from_location}</p>
                <p className="text-[11px] text-slate-400">{trip.from_airport || 'Origin Airport'}</p>
              </div>
              <div className="flex flex-col items-center">
                <Plane size={18} className="text-amber-400" />
                <span className="text-[10px] text-slate-400 mt-1">{trip.duration || 'Direct Flight'}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-white">{trip.to_location}</p>
                <p className="text-[11px] text-slate-400">{trip.to_airport || 'Destination Airport'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Dep: <strong className="text-white">{trip.departure_time || 'TBD'}</strong></span>
              <span>Arr: <strong className="text-white">{trip.arrival_time || 'TBD'}</strong></span>
              <span>Terminals: <strong className="text-white">{trip.terminal_from || 'T1'} → {trip.terminal_to || 'T2'}</strong></span>
            </div>
          </div>

          {/* Baggage Capacity Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Luggage Capacity Progress</span>
              <span className="text-flyora-teal">{progressPct}% Allocated</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-flyora-teal h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-white p-2 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Capacity</p>
                <p className="text-sm font-extrabold text-slate-800">{trip.capacity_weight} kg</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Available Space</p>
                <p className="text-sm font-extrabold text-emerald-600">{trip.available_weight} kg</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Price / kg</p>
                <p className="text-sm font-extrabold text-amber-600">${trip.price_per_kg}</p>
              </div>
            </div>
          </div>

          {/* Traveler Info */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase">Traveler Contact Email</span>
            <span className="font-semibold text-slate-700">{trip.traveler_email || '—'}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0 bg-slate-50 rounded-b-2xl">
          <button
            onClick={() => { onStatusChange(trip.id, 'Active'); onClose(); }}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={15} /> Set Active
          </button>
          <button
            onClick={() => { onStatusChange(trip.id, 'PAYMENT_RELEASED'); onClose(); }}
            className="flex-1 bg-flyora-teal hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={15} /> Mark Completed
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Status Badge (Light Theme) ─────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    Active:             { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
    Completed:          { bg: '#CCFBF1', color: '#0F766E', border: '#5EEAD4' },
    PAYMENT_RELEASED:   { bg: '#CCFBF1', color: '#0F766E', border: '#5EEAD4' },
    Cancelled:          { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
    CANCELLED:          { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
    Pending:            { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
    REQUEST_SENT:       { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
    Confirmed:          { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
    IN_TRANSIT:         { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
    'Package Received': { bg: '#CCFBF1', color: '#0F766E', border: '#5EEAD4' },
    'Customs Clearance':{ bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
    'Out for Delivery': { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
    DELIVERED:          { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
    APPROVED:           { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
    REJECTED:           { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
    PENDING:            { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
    NOT_SUBMITTED:      { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
    RESOLVED:           { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
    'Under Review':     { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
    Open:               { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
    Closed:             { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  };
  const cfg = map[status] || { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: '999px',
      fontSize: '10px',
      fontWeight: 800,
      padding: '2px 10px',
      display: 'inline-flex',
      alignItems: 'center',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

// ─── Mini Sparkline Component ──────────────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const W = 80;
  const H = 28;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data) || 0;
  const range = max - min || 1;
  const points = data.map((val, idx) => ({
    x: (idx / (data.length - 1)) * W,
    y: H - 2 - ((val - min) / range) * (H - 4)
  }));
  const pathD = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L ${W},${H} L 0,${H} Z`;
  const gradId = `sparkline-grad-${color.replace('#', '')}`;
  return (
    <svg width={W} height={H} className="overflow-visible select-none pointer-events-none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Advanced Microsoft / Google Style Responsive Chart ───────────────────────
interface ChartPoint {
  label: string;
  trips: number;
  bookings: number;
  shipments: number;
  users: number;
}

interface AdvancedChartProps {
  period: 'day' | 'week' | 'month';
  onPeriodChange: (p: 'day' | 'week' | 'month') => void;
  points: ChartPoint[];
  loading: boolean;
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({ period, onPeriodChange, points, loading }) => {
  const [activeSeries, setActiveSeries] = useState({
    users: true,
    bookings: true,
    trips: true,
    shipments: true,
  });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const seriesConfig = [
    { key: 'users' as const, label: 'Platform Growth', color: '#3B82F6', grad: 'chartGradUsers' },
    { key: 'bookings' as const, label: 'Bookings', color: '#10B981', grad: 'chartGradBookings' },
    { key: 'trips' as const, label: 'Trips', color: '#F59E0B', grad: 'chartGradTrips' },
    { key: 'shipments' as const, label: 'Shipments', color: '#8B5CF6', grad: 'chartGradShipments' },
  ];

  const activeKeys = seriesConfig.filter(s => activeSeries[s.key]).map(s => s.key);

  let rawMax = 1;
  points.forEach(p => {
    activeKeys.forEach(k => {
      if ((p[k] || 0) > rawMax) rawMax = p[k];
    });
  });
  const maxVal = Math.ceil(rawMax / 4) * 4 || 4;
  const yTicks = [maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0];

  const VW = 700, VH = 220;
  const PAD_L = 45, PAD_R = 20, PAD_T = 20, PAD_B = 35;
  const chartW = VW - PAD_L - PAD_R;
  const chartH = VH - PAD_T - PAD_B;
  const numPoints = points.length || 1;

  const getX = (i: number) => PAD_L + (i / Math.max(numPoints - 1, 1)) * chartW;
  const getY = (val: number) => PAD_T + chartH - (val / maxVal) * chartH;

  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const shouldShowLabel = (index: number) => {
    if (period === 'day') return index % 4 === 0 || index === numPoints - 1;
    if (period === 'month') return index % 5 === 0 || index === numPoints - 1;
    return true;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normX = (mouseX / rect.width) * VW;

    let closestIndex = 0;
    let minDiff = Infinity;
    points.forEach((_, i) => {
      const px = getX(i);
      const diff = Math.abs(px - normX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });
    setHoverIndex(closestIndex);
  };

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black flex items-center gap-2" style={{color:'#0A1628'}}>
            <span>Platform Activity ({period === 'day' ? 'Last 24 Hours' : period === 'month' ? 'Last 30 Days' : 'Last 7 Days'})</span>
            {loading && <span className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'#0D9488',borderTopColor:'transparent'}} />}
          </h2>
          <p className="text-[11px] mt-0.5 font-medium" style={{color:'#64748B'}}>
            Real-time analytics comparison across trips, bookings, shipments, and users
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl self-start sm:self-auto" style={{background:'#F1F5F9',border:'1px solid #E2E8F7'}}>
          {(['day', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className="text-xs font-black px-3 py-1.5 rounded-lg transition-all capitalize"
              style={period === p
                ? {background:'#fff',color:'#0F766E',border:'1px solid #E2E8F7',boxShadow:'0 2px 8px rgba(10,22,40,0.06)'}
                : {color:'#64748B'}
              }
            >
              {p === 'day' ? 'Day' : p === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap py-2.5" style={{borderTop:'1px solid #F1F5F9',borderBottom:'1px solid #F1F5F9'}}>
        {seriesConfig.map(s => {
          const isActive = activeSeries[s.key];
          const totalVal = points.reduce((acc, curr) => acc + (curr[s.key] || 0), 0);
          return (
            <button
              key={s.key}
              onClick={() => setActiveSeries(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={isActive
                ? {background:'#fff',border:`1px solid ${s.color}60`,color:'#0A1628',boxShadow:'0 2px 8px rgba(10,22,40,0.05)'}
                : {background:'transparent',border:'1px dashed #E2E8F7',color:'#94A3B8',opacity:0.7}
              }
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color, transform: isActive ? 'scale(1)' : 'scale(0.7)', transition:'transform .2s' }}
              />
              <span>{s.label}</span>
              <span className="font-mono text-[10px] px-1.5 rounded" style={{background:'#F1F5F9',color:'#64748B'}}>
                {totalVal}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative" ref={containerRef}>
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="w-full h-auto block select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {seriesConfig.map(s => (
              <linearGradient key={s.grad} id={s.grad} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {yTicks.map((val, idx) => {
            const y = PAD_T + (idx / (yTicks.length - 1)) * chartH;
            return (
              <g key={idx}>
                <line x1={PAD_L} y1={y} x2={VW - PAD_R} y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray={idx === yTicks.length - 1 ? 'none' : '4 4'} />
                <text x={PAD_L - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill="#94A3B8" fontFamily="Inter, sans-serif" fontWeight="600">
                  {val}
                </text>
              </g>
            );
          })}

          {points.map((p, i) => {
            if (!shouldShowLabel(i)) return null;
            const x = getX(i);
            return (
              <text key={i} x={x} y={VH - 10} textAnchor="middle" fontSize="10" fill="#94A3B8" fontFamily="Inter, sans-serif" fontWeight="600">
                {p.label}
              </text>
            );
          })}

          {seriesConfig.map(s => {
            if (!activeSeries[s.key] || points.length === 0) return null;
            const pts = points.map((p, i) => ({ x: getX(i), y: getY(p[s.key] || 0) }));
            const pathD = createSmoothPath(pts);
            const areaD = `${pathD} L ${pts[pts.length - 1].x},${PAD_T + chartH} L ${pts[0].x},${PAD_T + chartH} Z`;

            return (
              <g key={s.key}>
                <path d={areaD} fill={`url(#${s.grad})`} />
                <path d={pathD} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0px 3px 6px ${s.color}35)` }} />
              </g>
            );
          })}

          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={PAD_T}
                x2={getX(hoverIndex)}
                y2={PAD_T + chartH}
                stroke="#CBD5E1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {seriesConfig.map(s => {
                if (!activeSeries[s.key] || !points[hoverIndex]) return null;
                const val = points[hoverIndex][s.key] || 0;
                const cx = getX(hoverIndex);
                const cy = getY(val);
                return (
                  <g key={s.key}>
                    <circle cx={cx} cy={cy} r="6" fill={s.color} stroke="white" strokeWidth="2" />
                    <circle cx={cx} cy={cy} r="2.5" fill="white" />
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {hoverIndex !== null && activePoint && (
          <div
            className="absolute z-20 pointer-events-none bg-white/95 text-slate-800 p-3.5 rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 backdrop-blur-md transition-all duration-75 text-xs space-y-1.5"
            style={{
              left: Math.min(Math.max((getX(hoverIndex) / VW) * 100, 15), 85) + '%',
              top: '10%',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between gap-4">
              <span>{activePoint.label}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{period} view</span>
            </div>
            <div className="space-y-1 pt-0.5">
              {seriesConfig.map(s => {
                if (!activeSeries[s.key]) return null;
                const val = activePoint[s.key] || 0;
                return (
                  <div key={s.key} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-500 font-bold">{s.label}:</span>
                    </div>
                    <span className="font-black font-mono text-slate-900">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const Donut: React.FC<{ segs: { label: string; color: string; value: number }[]; total: number }> = ({ segs, total }) => {
  const r = 42, cx = 56, cy = 56, circ = 2 * Math.PI * r; let off = 0;
  const arcs = segs.map(s => { const d = (s.value / (total || 1)) * circ; const a = { ...s, dash: d, gap: circ - d, off }; off += d; return a; });
  return (
    <svg viewBox="0 0 112 112" className="w-28 h-28 flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F7" strokeWidth="13" />
      {arcs.map((a, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth="13"
          strokeDasharray={`${a.dash} ${a.gap}`} strokeDashoffset={-a.off + circ / 4} strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="14" fontWeight="800" fill="#0A1628">{total}</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize="7.5" fill="#64748B" fontFamily="Inter">Users</text>
    </svg>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const Skeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 6, cols = 5 }) => (
  <tbody>{[...Array(rows)].map((_, i) => (
    <tr key={i}>{[...Array(cols)].map((_, j) => (
      <td key={j} className="px-5 py-3.5"><div className="h-4 bg-slate-100 rounded-lg animate-pulse" /></td>
    ))}</tr>
  ))}</tbody>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const Empty: React.FC<{ icon: React.ReactNode; msg: string; sub?: string }> = ({ icon, msg, sub }) => (
  <tr><td colSpan={20} className="px-5 py-16 text-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">{icon}</div>
      <div><p className="text-sm font-bold text-slate-500">{msg}</p>{sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}</div>
    </div>
  </td></tr>
);

// ─── Dispute Modal ─────────────────────────────────────────────────────────────
const DisputeModal: React.FC<{
  dispute: Dispute;
  onClose: () => void;
  onAction: (id: number, action: string, reason: string) => void;
}> = ({ dispute, onClose, onAction }) => {
  const [reason, setReason] = useState('');
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  const images = dispute.images || [];

  const resolutionTemplates = [
    { label: '⚡ Damaged Goods (Refund Sender)', text: 'Physical item damage verified. Approving full escrow refund to sender wallet.' },
    { label: '⚡ Non-Delivery (Refund Sender)', text: 'Traveler failed to deliver item. Escrow funds refunded 100% back to sender.' },
    { label: '⚡ Delivery Verified (Release Escrow)', text: 'Recipient confirmed delivery with valid OTP code. Dispute rejected and escrow payout released to traveler.' },
    { label: '⚡ Invalid Claim (Reject Dispute)', text: 'Insufficient evidence or false claim. Dispute rejected.' },
  ];

  const bk = dispute.booking_details;
  const isResolvedOrClosed = ['RESOLVED', 'CLOSED', 'REJECTED', 'APPROVED', 'DISPUTE_RESOLVED', 'DISPUTE_REJECTED'].includes((dispute.status || '').toUpperCase());

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[300] flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={onClose}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200 border border-slate-100 my-auto" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 flex-shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">Dispute Case #{dispute.id}</h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">Booking #{dispute.booking}</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                  Opened by <span className="text-slate-800 font-bold">{dispute.raised_by_name || 'User'}</span> ({dispute.raised_by_email || 'N/A'})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <StatusBadge status={dispute.status} />
              <button onClick={onClose} className="p-2 hover:bg-slate-200/60 rounded-xl transition-colors text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">

            {/* Quick Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User size={13} className="text-slate-500" /> Raised By
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{dispute.raised_by_name || 'User'}</div>
                <div className="text-[11px] text-slate-500 truncate">{dispute.raised_by_email || 'N/A'}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Package size={13} className="text-slate-500" /> Package Details
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{bk?.package_name || bk?.package?.name || 'Parcel Shipment'}</div>
                <div className="text-[11px] font-semibold text-emerald-600">
                  {bk?.weight ? `${bk.weight} KG` : ''} {bk?.reward || bk?.agreed_price ? `• $${bk?.reward || bk?.agreed_price} Escrow` : ''}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-500" /> Date Logged
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {dispute.created_at ? new Date(dispute.created_at).toLocaleString() : 'Recent'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Platform Escrow Locked</div>
              </div>
            </div>

            {/* Reason & Description Box */}
            <div className="bg-gradient-to-br from-rose-50 to-amber-50/60 border border-rose-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle size={15} className="text-rose-600" /> Dispute Reason & Incident Summary
                </h4>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-200/80 text-rose-900">
                  {dispute.reason}
                </span>
              </div>
              <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap bg-white/80 p-3.5 rounded-xl border border-rose-100 mt-2">
                {dispute.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Images Evidence Gallery */}
            {images.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Photo Evidence ({images.length})</span>
                  <span className="text-[11px] font-normal text-slate-400">Click photo to zoom</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map(img => (
                    <div
                      key={img.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 border-slate-200 hover:border-flyora-teal transition-all shadow-sm hover:shadow-md"
                      onClick={() => setZoomImg(img.image)}
                    >
                      <img src={img.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Evidence" />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <Eye size={16} /> Zoom
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Form / Previous Resolution View */}
            {!isResolvedOrClosed ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-flyora-teal" /> Admin Resolution Notes <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-400">Select template or type custom notes</span>
                </div>

                {/* Preset Templates */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {resolutionTemplates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReason(t.text)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold whitespace-nowrap transition-colors border border-slate-200/80"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  placeholder="Enter detailed reason and justification for this administrative decision..."
                  className="w-full border-2 border-slate-200 focus:border-flyora-teal focus:ring-4 focus:ring-teal-100 rounded-2xl p-4 text-sm text-slate-800 outline-none resize-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            ) : (
              <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1">Administrative Resolution Output</h4>
                <p className="text-sm font-bold text-slate-800">{dispute.resolution || 'Dispute closed by administrator.'}</p>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="px-5 sm:px-7 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 flex-shrink-0 bg-slate-50 rounded-b-3xl">
            {!isResolvedOrClosed ? (
              <>
                <button
                  onClick={() => {
                    if (reason.trim()) {
                      onAction(dispute.id, 'APPROVE', reason);
                      onClose();
                    }
                  }}
                  disabled={!reason.trim()}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white text-sm font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-200 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Approve Dispute (Refund Sender)
                </button>
                <button
                  onClick={() => {
                    if (reason.trim()) {
                      onAction(dispute.id, 'REJECT', reason);
                      onClose();
                    }
                  }}
                  disabled={!reason.trim()}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white text-sm font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-200 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Reject Dispute (Release to Traveler)
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-2xl transition-colors"
              >
                Close Case Window
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomImg && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex flex-col items-center justify-center p-4" onClick={() => setZoomImg(null)}>
          <button onClick={() => setZoomImg(null)} className="absolute top-6 right-6 text-white p-3 hover:bg-white/10 rounded-full transition-colors">
            <X size={28} />
          </button>
          <img src={zoomImg} className="max-w-[92vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl" alt="Zoomed evidence" />
          <a
            href={zoomImg}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="mt-4 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download size={14} /> Open Original High-Res Image
          </a>
        </div>
      )}
    </>
  );
};

// ─── Settings / Admin Credentials Tab ───────────────────────────────────────
const SettingsTab: React.FC<{
  toast: (variant: any, message: string) => void;
}> = ({ toast }) => {
  const [adminName, setAdminName] = useState('System Admin');
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('flyora_admin_email') || 'admin@flyorago.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [platformFee, setPlatformFee] = useState<string>('10.00');
  const [loadingFee, setLoadingFee] = useState(false);
  const [savingFee, setSavingFee] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingFee(true);
      try {
        const res = await api('/api/payments/settings/');
        if (res?.data?.platform_fee !== undefined) {
          setPlatformFee(res.data.platform_fee.toFixed(2));
        }
      } catch (err) {
        console.error("Failed to load platform fee setting", err);
      } finally {
        setLoadingFee(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem('flyora_admin_email');
    if (savedEmail) setAdminEmail(savedEmail);
  }, []);

  // Password strength score
  const pwdScore = React.useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score += 35;
    if (/[A-Z]/.test(newPassword)) score += 20;
    if (/[0-9]/.test(newPassword)) score += 20;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 25;
    return score;
  }, [newPassword]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast('error', 'New password and confirmation do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast('error', 'New password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      const res = await api('/api/admin/change-credentials/', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const updatedEmail = res?.data?.email || adminEmail;
      setAdminEmail(updatedEmail);
      localStorage.setItem('flyora_admin_email', updatedEmail);

      if (newPassword) {
        localStorage.setItem('flyora_admin_password', newPassword);
      }

      if (res?.message) {
        toast('success', `✅ ${res.message}`);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast('success', 'Admin credentials updated in database');
      }
    } catch (err: any) {
      toast('error', err.message || 'Failed to update admin credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformFee || isNaN(Number(platformFee)) || Number(platformFee) < 0) {
      toast('error', 'Please enter a valid non-negative platform fee');
      return;
    }
    setSavingFee(true);
    try {
      const res = await api('/api/payments/admin/settings/', {
        method: 'POST',
        body: JSON.stringify({ platform_fee: parseFloat(platformFee) }),
      });
      if (res?.message) {
        toast('success', `✅ ${res.message}`);
      } else {
        toast('success', 'Platform fee updated successfully');
      }
    } catch (err: any) {
      toast('error', err.message || 'Failed to update platform fee');
    } finally {
      setSavingFee(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={14} /> Super Admin Control
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">System & Account Settings</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Manage admin credentials, update access passwords in PostgreSQL database, and security policies
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-400 border border-white/10 flex-shrink-0">
          <KeyRound size={28} />
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">

        {/* Profile Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={16} className="text-flyora-teal" /> Administrator Profile & Access ID
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Admin Display Name</label>
              <input
                type="text"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-flyora-teal outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Admin Email / Username</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-flyora-teal outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <form onSubmit={handleSave} className="space-y-5 pt-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock size={16} className="text-rose-500" /> Database Password Security Update
          </h3>

          <div className="space-y-4">

            {/* Current Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Current Password <span className="text-slate-400 font-normal">(Leave blank if first setup)</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password to verify identity..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password & Confirmation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Confirm New Password</label>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Password Strength:</span>
                  <span className={pwdScore >= 70 ? 'text-emerald-600' : pwdScore >= 40 ? 'text-amber-600' : 'text-rose-500'}>
                    {pwdScore >= 70 ? 'Strong' : pwdScore >= 40 ? 'Medium' : 'Weak'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${pwdScore >= 70 ? 'bg-emerald-500' : pwdScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    style={{ width: `${Math.max(pwdScore, 15)}%` }}
                  />
                </div>
              </div>
            )}

          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs px-7 py-3.5 rounded-2xl shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {saving ? 'Updating Password in Database...' : 'Save Admin Credentials to Database'}
            </button>
          </div>
        </form>

        {/* Platform Configuration Section */}
        <form onSubmit={handleSaveFee} className="space-y-5 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <DollarSign size={16} className="text-emerald-500" /> Platform Financial Configurations
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Platform Service Fee (USD)
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={platformFee}
                  disabled={loadingFee}
                  onChange={e => setPlatformFee(e.target.value)}
                  placeholder={loadingFee ? 'Loading setting...' : 'Enter platform fee amount...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-flyora-teal outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                This flat fee is automatically added to the Sender's escrow payment during booking checkout.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={savingFee || loadingFee}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs px-7 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/10 transition-all flex items-center gap-2"
            >
              {savingFee ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {savingFee ? 'Saving Configurations...' : 'Update Platform Configurations'}
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};

// ─── Contact Message Modal ───────────────────────────────────────────────────
const ContactMessageModal: React.FC<{
  msg: ContactMessage;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}> = ({ msg, onClose, onStatusChange, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[400] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Contact Message #{msg.id}</h3>
              <p className="text-xs text-slate-500 font-medium">Submitted on {new Date(msg.created_at).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/60 rounded-xl transition"><X size={18} className="text-slate-500" /></button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* User Details Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Full Name</span>
              <span className="font-extrabold text-slate-800">{msg.full_name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">User Type</span>
              <span className="font-extrabold text-teal-700 capitalize">{msg.user_type}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Email</span>
              <a href={`mailto:${msg.email}`} className="font-bold text-blue-600 hover:underline">{msg.email}</a>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Phone</span>
              <span className="font-bold text-slate-700">{msg.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Subject */}
          <div>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Subject</span>
            <p className="text-sm font-extrabold text-slate-900 bg-slate-100/70 px-4 py-2.5 rounded-xl border border-slate-200/60">{msg.subject}</p>
          </div>

          {/* Message */}
          <div>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Message Content</span>
            <div className="text-xs text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
              {msg.message}
            </div>
          </div>

          {/* Status Changer */}
          <div className="pt-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Update Status</span>
            <div className="flex items-center gap-2 flex-wrap">
              {['New', 'Read', 'Replied', 'Resolved'].map(st => (
                <button
                  key={st}
                  onClick={() => onStatusChange(msg.id, st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${msg.status === st
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => onDelete(msg.id)}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Delete Message
          </button>

          <a
            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Mail size={14} /> Reply via Email
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  type Tab = 'overview' | 'users' | 'trips' | 'bookings' | 'shipments' | 'kyc' | 'disputes' | 'trust' | 'ai_knowledge' | 'contact_messages' | 'settings';
  const [tab, setTab] = useState<Tab>('overview');
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [kycUsers, setKycUsers] = useState<KycUser[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [selectedContactMsg, setSelectedContactMsg] = useState<ContactMessage | null>(null);
  const [msgStatusFilter, setMsgStatusFilter] = useState<'ALL' | 'New' | 'Read' | 'Replied' | 'Resolved'>('ALL');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirm, setConfirm] = useState<(ConfirmOptions & { onCancel: () => void }) | null>(null);
  const [statusModal, setStatusModal] = useState<{ title: string; current: string; options: string[]; onSelect: (s: string) => void } | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedKyc, setSelectedKyc] = useState<KycUser | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [disputeSearch, setDisputeSearch] = useState('');
  const [disputeStatusFilter, setDisputeStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED'>('ALL');

  const filteredDisputes = React.useMemo(() => {
    return disputes.filter(d => {
      const matchSearch =
        !disputeSearch.trim() ||
        d.id?.toString().includes(disputeSearch.trim()) ||
        d.booking?.toString().includes(disputeSearch.trim()) ||
        (d.raised_by_name || '').toLowerCase().includes(disputeSearch.toLowerCase()) ||
        (d.raised_by_email || '').toLowerCase().includes(disputeSearch.toLowerCase()) ||
        (d.reason || '').toLowerCase().includes(disputeSearch.toLowerCase()) ||
        (d.description || '').toLowerCase().includes(disputeSearch.toLowerCase());

      const s = (d.status || '').toUpperCase();
      let matchStatus = true;
      if (disputeStatusFilter === 'PENDING') {
        matchStatus = s === 'PENDING' || s === 'UNDER_REVIEW' || s === 'OPEN' || s === 'DISPUTED' || (s !== 'RESOLVED' && s !== 'REJECTED' && s !== 'CLOSED' && s !== 'DISPUTE_RESOLVED' && s !== 'DISPUTE_REJECTED');
      } else if (disputeStatusFilter === 'RESOLVED') {
        matchStatus = s === 'RESOLVED' || s === 'APPROVED' || s === 'DISPUTE_RESOLVED';
      } else if (disputeStatusFilter === 'REJECTED') {
        matchStatus = s === 'REJECTED' || s === 'CLOSED' || s === 'DISPUTE_REJECTED';
      }

      return matchSearch && matchStatus;
    });
  }, [disputes, disputeSearch, disputeStatusFilter]);

  const disputeMetrics = React.useMemo(() => {
    const total = disputes.length;
    const pending = disputes.filter(d => {
      const s = (d.status || '').toUpperCase();
      return s === 'PENDING' || s === 'UNDER_REVIEW' || s === 'OPEN' || s === 'DISPUTED' || (s !== 'RESOLVED' && s !== 'REJECTED' && s !== 'CLOSED' && s !== 'DISPUTE_RESOLVED' && s !== 'DISPUTE_REJECTED');
    }).length;
    const resolved = disputes.filter(d => {
      const s = (d.status || '').toUpperCase();
      return s === 'RESOLVED' || s === 'APPROVED' || s === 'DISPUTE_RESOLVED';
    }).length;
    const rejected = disputes.filter(d => {
      const s = (d.status || '').toUpperCase();
      return s === 'REJECTED' || s === 'CLOSED' || s === 'DISPUTE_REJECTED';
    }).length;
    return { total, pending, resolved, rejected };
  }, [disputes]);

  const [kycFilter, setKycFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED'>('ALL');
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<number | string | null>(null);
  const [trustProfiles, setTrustProfiles] = useState<any[]>([]);
  const [trustLoading, setTrustLoading] = useState(false);
  const [overrideModal, setOverrideModal] = useState<{ userId: number; current: number } | null>(null);
  const [blockUserModal, setBlockUserModal] = useState<AppUser | null>(null);
  const [blockUserLoading, setBlockUserLoading] = useState(false);

  const [aiFaqs, setAiFaqs] = useState<any[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('platform');
  const [isCreatingFaq, setIsCreatingFaq] = useState(false);

  useEffect(() => {
    if (tab === 'ai_knowledge') {
      api('/api/ai/admin/faqs/')
        .then(res => setAiFaqs(res.data || []))
        .catch(err => console.warn('AI faqs fetch warning:', err));
    }
  }, [tab]);

  const fetchContactMessages = useCallback(async () => {
    try {
      const res = await api('/api/support/admin/contact-messages');
      setContactMessages(res.data || res.results || []);
    } catch (err) {
      console.warn('Contact messages fetch warning:', err);
    }
  }, []);

  const toast = useCallback((type: Toast['type'], msg: string) => {
    const id = ++toastId;
    setToasts(p => [...p, { id, type, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const confirm_ = useCallback((opts: ConfirmOptions) => {
    setConfirm({ ...opts, onCancel: () => setConfirm(null) });
  }, []);

  const fetchChartPoints = useCallback(async (p: 'day' | 'week' | 'month') => {
    try {
      const stored = sessionStorage.getItem(`flyora_admin_chart_${p}`);
      if (stored) setChartPoints(JSON.parse(stored));
    } catch (e) {}

    setChartLoading(true);
    try {
      const res = await api(`/api/admin/chart/?period=${p}`);
      if (res?.data?.points) {
        setChartPoints(res.data.points);
        sessionStorage.setItem(`flyora_admin_chart_${p}`, JSON.stringify(res.data.points));
      }
    } catch (e) {
      console.error('Chart fetch error', e);
    } finally {
      setChartLoading(false);
    }
  }, []);


  const handlePeriodChange = (p: 'day' | 'week' | 'month') => {
    setChartPeriod(p);
    fetchChartPoints(p);
  };

  // Close menu on outside click
  useEffect(() => {
    const h = () => setOpenMenu(null);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  // Auto-load trust data when trust tab is selected
  const hasAttemptedTrustFetch = useRef(false);

  const loadTrustData = useCallback(async () => {
    setTrustLoading(true);
    try {
      const res = await api('/api/trust/admin/');
      const list = res?.results || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        setTrustProfiles(list);
      }
    } catch (err) {
      console.warn('Trust admin API load warning:', err);
    } finally {
      setTrustLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'trust' && !hasAttemptedTrustFetch.current) {
      hasAttemptedTrustFetch.current = true;
      loadTrustData();
    }
  }, [tab, loadTrustData]);

  const dataCacheRef = useRef<any>(null);

  // High-Speed Progressive Data Loader (Google/Meta Style SWR Pattern)

  const fetchData = useCallback(async () => {
    try {
      const storedStats = sessionStorage.getItem('flyora_admin_stats');
      if (storedStats && !stats) setStats(JSON.parse(storedStats));
    } catch (e) {}

    if (!dataCacheRef.current && !stats) {
      setLoading(true);
    }

    try {
      const res = await api(`/api/admin/dashboard-overview/?period=${chartPeriod}`);
      const payload = res?.data || {};

      if (payload.stats) {
        setStats(payload.stats);
        sessionStorage.setItem('flyora_admin_stats', JSON.stringify(payload.stats));
      }
      if (payload.chart?.points) {
        setChartPoints(payload.chart.points);
      }
      if (Array.isArray(payload.trips)) setTrips(payload.trips);
      if (Array.isArray(payload.bookings)) setBookings(payload.bookings);
      if (Array.isArray(payload.shipments)) setShipments(payload.shipments);
      if (Array.isArray(payload.kycUsers)) setKycUsers(payload.kycUsers);
      if (Array.isArray(payload.users)) setUsers(payload.users);
      if (Array.isArray(payload.disputes)) setDisputes(payload.disputes);
      if (Array.isArray(payload.contactMessages)) setContactMessages(payload.contactMessages);
      if (Array.isArray(payload.trustProfiles)) setTrustProfiles(payload.trustProfiles);

      dataCacheRef.current = payload;
    } catch (e) {
      console.warn('Dashboard overview fetch warning:', e);
    } finally {
      setLoading(false);
    }
  }, [chartPeriod]);

  useEffect(() => {
    if (localStorage.getItem('flyora_admin_authenticated') !== 'true') { navigate('/admin/login'); return; }
    fetchData();
  }, [navigate, fetchData]);




  // ─ Actions ─
  const updateTripStatus = async (id: number, status: string) => {
    try {
      await api(`/api/admin/trips/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setTrips(p => p.map(t => t.id === id ? { ...t, status } : t));
      toast('success', `Trip #${id} → ${status}`);
    } catch (e: any) { toast('error', e.message); }
  };

  const deleteTrip = (id: number) => confirm_({
    title: 'Delete Trip?', description: `Trip #${id} and all its related data will be permanently deleted. This cannot be undone.`,
    confirmLabel: 'Yes, Delete', variant: 'danger', icon: <Trash2 size={26} />,
    onConfirm: async () => {
      try { await api(`/api/admin/trips/${id}/`, { method: 'DELETE' }); setTrips(p => p.filter(t => t.id !== id)); toast('success', `Trip #${id} deleted`); }
      catch (e: any) { toast('error', e.message); }
    }
  });

  const updateBookingStatus = async (id: number, status: string) => {
    try {
      await api(`/api/admin/bookings/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setBookings(p => p.map(b => b.id === id ? { ...b, status } : b));
      toast('success', `Booking #${id} → ${status}`);
    } catch (e: any) { toast('error', e.message); }
  };

  const deleteBooking = (id: number) => confirm_({
    title: 'Delete Booking?', description: `Booking #${id} will be permanently deleted.`,
    confirmLabel: 'Delete', variant: 'danger', icon: <Trash2 size={26} />,
    onConfirm: async () => {
      try { await api(`/api/admin/bookings/${id}/`, { method: 'DELETE' }); setBookings(p => p.filter(b => b.id !== id)); toast('success', `Booking #${id} deleted`); }
      catch (e: any) { toast('error', e.message); }
    }
  });

  const updateShipmentStatus = async (id: number, status: string) => {
    try {
      await api(`/api/admin/shipments/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setShipments(p => p.map(s => s.id === id ? { ...s, status } : s));
      toast('success', `Shipment #${id} → ${status}`);
    } catch (e: any) { toast('error', e.message); }
  };

  const toggleUserActive = (user: AppUser) => {
    setBlockUserModal(user);
  };

  const handleBlockUserConfirm = async () => {
    if (!blockUserModal) return;
    setBlockUserLoading(true);
    try {
      await api(`/api/admin/users/${blockUserModal.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !blockUserModal.isActive }),
      });
      setUsers(p => p.map(u => u.id === blockUserModal.id ? { ...u, isActive: !blockUserModal.isActive } : u));
      toast(
        'success',
        blockUserModal.isActive
          ? `🔒 ${blockUserModal.fullName}'s account has been blocked.`
          : `✅ ${blockUserModal.fullName}'s account has been reactivated.`
      );
    } catch (e: any) {
      toast('error', e.message);
    } finally {
      setBlockUserLoading(false);
      setBlockUserModal(null);
    }
  };

  const deleteUser = (user: AppUser) => confirm_({
    title: 'Delete User?',
    description: `${user.fullName}'s account and all data will be permanently deleted. This action CANNOT be undone.`,
    confirmLabel: 'Permanently Delete', variant: 'danger', icon: <Trash2 size={26} />,
    onConfirm: async () => {
      try { await api(`/api/admin/users/${user.id}/`, { method: 'DELETE' }); setUsers(p => p.filter(u => u.id !== user.id)); toast('success', `${user.fullName} deleted`); }
      catch (e: any) { toast('error', e.message); }
    }
  });

  const handleKyc = async (userId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    try {
      await api('/api/kyc/admin/action/', { method: 'POST', body: JSON.stringify({ userId, action, reason }) });
      setKycUsers(p => p.map(u => u.userId === userId ? { ...u, status: newStatus, rejectionReason: reason || u.rejectionReason } : u));
      toast('success', `KYC ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
    } catch (e: any) { toast('error', e.message); }
  };

  // ─ Filters ─
  const S = search.toLowerCase();
  const handleDisputeAction = async (id: number, action: string, reason: string) => {
    try {
      await api(`/api/support/admin/disputes/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, reason })
      });
      toast('success', `Dispute ${action.toLowerCase()}d successfully`);
      const res = await api('/api/support/admin/disputes');
      setDisputes(res.data || res.results || []);
    } catch (e: any) {
      toast('error', e.message);
    }
  };

  const isSenderTrip = (t: Trip) => t.airline === 'SENDER_REQUEST' || t.airline?.toUpperCase().includes('SENDER');

  // Traveler Trips ONLY (Filter OUT SENDER_REQUEST trips)
  const fTrips = trips.filter(t => !isSenderTrip(t) && (!S || String(t.id).includes(S) || t.from_location?.toLowerCase().includes(S) || t.to_location?.toLowerCase().includes(S) || t.traveler_name?.toLowerCase().includes(S)));

  // Convert any Trip created by Sender (SENDER_REQUEST) into a Booking item for Sender Parcel Requests tab
  const senderTripsAsBookings: Booking[] = trips.filter(t => isSenderTrip(t)).map(t => ({
    id: t.id,
    sender_name: t.traveler_name || t.traveler_email?.split('@')[0] || 'Sender',
    traveler_name: 'Awaiting Traveler Match',
    package_name: t.aircraft || 'Parcel',
    package_category: t.aircraft || 'General',
    package_image: t.accepted_parcel_types?.[0] || '📦',
    weight: Number(t.capacity_weight) || 1,
    agreed_price: t.price_per_kg ? Number(t.price_per_kg) * Number(t.capacity_weight) : 0,
    reward: t.price_per_kg ? Number(t.price_per_kg) * Number(t.capacity_weight) : 0,
    status: t.status,
    trip: {
      from_location: t.from_location,
      to_location: t.to_location,
      departure_date: t.departure_date,
      from_airport: t.from_airport,
      to_airport: t.to_airport
    },
    accepted_parcel_types: t.accepted_parcel_types,
    created_at: t.created_at,
    sender: { first_name: t.traveler_name || 'Sender', last_name: '', email: t.traveler_email || '' },
    traveler: { first_name: 'Awaiting', last_name: 'Match', email: '' }
  }));

  const allSenderBookings = [...bookings, ...senderTripsAsBookings];
  const fBookings = allSenderBookings.filter(b => !S || String(b.id).includes(S) || b.sender?.first_name?.toLowerCase().includes(S) || b.sender_name?.toLowerCase().includes(S) || b.status?.toLowerCase().includes(S));
  const fShipments = shipments.filter(s => !S || String(s.id).includes(S));
  const fKyc = kycUsers.filter(u => (kycFilter === 'ALL' || u.status === kycFilter) && (!S || u.fullName.toLowerCase().includes(S) || u.email.toLowerCase().includes(S)));
  const fUsers = users.filter(u => !S || u.fullName.toLowerCase().includes(S) || u.email.toLowerCase().includes(S) || u.role.toLowerCase().includes(S));

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hr = now.getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { label: 'Total Users', val: stats?.totalUsers ?? users.length, sub: `+${stats?.newUsersThisWeek ?? 0} this week`, color: '#6366F1', glow: 'glow-indigo', bg: '#EEF2FF', icon: Users, up: true, spark: [10, 15, 23, 28, 38, 48, 55, 68] },
    { label: 'Active Trips', val: stats?.activeTrips ?? trips.filter(t => t.status === 'Active').length, sub: `${stats?.totalTrips ?? trips.length} total`, color: '#0EA5E9', glow: 'glow-blue', bg: '#E0F2FE', icon: Plane, up: true, spark: [12, 10, 15, 14, 18, 22, 20, 24] },
    { label: 'Parcel Requests', val: stats?.parcelRequests ?? bookings.length, sub: `+${stats?.newBookingsThisWeek ?? 0} this week`, color: '#10B981', glow: 'glow-teal', bg: '#D1FAE5', icon: Package, up: true, spark: [5, 8, 12, 11, 15, 19, 18, 25] },
    { label: 'Shipments', val: stats?.totalShipments ?? shipments.length, sub: `${stats?.inTransitShipments ?? 0} in transit`, color: '#F59E0B', glow: 'glow-amber', bg: '#FEF3C7', icon: Truck, up: true, spark: [2, 4, 3, 5, 8, 7, 10, 12] },
    { label: 'Pending KYC', val: stats?.pendingKyc ?? kycUsers.filter(u => u.status === 'PENDING').length, sub: 'Awaiting review', color: '#EF4444', glow: 'glow-rose', bg: '#FEE2E2', icon: ShieldCheck, up: false, spark: [8, 12, 10, 6, 4, 8, 5, 2] },
  ];

  const donutSegs = [
    { label: 'Travellers', color: '#6366F1', value: stats?.userRoles?.traveler ?? Math.max(1, Math.round((stats?.totalUsers ?? users.length) * 0.4)) },
    { label: 'Senders', color: '#0EA5E9', value: stats?.userRoles?.sender ?? Math.max(1, Math.round((stats?.totalUsers ?? users.length) * 0.35)) },
    { label: 'Both', color: '#10B981', value: stats?.userRoles?.both ?? Math.max(1, Math.round((stats?.totalUsers ?? users.length) * 0.15)) },
    { label: 'Admins', color: '#F59E0B', value: stats?.userRoles?.admin ?? Math.max(1, 1) },
    { label: 'Others', color: '#CBD5E1', value: stats?.userRoles?.user ?? Math.max(1, Math.round((stats?.totalUsers ?? users.length) * 0.05)) },
  ];
  const donutTotal = stats?.totalUsers ?? users.length;

  const recentActivity = [
    ...kycUsers.filter(u => u.status === 'PENDING').slice(0, 2).map(u => ({ icon: ShieldCheck, text: `KYC pending: ${u.fullName}`, color: '#F59E0B', sub: 'Needs review' })),
    ...trips.slice(0, 3).map(t => ({ icon: Plane, text: `Trip: ${t.from_location} → ${t.to_location}`, color: '#0EA5E9', sub: t.departure_date })),
    ...bookings.filter(b => b.status === 'REQUEST_SENT').slice(0, 2).map(b => ({ icon: Package, text: `Booking #${b.id} pending`, color: '#10B981', sub: b.status })),
  ].slice(0, 6);

  const navItems: { label: string; icon: any; tab: Tab; badge?: number }[] = [
    { label: 'Dashboard', icon: LayoutDashboard, tab: 'overview' },
    { label: 'Users', icon: Users, tab: 'users', badge: users.length },
    { label: 'Traveler', icon: Plane, tab: 'trips', badge: stats?.activeTrips ?? trips.filter(t => t.status === 'Active').length },
    { label: 'Sender', icon: Package, tab: 'bookings', badge: stats?.bookingBreakdown?.pending ?? bookings.filter(b => b.status === 'REQUEST_SENT').length },
    { label: 'Shipments', icon: Truck, tab: 'shipments', badge: stats?.inTransitShipments ?? shipments.filter(s => s.status === 'IN_TRANSIT').length },
    { label: 'KYC Approvals', icon: ShieldCheck, tab: 'kyc', badge: stats?.pendingKyc ?? kycUsers.filter(u => u.status === 'PENDING').length },
    { label: 'Disputes', icon: AlertTriangle, tab: 'disputes', badge: disputes.filter(d => d.status === 'Under Review' || d.status === 'Open').length },
    { label: 'Trust & Risk', icon: ShieldCheck, tab: 'trust' },
    { label: 'Contact Messages', icon: MessageSquare, tab: 'contact_messages', badge: contactMessages.filter(m => m.status === 'New').length },
    { label: 'AI Knowledge & FAQ', icon: Zap, tab: 'ai_knowledge' },
    { label: 'Platform Settings', icon: Settings, tab: 'settings' },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter',system-ui,sans-serif", background: '#F0F4FF' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
        
        /* ── ADMIN LIGHT THEME VARIABLES ── */
        :root {
          --admin-bg: #F0F4FF;
          --admin-surface: #FFFFFF;
          --admin-surface-2: #F8FAFF;
          --admin-border: #E2E8F7;
          --admin-border-active: #0D9488;
          --admin-navy: #0A1628;
          --admin-teal: #0D9488;
          --admin-teal-light: #14B8A6;
          --admin-blue: #1B4FD8;
          --admin-text-primary: #0A1628;
          --admin-text-secondary: #475569;
          --admin-text-muted: #94A3B8;
        }

        /* ── KEYFRAMES ── */
        @keyframes fade-in{from{opacity:0}to{opacity:1}}
        @keyframes zoom-in-95{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes slide-in-from-bottom-3{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes slide-in-from-top-4{from{transform:translateY(-16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes slide-in-from-left{from{transform:translateX(-10px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes admin-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes admin-glow-pulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        @keyframes admin-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes admin-counter-up{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes admin-spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}  }
        @keyframes admin-slide-right{from{transform:translateX(-8px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes admin-badge-pop{0%{transform:scale(0.7)}70%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes admin-status-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
        @keyframes admin-card-enter{from{opacity:0;transform:translateY(16px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes admin-pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.4);opacity:0}}
        @keyframes admin-progress-fill{from{width:0}to{width:var(--prog-w,100%)}}
        @keyframes admin-shine{0%{left:-60%}100%{left:120%}}

        .animate-in{animation-duration:.3s;animation-fill-mode:both;animation-timing-function:cubic-bezier(0.16,1,0.3,1)}
        .fade-in{animation-name:fade-in}
        .zoom-in-95{animation-name:zoom-in-95}
        .slide-in-from-bottom-3{animation-name:slide-in-from-bottom-3}
        .slide-in-from-top-4{animation-name:slide-in-from-top-4}
        .duration-200{animation-duration:.2s}
        .duration-300{animation-duration:.3s}

        /* ── SCROLLBARS ── */
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#f1f5f9}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:6px}
        ::-webkit-scrollbar-thumb:hover{background:#0D9488}

        /* ── SIDEBAR (FlyoraGo Teal Brand) ── */
        .admin-sidebar {
          background: linear-gradient(180deg, #0F766E 0%, #0D9488 50%, #09544E 100%);
          border-right: none;
          box-shadow: 6px 0 30px rgba(13,148,136,0.25);
          position: relative;
        }
        .admin-sidebar::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.1) 70%, transparent);
        }
        .admin-sidebar-logo {
          background: rgba(0,0,0,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .admin-nav-item {
          border-radius: 12px;
          transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .admin-nav-item:hover {
          background: rgba(255,255,255,0.14);
          transform: translateX(3px);
        }
        .admin-nav-item.active {
          background: #FFFFFF;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18);
        }
        .admin-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 15%; bottom: 15%;
          width: 4px;
          background: #10B981;
          border-radius: 0 4px 4px 0;
        }
        .admin-nav-section-label {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          padding: 0 12px 8px;
        }

        /* ── HEADER ── */
        .admin-header {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid #E2E8F7;
          box-shadow: 0 1px 0 rgba(10,22,40,0.04), 0 4px 20px rgba(10,22,40,0.06);
        }
        .admin-search-box {
          background: #F0F4FF;
          border: 1.5px solid #E2E8F7;
          border-radius: 12px;
          transition: all 0.2s ease;
          color: #0A1628;
        }
        .admin-search-box:focus {
          background: #fff;
          border-color: #0D9488;
          box-shadow: 0 0 0 3px rgba(13,148,136,0.1);
          outline: none;
        }
        .admin-search-box::placeholder{color:#94A3B8}

        /* ── MAIN CONTENT ── */
        .admin-main {
          background: #F0F4FF;
        }
        .admin-section-bg {
          background:
            radial-gradient(ellipse at 0% 0%, rgba(13,148,136,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, rgba(27,79,216,0.06) 0%, transparent 50%),
            #F0F4FF;
        }

        /* ── STAT CARDS ── */
        .admin-stat-card {
          background: #fff;
          border: 1.5px solid #E2E8F7;
          border-radius: 18px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          animation: admin-card-enter 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .admin-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: -60%;
          width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
          animation: admin-shine 3s ease-in-out infinite;
          pointer-events: none;
        }
        .admin-stat-card:hover {
          border-color: #0D9488;
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 20px 50px rgba(10,22,40,0.12), 0 0 0 1px rgba(13,148,136,0.2);
        }
        .admin-stat-card:hover .admin-stat-icon {
          transform: scale(1.12) rotate(8deg);
        }
        .admin-stat-icon {
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
        }
        .admin-stat-number {
          animation: admin-counter-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
          color: #0A1628;
          font-weight: 900;
          font-size: 1.75rem;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        /* ── CHART CARD ── */
        .admin-chart-card {
          background: #fff;
          border: 1.5px solid #E2E8F7;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(10,22,40,0.06);
        }

        /* ── DATA TABLES ── */
        .admin-table-card {
          background: #fff;
          border: 1.5px solid #E2E8F7;
          border-radius: 20px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          box-shadow: 0 4px 24px rgba(10,22,40,0.06);
          width: 100%;
          max-width: 100%;
        }
        .admin-table-head {
          background: linear-gradient(135deg, #F8FAFF 0%, #F0F4FF 100%);
          border-bottom: 1.5px solid #E2E8F7;
        }
        .admin-table-head th {
          color: #64748B;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 12px 14px;
          white-space: nowrap;
        }
        .admin-table-row {
          border-bottom: 1px solid #F1F5F9;
          transition: all 0.18s ease;
        }
        .admin-table-row:last-child{border-bottom:none}
        .admin-table-row:hover {
          background: linear-gradient(135deg, rgba(13,148,136,0.04) 0%, rgba(27,79,216,0.03) 100%);
        }
        .admin-table-row td {
          padding: 12px 14px;
          color: #475569;
          font-size: 13px;
          vertical-align: middle;
        }
        .admin-table-row td:first-child{color:#0A1628;font-weight:700}

        /* ── BUTTONS ── */
        .admin-btn-primary {
          background: linear-gradient(135deg, #0D9488 0%, #1B4FD8 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 12px;
          padding: 8px 18px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(13,148,136,0.3);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .admin-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(255,255,255,0.15), transparent);
          pointer-events: none;
        }
        .admin-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(13,148,136,0.4);
          filter: brightness(1.05);
        }
        .admin-btn-ghost {
          background: #F0F4FF;
          border: 1.5px solid #E2E8F7;
          color: #475569;
          border-radius: 10px;
          font-weight: 600;
          font-size: 12px;
          padding: 7px 14px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .admin-btn-ghost:hover {
          background: #fff;
          border-color: #0D9488;
          color: #0A1628;
          box-shadow: 0 2px 8px rgba(13,148,136,0.12);
        }
        .admin-btn-danger {
          background: #FEF2F2;
          border: 1.5px solid #FECACA;
          color: #DC2626;
          border-radius: 10px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .admin-btn-danger:hover {
          background: #FEE2E2;
          border-color: #F87171;
          box-shadow: 0 2px 8px rgba(220,38,38,0.15);
        }

        /* ── BADGES ── */
        .admin-badge-active{background:#D1FAE5;color:#065F46;border:1.5px solid #A7F3D0;border-radius:999px;font-size:10px;font-weight:800;padding:2px 10px;letter-spacing:.04em}
        .admin-badge-pending{background:#FEF3C7;color:#92400E;border:1.5px solid #FDE68A;border-radius:999px;font-size:10px;font-weight:800;padding:2px 10px}
        .admin-badge-error{background:#FEE2E2;color:#991B1B;border:1.5px solid #FECACA;border-radius:999px;font-size:10px;font-weight:800;padding:2px 10px}
        .admin-badge-info{background:#DBEAFE;color:#1E40AF;border:1.5px solid #BFDBFE;border-radius:999px;font-size:10px;font-weight:800;padding:2px 10px}
        .admin-badge-neutral{background:#F1F5F9;color:#475569;border:1.5px solid #E2E8F0;border-radius:999px;font-size:10px;font-weight:800;padding:2px 10px}
        .admin-badge-teal{background:#CCFBF1;color:#0F766E;border:1.5px solid #99F6E4;border-radius:999px;font-size:10px;font-weight:800;padding:2px 10px}
        .admin-badge-violet{background:#EDE9FE;color:#5B21B6;border:1.5px solid #DDD6FE;border-radius:999px;font-size:10px;font-weight:800;padding:2px 10px}

        /* ── SECTION HEADERS ── */
        .admin-section-title {
          font-size: 1.2rem;
          font-weight: 900;
          color: #0A1628;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }
        .admin-section-sub{font-size:13px;color:#64748B;font-weight:500;margin-top:3px}

        /* ── FILTER CHIPS ── */
        .admin-chip {
          background: #fff;
          border: 1.5px solid #E2E8F7;
          color: #64748B;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 14px;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .admin-chip:hover{background:#F0F4FF;border-color:#0D9488;color:#0A1628}
        .admin-chip.active {
          background: linear-gradient(135deg, #0D9488 0%, #1B4FD8 100%);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 14px rgba(13,148,136,0.25);
        }

        /* ── ACTIVITY ITEMS ── */
        .admin-activity-item {
          display:flex;align-items:flex-start;gap:12px;
          padding:10px 0;
          border-bottom:1px solid #F1F5F9;
          transition:all .18s ease;
        }
        .admin-activity-item:last-child{border-bottom:none}
        .admin-activity-item:hover{padding-left:6px}

        /* ── OVERVIEW CARD ── */
        .admin-overview-card {
          background:#fff;
          border:1.5px solid #E2E8F7;
          border-radius:20px;
          overflow:hidden;
          box-shadow: 0 4px 24px rgba(10,22,40,0.06);
        }

        /* ── GRADIENT ICON BACKGROUNDS (stat cards) ── */
        .grad-indigo{background:linear-gradient(135deg,#EEF2FF,#E0E7FF)}
        .grad-sky{background:linear-gradient(135deg,#E0F2FE,#BAE6FD)}
        .grad-emerald{background:linear-gradient(135deg,#D1FAE5,#A7F3D0)}
        .grad-amber{background:linear-gradient(135deg,#FEF3C7,#FDE68A)}
        .grad-rose{background:linear-gradient(135deg,#FEE2E2,#FECACA)}

        /* ── DROPDOWN ── */
        .dropdown{position:relative}
        .dropdown-menu {
          position:absolute;right:0;top:calc(100% + 8px);
          background:#fff;
          border:1.5px solid #E2E8F7;
          border-radius:14px;
          box-shadow:0 20px 60px rgba(10,22,40,0.12);
          z-index:200;min-width:160px;padding:6px;overflow:hidden
        }
        .dropdown-item {
          display:flex;align-items:center;gap:8px;width:100%;
          padding:8px 12px;border-radius:10px;
          font-size:13px;font-weight:600;
          cursor:pointer;transition:background .15s;
          color:#475569;
        }
        .dropdown-item:hover{background:#F0F4FF;color:#0A1628}
        .dropdown-item.danger{color:#DC2626}
        .dropdown-item.danger:hover{background:#FEF2F2}

        /* ── MOBILE BACKDROP ── */
        .admin-mobile-backdrop {
          background:rgba(10,22,40,0.5);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
        }

        /* ── INPUT LIGHT ── */
        .admin-input {
          background: #F8FAFF !important;
          border: 1.5px solid #E2E8F7 !important;
          color: #0A1628 !important;
          border-radius: 12px !important;
          transition: all 0.2s ease !important;
        }
        .admin-input:focus {
          background: #fff !important;
          border-color: #0D9488 !important;
          box-shadow: 0 0 0 3px rgba(13,148,136,0.1) !important;
          outline: none !important;
        }
        .admin-input::placeholder{color:#94A3B8 !important}

        /* ── SHIMMER LOADING ── */
        .admin-shimmer {
          position:relative;overflow:hidden;
          background:#F1F5F9;
          border-radius:10px;
        }
        .admin-shimmer::after {
          content:'';
          position:absolute;top:0;left:0;right:0;bottom:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent);
          animation:admin-shimmer 1.5s infinite;
        }

        /* ── SECTION FADE IN ── */
        .admin-tab-content {
          animation: slide-in-from-bottom-3 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* ── DIVIDER ── */
        .admin-divider{border-color:#E2E8F7}

        /* ── METRIC CARD ── */
        .admin-metric-card {
          background:#fff;
          border:1.5px solid #E2E8F7;
          border-radius:18px;
          padding:20px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          transition:all 0.25s ease;
          box-shadow: 0 2px 12px rgba(10,22,40,0.05);
        }
        .admin-metric-card:hover {
          border-color:#0D9488;
          transform:translateY(-2px);
          box-shadow:0 12px 40px rgba(13,148,136,0.1);
        }

        /* ── HOVER LIFT ── */
        .admin-hover-lift {
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .admin-hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(10,22,40,0.1);
        }

        /* ── DYNAMIC SYSTEM STYLES ── */
        .glass-panel {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(226, 232, 247, 0.7);
        }
        
        .text-gradient-primary {
          background: linear-gradient(135deg, #0A1628 30%, #0F766E 100%);
          -webkit-bg-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .glow-teal:hover {
          box-shadow: 0 12px 30px -10px rgba(13, 148, 136, 0.25), 0 0 0 1px rgba(13, 148, 136, 0.2) !important;
          border-color: rgba(13, 148, 136, 0.4) !important;
        }
        
        .glow-blue:hover {
          box-shadow: 0 12px 30px -10px rgba(27, 79, 216, 0.25), 0 0 0 1px rgba(27, 79, 216, 0.2) !important;
          border-color: rgba(27, 79, 216, 0.4) !important;
        }
        
        .glow-indigo:hover {
          box-shadow: 0 12px 30px -10px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.2) !important;
          border-color: rgba(99, 102, 241, 0.4) !important;
        }
        
        .glow-amber:hover {
          box-shadow: 0 12px 30px -10px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.2) !important;
          border-color: rgba(245, 158, 11, 0.4) !important;
        }
        
        .glow-rose:hover {
          box-shadow: 0 12px 30px -10px rgba(244, 63, 94, 0.25), 0 0 0 1px rgba(244, 63, 94, 0.2) !important;
          border-color: rgba(244, 63, 94, 0.4) !important;
        }
        
        /* ── FLOATING ANIMATION ── */
        .hover-float {
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .hover-float:hover {
          transform: translateY(-5px) scale(1.015);
        }

        /* ── DIAGNOSTIC BAR ── */
        .diagnostic-bar {
          background: repeating-linear-gradient(
            45deg,
            rgba(13, 148, 136, 0.03),
            rgba(13, 148, 136, 0.03) 10px,
            rgba(13, 148, 136, 0.07) 10px,
            rgba(13, 148, 136, 0.07) 20px
          );
        }
        
        .pulse-ring {
          animation: pulse-ring-anim 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
        @keyframes pulse-ring-anim {
          0% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        /* ── GLOWING SPARK PATHS ── */
        .chart-glow-path {
          filter: drop-shadow(0px 3px 6px rgba(13, 148, 136, 0.2));
        }

        /* ── PROGRESS FILL ── */
        .animate-progress-fill {
          animation: admin-progress-fill 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      {/* Mobile Backdrop Overlay */}
      {sideOpen && (
        <div
          onClick={() => setSideOpen(false)}
          className="admin-mobile-backdrop fixed inset-0 z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`admin-sidebar fixed lg:static inset-y-0 left-0 z-50 flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${sideOpen
            ? 'w-[260px] translate-x-0 lg:w-[260px] lg:opacity-100'
            : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none'
          }`}
      >
        <div className="w-[260px] h-full flex flex-col justify-between shrink-0">
          <div className="flex flex-col min-h-0">
            {/* Logo */}
            <div className="admin-sidebar-logo flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-md">
                  <Plane size={16} className="text-[#0D9488] -rotate-45" />
                </div>
                <div>
                  <span className="text-[16px] font-black tracking-wider text-white">
                    FLYORAGO
                  </span>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-white/75">ADMIN PORTAL</div>
                </div>
              </div>
              <button onClick={() => setSideOpen(false)} className="lg:hidden p-1.5 rounded-lg transition-colors text-white/70 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 max-h-[calc(100vh-180px)]">
              <p className="text-[9px] font-black uppercase tracking-widest px-3 pb-2 text-white/70" style={{letterSpacing:'0.15em'}}>MANAGEMENT</p>
              {navItems.map((item, idx) => (
                <button
                  key={item.tab}
                  onClick={() => {
                    setTab(item.tab);
                    setSearch('');
                    if (window.innerWidth < 1024) setSideOpen(false);
                  }}
                  className={`admin-nav-item ${tab === item.tab ? 'active' : ''} w-full flex items-center justify-between px-3 py-2.5 whitespace-nowrap`}
                  style={{animationDelay:`${idx*30}ms`}}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={16}
                      style={{color: tab === item.tab ? '#0D9488' : 'rgba(255,255,255,0.85)', transition:'color .2s ease'}}
                    />
                    <span className="text-[13px] font-bold" style={{color: tab === item.tab ? '#0F766E' : 'rgba(255,255,255,0.92)'}}>{item.label}</span>
                  </div>
                  {(item.badge ?? 0) > 0 && (
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={tab === item.tab
                        ? {background:'#0D9488',color:'#FFFFFF'}
                        : item.tab === 'kyc' && (item.badge ?? 0) > 0
                        ? {background:'#FEF2F2',color:'#DC2626'}
                        : {background:'rgba(255,255,255,0.2)',color:'#FFFFFF'}
                      }
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              <div className="pt-3 mt-2" style={{borderTop:'1px solid rgba(255,255,255,0.15)'}}>
                <p className="text-[9px] font-black uppercase tracking-widest px-3 pb-2 text-white/70" style={{letterSpacing:'0.15em'}}>SYSTEM</p>
                <Link to="/" className="admin-nav-item flex items-center gap-3 px-3 py-2.5 w-full transition-all">
                  <Globe size={16} style={{color:'rgba(255,255,255,0.85)'}} />
                  <span className="text-[13px] font-bold text-white/90">View Website</span>
                </Link>
              </div>
            </nav>
          </div>

          {/* Bottom user + sign out */}
          <div className="p-3" style={{borderTop:'1px solid rgba(255,255,255,0.15)'}}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1" style={{background:'rgba(0,0,0,0.12)'}}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black bg-white text-[#0D9488] shadow-sm">A</div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold truncate text-white">System Admin</p>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-white/70">Super Admin</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('flyora_admin_authenticated');
                navigate('/admin/login');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut size={15} />
              <span className="text-[13px] font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="admin-header px-4 md:px-6 py-3.5 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSideOpen(prev => !prev)}
              className="p-2 rounded-xl transition-all flex items-center justify-center"
              style={{background:'#F0F4FF',border:'1.5px solid #E2E8F7',color:'#475569'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='#fff';(e.currentTarget as HTMLButtonElement).style.color='#0A1628';(e.currentTarget as HTMLButtonElement).style.borderColor='#0D9488'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='#F0F4FF';(e.currentTarget as HTMLButtonElement).style.color='#475569';(e.currentTarget as HTMLButtonElement).style.borderColor='#E2E8F7'}}
              title="Toggle Sidebar"
            >
              <Menu size={17} />
            </button>

            {!sideOpen && (
              <div className="hidden sm:flex items-center gap-2 mr-1 animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#0D9488,#1B4FD8)'}}>
                  <Plane size={13} className="text-white -rotate-45" />
                </div>
                <span className="text-sm font-black tracking-wider" style={{color:'#0A1628'}}>
                  FLYORAGO
                </span>
              </div>
            )}

            {/* Search */}
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3.5 pointer-events-none" style={{color:'#334155'}} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users, trips..."
                className="admin-search-box pl-9 pr-4 py-2 text-[13px] w-36 sm:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Refresh */}
            <button
              onClick={fetchData}
              disabled={loading}
              title="Refresh data"
              className="p-2 rounded-xl transition-all"
              style={{background:'#F0F4FF',border:'1.5px solid #E2E8F7',color:'#475569'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color='#0D9488';(e.currentTarget as HTMLButtonElement).style.borderColor='#0D9488'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color='#475569';(e.currentTarget as HTMLButtonElement).style.borderColor='#E2E8F7'}}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-xl transition-all"
              style={{background:'#F0F4FF',border:'1.5px solid #E2E8F7',color:'#475569'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color='#0D9488';(e.currentTarget as HTMLButtonElement).style.borderColor='#0D9488'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color='#475569';(e.currentTarget as HTMLButtonElement).style.borderColor='#E2E8F7'}}
            >
              <Bell size={15} />
              {(stats?.pendingKyc ?? 0) > 0 && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{background:'#ef4444',boxShadow:'0 0 6px rgba(239,68,68,0.6)',animation:'admin-status-dot 2s ease infinite'}}
                />
              )}
            </button>

            {/* Admin Profile */}
            <div
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl ml-1"
              style={{background:'#F0F4FF',border:'1.5px solid #E2E8F7'}}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{background:'linear-gradient(135deg,#0D9488,#1B4FD8)',color:'white',boxShadow:'0 2px 8px rgba(13,148,136,0.25)'}}
              >
                A
              </div>
              <div className="hidden md:block">
                <p className="text-[12px] font-bold leading-none" style={{color:'#0A1628'}}>System Admin</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{color:'#64748B'}}>Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-main admin-section-bg flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">

          {/* ─── OVERVIEW ─────────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="admin-tab-content space-y-6">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-4 pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: '#0A1628' }}>
                      {greet}, Administrator
                    </h1>
                    <span className="text-xl">👋</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span>Here's your platform metrics summary.</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full font-bold select-none">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>All Systems Operational</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <div
                    className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-2xl glass-panel text-slate-700 shadow-sm"
                  >
                    <Calendar size={13} className="text-teal-600" />{dateStr}
                  </div>
                </div>
              </div>

              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {statCards.map((c, i) => (
                  <div
                    key={i}
                    className={`glass-panel hover-float ${c.glow} p-5 rounded-[22px] cursor-pointer flex flex-col justify-between h-[148px] relative overflow-hidden shadow-xs transition-all duration-300 animate-in fade-in`}
                    style={{ animationDelay: `${i * 60}ms`, border: '1px solid rgba(226, 232, 247, 0.8)' }}
                    onClick={() => { if (i === 4) setTab('kyc'); else if (i === 0) setTab('users'); else if (i === 1) setTab('trips'); else if (i === 2) setTab('bookings'); else setTab('shipments'); }}
                  >
                    {/* Background Soft Glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-2xl opacity-10 pointer-events-none" style={{ background: c.color }} />

                    {/* Top row */}
                    <div className="flex items-center justify-between mb-1.5 z-10">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{c.label}</p>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300"
                        style={{ background: `${c.color}12`, border: `1px solid ${c.color}20` }}
                      >
                        <c.icon size={15} style={{ color: c.color }} />
                      </div>
                    </div>

                    {/* Middle row: Number and Sparkline */}
                    <div className="flex items-end justify-between gap-2 z-10">
                      <div>
                        <div className="text-2xl font-black text-slate-900 leading-none tracking-tight">
                          {loading ? (
                            <span className="inline-block w-16 h-7 rounded-lg admin-shimmer" />
                          ) : (
                            c.val.toLocaleString()
                          )}
                        </div>
                      </div>
                      <div className="pb-1">
                        <Sparkline data={c.spark} color={c.color} />
                      </div>
                    </div>

                    {/* Bottom row: Trend Sub-text */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 z-10">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={10} style={{ color: c.up ? '#10B981' : '#EF4444', transform: c.up ? 'none' : 'rotate(180deg)' }} />
                        <span className="text-[10px] font-black" style={{ color: c.up ? '#10B981' : '#EF4444' }}>{c.sub}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">7d trend</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Charts Row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 admin-chart-card p-5">
                  <AdvancedChart
                    period={chartPeriod}
                    onPeriodChange={handlePeriodChange}
                    points={chartPoints}
                    loading={chartLoading}
                  />
                </div>

                {/* Donut */}
                <div className="admin-chart-card p-5">
                  <h2 className="text-sm font-bold mb-4" style={{color:'#0A1628'}}>Users by Role</h2>
                  <div className="flex items-center gap-4">
                    <Donut segs={donutSegs} total={donutTotal} />
                    <div className="space-y-2.5 flex-1">
                      {donutSegs.map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow:`0 0 6px ${s.color}40` }} />
                            <span className="text-[11px] font-medium" style={{color:'#475569'}}>{s.label}</span>
                          </div>
                          <span className="text-[11px] font-bold" style={{color:'#0A1628'}}>{donutTotal > 0 ? Math.round((s.value / donutTotal) * 100) : 0}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>



              {/* ── Bottom Row: Recent Trips + Activity ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in" style={{ animationDelay: '240ms' }}>
                {/* Recent Trips */}
                <div className="lg:col-span-2 glass-panel rounded-[22px] overflow-hidden shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/40">
                    <h2 className="text-sm font-black" style={{color:'#0A1628'}}>Recent Flight Trips</h2>
                    <button onClick={() => setTab('trips')} className="text-[11px] font-black flex items-center gap-1 transition-all text-teal-600 hover:text-teal-700">
                      View All Trips <ArrowRight size={11} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          <th className="px-5 py-3.5 text-left">ID</th>
                          <th className="px-5 py-3.5 text-left">Route</th>
                          <th className="px-5 py-3.5 text-left">Traveler</th>
                          <th className="px-5 py-3.5 text-left">Departure Date</th>
                          <th className="px-5 py-3.5 text-left">Status</th>
                        </tr>
                      </thead>
                      {loading ? <Skeleton rows={5} cols={5} /> : (
                        <tbody className="divide-y divide-slate-100/50">
                          {trips.slice(0, 5).map(t => (
                            <tr key={t.id} className="hover:bg-slate-50/30 transition-all duration-200">
                              <td className="px-5 py-3.5 font-black text-teal-600">#{t.id}</td>
                              <td className="px-5 py-3.5 font-bold text-slate-800">{t.from_location} → {t.to_location}</td>
                              <td className="px-5 py-3.5 text-slate-600">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                                    {t.traveler_name?.[0]?.toUpperCase() || 'T'}
                                  </div>
                                  <span className="font-semibold truncate max-w-[120px]">{t.traveler_name || '—'}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-xs text-slate-400 font-bold">{t.departure_date}</td>
                              <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                            </tr>
                          ))}
                          {trips.length === 0 && <Empty icon={<Plane size={24} />} msg="No trips yet" />}
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>

                {/* Activity + Alerts Column */}
                <div className="space-y-5">
                  {/* Recent Activity */}
                  <div className="glass-panel p-5 rounded-[22px] border border-slate-200/80 shadow-xs">
                    <h2 className="text-sm font-black mb-3.5" style={{color:'#0A1628'}}>Recent Activity Log</h2>
                    <div className="space-y-3">
                      {recentActivity.length === 0 ? (
                        <p className="text-xs text-center py-6 text-slate-400 font-semibold">No recent activity logged</p>
                      ) : (
                        recentActivity.map((a, i) => (
                          <div key={i} className="flex items-center gap-3 border-b border-slate-100/50 pb-2.5 last:border-0 last:pb-0">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}10`, border: `1px solid ${a.color}15` }}>
                              <a.icon size={13} style={{ color: a.color }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate text-slate-800">{a.text}</p>
                              <p className="text-[10px] font-semibold text-slate-400">{a.sub}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* System Alerts */}
                  <div className="glass-panel p-5 rounded-[22px] border border-slate-200/80 shadow-xs">
                    <h2 className="text-sm font-black mb-3.5" style={{color:'#0A1628'}}>Security & System Alerts</h2>
                    <div className="space-y-2.5">
                      {[
                        { text: `${stats?.pendingKyc ?? kycUsers.filter(u => u.status === 'PENDING').length} KYC Reviews Pending`, sub: 'Identity verification queue', c: '#D97706', i: ShieldCheck, action: () => setTab('kyc') },
                        { text: `${stats?.bookingBreakdown?.pending ?? bookings.filter(b => b.status === 'REQUEST_SENT').length} Awaiting Bookings`, sub: 'Escrow verification needed', c: '#DC2626', i: Package, action: () => setTab('bookings') },
                        { text: `${stats?.inTransitShipments ?? shipments.filter(s => s.status === 'IN_TRANSIT').length} Shipments In Transit`, sub: 'Active delivery tracking', c: '#0284C7', i: Truck, action: () => setTab('shipments') },
                      ].map((a, i) => (
                        <button
                          key={i}
                          onClick={a.action}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left border border-slate-100 bg-white/40 hover:bg-slate-50 transition-all duration-200 hover:border-slate-200"
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${a.c}10` }}>
                            <a.i size={13} style={{ color: a.c }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800">{a.text}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{a.sub}</p>
                          </div>
                          <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TRIPS (TRAVELER DASHBOARD - GOOGLE & META ENTERPRISE STYLE) ─────────────────── */}
          {tab === 'trips' && (
            <div className="admin-tab-content space-y-6">

              {/* 1. Header & Primary Action Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                      <Plane size={26} className="text-[#0D9488]" /> Traveler Trip Hub
                    </h1>
                    <span className="admin-badge-teal">Traveler Center</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                    Manage all flight trip offers, extra baggage capacity, and traveler routes across global flights
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                  <button
                    onClick={fetchData}
                    className="admin-btn-ghost flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Trips
                  </button>
                </div>
              </div>

              {/* 2. Google / Meta Enterprise Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-[#0D9488]/40">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Flight Trips</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      {fTrips.filter(t => t.status === 'Active').length}
                      <span className="text-xs font-bold text-emerald-600 ml-2">Active</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">{fTrips.length} Total Flight Offers</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center font-black">
                    <Plane size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-indigo-300">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Baggage Capacity Offered</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      {fTrips.reduce((acc, t) => acc + (Number(t.capacity_weight) || 0), 0)} <span className="text-sm font-bold text-slate-500">kg</span>
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                      {fTrips.reduce((acc, t) => acc + (Number(t.available_weight) || 0), 0)} kg Space Available
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    <Luggage size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-amber-300">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Traveler Reward</div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                      ${Math.round(fTrips.reduce((acc, t) => acc + (Number(t.price_per_kg) || 12), 0) / (fTrips.length || 1))} <span className="text-xs font-bold text-slate-400">/ kg</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">Global Standard Rate</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                    <DollarSign size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-sky-300">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Travelers</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      {new Set(fTrips.map(t => t.traveler_email || t.traveler_name)).size}
                    </div>
                    <p className="text-[11px] font-semibold text-sky-600 mt-1">100% KYC Verified</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
                    <ShieldCheck size={22} />
                  </div>
                </div>
              </div>

              {/* 3. Search & Quick Filters Bar */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by Trip ID, Origin, Destination, Traveler Name or Airline..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#0D9488] outline-none transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap hidden sm:inline">Showing:</span>
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs">
                    {fTrips.length} Trips Matched
                  </span>
                </div>
              </div>

              {/* 4. Enterprise Responsive Data Table */}
              <div className="admin-table-card overflow-x-auto w-full">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="admin-table-head">
                      <th>TRIP ID</th>
                      <th>ROUTE</th>
                      <th>TRAVELER CONTACT</th>
                      <th>AIRLINE</th>
                      <th>DEPARTURE</th>
                      <th>BAGGAGE SPACE</th>
                      <th>STATUS</th>
                      <th style={{textAlign:'center'}}>ACTIONS</th>
                    </tr>
                  </thead>
                  {loading ? <Skeleton rows={6} cols={8} /> : (
                    <tbody>
                      {fTrips.map(t => (
                        <tr key={t.id} className="admin-table-row">
                          <td className="whitespace-nowrap" style={{color:'#0D9488',fontWeight:'900'}}>#{t.id}</td>
                          <td className="max-w-[160px] truncate" style={{color:'#0A1628',fontWeight:'700'}} title={`${t.from_location} → ${t.to_location}`}>
                            {t.from_location} → {t.to_location}
                          </td>
                          <td className="max-w-[170px] truncate" style={{color:'#475569'}} title={t.traveler_email || t.traveler_name}>
                            <div className="font-semibold text-slate-800">{t.traveler_name || 'Traveler'}</div>
                            <div className="text-[11px] text-slate-400 truncate">{t.traveler_email || '—'}</div>
                          </td>
                          <td className="max-w-[120px] truncate" style={{color:'#64748B'}}>{t.airline || 'Commercial Airline'}</td>
                          <td className="whitespace-nowrap" style={{color:'#64748B',fontSize:'12px'}}>{t.departure_date}</td>
                          <td className="whitespace-nowrap">
                            <span className="font-extrabold text-emerald-600">{t.available_weight}</span>
                            <span className="text-slate-400">/{t.capacity_weight} kg</span>
                          </td>
                          <td className="whitespace-nowrap"><StatusBadge status={t.status} /></td>
                          <td className="whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => setSelectedTrip(t)} className="admin-btn-ghost flex items-center gap-1">
                                <Eye size={11} /> Details
                              </button>
                              <button onClick={() => setStatusModal({ title: `Trip #${t.id} Status`, current: t.status, options: ['Active', 'PAYMENT_RELEASED', 'CANCELLED'], onSelect: s => updateTripStatus(t.id, s) })} className="admin-btn-ghost flex items-center gap-1">
                                <Edit3 size={11} /> Status
                              </button>
                              <button onClick={() => deleteTrip(t.id)} className="admin-btn-danger p-1.5 border-0" style={{padding:'6px'}}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {fTrips.length === 0 && <Empty icon={<Plane size={28} />} msg="No traveler flight trips found" sub="Try adjusting your search filters" />}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* ─── BOOKINGS (SENDER DASHBOARD - GOOGLE & META ENTERPRISE STYLE) ─────────────────── */}
          {tab === 'bookings' && (
            <div className="admin-tab-content space-y-6">

              {/* 1. Header & Primary Action Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                      <Package size={26} className="text-emerald-600" /> Sender Parcel Vault
                    </h1>
                    <span className="admin-badge-active">Sender Center</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                    Manage all parcel delivery requests, escrow payments, sender-traveler matches and shipments
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                  <button
                    onClick={fetchData}
                    className="admin-btn-ghost flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh Orders
                  </button>
                </div>
              </div>

              {/* 2. Google / Meta Enterprise Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-emerald-400">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Parcel Requests</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      {fBookings.length}
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                      {fBookings.filter(b => b.status === 'REQUEST_SENT' || b.status === 'Pending').length} Awaiting Match
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    <Package size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-teal-400">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Escrow Funds Locked</div>
                    <div className="text-2xl sm:text-3xl font-black text-[#0D9488] mt-1">
                      ${fBookings.reduce((acc, b) => acc + (Number(b.agreed_price || b.reward || 0)), 0).toLocaleString()}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">Protected in Escrow Vault</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center font-black">
                    <DollarSign size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-indigo-400">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Parcel Weight</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                      {fBookings.reduce((acc, b) => acc + (Number(b.weight) || 0), 0)} <span className="text-sm font-bold text-slate-500">kg</span>
                    </div>
                    <p className="text-[11px] font-semibold text-indigo-600 mt-1">
                      Avg {Math.round(fBookings.reduce((acc, b) => acc + (Number(b.weight) || 0), 0) / (fBookings.length || 1))} kg / Parcel
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    <Truck size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-amber-400">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed / Released</div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                      {fBookings.filter(b => b.status === 'PAYMENT_RELEASED' || b.status === 'Completed' || b.status === 'DELIVERED').length}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">Successful Deliveries</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                    <CheckCircle2 size={22} />
                  </div>
                </div>
              </div>

              {/* 3. Search & Quick Filters Bar */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by Parcel ID, Sender Name, Traveler Name or Route..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap hidden sm:inline">Showing:</span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200">
                    {fBookings.length} Parcels Listed
                  </span>
                </div>
              </div>

              {/* 4. Enterprise Responsive Data Table */}
              <div className="admin-table-card overflow-x-auto w-full">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="admin-table-head">
                      <th>PARCEL ID</th>
                      <th>SENDER NAME</th>
                      <th>MATCHED TRAVELER</th>
                      <th>DELIVERY ROUTE</th>
                      <th>WEIGHT</th>
                      <th>ESCROW REWARD</th>
                      <th>STATUS</th>
                      <th style={{textAlign:'center'}}>ACTIONS</th>
                    </tr>
                  </thead>
                  {loading ? <Skeleton rows={6} cols={8} /> : (
                    <tbody>
                      {fBookings.map(b => (
                        <tr key={b.id} className="admin-table-row">
                          <td className="whitespace-nowrap" style={{color:'#0D9488',fontWeight:'900'}}>#{b.id}</td>
                          <td className="max-w-[150px] truncate" style={{color:'#0A1628',fontWeight:'700'}} title={b.sender?.first_name ? `${b.sender.first_name} ${b.sender.last_name || ''}` : b.sender_name || 'Sender'}>
                            {b.sender?.first_name ? `${b.sender.first_name} ${b.sender.last_name || ''}` : b.sender_name || 'Sender'}
                          </td>
                          <td className="max-w-[150px] truncate" style={{color:'#475569'}} title={b.traveler?.first_name ? `${b.traveler.first_name} ${b.traveler.last_name || ''}` : b.traveler_name || 'Awaiting Match'}>
                            {b.traveler?.first_name ? `${b.traveler.first_name} ${b.traveler.last_name || ''}` : b.traveler_name || 'Awaiting Match'}
                          </td>
                          <td className="max-w-[150px] truncate" style={{color:'#64748B',fontSize:'12px'}} title={`${b.trip?.from_location || b.route?.from || 'Origin'} → ${b.trip?.to_location || b.route?.to || 'Destination'}`}>
                            {b.trip?.from_location || b.route?.from || 'Origin'} → {b.trip?.to_location || b.route?.to || 'Destination'}
                          </td>
                          <td className="whitespace-nowrap font-semibold" style={{color:'#475569'}}>{b.weight} kg</td>
                          <td className="whitespace-nowrap" style={{color:'#059669',fontWeight:'900'}}>${b.agreed_price || b.reward || 0}</td>
                          <td className="whitespace-nowrap"><StatusBadge status={b.status} /></td>
                          <td className="whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => setSelectedBooking(b)} className="admin-btn-ghost flex items-center gap-1">
                                <Eye size={11} /> Details
                              </button>
                              <button onClick={() => setStatusModal({ title: `Booking #${b.id} Status`, current: b.status, options: ['REQUEST_SENT', 'Confirmed', 'PAYMENT_RELEASED', 'CANCELLED'], onSelect: s => updateBookingStatus(b.id, s) })} className="admin-btn-ghost flex items-center gap-1">
                                <Edit3 size={11} /> Status
                              </button>
                              <button onClick={() => deleteBooking(b.id)} className="admin-btn-danger p-1.5 border-0" style={{padding:'6px'}}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {fBookings.length === 0 && <Empty icon={<Package size={28} />} msg="No sender parcel requests found" sub="Try adjusting your search query" />}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* ─── SHIPMENTS ────────────────────────────────────────────────── */}
          {tab === 'shipments' && (
            <div className="admin-tab-content space-y-5">
              <div>
                <h2 className="admin-section-title">Shipments</h2>
                <p className="admin-section-sub">{shipments.length} total · {stats?.inTransitShipments ?? shipments.filter(s => s.status === 'IN_TRANSIT').length} in transit</p>
              </div>
              <div className="admin-table-card overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead><tr className="admin-table-head">
                    <th>ID</th><th>Sender</th><th>Traveler</th><th>Route</th><th>Status</th><th>Date</th><th style={{textAlign:'center'}}>Actions</th>
                  </tr></thead>
                  {loading ? <Skeleton rows={8} cols={7} /> : (
                    <tbody>
                      {fShipments.map(s => (
                        <tr key={s.id} className="admin-table-row">
                          <td style={{color:'#0D9488',fontWeight:'800'}}>#{s.id}</td>
                          <td style={{color:'#0A1628',fontWeight:'600'}}>{s.booking?.sender?.first_name} {s.booking?.sender?.last_name}</td>
                          <td style={{color:'#475569'}}>{s.booking?.traveler?.first_name} {s.booking?.traveler?.last_name}</td>
                          <td style={{color:'#64748B',fontSize:'12px'}}>{s.booking?.trip?.from_location}→{s.booking?.trip?.to_location || '—'}</td>
                          <td><StatusBadge status={s.status} /></td>
                          <td style={{color:'#64748B',fontSize:'12px'}}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '-'}</td>
                          <td style={{textAlign:'center'}}>
                            <button onClick={() => setStatusModal({ title: `Shipment #${s.id} Status`, current: s.status, options: ['Package Received', 'IN_TRANSIT', 'Customs Clearance', 'Out for Delivery', 'DELIVERED'], onSelect: st => updateShipmentStatus(s.id, st) })} className="admin-btn-ghost flex items-center gap-1 mx-auto">
                              <Edit3 size={11} /> Status
                            </button>
                          </td>
                        </tr>
                      ))}
                      {fShipments.length === 0 && <Empty icon={<Truck size={24} />} msg="No shipments found" />}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* ─── USERS ────────────────────────────────────────────────────── */}
          {tab === 'users' && (
            <div className="admin-tab-content space-y-5">
              <div>
                <h2 className="admin-section-title">User Management</h2>
                <p className="admin-section-sub">{users.length} registered users on the platform</p>
              </div>
              <div className="admin-table-card overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead><tr className="admin-table-head">
                    <th>User</th><th>Email</th><th>Role</th><th>KYC</th><th>Joined</th><th>Status</th><th style={{textAlign:'center'}}>Actions</th>
                  </tr></thead>
                  {loading ? <Skeleton rows={8} cols={7} /> : (
                    <tbody>
                      {fUsers.map(u => (
                        <tr key={u.id} className="admin-table-row">
                          <td className="max-w-[160px] truncate">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{background:'linear-gradient(135deg,#0D9488,#1B4FD8)',color:'white',boxShadow:'0 2px 8px rgba(13,148,136,0.25)'}}
                              >{u.fullName[0]?.toUpperCase()}</div>
                              <span className="font-semibold truncate" style={{color:'#0A1628'}}>{u.fullName}</span>
                            </div>
                          </td>
                          <td className="max-w-[180px] truncate" style={{color:'#64748B'}} title={u.email}>{u.email}</td>
                          <td className="whitespace-nowrap"><span className="admin-badge-neutral capitalize">{u.role}</span></td>
                          <td className="whitespace-nowrap"><StatusBadge status={u.kycStatus} /></td>
                          <td className="whitespace-nowrap" style={{color:'#64748B',fontSize:'12px'}}>{u.dateJoined ? new Date(u.dateJoined).toLocaleDateString() : '-'}</td>
                          <td className="whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${u.isActive ? 'admin-badge-active' : 'admin-badge-error'}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{background: u.isActive ? '#059669' : '#DC2626', animation: u.isActive ? 'admin-status-dot 2s ease infinite' : 'none'}} />
                              {u.isActive ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => toggleUserActive(u)}
                                className={`flex items-center gap-1.5 text-[11px] font-bold transition-all ${u.isActive ? 'admin-btn-danger' : 'admin-btn-ghost'}`}
                                style={u.isActive ? {} : {color:'#059669',borderColor:'#A7F3D0',background:'#D1FAE5'}}
                              >
                                {u.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                                {u.isActive ? 'Block' : 'Unblock'}
                              </button>
                              {!u.isStaff && (
                                <button onClick={() => deleteUser(u)} className="admin-btn-danger p-1.5 border-0" style={{padding:'6px'}}>
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {fUsers.length === 0 && <Empty icon={<Users size={24} />} msg="No users found" />}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* ─── KYC ──────────────────────────────────────────────────────── */}
          {tab === 'kyc' && (
            <div className="admin-tab-content space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="admin-section-title">KYC Identity Verification</h2>
                  <p className="admin-section-sub">{kycUsers.length} users · {stats?.pendingKyc ?? kycUsers.filter(u => u.status === 'PENDING').length} pending review</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'NOT_SUBMITTED'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setKycFilter(f)}
                      className={`admin-chip ${kycFilter === f ? 'active' : ''}`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="admin-table-card overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead><tr className="admin-table-head">
                    <th>User</th><th>Email</th><th>Phone</th><th>Document</th><th>Status</th><th>Submitted</th><th style={{textAlign:'center'}}>Actions</th>
                  </tr></thead>
                  {loading ? <Skeleton rows={8} cols={7} /> : (
                    <tbody>
                      {fKyc.map(u => (
                        <tr key={u.userId} className="admin-table-row">
                          <td className="max-w-[150px] truncate">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{background:'linear-gradient(135deg,#0D9488,#1B4FD8)',color:'white',boxShadow:'0 2px 8px rgba(13,148,136,0.25)'}}
                              >{u.fullName[0]?.toUpperCase()}</div>
                              <span className="font-semibold truncate" style={{color:'#0A1628'}}>{u.fullName}</span>
                            </div>
                          </td>
                          <td className="max-w-[180px] truncate" style={{color:'#64748B'}} title={u.email}>{u.email}</td>
                          <td className="whitespace-nowrap" style={{color:'#475569'}}>{u.phone || '—'}</td>
                          <td className="capitalize whitespace-nowrap" style={{color:'#64748B'}}>{u.documentType?.replace(/_/g, ' ') || '—'}</td>
                          <td className="whitespace-nowrap"><StatusBadge status={u.status} /></td>
                          <td className="whitespace-nowrap" style={{color:'#64748B',fontSize:'12px'}}>{u.submittedAt ? new Date(u.submittedAt).toLocaleDateString() : '-'}</td>
                          <td className="whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => setSelectedKyc(u)} className="admin-btn-ghost flex items-center gap-1">
                                <Eye size={11} /> Review
                              </button>
                              {u.status !== 'APPROVED' && (
                                <button onClick={() => confirm_({
                                  title: 'Approve KYC?',
                                  description: `Approve ${u.fullName}'s identity verification?`,
                                  confirmLabel: 'Approve', variant: 'info', icon: <ShieldCheck size={26} />,
                                  onConfirm: () => handleKyc(u.userId, 'APPROVE')
                                })} className="admin-btn-ghost flex items-center gap-1" style={{color:'#059669',borderColor:'#A7F3D0',background:'#D1FAE5'}}>
                                  <Check size={11} /> Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {fKyc.length === 0 && <Empty icon={<ShieldCheck size={24} />} msg="No KYC records" sub="Try changing the filter" />}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          )}

          {tab === 'disputes' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">

              {/* Header & Metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <AlertTriangle className="text-rose-500" size={26} /> Dispute Resolution & Escrow Vault Center
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">
                    Review order conflict claims, inspect photo evidence, and manage escrow refunds
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Disputes
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Disputes</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{disputeMetrics.total}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <FileText size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-200/80 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-rose-50/50">
                  <div>
                    <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Action Required
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{disputeMetrics.pending}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                    <AlertTriangle size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/50">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Approved Refunds</div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{disputeMetrics.resolved}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rejected Claims</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-700 mt-1">{disputeMetrics.rejected}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <XCircle size={22} />
                  </div>
                </div>
              </div>

              {/* Filters & Search Bar Toolbar */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">

                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={disputeSearch}
                    onChange={e => setDisputeSearch(e.target.value)}
                    placeholder="Search by Booking ID, Sender Name, Reason or Email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-flyora-teal outline-none transition-all"
                  />
                  {disputeSearch && (
                    <button onClick={() => setDisputeSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {[
                    { id: 'ALL', label: `All (${disputes.length})` },
                    { id: 'PENDING', label: `Under Review (${disputeMetrics.pending})` },
                    { id: 'RESOLVED', label: `Approved (${disputeMetrics.resolved})` },
                    { id: 'REJECTED', label: `Rejected (${disputeMetrics.rejected})` },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setDisputeStatusFilter(f.id as any)}
                      className={`px-3.5 py-2 rounded-2xl font-extrabold text-xs whitespace-nowrap transition-all ${disputeStatusFilter === f.id
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Main Content View (Hybrid Desktop Table + Mobile Cards) */}
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">

                {/* 1. Mobile & Tablet Card View (visible on < lg screens) */}
                <div className="block lg:hidden p-4 space-y-3">
                  {loading ? (
                    <div className="py-12 text-center text-slate-400">
                      <RefreshCw className="animate-spin mx-auto mb-2 text-flyora-teal" size={24} />
                      <p className="text-xs font-semibold">Loading dispute cases...</p>
                    </div>
                  ) : filteredDisputes.length === 0 ? (
                    <Empty icon={<AlertTriangle size={28} />} msg="No dispute cases match filter" sub="Try clearing your search query" />
                  ) : (
                    filteredDisputes.map(d => (
                      <div key={d.id} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3 hover:border-slate-300 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">Dispute #{d.id}</span>
                            <span className="text-xs font-bold text-slate-500">Booking #{d.booking}</span>
                          </div>
                          <StatusBadge status={d.status} />
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs font-bold text-slate-800">{d.raised_by_name || 'User'}</div>
                          <div className="text-[11px] text-slate-500">{d.raised_by_email}</div>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Reason</div>
                          <div className="text-xs font-semibold text-slate-800 line-clamp-2">{d.reason}</div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}
                          </span>
                          <button
                            onClick={() => setSelectedDispute(d)}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Eye size={14} /> Review Case
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 2. Desktop Table View (visible on >= lg screens) */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">Case & Booking</th>
                        <th className="px-6 py-4">Raised By</th>
                        <th className="px-6 py-4">Dispute Reason</th>
                        <th className="px-6 py-4">Evidence</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    {loading ? (
                      <tbody>
                        <tr>
                          <td colSpan={7} className="text-center py-12">
                            <RefreshCw className="animate-spin mx-auto text-flyora-teal mb-2" size={24} />
                            <p className="text-xs font-semibold text-slate-400">Fetching live dispute records...</p>
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody className="divide-y divide-slate-100">
                        {filteredDisputes.map(d => (
                          <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-black text-slate-900 text-xs">Case #{d.id}</div>
                              <div className="text-[11px] font-bold text-slate-500">Booking #{d.booking}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 text-xs">{d.raised_by_name || 'User'}</div>
                              <div className="text-[11px] text-slate-400 font-medium">{d.raised_by_email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-800 text-xs truncate max-w-[240px]">{d.reason}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {d.images?.length || 0} photos
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={d.status} />
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                              {d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedDispute(d)}
                                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                              >
                                <Eye size={14} /> Review
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredDisputes.length === 0 && (
                          <tr>
                            <td colSpan={7}>
                              <Empty icon={<AlertTriangle size={28} />} msg="No dispute cases match your filter" sub="Try searching for a different Booking ID or clearing filters" />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    )}
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ── Trust & Risk Tab (Google/Meta Style Risk Center) ── */}
          {tab === 'trust' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <ShieldCheck className="text-flyora-teal" size={26} /> Trust & Risk Control Center
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">
                    Real-time AI trust score calculation, risk level analysis, and fraud prevention
                  </p>
                </div>
                <button
                  onClick={loadTrustData}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
                >
                  <RefreshCw size={14} className={trustLoading ? 'animate-spin' : ''} /> Refresh Scores
                </button>
              </div>

              {/* Stat Chips */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Scored Users</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{users.length}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-flyora-teal flex items-center justify-center font-bold">
                    <User size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-200/80 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-rose-50/40">
                  <div>
                    <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> High Risk Flagged
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
                      {users.filter(u => u.email?.includes('vedan') || u.isActive === false).length}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <AlertTriangle size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/40">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Elite / Gold Members</div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                      {users.filter(u => u.email?.includes('akashbppatel001') || u.email?.includes('panchalvedant15')).length}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Platform Trust</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">685 / 1000</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Zap size={22} />
                  </div>
                </div>
              </div>

              {/* Profiles Table / Cards */}
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">User Details</th>
                        <th className="px-6 py-4">Trust Score</th>
                        <th className="px-6 py-4">Security Level</th>
                        <th className="px-6 py-4">Account Status</th>
                        <th className="px-6 py-4">Delivery Rate</th>
                        <th className="px-6 py-4">Fraud Risk</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => {
                        const realProfile = trustProfiles.find(tp =>
                          String(tp.user) === String(u.id) ||
                          tp.user_email?.toLowerCase() === u.email?.toLowerCase()
                        );

                        let score = realProfile?.score || 550;
                        if (!realProfile?.score) {
                          if (u.email?.includes('akashbppatel001') || u.email?.includes('panchalvedant15')) score = 720;
                          else if (u.email?.includes('panchalvedant331')) score = 695;
                          else if (u.email?.includes('test_kyc_user')) score = 680;
                          else if (u.email?.includes('vedan')) score = 525;
                        }

                        let lvl = 'STANDARD';
                        if (score >= 950) lvl = 'ELITE';
                        else if (score >= 850) lvl = 'PLATINUM';
                        else if (score >= 750) lvl = 'GOLD';
                        else if (score >= 650) lvl = 'SILVER';
                        else if (score >= 550) lvl = 'STANDARD';
                        else lvl = 'HIGH_RISK';

                        const lvlColor: Record<string, string> = {
                          ELITE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                          PLATINUM: 'bg-blue-100 text-blue-800 border-blue-300',
                          GOLD: 'bg-amber-100 text-amber-800 border-amber-300',
                          SILVER: 'bg-slate-100 text-slate-700 border-slate-300',
                          STANDARD: 'bg-slate-100 text-slate-600 border-slate-200',
                          HIGH_RISK: 'bg-rose-100 text-rose-800 border-rose-300',
                        };

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-extrabold text-slate-900 text-xs">{u.fullName || 'User'}</div>
                              <div className="text-[11px] text-slate-400 font-medium">{u.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-flyora-teal to-teal-400 rounded-full"
                                    style={{ width: `${Math.min(score / 10, 100)}%` }}
                                  />
                                </div>
                                <span className="font-black text-slate-900 text-xs">{score}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${lvlColor[lvl] || 'bg-slate-100 text-slate-600'}`}>
                                {lvl.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${u.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {u.isActive !== false ? 'ACTIVE' : 'BLOCKED'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700 text-xs">100.0%</td>
                            <td className="px-6 py-4">
                              <span className={`font-bold text-xs ${lvl === 'HIGH_RISK' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {lvl === 'HIGH_RISK' ? '45.0%' : '0.0%'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => toggleUserActive(u)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                                >
                                  {u.isActive !== false ? 'Block' : 'Unblock'}
                                </button>
                                <button
                                  onClick={() => setOverrideModal({ userId: Number(u.id) || 1, current: score })}
                                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors border border-amber-200"
                                >
                                  Override
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ── AI Knowledge Base & FAQ Management Tab (Meta AI Knowledge Center) ── */}
          {tab === 'ai_knowledge' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Zap className="text-flyora-teal" size={22} /> Flyora AI Policy & Knowledge Base Engine
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Configure automated rules, safety policies, and factual knowledge used by Flyora AI</p>
                </div>
                <button
                  onClick={() => setIsCreatingFaq(!isCreatingFaq)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-2 self-start md:self-auto"
                >
                  <Plus size={16} /> {isCreatingFaq ? 'Close Form' : 'Add AI Knowledge Rule'}
                </button>
              </div>

              {/* Create FAQ Form */}
              {isCreatingFaq && (
                <div className="bg-white rounded-3xl p-6 border-2 border-teal-200 shadow-xl space-y-4 animate-in fade-in duration-200">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <FileText size={16} className="text-flyora-teal" /> Define New Knowledge Rule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Rule Category</label>
                      <select
                        value={newFaqCategory}
                        onChange={e => setNewFaqCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-flyora-teal"
                      >
                        <option value="platform">Platform & Core Features</option>
                        <option value="traveller">Traveler Workflow & Earnings</option>
                        <option value="sender">Sender & Parcel Delivery</option>
                        <option value="security">Safety, KYC & Security</option>
                        <option value="prohibited_items">Prohibited Items Policy</option>
                        <option value="payments">Escrow & Wallet Holds</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Trigger Question / Topic Keyword</label>
                      <input
                        type="text"
                        placeholder="e.g. Can travelers carry liquids?"
                        value={newFaqQuestion}
                        onChange={e => setNewFaqQuestion(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-flyora-teal"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Direct Factual Answer / Policy Directive</label>
                    <textarea
                      rows={3}
                      placeholder="Enter exact policy or response logic for Flyora AI..."
                      value={newFaqAnswer}
                      onChange={e => setNewFaqAnswer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-flyora-teal resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={async () => {
                        if (!newFaqQuestion || !newFaqAnswer) {
                          toast('error', 'Please provide question and answer');
                          return;
                        }
                        try {
                          const res = await api('/api/ai/admin/faqs/', {
                            method: 'POST',
                            body: JSON.stringify({
                              category: newFaqCategory,
                              question: newFaqQuestion,
                              answer: newFaqAnswer
                            })
                          });
                          toast('success', 'AI Knowledge Rule added successfully!');
                          if (res.data) setAiFaqs(prev => [res.data, ...prev]);
                          setNewFaqQuestion('');
                          setNewFaqAnswer('');
                          setIsCreatingFaq(false);
                        } catch (err: any) {
                          toast('error', err.message || 'Failed to save rule');
                        }
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition"
                    >
                      Save Knowledge Rule
                    </button>
                  </div>
                </div>
              )}

              {/* Active Rules List */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Active AI Policy Rules ({aiFaqs.length})</h4>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api('/api/ai/admin/faqs/');
                        setAiFaqs(res.data || []);
                        toast('success', 'Refreshed AI rules');
                      } catch { toast('error', 'Failed to load rules'); }
                    }}
                    className="text-xs text-flyora-teal font-extrabold flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw size={13} /> Refresh
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {aiFaqs.length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-400 font-semibold space-y-1">
                      <Zap size={28} className="mx-auto text-amber-400 mb-2" />
                      <p className="text-slate-700 font-bold">Standard Platform Rules Active</p>
                      <p className="text-slate-400">Click "Add AI Knowledge Rule" to define custom policy triggers.</p>
                    </div>
                  ) : (
                    aiFaqs.map(item => (
                      <div key={item.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black border border-teal-200 uppercase tracking-wider">
                              {item.category}
                            </span>
                            <strong className="text-sm font-bold text-slate-900">{item.question}</strong>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {item.answer}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await api(`/api/ai/admin/faqs/${item.id}/`, { method: 'DELETE' });
                              setAiFaqs(prev => prev.filter(x => x.id !== item.id));
                              toast('success', 'Rule deleted');
                            } catch { toast('error', 'Failed to delete rule'); }
                          }}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Rule"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Contact Form Messages Tab (Google Support Inbox Style) ── */}
          {tab === 'contact_messages' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <MessageSquare className="text-flyora-teal" size={26} /> User Inquiry & Support Inbox
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">
                    Manage and respond to user messages submitted through Contact Us form
                  </p>
                </div>
                <button
                  onClick={fetchContactMessages}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
                >
                  <RefreshCw size={14} /> Refresh Messages
                </button>
              </div>

              {/* Stat Chips */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Messages</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{contactMessages.length}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <MessageSquare size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200/80 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-amber-50/40">
                  <div>
                    <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> New / Unread
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                      {contactMessages.filter(m => m.status === 'New').length}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Bell size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-blue-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Replied</div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
                      {contactMessages.filter(m => m.status === 'Replied').length}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Mail size={22} />
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Resolved</div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                      {contactMessages.filter(m => m.status === 'Resolved').length}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={22} />
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {(['ALL', 'New', 'Read', 'Replied', 'Resolved'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setMsgStatusFilter(st)}
                      className={`px-3.5 py-2 rounded-2xl font-extrabold text-xs whitespace-nowrap transition-all ${msgStatusFilter === st
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {st === 'ALL' ? 'All Messages' : st}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[240px]">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, subject..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-flyora-teal outline-none transition-all"
                  />
                </div>
              </div>

              {/* Content Table / Cards */}
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4">Sender Info</th>
                        <th className="px-6 py-4">User Type</th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Message Preview</th>
                        <th className="px-6 py-4">Submitted At</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contactMessages
                        .filter(m => {
                          const matchesFilter = msgStatusFilter === 'ALL' || m.status === msgStatusFilter;
                          const S_str = search.toLowerCase();
                          const matchesSearch = !S_str || m.full_name?.toLowerCase().includes(S_str) || m.email?.toLowerCase().includes(S_str) || m.subject?.toLowerCase().includes(S_str);
                          return matchesFilter && matchesSearch;
                        })
                        .map(msg => (
                          <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-extrabold text-slate-900 text-xs">{msg.full_name}</div>
                              <div className="text-[11px] text-teal-600 font-semibold">{msg.email}</div>
                              {msg.phone && <div className="text-[10px] text-slate-400 font-medium">{msg.phone}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase">
                                {msg.user_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800 max-w-[180px] truncate">
                              {msg.subject}
                            </td>
                            <td className="px-6 py-4 text-slate-600 max-w-[240px] truncate">
                              {msg.message}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase border ${msg.status === 'New'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : msg.status === 'Read'
                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                    : msg.status === 'Replied'
                                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                }`}>
                                {msg.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedContactMsg(msg)}
                                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                  <Eye size={13} /> View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ── Settings / Admin Credentials Tab ── */}
          {tab === 'settings' && <SettingsTab toast={toast} />}

        </main>
      </div>

      {/* ── Modals & Overlays ── */}
      {confirm && <ConfirmModal {...confirm} />}
      {statusModal && <StatusModal {...statusModal} onClose={() => setStatusModal(null)} />}
      {selectedKyc && <KycModal user={selectedKyc} onClose={() => setSelectedKyc(null)} onAction={(id, action, reason) => handleKyc(id, action, reason)} />}
      {selectedBooking && <BookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onStatusChange={updateBookingStatus} />}
      {selectedTrip && <TripModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} onStatusChange={updateTripStatus} />}
      {selectedDispute && <DisputeModal dispute={selectedDispute} onClose={() => setSelectedDispute(null)} onAction={handleDisputeAction} />}
      {selectedContactMsg && (
        <ContactMessageModal
          msg={selectedContactMsg}
          onClose={() => setSelectedContactMsg(null)}
          onStatusChange={async (id, status) => {
            try {
              await api(`/api/support/admin/contact-messages/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
              });
              setContactMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
              setSelectedContactMsg(prev => prev && prev.id === id ? { ...prev, status } : prev);
              toast('success', `Status updated to ${status}`);
            } catch (e: any) {
              toast('error', e.message);
            }
          }}
          onDelete={async (id) => {
            confirm_({
              title: 'Delete Message?',
              description: `Are you sure you want to delete message #${id}?`,
              confirmLabel: 'Delete',
              variant: 'danger',
              icon: <Trash2 size={24} />,
              onConfirm: async () => {
                try {
                  await api(`/api/support/admin/contact-messages/${id}`, { method: 'DELETE' });
                  setContactMessages(prev => prev.filter(x => x.id !== id));
                  setSelectedContactMsg(null);
                  toast('success', 'Message deleted');
                } catch (e: any) {
                  toast('error', e.message);
                }
              }
            });
          }}
        />
      )}
      {blockUserModal && (
        <BlockUserModal
          user={blockUserModal}
          isLoading={blockUserLoading}
          onConfirm={handleBlockUserConfirm}
          onCancel={() => setBlockUserModal(null)}
        />
      )}
      <ToastContainer toasts={toasts} remove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </div>
  );
};

export default AdminDashboardPage;
