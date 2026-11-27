import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import { BLOG_ARTICLES } from '../data/blogData';
import { SEO_LANDING_PAGES } from '../data/seoPagesData';
import { getBreadcrumbSchema, getWebPageSchema } from '../data/seoConfig';
import { Map, ArrowRight } from 'lucide-react';

const SitemapPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const title = 'HTML Sitemap — All Flyorago Pages, Guides & Corridors';
  const description =
    'Browse all Flyorago public pages: core marketplace info, sender and traveler guides, India international corridors, safety & escrow, and blog articles.';

  const corePages = [
    { label: 'Homepage', to: '/' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Services', to: '/services' },
    { label: 'Safety & Security', to: '/safety' },
    { label: 'Escrow Protection', to: '/escrow' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Blog & Guides', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
  ];

  const corridorPages = SEO_LANDING_PAGES.filter((p) => p.category === 'corridor');
  const solutionPages = SEO_LANDING_PAGES.filter((p) => p.category !== 'corridor');

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <SeoHead
        title={title}
        description={description}
        path="/sitemap"
        schemas={[
          getWebPageSchema({ title, description, path: '/sitemap' }),
          getBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'HTML Sitemap', path: '/sitemap' },
          ]),
        ]}
      />
      <Header />

      <main className="flex-1 pt-32 pb-20" id="main-content">
        <div className="container-flyora max-w-6xl">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-extrabold uppercase tracking-wider mb-4">
              <Map size={13} /> Site Directory
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-flyora-navy mb-3">Flyorago HTML Sitemap</h1>
            <p className="text-base text-slate-600 max-w-2xl">
              Quickly navigate every public marketplace page, sender and traveler guide, international corridor, and blog article on Flyorago.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-7 rounded-3xl bg-slate-50 border border-slate-200">
              <h2 className="text-xl font-black text-flyora-navy mb-4">Core Platform &amp; Trust Pages</h2>
              <ul className="space-y-2.5">
                {corePages.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-flyora-teal transition-colors">
                      <ArrowRight size={13} className="text-flyora-teal" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="p-7 rounded-3xl bg-slate-50 border border-slate-200">
              <h2 className="text-xl font-black text-flyora-navy mb-4">Sender &amp; Traveler Solutions</h2>
              <ul className="space-y-2.5">
                {solutionPages.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-flyora-teal transition-colors">
                      <ArrowRight size={13} className="text-flyora-teal" />
                      {item.h1} {item.h1Highlight}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="p-7 rounded-3xl bg-slate-50 border border-slate-200">
              <h2 className="text-xl font-black text-flyora-navy mb-4">India &amp; International Corridors</h2>
              <ul className="space-y-2.5">
                {corridorPages.map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-flyora-teal transition-colors">
                      <ArrowRight size={13} className="text-flyora-teal" />
                      {item.h1} {item.h1Highlight}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="p-7 rounded-3xl bg-slate-50 border border-slate-200">
              <h2 className="text-xl font-black text-flyora-navy mb-4">Blog Guides &amp; Resources</h2>
              <ul className="space-y-2.5">
                {BLOG_ARTICLES.map((post) => (
                  <li key={post.slug}>
                    <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-flyora-teal transition-colors">
                      <ArrowRight size={13} className="text-flyora-teal" />
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SitemapPage;
