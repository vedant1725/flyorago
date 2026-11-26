export const SITE_URL = 'https://flyorago.me';
export const BRAND_NAME = 'Flyorago';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-cover.jpg`;
export const BRAND_LOGO_URL = `${SITE_URL}/images/flyorago_logo_transparent.png`;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FAQSchemaItem {
  question: string;
  answer: string;
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  image?: string;
  section?: string;
}

export function buildCanonicalUrl(path: string): string {
  if (!path || path === '/') return `${SITE_URL}/`;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean.replace(/\/+$/, '')}`;
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: BRAND_LOGO_URL,
    },
    description:
      'Flyorago is a peer-to-peer international travel-based package delivery marketplace connecting verified travelers with spare luggage space and package senders worldwide.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@flyorago.com',
      availableLanguage: ['English'],
    },
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: BRAND_NAME,
    url: `${SITE_URL}/`,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: 'en',
  };
}

export function getWebPageSchema(params: {
  title: string;
  description: string;
  path: string;
}) {
  const url = buildCanonicalUrl(params.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: params.title,
    description: params.description,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: 'en',
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

export function getFAQSchema(faqs: FAQSchemaItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getServiceSchema(params: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  areaServed?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    description: params.description,
    serviceType: params.serviceType,
    url: buildCanonicalUrl(params.path),
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
    ...(params.areaServed?.length
      ? {
          areaServed: params.areaServed.map((country) => ({
            '@type': 'Country',
            name: country,
          })),
        }
      : {}),
  };
}

export function getArticleSchema(article: ArticleSchemaInput) {
  const url = buildCanonicalUrl(article.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: article.title,
    description: article.description,
    image: article.image || DEFAULT_OG_IMAGE,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    articleSection: article.section || 'International Delivery',
    inLanguage: 'en',
  };
}
