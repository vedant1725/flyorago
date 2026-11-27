import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import { BLOG_ARTICLES } from '../data/blogData';
import { getBreadcrumbSchema, getWebPageSchema } from '../data/seoConfig';
import { BookOpen, Clock, ArrowRight, User } from 'lucide-react';

const CATEGORIES = ['All', 'Travel & Earnings', 'Trust & Security', 'International Shipping', 'India Corridors'] as const;

const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredPosts =
    selectedCategory === 'All'
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((p) => p.category === selectedCategory);

  const title = 'Flyorago Blog — International Shipping, Travel Earnings & Safety Guides';
  const description =
    'Read expert guides on peer-to-peer international package delivery, earning with spare luggage space, India-to-abroad customs rules, and escrow safety.';

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <SeoHead
        title={title}
        description={description}
        path="/blog"
        schemas={[
          getWebPageSchema({ title, description, path: '/blog' }),
          getBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
          ]),
        ]}
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 bg-flyora-navy overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-flyora-navy via-flyora-navy-light to-flyora-navy opacity-90" />
          <div className="container-flyora relative z-10 text-center">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-flyora-teal/20 border border-flyora-teal/30 text-flyora-teal-bright text-xs font-extrabold uppercase tracking-widest mb-6">
              <BookOpen size={14} /> Flyorago Blog
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              Stories, Guides &amp; Insights
            </h1>
            <p className="text-lg md:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto font-medium">
              Practical guides on international travel-based package delivery, India-to-abroad corridors, customs rules, and escrow safety.
            </p>
          </div>
        </section>

        {/* Category Filter + Blog Articles Grid */}
        <section className="py-16 lg:py-20 bg-flyora-gray-50">
          <div className="container-flyora">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-flyora-navy text-white shadow-sm'
                      : 'bg-white border border-flyora-gray-200 text-flyora-gray-600 hover:border-flyora-teal hover:text-flyora-navy'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-3xl overflow-hidden border border-flyora-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <Link to={`/blog/${post.slug}`} className="aspect-video relative overflow-hidden bg-slate-100 block">
                    <img
                      src={post.image}
                      alt={post.imageAlt}
                      width={900}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-flyora-navy/85 backdrop-blur-md text-flyora-teal-bright text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/10">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-6 lg:p-8 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-3">
                        <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                      </div>
                      <h2 className="text-xl font-bold text-flyora-navy leading-snug mb-3 hover:text-flyora-teal transition-colors">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className="text-sm text-flyora-gray-600 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-xs font-bold text-flyora-navy hover:text-flyora-teal inline-flex items-center gap-1.5 transition-colors pt-4 border-t border-slate-100"
                    >
                      Read Full Guide <ArrowRight size={14} />
                    </Link>
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
