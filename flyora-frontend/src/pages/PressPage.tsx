import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Newspaper, Download, ExternalLink, ArrowRight, Award, Globe, Shield } from 'lucide-react';

const pressReleases = [
  {
    date: 'June 15, 2026',
    category: 'Funding & Expansion',
    title: 'Flyorago Expands Peer-to-Peer Logistics to 120+ Countries Worldwide',
    excerpt: 'Flyorago announces milestone growth with over 50,000 verified travelers and 250,000 packages delivered safely across transatlantic routes.'
  },
  {
    date: 'April 28, 2026',
    category: 'Product & Trust',
    title: 'Flyorago Introduces Smart Escrow 2.0 & Live AI Luggage Verification',
    excerpt: 'Enhanced security safeguards ensure 99.8% successful delivery rate with instant OTP delivery confirmation and dispute protection.'
  },
  {
    date: 'January 10, 2026',
    category: 'Partnership',
    title: 'Flyorago Recognized as Fastest Growing Peer-to-Peer Travel Network',
    excerpt: 'Leading aviation and logistics publications highlight Flyorago for transforming unused international flight baggage capacity into sustainable value.'
  }
];

const mediaCoverage = [
  { name: 'TechCrunch', quote: 'Flyorago is doing for peer-to-peer shipping what Airbnb did for global travel.' },
  { name: 'Forbes', quote: 'A revolutionary model connecting verified international flyers with package senders.' },
  { name: 'Bloomberg', quote: 'Unlocking billions in unused airline baggage capacity with bank-grade security.' },
  { name: 'Reuters', quote: 'Peer-to-peer travel logistics takes off globally with Flyorago escrow verification.' }
];

const PressPage: React.FC = () => {
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
              <Newspaper size={14} /> Press & Newsroom
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              Flyorago in the News
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto font-medium mb-8">
              Read our latest announcements, media stories, and brand assets for journalists and content creators.
            </p>
            <button className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 mx-auto">
              <Download size={16} /> Download Official Press Kit (ZIP)
            </button>
          </div>
        </section>

        {/* ─── Media Coverage Grid ──────────────────────────────────────── */}
        <section className="py-20 bg-flyora-gray-50">
          <div className="container-flyora">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-flyora-teal uppercase tracking-widest block mb-2">Featured In</span>
              <h2 className="text-3xl font-black text-flyora-navy">What the Press Is Saying</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mediaCoverage.map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-flyora-gray-200 shadow-sm hover:shadow-md transition">
                  <span className="text-xl font-black text-flyora-navy block mb-3 tracking-tight">{m.name}</span>
                  <p className="text-xs text-flyora-gray-600 font-medium leading-relaxed italic">"{m.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Press Releases ───────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="container-flyora max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-flyora-navy">Press Releases</h2>
            </div>

            <div className="space-y-6">
              {pressReleases.map((pr, idx) => (
                <div key={idx} className="p-8 bg-white rounded-3xl border border-flyora-gray-200 hover:border-flyora-teal/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mb-2">
                    <span>{pr.date}</span>
                    <span>•</span>
                    <span className="text-flyora-teal font-bold">{pr.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-flyora-navy mb-3">{pr.title}</h3>
                  <p className="text-xs text-flyora-gray-600 leading-relaxed font-medium mb-4">{pr.excerpt}</p>
                  <button className="text-xs font-bold text-flyora-teal hover:underline flex items-center gap-1">
                    Read Full Release <ExternalLink size={12} />
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

export default PressPage;
