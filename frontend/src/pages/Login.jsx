// src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useUserAuth } from '../context/UserAuthContext';
import api from '../utils/api';
import { setupGoogleSignInButton } from '../utils/googleAuth';
import SEO from '../components/SEO';
import { Mail, Lock, ArrowRight, Briefcase, BookOpen, TrendingUp } from 'lucide-react';

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
        <div className="w-full bg-white min-h-[calc(100vh-140px)] flex items-center justify-center py-4 sm:py-7 lg:py-10 px-3 sm:px-6 lg:px-8 font-sans">
            <SEO
                title="Login to Your Account - InternKatta"
                description="Sign in to your InternKatta account to manage your internships, learning progress, and certificates."
                keywords="internkatta login, student portal, internship dashboard, sign in"
                url="https://internkatta.com/login"
            />

            <div className="max-w-[1400px] w-full mx-auto">
                {/* Main Hero Card Container */}
                <div className="relative w-full rounded-[24px] sm:rounded-[32px] md:rounded-[36px] overflow-hidden shadow-2xl border border-white/10 bg-[#061122] min-h-[620px] lg:min-h-[680px] flex flex-col lg:flex-row items-center justify-between p-6 sm:p-9 lg:p-12">
                    
                    {/* Background Photography: Student working on terrace overlooking city skyline */}
                    <img
                        src="/login-hero-bg.jpg"
                        alt="Student studying overlooking skyline"
                        className="absolute inset-0 w-full h-full object-cover object-[center_35%] pointer-events-none"
                        loading="eager"
                    />

                    {/* Gradient Overlays for crisp contrast and sharp readability */}
                    {/* 1. Left deep navy fade for text clarity */}
                    <div 
                        className="absolute inset-0 bg-gradient-to-r from-[#061226]/98 via-[#071836]/90 via-50% to-transparent pointer-events-none" 
                        aria-hidden="true" 
                    />
                    {/* 2. Top-to-bottom subtle vignette */}
                    <div 
                        className="absolute inset-0 bg-gradient-to-b from-[#061226]/50 via-transparent to-[#061226]/80 pointer-events-none" 
                        aria-hidden="true" 
                    />
                    {/* 3. Mobile darkening overlay */}
                    <div 
                        className="absolute inset-0 bg-[#061226]/85 lg:hidden pointer-events-none" 
                        aria-hidden="true" 
                    />

                    {/* ── LEFT SIDE: Brand & Value Proposition ────────────────────── */}
                    <div className="relative z-10 max-w-xl text-left flex flex-col justify-between h-full py-2 w-full lg:w-1/2">
                        <div>
                            {/* Brand Logo in Top-Left (Original InternKatta Logo) */}
                            <Link to="/" className="inline-flex items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8 lg:mb-10 group">
                                <img
                                    src="/logo2-transparent.png"
                                    alt="InternKatta Logo"
                                    className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105"
                                />
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center">
                                        <span className="text-xl sm:text-2xl font-bold text-white">
                                            Intern
                                        </span>
                                        <span className="text-xl sm:text-2xl font-bold text-[#f97316]">
                                            Katta
                                        </span>
                                    </div>
                                    <span className="text-[10px] sm:text-xs text-slate-300 font-medium tracking-wide mt-0.5">
                                        Intern <strong className="text-white">Smarter</strong>, Grow <strong className="text-white">Faster</strong>
                                    </span>
                                </div>
                            </Link>

                            {/* Headline */}
                            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-white leading-[1.15] tracking-tight mb-3 sm:mb-4">
                                Your Internship <br />
                                <span className="text-[#00C2FF]">Journey Starts</span> Here.
                            </h1>

                            {/* Subtitle */}
                            <p className="text-xs sm:text-sm md:text-base text-slate-200/90 font-normal leading-relaxed max-w-md mb-6 sm:mb-8">
                                Explore real opportunities, build your skills, and take the next step towards your dream career.
                            </p>

                            {/* 3 Feature Badges */}
                            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                {/* 1. Find Internships */}
                                <div className="flex flex-col items-center justify-center w-22 sm:w-26 h-22 sm:h-26 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-2.5 text-center shadow-lg shadow-black/20 hover:scale-105 transition-transform">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-[#38BDF8] mb-1.5">
                                        <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="text-white text-[10px] sm:text-xs font-semibold leading-tight">
                                        Find<br />Internships
                                    </span>
                                </div>

                                {/* 2. Learn New Skills */}
                                <div className="flex flex-col items-center justify-center w-22 sm:w-26 h-22 sm:h-26 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-2.5 text-center shadow-lg shadow-black/20 hover:scale-105 transition-transform">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-[#38BDF8] mb-1.5">
                                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="text-white text-[10px] sm:text-xs font-semibold leading-tight">
                                        Learn<br />New Skills
                                    </span>
                                </div>

                                {/* 3. Build Your Future */}
                                <div className="flex flex-col items-center justify-center w-22 sm:w-26 h-22 sm:h-26 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-2.5 text-center shadow-lg shadow-black/20 hover:scale-105 transition-transform">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-[#38BDF8] mb-1.5">
                                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <span className="text-white text-[10px] sm:text-xs font-semibold leading-tight">
                                        Build<br />Your Future
                                    </span>
                                </div>
                            </div>

                            {/* Handwritten "Learn Intern Grow" Accent */}
                            <div className="pt-1 -rotate-6 w-fit">
                                <p className="font-handwritten text-xl sm:text-2xl text-white font-bold leading-tight drop-shadow-md">
                                    Learn<br />
                                    Intern<br />
                                    Grow
                                </p>
                                <svg className="w-20 sm:w-24 h-3 text-[#00C2FF] -mt-1" viewBox="0 0 100 20" fill="none">
                                    <path d="M4 14 C 35 20, 70 18, 96 8" stroke="#00C2FF" strokeWidth="3.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT SIDE: Floating White Login Card (Increased Size) ── */}
                    <div className="relative z-20 w-full lg:w-auto flex justify-center lg:justify-end mt-8 lg:mt-0">
                        <div className="w-full max-w-[480px] lg:max-w-[520px] xl:max-w-[550px] bg-white rounded-[28px] sm:rounded-[36px] p-7 sm:p-10 lg:p-11 xl:p-12 shadow-2xl shadow-black/45 border border-white/90">
                            
                            {/* Welcome Back Tag */}
                            <span className="text-[#0066FF] font-bold text-xs sm:text-[13px] tracking-[0.2em] uppercase block mb-1.5">
                                WELCOME BACK
                            </span>

                            {/* Title */}
                            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0D1829] tracking-tight mb-1.5 leading-tight">
                                Login to Your Account
                            </h2>

                            {/* Subtitle */}
                            <p className="text-sm sm:text-base text-slate-500 mb-6 sm:mb-7">
                                {otpSent ? 'Enter the OTP sent to your Gmail.' : 'Enter your details to access your dashboard.'}
                            </p>

                            {/* Error Banner */}
                            {errorMessage && (
                                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 font-medium animate-fadeIn">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4 sm:space-y-5">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm sm:text-[15px] font-semibold text-slate-700 mb-1.5">
                                        Email
                                    </label>
                                    <div className="relative flex items-center">
                                        <Mail className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={otpSent}
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            className={`w-full pl-12 pr-4 py-3 sm:py-3.5 bg-slate-50 border rounded-2xl text-slate-800 placeholder-slate-400 text-sm sm:text-base focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                                                errorMessage ? 'border-red-300' : 'border-slate-200'
                                            } ${otpSent ? 'cursor-not-allowed opacity-75' : ''}`}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm sm:text-[15px] font-semibold text-slate-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={otpSent}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            className={`w-full pl-12 pr-16 py-3 sm:py-3.5 bg-slate-50 border rounded-2xl text-slate-800 placeholder-slate-400 text-sm sm:text-base focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                                                errorMessage ? 'border-red-300' : 'border-slate-200'
                                            } ${otpSent ? 'cursor-not-allowed opacity-75' : ''}`}
                                        />
                                        {!otpSent && (
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(!showPass)}
                                                className="absolute right-4 text-xs sm:text-sm font-bold text-[#0066FF] hover:text-[#0052CC] cursor-pointer"
                                            >
                                                {showPass ? 'Hide' : 'Show'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Forgot Password / Create Account (when OTP not sent) */}
                                {!otpSent && (
                                    <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                                        <Link to="/forgot-password" className="font-semibold text-[#0066FF] hover:underline">
                                            Forgot Password?
                                        </Link>
                                        <Link to="/register" state={{ redirectTo }} className="font-bold text-[#0066FF] hover:underline">
                                            Create Account
                                        </Link>
                                    </div>
                                )}

                                {/* Submit Button / OTP Section */}
                                {!otpSent ? (
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-white bg-[#0066FF] hover:bg-[#0052CC] active:scale-[0.99] transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2.5 text-base sm:text-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <span>Sending OTP to Gmail...</span>
                                            ) : (
                                                <>
                                                    <ArrowRight className="w-5 h-5" />
                                                    <span>Login</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 rounded-2xl bg-blue-50/50 p-4 sm:p-5 border border-blue-100">
                                        <div>
                                            <label className="mb-2 block text-xs sm:text-sm font-semibold text-slate-700">
                                                Enter 6-digit OTP sent to <span className="font-bold text-[#0066FF]">{formData.email}</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-xl font-black tracking-[0.3em] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100"
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
                                            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 active:scale-[0.99] transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Verifying OTP...' : 'Verify OTP & Login'}
                                        </button>
                                        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                                            <button
                                                type="button"
                                                onClick={handleResendOTP}
                                                disabled={resendCooldown > 0 || isResending}
                                                className="font-semibold text-[#0066FF] hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
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

                            {/* Or Divider */}
                            <div className="my-5 sm:my-6 flex items-center">
                                <div className="flex-1 border-t border-slate-200"></div>
                                <span className="px-3 text-xs sm:text-sm font-medium text-slate-400">Or</span>
                                <div className="flex-1 border-t border-slate-200"></div>
                            </div>

                            {/* Google Sign-In */}
                            <div id="google-signin-button" className="flex w-full justify-center"></div>
                        </div>
                    </div>

                    {/* Bottom Right Watermark Accent */}
                    <div className="absolute bottom-3 right-6 text-white/40 text-[11px] font-medium hidden sm:block pointer-events-none">
                        — Internkatta
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
