import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ServicesPage from './pages/ServicesPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import KycPage from './pages/KycPage';
import KycAdminPage from './pages/KycAdminPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DashboardPage from './pages/DashboardPage';
import TripsPage from './pages/TripsPage';
import BookingsPage from './pages/BookingsPage';
import ShipmentsPage from './pages/ShipmentsPage';
import SenderPage from './pages/SenderPage';
import TravelerPage from './pages/TravelerPage';
import ShopperPage from './pages/ShopperPage';

// Import New Pages
import WalletPage from './pages/WalletPage';
import EarningsPage from './pages/EarningsPage';
import MessagesPage from './pages/MessagesPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import TripDetailsPage from './pages/TripDetailsPage';
import ShipmentDetailsPage from './pages/ShipmentDetailsPage';
import TransactionDetailsPage from './pages/TransactionDetailsPage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/kyc" element={<KycPage />} />
        <Route path="/admin/kyc" element={<KycAdminPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/sender" element={<SenderPage />} />
        <Route path="/traveler" element={<TravelerPage />} />
        <Route path="/shopper" element={<ShopperPage />} />
        
        {/* New Pages */}
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;


