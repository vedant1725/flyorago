import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

// Max session duration: 3 Hours (in milliseconds)
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

export const SessionWatchdog: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('flyora_access_token');
      const loginTimeStr = localStorage.getItem('flyora_login_time');
      const pathname = location.pathname;

      const publicPrefixes = [
        '/login',
        '/signup',
        '/forgot-password',
        '/admin/login',
        '/how-it-works',
        '/services',
        '/about',
        '/contact',
        '/terms',
        '/privacy',
        '/safety',
        '/escrow',
        '/careers',
        '/press',
        '/blog'
      ];
      const isExactHome = pathname === '/';
      const isPublic = isExactHome || publicPrefixes.some(p => pathname === p || pathname.startsWith(p + '/'));

      // If user is on a protected route without any token, redirect immediately to login
      if (!token) {
        if (!isPublic) {
          console.warn('[Security Watchdog] Protected route accessed without access token. Redirecting to login.');
          if (pathname.startsWith('/admin')) {
            navigate('/admin/login', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
        }
        return;
      }

      if (loginTimeStr) {
        const loginTime = parseInt(loginTimeStr, 10);
        const now = Date.now();
        const elapsed = now - loginTime;

        if (elapsed >= THREE_HOURS_MS) {
          // Trigger security session expiry
          console.warn('[Security Watchdog] 3-Hour session expired. Clearing credentials and logging out.');
          
          localStorage.removeItem('flyora_access_token');
          localStorage.removeItem('flyora_refresh_token');
          localStorage.removeItem('flyora_user_id');
          localStorage.removeItem('flyora_user_name');
          localStorage.removeItem('flyora_user_role');
          localStorage.removeItem('flyora_login_time');
          localStorage.removeItem('flyora_admin_authenticated');
          localStorage.removeItem('flyora_admin_email');
          localStorage.removeItem('flyora_user_email');

          addToast({
            type: 'warning',
            title: 'Session Expired',
            message: 'Your session expired. Please sign in again.',
            duration: 9000,
          });

          if (pathname.startsWith('/admin')) {
            navigate('/admin/login?session_expired=true', { replace: true });
          } else {
            navigate('/login?session_expired=true', { replace: true });
          }
        }
      } else {
        // If logged in with token but no login timestamp, set it now
        localStorage.setItem('flyora_login_time', Date.now().toString());
      }
    };

    // Initial check
    checkSession();

    // Check periodically every 10 seconds
    const interval = setInterval(checkSession, 10000);
    return () => clearInterval(interval);
  }, [location.pathname, navigate, addToast]);

  return null;
};

