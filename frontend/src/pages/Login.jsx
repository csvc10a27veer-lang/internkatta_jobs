// src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useUserAuth } from '../context/UserAuthContext';
import api from '../utils/api';
import { setupGoogleSignInButton } from '../utils/googleAuth';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Get the 'auth' object from the user context
    const { auth, login } = useUserAuth(); 
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.redirectTo;

    // This effect checks if the user is ALREADY logged in.
    useEffect(() => {
        if (auth && auth.token && auth.user?.role === 'user') {
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
            } else {
                navigate('/user/mycourse');
            }
        }
    }, [auth, navigate, redirectTo]);

    // Setup Google Sign-In button when component mounts
    useEffect(() => {
        console.log('Setting up Google Sign-In button for Login component');
        setupGoogleSignInButton('google-signin-button');
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Remove auto-clear functionality - let error persist until form submission
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(''); // Clear error only on form submission

    try {
        const { data } = await api.post('/api/users/login', formData);

        if (data && data.role === 'user') {
            login(data); // Update user auth context
            toast.success('Logged in successfully!');
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
            } else {
                navigate('/user/mycourse');
            }
        } else {
            // If the role is not "user", deny login
            const message = 'Access denied. Only users can log in here.';
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
        const message = err.response?.data?.message || 'Login failed. Please check your email and password.';
        setErrorMessage(message);
        // Show SweetAlert popup for error
        Swal.fire({
            title: 'Login Failed',
            text: message,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc2626',
            allowOutsideClick: true,
            allowEscapeKey: true
        });
    } finally {
        setIsSubmitting(false);
    }
};

    // If the user is logged in, we render nothing, because the useEffect is about to redirect them.
    if (auth && auth.token) {
        return null;
    }

    return (
        <div className="flex min-h-[100dvh] flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-sky-100 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-4xl">
                <div className="grid w-full overflow-hidden rounded-lg bg-white shadow-xl shadow-indigo-100 ring-1 ring-slate-200 lg:grid-cols-[1fr_0.92fr]">
                    <div className="relative hidden min-h-[470px] bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 p-6 lg:flex lg:flex-col lg:justify-between">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.32),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.2),_transparent_30%)]"></div>
                        <div className="relative z-10">
                            <h1 className="max-w-md text-2xl font-bold leading-tight text-white">
                                Continue building your career path.
                            </h1>
                            <p className="mt-3 max-w-md text-sm leading-6 text-blue-50">
                                Sign in to manage your internships, learning progress, and opportunities in one place.
                            </p>
                        </div>

                        <div className="relative z-10 flex justify-center">
                            <div className="rounded-lg bg-white/95 p-3 shadow-xl shadow-blue-950/20">
                                <img
                                    src="/assets/loginpage_img.png"
                                    alt="Student working on a laptop"
                                    className="h-[260px] w-full max-w-xs object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center px-5 py-8 sm:p-10 lg:p-8">
                        <div className="w-full max-w-md">
                            <div className="mb-6 sm:mb-8 text-center lg:text-left">
                                <img
                                    src="/assets/loginpage_img.png"
                                    alt="Student working on a laptop"
                                    className="mx-auto mb-4 h-32 sm:h-40 w-full object-contain lg:hidden drop-shadow-md"
                                />
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Welcome back</p>
                                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">Login to Your Account</h2>
                                <p className="mt-1.5 text-sm text-slate-500">Enter your details to access your dashboard.</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 ${
                                            errorMessage ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
                                        }`}
                                        placeholder="you@example.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            name="password"
                                            className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 pr-16 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 ${
                                                errorMessage ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
                                            }`}
                                            placeholder="Enter your password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                                            onClick={() => setShowPass(!showPass)}
                                        >
                                            {showPass ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                        Forgot Password?
                                    </Link>
                                    <Link to="/register" state={{ redirectTo }} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                        Create Account
                                    </Link>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white shadow-lg shadow-blue-200 transition duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 disabled:shadow-none"
                                >
                                    {isSubmitting ? 'Logging In...' : 'Login'}
                                </button>
                            </form>

                            <div className="my-4 flex items-center">
                                <div className="flex-1 border-t border-slate-200"></div>
                                <span className="px-3 text-sm font-medium text-slate-400">Or</span>
                                <div className="flex-1 border-t border-slate-200"></div>
                            </div>

                            <div id="google-signin-button" className="flex w-full justify-center"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
