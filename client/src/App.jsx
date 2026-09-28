// ============================================
// App.jsx — Root Component with Routing
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Layout
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssetsPage from './pages/AssetsPage';
import AssetDetailPage from './pages/AssetDetailPage';
import MapPage from './pages/MapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';
import InspectionsPage from './pages/InspectionsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <AnimatePresence mode="wait">
        <Routes>
          {/* Public showcase & landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected app routes inside AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/:id" element={<AssetDetailPage />} />

            {/* GIS Map & Telemetry Analytics */}
            <Route path="/map" element={<MapPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />

            {/* Operations: Work Orders & Inspections */}
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />
            <Route path="/inspections" element={<InspectionsPage />} />

            {/* Gamification & Department */}
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 404 — Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

// Temporary placeholder for future pages
function PlaceholderPage({ title, subtitle, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-white/40 max-w-md">{subtitle}</p>
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/10 text-primary-400 text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
        Coming Soon
      </div>
    </div>
  );
}

export default App;
