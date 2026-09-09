// frontend/src/pages/Home.jsx

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import { 
    BookOpenIcon, 
    BriefcaseIcon, 
    ShieldCheckIcon, 
    UsersIcon, 
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import HeroNew from '../components/ui/HeroNew';
import SEO from '../components/SEO';


// --- Reusable Animated Counter Component ---
const AnimatedCounter = ({ to, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const numberValue = parseInt(String(to).replace(/[^0-9]/g, ''), 10);
      const controls = animate(0, numberValue, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(value) {
          setDisplayValue(Math.round(value));
        }
      });
      return () => controls.stop();
    }
  }, [isInView, to]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
};


// --- Main Home Component ---
const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState([
    { value: 10000, suffix: '+', label: 'Students Trained' },
    { value: 500, suffix: '+', label: 'Industry Partners' },
    { value: 95, suffix: '%', label: 'Placement Rate' },
    { value: 50, suffix: '+', label: 'Courses Available' }
  ]);

  // --- Animation Variants for Framer Motion ---
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    initial: {}, // Add initial prop to the variant
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  // Fetch newest courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, statsRes] = await Promise.all([
          api.get('/api/courses'),
          api.get('/api/analytics/public-stats').catch(() => null)
        ]);

        if (statsRes?.data?.success) {
          const { internsTrained, hiringPartners, totalCourses } = statsRes.data.data;
          setStats([
            { value: internsTrained || 10000, suffix: '+', label: 'Students Trained' },
            { value: hiringPartners || 500, suffix: '+', label: 'Industry Partners' },
            { value: 95, suffix: '%', label: 'Placement Rate' },
            { value: totalCourses || 50, suffix: '+', label: 'Courses Available' }
          ]);
        }

        // Get the 2 newest courses (sorted by creation date)
        const newestCourses = coursesRes.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2);

        // Ensure each featured course has an image — prefer backend's `thumbnailUrl`
        const coursesWithImages = await Promise.all(newestCourses.map(async (course) => {
          if (course.thumbnailUrl || course.imageUrl || course.image || course.tutorPhoto) {
            return course;
          }
          try {
            const { data: courseDetails } = await api.get(`/api/courses/${course._id}`);
            return {
              ...course,
              thumbnailUrl: courseDetails.thumbnailUrl || courseDetails.imageUrl || courseDetails.image || courseDetails.tutorPhoto || course.tutorPhoto,
            };
          } catch (err) {
            // If image fetch fails, return original course object
            return course;
          }
        }));

        setFeaturedCourses(coursesWithImages);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays if API fails
        setFeaturedCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const whyChooseUsItems = [
    { icon: BriefcaseIcon, title: "Industry Ready Skills", description: "Our curriculum is designed by industry experts to ensure you learn the most relevant and in-demand skills." },
    { icon: BookOpenIcon, title: "Project-Based Learning", description: "Build real applications and create a portfolio that showcases your abilities to potential employers." },
    { icon: UsersIcon, title: "Mentor Support", description: "Get guidance from experienced professionals who are actively working in the industry." },
    { icon: ShieldCheckIcon, title: "Certification", description: "Earn verifiable certificates that are recognized by top companies and can boost your career prospects." }
  ];

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "InternKatta - Online Internships & Courses",
    "description": "Join InternKatta for industry-ready internships and premium courses. Get hands-on experience, mentorship, and certification.",
    "url": "https://internkatta.com",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Premium Courses",
          "description": "Master in-demand skills with expert-led courses at your own pace."
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Live Internships",
          "description": "Work on real-world projects with mentor guidance and industry exposure."
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Industrial Training",
          "description": "Job-ready programs with certification and placement assistance."
        }
      ]
    }
  };

  return (
    <div className="bg-white text-text overflow-x-hidden">
      <SEO
        title="InternKatta - Online Internships & Courses | Skill Development Platform"
        description="Join InternKatta for industry-ready internships and premium courses. Get hands-on experience, mentorship, and certification. 10,000+ students trained, 95% placement rate. Start your career journey today!"
        keywords="internships, online courses, skill development, industrial training, MSBTE training, career development, online learning, certification programs, project-based learning, placement assistance, mentor guidance"
        url="https://internkatta.com"
        structuredData={homeStructuredData}
      />
      {/* Hero Section */}
      <HeroNew />

      {/* What We Offer Section */}
      <motion.section 
        className="pt-12 sm:pt-16 md:pt-20 pb-12 sm:pb-16 md:pb-20 bg-[#f8fafc]"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1360px] mx-auto">
            {/* Title and Subtitle */}
            <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                What We Offer
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                A complete ecosystem for your career growth — learn, practice, and get hired
              </p>
            </motion.div>

            {/* Cards Grid — Image-backed cards with overlapping text */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Card 1 - Premium Courses */}
              <motion.div variants={fadeInUp} className="h-full">
                <Link 
                  to="/courses"
                  className="group relative flex flex-col justify-end h-[480px] sm:h-[520px] rounded-[28px] overflow-hidden bg-[#070d17] border border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 block"
                >
                  {/* Background Image: Glass Skyscrapers */}
                  <img 
                    src="/offer-1.jpg" 
                    alt="Premium Courses"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Dark Gradient Overlay for optimal text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/85 via-55% to-[#060a12]/20 pointer-events-none" />

                  {/* Overlapping Content Area */}
                  <div className="relative z-10 p-6 sm:p-7 flex flex-col justify-end">
                    {/* Title */}
                    <h3 className="text-2xl sm:text-[26px] font-bold text-white mb-2 tracking-tight group-hover:text-blue-300 transition-colors">
                      Premium Courses
                    </h3>

                    {/* Lead-in Headline */}
                    <p className="text-sm font-semibold text-white/95 mb-1.5 leading-snug">
                      Master in-demand skills. Discover our impact.
                    </p>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed line-clamp-3 mb-6 font-normal">
                      Deep domain expertise tailored to web development, AI, cloud engineering, data science, and modern tech ecosystems.
                    </p>

                    {/* Bottom Bar: Tags + Circular Blue Arrow */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-medium text-gray-200 border border-white/10">
                          ✓ 100+ hrs content
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-medium text-gray-200 border border-white/10">
                          ✓ Lifetime access
                        </span>
                      </div>

                      {/* Circular Blue Action Button */}
                      <div className="w-10 h-10 rounded-full bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-all duration-200 shrink-0 ml-3">
                        <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Card 2 - Live Internships */}
              <motion.div variants={fadeInUp} className="h-full">
                <Link 
                  to="/internship"
                  className="group relative flex flex-col justify-end h-[480px] sm:h-[520px] rounded-[28px] overflow-hidden bg-[#070d17] border border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 block"
                >
                  {/* Background Image: Biophilic Atrium */}
                  <img 
                    src="/offer-2.jpg" 
                    alt="Live Internships"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/85 via-55% to-[#060a12]/20 pointer-events-none" />

                  {/* Overlapping Content Area */}
                  <div className="relative z-10 p-6 sm:p-7 flex flex-col justify-end">
                    {/* Title */}
                    <h3 className="text-2xl sm:text-[26px] font-bold text-white mb-2 tracking-tight group-hover:text-blue-300 transition-colors">
                      Live Internships
                    </h3>

                    {/* Lead-in Headline */}
                    <p className="text-sm font-semibold text-white/95 mb-1.5 leading-snug">
                      Experience real projects. Transform your career.
                    </p>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed line-clamp-3 mb-6 font-normal">
                      Hands-on industry projects with verified organizations, 1-on-1 mentor guidance, and performance-backed experience letters.
                    </p>

                    {/* Bottom Bar: Tags + Circular Blue Arrow */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-medium text-gray-200 border border-white/10">
                          ✓ Industry projects
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-medium text-gray-200 border border-white/10">
                          ✓ 1-on-1 mentorship
                        </span>
                      </div>

                      {/* Circular Blue Action Button */}
                      <div className="w-10 h-10 rounded-full bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-all duration-200 shrink-0 ml-3">
                        <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Card 3 - Industrial Training */}
              <motion.div variants={fadeInUp} className="h-full">
                <Link 
                  to="/training"
                  className="group relative flex flex-col justify-end h-[480px] sm:h-[520px] rounded-[28px] overflow-hidden bg-[#070d17] border border-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 block"
                >
                  {/* Background Image: Sweeping Parametric Arches */}
                  <img 
                    src="/offer-3.jpg" 
                    alt="Industrial Training"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/85 via-55% to-[#060a12]/20 pointer-events-none" />

                  {/* Overlapping Content Area */}
                  <div className="relative z-10 p-6 sm:p-7 flex flex-col justify-end">
                    {/* Title */}
                    <h3 className="text-2xl sm:text-[26px] font-bold text-white mb-2 tracking-tight group-hover:text-blue-300 transition-colors">
                      Industrial Training
                    </h3>

                    {/* Lead-in Headline */}
                    <p className="text-sm font-semibold text-white/95 mb-1.5 leading-snug">
                      Explore our programs. Accelerate your performance.
                    </p>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed line-clamp-3 mb-6 font-normal">
                      Structured diploma & degree training aligned with MSBTE curriculum, practical industrial exposure, and placement assistance.
                    </p>

                    {/* Bottom Bar: Tags + Circular Blue Arrow */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-medium text-gray-200 border border-white/10">
                          ✓ MSBTE certified
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-medium text-gray-200 border border-white/10">
                          ✓ Placement support
                        </span>
                      </div>

                      {/* Circular Blue Action Button */}
                      <div className="w-10 h-10 rounded-full bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-all duration-200 shrink-0 ml-3">
                        <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Upgrade Your Career with AI (InternKatta Pro Banner) ── */}
      <section className="py-6 sm:py-8 md:py-10 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1360px] mx-auto">
            <div className="relative rounded-[24px] sm:rounded-[32px] md:rounded-[36px] bg-gradient-to-r from-[#2c136a] via-[#481fa7] to-[#2c136a] shadow-2xl shadow-purple-950/25 border border-purple-400/20 overflow-hidden px-4 sm:px-8 py-6 sm:py-8 md:py-9">
              
              {/* Subtle Concentric Radar Rings in Background */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
                <div className="w-[480px] h-[480px] rounded-full border border-purple-300/40" />
                <div className="absolute w-[720px] h-[720px] rounded-full border border-purple-300/30" />
                <div className="absolute w-[980px] h-[980px] rounded-full border border-purple-300/20" />
              </div>

              {/* Ambient Glows */}
              <div 
                className="absolute -top-20 left-1/4 w-80 h-80 rounded-full pointer-events-none opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)' }}
              />
              <div 
                className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full pointer-events-none opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, transparent 70%)' }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6">
                
                {/* Left 3D Mascot: Thumbs-up Robot with Graduation Cap */}
                <div className="hidden md:flex flex-shrink-0 items-center justify-center w-[140px] lg:w-[185px]">
                  <motion.img
                    initial={{ y: 0 }}
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    src="/mascot-thumbsup.png"
                    alt="InternKatta AI Mascot"
                    className="w-full h-auto max-h-[170px] lg:max-h-[205px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] select-none pointer-events-none"
                  />
                </div>

                {/* Center Content */}
                <div className="flex-1 text-center max-w-2xl mx-auto flex flex-col items-center">
                  
                  {/* Headline: Upgrade Your Career with InternKatta */}
                  <h2 className="text-2xl sm:text-3xl md:text-[34px] lg:text-[38px] font-black text-white tracking-tight leading-tight flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                    <span>Upgrade Your Career with</span>
                    <span className="relative inline-block px-3.5 py-0.5">
                      <span className="text-[#FDE047]">Intern</span><span className="text-[#FB923C]">Katta</span>
                      {/* Sketched glowing loop around 'InternKatta' */}
                      <svg
                        className="absolute -inset-x-2.5 -inset-y-1 w-[calc(100%+20px)] h-[calc(100%+8px)] pointer-events-none text-white/80"
                        viewBox="0 0 180 45"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="90"
                          cy="22.5"
                          rx="86"
                          ry="18"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeDasharray="4 2"
                          className="opacity-90"
                          transform="rotate(-2 90 22.5)"
                        />
                        {/* Sparkle Star */}
                        <path
                          d="M172 5L174 10L179 12L174 14L172 19L170 14L165 12L170 10L172 5Z"
                          fill="#FDE047"
                        />
                      </svg>
                    </span>
                  </h2>

                  {/* 3 Feature Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-3.5 sm:mt-4 mb-2.5 sm:mb-3">
                    {[
                      'AI-powered mock interviews',
                      'Mock tests',
                      'Career-ready courses'
                    ].map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-white/95 hover:bg-white text-[#1E1B4B] font-bold text-xs sm:text-[13px] px-3.5 sm:px-4 py-1.5 rounded-xl sm:rounded-2xl shadow-md shadow-purple-950/20 border border-white/60 transition-transform duration-200 hover:-translate-y-0.5 select-none"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Subtext: All included with InternKatta */}
                  <p className="text-purple-200/90 font-medium text-xs sm:text-sm mb-3.5 sm:mb-4">
                    All included with <span className="font-extrabold text-white">InternKatta</span>
                  </p>

                  {/* Golden CTA Button: Explore Courses */}
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#F59E0B] active:scale-95 text-[#1E1B4B] font-black text-xs sm:text-sm md:text-base px-6 sm:px-7 py-2 sm:py-2.5 rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-200 group cursor-pointer"
                  >
                    <span className="text-base select-none">🚀</span>
                    <span>Explore Courses</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-200 text-sm font-bold">→</span>
                  </Link>

                </div>

                {/* Right 3D Mascot: Cool Mascot with Sunglasses on Beanbag */}
                <div className="hidden md:flex flex-shrink-0 items-center justify-center w-[140px] lg:w-[185px]">
                  <motion.img
                    initial={{ y: 0 }}
                    animate={{ y: [4, -4, 4] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                    src="/mascot-laptop.png"
                    alt="InternKatta Pro Mascot with Laptop"
                    className="w-full h-auto max-h-[170px] lg:max-h-[205px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] select-none pointer-events-none"
                  />
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>


      {/* Why Train With InternKatta Section */}
<section 
  className="pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-10 bg-gradient-to-b from-gray-50 to-white"
>
  <div className="container mx-auto px-4 sm:px-6">
    <div className="text-center mb-8 sm:mb-12 md:mb-16">
      <h2 className="text-3xl sm:text-4xl md:text-[42px] lg:text-5xl font-black tracking-tight text-[#0F172A] leading-tight">
        <span>Why Train With </span>
        <span className="text-[#1877F2]">Intern</span>
        <span className="text-[#F05A22]">Katta</span>
        <span>?</span>
      </h2>
      <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-slate-600 font-normal">
        We combine the best of education and industry experience.
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      {whyChooseUsItems.map((item, index) => {
        // Define colors for each card
        const colors = [
          { iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { iconBg: 'bg-green-100', iconColor: 'text-green-600' },
          { iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
          { iconBg: 'bg-orange-100', iconColor: 'text-orange-600' }
        ];
        
        const cardColor = colors[index];
        
        return (
          <div 
            key={index} 
            className="bg-white p-6 sm:p-7 md:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto ${cardColor.iconBg} rounded-xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6`}>
              <item.icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${cardColor.iconColor}`}/>
            </div>
            <h4 className="font-semibold text-lg sm:text-xl text-center text-gray-900">{item.title}</h4>
            <p className="text-sm sm:text-base text-gray-600 mt-3 sm:mt-4 text-center">{item.description}</p>
          </div>
        );
      })}
    </div>
  </div>
</section>


      {/* Contact Admissions CTA Card Section */}
      <section className="py-10 sm:py-14 md:py-16 bg-[#f8fafc]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1360px] mx-auto">
            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] md:rounded-[36px] shadow-2xl min-h-[420px] sm:min-h-[460px] md:min-h-[490px] flex items-center justify-center border border-gray-200/40">
              
              {/* Background Campus Photo - Clean, Edge-to-Edge and High Clarity */}
              <img 
                src="/admissions-bg.jpg" 
                alt="University campus students"
                className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
                loading="lazy"
              />

              {/* Subtle translucent overlay for crisp text readability while keeping photo clear and vibrant */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30 pointer-events-none" />

              {/* Centered Overlapping Content */}
              <div className="relative z-10 px-6 py-12 sm:py-16 md:py-20 text-center max-w-2xl mx-auto flex flex-col items-center">
                
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.15] mb-3 sm:mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                  Ready to Transform Your<br />Career?
                </h2>

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-lg text-white/95 font-medium max-w-lg mx-auto leading-relaxed mb-6 sm:mb-8 drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
                  Our admissions team is ready to help you choose the perfect program for your goals.
                </p>

                {/* CTA Button */}
                <Link 
                  to="/contact" 
                  className="inline-flex items-center justify-center px-7 sm:px-9 py-3 sm:py-3.5 bg-[#0062cc] hover:bg-[#0051a8] active:scale-[0.98] text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-900/50 hover:shadow-blue-600/40 transition-all duration-200 mb-8 sm:mb-10"
                >
                  Contact Admissions
                </Link>

                {/* Feature Checkmarks Row */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-7 gap-y-2.5 text-xs sm:text-sm font-medium text-white/95 drop-shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#0062cc] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2.5 6 4.8 8.5 9.5 3.5" />
                      </svg>
                    </span>
                    <span>Free 1-on-1 Consultation</span>
                  </div>

                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-blue-400/80" />

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#0062cc] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2.5 6 4.8 8.5 9.5 3.5" />
                      </svg>
                    </span>
                    <span>Personalized Roadmap</span>
                  </div>

                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-blue-400/80" />

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#0062cc] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2.5 6 4.8 8.5 9.5 3.5" />
                      </svg>
                    </span>
                    <span>Dedicated Advisors</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;