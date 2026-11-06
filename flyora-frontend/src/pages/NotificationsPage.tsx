import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, Package, CalendarDays, Wallet, CreditCard,
  Settings, Search, Bell, ChevronDown, ArrowRight,
  ShieldCheck, BadgeCheck, ArrowLeft, CheckCircle2,
  Trash2, BellRing, Smartphone, Laptop, Check,
  Sparkles, RefreshCw, Filter, ExternalLink, CheckCheck
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Sidebar } from '../components/Sidebar';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  triggerNativeNotification 
} from '../utils/webNotification';
import './dashboard.css';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  rawTime: string;
  displayTime: string;
  relativeTime: string;
  category: 'booking' | 'payment' | 'luggage' | 'trust' | 'system';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Helper to format timestamps gracefully with relative and absolute dates
const formatNotificationDate = (rawDate: any): { display: string; relative: string } => {
  if (!rawDate) return { display: 'Recently', relative: 'Just now' };

  let date: Date;
  try {
    if (typeof rawDate === 'string') {
      const normalized = rawDate.includes('T') ? rawDate : rawDate.replace(' ', 'T');
      date = new Date(normalized);
    } else {
      date = new Date(rawDate);
    }

    if (isNaN(date.getTime())) {
      return { display: 'Recently', relative: 'Just now' };
    }
  } catch {
    return { display: 'Recently', relative: 'Just now' };
  }

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  let relative = 'Just now';
  if (diffMinutes >= 1 && diffMinutes < 60) {
    relative = `${diffMinutes}m ago`;
  } else if (diffHours >= 1 && diffHours < 24) {
    relative = `${diffHours}h ago`;
  } else if (diffDays === 1) {
    relative = 'Yesterday';
  } else if (diffDays > 1 && diffDays < 7) {
    relative = `${diffDays}d ago`;
  } else if (diffDays >= 7) {
    relative = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  try {
    const display = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' +
      date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    return { display, relative };
  } catch {
    return { display: 'Recently', relative };
  }
};

// Categorize notification intelligently based on backend type or text content
const resolveCategoryAndAction = (item: any): { 
  category: 'booking' | 'payment' | 'luggage' | 'trust' | 'system'; 
  actionUrl: string; 
  actionLabel: string 
} => {
  const t = (item.type || item.notif_type || item.notification_type || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const text = `${item.title || ''} ${item.message || ''}`.toLowerCase();

  // 1. Trust & KYC
  if (text.includes('kyc') || text.includes('trust') || text.includes('identity')) {
    return { category: 'trust', actionUrl: '/kyc', actionLabel: 'Review KYC Status' };
  }

  // 2. Direct Trips & Bookings (Accept, Request, Match, Transit, Delivery)
  if (
    title.includes('request') ||
    title.includes('accepted') ||
    title.includes('declined') ||
    title.includes('rejected') ||
    title.includes('transit') ||
    title.includes('arrived') ||
    title.includes('delivery') ||
    title.includes('parcel') ||
    t === 'booking' ||
    text.includes('booking')
  ) {
    const isSender = (localStorage.getItem('flyora_user_role') || '').toLowerCase() === 'sender';
    const targetUrl = isSender ? '/sender' : '/traveler';
    return { category: 'booking', actionUrl: targetUrl, actionLabel: 'View Trip & Bookings' };
  }

  // 4. Financial & Wallet / Escrow
  if (
    t === 'wallet' ||
    t === 'payment' ||
    text.includes('escrow') ||
    text.includes('payment') ||
    text.includes('credited to your wallet') ||
    text.includes('released to your wallet') ||
    text.includes('deposited') ||
    text.includes('reward of')
  ) {
    return { category: 'payment', actionUrl: '/wallet', actionLabel: 'View Wallet & Escrow' };
  }

  return { category: 'system', actionUrl: '/dashboard', actionLabel: 'Open Dashboard' };
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, lastMessage } = useSocket();
  const { addToast } = useToast();

  const userName = localStorage.getItem('flyora_user_name') || 'Flyora User';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'FL';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'booking' | 'payment' | 'luggage' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(getNotificationPermission());

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/notifications/');
      if (res.status === 'success' && Array.isArray(res.data)) {
        const mapped: NotificationItem[] = res.data.map((n: any) => {
          const rawTime = n.createdAt || n.created_at || '';
          const { display, relative } = formatNotificationDate(rawTime);
          const meta = resolveCategoryAndAction(n);
          return {
            id: n.id.toString(),
            title: n.title,
            message: n.message,
            rawTime,
            displayTime: display,
            relativeTime: relative,
            category: meta.category,
            read: Boolean(n.is_read),
            actionUrl: meta.actionUrl,
            actionLabel: meta.actionLabel
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();

    const handleCustomNotif = () => {
      fetchNotifs();
    };
    window.addEventListener('flyora:notification', handleCustomNotif);
    return () => window.removeEventListener('flyora:notification', handleCustomNotif);
  }, []);

  // Real-time synchronization: when a new WebSocket alert arrives, prepend it dynamically!
  useEffect(() => {
    if (!lastMessage) return;

    const notifId = lastMessage.notification_id ? String(lastMessage.notification_id) : `ws-${Date.now()}`;
    const rawTime = new Date().toISOString();
    const { display, relative } = formatNotificationDate(rawTime);
    const meta = resolveCategoryAndAction(lastMessage);

    setNotifications(prev => {
      // Avoid duplicate
      if (prev.some(item => item.id === notifId)) return prev;
      return [
        {
          id: notifId,
          title: lastMessage.title || 'Live Activity Update',
          message: lastMessage.message || 'You received a new transaction or booking update.',
          rawTime,
          displayTime: display,
          relativeTime: relative,
          category: meta.category,
          read: false,
          actionUrl: meta.actionUrl,
          actionLabel: meta.actionLabel
        },
        ...prev
      ];
    });
  }, [lastMessage]);

  const handleRequestPushPermission = async () => {
    const perm = await requestNotificationPermission();
    setPushPermission(perm);
    if (perm === 'granted') {
      addToast('System Notifications Active', 'You will receive background alerts on your phone shade and desktop tray.', 'success');
    } else {
      addToast('Notification Permission Denied', 'Please allow notifications in browser site settings.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all/', { method: 'POST' });
    } catch (e) {
      // Fallback
      try {
        await apiFetch('/api/notifications/read/', { method: 'POST' });
      } catch {}
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All Caught Up', 'All notifications have been marked as read.', 'success');
  };

  const handleMarkSingleRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await apiFetch(`/api/notifications/${id}/read/`, { method: 'POST' });
    } catch (err) {
      try {
        await apiFetch(`/api/notifications/read/${id}/`, { method: 'POST' });
      } catch {}
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiFetch(`/api/notifications/${id}/`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete notification not available, removing locally:', err);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await apiFetch('/api/notifications/clear/', { method: 'DELETE' });
    } catch (err) {}
    setNotifications([]);
    addToast('Cleared', 'All notification history cleared.', 'info');
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesFilter = filter === 'all' || n.category === filter;
      const matchesSearch = searchQuery === '' || 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, searchQuery]);

  // Color & Icon renderer for Google/Meta level clarity
  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking':
        return (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm shrink-0">
            <Plane size={20} className="stroke-[2.2]" />
          </div>
        );
      case 'payment':
        return (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shrink-0">
            <Wallet size={20} className="stroke-[2.2]" />
          </div>
        );
      case 'luggage':
        return (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm shrink-0">
            <Package size={20} className="stroke-[2.2]" />
          </div>
        );
      case 'trust':
        return (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-sm shrink-0">
            <ShieldCheck size={20} className="stroke-[2.2]" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 shadow-sm shrink-0">
            <BellRing size={20} className="stroke-[2.2]" />
          </div>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'booking':
        return <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Trip & Booking</span>;
      case 'payment':
        return <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Escrow & Wallet</span>;
      case 'luggage':
        return <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Luggage & Parcel</span>;
      case 'trust':
        return <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Trust & Security</span>;
      case 'system':
      default:
        return <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Platform Update</span>;
    }
  };

  return (
    <div className="fly-dashboard-shell notifications-page">
      <div className="fly-dashboard-layout">
        
        <Sidebar activeItem="Dashboard" />

        {/* Main Content Area */}
        <main className="fly-main-panel pb-24 md:pb-12">
          {/* Top Bar */}
          <div className="fly-topbar">
            <button 
              type="button" 
              className="flex items-center gap-1.5 text-xs font-black text-flyora-navy hover:text-teal-600 transition-colors" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="fly-topbar-actions">
              {/* Real-time WebSocket connection status badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                {isConnected ? 'Live Sync Active' : 'Connecting Sync...'}
              </div>

              <button 
                type="button" 
                className="fly-icon-button fly-bell-button" 
                aria-label="Notifications" 
                onClick={() => fetchNotifs()}
                title="Refresh notifications"
              >
                <RefreshCw size={16} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
              </button>

              <button type="button" className="fly-profile-pill" onClick={() => navigate('/profile')}>
                <div className="fly-profile-avatar">{initials}</div>
                <div className="fly-profile-copy">
                  <span className="fly-profile-name">{userName}</span>
                  <span className="fly-profile-role">Verified Member</span>
                </div>
                <ChevronDown size={14} strokeWidth={2.2} className="fly-profile-chevron" />
              </button>
            </div>
          </div>

          {/* OS Shutter / Tray Push Notification Permission Card */}
          <div className="mb-6 bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                  <BellRing className="text-white animate-bounce" size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black tracking-tight">
                      Instant Push Notifications & OS Shutter Alerts
                    </h3>
                    <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                      Background Ready
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5 leading-relaxed font-medium max-w-2xl">
                    Receive immediate updates in your Android Notification Shade or Windows/Mac System Tray when a traveler accepts your request, luggage arrives, or escrow payment is deposited — even if FlyoraGo is closed!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                {pushPermission === 'granted' ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white text-xs font-black">
                    <CheckCircle2 size={16} className="text-emerald-300" />
                    <span>OS Alerts Enabled</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPushPermission}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-800 hover:bg-slate-100 transition-all font-black text-xs shadow-md active:scale-95"
                  >
                    <Smartphone size={16} />
                    <span>Enable Device Alerts</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Header & Quick Action Hub */}
          <section className="bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-slate-200/80 shadow-xs mb-6 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight !mb-0">Notifications Hub</h1>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-white font-black text-xs shadow-sm">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Real-time activity logs, traveler matchmaking, escrow payments, and luggage verification.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                {unreadCount > 0 && (
                  <button 
                    type="button" 
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5" 
                    onClick={handleMarkAllRead}
                  >
                    <CheckCheck size={15} />
                    <span>Mark all read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button 
                    type="button" 
                    className="px-3.5 py-2 rounded-xl text-xs font-black text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors flex items-center gap-1.5" 
                    onClick={handleClearAll}
                    title="Clear notification history"
                  >
                    <Trash2 size={14} />
                    <span>Clear all</span>
                  </button>
                )}
              </div>
            </div>

            {/* Controls Bar: Category Tabs & Search Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3 w-full">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                    filter === 'all' 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Alerts ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('booking')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                    filter === 'booking' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:text-blue-600'
                  }`}
                >
                  Trips & Bookings
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('payment')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                    filter === 'payment' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  Payments & Escrow
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('luggage')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                    filter === 'luggage' 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:text-amber-600'
                  }`}
                >
                  Luggage & Parcels
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('system')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 whitespace-nowrap ${
                    filter === 'system' 
                      ? 'bg-slate-700 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:text-slate-800'
                  }`}
                >
                  System & Security
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full xl:w-72 shrink-0">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter alerts by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500 focus:bg-white transition-all text-slate-700"
                />
              </div>
            </div>
          </section>

          {/* Notifications Feed */}
          <section className="space-y-3">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkSingleRead(n.id)}
                className={`fly-card border transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl ${
                  n.read 
                    ? 'border-slate-100 bg-white/90' 
                    : 'border-teal-300 bg-gradient-to-r from-teal-50/50 via-sky-50/20 to-white shadow-sm ring-1 ring-teal-200/50'
                }`}
              >
                {/* Left: Category Icon & Content */}
                <div className="flex items-start gap-4 flex-1">
                  {renderCategoryIcon(n.category)}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {getCategoryBadge(n.category)}
                      {!n.read && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500 text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          New
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-slate-400 ml-auto sm:ml-0" title={n.displayTime}>
                        {n.relativeTime}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-flyora-navy leading-snug">
                      {n.title}
                    </h4>

                    <p className="text-xs text-slate-600 font-semibold leading-relaxed mt-1">
                      {n.message}
                    </p>

                    <div className="text-[11px] text-slate-400 font-medium mt-1">
                      {n.displayTime}
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  {n.actionUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkSingleRead(n.id);
                        navigate(n.actionUrl!);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-flyora-navy hover:text-white text-flyora-navy text-xs font-black transition-all flex items-center gap-1.5"
                    >
                      <span>{n.actionLabel || 'View'}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDeleteNotification(n.id, e)}
                    className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {!loading && filteredNotifications.length === 0 && (
              <div className="fly-card border border-dashed border-slate-200 py-16 text-center rounded-2xl">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3 shadow-inner">
                  <Bell size={28} />
                </div>
                <h3 className="text-sm font-black text-flyora-navy">No alerts to show</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 max-w-sm mx-auto">
                  {searchQuery || filter !== 'all' 
                    ? 'No notifications match your current filter or keyword. Try resetting filters.' 
                    : "You are all caught up! When a match occurs, luggage is verified, or payment is made, you'll be notified here."}
                </p>
                {(searchQuery || filter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => { setFilter('all'); setSearchQuery(''); }}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black text-slate-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
