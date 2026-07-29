import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BookOpen, Clock, ArrowRight, User, Tag } from 'lucide-react';

const posts = [
  {
    id: 1,
    title: 'How to Earn Money on International Flights by Carrying Extra Luggage',
    category: 'Travel & Earnings',
    author: 'Sarah Jenkins',
    readTime: '5 min read',
    date: 'July 20, 2026',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    summary: 'Discover how travelers cover up to 100% of their flight tickets by connecting with verified package senders on Flyorago.'
  },
  {
    id: 2,
    title: 'The Ultimate Safety Guide for Peer-to-Peer Package Handover',
    category: 'Trust & Security',
    author: 'Alex Rivera',
    readTime: '7 min read',
    date: 'July 12, 2026',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    summary: 'Best practices for baggage inspection, OTP delivery confirmation, and keeping your journey 100% secure.'
  },
  {
    id: 3,
    title: 'Why Peer-to-Peer Shipping is 70% Cheaper Than Traditional Couriers',
    category: 'Logistics',
    author: 'David Chen',
    readTime: '4 min read',
    date: 'June 30, 2026',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    summary: 'Understanding how direct traveler matching cuts out middleman overheads while providing faster international delivery.'
  }
];

const BlogPage: React.FC = () => {
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
              <BookOpen size={14} /> Flyorago Blog
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              Stories, Guides & Insights
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto font-medium">
              Explore expert tips on international travel, package shipping, earnings, and peer-to-peer security.
            </p>
          </div>
        </section>

        {/* ─── Blog Articles Grid ────────────────────────────────────────── */}
        <section className="py-20 bg-flyora-gray-50">
          <div className="container-flyora">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-3xl overflow-hidden border border-flyora-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="aspect-video relative overflow-hidden bg-slate-900">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-flyora-navy/80 backdrop-blur-md text-flyora-teal-bright text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/10">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-6 lg:p-8 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                        <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                      </div>
                      <h3 className="text-xl font-bold text-flyora-navy leading-snug mb-3 hover:text-flyora-teal transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-flyora-gray-600 leading-relaxed font-medium">
                        {post.summary}
                      </p>
                    </div>

                    <button className="text-xs font-bold text-flyora-navy hover:text-flyora-teal flex items-center gap-1.5 transition-colors pt-4 border-t border-slate-100">
                      Read Article <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
