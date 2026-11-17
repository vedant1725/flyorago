import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, AlertOctagon, AlertTriangle, Bell, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  addToast: (titleOrObj: string | Omit<ToastItem, 'id'>, messageOrType?: string | ToastType, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    // Deduplication check: prevent duplicate popups within 2.5 seconds
    const key = `${(toast.title || '').trim()}:::${(toast.message || '').trim()}`;
    const now = Date.now();
    const lastSeen = recentToastsRef.current.get(key) || 0;
    if (now - lastSeen < 2500) {
      return;
    }
    recentToastsRef.current.set(key, now);

    // Clean up old deduplication cache entries
    if (recentToastsRef.current.size > 20) {
      for (const [k, time] of recentToastsRef.current.entries()) {
        if (now - time > 10000) {
          recentToastsRef.current.delete(k);
        }
      }
    }

    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id, duration: toast.duration || 4500 };

    setToasts(prev => [newToast, ...prev].slice(0, 4));

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [removeToast]);

  const addToast = useCallback((
    titleOrObj: string | Omit<ToastItem, 'id'>,
    messageOrType?: string | ToastType,
    maybeType?: ToastType
  ) => {
    if (typeof titleOrObj === 'object') {
      showToast(titleOrObj);
      return;
    }

    const isToastType = (val?: string): val is ToastType => {
      return val === 'success' || val === 'error' || val === 'warning' || val === 'info';
    };

    let type: ToastType = 'info';
    let title: string = titleOrObj;
    let message: string = '';

    if (isToastType(messageOrType)) {
      type = messageOrType;
      title = titleOrObj;
      message = '';
    } else {
      message = messageOrType || '';
      if (maybeType && isToastType(maybeType)) {
        type = maybeType;
      }
    }

    showToast({ type, title, message });
  }, [showToast]);

  const success = useCallback((title: string, message: string = '') => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const error = useCallback((title: string, message: string = '') => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const warning = useCallback((title: string, message: string = '') => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const info = useCallback((title: string, message: string = '') => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  // Clean interceptor for window.alert to render our friendly brand popups
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: string) => {
      if (!msg) return;
      const strMsg = String(msg);
      const isError = /fail|error|invalid|incorrect|exceed|denied|wrong|reject/i.test(strMsg);
      const isSuccess = /success|confirm|verified|release|created|posted|updated|accepted|done|🎉|✅/i.test(strMsg);
      const type: ToastType = isError ? 'error' : isSuccess ? 'success' : 'info';

      let title = 'Notification';
      if (isError) title = 'Notice';
      else if (isSuccess) title = 'Success';

      showToast({
        type,
        title,
        message: strMsg,
        duration: 4000,
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, addToast, success, error, warning, info, removeToast }}>
      {children}

      {/* ─── Simple, Clean Floating Notification Popup (Flyora Brand Palette, No Top/Border Strips) ─── */}
      <aside
        aria-label="Notifications"
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const iconContainer = isSuccess
            ? 'bg-teal-50 text-flyora-teal border-teal-100'
            : isError
            ? 'bg-rose-50 text-rose-500 border-rose-100'
            : isWarning
            ? 'bg-amber-50 text-amber-600 border-amber-100'
            : 'bg-teal-50 text-flyora-teal border-teal-100';

          const badgeLabel = isSuccess
            ? 'Success'
            : isError
            ? 'Notice'
            : isWarning
            ? 'Warning'
            : 'Notification';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto relative bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_8px_30px_rgba(10,22,40,0.08)] transition-all duration-200 animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-start gap-3">
                {/* Clean Brand Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${iconContainer}`}>
                  {isSuccess && <CheckCircle2 size={16} strokeWidth={2.5} />}
                  {isError && <AlertOctagon size={16} strokeWidth={2.5} />}
                  {isWarning && <AlertTriangle size={16} strokeWidth={2.5} />}
                  {!isSuccess && !isError && !isWarning && <Bell size={16} strokeWidth={2.5} />}
                </div>

                {/* Notification Text Content */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {badgeLabel}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Just now
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight leading-snug">
                    {toast.title}
                  </h4>

                  {toast.message && (
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5 break-words">
                      {toast.message}
                    </p>
                  )}

                  {toast.actionLabel && (
                    <button
                      type="button"
                      onClick={() => {
                        if (toast.onAction) toast.onAction();
                        removeToast(toast.id);
                      }}
                      className="mt-2 text-xs font-bold text-flyora-teal hover:text-teal-700 flex items-center gap-1 underline underline-offset-4 cursor-pointer"
                    >
                      {toast.actionLabel}
                    </button>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  aria-label="Close notification"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
