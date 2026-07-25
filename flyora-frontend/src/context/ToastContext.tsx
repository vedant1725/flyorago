import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X, Sparkles, ShieldCheck } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id, duration: toast.duration || 4500 };
    
    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5 active popups

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [removeToast]);

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

  // Intercept native window.alert to render our custom Google/Microsoft style dark popups
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: string) => {
      if (!msg) return;
      const strMsg = String(msg);
      const isError = /fail|error|invalid|incorrect|exceed|denied|wrong|reject/i.test(strMsg);
      const isSuccess = /success|confirm|verified|release|created|posted|updated|accepted|done|🎉|✅/i.test(strMsg);
      const type: ToastType = isError ? 'error' : isSuccess ? 'success' : 'info';
      
      let title = 'System Notification';
      if (isError) title = 'Action Required / Error';
      else if (isSuccess) title = 'Success Confirmation';

      showToast({
        type,
        title,
        message: strMsg,
        duration: 5000,
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}

      {/* Floating Dark Popup Toast Container (Top Right Position) */}
      <aside aria-label="System Notifications" className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const glowColor = isSuccess 
            ? 'shadow-[0_0_25px_rgba(16,185,129,0.25)] border-emerald-500/40' 
            : isError 
            ? 'shadow-[0_0_25px_rgba(244,63,94,0.25)] border-rose-500/40' 
            : isWarning 
            ? 'shadow-[0_0_25px_rgba(245,158,11,0.25)] border-amber-500/40' 
            : 'shadow-[0_0_25px_rgba(6,182,212,0.25)] border-cyan-500/40';

          const accentBg = isSuccess 
            ? 'bg-emerald-500 text-emerald-950' 
            : isError 
            ? 'bg-rose-500 text-rose-950' 
            : isWarning 
            ? 'bg-amber-500 text-amber-950' 
            : 'bg-cyan-500 text-cyan-950';

          const badgeText = isSuccess 
            ? 'ACTION SUCCESSFUL' 
            : isError 
            ? 'ACTION FAILED' 
            : isWarning 
            ? 'SYSTEM WARNING' 
            : 'SYSTEM NOTIFICATION';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden bg-slate-950/95 backdrop-blur-2xl border rounded-2xl p-4 text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${glowColor}`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${accentBg}`} />

              <div className="flex items-start gap-3 pt-1">
                {/* Status Icon Badge */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${accentBg}`}>
                  {isSuccess && <CheckCircle2 size={20} strokeWidth={2.5} />}
                  {isError && <AlertOctagon size={20} strokeWidth={2.5} />}
                  {isWarning && <AlertTriangle size={20} strokeWidth={2.5} />}
                  {!isSuccess && !isError && !isWarning && <Sparkles size={20} strokeWidth={2.5} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                      {badgeText}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white tracking-tight leading-snug truncate">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="text-xs text-slate-300 font-medium leading-relaxed mt-1 break-words">
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
                      className="mt-3 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-4"
                    >
                      {toast.actionLabel}
                    </button>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-800"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Progress Bar Animation */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800/80 overflow-hidden">
                <div
                  className={`h-full ${accentBg} transition-all ease-linear`}
                  style={{
                    animation: `toastProgress ${toast.duration || 4500}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </aside>

      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
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
