import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Lock, ShieldCheck, CheckCircle2, RefreshCw, KeyRound, ArrowRight, ShieldAlert } from 'lucide-react';

const steps = [
  { step: '01', title: 'Sender Funds Escrow', desc: 'When a booking is accepted, the sender payment is deposited into Flyorago Vault. The traveler is notified that funds are guaranteed.' },
  { step: '02', title: 'Traveler Accepts & Carries', desc: 'The traveler inspects the item, verifies contents, carries it safely during flight, and lands at the destination airport.' },
  { step: '03', title: 'OTP Handover Verification', desc: 'Recipient meets traveler and shares a unique 6-digit OTP code sent secretly to sender phone upon handover.' },
  { step: '04', title: 'Instant Payout Release', desc: 'Once correct OTP is entered, escrow funds are instantly credited to traveler available balance.' }
];

const EscrowPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-flyora-navy overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-flyora-navy via-flyora-navy-light to-flyora-navy opacity-90" />
          <div className="container-flyora relative z-10 text-center">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-flyora-teal/20 border border-flyora-teal/30 text-flyora-teal-bright text-xs font-extrabold uppercase tracking-widest mb-6">
              <Lock size={14} /> Bank-Grade Security
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              Escrow Protection Guarantee
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto font-medium">
              100% financial protection for both senders and travelers. Funds are released ONLY when delivery is confirmed.
            </p>
          </div>
        </section>

        {/* ─── How Escrow Works ────────────────────────────────────────── */}
        <section className="py-20 bg-flyora-gray-50">
          <div className="container-flyora max-w-4xl">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-flyora-teal uppercase tracking-widest block mb-2">Workflow</span>
              <h2 className="text-3xl md:text-4xl font-black text-flyora-navy">How Flyorago Escrow Protects You</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {steps.map((s, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-flyora-gray-200 shadow-sm space-y-4">
                  <span className="text-3xl font-black text-flyora-teal tracking-tight">{s.step}</span>
                  <h3 className="text-xl font-bold text-flyora-navy">{s.title}</h3>
                  <p className="text-xs text-flyora-gray-600 leading-relaxed font-medium">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default EscrowPage;
