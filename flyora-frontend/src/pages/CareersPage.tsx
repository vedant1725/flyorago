import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Briefcase, Globe, Rocket, Heart, Users, Zap, Shield, 
  ArrowRight, CheckCircle2, MapPin, Clock, Award
} from 'lucide-react';

const positions = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer (React & Django)',
    department: 'Engineering',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    description: 'Lead the core architecture of Flyorago P2P logistics platform, real-time tracking, and escrow workflows.'
  },
  {
    id: 2,
    title: 'Staff Product Designer (UI/UX)',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Craft world-class mobile and web user experiences inspired by tech giants like Meta, Google, and Airbnb.'
  },
  {
    id: 3,
    title: 'Trust & Safety Operations Specialist',
    department: 'Operations',
    location: 'London, UK / Remote',
    type: 'Full-time',
    description: 'Manage KYC verification, dispute resolutions, security algorithms, and community trust metrics.'
  },
  {
    id: 4,
    title: 'Global Growth & Marketing Manager',
    department: 'Marketing',
    location: 'New York, NY / Hybrid',
    type: 'Full-time',
    description: 'Drive international traveler acquisition and brand awareness across international flight hubs.'
  }
];

const benefits = [
  { icon: <Globe size={24} className="text-flyora-teal" />, title: 'Global Remote First', desc: 'Work from anywhere in the world. We embrace flexible schedules and remote autonomy.' },
  { icon: <Rocket size={24} className="text-blue-500" />, title: 'Travel Credit & Perks', desc: 'Annual $2,500 travel allowance to fly globally and test our peer-to-peer delivery network.' },
  { icon: <Heart size={24} className="text-rose-500" />, title: 'Full Health & Wellness', desc: 'Top-tier medical, dental, vision coverage, and monthly mental health stipends.' },
  { icon: <Award size={24} className="text-amber-500" />, title: 'Equity & Competitive Pay', desc: 'Generous stock options package and top-market salary matching leading tech MNCs.' }
];

const CareersPage: React.FC = () => {
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
          <div className="absolute inset-0 world-map-bg opacity-10 pointer-events-none" />

          <div className="container-flyora relative z-10 text-center">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-flyora-teal/20 border border-flyora-teal/30 text-flyora-teal-bright text-xs font-extrabold uppercase tracking-widest mb-6">
              <Briefcase size={14} /> Join Our Mission
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              Build the Future of <br className="hidden sm:block" />
              <span className="text-gradient-teal">Global Peer-to-Peer Logistics</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto font-medium mb-10">
              We are a team of dreamers, engineers, and globetrotters reinventing international shipping for millions of travelers worldwide.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="#open-positions" className="px-8 py-4 bg-gradient-to-r from-flyora-teal to-blue-500 text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-teal/20">
                View Open Positions
              </a>
            </div>
          </div>
        </section>

        {/* ─── Culture & Benefits ───────────────────────────────────────── */}
        <section className="py-20 bg-flyora-gray-50">
          <div className="container-flyora">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-flyora-navy mb-4">Why Work at Flyorago?</h2>
              <p className="text-flyora-gray-600 text-base">
                We empower brilliant minds to do their best work with complete ownership, freedom, and world-class perks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((b, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl border border-flyora-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-flyora-gray-50 flex items-center justify-center mb-6 border border-flyora-gray-100">
                    {b.icon}
                  </div>
                  <h3 className="text-lg font-bold text-flyora-navy mb-2">{b.title}</h3>
                  <p className="text-xs text-flyora-gray-600 leading-relaxed font-medium">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Open Positions ────────────────────────────────────────────── */}
        <section className="py-20 bg-white" id="open-positions">
          <div className="container-flyora max-w-4xl">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-flyora-teal uppercase tracking-widest block mb-2">Careers</span>
              <h2 className="text-3xl md:text-4xl font-black text-flyora-navy">Current Opportunities</h2>
            </div>

            <div className="space-y-4">
              {positions.map((p) => (
                <div key={p.id} className="bg-white p-6 lg:p-8 rounded-3xl border border-flyora-gray-200 shadow-sm hover:border-flyora-teal/50 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-flyora-teal/10 text-flyora-teal text-xs font-bold rounded-full">{p.department}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium"><MapPin size={12} /> {p.location}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium"><Clock size={12} /> {p.type}</span>
                    </div>
                    <h3 className="text-xl font-bold text-flyora-navy">{p.title}</h3>
                    <p className="text-xs text-flyora-gray-600 leading-relaxed font-medium">{p.description}</p>
                  </div>
                  <button className="px-6 py-3 bg-flyora-navy text-white text-xs font-bold rounded-xl hover:bg-flyora-navy-light transition flex items-center gap-2 shrink-0 self-start md:self-auto">
                    Apply Now <ArrowRight size={14} />
                  </button>
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

export default CareersPage;
