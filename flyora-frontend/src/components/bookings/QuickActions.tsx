import React from 'react';
import { ClipboardList, MessageSquare, Package, Plane, RotateCw, Wallet } from 'lucide-react';

const actions = [
  { label: 'Create Booking', icon: ClipboardList },
  { label: 'Find Traveler', icon: Plane },
  { label: 'View Trips', icon: Package },
  { label: 'Withdraw Earnings', icon: Wallet },
  { label: 'Support Chat', icon: MessageSquare },
  { label: 'Sync Status', icon: RotateCw },
];

const QuickActions: React.FC = () => {
  return (
    <div className="bookings-actions-grid">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button key={action.label} type="button" className="bookings-action-button">
            <Icon size={22} strokeWidth={1.8} />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;