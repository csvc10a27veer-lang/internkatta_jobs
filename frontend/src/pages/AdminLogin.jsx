// frontend/src/pages/admin/AdminLogin.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useAdminAuth } from '../context/AdminAuthContext';
import { setupGoogleSignInButton } from '../utils/googleAuth';

const AdminLogin = () => {
    const navigate = useNavigate();
    // Get 'auth' and 'login' from the admin context
    const { auth, login } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // This effect PREVENTS a logged-in admin from seeing the login page
    // If you refresh the page and are already logged in, it will redirect you.
    useEffect(() => {
        if (auth && auth.admin && auth.admin.role === 'admin') {
            navigate('/admin/managecourse'); // Or your default admin page
        }
    }, [auth, navigate]);

    // Setup Google Sign-In button when component mounts
    useEffect(() => {
        console.log('Setting up Google Sign-In button for AdminLogin component');
        setupGoogleSignInButton('admin-google-signin-button', true);
    }, []);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        // Remove auto-clear functionality - let error persist until form submission
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        // Remove auto-clear functionality - let error persist until form submission
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(''); // Clear error only on form submission
        
        console.log('Admin login attempt for email:', email);
        console.log('Current URL before login attempt:', window.location.href);
        
        // Test: Simulate a manual error first to see if redirect happens
        if (email === 'test@test.com' && password === 'wrong') {
            console.log('Manual test error triggered');
            setErrorMessage('Manual test error - this should not redirect');
            setLoading(false);
            return;
        }
        
        try {
            const { data } = await api.post('/api/admin/login', {
                email,
                password,
            });

            console.log('Admin login response:', data);

            // The simple, direct redirect logic
            // First, check if the login was successful and the user is an admin
            if (data && data.role === 'admin') {
                // Then, update the admin auth context. This is crucial.
                login(data); 
                
                // Finally, show a success message and redirect.
                toast.success('Login successful! Redirecting...');
                console.log('Admin login successful, redirecting to dashboard');
                navigate('/admin/managecourse'); // Redirect to the main admin page
            } else {
                // This handles the rare case where the API returns a success code but no admin role
                console.log('Admin login failed - not an admin role');
                const message = 'Access Denied: You are not an admin.';
                setErrorMessage(message);
                Swal.fire({
                    title: 'Access Denied',
                    text: message,
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#dc2626',
                    allowOutsideClick: true,
                    allowEscapeKey: true
                });
            }

        } catch (err) {
            console.log('Admin login error:', err);
            console.log('Error response:', err.response?.data);
            console.log('Error status:', err.response?.status);
            console.log('Current URL after error:', window.location.href);
            
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your email and password.';
            setErrorMessage(errorMessage);
            // Show SweetAlert popup for error
            Swal.fire({
                title: 'Login Failed',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc2626',
                allowOutsideClick: true,
                allowEscapeKey: true
            });
            // IMPORTANT: No navigation on error - stay on admin login page
        } finally {
            setLoading(false);
            console.log('Admin login form submission completed');
        }
    };

    return (
        <div className="flex flex-col justify-center min-h-[100dvh] py-10 px-4 bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 mx-auto bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
                    <p className="mt-2 text-gray-500">Sign in to manage your dashboard</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={handleEmailChange} 
                            required 
                            className={`w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                errorMessage ? 'border-red-300 focus:ring-red-500' : ''
                            }`}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={handlePasswordChange} 
                            required 
                            className={`w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                errorMessage ? 'border-red-300 focus:ring-red-500' : ''
                            }`}
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border rounded-md text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400">
                           {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-3 text-sm text-gray-500">Or</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Google Sign-In Button */}
                <div id="admin-google-signin-button" className="w-full"></div>
                <p className="text-sm text-center text-gray-500">
                    Not an admin?{' '}
                    <Link to="/login" className="font-medium text-sky-600 hover:underline">
                        Go to user login
                    </Link>
                </p>
            </div>
        </div>
    );
};
    
export default AdminLogin;