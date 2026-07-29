import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, Shield, CheckCircle2 } from 'lucide-react';

const TermsPage: React.FC = () => {
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
              <FileText size={14} /> Legal Terms
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Terms of Service</h1>
            <p className="text-sm text-white/70 max-w-xl mx-auto font-medium">Last updated: July 28, 2026</p>
          </div>
        </section>

        {/* ─── Document Content ─────────────────────────────────────────── */}
        <section className="py-16 bg-white">
          <div className="container-flyora max-w-3xl space-y-8 text-sm text-slate-700 leading-relaxed font-medium">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h2 className="text-lg font-bold text-flyora-navy mb-2">1. Agreement to Terms</h2>
              <p>By accessing or using the Flyorago peer-to-peer logistics platform, mobile application, or website, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access or use our services.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h2 className="text-lg font-bold text-flyora-navy mb-2">2. Traveler & Sender Verification (KYC)</h2>
              <p>All users must complete identity verification including government-issued photo ID and phone number verification. Flyorago reserves the right to reject or terminate accounts failing security screening.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h2 className="text-lg font-bold text-flyora-navy mb-2">3. Prohibited Items & Aviation Safety</h2>
              <p>Users must comply with all international aviation transport laws (ICAO/IATA) and TSA customs standards. Strictly prohibited items include illegal drugs, firearms, hazardous chemicals, counterfeit goods, or uninspected sealed packages.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
              <h2 className="text-lg font-bold text-flyora-navy mb-2">4. Escrow Payment & Fee Breakdown</h2>
              <p>Sender payments are securely held in Flyorago Escrow. Release of funds occurs upon valid 6-digit OTP delivery confirmation. Platform service fees are calculated per transaction.</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
