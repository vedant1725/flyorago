import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Clock, X, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

interface KycValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kycStatus: string;
}

export const KycValidationModal: React.FC<KycValidationModalProps> = ({
  isOpen,
  onClose,
  kycStatus,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getStatusDetails = () => {
    switch (kycStatus?.toUpperCase()) {
      case 'PENDING':
      case 'UNDER_REVIEW':
        return {
          title: 'KYC Verification Under Review',
          badge: 'Under Review',
          badgeColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
          iconBg: 'bg-sky-50 border-sky-100 text-sky-600',
          icon: <Clock className="w-7 h-7" />,
          description:
            'Your submitted documents are currently being reviewed by our verification team. You will be notified as soon as your account is approved.',
          buttonText: 'Check KYC Status',
        };
      case 'REJECTED':
        return {
          title: 'KYC Verification Rejected',
          badge: 'Action Required',
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
          iconBg: 'bg-rose-50 border-rose-100 text-rose-600',
          icon: <ShieldAlert className="w-7 h-7" />,
          description:
            'Your previous documents could not be verified. Please re-submit valid government-issued identification to unlock full features.',
          buttonText: 'Re-submit Documents',
        };
      default:
        return {
          title: 'Identity Verification Required',
          badge: 'Verification Required',
          badgeColor: 'bg-teal-50 text-flyora-teal border-teal-200/80',
          iconBg: 'bg-teal-50 border-teal-100 text-flyora-teal',
          icon: <ShieldCheck className="w-7 h-7" />,
          description:
            'To ensure trust and security across FlyoraGo, please complete your government ID verification before creating trips or sending packages.',
          buttonText: 'Complete Identity Verification',
        };
    }
  };

  const details = getStatusDetails();

  const handleNavigateToKyc = () => {
    onClose();
    navigate('/kyc');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A1628]/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white w-full max-w-md rounded-[24px] sm:rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center z-10 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3.5 shadow-xs border ${details.iconBg}`}>
          {details.icon}
        </div>

        {/* Status Badge */}
        <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-2.5 ${details.badgeColor}`}>
          {details.badge}
        </span>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-2">
          {details.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-4 leading-relaxed max-w-sm">
          {details.description}
        </p>

        {/* Trust & Highlights Pill Box (Flyora Palette) */}
        <div className="w-full p-3.5 mb-5 rounded-2xl bg-teal-50/50 border border-teal-100/80 text-left space-y-2">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
            <div className="w-5 h-5 rounded-md bg-teal-100 text-flyora-teal flex items-center justify-center shrink-0">
              <ShieldCheck size={13} />
            </div>
            <span>Government ID Verified (Passport / Aadhaar / DL)</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
            <div className="w-5 h-5 rounded-md bg-teal-100 text-flyora-teal flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} />
            </div>
            <span>Unlocks Trip Creation, Parcel Sending & Escrow</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
            <div className="w-5 h-5 rounded-md bg-teal-100 text-flyora-teal flex items-center justify-center shrink-0">
              <Lock size={13} />
            </div>
            <span>100% Encrypted & Confidential Data</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={handleNavigateToKyc}
            className="w-full py-3 px-4 bg-flyora-teal hover:bg-[#0F766E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
          >
            <span>{details.buttonText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-xl transition-all"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
};
