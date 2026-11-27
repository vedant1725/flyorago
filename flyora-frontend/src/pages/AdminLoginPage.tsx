import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, Mail, ArrowRight, AlertCircle, Plane, 
  Eye, EyeOff
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { SeoHead } from '../components/seo/SeoHead';

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
    const loginEmail = inputEmail;
    const loginPassword = password;

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
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-between font-sans select-none overflow-x-hidden bg-[#D4EDFC]">
      <SeoHead
        title="Admin Login | Flyorago"
        description="Flyorago administration portal."
        path="/admin/login"
        noindex
      />

      {/* ─── 1. 100% Clean Background (NO text, NO mock forms behind) ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/admin_clean_bg.webp"
          alt="Flight Network & 3D Globe"
          width={1376}
          height={768}
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft daylight ambient wash */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/20" />
      </div>

      {/* ─── 2. Top-Left Logo ─── */}
      <div className="absolute top-6 sm:top-8 lg:top-10 left-6 sm:left-10 lg:left-14 z-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#00D2B4] via-[#0D9488] to-[#0284C7] flex items-center justify-center shadow-lg shadow-teal-500/25 border border-white/60 group-hover:scale-105 transition-transform duration-300">
            <Plane size={24} className="text-white transform -rotate-45" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight">
            fly<span className="text-[#0D9488]">orago</span>
          </span>
        </Link>
      </div>

      {/* ─── 3. Left Hero Text ─── */}
      <div className="relative z-10 w-full lg:w-[50%] p-6 sm:p-10 lg:p-16 flex flex-col justify-end mt-28 lg:mt-auto mb-6 lg:mb-16">
        <div className="max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0A2240] tracking-tight leading-[1.12]">
            Smart Global <br />
            <span className="text-[#0D9488]">Luggage & Travel</span> <br />
            Platform
          </h1>
          {/* Decorative Pill Line */}
          <div className="flex items-center gap-2 mt-5">
            <div className="w-14 sm:w-16 h-1.5 rounded-full bg-[#00D2B4]" />
            <div className="w-2.5 h-1.5 rounded-full bg-[#00D2B4]" />
          </div>
        </div>
      </div>

      {/* ─── 4. Right Glassmorphism Admin Login Card (Crystal Clear — Zero Overlap) ─── */}
      <div className="relative z-20 w-full lg:w-[50%] flex items-center justify-center lg:justify-end p-4 sm:p-8 lg:pr-16 xl:pr-24 my-auto">
        <div 
          className="relative w-full max-w-[420px] rounded-[36px] p-7 sm:p-9 border border-white/80 shadow-[0_25px_60px_rgba(10,37,64,0.16)] transition-all"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(240, 249, 255, 0.65) 100%)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {/* Top Plane Floating Badge */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#00D2B4] via-[#0D9488] to-[#0284C7] flex items-center justify-center text-white shadow-lg shadow-teal-500/35 border-2 border-white">
              <Plane size={28} className="transform -rotate-45" />
            </div>
          </div>

          {/* Title Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-[27px] font-black text-[#0A2240] tracking-tight">
              Sign In to <span className="text-[#0D9488]">Admin Portal</span>
            </h2>
            <p className="text-xs sm:text-[13px] font-medium text-slate-500 mt-2">
              Enter your credentials below to access the control center.
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-5 px-4 py-2.5 bg-[#FEE2E2]/95 border border-rose-300 rounded-2xl text-[#DC2626] text-xs font-bold flex items-center gap-2.5 shadow-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Username / Email Field */}
            <div className="w-full">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 ml-1">
                ADMIN USERNAME / EMAIL
              </label>
              <div className="w-full h-12 px-4 rounded-full bg-white/70 border border-[#BAE6FD] flex items-center gap-3 focus-within:bg-white focus-within:border-[#0D9488] focus-within:ring-4 focus-within:ring-teal-500/15 transition-all shadow-xs">
                <Mail size={17} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flyorago.com"
                  required
                  autoFocus
                  className="w-full h-full bg-transparent border-0 outline-none ring-0 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal p-0 focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="w-full">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1.5 ml-1">
                PASSWORD
              </label>
              <div className="w-full h-12 px-4 rounded-full bg-white/70 border border-[#BAE6FD] flex items-center gap-3 focus-within:bg-white focus-within:border-[#0D9488] focus-within:ring-4 focus-within:ring-teal-500/15 transition-all shadow-xs">
                <Lock size={17} className="text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-full bg-transparent border-0 outline-none ring-0 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal p-0 focus:ring-0 focus:outline-none"
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

            {/* Glowing Gradient Submit Button */}
            <div className="pt-2 w-full">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#00D2B4] via-[#0D9488] to-[#0284C7] hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-teal-500/35 hover:shadow-xl hover:shadow-teal-500/50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group border border-white/30"
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

          {/* Decorative Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <div className="w-5 h-1.5 rounded-full bg-[#00D2B4]" />
            <div className="w-5 h-1.5 rounded-full bg-slate-300/80" />
          </div>

          {/* Airplane Line Divider & Copyright */}
          <div className="mt-5 pt-4 border-t border-slate-200/60 text-center flex flex-col items-center">
            <Plane size={14} className="text-slate-400 transform -rotate-45 mb-1" />
            <span className="text-[11px] font-semibold text-slate-500">
              © 2026 Flyorago. All rights reserved.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;
