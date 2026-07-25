import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

export const useKycValidation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>(
    localStorage.getItem('flyora_kyc_status') || 'NOT_SUBMITTED'
  );

  const fetchKycStatus = useCallback(async () => {
    const userId = localStorage.getItem('flyora_user_id');
    if (userId && userId !== 'undefined' && userId !== 'null') {
      try {
        const res = await apiFetch(`/api/kyc/status/${userId}`);
        if (res.status === 'success' && res.data) {
          const status = res.data.status;
          setKycStatus(status);
          localStorage.setItem('flyora_kyc_status', status);
          return status;
        }
      } catch (err) {
        console.error('Error checking KYC status:', err);
      }
    }
    return localStorage.getItem('flyora_kyc_status') || 'NOT_SUBMITTED';
  }, []);

  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]);

  const validateAction = useCallback((action?: () => void): boolean => {
    const currentStatus = (localStorage.getItem('flyora_kyc_status') || kycStatus || 'NOT_SUBMITTED').toUpperCase();
    
    if (currentStatus === 'APPROVED') {
      if (action) {
        action();
      }
      return true;
    }

    // KYC is not approved: open modal and block action
    setIsModalOpen(true);
    return false;
  }, [kycStatus]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    validateAction,
    isModalOpen,
    closeModal,
    kycStatus,
    fetchKycStatus,
  };
};
