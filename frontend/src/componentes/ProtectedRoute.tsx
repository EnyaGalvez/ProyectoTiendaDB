import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Si no está autenticado, redirigir a login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar las rutas hijas (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
