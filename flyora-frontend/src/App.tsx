import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Eagerly loaded public SEO pages (supports SSG pre-rendering & instant FCP)
import LandingPage from './pages/LandingPage';
import ServicesPage from './pages/ServicesPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import SafetyPage from './pages/SafetyPage';
import EscrowPage from './pages/EscrowPage';
import CareersPage from './pages/CareersPage';
import PressPage from './pages/PressPage';
import BlogPage from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SitemapPage from './pages/SitemapPage';
import SeoLandingPage from './pages/SeoLandingPage';
import NotFoundPage from './pages/NotFoundPage';

// Lazy-loaded Auth, Dashboard & Inner App Pages (reduces initial public JS bundle)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const KycPage = lazy(() => import('./pages/KycPage'));
const KycAdminPage = lazy(() => import('./pages/KycAdminPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const ShipmentsPage = lazy(() => import('./pages/ShipmentsPage'));
const SenderPage = lazy(() => import('./pages/SenderPage'));
const TravelerPage = lazy(() => import('./pages/TravelerPage'));
const CreateSenderRequestPage = lazy(() => import('./pages/CreateSenderRequestPage'));
const CreateTravelerTripPage = lazy(() => import('./pages/CreateTravelerTripPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const EarningsPage = lazy(() => import('./pages/EarningsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const BookingDetailsPage = lazy(() => import('./pages/BookingDetailsPage'));
const TripDetailsPage = lazy(() => import('./pages/TripDetailsPage'));
const ShipmentDetailsPage = lazy(() => import('./pages/ShipmentDetailsPage'));
const TransactionDetailsPage = lazy(() => import('./pages/TransactionDetailsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const TrustDashboardPage = lazy(() => import('./pages/TrustDashboardPage'));
const FlyoraAIPage = lazy(() => import('./pages/FlyoraAIPage'));

import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { FlyoraAIProvider } from './context/FlyoraAIContext';
import { FlyoraAIFloatingButton } from './components/ai/FlyoraAIFloatingButton';
import { FlyoraAIChatWindow } from './components/ai/FlyoraAIChatWindow';
import { SessionWatchdog } from './components/common/SessionWatchdog';

const PageFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-white text-flyora-navy font-semibold text-sm">
    Loading Flyorago...
  </div>
);

export const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageFallback />}>
    <Routes>
      {/* Core Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/safety" element={<SafetyPage />} />
      <Route path="/escrow" element={<EscrowPage />} />
      <Route path="/careers" element={<CareersPage />} />
      <Route path="/press" element={<PressPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogArticlePage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/sitemap" element={<SitemapPage />} />

      {/* Commercial, Audience, Guide & Corridor SEO Landing Pages */}
      <Route path="/international-package-delivery" element={<SeoLandingPage slug="international-package-delivery" />} />
      <Route path="/send-package-internationally" element={<SeoLandingPage slug="send-package-internationally" />} />
      <Route path="/travelers-earn-money" element={<SeoLandingPage slug="travelers-earn-money" />} />
      <Route path="/carry-packages-and-earn" element={<SeoLandingPage slug="carry-packages-and-earn" />} />
      <Route path="/sender-guide" element={<SeoLandingPage slug="sender-guide" />} />
      <Route path="/traveler-guide" element={<SeoLandingPage slug="traveler-guide" />} />
      <Route path="/india-to-usa" element={<SeoLandingPage slug="india-to-usa" />} />
      <Route path="/india-to-uk" element={<SeoLandingPage slug="india-to-uk" />} />
      <Route path="/india-to-canada" element={<SeoLandingPage slug="india-to-canada" />} />
      <Route path="/india-to-australia" element={<SeoLandingPage slug="india-to-australia" />} />
      <Route path="/india-to-uae" element={<SeoLandingPage slug="india-to-uae" />} />

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/kyc" element={<KycPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/kyc" element={<KycAdminPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

      {/* Authenticated Marketplace & App Pages */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/trips" element={<TripsPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/shipments" element={<ShipmentsPage />} />
      <Route path="/sender" element={<SenderPage />} />
      <Route path="/sender/new" element={<CreateSenderRequestPage />} />
      <Route path="/traveler" element={<TravelerPage />} />
      <Route path="/traveler/new" element={<CreateTravelerTripPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/earnings" element={<EarningsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/booking/:id" element={<BookingDetailsPage />} />
      <Route path="/trip/:id" element={<TripDetailsPage />} />
      <Route path="/shipment/:id" element={<ShipmentDetailsPage />} />
      <Route path="/wallet/transaction/:id" element={<TransactionDetailsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/trust" element={<TrustDashboardPage />} />
      <Route path="/ai" element={<FlyoraAIPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>
    <SocketProvider>
      <FlyoraAIProvider>{children}</FlyoraAIProvider>
    </SocketProvider>
  </ToastProvider>
);

const App: React.FC = () => {
  return (
    <AppProviders>
      <Router>
        <AppRoutes />
        <FlyoraAIChatWindow />
        <FlyoraAIFloatingButton />
        <SessionWatchdog />
      </Router>
    </AppProviders>
  );
};

export default App;
