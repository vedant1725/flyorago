import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, X, ArrowRight } from 'lucide-react';

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
          title: 'KYC Verification Pending',
          badge: 'Under Review',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          description:
            'Your submitted KYC documents are currently being reviewed by our verification team. You cannot create new requests or process transactions until your identity is verified.',
          buttonText: 'Check KYC Status',
        };
      case 'REJECTED':
        return {
          title: 'KYC Verification Rejected',
          badge: 'Action Required',
          badgeColor: 'bg-red-100 text-red-800 border-red-300',
          description:
            'Your previous KYC documents were rejected. Please upload valid government-issued identification to unlock request creation and financial features.',
          buttonText: 'Re-submit Identity Documents',
        };
      default:
        return {
          title: 'KYC Verification Required',
          badge: 'Not Submitted',
          badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
          description:
            'You must complete identity verification (KYC) before creating trips, sending parcels, or performing transactions.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all scale-100">
        
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
            {kycStatus === 'REJECTED' ? (
              <ShieldAlert className="w-8 h-8 text-red-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            )}
          </div>

          {/* Badge */}
          <div className="inline-block mb-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${details.badgeColor}`}>
              {details.badge}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {details.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {details.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleNavigateToKyc}
              className="w-full py-3 px-4 bg-gradient-to-r from-flyora-teal to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{details.buttonText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
