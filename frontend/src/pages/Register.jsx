// src/pages/Register.jsx

import React, {useState} from "react";
import api from "../utils/api";
import {useNavigate, Link, useLocation} from "react-router-dom"; // Added Link for navigation
import toast from "react-hot-toast"; // Using toast for better feedback

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
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
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
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setOtpSending(true);
      try {
        await api.post("/api/users/send-email-otp", {email: formData.email});
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
    e.preventDefault();
    
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
        navigate("/login", {state: {redirectTo}});
      }, 2000);
    } catch (err) {
      const message =
        err.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";
  const errorInputClass =
    "border-red-300 focus:border-red-500 focus:ring-red-100";

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="grid w-full overflow-hidden rounded-lg bg-white shadow-xl shadow-blue-100 ring-1 ring-slate-200 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="relative hidden bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 p-6 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.32),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.2),_transparent_34%)]"></div>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                Join Internkatta
              </p>
              <h1 className="mt-2 max-w-md text-2xl font-bold leading-tight text-white">
                Start your learning journey today.
              </h1>
              <p className="mt-2 max-w-md text-sm leading-5 text-sky-50">
                Create your account to discover internships, training programs,
                and career-focused opportunities.
              </p>
            </div>

            <div className="relative z-10 flex justify-center">
              <img
                src="/assets/register_imag.png"
                alt="People reviewing a registration document"
                className="h-[250px] w-full max-w-sm object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-center px-5 py-4 sm:px-6 lg:px-8">
            <form
              className="w-full max-w-xl space-y-2.5"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="mb-3 text-center lg:text-left">
                <img
                  src="/assets/register_imag.png"
                  alt="People reviewing a registration document"
                  className="mx-auto mb-2 h-20 w-full object-contain lg:hidden"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Create profile
                </p>
                <h2 className="mt-1.5 text-2xl font-bold text-slate-900">
                  Create Your Account
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in your details to get started.
                </p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className={`${inputClass} ${errors.fullName ? errorInputClass : ""}`}
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className={`${inputClass} ${errors.phone ? errorInputClass : ""}`}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className={`${inputClass} ${errors.email ? errorInputClass : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Security Question
                </label>
                <select
                  name="securityQuestion"
                  className={`${inputClass} ${errors.securityQuestion ? errorInputClass : ""}`}
                  value={formData.securityQuestion}
                  onChange={handleChange}
                >
                  <option value="">Select a security question</option>
                  {securityQuestions.map((question, index) => (
                    <option key={index} value={question}>
                      {question}
                    </option>
                  ))}
                </select>
                {errors.securityQuestion && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.securityQuestion}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Security Answer
                </label>
                <input
                  type="text"
                  name="securityAnswer"
                  placeholder="Enter your answer"
                  className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${errors.securityAnswer ? errorInputClass : ""}`}
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  disabled={!formData.securityQuestion}
                />
                {errors.securityAnswer && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.securityAnswer}
                  </p>
                )}
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`${inputClass} pr-16 ${errors.password ? errorInputClass : ""}`}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      className={`${inputClass} pr-16 ${errors.confirmPassword ? errorInputClass : ""}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* EMAIL OTP FLOW */}
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpSending}
                  className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 disabled:shadow-none"
                >
                  {otpSending ? "Sending OTP..." : "Send OTP to Email"}
                </button>
              ) : (
                <div className="space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Enter OTP sent to {formData.email}
                    </label>
                    <input
                      type="text"
                      className={`${inputClass} text-center tracking-widest text-lg font-bold`}
                      placeholder="XXXXXX"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length < 6}
                    className="w-full rounded-lg bg-green-600 py-2.5 font-semibold text-white shadow-lg shadow-green-200 transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400 disabled:shadow-none"
                  >
                    {isSubmitting ? "Registering..." : "Verify OTP & Register"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Edit Details / Resend OTP
                  </button>
                </div>
              )}
              
              <button type="submit" style={{display: 'none'}}>Hidden Submit</button>
              <p className="text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={{redirectTo}}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Log In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
