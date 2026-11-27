declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type FlyoragoConversionEvent =
  | 'signup_started'
  | 'signup_completed'
  | 'sender_registration'
  | 'traveler_registration'
  | 'trip_posted'
  | 'package_listed'
  | 'booking_started'
  | 'booking_completed'
  | 'cta_click';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

let analyticsInitialized = false;

/**
 * Loads Google Analytics 4 lazily when VITE_GA_MEASUREMENT_ID is configured.
 * Leaves no runtime errors or third-party bloat when unconfigured.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined' || analyticsInitialized || !GA_MEASUREMENT_ID) {
    return;
  }
  analyticsInitialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

/**
 * Tracks SPA route transitions in Google Analytics 4 when enabled.
 */
export function trackPageView(path: string, title: string): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return;
  }
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

/**
 * Emits structured conversion and funnel events without exposing PII.
 */
export function trackEvent(
  eventName: FlyoragoConversionEvent,
  params: Record<string, string | number | boolean> = {}
): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}
