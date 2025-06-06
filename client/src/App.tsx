import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { theme } from './theme';
import Layout from './components/Layout';

// Pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import RideSearch from './pages/rides/RideSearch';
import RideResults from './pages/rides/RideResults';
import RideHistory from './pages/rides/RideHistory';
import ParkingSearch from './pages/parking/ParkingSearch';
import ParkingHistory from './pages/parking/ParkingHistory';
import ParkingResults from './pages/parking/ParkingResults';
import ParkingSlots from './pages/parking/ParkingSlots';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" replace />} />
      <Route path="/onboarding" element={!user ? <Onboarding /> : <Navigate to="/" replace />} />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/rides/search" element={
        <ProtectedRoute>
          <RideSearch />
        </ProtectedRoute>
      } />
      <Route path="/rides/results" element={
        <ProtectedRoute>
          <RideResults />
        </ProtectedRoute>
      } />
      <Route path="/rides/history" element={
        <ProtectedRoute>
          <RideHistory />
        </ProtectedRoute>
      } />
      <Route path="/parking/search" element={
        <ProtectedRoute>
          <ParkingSearch />
        </ProtectedRoute>
      } />
      <Route path="/parking/history" element={
        <ProtectedRoute>
          <ParkingHistory />
        </ProtectedRoute>
      } />
      <Route path="/parking/results" element={
        <ProtectedRoute>
          <ParkingResults />
        </ProtectedRoute>
      } />
      <Route path="/parking-slots" element={
        <ProtectedRoute>
          <ParkingSlots />
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={
        <Navigate to="/" replace state={{ from: window.location.pathname, invalidPath: true }} />
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
      <Router>
          <AppRoutes />
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 