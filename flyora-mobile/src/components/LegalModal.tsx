import React from 'react';
import { LegalScreen, LegalDocType } from '../screens/Legal/LegalScreen';

export { LegalDocType };

interface LegalModalProps {
  visible: boolean;
  initialDoc?: LegalDocType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  initialDoc = 'terms',
  onClose,
}) => {
  if (!visible) return null;
  return <LegalScreen initialDoc={initialDoc} onBack={onClose} />;
};
