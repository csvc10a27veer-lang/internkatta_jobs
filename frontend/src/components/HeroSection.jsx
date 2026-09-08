import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, UsersIcon, BuildingOfficeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const HeroSection = () => {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.7, ease: 'easeOut' },
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#F5F7FB] py-12 md:py-16 lg:py-20">
      {/* Subtle grid pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0052A3 1px, transparent 1px),
            linear-gradient(to bottom, #0052A3 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Soft rounded shapes in background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFE7D1] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          {/* Top Pill - Social Proof */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm mb-6 md:mb-8"
          >
            {/* Avatar circles */}
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 border-2 border-white"
                />
              ))}
            </div>
            <span className="text-xs md:text-sm font-medium text-[#0F172A] ml-2">
              <span className="font-semibold text-[#0052A3]">12,000+</span> learners trust InternKatta
            </span>
          </motion.div>

          {/* Main Heading - Two Lines */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#0F172A] leading-tight mb-4 md:mb-6"
          >
            <span className="text-[#0052A3]">Learn Skills.</span>
            <br />
            <span className="text-[#0052A3]">Launch Your Career.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg lg:text-xl text-gray-600 max-w-[600px] mx-auto mb-8 md:mb-10 leading-relaxed"
          >
            InternKatta connects you with verified internships, mentor-led trainings, and real projects that prepare you for your first job.
          </motion.p>

          {/* Buttons Row */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 mb-12 md:mb-16"
          >
            {/* Primary Button */}
            <Link
              to="/courses"
              className="group relative px-8 py-4 md:px-10 md:py-4 bg-[#0052A3] text-white rounded-full font-semibold text-base md:text-lg shadow-lg shadow-blue-200/50 hover:bg-[#004085] hover:shadow-xl hover:shadow-blue-300/50 hover:scale-105 transition-all duration-300"
            >
              Get started
            </Link>

            {/* Secondary Button */}
            <Link
              to="/internship"
              className="group px-8 py-4 md:px-10 md:py-4 bg-white text-[#0052A3] border-2 border-[#0052A3] rounded-full font-semibold text-base md:text-lg hover:bg-[#EDF4FB] hover:text-[#0052A3] transition-all duration-300"
            >
              Browse programs
            </Link>
          </motion.div>

          {/* Large Image Card */}
          <motion.div
            variants={scaleIn}
            className="w-full max-w-5xl mx-auto mb-12 md:mb-16"
          >
            <div
              className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl"
              style={{
                boxShadow: '0 20px 60px -15px rgba(0, 82, 163, 0.3), 0 20px 60px -15px rgba(255, 122, 26, 0.2)',
              }}
            >
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-3xl md:rounded-[2.5rem] p-[2px] bg-gradient-to-r from-[#0052A3] via-[#FF7A1A] to-[#0052A3] opacity-20">
                <div className="w-full h-full bg-white rounded-3xl md:rounded-[2.5rem]" />
              </div>

              {/* Image/Illustration Container */}
              <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden">
                {/* Placeholder illustration - Student studying */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Laptop illustration */}
                  <div className="relative">
                    {/* Desk */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] sm:w-[300px] md:w-[400px] h-[120px] sm:h-[150px] md:h-[180px] bg-gradient-to-b from-amber-100 to-amber-200 rounded-t-3xl shadow-lg" />
                    
                    {/* Laptop screen */}
                    <div className="relative z-10 w-[180px] sm:w-[260px] md:w-[340px] h-[120px] sm:h-[170px] md:h-[220px] bg-gradient-to-br from-[#0052A3] to-[#003d7a] rounded-lg shadow-2xl transform -rotate-6">
                      <div className="absolute inset-2 bg-white rounded-md flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-2 bg-gradient-to-br from-[#0052A3] to-[#FF7A1A] rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div className="h-1 w-16 sm:w-24 md:w-32 bg-[#0052A3] rounded mx-auto mb-1" />
                          <div className="h-1 w-12 sm:w-20 md:w-24 bg-[#FF7A1A] rounded mx-auto" />
                        </div>
                      </div>
                    </div>

                    {/* Code lines decoration */}
                    <div className="absolute top-10 left-10 w-2 h-2 bg-[#FF7A1A] rounded-full animate-pulse" />
                    <div className="absolute top-20 right-10 w-2 h-2 bg-[#0052A3] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute bottom-20 left-20 w-2 h-2 bg-[#FF7A1A] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                </div>

                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center items-center gap-6 md:gap-8 lg:gap-12"
          >
            {/* Students Trained */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#FFE7D1] flex items-center justify-center">
                <UsersIcon className="w-5 h-5 md:w-6 md:h-6 text-[#FF7A1A]" />
              </div>
              <div className="text-left">
                <div className="text-xl md:text-2xl font-bold text-[#0F172A]">
                  <span className="text-[#FF7A1A]">10,000+</span>
                </div>
                <div className="text-xs md:text-sm text-gray-600">Students trained</div>
              </div>
            </div>

            {/* Hiring Partners */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 md:w-6 md:h-6 text-[#0052A3]" />
              </div>
              <div className="text-left">
                <div className="text-xl md:text-2xl font-bold text-[#0F172A]">
                  <span className="text-[#0052A3]">500+</span>
                </div>
                <div className="text-xs md:text-sm text-gray-600">Hiring partners</div>
              </div>
            </div>

            {/* Verified Programs */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#FFE7D1] flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 md:w-6 md:h-6 text-[#FF7A1A]" />
              </div>
              <div className="text-left">
                <div className="text-xl md:text-2xl font-bold text-[#0F172A]">
                  <span className="text-[#FF7A1A]">100%</span>
                </div>
                <div className="text-xs md:text-sm text-gray-600">Verified programs</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

