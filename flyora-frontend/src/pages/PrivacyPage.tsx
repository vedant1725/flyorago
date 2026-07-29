import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Lock, Shield } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-flyora-navy overflow-hidden">
          <div className="container-flyora relative z-10 text-center">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-flyora-teal/20 border border-flyora-teal/30 text-flyora-teal-bright text-xs font-extrabold uppercase tracking-widest mb-4">
              <Lock size={14} /> Data Protection
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Privacy Policy</h1>
            <p className="text-sm text-white/70 max-w-xl mx-auto font-medium">Last updated: July 28, 2026</p>
          </div>
        </section>

        {/* ─── Privacy Content ───────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="container-flyora max-w-3xl space-y-8 text-sm text-slate-700 leading-relaxed font-medium">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h2 className="text-lg font-bold text-flyora-navy mb-2">1. Information We Collect</h2>
              <p>We collect account details (name, email, phone), identity verification documents (passport/ID photo), trip details (flight itinerary), and transaction logs required for secure platform operation.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h2 className="text-lg font-bold text-flyora-navy mb-2">2. How We Protect Your Data</h2>
              <p>All sensitive information, including payment data and ID scans, is encrypted using 256-bit AES encryption both in transit and at rest. We strictly adhere to GDPR and CCPA compliance standards.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h2 className="text-lg font-bold text-flyora-navy mb-2">3. Third-Party Sharing Policy</h2>
              <p>Flyorago never sells user personal data to third parties. Information is shared only with verified payment gateways (Stripe/PayPal) and identity verification services for security processing.</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
