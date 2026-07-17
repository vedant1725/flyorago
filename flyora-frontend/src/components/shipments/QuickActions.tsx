import React from 'react';
import { ClipboardList, Headphones, Package, Plane, ReceiptText, Wallet } from 'lucide-react';

const actions = [
  { label: 'Create Shipment', icon: ClipboardList },
  { label: 'Find Traveler', icon: Plane },
  { label: 'Track Package', icon: Package },
  { label: 'Print Label', icon: ReceiptText },
  { label: 'Withdraw Earnings', icon: Wallet },
  { label: 'Support Chat', icon: Headphones },
];

const QuickActions: React.FC = () => {
  return (
    <div className="shipment-actions-grid">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button key={action.label} type="button" className="shipment-action-button">
            <Icon size={22} strokeWidth={1.8} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;
