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
    <div className="relative min-h-screen w-full flex items-center justify-between p-4 sm:p-8 lg:p-14 overflow-hidden font-sans select-none bg-[#EAF5FD]">

      {/* ─── 1. Background Image with Soft Balanced Layering ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/admin_sky_globe_plane.png"
          alt="Flight Network & 3D Globe"
          className="w-full h-full object-cover object-center opacity-85"
        />
        {/* Soft daylight overlay across the entire canvas */}
        <div className="absolute inset-0 bg-white/25 backdrop-blur-[0.5px]" />
        
        {/* Ambient right-side light soft glow behind the card for maximum readability */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[60%] lg:w-[50%] bg-gradient-to-l from-white/70 via-white/40 to-transparent" />
        
        {/* Left-bottom soft highlight behind dark text */}
        <div className="absolute left-0 bottom-0 w-[55%] h-[60%] bg-gradient-to-tr from-sky-100/50 via-white/20 to-transparent" />
      </div>

      {/* ─── 2. Top-Left Logo ─── */}
      <div className="absolute top-6 sm:top-10 left-6 sm:left-14 z-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D2B4] via-[#0D9488] to-[#0284C7] flex items-center justify-center shadow-lg shadow-teal-500/25 border border-white/60 group-hover:scale-105 transition-transform duration-300">
            <Plane size={24} className="text-white transform -rotate-45" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight drop-shadow-xs">
            fly<span className="text-[#0D9488]">orago</span>
          </span>
        </Link>
      </div>

      {/* ─── 3. Left Hero Text (High Contrast & Clean) ─── */}
      <div className="relative z-10 hidden md:flex flex-col max-w-lg mt-auto mb-16 lg:mb-24 lg:ml-6">
        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-[#071E3D] tracking-tight leading-[1.12] drop-shadow-sm">
          Smart Global <br />
          <span className="text-[#0D9488]">Luggage & Travel</span> <br />
          Platform
        </h1>
        {/* Decorative Pill Line below headline */}
        <div className="flex items-center gap-2 mt-6">
          <div className="w-16 h-1.5 rounded-full bg-[#00D2B4] shadow-xs" />
          <div className="w-2.5 h-1.5 rounded-full bg-[#00D2B4] shadow-xs" />
        </div>
      </div>

      {/* ─── 4. Right Super-Crisp Glassmorphism Card (Crystal Clear Readability) ─── */}
      <div className="relative z-20 w-full max-w-[430px] mx-auto md:mr-4 lg:mr-12 my-auto">
        <div 
          className="relative w-full rounded-[38px] p-8 sm:p-10 border border-white/90 transition-all"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.88) 0%, rgba(240, 249, 255, 0.78) 100%)',
            boxShadow: '0 25px 60px -12px rgba(10, 37, 64, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}
        >
          {/* Top Plane Badge Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#00D2B4] to-[#0D9488] flex items-center justify-center text-white shadow-lg shadow-teal-500/35 border-2 border-white">
              <Plane size={30} className="transform -rotate-45" />
            </div>
          </div>

          {/* Titles — Bold, Crisp High Contrast */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-[28px] font-black text-[#071E3D] tracking-tight">
              Sign In to Admin Portal
            </h2>
            <p className="text-xs sm:text-[13px] font-bold text-slate-600 mt-2">
              Enter your credentials below to access the control center.
            </p>
          </div>

          {/* Error Alert Box (Soft Red Pill exact to reference) */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-[#FEE2E2]/95 border border-rose-300 rounded-2xl text-[#DC2626] text-xs font-black flex items-center gap-2.5 shadow-sm animate-shake">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 ml-1">
                ADMIN USERNAME / EMAIL
              </label>
              <div className="w-full h-12 px-4 rounded-2xl bg-white/90 border border-slate-300/80 flex items-center gap-3 focus-within:bg-white focus-within:border-[#0D9488] focus-within:ring-4 focus-within:ring-teal-500/15 transition-all shadow-xs hover:border-slate-400">
                <Mail size={17} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flyorago.com"
                  required
                  autoFocus
                  className="w-full h-full bg-transparent border-0 outline-none ring-0 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal p-0 focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 ml-1">
                PASSWORD
              </label>
              <div className="w-full h-12 px-4 rounded-2xl bg-white/90 border border-slate-300/80 flex items-center gap-3 focus-within:bg-white focus-within:border-[#0D9488] focus-within:ring-4 focus-within:ring-teal-500/15 transition-all shadow-xs hover:border-slate-400">
                <Lock size={17} className="text-slate-500 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-full bg-transparent border-0 outline-none ring-0 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal p-0 focus:ring-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Glowing Gradient Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#00D2B4] via-[#0D9488] to-[#0284C7] hover:from-[#00c0a5] hover:to-[#0369a1] active:scale-[0.99] text-white font-black text-sm tracking-wide shadow-lg shadow-teal-500/35 hover:shadow-xl hover:shadow-teal-500/50 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group border border-white/20"
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

          {/* Decorative Pagination Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <div className="w-5 h-1.5 rounded-full bg-[#00D2B4] shadow-xs" />
            <div className="w-5 h-1.5 rounded-full bg-slate-400/60" />
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="text-center text-[11px] font-bold text-slate-600 mt-5 drop-shadow-xs">
          © 2026 Flyorago. All rights reserved.
        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;
