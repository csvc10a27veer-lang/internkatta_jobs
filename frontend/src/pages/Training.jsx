import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOffice2Icon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { motion, useInView, animate } from 'framer-motion';
import { useNavigationWithLoading } from '../hooks/useNavigationWithLoading';
import api from '../utils/api';

// --- DATA ---
const trainingPrograms = [
  {
    id: 'industrial',
    icon: <BuildingOffice2Icon className="h-7 w-7 text-white" />,
    badge: 'Engineering Track',
    title: 'Industrial Training',
    shortDescription:
      'A comprehensive program designed for engineering students to gain hands-on industrial experience with real-world projects and mentorship.',
    stats: [
      { value: '95%', label: 'Completion' },
      { value: '80%', label: 'Placement' },
      { value: '5+',  label: 'Projects'  },
    ],
  },
  {
    id: 'msbte',
    icon: <AcademicCapIcon className="h-7 w-7 text-white" />,
    // L10 fix: replaced 'Government Certified' badge — claim requires verifiable approval number
    badge: 'MSBTE Curriculum Aligned',
    title: 'MSBTE Sponsored Training',
    shortDescription:
      'Programs structured around the MSBTE curriculum to help diploma students fulfill academic requirements with practical skills and industry exposure.',
    stats: [
      { value: 'Cert.',    label: 'On Completion'   },
      { value: 'Aligned',  label: 'MSBTE Syllabus'  },
      { value: '4.8/5',   label: 'Student Rated'   },
    ],
  },
  {
    id: 'workshops',
    icon: <WrenchScrewdriverIcon className="h-7 w-7 text-white" />,
    badge: '1–3 Day Intensive',
    title: 'Specialized Workshops',
    shortDescription:
      'Intensive 1–3 day workshops focused on a single, cutting-edge technology or tool. Fast-track your skills with expert-led sessions.',
    stats: [
      { value: '10+',  label: 'Workshops'    },
      { value: '98%',  label: 'Satisfaction' },
      { value: '500+', label: 'Participants' },
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

      {/* ── Training Cards ── */}
      <section id="programs" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Explore Our Training Verticals</h2>
            <p className="mt-3 text-base text-gray-500 max-w-xl mx-auto">
              Each program is a structured path to mastering new skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainingPrograms.map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.45, ease: 'easeOut' }}
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 hover:border-blue-100 flex flex-col transition-shadow duration-300"
              >

                {/* ── HEADER — Dark Navy Blue, same for all 3 ── */}
                <div
                  className="px-6 pt-6 pb-6 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,rgb(0, 83, 163) 0%,rgb(0, 83, 163) 100%)' }}
                >
                  {/* Decorative circles */}
                  <div className="absolute -right-5 -top-5 w-28 h-28 rounded-full bg-white/5" />
                  <div className="absolute right-6 bottom-0 w-12 h-12 rounded-full bg-white/5" />

                  {/* Icon + Title */}
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
                      {t.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white leading-snug">{t.title}</h3>
                  </div>
                </div>

                {/* ── STATS STRIP — directly below header, inside card ── */}
                <div className="grid grid-cols-3 border-b border-gray-100">
                  {t.stats.map((s, i) => (
                    <div
                      key={i}
                      className={`py-5 h-15 text-center bg-white/5 ${
                        i < t.stats.length - 1 ? 'border-r border-gray-100' : ''
                      }`}
                    >
                      {/* Number on top */}
                      <div className="text-lg font-extrabold text-[#0d1b4b] leading-none">{s.value}</div>
                      {/* Label below */}
                      <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* ── CARD BODY ── */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Badge */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit bg-blue-50 text-[#0052A3] border border-blue-100">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t.badge}
                  </span>

                  <p className="text-sm text-gray-500 leading-relaxed flex-grow">{t.shortDescription}</p>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleViewDetails(t.id)}
                    style={{ background: 'linear-gradient(135deg,rgb(0, 83, 163) 0%,rgb(0, 83, 163) 100%)' }}
                    className="mt-6 w-full py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-blue-900/20 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    View Details →
                  </button>
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
            <h2 className="text-3xl lg:text-4xl font-bold">
              <span className="text-gray-900">Why Train With </span>
              <span className="text-[#0052A3]">Intern</span>
              <span className="text-[#FF7A1A]">Katta</span>
              <span className="text-gray-900">?</span>
            </h2>
            <p className="mt-3 text-base text-gray-500 max-w-xl mx-auto">
              We combine the best of education and industry experience
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

      {/* ── CTA ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ready to Transform Your Career?</h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto mb-10">
            Our admissions team is ready to help you choose the perfect program for your goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-[#0052A3] text-white font-bold text-base rounded-xl shadow-lg shadow-blue-200 hover:bg-[#004085] hover:-translate-y-0.5 transition-all duration-200 text-center"
            >
              Contact Admissions
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Training;