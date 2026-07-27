import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Plane, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Valid Admin Credentials check
      const trimmedEmail = email.trim().toLowerCase();
      if ((trimmedEmail === 'admin@flyorago.com' || trimmedEmail === 'admin') && (password === 'admin' || password === 'admin123')) {
        localStorage.setItem('flyora_admin_authenticated', 'true');
        localStorage.setItem('flyora_admin_email', 'admin@flyorago.com');
        setIsLoading(false);
        navigate('/admin/dashboard');
      } else {
        setIsLoading(false);
        setError('Invalid Admin Credentials. Please check username/password.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between font-sans text-slate-100 relative overflow-hidden">
      {/* Background Decorator Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="p-6 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-flyora-teal to-teal-400 flex items-center justify-center shadow-lg">
              <Plane size={18} className="text-white transform -rotate-45" />
            </div>
            <span className="text-xl font-black text-white">fly<span className="text-flyora-teal">orago</span></span>
            <span className="ml-2 text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full">
              System Admin
            </span>
          </Link>

          <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            &larr; Back to Main Website
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-flyora-teal flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal Sign In</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Authorized System Administrators Only</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Admin Username / Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flyorago.com"
                  required
                  className="w-full h-12 pl-11 pr-4 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-semibold text-white placeholder-slate-600 focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-11 pr-4 bg-slate-950/80 border border-slate-800 rounded-xl text-sm font-semibold text-white placeholder-slate-600 focus:border-flyora-teal focus:ring-2 focus:ring-flyora-teal/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 font-medium">
              <p className="font-bold text-slate-300 mb-0.5">Demo Admin Credentials:</p>
              <p>Email: <span className="text-flyora-teal font-mono">admin@flyorago.com</span> | Pass: <span className="text-flyora-teal font-mono">admin</span></p>
            </div>

            <Button 
              type="submit" 
              variant="teal" 
              fullWidth 
              className="h-12 text-sm font-bold shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'} &rarr;
            </Button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-600 border-t border-slate-900 z-10">
        © 2026 Flyorago Security & Compliance. Strictly restricted access.
      </footer>
    </div>
  );
};

export default AdminLoginPage;
