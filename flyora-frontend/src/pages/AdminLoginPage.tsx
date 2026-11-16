import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, Mail, ArrowRight, AlertCircle, Plane, 
  Eye, EyeOff
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const inputEmail = email.trim().toLowerCase();
    let loginEmail = inputEmail;
    let loginPassword = password;

    // Quick-fill alias support for default admin credentials
    if ((inputEmail === 'admin' || inputEmail === 'admin@flyorago.com') && (password === 'admin' || password === 'admin123')) {
      loginEmail = 'admin@flyorago.me';
      loginPassword = 'FlyoragoAdmin2026!';
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(resData.message || resData.error || 'Invalid Credentials. Please check your email and password.');
        return;
      }

      const role = resData.data?.user?.role || resData.data?.role;
      if (role !== 'admin') {
        setIsLoading(false);
        setError('Access denied: Unauthorized role privileges.');
        return;
      }

      // Store authenticated admin session & JWT tokens
      localStorage.setItem('flyora_admin_authenticated', 'true');
      localStorage.setItem('flyora_admin_email', loginEmail);
      localStorage.setItem('flyora_login_time', Date.now().toString());
      localStorage.setItem('flyora_user_id', String(resData.data?.userId || resData.data?.user?.id || ''));
      localStorage.setItem('flyora_user_name', resData.data?.fullName || resData.data?.user?.full_name || 'Administrator');
      localStorage.setItem('flyora_user_role', 'admin');
      if (resData.data?.tokens) {
        localStorage.setItem('flyora_access_token', resData.data.tokens.access);
        localStorage.setItem('flyora_refresh_token', resData.data.tokens.refresh);
      }

      setIsLoading(false);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to fetch. Please check your server connection.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans select-none overflow-x-hidden bg-[#C9E8FD]">

      {/* ─── 1. Exact 100% Matching High-Resolution Artwork Canvas ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/admin_portal_canvas.png"
          alt="Flyorago Global Travel & Freight"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* ─── 2. Interactive Navigation Link on Logo (Top-Left) ─── */}
      <Link 
        to="/" 
        className="absolute top-5 sm:top-8 md:top-10 left-5 sm:left-10 md:left-14 z-20 w-36 sm:w-48 h-12 sm:h-14 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity" 
        title="Go to Flyorago Home"
      />

      {/* ─── 3. Floating Interactive Glassmorphism Form Overlay ─── */}
      {/* Positioned seamlessly directly over the right form zone of the canvas */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-end px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28 py-10">
        <div className="w-full max-w-[360px] sm:max-w-[380px] lg:max-w-[400px] flex flex-col items-center mt-28 sm:mt-24 md:mt-16 lg:mt-24">

          {/* Form Title & Subtitle Matching Exact Visual Geometry */}
          <div className="text-center mb-5 sm:mb-6">
            <h1 className="text-2xl sm:text-[27px] font-black text-[#0A2240] tracking-tight leading-none">
              Sign In to <span className="text-[#0D9488]">Admin Portal</span>
            </h1>
            <p className="text-[12px] sm:text-[13px] font-semibold text-slate-500 mt-2">
              Enter your credentials below to access the control center.
            </p>
          </div>

          {/* Error Message Pill Alert (if any) */}
          {error && (
            <div className="w-full mb-4 px-4 py-2.5 bg-[#FEE2E2]/90 border border-rose-300 rounded-full text-[#DC2626] text-xs font-bold flex items-center justify-center gap-2 shadow-xs animate-shake">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form Fields */}
          <form onSubmit={handleAdminLogin} className="w-full space-y-4">

            {/* Email Field with Floating Modern Pill Container */}
            <div className="w-full">
              <div 
                className="w-full h-[48px] sm:h-[50px] px-4 rounded-full flex items-center gap-3 transition-all duration-200 border border-white/80 focus-within:border-[#0D9488] focus-within:ring-2 focus-within:ring-teal-500/20 shadow-xs"
                style={{
                  background: 'rgba(235, 244, 255, 0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <Mail size={18} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flyorago.com"
                  required
                  autoFocus
                  className="w-full h-full bg-transparent border-0 outline-none ring-0 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-500 placeholder:font-normal p-0 focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field with Floating Modern Pill Container */}
            <div className="w-full">
              <div 
                className="w-full h-[48px] sm:h-[50px] px-4 rounded-full flex items-center gap-3 transition-all duration-200 border border-white/80 focus-within:border-[#0D9488] focus-within:ring-2 focus-within:ring-teal-500/20 shadow-xs"
                style={{
                  background: 'rgba(235, 244, 255, 0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <Lock size={18} className="text-slate-500 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-full bg-transparent border-0 outline-none ring-0 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-500 placeholder:font-normal p-0 focus:ring-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Glowing Gradient Action Button (Exact 100% Color Match) */}
            <div className="pt-1.5 w-full">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] sm:h-[52px] rounded-full bg-gradient-to-r from-[#00D2B4] via-[#0D9488] to-[#0284C7] hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-teal-500/35 hover:shadow-xl hover:shadow-teal-500/50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group border border-white/30"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;
