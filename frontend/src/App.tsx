import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { TranslationProvider } from './contexts/TranslationContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SocialChatBox from './components/common/SocialChatBox';
import ScrollToTop from './components/common/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import Booking from './pages/Booking';
import BookingPolicy from './pages/BookingPolicy';
import Services from './pages/Services';
import CarRental from './pages/CarRental';
import ServiceDetail from './pages/ServiceDetail';
import ServiceBooking from './pages/ServiceBooking';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact'; // Add Contact import
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import BlogManagement from './pages/admin/BlogManagement';
import ContentManagement from './pages/admin/ContentManagement';
import AdminManagement from './pages/admin/AdminManagement';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import ActivityLogManagement from "./pages/admin/ActivityLogManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Route-based layout wrapper component
const RouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return <div className={isHomePage ? '' : 'pt-16'}>{children}</div>;
};

const AppContent: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
      <ScrollToTop />
      <Header />
      <main className={`flex-1 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
        <RouteWrapper>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tours/:slug" element={<TourDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/car-rental" element={<CarRental />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />

            {/* Customer Booking Routes - No authentication required */}
            <Route path="/booking/:slug" element={<Booking />} />
            <Route path="/service-booking/:slug" element={<ServiceBooking />} />
            <Route path="/booking-policy" element={<BookingPolicy />} />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/blogs" element={
              <ProtectedRoute requiredRole="admin">
                <BlogManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/content" element={
              <ProtectedRoute requiredRole="admin">
                <ContentManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/admins" element={
              <ProtectedRoute requiredRole="admin">
                <AdminManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/activity-logs" element={
              <ProtectedRoute requiredRole="admin">
                <ActivityLogManagement />
              </ProtectedRoute>
            } />
          </Routes>
        </RouteWrapper>
      </main>
      <Footer />
      <SocialChatBox /> {/* Add SocialChatBox component */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? '#122941' : '#FFFFFF',
            color: isDarkMode ? '#FAFAFA' : '#000000',
            border: `1px solid ${isDarkMode ? '#1a3650' : '#E6EFFF'}`,
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TranslationProvider>
            <Router>
              <AppContent />
            </Router>
          </TranslationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
