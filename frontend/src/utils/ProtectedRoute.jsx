// In frontend/src/utils/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';

const ProtectedRoute = ({ children }) => {
  const { auth, isLoading } = useUserAuth();

  // While the context is loading, don't make a decision yet.
  if (isLoading) {
    return null; // Or a loading spinner
  }

  // Check for user authentication specifically
  if (auth && auth.token && auth.user && auth.user.role === 'user') {
    return children;
  }

  return <Navigate to="/login" />;
};

export default ProtectedRoute;