import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { UsersIcon, BuildingOfficeIcon, ShieldCheckIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api'; // ✅ fixed path for src/components/ui/HeroNew.jsx

/**
 * CountUp Component - Animates number from 0 to target
 */
const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <span className="text-[#0052A3]">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

/**
 * Rotating Card Component — fetches 3 internships from API
 * Structure, animations, and styles are unchanged
 */
const RotatingCards = () => {
  const [cardData, setCardData] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch 3 internships from your existing API
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await api.get('/api/v1/internships/public/all');
        const internships = (res.data || []).slice(0, 3);

        // Map API fields → card shape (same structure as before)
        const mapped = internships.map((item, index) => ({
          id: item._id || index,
          // Icon background alternates blue/orange like original
          iconBg: index === 1 ? 'bg-orange-100' : 'bg-blue-100',
          // Icon color alternates like original
          iconColor: index === 1 ? '#FF7A1A' : '#0052A3',
          title: (item.title || 'Internship Program').trim(),
          // description: take only first non-empty line to keep it short
          description: (item.description || '').split(/\r?\n/).find(l => l.trim().length > 10)?.trim() || 'Gain real-world experience with expert mentorship.',
          features: [
            item.duration      ? `Duration: ${item.duration}`                                    : 'Flexible Duration',
            item.difficulty    ? `Level: ${item.difficulty}`                                     : 'All Levels',
            item.discountedPrice != null
              ? `Fee: ₹${item.discountedPrice} only`
              : 'Completion Certificate',
          ],
          image: item.thumbnail?.url || null,  // ✅ correct: thumbnail.url
        }));

        setCardData(mapped);
      } catch (err) {
        console.error('Failed to fetch internships for hero:', err);
        // Fallback to empty — component will show nothing gracefully
        setCardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (cardData.length === 0) return;
    const interval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % cardData.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [cardData]);

  // ── Loading state (same dimensions as card area) ──────────────────────────
  if (loading) {
    return (
      <div className="relative flex justify-center items-end h-[500px] md:h-[600px] w-full overflow-hidden top-20">
        <div className="z-30 mb-10 flex flex-col items-center justify-center w-72 md:w-[310px] h-[380px] md:h-[400px]">
          <div className="w-10 h-10 border-4 border-[#0052A3] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-400">Loading internships...</p>
        </div>
      </div>
    );
  }

  if (cardData.length === 0) return null;

  const currentCard = cardData[currentCardIndex];

  return (
    // ── Outer wrapper — UNCHANGED ─────────────────────────────────────────
    <div className="relative flex justify-center items-end h-[500px] md:h-[600px] w-full overflow-hidden top-20">

      {/* Decorative background circles — UNCHANGED */}
      <div className="absolute top-0 right-10 w-24 h-24 md:w-32 md:h-32 bg-blue-200 rounded-full opacity-40"></div>
      <div className="absolute top-24 md:top-32 right-0 w-16 h-16 md:w-20 md:h-20 bg-blue-300 rounded-full opacity-30"></div>
      <div className="absolute top-0 left-0 w-20 h-20 md:w-24 md:h-24 bg-blue-100 rounded-full opacity-20"></div>

      {/* Curves — UNCHANGED */}
      <div className="relative">
        {/* Orange Outer Curve */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 ml-0 md:ml-48 mt-39
          w-[700px] h-[70px] bg-white
          rounded-[50%_500%_0_0/50%_50%_0_0] z-20">
        </div>
        {/* Blue Inner Curve */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 ml-0 md:ml-48
          w-[700px] h-[150px] bg-[#3B5B9A]
          rounded-[50%_50%_0_0/100%_100%_0_0] z-10">
        </div>
      </div>

      {/* Animated Card Container — UNCHANGED dimensions & positioning */}
      <div className="relative w-72 md:w-[310px] h-[380px] md:h-[400px] z-30 mb-10 md:mb-16 bottom-10 left-0 md:left-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{
              x: -350,
              y: 150,
              rotate: -25,
              scale: 0.6,
              opacity: 0,
              filter: "blur(15px)"
            }}
            animate={{
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                duration: 1.8,
                ease: [0.22, 1, 0.36, 1]
              }
            }}
            exit={{
              x: 350,
              y: 150,
              rotate: 25,
              scale: 0.6,
              opacity: 0,
              filter: "blur(15px)",
              transition: {
                duration: 1.5,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8"
            style={{ zIndex: 1 }}
          >

            {/* Icon / Thumbnail — same position as original */}
            <div>
              <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2">
                <div className={`
                  ${currentCard.iconBg}
                  w-14 h-14 md:w-20 md:h-20
                  flex items-center justify-center
                  rounded-full
                  border-4 border-white shadow
                `}>
                  {currentCard.image ? (
                    // ✅ Show internship thumbnail if available
                    <img
                      src={currentCard.image}
                      alt={currentCard.title}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    // Fallback briefcase icon (matches original style)
                    <svg
                      className="w-7 h-7 md:w-8 md:h-8"
                      style={{ color: currentCard.iconColor }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Card Content — UNCHANGED layout */}
            <div className="pt-10 md:pt-12 space-y-4 md:space-y-5">
              <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900 line-clamp-2">
                {currentCard.title}
              </h3>

              <p className="text-sm md:text-base text-gray-600 text-center leading-relaxed line-clamp-2">
                {currentCard.description}
              </p>

              {/* Features List — UNCHANGED structure */}
              <div className="space-y-3 pt-4">
                {currentCard.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-[#FF7A1A]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm md:text-base text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Card Indicators — UNCHANGED */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {cardData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCardIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentCardIndex
                  ? 'w-8 bg-[#0052A3]'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * HeroNew Component — UNCHANGED
 */
const HeroNew = ({ className = "" }) => {
  const [stats, setStats] = useState({
    internsTrained: 1500,
    hiringPartners: 500,
    verifiedPrograms: 100,
    totalCourses: 50
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/analytics/public-stats');
        if (res.data && res.data.success) {
          setStats({
            internsTrained: res.data.data.internsTrained || 1500,
            hiringPartners: res.data.data.hiringPartners || 500,
            verifiedPrograms: res.data.data.verifiedPrograms || 100,
            totalCourses: res.data.data.totalCourses || 50
          });
        }
      } catch (err) {
        console.error('Failed to fetch public stats:', err);
      }
    };
    fetchStats();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.7, ease: 'easeOut', delay: 0.3 },
  };

  return (
    <section className={`relative w-full bg-white pt-8 md:pt-10 lg:pt-12 pb-12 md:pb-16 lg:pb-20 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* LEFT SIDE - Text Content — UNCHANGED */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6 md:space-y-8"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#0F172A] leading-tight"
            >
              <span className="text-gray-900">Unlock Your Potential</span>
              <br />
              <span className="text-gray-900">with </span>
              <span className="text-[#0052A3]">Intern</span>
              <span className="text-[#FF7A1A]">Katta</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed"
            >
              InternKatta connects you with verified internships, mentor-led trainings, and real projects that prepare you for your first job.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/courses"
                className="group relative px-8 py-4 md:px-10 md:py-4 bg-[#0052A3] text-white rounded-full font-semibold text-base md:text-lg shadow-lg shadow-blue-200/50 hover:bg-[#004085] hover:shadow-xl hover:shadow-blue-300/50 hover:scale-105 transition-all duration-300 text-center"
              >
                Get started
              </Link>
              <Link
                to="/internship"
                className="group px-8 py-4 md:px-10 md:py-4 bg-white text-[#0052A3] border-2 border-[#0052A3] rounded-full font-semibold text-base md:text-lg hover:bg-[#EDF4FB] hover:text-[#0052A3] transition-all duration-300 text-center"
              >
                Browse programs
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - Rotating Cards — UNCHANGED */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="flex justify-center items-center"
          >
            <motion.div variants={scaleIn} transition={{ duration: 2 }} className="w-full">
              <RotatingCards />
            </motion.div>
          </motion.div>
        </div>

        {/* Trust Strip — UNCHANGED */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full mt-16 md:mt-20 lg:mt-24 py-6 md:py-8 lg:py-10"
        >
          <div className="grid grid-cols-2 gap-y-10 gap-x-4 sm:flex sm:flex-wrap sm:justify-center sm:items-start sm:gap-8 md:gap-10 lg:gap-14 xl:gap-20 w-full">

            <div className="flex flex-col items-center text-center gap-2 min-w-[80px]">
              <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#E5F0FF] flex items-center justify-center">
                <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#0F172A]" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0052A3] leading-tight">
                <CountUp end={stats.internsTrained} duration={2000} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-500 whitespace-nowrap">interns trained</div>
            </div>

            <div className="hidden sm:block self-center w-px h-14 md:h-16 lg:h-20 bg-gray-200 flex-shrink-0" />

            <div className="flex flex-col items-center text-center gap-2 min-w-[80px]">
              <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#E5F0FF] flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#0052A3]" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight">
                <CountUp end={stats.hiringPartners} duration={2000} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-500 whitespace-nowrap">Hiring partners</div>
            </div>

            <div className="hidden sm:block self-center w-px h-14 md:h-16 lg:h-20 bg-gray-200 flex-shrink-0" />

            <div className="flex flex-col items-center text-center gap-2 min-w-[80px]">
              <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#E5F0FF] flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#0052A3]" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight">
                <CountUp end={stats.verifiedPrograms} duration={2000} suffix="%" />
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-500 whitespace-nowrap">Verified programs</div>
            </div>

            <div className="hidden sm:block self-center w-px h-14 md:h-16 lg:h-20 bg-gray-200 flex-shrink-0" />

            <div className="flex flex-col items-center text-center gap-2 min-w-[80px]">
              <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#E5F0FF] flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#0052A3]" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight">
                <CountUp end={stats.totalCourses} duration={2000} suffix="+" />
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-500 whitespace-nowrap">Internships/Courses</div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroNew;