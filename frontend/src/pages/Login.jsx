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
    
    // OTP verification states
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    
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

    // Resend cooldown timer
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Setup Google Sign-In button when component mounts
    useEffect(() => {
        console.log('Setting up Google Sign-In button for Login component');
        setupGoogleSignInButton('google-signin-button');
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Step 1: Validate credentials and request OTP
    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        const trimmedEmail = formData.email ? formData.email.trim() : '';
        if (!trimmedEmail || !formData.password) {
            toast.error('Please enter both email and password');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const { data } = await api.post('/api/users/login', {
                email: trimmedEmail,
                password: formData.password
            });

            if (data?.otpRequired) {
                setOtpSent(true);
                setResendCooldown(60);
                toast.success('OTP sent successfully to your Gmail address!');
            } else if (data?.token && data?.role === 'user') {
                login(data);
                toast.success('Logged in successfully!');
                if (redirectTo) {
                    navigate(redirectTo, { replace: true });
                } else {
                    navigate('/user/mycourse');
                }
            } else {
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

    // Step 2: Verify OTP and complete login
    const handleVerifyOTP = async (e) => {
        if (e) e.preventDefault();
        const cleanOtp = otp ? otp.trim() : '';
        if (!cleanOtp || cleanOtp.length < 6) {
            toast.error('Please enter the 6-digit OTP sent to your email');
            return;
        }

        const trimmedEmail = formData.email ? formData.email.trim() : '';
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const { data } = await api.post('/api/users/login', {
                email: trimmedEmail,
                password: formData.password,
                otp: cleanOtp
            });

            if (data?.token && data?.role === 'user') {
                login(data);
                toast.success('Logged in successfully!');
                if (redirectTo) {
                    navigate(redirectTo, { replace: true });
                } else {
                    navigate('/user/mycourse');
                }
            } else {
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
            const message = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
            setErrorMessage(message);
            Swal.fire({
                title: 'Verification Failed',
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

    // Resend OTP
    const handleResendOTP = async () => {
        if (resendCooldown > 0 || isResending) return;
        const trimmedEmail = formData.email ? formData.email.trim() : '';
        setIsResending(true);
        try {
            const { data } = await api.post('/api/users/login', {
                email: trimmedEmail,
                password: formData.password
            });
            if (data?.otpRequired) {
                setResendCooldown(60);
                toast.success('A fresh OTP has been sent to your Gmail!');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
            toast.error(message);
        } finally {
            setIsResending(false);
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
                                    loading="lazy"
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
                                <p className="mt-1.5 text-sm text-slate-500">
                                    {otpSent ? 'Enter the OTP sent to your Gmail.' : 'Enter your details to access your dashboard.'}
                                </p>
                            </div>
                            
                            <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 ${
                                            errorMessage ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200'
                                        } ${otpSent ? 'cursor-not-allowed opacity-75' : ''}`}
                                        placeholder="you@example.com"
                                        required
                                        disabled={otpSent}
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
                                            } ${otpSent ? 'cursor-not-allowed opacity-75' : ''}`}
                                            placeholder="Enter your password"
                                            required
                                            disabled={otpSent}
                                            value={formData.password}
                                            onChange={handleChange}
                                            autoComplete="current-password"
                                        />
                                        {!otpSent && (
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                                                onClick={() => setShowPass(!showPass)}
                                            >
                                                {showPass ? 'Hide' : 'Show'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {!otpSent && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                                        <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                            Forgot Password?
                                        </Link>
                                        <Link to="/register" state={{ redirectTo }} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                            Create Account
                                        </Link>
                                    </div>
                                )}

                                {!otpSent ? (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white shadow-lg shadow-blue-200 transition duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 disabled:shadow-none"
                                    >
                                        {isSubmitting ? 'Sending OTP to Gmail...' : 'Login'}
                                    </button>
                                ) : (
                                    <div className="space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                                Enter OTP sent to <span className="font-semibold text-blue-600">{formData.email}</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center text-lg font-bold tracking-widest text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                                placeholder="XXXXXX"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                maxLength="6"
                                                autoFocus
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || otp.length < 6}
                                            className="w-full rounded-lg bg-green-600 py-2.5 font-semibold text-white shadow-lg shadow-green-200 transition duration-300 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400 disabled:shadow-none"
                                        >
                                            {isSubmitting ? 'Verifying OTP...' : 'Verify OTP & Login'}
                                        </button>
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <button
                                                type="button"
                                                onClick={handleResendOTP}
                                                disabled={resendCooldown > 0 || isResending}
                                                className="font-semibold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                                            >
                                                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : (isResending ? 'Sending...' : 'Resend OTP')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setOtpSent(false); setOtp(''); setErrorMessage(''); }}
                                                className="text-slate-500 hover:underline"
                                            >
                                                Change Email / Password
                                            </button>
                                        </div>
                                    </div>
                                )}
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
