import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { motion, useInView, animate } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigationWithLoading } from '../hooks/useNavigationWithLoading';
import { useUserAuth } from '../context/UserAuthContext';
import api from '../utils/api';

// --- DATA ---
const trainingPrograms = [
  {
    id: 'industrial',
    icon: <BuildingOffice2Icon className="h-6 w-6 text-[#F05A22]" strokeWidth={2.2} />,
    badge: 'Engineering Track',
    badgeStyle: 'orange',
    buttonColor: 'blue',
    bgImage: '/training-1.jpg',
    title: 'Industrial Training',
    shortDescription:
      'A comprehensive program designed for engineering students to gain hands-on industrial experience with real-world projects and mentorship.',
    stats: [
      { value: '95%', label: 'COMPLETION' },
      { value: '80%', label: 'PLACEMENT', highlight: true },
      { value: '5+',  label: 'PROJECTS'  },
    ],
  },
  {
    id: 'msbte',
    icon: <AcademicCapIcon className="h-6 w-6 text-[#F05A22]" strokeWidth={2.2} />,
    badge: 'MSBTE Curriculum Aligned',
    badgeStyle: 'dark',
    buttonColor: 'orange',
    bgImage: '/training-2.jpg',
    title: 'MSBTE Sponsored\nTraining',
    shortDescription:
      'Programs structured around the MSBTE curriculum to help diploma students fulfill academic requirements with practical skills and industry exposure.',
    stats: [
      { value: 'Cert.',   label: 'ON COMPLETION' },
      { value: 'Aligned', label: 'MSBTE SYLLABUS', highlight: true },
      { value: '4.8/5',  label: 'STUDENT RATED' },
    ],
  },
  {
    id: 'workshops',
    icon: <Cog6ToothIcon className="h-6 w-6 text-[#F05A22]" strokeWidth={2.2} />,
    badge: '1–3 Day Intensive',
    badgeStyle: 'orange',
    buttonColor: 'blue',
    bgImage: '/training-3.jpg',
    title: 'Specialized\nWorkshops',
    shortDescription:
      'Intensive 1–3 day workshops focused on a single, cutting-edge technology or tool. Fast-track your skills with expert-led sessions.',
    stats: [
      { value: '10+',   label: 'WORKSHOPS' },
      { value: '98%',   label: 'SATISFACTION', highlight: true },
      { value: '500+',  label: 'PARTICIPANTS' },
    ],
  },
];

const benefits = [
  {
    icon: <BriefcaseIcon className="h-7 w-7 text-[#0052A3]" />,
    iconBg: 'bg-blue-50',
    title: 'Industry-Ready Skills',
    description: "Learn exactly what companies are looking for with our employer-aligned curriculum.",
  },
  {
    icon: <BookOpenIcon className="h-7 w-7 text-[#0052A3]" />,
    iconBg: 'bg-blue-50',
    title: 'Project-Based Learning',
    description: 'Build real applications, not just follow tutorials. Graduate with a portfolio.',
  },
  {
    icon: <UserGroupIcon className="h-7 w-7 text-[#0052A3]" />,
    iconBg: 'bg-blue-50',
    title: 'Mentor Support',
    description: 'Get guidance from professionals who work at top tech companies.',
  },
  {
    icon: <ShieldCheckIcon className="h-7 w-7 text-[#0052A3]" />,
    iconBg: 'bg-blue-50',
    title: 'Certification',
    description: 'Earn verifiable credentials that employers recognize and respect.',
  },
];

// --- Reusable Animated Counter Component ---
const AnimatedCounter = ({ to, suffix = '', decimals = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, to, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(value) {
          setDisplayValue(value);
        }
      });
      return () => controls.stop();
    }
  }, [isInView, to]);

  const formattedValue = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return <span ref={ref}>{formattedValue}{suffix}</span>;
};

// --- COMPONENT ---
const Training = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const { auth } = useUserAuth() || {};

  const copyAndOpenWhatsApp = (message) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('🎁 Referral message copied! Opening WhatsApp...');
  };

  const handleReferNow = () => {
    const inviterName = auth?.user?.fullName;
    const refCode = auth?.user?._id || 'referral';
    const referralUrl = `${window.location.origin}?ref=${encodeURIComponent(refCode)}`;

    const shareText = `🎓 *Join InternKatta — Practical Industrial Training & Internships!* 🚀

Hey! 👋 ${inviterName ? `${inviterName} has invited you` : "I'm inviting you"} to explore *InternKatta* — India's trusted platform for students & graduates to gain real-world industrial skills.

🌟 *Why you should join:*
✅ *Verified Internships* across Web Dev, AI/ML, Cloud & Core Tech
✅ *MSBTE Aligned* Industrial Training & Hands-on Workshops
✅ *Real-world Live Projects* with 1-on-1 industry mentorship
📜 *Govt. & ISO Certified* credentials for your resume
🎯 *Direct Placement Assistance* & career guidance

🚀 _Build in-demand skills and accelerate your career!_

👉 *Explore opportunities & get started here:*`;

    const fullMessage = `${shareText}\n${referralUrl}`;

    const shareData = {
      title: 'InternKatta - Industrial Training & Internships',
      text: shareText,
      url: referralUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        if (err.name !== 'AbortError') {
          copyAndOpenWhatsApp(fullMessage);
        }
      });
    } else {
      copyAndOpenWhatsApp(fullMessage);
    }
  };

  const handleReferAndEarnPoints = () => {
    const inviterName = auth?.user?.fullName;
    const refCode = auth?.user?._id || 'points';
    const referralUrl = `${window.location.origin}?ref=${encodeURIComponent(refCode)}`;

    const shareText = `🎓 *Boost Your Career with InternKatta!* 🚀

Hey! 👋 ${inviterName ? `${inviterName} has invited you` : "I'm inviting you"} to join *InternKatta* — India's premier platform for students, diploma holders & fresh graduates.

🌟 *What you'll unlock:*
✅ *Verified Internships* (Web Dev, AI/ML, Full Stack, Cyber Security & more)
✅ *MSBTE & Industry-Recognized* Training Programs
✅ *Hands-on Live Projects* with expert mentorship
✅ *Govt. & ISO Certified* Completion Certificates
🪙 *Exclusive 500 Bonus Reward Points* instantly on signup!

🚀 _Build practical skills & get industry-ready today!_

👉 *Claim your spot & bonus points here:*`;

    const fullMessage = `${shareText}\n${referralUrl}`;

    const shareData = {
      title: 'InternKatta - Refer & Earn Points',
      text: shareText,
      url: referralUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        if (err.name !== 'AbortError') {
          copyAndOpenWhatsApp(fullMessage);
        }
      });
    } else {
      copyAndOpenWhatsApp(fullMessage);
    }
  };
  
  const [statsData, setStatsData] = useState([
    { value: 10000, suffix: '+',  label: 'Students Trained', decimals: 0 },
    { value: 95,    suffix: '%',  label: 'Completion Rate',  decimals: 0 },
    { value: 500,   suffix: '+',  label: 'Industry Partners', decimals: 0 },
    { value: 4.9,   suffix: '/5', label: 'Student Rated',    decimals: 1 },
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const fetchStats = async () => {
      try {
        const res = await api.get('/api/analytics/public-stats');
        if (res.data.success) {
          const { internsTrained, hiringPartners } = res.data.data;
          setStatsData([
            { value: internsTrained || 10000, suffix: '+',  label: 'Students Trained', decimals: 0 },
            { value: 95,                      suffix: '%',  label: 'Completion Rate',  decimals: 0 },
            { value: hiringPartners || 500,   suffix: '+',  label: 'Industry Partners', decimals: 0 },
            { value: 4.9,                     suffix: '/5', label: 'Student Rated',    decimals: 1 },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch public stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleViewDetails = (trainingId) => {
    navigateWithLoading(`/training/${trainingId}`);
  };

  return (
    <div className="bg-white text-gray-800 overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#0658A8] via-[#0658A8] to-[#0658A8] text-white shadow-xl">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full" />
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-2">
              <AcademicCapIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-200 mr-2" />
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                Training Programs
              </h1>
            </div>
            <p className="text-sm md:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Move beyond self-paced courses. Our live, expert-led training programs are designed to make you a job-ready professional.
            </p>
          </div>
        </div>
      </section>

      {/* ── Training Verticals Section ── */}
      <section id="programs" className="py-20 bg-[#f8fafc]">
        <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          {/* Section Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black text-[#0A1629] tracking-tight">
              <span>Explore Our </span>
              <span className="relative inline-block text-[#0A3E87] pb-1.5">
                Training Verticals
                <span className="absolute bottom-0 left-0 right-0 h-[4px] rounded-full flex overflow-hidden shadow-sm">
                  <span className="w-[45%] h-full bg-[#F05A22]" />
                  <span className="w-[55%] h-full bg-[#0A3E87]" />
                </span>
              </span>
            </h2>
            <p className="mt-3.5 text-base sm:text-lg text-slate-500 font-medium max-w-xl mx-auto">
              Each program is a structured path to mastering new skills.
            </p>
          </div>

          {/* Cards Grid - Broadened to fill horizontal space */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
            {trainingPrograms.map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.45, ease: 'easeOut' }}
                whileHover={{ y: -6, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
                className="relative rounded-[26px] overflow-hidden border border-slate-700/30 shadow-xl hover:shadow-2xl flex flex-col justify-between min-h-[580px] bg-[#071124] transition-all duration-300 group"
              >
                {/* Background Image - Crisp and Clear */}
                <img
                  src={t.bgImage}
                  alt={t.title.replace('\n', ' ')}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Clear gradient: top is translucent and bright, bottom fades to dark navy for readable text & buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060d1b] from-35% via-[#060d1b]/65 via-55% to-[#060d1b]/15 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent pointer-events-none" />

                {/* Card Content */}
                <div className="relative z-10 p-6 sm:p-7 lg:p-8 xl:p-9 flex flex-col h-full justify-between">
                  {/* Top Part: Header + Frosted Stats */}
                  <div>
                    {/* Header: Icon + Title */}
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#0b63e5] flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/25 border border-white/10">
                        {t.icon}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight whitespace-pre-line tracking-tight">
                        {t.title}
                      </h3>
                    </div>

                    {/* Floating Glassmorphic Stats Strip */}
                    <div className="w-full bg-[#0a1e3f]/40 backdrop-blur-md rounded-2xl border border-white/15 py-3.5 px-2.5 shadow-inner">
                      <div className="grid grid-cols-3 divide-x divide-white/15 text-center">
                        {t.stats.map((s, idx) => (
                          <div key={idx} className="px-1">
                            <div
                              className={`text-base sm:text-lg font-black tracking-tight leading-none ${
                                s.highlight ? 'text-[#F05A22]' : 'text-white'
                              }`}
                            >
                              {s.value}
                            </div>
                            <div className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1.5 leading-tight">
                              {s.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Part: Badge + Description + CTA Button */}
                  <div className="mt-8 flex flex-col">
                    {/* Pill Badge */}
                    <div className="mb-4">
                      {t.badgeStyle === 'orange' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#2a1b12]/85 text-[#f59e0b] border border-[#b45309]/50 backdrop-blur-sm shadow-sm">
                          <svg className="w-3.5 h-3.5 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {t.badge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#1e293b]/85 text-slate-200 border border-slate-600/60 backdrop-blur-sm shadow-sm">
                          <svg className="w-3.5 h-3.5 text-[#f97316]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {t.badge}
                        </span>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-sm text-slate-300 font-normal leading-relaxed min-h-[4.25rem] mb-6">
                      {t.shortDescription}
                    </p>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleViewDetails(t.id)}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-lg ${
                        t.buttonColor === 'orange'
                          ? 'bg-[#F05A22] hover:bg-[#d94a15] shadow-orange-500/25'
                          : 'bg-[#0b63e5] hover:bg-blue-600 shadow-blue-500/25'
                      }`}
                    >
                      <span>View Details</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why InternKatta ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-[42px] lg:text-5xl font-black tracking-tight text-[#0F172A] leading-tight">
              <span>Why Train With </span>
              <span className="text-[#1877F2]">Intern</span>
              <span className="text-[#F05A22]">Katta</span>
              <span>?</span>
            </h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-slate-600 font-normal max-w-xl mx-auto">
              We combine the best of education and industry experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.45 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 text-center"
              >
                <div className={`w-14 h-14 ${b.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  {b.icon}
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-2">{b.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section
      className="relative py-16 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #03316B 0%, #0658A8 50%, #0A74D4 100%)",
      }}
    >
      {/* Soft radial light glow — center top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,255,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Secondary subtle glow — bottom left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 50% at 10% 100%, rgba(10,116,212,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Decorative outline circle — top left */}
      <div
        className="absolute -left-16 -top-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ border: "40px solid rgba(255,255,255,0.05)" }}
      />

      {/* Decorative filled circle — bottom right */}
      <div
        className="absolute right-0 bottom-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "rgba(10,116,212,0.55)",
          transform: "translate(33%, 33%)",
          boxShadow: "0 0 80px 20px rgba(6,88,168,0.4)",
        }}
      />

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {statsData.map((s, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.45 }}
              className="relative text-center px-6 py-8"
            >
              {/* Vertical divider */}
              {index < statsData.length - 1 && (
                <span
                  className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px"
                  style={{
                    height: "60%",
                    background: "rgba(255,255,255,0.15)",
                  }}
                />
              )}

              {/* Stat value */}
              <div
                className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #a8cfff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <AnimatedCounter to={s.value} suffix={s.suffix} decimals={s.decimals} />
              </div>

              {/* Label */}
              <div
                className="text-xs md:text-sm uppercase font-semibold"
                style={{
                  color: "rgba(168, 207, 255, 0.85)",
                  letterSpacing: "0.15em",
                }}
              >
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>   

      {/* ── Referral / Spread the Word Banner ── */}
      <section className="py-8 sm:py-12 md:py-14 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1140px] mx-auto">
            {/* Main Gradient Card */}
            <div className="relative rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-[#d9effd] via-[#e5f3fe] to-[#cee8fc] border border-blue-100/90 shadow-xl overflow-hidden">
              
              {/* Decorative background ambient glows */}
              <div 
                className="absolute -top-16 -left-16 w-72 h-72 rounded-full pointer-events-none opacity-60"
                style={{ background: 'radial-gradient(circle, rgba(186, 224, 255, 0.8) 0%, transparent 70%)' }}
              />
              <div 
                className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none opacity-45"
                style={{ background: 'radial-gradient(circle, rgba(147, 197, 253, 0.6) 0%, transparent 70%)' }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[380px] lg:min-h-[415px]">
                
                {/* ── Left Column: Headline, Subtitle & Refer Now Button ── */}
                <div className="lg:col-span-5 p-5 sm:p-8 lg:p-10 z-10">
                  <h2 className="text-2xl sm:text-3xl md:text-[36px] font-black text-[#1E293B] leading-[1.15] tracking-tight">
                    Spread the Word <br />
                    About <span className="text-[#0066FF]">Intern</span><span className="text-[#F05A22]">Katta</span>
                  </h2>

                  <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-600 font-medium max-w-md leading-relaxed">
                    Help your friends unlock exciting opportunities, competitions, jobs, internships, and more on InternKatta.
                  </p>

                  <div className="mt-5 sm:mt-6 flex flex-col items-start gap-2.5">
                    {/* Primary Blue Button */}
                    <button
                      onClick={handleReferNow}
                      className="inline-flex items-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] active:scale-95 text-white font-bold text-sm sm:text-base px-6 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/45 transition-all duration-200 group cursor-pointer"
                    >
                      <span>Refer Now</span>
                      <span className="group-hover:translate-x-1.5 transition-transform duration-200 text-lg font-bold">→</span>
                    </button>

                    {/* Golden Button: Refer Now and Earn Points */}
                    <button
                      onClick={handleReferAndEarnPoints}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] hover:from-[#D97706] hover:via-[#F59E0B] hover:to-[#D97706] active:scale-95 text-amber-950 font-black text-xs sm:text-sm px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/45 border border-yellow-200/90 transition-all duration-200 group cursor-pointer"
                    >
                      <span className="text-base select-none">🪙</span>
                      <span>Refer Now and Earn Points</span>
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 bg-white/70 rounded-full text-amber-900 border border-amber-300/70 shadow-xs">
                        🎁 +500 Pts
                      </span>
                    </button>
                  </div>
                </div>

                {/* ── Right Column: Interactive Graphic with Compact Opportunities Stack & Cutout ── */}
                <div className="lg:col-span-7 relative min-h-[370px] sm:min-h-[390px] lg:min-h-[415px] flex items-center overflow-hidden lg:overflow-visible py-4 sm:py-5">
                  
                  {/* Notification & Opportunity Cards Container */}
                  <div className="relative z-10 w-full max-w-[310px] sm:max-w-[340px] lg:max-w-[355px] ml-2 sm:ml-4 lg:ml-2 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-900/10 border border-slate-100/90 p-3 sm:p-3.5 mb-6 sm:mb-4">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          Hi Rahul, <span className="text-sm select-none">👋</span>
                        </div>
                        <div className="font-bold text-slate-700 text-[10px] sm:text-[11px]">
                          Let&apos;s apply these opportunities together...
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wide flex-shrink-0">
                        4 Open
                      </span>
                    </div>

                    {/* Chat preview skeleton line */}
                    <div className="h-1 bg-slate-100 rounded-full w-4/5 mb-2" />

                    {/* Stack of 4 Opportunity Cards: Frontend, Fullstack, AI/ML, Cyber Security */}
                    <div className="space-y-1.5 sm:space-y-2">
                      {[
                        { id: 'frontend', title: 'Frontend Developer', link: '/internships?domain=frontend' },
                        { id: 'fullstack', title: 'Full Stack Developer', link: '/internships?domain=fullstack' },
                        { id: 'aiml', title: 'AI & ML Internship', link: '/internships?domain=aiml' },
                        { id: 'cyber', title: 'Cyber Security', link: '/internships?domain=cyber' },
                      ].map((opp) => (
                        <div
                          key={opp.id}
                          className="bg-white hover:bg-blue-50/40 rounded-xl p-1.5 sm:p-2 shadow-sm hover:shadow-md border border-slate-100 hover:border-blue-200 flex items-center justify-between gap-2 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* InternKatta Logo Badge */}
                            <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center p-0.5 bg-slate-50/90 rounded-lg border border-slate-100 shadow-inner">
                              <img
                                src="/internkatta-stacked-logo.png"
                                alt="InternKatta"
                                className="w-full h-auto max-h-6 sm:max-h-7 object-contain"
                              />
                            </div>

                            {/* Job Title & Indicator Bar */}
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 text-[11px] sm:text-xs truncate">
                                {opp.title}
                              </div>
                              <div className="h-1 bg-slate-200/90 rounded-full w-12 sm:w-14 mt-0.5 group-hover:w-16 group-hover:bg-blue-400 transition-all duration-300" />
                            </div>
                          </div>

                          {/* Apply Button */}
                          <button
                            onClick={() => navigateWithLoading(opp.link)}
                            className="bg-[#0066FF] hover:bg-blue-600 active:scale-95 text-white font-bold text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1 rounded-full shadow-sm shadow-blue-500/25 transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Social Badge: "4 Friends Invited" + 🤩 emoji */}
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: [2, -2, 2] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                    className="absolute left-2 sm:left-4 lg:left-0 bottom-2 sm:bottom-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg shadow-blue-900/15 border border-white px-2.5 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 z-30"
                  >
                    {/* Avatars */}
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <img
                        src="/avatars/avatar-1.png"
                        alt="Friend 1"
                        className="inline-block h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-white object-cover shadow-sm"
                      />
                      <img
                        src="/avatars/avatar-2.png"
                        alt="Friend 2"
                        className="inline-block h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-white object-cover shadow-sm"
                      />
                      <img
                        src="/avatars/avatar-3.png"
                        alt="Friend 3"
                        className="inline-block h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-white object-cover shadow-sm"
                      />
                    </div>

                    <span className="font-bold text-slate-800 text-[10px] sm:text-[11px] whitespace-nowrap pr-0.5">
                      4 Friends Invited
                    </span>

                    {/* 🤩 Star-struck Emoji */}
                    <div 
                      className="absolute -top-3 -right-1 text-lg sm:text-xl filter drop-shadow-md select-none animate-bounce"
                      style={{ animationDuration: '2.5s' }}
                    >
                      🤩
                    </div>
                  </motion.div>

                  {/* Foreground Student Holding Smartphone */}
                  <img
                    src="/student-referral.png"
                    alt="Student applying to opportunities on InternKatta"
                    className="absolute right-[-15px] sm:right-0 bottom-0 w-[210px] sm:w-[245px] md:w-[270px] lg:w-[290px] max-w-none object-contain object-bottom pointer-events-none z-20 select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)]"
                  />

                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Training;