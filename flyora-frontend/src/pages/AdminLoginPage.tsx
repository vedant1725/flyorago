import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Plane, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const inputEmail = email.trim().toLowerCase();
      const savedEmail = (localStorage.getItem('flyora_admin_email') || 'admin@flyorago.com').trim().toLowerCase();
      const savedPassword = localStorage.getItem('flyora_admin_password') || 'admin';

      // Check if email matches updated email or default admin aliases
      const emailMatches = (
        inputEmail === savedEmail ||
        inputEmail === 'admin' ||
        inputEmail === 'admin@flyorago.com' ||
        inputEmail.includes('admin')
      );

      // Check if password matches updated password or default fallback (if password not changed)
      const passwordMatches = (
        password === savedPassword ||
        (!localStorage.getItem('flyora_admin_password') && (password === 'admin' || password === 'admin123'))
      );

      if (emailMatches && passwordMatches) {
        localStorage.setItem('flyora_admin_authenticated', 'true');
        localStorage.setItem('flyora_admin_email', inputEmail);
        setIsLoading(false);
        navigate('/admin/dashboard');
      } else {
        setIsLoading(false);
        setError('Invalid Admin Credentials. Please check your email and password.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col justify-between font-sans text-slate-800 relative overflow-hidden selection:bg-teal-500 selection:text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Background Decorator Gradient Blobs (Light Mode Only) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-400/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[15%] w-[350px] h-[350px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="p-5 sm:p-6 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-flyora-teal to-teal-400 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Plane size={20} className="text-white transform -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                fly<span className="text-flyora-teal">orago</span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
                Enterprise Gateway
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-flyora-teal" /> ISO 27001 Certified
            </span>
            <Link to="/" className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-all shadow-xs">
              &larr; Main Website
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-6">
        <div className="w-full max-w-md bg-white/95 border border-slate-200/90 rounded-[32px] p-7 sm:p-9 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">

          {/* Top Accent Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-900 via-flyora-teal to-teal-400" />

          {/* Icon Header */}
          <div className="text-center mb-7">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-slate-900 via-teal-950 to-slate-900 text-flyora-teal flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-900/15 border border-teal-500/20 group">
              <Shield size={32} className="text-flyora-teal animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Admin Sign In</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Authorized Management & Governance Gateway
            </p>
          </div>

          {/* Alert Error Box */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-200 shadow-xs">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            {/* Admin Email / Username Input */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Admin Username / Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flyorago.com"
                  required
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Admin Password Input with Eye Toggle */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
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
                  className="w-full h-12 pl-11 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-flyora-teal focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-13 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 hover:from-slate-800 hover:to-slate-900 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-slate-900/15 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2 group cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Access Admin Control Center</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Badge Footer Inside Card */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-500" /> 256-Bit SSL Encrypted Enterprise Auth
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 font-medium border-t border-slate-200/80 bg-white/60 backdrop-blur-md z-10">
        © 2026 Flyorago Governance & Platform Security. Restricted to Authorized Personnel Only.
      </footer>
    </div>
  );
};

export default AdminLoginPage;
