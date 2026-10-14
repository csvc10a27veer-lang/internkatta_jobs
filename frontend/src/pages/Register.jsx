// src/pages/Register.jsx

import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  ArrowRight, 
  Briefcase, 
  BookOpen, 
  TrendingUp, 
  HelpCircle,
  KeyRound,
  CheckCircle2,
  Loader2
} from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const securityQuestions = [
    "What is your favorite food?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was the name of your first pet?",
    "What was your childhood nickname?",
    "What is the name of your best friend?",
    "What is your favorite movie?",
    "What was the name of your elementary school?",
  ];

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Flow States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email))
      errs.email = "Enter a valid email";
    if (!/^\d{10}$/.test(formData.phone))
      errs.phone = "Enter a valid 10-digit mobile number";
    if (formData.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!formData.securityQuestion.trim())
      errs.securityQuestion = "Security question is required";
    if (!formData.securityAnswer.trim())
      errs.securityAnswer = "Security answer is required";
    return errs;
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setOtpSending(true);
      try {
        await api.post("/api/users/send-email-otp", { email: formData.email });
        setOtpSent(true);
        toast.success("OTP sent successfully to your email!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to send OTP");
      } finally {
        setOtpSending(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otpSent) {
      handleSendOTP(e);
    } else {
      handleVerifyAndRegister(e);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    if (e) e.preventDefault();
    
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Verify OTP
      const { data } = await api.post("/api/users/verify-email-otp", { 
        email: formData.email, 
        otp 
      });
      const verificationToken = data.verificationToken;

      // 2. Register User
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        securityQuestion: formData.securityQuestion,
        securityAnswer: formData.securityAnswer,
        verificationToken, 
      };

      await api.post("/api/users/register", payload);

      toast.success("Registration Successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { state: { redirectTo } });
      }, 1500);
    } catch (err) {
      const message =
        err.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white min-h-[calc(100vh-140px)] flex items-center justify-center py-4 sm:py-7 lg:py-10 px-3 sm:px-6 lg:px-8 font-sans">
      <SEO
        title="Create Your Account - InternKatta"
        description="Sign up for InternKatta to discover verified internships, industry-ready training programs, and project-based certifications."
        keywords="internkatta register, student signup, create account, internships"
        url="https://internkatta.com/register"
      />

      <div className="max-w-[1400px] w-full mx-auto">
        {/* Main Hero Card Container */}
        <div className="relative w-full rounded-[24px] sm:rounded-[32px] md:rounded-[36px] overflow-hidden shadow-2xl border border-slate-200/60 bg-[#061122] min-h-[660px] lg:min-h-[760px] flex flex-col lg:flex-row items-center justify-between p-6 sm:p-9 lg:p-12 xl:p-14">
          
          {/* Background Photography: Student working on terrace overlooking skyline */}
          <img
            src="/login-hero-bg.jpg"
            alt="Student studying overlooking skyline"
            className="absolute inset-0 w-full h-full object-cover object-[center_35%] pointer-events-none"
            loading="eager"
          />

          {/* Gradient Overlays for crisp contrast and sharp readability */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[#061226]/98 via-[#071836]/90 via-50% to-transparent pointer-events-none" 
            aria-hidden="true" 
          />
          <div 
            className="absolute inset-0 bg-gradient-to-b from-[#061226]/50 via-transparent to-[#061226]/80 pointer-events-none" 
            aria-hidden="true" 
          />
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
                Start Your <br />
                <span className="text-[#00C2FF]">Learning Journey</span> Today.
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-slate-200/90 font-normal leading-relaxed max-w-md mb-6 sm:mb-8">
                Create your account to discover internships, industry training programs, and career-focused opportunities.
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

          {/* ── RIGHT SIDE: Floating White Registration Card (Enlarged) ───── */}
          <div className="relative z-20 w-full lg:w-auto flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="w-full max-w-[520px] lg:max-w-[560px] xl:max-w-[600px] bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-9 lg:p-10 xl:p-11 shadow-2xl shadow-black/45 border border-white/90">
              
              {/* Welcome Tag */}
              <span className="text-[#0066FF] font-bold text-xs sm:text-[13px] tracking-[0.2em] uppercase block mb-1">
                CREATE ACCOUNT
              </span>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D1829] tracking-tight mb-1 leading-tight">
                Create Your Account
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6">
                Fill in your details to start your journey.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">
                {/* 2-Column: Full Name & Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-3 py-2.5 sm:py-3 bg-slate-50 border rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                          errors.fullName ? "border-red-300" : "border-slate-200"
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength="10"
                        placeholder="10-digit number"
                        className={`w-full pl-10 pr-3 py-2.5 sm:py-3 bg-slate-50 border rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                          errors.phone ? "border-red-300" : "border-slate-200"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-3 py-2.5 sm:py-3 bg-slate-50 border rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                        errors.email ? "border-red-300" : "border-slate-200"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Security Question & Answer (2-Column) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                      Security Question
                    </label>
                    <div className="relative flex items-center">
                      <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <select
                        name="securityQuestion"
                        value={formData.securityQuestion}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2.5 sm:py-3 bg-slate-50 border rounded-2xl text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none ${
                          formData.securityQuestion ? "text-slate-800" : "text-slate-400"
                        } ${errors.securityQuestion ? "border-red-300" : "border-slate-200"}`}
                      >
                        <option value="">Select question</option>
                        {securityQuestions.map((q, idx) => (
                          <option key={idx} value={q}>
                            {q}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.securityQuestion && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.securityQuestion}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                      Security Answer
                    </label>
                    <div className="relative flex items-center">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        name="securityAnswer"
                        value={formData.securityAnswer}
                        onChange={handleChange}
                        disabled={!formData.securityQuestion}
                        placeholder="Your answer"
                        className={`w-full pl-10 pr-3 py-2.5 sm:py-3 bg-slate-50 border rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100 disabled:cursor-not-allowed ${
                          errors.securityAnswer ? "border-red-300" : "border-slate-200"
                        }`}
                      />
                    </div>
                    {errors.securityAnswer && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.securityAnswer}</p>
                    )}
                  </div>
                </div>

                {/* Password & Confirm Password (2-Column) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 chars"
                        className={`w-full pl-10 pr-12 py-2.5 sm:py-3 bg-slate-50 border rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                          errors.password ? "border-red-300" : "border-slate-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-[11px] font-bold text-[#0066FF] hover:text-[#0052CC] cursor-pointer"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className={`w-full pl-10 pr-12 py-2.5 sm:py-3 bg-slate-50 border rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:border-[#0066FF] focus:ring-4 focus:ring-blue-100 transition-all outline-none ${
                          errors.confirmPassword ? "border-red-300" : "border-slate-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-[11px] font-bold text-[#0066FF] hover:text-[#0052CC] cursor-pointer"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-[11px] text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* EMAIL OTP FLOW */}
                <div className="pt-2">
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpSending}
                      className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-white bg-[#0066FF] hover:bg-[#0052CC] active:scale-[0.99] transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2.5 text-base sm:text-lg cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {otpSending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending OTP to Email...</span>
                        </>
                      ) : (
                        <>
                          <span>Send OTP to Email</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-4 rounded-2xl bg-blue-50/60 p-4 sm:p-5 border border-blue-200/70">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                          Enter 6-Digit OTP sent to <span className="font-bold text-[#0066FF]">{formData.email}</span>
                        </label>
                        <input
                          type="text"
                          className="w-full py-3 px-4 bg-white border border-blue-200 rounded-xl text-center tracking-[0.3em] text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
                          placeholder="XXXXXX"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          maxLength="6"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || otp.length < 6}
                        className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Verifying & Registering...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Verify OTP & Complete Registration</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="w-full text-xs sm:text-sm font-semibold text-[#0066FF] hover:underline cursor-pointer text-center"
                      >
                        Edit Details / Resend OTP
                      </button>
                    </div>
                  )}
                </div>

                {/* Login link row */}
                <div className="pt-2 text-center text-xs sm:text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    state={{ redirectTo }}
                    className="font-bold text-[#0066FF] hover:text-[#0052CC] hover:underline"
                  >
                    Log In
                  </Link>
                </div>
              </form>
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

export default Register;
