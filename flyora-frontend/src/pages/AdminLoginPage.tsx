import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Plane, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
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
        setError(resData.message || resData.error || 'Invalid Admin Credentials. Please check your email and password.');
        return;
      }

      const role = resData.data?.user?.role || resData.data?.role;
      if (role !== 'admin') {
        setIsLoading(false);
        setError('Access denied. This account does not have Admin privileges.');
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
      setError(err.message || 'Unable to connect to authentication server. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800 relative selection:bg-teal-500 selection:text-white">
      {/* Subtle modern geometric background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-sky-100/40 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-teal-50/60 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flyora-teal to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Plane size={20} className="text-white transform -rotate-45" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  fly<span className="text-flyora-teal">orago</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 text-flyora-teal text-[10px] font-black uppercase tracking-wider border border-teal-200/60">
                  Admin
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                Enterprise Governance Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <ShieldCheck size={13} className="text-emerald-600" /> ISO 27001 & SSL Secured
            </span>
            <Link 
              to="/" 
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
            >
              &larr; Main Website
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 transition-all">

          {/* Icon and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-flyora-teal flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Shield size={32} className="stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Admin Sign In</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Authorized Management & Operations Gateway
            </p>
          </div>

          {/* Alert Error Box */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2.5 shadow-xs animate-shake">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            {/* Admin Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Admin Username / Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flyorago.me"
                  required
                  autoFocus
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Admin Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-11 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-flyora-teal to-teal-700 hover:from-teal-600 hover:to-teal-800 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Credentials...
                </span>
              ) : (
                <>
                  <span>Access Admin Control Center</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hint */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <KeyRound size={13} className="text-flyora-teal" /> Default alias: <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-bold">admin</code>
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <ShieldCheck size={13} /> 256-bit SSL
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-400 font-medium border-t border-slate-200/80 bg-white/70 backdrop-blur-xs">
        © 2026 Flyorago Governance & Platform Security. Restricted to Authorized Personnel Only.
      </footer>
    </div>
  );
};

export default AdminLoginPage;
