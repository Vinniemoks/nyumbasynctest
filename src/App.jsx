import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandlordDashboard from './pages/LandlordDashboard';
import PropertyManagerDashboard from './pages/PropertyManagerDashboard';
import TenantDashboard from './pages/TenantDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route
                path="/landlord-dashboard/*"
                element={
                  <ProtectedRoute allowedRoles={['landlord']}>
                    <LandlordDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/manager-dashboard/*"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <PropertyManagerDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/tenant-dashboard/*"
                element={
                  <ProtectedRoute allowedRoles={['tenant']}>
                    <TenantDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">Unauthorized Access</h1></div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;