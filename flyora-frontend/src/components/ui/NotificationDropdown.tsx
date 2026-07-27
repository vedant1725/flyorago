import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, ChevronRight, Package, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { useSocket } from '../../context/SocketContext';

interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  notification_type?: string;
}

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { lastMessage } = useSocket();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/notifications/');
      const list = res.data || res.results || (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time WebSocket notifications & prepend live
  useEffect(() => {
    if (lastMessage) {
      const newNotif: NotificationItem = {
        id: Date.now(),
        title: lastMessage.title || lastMessage.type?.replace(/_/g, ' ') || 'New Update',
        message: lastMessage.message || 'You have a new activity update.',
        created_at: new Date().toISOString(),
        is_read: false,
        notification_type: lastMessage.type || 'Booking',
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  }, [lastMessage]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all/', { method: 'POST' }).catch(() => {});
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markSingleRead = async (id: string | number) => {
    try {
      await apiFetch(`/api/notifications/${id}/read/`, { method: 'PATCH' }).catch(() => {});
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-flyora-teal/10 text-flyora-teal font-black text-[11px] px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-slate-500 hover:text-flyora-teal flex items-center gap-1 transition-colors"
                >
                  <CheckCheck size={14} /> Mark read
                </button>
              )}
              <button
                onClick={fetchNotifications}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50">
            {notifications.length > 0 ? (
              notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markSingleRead(n.id);
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                  className={`p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex gap-3 items-start ${
                    !n.is_read ? 'bg-teal-50/20' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !n.is_read ? 'bg-flyora-teal text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {n.notification_type === 'Payment' ? <Info size={16} /> : <Package size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className={`text-xs font-bold truncate ${!n.is_read ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                        {n.title}
                      </h4>
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-flyora-teal flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <Bell size={24} />
                </div>
                <p className="text-sm font-bold text-slate-700">No Notifications</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-xs font-bold text-flyora-teal hover:text-teal-700 flex items-center justify-center gap-1 w-full py-1"
            >
              View All Notifications <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
