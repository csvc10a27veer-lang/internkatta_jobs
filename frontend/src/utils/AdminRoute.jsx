// frontend/src/utils/AdminRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminRoute = () => {
    // Get auth and isLoading from the admin context
    const { auth, isLoading } = useAdminAuth();

    // If the AdminAuthContext is still loading the session from localStorage,
    // we render nothing. This prevents a premature redirect.
    if (isLoading) {
        return null; // Or you can return a loading spinner component here
    }

    // Check for admin authentication specifically
    const isAdminAuthenticated = auth?.token && auth?.admin?.role === 'admin';

    if (isAdminAuthenticated) {
        // If the user is an admin, show the nested admin pages (e.g., the dashboard)
        return <Outlet />;
    } else {
        // If not, redirect to the admin login page
        return <Navigate to="/admin/login" replace />;
    }
};

export default AdminRoute;