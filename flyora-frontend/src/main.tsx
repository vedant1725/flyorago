import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/webNotification';
import { initAnalytics } from './utils/analytics';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config';

// Initialize background worker for native mobile shutter & desktop tray notifications
registerServiceWorker();
// Initialize GA4 safely when VITE_GA_MEASUREMENT_ID is configured
initAnalytics();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has <div id="root"></div>');
}

const appTree = (
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, appTree);
} else {
  ReactDOM.createRoot(rootElement).render(appTree);
}
