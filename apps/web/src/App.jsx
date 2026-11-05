
import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import OnboardingDemo from './pages/OnboardingDemo.jsx';
import CitizenDashboard from './pages/CitizenDashboard.jsx';
import DriverDashboard from './pages/DriverDashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import CivicScoreLedger from './pages/CivicScoreLedger.jsx';
import CitizenInstructions from './pages/CitizenInstructions.jsx';
import DriverInstructions from './pages/DriverInstructions.jsx';
import AdminInstructions from './pages/AdminInstructions.jsx';
import { Toaster } from '@/components/ui/sonner.jsx';

const roleInstructionsPaths = {
  citizen: '/instructions/citizen',
  driver: '/instructions/driver',
  admin: '/instructions/admin'
};

const InstructionsRedirect = () => {
  const { currentUser } = useAuth();
  const target = roleInstructionsPaths[currentUser?.role] || roleInstructionsPaths.citizen;
  return <Navigate to={target} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingDemo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen-dashboard"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-dashboard"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/civic-ledger"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CivicScoreLedger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructions"
            element={
              <ProtectedRoute>
                <InstructionsRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructions/citizen"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenInstructions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructions/driver"
            element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverInstructions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructions/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminInstructions />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
