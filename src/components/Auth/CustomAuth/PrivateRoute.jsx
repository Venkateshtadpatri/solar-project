import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  // Get the isAuthenticated state from Redux
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Render the children routes only if authenticated, otherwise redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
