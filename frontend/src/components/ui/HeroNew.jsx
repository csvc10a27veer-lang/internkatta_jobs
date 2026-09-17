import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * HeroNew Component - Modern Dark Glassmorphism Hero
 * Exactly matches the designer mockup with high-impact visuals,
 * warm ambient background photography, and glowing accents.
 */
const HeroNew = ({ className = "" }) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section className={`w-full bg-[#f8fafc] py-4 sm:py-6 md:py-8 ${className}`}>
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Hero Card Container */}
        <div className="relative w-full rounded-[24px] sm:rounded-[32px] md:rounded-[36px] overflow-hidden bg-[#0a0f18] shadow-2xl border border-white/10 min-h-[560px] sm:min-h-[600px] lg:min-h-[640px] flex flex-col justify-between">
          
          {/* Background Photography (Right aligned) */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-[65%] lg:w-[58%] overflow-hidden pointer-events-none">
            <img
              src="/hero-banner.jpg"
              alt="Students learning and working collaboratively"
              className="w-full h-full object-cover object-[center_right] opacity-70 md:opacity-85 filter contrast-105"
              loading="eager"
            />
          </div>

          {/* Seamless Dark Gradient Overlays */}
          {/* 1. Left-to-right deep dark fade so text is 100% crisp and readable */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[#090d16] via-[#090d16]/95 via-45% to-transparent pointer-events-none"
            aria-hidden="true"
          />
          {/* 2. Top-to-bottom subtle vignette */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-[#090d16]/50 via-transparent to-[#090d16]/80 pointer-events-none"
            aria-hidden="true"
          />
          {/* 3. Mobile darkening overlay */}
          <div 
            className="absolute inset-0 bg-[#090d16]/60 md:hidden pointer-events-none"
            aria-hidden="true"
          />

          {/* Main Left Content Area */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="relative z-10 p-6 sm:p-10 md:p-14 lg:p-16 max-w-2xl flex flex-col items-start justify-center flex-grow"
          >
            {/* Pill Badge: • JOIN US */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold tracking-wider text-gray-200 uppercase mb-6 sm:mb-8 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
              <span>JOIN US</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold text-white leading-[1.08] tracking-tight mb-5 sm:mb-6"
            >
              Unlock Your Potential
              <br />
              with
              <br />
              <span className="text-white">Intern</span>
              <span className="text-[#f97316]">Katta</span>
            </motion.h1>

            {/* Subtitle Description */}
            <motion.p
              variants={fadeInUp}
              className="text-sm sm:text-base md:text-[15px] text-gray-300 leading-relaxed max-w-xl mb-7 sm:mb-9 font-normal"
            >
              InternKatta makes it possible for you to achieve your fullest potential. We connect you with verified internships, mentor-led trainings, and real projects across a breadth of domains to take your initial steps toward a fulfilling career.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-3.5 sm:gap-4"
            >
              {/* Primary "Get started" Button */}
              <Link
                to="/courses"
                className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm sm:text-base shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:shadow-[0_0_32px_rgba(37,99,235,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
              >
                Get started
              </Link>

              {/* Secondary "Browse programs" Button */}
              <Link
                to="/internship"
                className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#18202f]/80 hover:bg-[#232c3d] text-gray-200 hover:text-white border border-white/15 hover:border-white/30 font-medium text-sm sm:text-base backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
              >
                Browse programs
              </Link>
            </motion.div>
          </motion.div>

          {/* Bottom Feature Bar inside the Card */}
          <div className="relative z-10 border-t border-white/10 bg-[#070b13]/70 backdrop-blur-md px-6 sm:px-10 lg:px-14 py-4 sm:py-4.5 flex flex-wrap items-center justify-between gap-4">
            {/* Feature Bullets */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-8 md:gap-10">
              {/* 1. Verified Companies */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <span className="text-[11px] sm:text-xs font-bold tracking-wider text-gray-300 uppercase">
                  VERIFIED COMPANIES
                </span>
              </div>

              {/* 2. Real-World Projects */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                <span className="text-[11px] sm:text-xs font-bold tracking-wider text-gray-300 uppercase">
                  REAL-WORLD PROJECTS
                </span>
              </div>

              {/* 3. 1-on-1 Mentorship */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-[11px] sm:text-xs font-bold tracking-wider text-gray-300 uppercase">
                  1-ON-1 MENTORSHIP
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroNew;