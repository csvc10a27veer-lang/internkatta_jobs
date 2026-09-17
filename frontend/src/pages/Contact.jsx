import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import api from '../utils/api';
import {
  User,
  Mail,
  Tag,
  ChevronDown,
  FileText,
  Send,
  Phone,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import toast from 'react-hot-toast';

// ── Validation Helpers ────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name, value) {
  const v = (value || '').trim();
  switch (name) {
    case 'name':
      if (!v) return 'Full name is required.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      return '';
    case 'email':
      if (!v) return 'Email address is required.';
      if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.';
      return '';
    case 'subject':
      if (!v || v === 'What is this regarding?') return 'Please select a subject.';
      return '';
    case 'message':
      if (!v) return 'Message is required.';
      if (v.length < 10) return 'Message must be at least 10 characters.';
      return '';
    default:
      return '';
  }
}

function validateAll(formData) {
  const errs = {};
  ['name', 'email', 'subject', 'message'].forEach((key) => {
    const msg = validateField(key, formData[key]);
    if (msg) errs[key] = msg;
  });
  return errs;
}

const Contact = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const EMPTY = { name: '', email: '', subject: '', message: '' };
  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [serverMsg, setServerMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg('');

    const allTouched = { name: true, email: true, subject: true, message: true };
    setTouched(allTouched);

    const validationErrors = validateAll(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalid = Object.keys(validationErrors)[0];
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setFormStatus('sending');
    try {
      const res = await api.post('/api/contact/submit', formData);
      if (res.data?.success) {
        setFormStatus('success');
        setServerMsg(res.data.message || "Your message has been sent successfully! We'll get back to you soon.");
        setFormData(EMPTY);
        setTouched({});
        setErrors({});
      } else {
        throw new Error(res.data?.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setFormStatus('error');
      setServerMsg(err.response?.data?.message || err.message || 'Something went wrong. Please try again later.');
    }
  };

  const handleReferNow = () => {
    const referralUrl = `${window.location.origin}?ref=contact`;
    const shareData = {
      title: 'InternKatta - Industrial Training & Internships',
      text: 'Join InternKatta for verified internships, industry-ready courses, and practical training programs!',
      url: referralUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      toast.success('🎁 Referral link copied! Share with friends to earn reward points.');
    } else {
      toast.success('Share InternKatta with your friends!');
    }
  };

  const contactStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact InternKatta',
    description: 'Get in touch with InternKatta for inquiries about internships, courses, and training programs.',
    url: 'https://internkatta.com/contact',
  };

  return (
    <div className="relative w-full bg-white font-sans text-slate-800" style={{ overflowX: 'clip' }}>
      <SEO
        title="Contact Us - InternKatta | Get in Touch"
        description="Contact InternKatta for inquiries about internships, courses, and training programs. Our admissions team is ready to help you."
        keywords="contact internkatta, get in touch, admissions, inquiry, support, help, internships, courses"
        url="https://internkatta.com/contact"
        structuredData={contactStructuredData}
      />

      {/* ── TOP HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative w-full bg-gradient-to-r from-[#D7EBFC] via-[#E7F3FE] to-[#D5EAFD] pt-2.5 sm:pt-3 lg:pt-4 pb-3 sm:pb-4 lg:pb-5 overflow-hidden">
        {/* Left Side Organic Blue Accent Swoop */}
        <div className="absolute -left-10 sm:-left-16 top-0 w-32 sm:w-44 md:w-56 h-full pointer-events-none z-0">
          <svg viewBox="0 0 300 500" className="w-full h-full" preserveAspectRatio="none" fill="none">
            <path
              d="M0 0 C 120 40, 220 180, 180 320 C 140 440, 40 480, 0 500 Z"
              fill="#1D75F5"
              opacity="0.95"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 pl-2 sm:pl-4 md:pl-6">
              <span className="inline-block text-[#1D75F5] font-bold text-[10px] sm:text-xs tracking-wider uppercase mb-0.5">
                WE'RE HERE TO HELP
              </span>

              <h1 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold text-[#0D1829] tracking-tight leading-tight mb-1">
                <span className="relative inline-block">
                  Get in
                  {/* Curved Cyan Smile Underline Accent */}
                  <svg
                    className="absolute -bottom-1 left-0 w-full h-2 sm:h-2.5 text-[#00C2FF] overflow-visible"
                    viewBox="0 0 100 16"
                    fill="none"
                  >
                    <path
                      d="M3 11 C 32 17, 68 16, 97 5"
                      stroke="#00C2FF"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{' '}
                <span className="text-[#1D75F5]">Touch</span>
              </h1>

              <p className="text-slate-600 font-normal text-xs sm:text-[13px] max-w-md leading-normal mt-0.5">
                Have a question, need support, or just want to say hello? We'd love to hear from you.
              </p>
            </div>

            {/* Right Side: Campus Student & "Your Future Matters" */}
            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              {/* Handwritten "Your Future Matters" Doodle */}
              <div className="absolute top-0 right-2 sm:right-6 md:right-10 lg:right-12 z-20 pointer-events-none -rotate-6 text-right">
                <p className="font-handwritten text-base sm:text-lg md:text-xl text-[#1D75F5] font-bold leading-tight drop-shadow-sm">
                  Your Future
                  <br />
                  Matters
                </p>
                <svg
                  className="w-14 sm:w-16 h-2 sm:h-2.5 text-[#1D75F5] ml-auto"
                  viewBox="0 0 100 20"
                  fill="none"
                >
                  <path
                    d="M4 11 C 35 18, 70 17, 96 6"
                    stroke="#1D75F5"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Student Photo with Seamless Edge Blend */}
              <div className="relative w-full max-w-[190px] sm:max-w-[220px] lg:max-w-[250px] h-24 sm:h-28 md:h-32 lg:h-34 rounded-xl overflow-hidden">
                <img
                  src="/contact-hero-student.jpg"
                  alt="InternKatta Student"
                  className="w-full h-full object-cover object-center"
                  style={{
                    maskImage:
                      'linear-gradient(to left, black 75%, transparent 100%), linear-gradient(to bottom, black 80%, transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to left, black 75%, transparent 100%), linear-gradient(to bottom, black 80%, transparent 100%)',
                  }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Wavy Smooth Bottom Transition into White Content */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            className="w-full h-2.5 sm:h-3.5 lg:h-4"
            preserveAspectRatio="none"
          >
            <path
              d="M0 20 C 320 50, 780 10, 1440 30 L 1440 60 L 0 60 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </section>

      {/* ── MAIN CONTENT (2-COLUMN CARDS & FORM) ──────────────────────────── */}
      <section className="relative w-full bg-white pt-1.5 sm:pt-2.5 pb-3 sm:pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">

            {/* ── LEFT COLUMN: Contact Information & Cards ── */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="text-[#1D75F5] font-bold text-[10px] sm:text-xs tracking-wider uppercase block mb-0.5">
                  CONTACT INFORMATION
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1829] tracking-tight mb-1">
                  <span className="relative inline-block">
                    Let's
                    {/* Curved Cyan Smile Underline */}
                    <svg
                      className="absolute -bottom-0.5 left-0 w-full h-2.5 text-[#00C2FF] overflow-visible"
                      viewBox="0 0 70 14"
                      fill="none"
                    >
                      <path
                        d="M2 9 C 22 14, 48 14, 68 4"
                        stroke="#00C2FF"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>{' '}
                  <span className="text-[#1D75F5]">Connect</span>
                </h2>

                <p className="text-slate-600 text-xs sm:text-[13px] leading-normal mb-3 max-w-lg">
                  Fill up the form and our team will get back to you within 24 hours. Alternatively, you can reach us through the channels below.
                </p>

                {/* 3 Contact Cards */}
                <div className="space-y-2 sm:space-y-2.5">
                  {/* Card 1: Call Us */}
                  <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-xs hover:shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#1D75F5] shrink-0">
                        <Phone className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">Call Us</h3>
                        <p className="text-[11px] text-slate-500">For admissions and support, please call.</p>
                        <a
                          href="tel:+919527605805"
                          className="text-xs sm:text-sm font-bold text-[#1D75F5] hover:underline inline-block"
                        >
                          +91 95276 05805
                        </a>
                      </div>
                    </div>
                    <a
                      href="tel:+919527605805"
                      aria-label="Call admissions"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#1D75F5] hover:bg-[#1D75F5] hover:text-white transition-colors shrink-0"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Card 2: Email Us */}
                  <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-xs hover:shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF0E6] flex items-center justify-center text-[#FF7A1A] shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">Email Us</h3>
                        <p className="text-[11px] text-slate-500">For general inquiries, drop us an email.</p>
                        <a
                          href="mailto:internkatta@gmail.com"
                          className="text-xs sm:text-sm font-bold text-[#1D75F5] hover:underline inline-block break-all"
                        >
                          internkatta@gmail.com
                        </a>
                      </div>
                    </div>
                    <a
                      href="mailto:internkatta@gmail.com"
                      aria-label="Send email"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#1D75F5] hover:bg-[#1D75F5] hover:text-white transition-colors shrink-0"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Card 3: Our Office */}
                  <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-xs hover:shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#10B981] shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">Our Office</h3>
                        <p className="text-[11px] text-slate-500">City Vista Kharadi, Pune</p>
                      </div>
                    </div>
                    <a
                      href="https://maps.google.com/?q=City+Vista+Kharadi+Pune"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Find on Google Maps"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#1D75F5] hover:bg-[#1D75F5] hover:text-white transition-colors shrink-0"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Social Media Row */}
                <div className="flex items-center gap-2.5 pt-3">
                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/company/internkatta/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="InternKatta LinkedIn"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
                  >
                    <FaLinkedinIn className="w-3.5 h-3.5" />
                  </a>
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/internkatta/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="InternKatta Instagram"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4] text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
                  >
                    <FaInstagram className="w-3.5 h-3.5" />
                  </a>
                  {/* YouTube */}
                  <a
                    href="https://youtube.com/@internkatta"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="InternKatta YouTube"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
                  >
                    <FaYoutube className="w-3.5 h-3.5" />
                  </a>
                  {/* X / Twitter */}
                  <a
                    href="https://twitter.com/internkatta"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="InternKatta X"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
                  >
                    <FaXTwitter className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* 3D Graduation Cap on Stack of Books with "Dream Learn Achieve" & Refer Now Ad on right side */}
              <div className="relative mt-3 sm:mt-4 pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                {/* 3D Books Illustration */}
                <div className="relative w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 shrink-0">
                  <img
                    src="/contact-grad-books.jpg"
                    alt="Education & Learning"
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>

                {/* Angled Handwritten Marker Text "Dream Learn Achieve" */}
                <div className="relative -top-1 sm:-top-2 -rotate-12 pointer-events-none shrink-0">
                  <p className="font-handwritten text-base sm:text-lg text-[#1D75F5] font-bold leading-tight drop-shadow-sm">
                    Dream
                    <br />
                    Learn
                    <br />
                    Achieve
                  </p>
                  <svg className="w-12 sm:w-16 h-2 sm:h-2.5 text-[#1D75F5] -mt-0.5" viewBox="0 0 100 15" fill="none">
                    <path
                      d="M4 10 C 35 15, 65 14, 96 5"
                      stroke="#1D75F5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Refer Now Ad Card on the Right Side of Dream Learn Achieve */}
                <div className="flex-1 min-w-[180px] max-w-[240px] bg-gradient-to-br from-[#D9EFFD] via-[#E7F3FE] to-[#CEE8FC] border border-blue-100/90 rounded-xl p-2 sm:p-2.5 shadow-xs">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[8px] sm:text-[9px] font-bold text-[#1D75F5] uppercase tracking-wider">
                      REFER & EARN
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-semibold text-amber-900 bg-amber-100/90 border border-amber-200/80 px-1 py-0 rounded-full">
                      🪙 +500 Pts
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-[13px] font-black text-[#0D1829] leading-snug mb-0.5">
                    Spread the Word About <span className="text-[#1D75F5]">Intern</span><span className="text-[#FF7A1A]">Katta</span>
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-600 mb-1.5 leading-tight">
                    Invite friends & earn bonus reward points!
                  </p>
                  <button
                    type="button"
                    onClick={handleReferNow}
                    className="inline-flex items-center gap-1 bg-[#1D75F5] hover:bg-[#155fc7] active:scale-95 text-white font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full shadow-xs transition-all cursor-pointer group"
                  >
                    <span>Refer Now</span>
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Send a Message Card & Flight Doodle ── */}
            <div className="lg:col-span-6 relative">
              
              {/* Floating Paper Airplane Trail & "Together Towards Your Goals" */}
              <div className="hidden sm:block absolute -top-5 right-2 sm:right-4 z-30 pointer-events-none">
                {/* Curved Dashed Trajectory with Paper Plane */}
                <div className="relative w-28 sm:w-32 h-20 sm:h-24">
                  <svg
                    viewBox="0 0 160 140"
                    fill="none"
                    className="w-full h-full overflow-visible"
                  >
                    {/* Dotted Flight Loop */}
                    <path
                      d="M20 120 C 50 110, 110 80, 70 30 C 40 -5, 10 50, 60 70 C 110 85, 140 40, 150 20"
                      stroke="#1D75F5"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                    {/* Blue Paper Plane Icon at the end of trajectory */}
                    <g transform="translate(138, 12) rotate(25)">
                      <path
                        d="M0 0 L 22 8 L 8 22 L 7 13 L 0 0 Z"
                        fill="#1D75F5"
                      />
                      <path
                        d="M7 13 L 22 8 L 13 14 Z"
                        fill="#155FC7"
                      />
                    </g>
                  </svg>
                </div>

                {/* Angled Handwritten Marker Text */}
                <div className="text-right -rotate-8 -mt-5 pr-1">
                  <p className="font-handwritten text-base sm:text-lg text-[#1D75F5] font-bold leading-tight drop-shadow-sm">
                    Together
                    <br />
                    Towards
                    <br />
                    Your Goals
                  </p>
                  <svg className="w-18 sm:w-20 h-2 text-[#1D75F5] ml-auto -mt-0.5" viewBox="0 0 100 15" fill="none">
                    <path
                      d="M5 10 C 35 15, 70 14, 95 6"
                      stroke="#1D75F5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* White Form Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-xl shadow-blue-900/6 border border-slate-100 relative z-20">
                {/* Form Card Header */}
                <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1D75F5] flex items-center justify-center text-white shadow-sm shrink-0">
                    <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0D1829] tracking-tight">
                    Send a <span className="text-[#1D75F5]">Message</span>
                  </h2>
                </div>

                {/* Form Elements */}
                <form onSubmit={handleSubmit} noValidate className="space-y-2.5 sm:space-y-3">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your full name"
                        className={`w-full pl-9 pr-3 py-1.5 sm:py-2 bg-white border rounded-lg text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none transition-all ${
                          touched.name && errors.name
                            ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400/20'
                            : 'border-slate-200 focus:border-[#1D75F5] focus:ring-2 focus:ring-[#1D75F5]/15'
                        }`}
                        aria-invalid={!!(touched.name && errors.name)}
                      />
                    </div>
                    {touched.name && errors.name && (
                      <p className="mt-0.5 text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your email address"
                        className={`w-full pl-9 pr-3 py-1.5 sm:py-2 bg-white border rounded-lg text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none transition-all ${
                          touched.email && errors.email
                            ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400/20'
                            : 'border-slate-200 focus:border-[#1D75F5] focus:ring-2 focus:ring-[#1D75F5]/15'
                        }`}
                        aria-invalid={!!(touched.email && errors.email)}
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="mt-0.5 text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                      <select
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full pl-9 pr-8 py-1.5 sm:py-2 bg-white border rounded-lg text-xs sm:text-sm focus:outline-none appearance-none transition-all cursor-pointer ${
                          formData.subject ? 'text-slate-800' : 'text-slate-400'
                        } ${
                          touched.subject && errors.subject
                            ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400/20'
                            : 'border-slate-200 focus:border-[#1D75F5] focus:ring-2 focus:ring-[#1D75F5]/15'
                        }`}
                        aria-invalid={!!(touched.subject && errors.subject)}
                      >
                        <option value="" disabled>
                          What is this regarding?
                        </option>
                        <option value="Course Admissions & Inquiries">Course Admissions & Inquiries</option>
                        <option value="Internship Programs & Placement">Internship Programs & Placement</option>
                        <option value="Industrial Training / MSBTE">Industrial Training / MSBTE</option>
                        <option value="College & Campus Partnerships">College & Campus Partnerships</option>
                        <option value="Technical Support & Portal Help">Technical Support & Portal Help</option>
                        <option value="General Inquiries & Feedback">General Inquiries & Feedback</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                    {touched.subject && errors.subject && (
                      <p className="mt-0.5 text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <textarea
                        name="message"
                        id="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Tell us how we can help you..."
                        className={`w-full pl-9 pr-3 py-1.5 sm:py-2 bg-white border rounded-lg text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none resize-none transition-all ${
                          touched.message && errors.message
                            ? 'border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-400/20'
                            : 'border-slate-200 focus:border-[#1D75F5] focus:ring-2 focus:ring-[#1D75F5]/15'
                        }`}
                        aria-invalid={!!(touched.message && errors.message)}
                      />
                    </div>
                    {touched.message && errors.message && (
                      <p className="mt-0.5 text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={formStatus === 'sending'}
                      className="w-full py-2.5 sm:py-3 px-5 rounded-lg font-semibold text-white bg-[#1D75F5] hover:bg-[#155fc7] active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {formStatus === 'sending' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Success Alert Banner */}
                  {formStatus === 'success' && (
                    <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-800 font-medium">
                        {serverMsg || 'Your message has been sent successfully! Our team will contact you shortly.'}
                      </p>
                    </div>
                  )}

                  {/* Error Alert Banner */}
                  {formStatus === 'error' && (
                    <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-800 font-medium">
                        {serverMsg || 'An error occurred while submitting your message. Please try again.'}
                      </p>
                    </div>
                  )}
                </form>
              </div>

            </div>

          </div>
        </div>

        {/* ── BOTTOM RIGHT CORNER WAVE ACCENT WITH INTERNKATTA LOGO ────────── */}
        <div className="absolute -bottom-1 right-0 w-36 sm:w-44 md:w-52 h-14 sm:h-16 pointer-events-none overflow-hidden z-10">
          <svg viewBox="0 0 320 120" className="w-full h-full" preserveAspectRatio="none" fill="none">
            <path
              d="M0 120 C 120 105, 180 35, 320 0 L 320 120 Z"
              fill="url(#bottomWaveGradient)"
            />
            <defs>
              <linearGradient id="bottomWaveGradient" x1="0" y1="120" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0B3875" />
                <stop offset="1" stopColor="#1D75F5" />
              </linearGradient>
            </defs>
          </svg>

          {/* InternKatta Logo on the Bottom Right Wave */}
          <div className="absolute bottom-2 sm:bottom-2.5 right-2 sm:right-4 flex items-center gap-1.5 z-20">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white p-0.5 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/logo2-transparent.png"
                alt="InternKatta Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-[11px] sm:text-xs tracking-tight leading-tight">
                InternKatta
              </span>
              <span className="text-blue-100 text-[8px] sm:text-[9px] font-medium tracking-wide">
                Learn • Build • Grow
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;