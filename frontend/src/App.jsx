import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUser } from './utils/auth';
import AppShell from './components/AppShell/AppShell';

// Auth pages (standalone glassmorphism design)
import LoginPage    from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Customer pages
import BrowsePage           from './pages/Home/BrowsePage';
import BookingFlowPage      from './pages/Booking/BookingFlowPage';
import BookingConfirmedPage from './pages/Booking/BookingConfirmedPage';
import MyBookingsPage       from './pages/Booking/MyBookingsPage';
import LoyaltyPage          from './pages/Loyalty/LoyaltyPage';
import ProfilePage          from './pages/Profile/ProfilePage';

// Vendor pages
import VendorDashboard     from './pages/Vendor/VendorDashboard';
import VendorBookingsPage  from './pages/Vendor/VendorBookingsPage';
import VendorCalendarPage  from './pages/Vendor/VendorCalendarPage';
import VendorCourtsPage    from './pages/Vendor/VendorCourtsPage';
import VendorAnalyticsPage from './pages/Vendor/VendorAnalyticsPage';

// Admin pages
import AdminDashboard    from './pages/Admin/AdminDashboard';
import AdminBookingsPage from './pages/Admin/AdminBookingsPage';
import AdminUsersPage    from './pages/Admin/AdminUsersPage';
import AdminVenuesPage   from './pages/Admin/AdminVenuesPage';
import AdminRevenuePage  from './pages/Admin/AdminRevenuePage';

// ── Route guards ──────────────────────────────────────
const PrivateRoute = ({ children, requiredRole }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

// ── Wrapper: private route inside AppShell ────────────
function ShellRoute({ children, requiredRole }) {
  return (
    <PrivateRoute requiredRole={requiredRole}>
      <AppShell>{children}</AppShell>
    </PrivateRoute>
  );
}

// ── Inner app — re-syncs user on every navigation ─────
function AppContent() {
  const [, forceUpdate] = useState(0);
  const location = useLocation();

  useEffect(() => {
    forceUpdate(n => n + 1);
  }, [location]);

  return (
    <Routes>
      {/* ── Auth (standalone, no shell) ── */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Customer ── */}
      <Route path="/" element={
        <ShellRoute><BrowsePage /></ShellRoute>
      } />
      <Route path="/book/:courtId" element={
        <ShellRoute><BookingFlowPage /></ShellRoute>
      } />
      <Route path="/bookings/new" element={
        <ShellRoute><BookingFlowPage /></ShellRoute>
      } />
      <Route path="/booking-confirmed/:bookingId" element={
        <ShellRoute><BookingConfirmedPage /></ShellRoute>
      } />
      <Route path="/bookings" element={
        <ShellRoute><MyBookingsPage /></ShellRoute>
      } />
      <Route path="/loyalty" element={
        <ShellRoute><LoyaltyPage /></ShellRoute>
      } />
      <Route path="/profile" element={
        <ShellRoute><ProfilePage /></ShellRoute>
      } />

      {/* ── Vendor ── */}
      <Route path="/vendor" element={
        <ShellRoute requiredRole="vendor"><VendorDashboard /></ShellRoute>
      } />
      <Route path="/vendor/bookings" element={
        <ShellRoute requiredRole="vendor"><VendorBookingsPage /></ShellRoute>
      } />
      <Route path="/vendor/slots" element={
        <ShellRoute requiredRole="vendor"><VendorCalendarPage /></ShellRoute>
      } />
      <Route path="/vendor/courts" element={
        <ShellRoute requiredRole="vendor"><VendorCourtsPage /></ShellRoute>
      } />
      <Route path="/vendor/analytics" element={
        <ShellRoute requiredRole="vendor"><VendorAnalyticsPage /></ShellRoute>
      } />

      {/* ── Admin ── */}
      <Route path="/admin" element={
        <ShellRoute requiredRole="admin"><AdminDashboard /></ShellRoute>
      } />
      <Route path="/admin/bookings" element={
        <ShellRoute requiredRole="admin"><AdminBookingsPage /></ShellRoute>
      } />
      <Route path="/admin/users" element={
        <ShellRoute requiredRole="admin"><AdminUsersPage /></ShellRoute>
      } />
      <Route path="/admin/venues" element={
        <ShellRoute requiredRole="admin"><AdminVenuesPage /></ShellRoute>
      } />
      <Route path="/admin/revenue" element={
        <ShellRoute requiredRole="admin"><AdminRevenuePage /></ShellRoute>
      } />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
