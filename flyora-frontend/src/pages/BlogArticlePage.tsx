import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import { BLOG_ARTICLES, getBlogArticleBySlug } from '../data/blogData';
import {
  SITE_URL,
  getArticleSchema,
  getBreadcrumbSchema,
  getWebPageSchema,
} from '../data/seoConfig';
import { ArrowLeft, ArrowRight, Calendar, ChevronRight, Clock, User } from 'lucide-react';
import NotFoundPage from './NotFoundPage';

const BlogArticlePage: React.FC<{ slugOverride?: string }> = ({ slugOverride }) => {
  const params = useParams<{ slug: string }>();
  const slug = slugOverride || params.slug || '';
  const article = getBlogArticleBySlug(slug);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (!article) {
    return <NotFoundPage />;
  }

  const path = `/blog/${article.slug}`;
  const fullImage = article.image.startsWith('http')
    ? article.image
    : `${SITE_URL}${article.image}`;
  const otherArticles = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <SeoHead
        title={article.seoTitle}
        description={article.metaDescription}
        path={path}
        ogType="article"
        ogImage={fullImage}
        articlePublishedTime={article.datePublished}
        articleAuthor={article.author}
        schemas={[
          getWebPageSchema({
            title: article.seoTitle,
            description: article.metaDescription,
            path,
          }),
          getBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: article.title, path },
          ]),
          getArticleSchema({
            title: article.title,
            description: article.metaDescription,
            path,
            datePublished: article.datePublished,
            dateModified: article.dateModified,
            authorName: article.author,
            image: fullImage,
            section: article.category,
          }),
        ]}
      />
      <Header />

      <main className="flex-1 pt-28 pb-20" id="main-content">
        <article className="container-flyora max-w-4xl">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 flex-wrap">
            <Link to="/" className="hover:text-flyora-teal transition-colors">Home</Link>
            <ChevronRight size={13} />
            <Link to="/blog" className="hover:text-flyora-teal transition-colors">Blog</Link>
            <ChevronRight size={13} />
            <span className="text-flyora-teal font-bold">{article.category}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-extrabold uppercase tracking-wider mb-4">
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-flyora-navy leading-tight tracking-tight mb-5">
              {article.title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              {article.summary}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold pb-6 border-b border-slate-200">
              <span className="flex items-center gap-1.5"><User size={14} className="text-flyora-teal" /> {article.author} ({article.authorRole})</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-flyora-teal" /> Updated {article.dateModified}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-flyora-teal" /> {article.readTime}</span>
            </div>
          </header>

          {/* Hero Image */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 mb-10 bg-slate-50">
            <img
              src={article.image}
              alt={article.imageAlt}
              width={900}
              height={600}
              decoding="async"
              className="w-full max-h-[420px] object-cover"
            />
          </div>

          {/* Body Sections */}
          <div className="space-y-10">
            {article.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-black text-flyora-navy leading-snug">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-base text-slate-700 leading-relaxed">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="space-y-2.5 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    {section.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="text-sm text-slate-700 font-medium flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-flyora-teal mt-2 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* Conversion CTA */}
          <div className="mt-12 p-8 rounded-3xl bg-flyora-navy text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black mb-2">Ready to Ship or Earn With Flyorago?</h2>
              <p className="text-sm text-white/75 max-w-xl">
                Create a free account, complete quick KYC verification, and connect with verified travelers or senders with escrow protection.
              </p>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-flyora-teal hover:bg-flyora-teal-light text-white font-bold text-sm shrink-0 transition-colors"
            >
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>

          {/* Related Internal Links */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-base font-black text-flyora-navy mb-4">Related Flyorago Pages</h3>
            <div className="flex flex-wrap gap-3">
              {article.relatedLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-flyora-navy hover:border-flyora-teal hover:text-flyora-teal transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* More Articles */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-flyora-navy">More From Flyorago Blog</h3>
              <Link to="/blog" className="inline-flex items-center gap-1 text-xs font-bold text-flyora-teal hover:underline">
                <ArrowLeft size={13} /> All Articles
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {otherArticles.map((other) => (
                <Link
                  key={other.slug}
                  to={`/blog/${other.slug}`}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-flyora-teal transition-all bg-white"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-flyora-teal block mb-2">
                    {other.category}
                  </span>
                  <h4 className="text-sm font-bold text-flyora-navy leading-snug mb-2">{other.title}</h4>
                  <span className="text-xs text-slate-500">{other.readTime}</span>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogArticlePage;
