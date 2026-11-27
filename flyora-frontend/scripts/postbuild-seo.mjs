import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SSR_DIR = path.join(ROOT_DIR, 'dist-ssr');
const SITE_URL = 'https://flyorago.me';

const STATIC_PUBLIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/international-package-delivery', changefreq: 'weekly', priority: '0.95' },
  { path: '/send-package-internationally', changefreq: 'weekly', priority: '0.95' },
  { path: '/travelers-earn-money', changefreq: 'weekly', priority: '0.95' },
  { path: '/carry-packages-and-earn', changefreq: 'weekly', priority: '0.90' },
  { path: '/how-it-works', changefreq: 'monthly', priority: '0.90' },
  { path: '/services', changefreq: 'monthly', priority: '0.90' },
  { path: '/sender-guide', changefreq: 'monthly', priority: '0.85' },
  { path: '/traveler-guide', changefreq: 'monthly', priority: '0.85' },
  { path: '/india-to-usa', changefreq: 'weekly', priority: '0.90' },
  { path: '/india-to-uk', changefreq: 'weekly', priority: '0.90' },
  { path: '/india-to-canada', changefreq: 'weekly', priority: '0.90' },
  { path: '/india-to-australia', changefreq: 'weekly', priority: '0.85' },
  { path: '/india-to-uae', changefreq: 'weekly', priority: '0.90' },
  { path: '/safety', changefreq: 'monthly', priority: '0.85' },
  { path: '/escrow', changefreq: 'monthly', priority: '0.85' },
  { path: '/blog', changefreq: 'weekly', priority: '0.85' },
  { path: '/blog/earn-money-international-flights-extra-luggage', changefreq: 'monthly', priority: '0.80' },
  { path: '/blog/peer-to-peer-package-handover-safety-guide', changefreq: 'monthly', priority: '0.80' },
  { path: '/blog/peer-to-peer-shipping-vs-international-couriers', changefreq: 'monthly', priority: '0.80' },
  { path: '/blog/how-to-send-packages-from-india-to-usa-uk-canada', changefreq: 'monthly', priority: '0.80' },
  { path: '/blog/prohibited-and-restricted-items-international-travel-delivery', changefreq: 'monthly', priority: '0.80' },
  { path: '/blog/how-escrow-and-otp-delivery-protect-p2p-shipments', changefreq: 'monthly', priority: '0.80' },
  { path: '/about', changefreq: 'monthly', priority: '0.75' },
  { path: '/contact', changefreq: 'monthly', priority: '0.75' },
  { path: '/careers', changefreq: 'monthly', priority: '0.65' },
  { path: '/press', changefreq: 'monthly', priority: '0.65' },
  { path: '/terms', changefreq: 'yearly', priority: '0.50' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.50' },
  { path: '/sitemap', changefreq: 'weekly', priority: '0.50' },
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHeadTags(seo) {
  const canonical =
    seo.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${seo.path.replace(/\/+$/, '')}`;
  const robots = seo.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
  const ogImage = seo.ogImage || `${SITE_URL}/images/og-cover.jpg`;
  const ogType = seo.ogType || 'website';

  const lines = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta property="og:site_name" content="Flyorago" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
  ];

  if (seo.articlePublishedTime) {
    lines.push(`<meta property="article:published_time" content="${escapeHtml(seo.articlePublishedTime)}" />`);
  }
  if (seo.articleAuthor) {
    lines.push(`<meta property="article:author" content="${escapeHtml(seo.articleAuthor)}" />`);
  }

  if (!seo.noindex) {
    lines.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`);
    lines.push(`<link rel="alternate" hreflang="en" href="${escapeHtml(canonical)}" />`);
    lines.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}" />`);
  }

  if (Array.isArray(seo.schemas)) {
    for (const schema of seo.schemas) {
      lines.push(`<script type="application/ld+json" data-flyorago-seo="jsonld">${JSON.stringify(schema)}</script>`);
    }
  }

  return lines.join('\n    ');
}

function injectRouteHtml(template, appHtml, seo) {
  let out = template;

  // Strip default SEO head tags from template so each page has clean unique metadata
  out = out.replace(/<title>[\s\S]*?<\/title>/i, '');
  out = out.replace(/<meta\s+name="description"[^>]*>/gi, '');
  out = out.replace(/<meta\s+name="robots"[^>]*>/gi, '');
  out = out.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  out = out.replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>/gi, '');
  out = out.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  out = out.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');

  const headBlock = seo ? buildHeadTags(seo) : '';
  out = out.replace('</head>', `    ${headBlock}\n  </head>`);
  out = out.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  return out;
}

async function run() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Missing built index.html at ${templatePath}`);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Keep a clean SPA shell copy for authenticated app fallback rewrites if needed
  const ssrEntryCandidates = fs.readdirSync(SSR_DIR).filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
  if (ssrEntryCandidates.length === 0) {
    throw new Error(`No SSR entry bundle found in ${SSR_DIR}`);
  }
  const ssrModulePath = pathToFileURL(path.join(SSR_DIR, ssrEntryCandidates[0])).href;
  const { renderRoute } = await import(ssrModulePath);

  // Preserve clean un-prerendered SPA shell for private/authenticated routes
  fs.writeFileSync(path.join(DIST_DIR, '_app.html'), template, 'utf-8');

  for (const route of STATIC_PUBLIC_ROUTES) {
    const { html, seo } = renderRoute(route.path);
    const rendered = injectRouteHtml(template, html, seo);
    if (route.path === '/') {
      fs.writeFileSync(path.join(DIST_DIR, 'index.html'), rendered, 'utf-8');
    } else {
      const targetDir = path.join(DIST_DIR, route.path.replace(/^\/+/, ''));
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'index.html'), rendered, 'utf-8');
    }
    console.log(`[SSG] Prerendered ${route.path} -> ${seo?.title || 'no-title'}`);
  }

  // Prerender branded 404.html with noindex
  const notFound = renderRoute('/404-not-found-prerender');
  const rendered404 = injectRouteHtml(template, notFound.html, notFound.seo);
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), rendered404, 'utf-8');
  console.log('[SSG] Prerendered /404.html');

  // Generate dynamic XML Sitemap
  const today = new Date().toISOString().split('T')[0];
  const urlNodes = STATIC_PUBLIC_ROUTES.map((route) => {
    const loc = route.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`[SEO] Generated sitemap.xml with ${STATIC_PUBLIC_ROUTES.length} URLs`);

  // Clean up temporary SSR build folder
  fs.rmSync(SSR_DIR, { recursive: true, force: true });
}

run().catch((err) => {
  console.error('[postbuild-seo] Failed:', err);
  process.exit(1);
});
