import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProviders, AppRoutes } from './App';
import { SeoCollectorProvider, SeoMetaPayload } from './components/seo/SeoHead';
import { GOOGLE_CLIENT_ID } from './config';

export interface PrerenderResult {
  html: string;
  seo: SeoMetaPayload | null;
}

/**
 * Renders a public route to static HTML for search engine crawlability and fast FCP.
 */
export function renderRoute(url: string): PrerenderResult {
  let capturedSeo: SeoMetaPayload | null = null;

  const html = renderToString(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SeoCollectorProvider
        onCollect={(payload) => {
          capturedSeo = payload;
        }}
      >
        <AppProviders>
          <StaticRouter location={url}>
            <AppRoutes />
          </StaticRouter>
        </AppProviders>
      </SeoCollectorProvider>
    </GoogleOAuthProvider>
  );

  return { html, seo: capturedSeo };
}
