import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import TrustBadges from '../components/TrustBadges';
import HowItWorks from '../components/HowItWorks';
import WhyChoose from '../components/WhyChoose';
import ChooseRole from '../components/ChooseRole';
import PopularRoutes from '../components/PopularRoutes';
import Stats from '../components/Stats';
import CommunityTestimonials from '../components/CommunityTestimonials';
import CTASection from '../components/CTASection';
import FAQSection from '../components/FAQSection';
import Footer from '../components/Footer';
import { SeoHead } from '../components/seo/SeoHead';
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getWebPageSchema,
  getFAQSchema,
} from '../data/seoConfig';

const HOMEPAGE_FAQS = [
  {
    question: 'How do you verify travellers?',
    answer:
      'Every traveller must complete a strict government ID verification, phone verification, and a live selfie check before they can accept any package requests.',
  },
  {
    question: 'Are my payments safe?',
    answer:
      'Absolutely. We use a secure escrow system. Your payment is securely held and only released to the traveller once you confirm successful delivery.',
  },
  {
    question: 'What items can I send?',
    answer:
      'You can send documents, electronics, gifts, and personal items. Prohibited items like dangerous goods, liquids, or illegal substances are strictly forbidden.',
  },
  {
    question: 'How is the delivery confirmed?',
    answer:
      'When the traveller arrives, they will ask for a unique OTP code provided to the receiver to ensure the package reaches the exact correct person.',
  },
  {
    question: 'What happens if a package is delayed or damaged?',
    answer:
      'Flyorago provides 24/7 dispute resolution and shipment coverage. Payments remain protected in escrow until all issues are resolved fairly.',
  },
];

const LandingPage: React.FC = () => {
  const title = 'Flyorago — International Peer-to-Peer Package Delivery via Verified Travelers';
  const description =
    'Send packages internationally with KYC-verified travelers who have spare luggage space, or earn money while traveling. Escrow-protected payments and 6-digit OTP handover.';

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SeoHead
        title={title}
        description={description}
        path="/"
        schemas={[
          getOrganizationSchema(),
          getWebSiteSchema(),
          getWebPageSchema({ title, description, path: '/' }),
          getFAQSchema(HOMEPAGE_FAQS),
        ]}
      />
      <Header />
      <main id="main-content" role="main">
        <Hero />
        <TrustBadges />
        <HowItWorks />
        <WhyChoose />
        <ChooseRole />
        <PopularRoutes />
        <Stats />
        <CommunityTestimonials />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
