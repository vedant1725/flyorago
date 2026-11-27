import React, { createContext, useContext, useEffect } from 'react';
import {
  BRAND_NAME,
  DEFAULT_OG_IMAGE,
  buildCanonicalUrl,
} from '../../data/seoConfig';
import { trackPageView } from '../../utils/analytics';

export interface SeoMetaPayload {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
  articlePublishedTime?: string;
  articleAuthor?: string;
  schemas?: Record<string, unknown>[];
  enableHreflang?: boolean;
}

type SeoCollector = (payload: SeoMetaPayload) => void;

const SeoCollectorContext = createContext<SeoCollector | null>(null);

export const SeoCollectorProvider: React.FC<{
  onCollect: SeoCollector;
  children: React.ReactNode;
}> = ({ onCollect, children }) => (
  <SeoCollectorContext.Provider value={onCollect}>
    {children}
  </SeoCollectorContext.Provider>
);

function upsertMeta(attrName: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attrName}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function removeLink(rel: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  document.head.querySelectorAll(selector).forEach((node) => node.remove());
}

/**
 * Synchronizes document head metadata, canonical tags, Open Graph/Twitter cards,
 * hreflang links, and JSON-LD structured data for both SSG pre-rendering and SPA navigation.
 */
export const SeoHead: React.FC<SeoMetaPayload> = (props) => {
  const collect = useContext(SeoCollectorContext);
  if (collect) {
    collect(props);
  }

  const {
    title,
    description,
    path,
    noindex = false,
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
    articlePublishedTime,
    articleAuthor,
    schemas = [],
    enableHreflang = !noindex,
  } = props;

  useEffect(() => {
    const canonical = buildCanonicalUrl(path);
    const robotsContent = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robotsContent);

    upsertMeta('property', 'og:site_name', BRAND_NAME);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:locale', 'en_US');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);

    if (articlePublishedTime) {
      upsertMeta('property', 'article:published_time', articlePublishedTime);
    }
    if (articleAuthor) {
      upsertMeta('property', 'article:author', articleAuthor);
    }

    if (noindex) {
      removeLink('canonical');
      removeLink('alternate', 'en');
      removeLink('alternate', 'x-default');
    } else {
      upsertLink('canonical', canonical);
      if (enableHreflang) {
        upsertLink('alternate', canonical, 'en');
        upsertLink('alternate', canonical, 'x-default');
      } else {
        removeLink('alternate', 'en');
        removeLink('alternate', 'x-default');
      }
    }

    document.head
      .querySelectorAll('script[data-flyorago-seo="jsonld"]')
      .forEach((node) => node.remove());

    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-flyorago-seo', 'jsonld');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    trackPageView(path, title);
  }, [
    title,
    description,
    path,
    noindex,
    ogType,
    ogImage,
    articlePublishedTime,
    articleAuthor,
    enableHreflang,
    JSON.stringify(schemas),
  ]);

  return null;
};
