import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import { getBreadcrumbSchema, getWebPageSchema } from '../data/seoConfig';
import { ShieldCheck, UserCheck, Lock, Eye, ShieldAlert, ArrowRight } from 'lucide-react';

const safetyPillars = [
  {
    icon: <UserCheck size={28} className="text-flyora-teal" />,
    title: 'Government ID & Selfie KYC Verification',
    desc: 'Every single traveler and sender on Flyorago undergoes mandatory passport/ID verification and live facial selfie scanning before performing any actions.'
  },
  {
    icon: <Lock size={28} className="text-blue-500" />,
    title: 'Secure Escrow Payment Hold',
    desc: 'Sender funds are locked securely in escrow and released to the traveler ONLY after the sender or recipient enters the verified OTP code upon successful delivery.'
  },
  {
    icon: <Eye size={28} className="text-purple-500" />,
    title: 'Visual Physical Handover Verification',
    desc: 'Both parties perform mutual inspection during package handover. Travelers have 100% right to inspect package contents before accepting any shipment.'
  },
  {
    icon: <ShieldAlert size={28} className="text-red-500" />,
    title: 'Zero Prohibited Items Enforcement',
    desc: 'Strict automated AI filters and aviation compliance policies prohibit dangerous goods, illegal substances, contraband, liquids, or unverified electronics.'
  }
];

const SafetyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const title = 'Safety & Security Standards — KYC, Inspection & Escrow | Flyorago';
  const description =
    'Discover Flyorago safety pillars: mandatory government ID & selfie KYC, open-package physical inspection, escrow protection, and zero-tolerance prohibited item rules.';

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <SeoHead
        title={title}
        description={description}
        path="/safety"
        schemas={[
          getWebPageSchema({ title, description, path: '/safety' }),
          getBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Safety & Security', path: '/safety' },
          ]),
        ]}
      />
      <Header />

      <main className="flex-1">
        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-flyora-navy overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-flyora-navy via-flyora-navy-light to-flyora-navy opacity-90" />
          <div className="container-flyora relative z-10 text-center">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-flyora-teal/20 border border-flyora-teal/30 text-flyora-teal-bright text-xs font-extrabold uppercase tracking-widest mb-6">
              <ShieldCheck size={14} /> Trust & Safety Standard
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              Safety & Security First
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto font-medium mb-10">
              Your peace of mind is our highest priority. Learn how Flyorago protects every package, traveler, and transaction.
            </p>
          </div>
        </section>

        {/* ─── Safety Pillars ────────────────────────────────────────────── */}
        <section className="py-20 bg-flyora-gray-50">
          <div className="container-flyora">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {safetyPillars.map((p, idx) => (
                <div key={idx} className="bg-white p-8 lg:p-10 rounded-3xl border border-flyora-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-flyora-gray-50 flex items-center justify-center mb-6 border border-flyora-gray-100">
                    {p.icon}
                  </div>
                  <h2 className="text-xl font-bold text-flyora-navy mb-3">{p.title}</h2>
                  <p className="text-sm text-flyora-gray-600 leading-relaxed font-medium">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white p-8 rounded-3xl border border-flyora-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-black text-flyora-navy mb-2">Explore Detailed Compliance &amp; Escrow Guides</h2>
                <p className="text-sm text-flyora-gray-600">Review prohibited items, escrow release rules, and sender/traveler checklists before booking.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/escrow" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-flyora-teal text-white text-sm font-bold hover:bg-flyora-teal-dark transition-colors">
                  Escrow Protection <ArrowRight size={15} />
                </Link>
                <Link to="/blog/prohibited-and-restricted-items-international-travel-delivery" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-flyora-gray-200 text-flyora-navy text-sm font-bold hover:border-flyora-teal transition-colors">
                  Prohibited Items Guide
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default SafetyPage;
