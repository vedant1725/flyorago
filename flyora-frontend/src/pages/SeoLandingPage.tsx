import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import {
  SeoLandingPageConfig,
  getLandingPageBySlug,
} from '../data/seoPagesData';
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getServiceSchema,
  getWebPageSchema,
} from '../data/seoConfig';
import { trackEvent } from '../utils/analytics';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe,
  Plane,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import NotFoundPage from './NotFoundPage';

interface SeoLandingPageProps {
  slug: string;
}

const SeoLandingPage: React.FC<SeoLandingPageProps> = ({ slug }) => {
  const page: SeoLandingPageConfig | undefined = getLandingPageBySlug(slug);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (!page) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <SeoHead
        title={page.seoTitle}
        description={page.metaDescription}
        path={page.path}
        schemas={[
          getWebPageSchema({
            title: page.seoTitle,
            description: page.metaDescription,
            path: page.path,
          }),
          getBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: page.h1Highlight || page.badge, path: page.path },
          ]),
          getServiceSchema({
            name: `${page.h1} ${page.h1Highlight}`,
            description: page.metaDescription,
            path: page.path,
            serviceType: page.serviceType,
            areaServed: page.areaServed,
          }),
          getFAQSchema(page.faqs),
        ]}
      />
      <Header />

      <main className="flex-1" id="main-content">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 bg-flyora-navy overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-flyora-navy via-flyora-navy-light to-teal-950 opacity-95" />
          <div className="absolute inset-0 world-map-bg opacity-10 pointer-events-none" />
          <div className="container-flyora relative z-10 max-w-5xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-white/60 mb-6">
              <Link to="/" className="hover:text-flyora-teal-bright transition-colors">Home</Link>
              <ChevronRight size={13} />
              <span className="text-flyora-teal-bright">{page.badge}</span>
            </nav>

            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-flyora-teal/20 border border-flyora-teal/30 text-flyora-teal-bright text-xs font-extrabold uppercase tracking-widest mb-5">
              <Plane size={13} className="-rotate-45" />
              {page.badge}
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.12] tracking-tight">
              {page.h1}{' '}
              <span className="text-gradient-teal">{page.h1Highlight}</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed max-w-3xl font-medium mb-8">
              {page.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={page.primaryCta.to}
                onClick={() => trackEvent('cta_click', { location: page.slug, cta: 'primary' })}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-flyora-teal hover:bg-flyora-teal-light text-white font-extrabold text-sm shadow-teal transition-all"
              >
                {page.primaryCta.label}
                <ArrowRight size={16} />
              </Link>
              <Link
                to={page.secondaryCta.to}
                onClick={() => trackEvent('cta_click', { location: page.slug, cta: 'secondary' })}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all"
              >
                {page.secondaryCta.label}
              </Link>
            </div>
          </div>
        </section>

        {/* Overview & Trust Highlights */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container-flyora max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 space-y-5">
                <span className="text-xs font-extrabold uppercase tracking-widest text-flyora-teal">
                  Audience: {page.audience}
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-flyora-navy leading-tight">
                  {page.overviewTitle}
                </h2>
                {page.overviewParagraphs.map((para, idx) => (
                  <p key={idx} className="text-base text-flyora-gray-600 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-7 border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-flyora-teal text-white flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-lg font-black text-flyora-navy">Built-In Marketplace Safeguards</h3>
                </div>
                <ul className="space-y-3.5">
                  {page.trustPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                      <CheckCircle2 size={17} className="text-flyora-teal shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Corridor Specific Details (if applicable) */}
        {page.corridor && (
          <section className="py-16 bg-slate-50 border-y border-slate-200/70">
            <div className="container-flyora max-w-6xl space-y-8">
              <div className="flex items-center gap-2 text-flyora-teal font-extrabold text-xs uppercase tracking-widest">
                <Globe size={15} /> Corridor Intelligence &amp; Customs Awareness
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-base font-black text-flyora-navy mb-3">Major Origin Hubs</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {page.corridor.originHubs.map((hub) => (
                      <li key={hub} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-flyora-teal" />
                        {hub}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-base font-black text-flyora-navy mb-3">Destination Gateways</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {page.corridor.destinationHubs.map((hub) => (
                      <li key={hub} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {hub}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-base font-black text-flyora-navy mb-3">Commonly Permitted Items</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {page.corridor.typicalItems.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-200/80 space-y-3">
                <h3 className="text-base font-black text-flyora-navy flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600" />
                  Customs &amp; Compliance Notes
                </h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {page.corridor.customsNotes.map((note, idx) => (
                    <li key={idx}>• {note}</li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  {page.corridor.disclaimer}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Key Benefits */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container-flyora max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-black text-flyora-navy mb-10 text-center">
              Why Use Flyorago
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {page.benefits.map((benefit, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h3 className="text-base font-extrabold text-flyora-navy mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step-by-step Process */}
        <section className="py-16 lg:py-20 bg-flyora-gray-50 border-y border-slate-200/60">
          <div className="container-flyora max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-black text-flyora-navy mb-10 text-center">
              {page.stepsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {page.steps.map((step, idx) => (
                <div key={idx} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-flyora-teal text-white font-black text-sm mb-4">
                    0{idx + 1}
                  </span>
                  <h3 className="text-lg font-black text-flyora-navy mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container-flyora max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-black text-flyora-navy mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {page.faqs.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="text-base font-extrabold text-flyora-navy mb-2">{faq.question}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Resources & Internal Links */}
        <section className="py-14 bg-slate-50 border-t border-slate-200/70">
          <div className="container-flyora max-w-6xl">
            <h2 className="text-xl font-black text-flyora-navy mb-6">Explore Related Flyorago Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {page.relatedPages.map((rel) => (
                <Link
                  key={rel.to}
                  to={rel.to}
                  className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-flyora-teal transition-all flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold text-flyora-navy group-hover:text-flyora-teal transition-colors mb-1.5">
                      {rel.label}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{rel.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-flyora-teal">
                    Visit Page <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SeoLandingPage;
