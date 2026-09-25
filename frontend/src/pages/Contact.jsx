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
import { useUserAuth } from '../context/UserAuthContext';

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
  const { auth } = useUserAuth() || {};

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
    const inviterName = auth?.user?.fullName;
    const refCode = auth?.user?._id || 'contact';
    const referralUrl = `${window.location.origin}?ref=${encodeURIComponent(refCode)}`;

    const shareText = `🎓 *Join InternKatta — Practical Industrial Training & Internships!* 🚀

Hey! 👋 ${inviterName ? `${inviterName} has invited you` : "I'm inviting you"} to explore *InternKatta* — India's trusted platform for students to get industry-ready.

🌟 *What you'll get:*
✅ *Verified Internships* in Web Dev, AI/ML, Cloud & more
✅ *MSBTE-Aligned* practical training programs
✅ *Govt. & ISO Certified* credentials for college & resume
✅ *Live Projects* with real-world industry mentors
🪙 *Earn Reward Points* on your learning journey!

🚀 _Start building your professional career today!_

👉 *Check it out & register here:*`;

    const fullMessage = `${shareText}\n${referralUrl}`;

    const shareData = {
      title: 'InternKatta - Industrial Training & Internships',
      text: shareText,
      url: referralUrl,
    };

    const copyAndOpenWhatsApp = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fullMessage);
      }
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
      window.open(whatsappUrl, '_blank');
      toast.success('🎁 Referral message copied! Opening WhatsApp...');
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        if (err.name !== 'AbortError') {
          copyAndOpenWhatsApp();
        }
      });
    } else {
      copyAndOpenWhatsApp();
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
    <div className="relative w-full min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#dff0fd] via-[#ecf5fe] to-[#d8ebfd] font-sans text-slate-800 overflow-hidden flex flex-col justify-center">
      <SEO
        title="Contact Us - InternKatta | Get in Touch"
        description="Contact InternKatta for inquiries about internships, courses, and training programs. Our admissions team is ready to help you."
        keywords="contact internkatta, get in touch, admissions, inquiry, support, help, internships, courses"
        url="https://internkatta.com/contact"
        structuredData={contactStructuredData}
      />

      {/* ── AMBIENT CRYSTAL / FACETED BACKGROUND ACCENTS ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft radial glow orbs */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-white/70 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -left-28 w-[500px] h-[500px] bg-[#bae6fd]/45 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 right-8 w-[650px] h-[650px] bg-[#93c5fd]/30 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle geometric crystal facets overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
          fill="none"
        >
          <polygon points="0,0 380,0 220,290 0,220" fill="url(#facet-grad-1)" />
          <polygon points="380,0 760,0 560,250 220,290" fill="url(#facet-grad-2)" />
          <polygon points="760,0 1140,0 980,270 560,250" fill="url(#facet-grad-1)" />
          <polygon points="1140,0 1440,0 1440,340 980,270" fill="url(#facet-grad-2)" />
          <polygon points="0,220 220,290 140,640 0,570" fill="url(#facet-grad-2)" />
          <polygon points="220,290 560,250 480,610 140,640" fill="url(#facet-grad-1)" />
          <polygon points="1440,340 1440,720 1200,640 980,270" fill="url(#facet-grad-1)" />
          <polygon points="0,570 140,640 0,900" fill="url(#facet-grad-1)" />
          <polygon points="140,640 480,610 340,900 0,900" fill="url(#facet-grad-2)" />
          <polygon points="480,610 880,700 750,900 340,900" fill="url(#facet-grad-1)" />
          <polygon points="880,700 1200,640 1240,900 750,900" fill="url(#facet-grad-2)" />
          <polygon points="1200,640 1440,720 1440,900 1240,900" fill="url(#facet-grad-1)" />

          {/* Delicate crystal facet edge lines */}
          <polyline points="0,0 220,290 560,250 980,270 1440,0" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          <polyline points="0,220 220,290 140,640 480,610 880,700 1200,640 1440,720" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
          <polyline points="220,290 480,610 340,900" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <polyline points="560,250 880,700 750,900" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <polyline points="980,270 1200,640 1240,900" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />

          <defs>
            <linearGradient id="facet-grad-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="facet-grad-2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── MAIN CONTENT CONTAINER ───────────────────────────────────────── */}
      <div className="max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 items-center">

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 1: Contact Information & Graduation Graphic (Left)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-3 flex flex-col justify-between self-stretch">
            <div>
              {/* 3D Graduation Cap on Stacked Books */}
              <div className="w-40 sm:w-44 md:w-48 mx-auto lg:mx-0 mb-2">
                <img
                  src="/contact-grad-books.jpg"
                  alt="Graduation Cap and Books"
                  className="w-full h-auto object-contain filter drop-shadow-md mix-blend-multiply"
                />
              </div>

              {/* Title */}
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Contact Information
              </h2>

              {/* Subtitle / Description */}
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-4 max-w-sm">
                Fill up the form and our team will get back to you within 24 hours. Alternatively, you can reach us through the channels below.
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/internkatta/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="InternKatta LinkedIn"
                  className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
                >
                  <FaLinkedinIn className="w-3.5 h-3.5" />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/internkatta/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="InternKatta Instagram"
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
                >
                  <FaInstagram className="w-3.5 h-3.5" />
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@internkatta"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="InternKatta YouTube"
                  className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
                >
                  <FaYoutube className="w-3.5 h-3.5" />
                </a>

                {/* X / Twitter */}
                <a
                  href="https://twitter.com/internkatta"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="InternKatta X"
                  className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 shadow-xs transition-transform"
                >
                  <FaXTwitter className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Bottom Referral Card with Books & "Dream Learn Achieve" */}
            <div className="mt-4 pt-1">
              <div className="flex items-center gap-2.5 mb-2">
                {/* Small white square with books */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white p-1 border border-white/80 shadow-xs shrink-0 flex items-center justify-center">
                  <img
                    src="/contact-grad-books.jpg"
                    alt="Books"
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Script text: Dream Learn Achieve */}
                <div className="font-handwritten text-slate-800 font-bold text-sm sm:text-base leading-tight -rotate-3 select-none shrink-0">
                  Dream<br />Learn<br />Achieve
                </div>
              </div>

              {/* Referral Ad Pill Card */}
              <div className="bg-gradient-to-br from-[#D9EFFD]/95 via-[#E7F3FE]/95 to-[#CEE8FC]/95 border border-blue-100/90 rounded-2xl p-2.5 sm:p-3 shadow-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[8px] sm:text-[9px] font-extrabold text-[#0066FF] uppercase tracking-wider">
                    REFER & EARN
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-amber-900 bg-amber-100/90 border border-amber-200/80 px-1.5 py-0.5 rounded-full">
                    🪙 +500 Pts
                  </span>
                </div>
                <h4 className="text-[11px] sm:text-xs font-black text-slate-900 leading-snug mb-0.5">
                  Spread the Word About <span className="text-[#0066FF]">Intern</span><span className="text-[#F05A22]">Katta</span>
                </h4>
                <p className="text-[9px] sm:text-[10px] text-slate-500 mb-1.5 leading-tight">
                  Invite friends & earn bonus reward points!
                </p>
                <div>
                  <button
                    type="button"
                    onClick={handleReferNow}
                    className="inline-flex items-center gap-1 bg-[#0066FF] hover:bg-[#0052cc] active:scale-95 text-white font-bold text-[10px] sm:text-[11px] px-3 py-1 rounded-full shadow-xs transition-all cursor-pointer group"
                  >
                    <span>Refer Now</span>
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 2: Let's Connect & 3 Contact Channels (Center)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-4 sm:mb-5">
              <div className="text-[11px] font-extrabold tracking-widest text-[#0066FF] uppercase">
                INTERNKATTA
              </div>
              <div className="text-[10px] font-bold tracking-widest text-[#0066FF]/80 uppercase mt-0.5">
                LET'S CONNECT
              </div>
              <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-900 tracking-tight mt-1">
                Let's Connect
              </h1>
            </div>

            {/* 3 Rounded Channels Cards */}
            <div className="space-y-3 sm:space-y-3.5">
              {/* 1. Call Us */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md border border-white/80 transition-all flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#EBF3FE] text-[#0066FF] flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="w-5 h-5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">Call Us</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                      For admissions and support, please call.
                    </p>
                    <a
                      href="tel:+919527605805"
                      className="text-xs sm:text-sm font-bold text-[#0066FF] hover:underline inline-block mt-0.5"
                    >
                      +91 95276 05805
                    </a>
                  </div>
                </div>
                <a
                  href="tel:+919527605805"
                  aria-label="Call Us"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EBF3FE] group-hover:bg-[#0066FF] text-[#0066FF] group-hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* 2. Email Us */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md border border-white/80 transition-all flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF0E6] text-[#FF7A1A] flex items-center justify-center shrink-0 shadow-xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">Email Us</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                      For general inquiries, drop us an email.
                    </p>
                    <a
                      href="mailto:internkatta@gmail.com"
                      className="text-xs sm:text-sm font-bold text-[#0066FF] hover:underline inline-block break-all mt-0.5"
                    >
                      internkatta@gmail.com
                    </a>
                  </div>
                </div>
                <a
                  href="mailto:internkatta@gmail.com"
                  aria-label="Email Us"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EBF3FE] group-hover:bg-[#0066FF] text-[#0066FF] group-hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* 3. Our Office */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md border border-white/80 transition-all flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E8F8F0] text-[#10B981] flex items-center justify-center shrink-0 shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">Our Office</h3>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                      City Vista Kharadi, Pune
                    </p>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=City+Vista+Kharadi+Pune"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Find our office on Google Maps"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EBF3FE] group-hover:bg-[#0066FF] text-[#0066FF] group-hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              COLUMN 3: Send a Message Floating Card (Right)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 lg:p-9 shadow-2xl shadow-blue-500/10 border border-white/90 relative">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0066FF] text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                    <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Send a Message
                  </h2>
                </div>

                {/* Handwritten Tagline */}
                <div className="font-handwritten text-xl sm:text-2xl font-bold text-slate-800 tracking-wide select-none leading-none text-right shrink-0">
                  Together Towards<br />Your Goals
                </div>
              </div>

              {/* Status Alert */}
              {formStatus === 'success' && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{serverMsg}</span>
                </div>
              )}
              {formStatus === 'error' && (
                <div className="mb-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{serverMsg}</span>
                </div>
              )}

              {/* Contact Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`relative flex items-center rounded-xl border bg-white transition-all ${
                      touched.name && errors.name
                        ? 'border-red-400 ring-2 ring-red-100'
                        : 'border-slate-200 hover:border-slate-300 focus-within:border-[#0066FF] focus-within:ring-3 focus-within:ring-blue-100'
                    }`}
                  >
                    <User className="w-4 h-4 text-slate-400 ml-3.5 mr-2 shrink-0 pointer-events-none" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Your full name"
                      className="w-full py-2.5 sm:py-3 pr-3.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>
                  {touched.name && errors.name && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`relative flex items-center rounded-xl border bg-white transition-all ${
                      touched.email && errors.email
                        ? 'border-red-400 ring-2 ring-red-100'
                        : 'border-slate-200 hover:border-slate-300 focus-within:border-[#0066FF] focus-within:ring-3 focus-within:ring-blue-100'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-slate-400 ml-3.5 mr-2 shrink-0 pointer-events-none" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="internkatta@gmail.com"
                      className="w-full py-2.5 sm:py-3 pr-3.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`relative flex items-center rounded-xl border bg-white transition-all ${
                      touched.subject && errors.subject
                        ? 'border-red-400 ring-2 ring-red-100'
                        : 'border-slate-200 hover:border-slate-300 focus-within:border-[#0066FF] focus-within:ring-3 focus-within:ring-blue-100'
                    }`}
                  >
                    <Tag className="w-4 h-4 text-slate-400 ml-3.5 mr-2 shrink-0 pointer-events-none" />
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full py-2.5 sm:py-3 pr-9 text-sm bg-transparent focus:outline-none appearance-none cursor-pointer ${
                        !formData.subject ? 'text-slate-400' : 'text-slate-800 font-medium'
                      }`}
                    >
                      <option value="" disabled>What is this regarding?</option>
                      <option value="Admissions & Enrollment">Admissions & Enrollment</option>
                      <option value="Internship Programs">Internship Programs</option>
                      <option value="Industrial Training (MSBTE)">Industrial Training (MSBTE)</option>
                      <option value="College Partnerships & MoUs">College Partnerships & MoUs</option>
                      <option value="Certificate Verification">Certificate Verification</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                  {touched.subject && errors.subject && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs sm:text-[13px] font-semibold text-slate-700 mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`relative rounded-xl border bg-white transition-all p-3 ${
                      touched.message && errors.message
                        ? 'border-red-400 ring-2 ring-red-100'
                        : 'border-slate-200 hover:border-slate-300 focus-within:border-[#0066FF] focus-within:ring-3 focus-within:ring-blue-100'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-slate-400 absolute top-3.5 left-3.5 pointer-events-none" />
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Tell us how we can help you..."
                      className="w-full pl-7 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                  {touched.message && errors.message && (
                    <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  className="w-full bg-[#0066FF] hover:bg-[#0052cc] active:scale-[0.99] text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {formStatus === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 -rotate-12" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;