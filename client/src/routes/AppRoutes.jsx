import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import ResumeUpload from '../pages/ResumeUpload';
import Analysis from '../pages/Analysis';
import History from '../pages/History';
import Login from '../pages/Login';
import ScreeningDashboard from '../pages/ScreeningDashboard';

// Higher-order Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/upload" element={
        <ProtectedRoute>
          <ResumeUpload />
        </ProtectedRoute>
      } />
      
      <Route path="/analyze" element={
        <ProtectedRoute>
          <Analysis />
        </ProtectedRoute>
      } />
      
      <Route path="/history" element={
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      } />

      <Route path="/screening-dashboard" element={
        <ProtectedRoute>
          <ScreeningDashboard />
        </ProtectedRoute>
      } />

      {/* Redirect all unmatched routes to Landing or Dashboard depending on session */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
