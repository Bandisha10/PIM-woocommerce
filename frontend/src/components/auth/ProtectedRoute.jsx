import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NexusLogo from '../NexusLogo';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <NexusLogo size={52} />
          <div className="loading-spinner-wrap">
            <Loader2 size={32} className="animate-spin text-purple-600" />
          </div>
          <h3 className="loading-title">Verifying NEXUS Session</h3>
          <p className="loading-subtitle">Securing enterprise product database...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
}
