import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plane, Package, CalendarDays, Wallet, CreditCard,
  Headphones, Gift, UserRound, Settings, Search, Bell, ChevronDown,
  ArrowRight, ShieldCheck, BadgeCheck, FileText, ArrowLeft,
  Calendar, CheckCircle2, AlertTriangle, Trash2, CheckCircle
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Sidebar } from '../components/Sidebar';
import './dashboard.css';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Trips', icon: Plane },
  { label: 'Shipments', icon: Package },
  { label: 'Bookings', icon: CalendarDays },
  { label: 'Wallet', icon: Wallet },
  { label: 'Earnings', icon: CreditCard },
  { label: 'Messages', icon: Headphones },
  { label: 'Support', icon: Gift },
  { label: 'Profile', icon: UserRound },
  { label: 'Settings', icon: Settings },
];

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'Booking' | 'Payment' | 'System';
  read: boolean;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('flyora_user_name') || 'Vedant Sharma';
  const initials = userName.split(' ').map(n => n[0]).join('');

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'Booking' | 'Payment' | 'System'>('all');

  React.useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await apiFetch('/api/notifications/');
        if (res.status === 'success' && Array.isArray(res.data)) {
          setNotifications(res.data.map((n: any) => ({
            id: n.id.toString(),
            title: n.title,
            message: n.message,
            time: new Date(n.created_at).toLocaleString(),
            category: n.notification_type === 'Booking' ? 'Booking' : 
                      n.notification_type === 'Payment' ? 'Payment' : 'System',
            read: n.is_read
          })));
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchNotifs();
  }, []);

  const handleSidebarClick = (label: string) => {
    const route = 
      label === 'Dashboard' ? '/dashboard' :
      label === 'Trips' ? '/trips' :
      label === 'Shipments' ? '/shipments' :
      label === 'Bookings' ? '/bookings' :
      label === 'Wallet' ? '/wallet' :
      label === 'Earnings' ? '/earnings' :
      label === 'Messages' ? '/messages' :
      label === 'Support' ? '/support' :
      label === 'Profile' ? '/profile' :
      label === 'Settings' ? '/settings' : undefined;
    if (route) navigate(route);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || n.category === filter);

  return (
    <div className="fly-dashboard-shell notifications-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Dashboard" />

        {/* Main Panel */}
        <main className="fly-main-panel">
          {/* Topbar */}
          <div className="fly-topbar">
            <button type="button" className="flex items-center gap-1 text-xs font-black text-flyora-navy" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={14} /> Back to Dashboard
            </button>

            <div className="fly-topbar-actions">
              <button type="button" className="fly-icon-button fly-bell-button" aria-label="Notifications" onClick={() => navigate('/notifications')}>
                <Bell size={17} strokeWidth={2} />
                <span className="fly-badge-dot">3</span>
              </button>

              <button type="button" className="fly-profile-pill" onClick={() => navigate('/profile')}>
                <div className="fly-profile-avatar">{initials}</div>
                <div className="fly-profile-copy">
                  <span className="fly-profile-name">{userName}</span>
                  <span className="fly-profile-role">Traveler</span>
                </div>
                <ChevronDown size={14} strokeWidth={2.2} className="fly-profile-chevron" />
              </button>
            </div>
          </div>

          {/* Header */}
          <section className="trips-header fly-card">
            <div>
              <h1 className="trips-header__title">Notifications Hub</h1>
              <p className="trips-header__subtitle">Manage critical transaction alerts, matches, and system credentials.</p>
            </div>
            <button type="button" className="fly-btn fly-btn-secondary" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          </section>

          {/* Filters */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-6">
            <button type="button" onClick={() => setFilter('all')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              filter === 'all' ? 'bg-white text-flyora-navy shadow-sm' : 'text-slate-500 hover:text-flyora-navy'
            }`}>All Alerts</button>
            <button type="button" onClick={() => setFilter('Booking')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              filter === 'Booking' ? 'bg-white text-flyora-navy shadow-sm' : 'text-slate-500 hover:text-flyora-navy'
            }`}>Bookings</button>
            <button type="button" onClick={() => setFilter('Payment')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              filter === 'Payment' ? 'bg-white text-flyora-navy shadow-sm' : 'text-slate-500 hover:text-flyora-navy'
            }`}>Payments</button>
            <button type="button" onClick={() => setFilter('System')} className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              filter === 'System' ? 'bg-white text-flyora-navy shadow-sm' : 'text-slate-500 hover:text-flyora-navy'
            }`}>System</button>
          </div>

          {/* Notifications Feed List */}
          <section className="space-y-4">
            {filteredNotifications.map((n) => (
              <div key={n.id} className={`fly-card border flex gap-4 items-start ${
                n.read ? 'border-gray-100/70 bg-white/70' : 'border-teal-100 bg-teal-50/10'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  n.category === 'Booking' ? 'bg-blue-50 text-blue-500' :
                  n.category === 'Payment' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                }`}>
                  {n.category === 'Booking' ? <CalendarDays size={16} /> :
                   n.category === 'Payment' ? <Wallet size={16} /> : <Settings size={16} />}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black text-flyora-navy">{n.title}</span>
                    <span className="text-[10px] text-gray-400 font-bold">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1">{n.message}</p>
                </div>

                <button type="button" className="text-gray-300 hover:text-red-500 shrink-0" onClick={() => handleDeleteNotification(n.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {filteredNotifications.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 font-bold">No notifications to display.</div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
