// frontend/src/pages/Home.jsx

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import { 
    BookOpenIcon, 
    BriefcaseIcon, 
    AcademicCapIcon, 
    ShieldCheckIcon, 
    UsersIcon, 
    LightBulbIcon,
    ArrowRightIcon,
    PlayIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import api from '../utils/api';
import HeroNew from '../components/ui/HeroNew';
import InternshipCard from '../components/ui/InternshipCard';
import { SkeletonGrid } from '../components/ui/SkeletonCard';
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
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [featuredTrainingPrograms] = useState([
    {
      id: 'industrial',
      title: 'Industrial Training',
      shortDescription:
        'A comprehensive program designed for engineering students to gain hands-on industrial experience with real-world projects and mentorship.',
    },
    {
      id: 'msbte',
      title: 'MSBTE Sponsored Training',
      shortDescription:
        'Programs structured around the MSBTE curriculum to help diploma students fulfill academic requirements with practical skills and industry exposure.',
    },
    {
      id: 'workshops',
      title: 'Specialized Workshops',
      shortDescription:
        'Intensive 1–3 day workshops focused on a single, cutting-edge technology or tool. Fast-track your skills with expert-led sessions.',
    },
  ]);
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

  // Fetch newest courses and internships
  useEffect(() => {
        const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, internshipsRes, statsRes] = await Promise.all([
          api.get('/api/courses'),
          api.get('/api/v1/internships/public/all'),
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

        // Get the 2 newest internships (sorted by creation date)
        const newestInternships = internshipsRes.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2);

            setFeaturedCourses(coursesWithImages);
        setFeaturedInternships(newestInternships);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty arrays if API fails
        setFeaturedCourses([]);
        setFeaturedInternships([]);
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
        className="pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8 md:pb-10 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-[1200px] mx-auto">
            {/* Title and Subtitle */}
            <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">What We Offer</h2>
              <p className="text-base md:text-lg text-gray-600">A complete ecosystem for your career growth</p>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Card 1 - Premium Courses */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white rounded-[18px] overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* Blue Top Strip */}
                <div className="w-full h-[12px] bg-[#0052A3]"></div>
                
                {/* Card Content */}
                <div className="p-5 lg:p-8 flex flex-col h-full">
                  {/* Icon */}
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-[#0052A3]/10 flex items-center justify-center mb-4 lg:mb-6">
                    <BookOpenIcon className="h-6 w-6 lg:h-8 lg:w-8 text-[#0052A3]" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg lg:text-2xl font-bold text-[#0f172a] mb-2 lg:mb-3">Premium Courses</h3>
                  
                  {/* Description */}
                  <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">
                    Master in-demand skills with expert-led courses at your own pace.
                  </p>
                  
                  {/* Bullets */}
                  <ul className="space-y-2 lg:space-y-3 mb-6 flex-grow">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#f97316] mr-2 lg:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base text-[#0f172a]">100+ hours of content</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#f97316] mr-2 lg:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base text-[#0f172a]">Lifetime access</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#f97316] mr-2 lg:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base text-[#0f172a]">Quizzes & exercises</span>
                    </li>
                  </ul>
                  
                  {/* Learn More Link */}
                  <Link 
                    to="/courses"
                    className="text-[#0052A3] font-semibold text-xs sm:text-sm lg:text-base hover:text-[#004085] transition-colors flex items-center mt-auto"
                  >
                    Learn more <ArrowRightIcon className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Card 2 - Live Internships */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white rounded-[18px] overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* Blue Top Strip */}
                <div className="w-full h-[12px] bg-[#0052A3]"></div>
                
                {/* Card Content */}
                <div className="p-5 lg:p-8 flex flex-col h-full">
                  {/* Icon */}
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-[#f97316]/10 flex items-center justify-center mb-4 lg:mb-6">
                    <BriefcaseIcon className="h-6 w-6 lg:h-8 lg:w-8 text-[#f97316]" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg lg:text-2xl font-bold text-[#0f172a] mb-2 lg:mb-3">Live Internships</h3>
                  
                  {/* Description */}
                  <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">
                    Work on real-world projects with mentor guidance and industry exposure.
                  </p>
                  
                  {/* Bullets */}
                  <ul className="space-y-2 lg:space-y-3 mb-6 flex-grow">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#f97316] mr-2 lg:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base text-[#0f172a]">Industry projects</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#f97316] mr-2 lg:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base text-[#0f172a]">Mentor guidance</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#f97316] mr-2 lg:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base text-[#0f172a]">Completion certificate</span>
                    </li>
                  </ul>
                  
                  {/* Learn More Link */}
                  <Link 
                    to="/internship"
                    className="text-[#0052A3] font-semibold text-xs sm:text-sm lg:text-base hover:text-[#004085] transition-colors flex items-center mt-auto"
                  >
                    Learn more <ArrowRightIcon className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Card 3 - Industrial Training */}
              <motion.div 
                variants={fadeInUp}
                className="bg-white rounded-[18px] overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* Blue Top Strip */}
                <div className="w-full h-[12px] bg-[#0052A3]"></div>
                
                {/* Card Content */}
                <div className="p-5 lg:p-8 flex flex-col h-full">
                  {/* Icon */}
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-[#0052A3]/10 flex items-center justify-center mb-4 lg:mb-6">
                    <AcademicCapIcon className="h-6 w-6 lg:h-8 lg:w-8 text-[#0052A3]" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg lg:text-2xl font-bold text-[#0f172a] mb-2 lg:mb-3">Industrial Training</h3>
                  
                  {/* Description */}
                  <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">
                    Job-ready programs with certification and placement assistance.
                  </p>
                  
                  {/* Bullets */}
                  <ul className="space-y-2 lg:space-y-3 mb-6 flex-grow">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#f97316] mr-2 lg:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base text-[#0f172a]">MSBTE certification</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#f97316] mr-2 lg:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base text-[#0f172a]">Placement support</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-[#f97316] mr-2 lg:mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs sm:text-sm lg:text-base text-[#0f172a]">Industry visits</span>
                    </li>
                  </ul>
                  
                  {/* Learn More Link */}
                  <Link 
                    to="/training"
                    className="text-[#0052A3] font-semibold text-xs sm:text-sm lg:text-base hover:text-[#004085] transition-colors flex items-center mt-auto"
                  >
                    Learn more <ArrowRightIcon className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured Internships Section */}
      <section className="pt-10 sm:pt-14 md:pt-16 pb-10 sm:pb-14 md:pb-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-[1200px] mx-auto">

            {/* Section Header */}
            <div className="text-center mb-14 sm:mb-16 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Latest Internship Programs
              </h2>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-[#0052A3] font-medium">
                Discover our latest internship opportunities
              </p>
            </div>

            {loading ? (
              /* Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative pt-10 animate-pulse">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-gray-200 rounded-full z-10" />
                    <div className="rounded-2xl border-2 border-gray-200 p-6 lg:p-8 pt-10 lg:pt-14 bg-white">
                      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4" />
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/2" />
                      <div className="h-4 bg-gray-200 rounded mb-6 w-full" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">

                {featuredInternships.map((internship, index) => (
                  /* Internship Card */
                  <div key={internship._id} className="relative pt-8 lg:pt-10 group">
                    {/* Floating Icon — overlaps top border */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10
                                    w-16 h-16 lg:w-22 lg:h-22 rounded-full bg-[#EEF3FB]
                                    flex items-center justify-center
                                    border-[14px] lg:border-[20px] border-white shadow-sm">
                      <BriefcaseIcon className={`h-6 w-6 lg:h-7 lg:w-7 ${index % 2 === 0 ? 'text-[#0052A3]' : 'text-[#0052A3]'}`} />
                    </div>

                    {/* Card */}
                    <div className="h-[360px] lg:h-[400px] rounded-2xl border-2 border-[#C5D9F0] bg-white
                                    flex flex-col px-4 lg:px-6 pt-10 lg:pt-14 pb-4 lg:pb-6
                                    hover:border-[#0052A3] hover:-translate-y-1
                                    transition-all duration-300">

                      {/* Category Badge */}
                      <div className="mb-2 lg:mb-3">
                        <span className="px-2 py-1 lg:px-3 lg:py-1 bg-gray-100 text-[10px] lg:text-xs font-medium rounded-full text-gray-600">
                          {internship.category?.name || internship.category || 'General'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base lg:text-xl font-bold text-[#0052A3] mb-2 lg:mb-3 leading-snug">
                        {internship.title}
                      </h3>

                      {/* Duration & Projects */}
                      <div className="flex flex-wrap items-center gap-2 lg:gap-4 mb-3 lg:mb-4">
                        <div className="flex items-center text-xs lg:text-sm text-gray-500">
                          <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {internship.duration || '1 Month'}
                        </div>
                        <div className="flex items-center text-xs lg:text-sm text-gray-500">
                          <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 2 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Live Projects
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs lg:text-sm text-gray-500 mb-4 lg:mb-6 flex-grow line-clamp-3 leading-relaxed">
                        {internship.description}
                      </p>

                      {/* Footer row */}
                      <div className="flex items-center justify-between mt-auto pt-3 lg:pt-4 border-t border-gray-100">
                        <Link
                          to={`/internship/${internship._id}`}
                          className="text-[#0f172a] font-semibold text-xs lg:text-sm hover:text-[#0052A3] transition-colors flex items-center gap-1"
                        >
                          Know More
                          <ArrowRightIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                        </Link>
                        <span className="flex items-center gap-1 text-[#FF7A1A] font-semibold text-[10px] lg:text-sm bg-orange-50 px-2 py-1 rounded-full">
                          <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                              d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd" />
                          </svg>
                          20% off
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Explore All Card */}
                <div className="relative pt-8 lg:pt-10 group">
                  {/* Floating Icon */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10
                                  w-16 h-16 lg:w-22 lg:h-22 rounded-full bg-[#EEF3FB]
                                  flex items-center justify-center
                                  border-[14px] lg:border-[22px] border-white shadow-sm">
                    <svg className="w-6 h-6 lg:w-7 lg:h-7 text-[#0052A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>

                  {/* Card */}
                  <div className="h-full rounded-2xl border-2 border-[#C5D9F0] bg-white
                                  flex flex-col items-center justify-center text-center
                                  px-4 lg:px-6 pt-10 lg:pt-14 pb-6 lg:pb-8 min-h-[240px] lg:min-h-[280px]
                                  hover:border-[#0052A3] hover:-translate-y-1
                                  transition-all duration-300">
                    <h3 className="text-lg lg:text-xl font-bold text-[#0052A3] mb-2 lg:mb-3 leading-snug">
                      Explore All Internships
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-500 mb-4 lg:mb-6 max-w-[220px]">
                      Browse our complete catalog of internship programs
                    </p>
                    <Link
                      to="/internship"
                      className="text-[#0052A3] font-semibold text-xs lg:text-sm hover:text-[#003d80] transition-colors flex items-center gap-1 mt-auto"
                    >
                      View all
                      <ArrowRightIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Link>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section 
  className="pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-10 bg-white"
>
  <div className="container mx-auto px-4 sm:px-6">
    <div className="max-w-[1200px] mx-auto">
      <div className="text-center mb-8 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900">Latest Courses</h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600">Discover our latest courses uploaded by our experts</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse mt-24 lg:mt-32">
              <div className="relative pt-24 lg:pt-32 pb-4 lg:pb-6 px-4 lg:px-6">
                <div className="absolute -top-16 lg:-top-24 left-1/2 transform -translate-x-1/2 w-32 h-32 lg:w-48 lg:h-48 bg-gray-200 rounded-full border-4 border-white"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-24 mx-auto mb-4"></div>
                <div className="h-9 bg-gray-200 rounded-full w-28 mx-auto"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded-b-2xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
          {featuredCourses.map((course, index) => (
            <div 
              key={course._id} 
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-visible flex flex-col relative mt-24 lg:mt-32"
            >
              {/* Circular Photo - Much Bigger, mostly outside card */}
              <div className="absolute -top-16 lg:-top-24 left-1/2 transform -translate-x-1/2 w-32 h-32 lg:w-48 lg:h-48 rounded-full border-4 border-white overflow-hidden bg-gray-50 flex items-center justify-center shadow-lg z-10">
                { (course.thumbnailUrl || course.imageUrl || course.image) ? (
                  <img
                    src={course.thumbnailUrl || course.imageUrl || course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-gray-400">Photo</span>';
                  
                    }}
                  />
                ) : (
                  <span className="text-gray-400">Photo</span>
                )}
              </div>

              {/* Card Content */}
              <div className="pt-20 lg:pt-32 pb-4 lg:pb-6 px-4 lg:px-6 flex-1 flex flex-col items-center text-center">
                {/* Instructor Name */}
                <p className="text-blue-600 font-semibold text-sm lg:text-base mb-1 lg:mb-2">
                  {course.tutor}
                </p>

                {/* Course Title */}
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3 line-clamp-2 leading-snug">
                  {course.title}
                </h3>

                {/* Expertise/Details - Single Line */}
                <div className="flex items-center gap-1 lg:gap-2 justify-center mb-3 lg:mb-4 text-[10px] lg:text-xs text-gray-600 flex-wrap">
                  {course.category && (
                    <span>Expertise in {course.category}</span>
                  )}
                  {course.category && (course.duration || course.experience) && (
                    <span className="hidden lg:inline">•</span>
                  )}
                  <span>{course.duration || course.experience || '10+ Industry Experience'}</span>
                </div>

                {/* Price */}
                <p className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
                  ₹{course.discountedPrice || course.price}
                </p>

                {/* Register Button */}
                <Link 
                  to={`/course/${course._id}`}
                  className="mt-auto bg-[#0052A3] hover:bg-[#004085] text-white font-semibold py-1.5 lg:py-2 px-5 lg:px-7 rounded-full transition-colors duration-200 text-xs lg:text-sm"
                >
                  Register Now
                </Link>
              </div>

              {/* Bottom Blue Strip */}
              <div className="w-full h-2 lg:h-3 bg-[#0052A3] rounded-b-2xl"></div>
            </div>
          ))}
          
          {/* Explore All Courses Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-visible flex flex-col relative mt-24 lg:mt-32">
            {/* Icon Circle - Much Bigger */}
            <div className="absolute -top-16 lg:-top-24 left-1/2 transform -translate-x-1/2 w-32 h-32 lg:w-48 lg:h-48 rounded-full border-4 border-white bg-blue-50 flex items-center justify-center shadow-lg z-10">
              <BookOpenIcon className="h-12 w-12 lg:h-20 lg:w-20 text-blue-600" />
            </div>

            {/* Card Content */}
            <div className="pt-20 lg:pt-32 pb-4 lg:pb-6 px-4 lg:px-6 flex-1 flex flex-col items-center text-center">
              {/* Title */}
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">Explore All Courses</h3>
              
              {/* Description */}
              <p className="text-xs text-gray-600 mb-3 lg:mb-4">Browse our complete catalog of courses</p>

              {/* View All Button */}
              <Link 
                to="/courses"
                className="mt-auto bg-[#0052A3] hover:bg-[#004085] text-white font-semibold py-1.5 lg:py-2 px-5 lg:px-7 rounded-full transition-colors duration-200 text-xs lg:text-sm"
              >
                View All Courses
              </Link>
            </div>

            {/* Bottom Blue Strip */}
            <div className="w-full h-2 lg:h-3 bg-[#0052A3] rounded-b-2xl"></div>
          </div>
        </div>
      )}
    </div>
  </div>
</section>

    {/* --- TRAINING VERTICALS SECTION --- */}
<motion.section 
  className="pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-10 bg-white"
  initial="initial"
  whileInView="animate"
  viewport={{ once: true, amount: 0.2 }}
  variants={staggerContainer}
>
  <div className="container mx-auto px-4 sm:px-6">
    <div className="max-w-[1200px] mx-auto">
      <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900">Explore Our Training Verticals</h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600">Each program is a structured path to mastering new skills.</p>
      </motion.div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-t-[30px] lg:rounded-t-[40px] rounded-b-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full animate-pulse">
              <div className="w-full h-2 lg:h-3 bg-gray-200"></div>
              <div className="p-4 lg:p-8 flex flex-col h-full items-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gray-200 mb-4 lg:mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-8 flex-grow"></div>
                <div className="w-full space-y-3 mb-6">
                  {[1,2,3].map(j => <div key={j} className="h-4 bg-gray-200 rounded w-2/3"></div>)}
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {featuredTrainingPrograms.map((program, index) => {
            // Define different colors for each card
            const cardStyles = [
              { iconBg: 'bg-blue-100', iconColor: 'text-blue-600', icon: <ShieldCheckIcon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" /> },
              { iconBg: 'bg-orange-100', iconColor: 'text-orange-600', icon: <AcademicCapIcon className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" /> },
              { iconBg: 'bg-blue-100', iconColor: 'text-blue-600', icon: <LightBulbIcon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" /> }
            ];
            
            const currentStyle = cardStyles[index % cardStyles.length];
            
            return (
              <motion.div 
                key={program._id || program.id}
                variants={fadeInUp}
                className="bg-white rounded-t-[30px] lg:rounded-t-[40px] rounded-b-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative group"
              >
                {/* Blue Curved Top Strip */}
                <div className="w-full h-2 lg:h-3 bg-[#0052A3] rounded-t-[30px] lg:rounded-t-[40px]"></div>
                
                {/* Card Content */}
                <div className="p-4 lg:p-8 flex flex-col h-full">
                  {/* Icon Circle */}
                  <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full ${currentStyle.iconBg} flex items-center justify-center mx-auto mb-4 lg:mb-6 overflow-hidden`}>
                    {program.thumbnailUrl ? (
                      <img src={program.thumbnailUrl} alt={program.title} className="w-full h-full object-cover" />
                    ) : (
                      currentStyle.icon
                    )}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-2 lg:mb-4 text-center">
                    {program.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-xs lg:text-base text-gray-600 text-center flex-grow mb-4 lg:mb-8 leading-relaxed line-clamp-3">
                    {program.shortDescription || program.description}
                  </p>
                  
                  {/* Metrics with Orange Checkmarks */}
                  <ul className="space-y-3 mb-6">
                    {program.stats && program.stats.map((metric, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-base text-gray-900">{metric.value} {metric.label}</span>
                      </li>
                    ))}
                    {!program.stats && program.metrics && program.metrics.map((metric, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm md:text-base text-gray-900">{metric}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* View Details Link */}
                  <Link 
                    to={`/training/${program._id || program.id}`} 
                    className="text-[#0052A3] font-semibold text-sm md:text-base hover:text-[#004085] transition-colors flex items-center justify-center mt-auto"
                  >
                    View Details <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  </div>
</motion.section>

      {/* Why Train With InternKatta Section */}
<section 
  className="pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-10 bg-gradient-to-b from-gray-50 to-white"
>
  <div className="container mx-auto px-4 sm:px-6">
    <div className="text-center mb-8 sm:mb-12 md:mb-16">
      <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold">
        <span className="text-gray-900">Why Train With </span><span className="text-[#0052A3]">Intern</span><span className="text-[#FF7A1A]">Katta</span>?
      </h2>
      <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600">We combine the best of education and industry experience.</p>
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


      {/* Pricing Information Section */}
      <section className="pt-6 sm:pt-8 md:pt-10 pb-10 sm:pb-12 md:pb-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Pricing Information
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              At <strong><span className="text-[#0052A3]">Intern</span><span className="text-[#FF8C42]">Katta</span></strong>, we aim to make learning affordable and valuable.<br className="hidden sm:block"/>
              Our Price Ranges from ₹199 to ₹30,000
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Internship Card */}
            <div className="bg-white rounded-lg p-6 sm:p-7 md:p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Internship Programs</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Internship prices range from <strong>₹199</strong> to <strong>₹20,000</strong>,  
                depending on duration, specialization, and resources provided.
              </p>
            </div>
            
            {/* Courses Card */}
            <div className="bg-white rounded-lg p-6 sm:p-7 md:p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Courses</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Courses are available starting at <strong>₹500</strong> and go up to <strong>₹30,000</strong>,  
                based on level, content depth, and mentorship support.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-sm sm:text-base text-gray-600">
              We provide flexible options so you can choose a program that best fits your learning journey.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section 
        className="relative bg-white overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24 text-center relative">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-black mb-4 sm:mb-6">Ready to Transform Your Career?</h2>
            <p className="text-base sm:text-lg md:text-xl text-black max-w-3xl mx-auto">
              Our admissions team is ready to help you choose the perfect program for your goals.
            </p>
            <div className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/contact" 
                className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-[#0052A3] text-white font-bold text-sm sm:text-base md:text-lg rounded-xl shadow-lg hover:bg-[#004085] hover:shadow-xl transition-all duration-300"
              >
                Contact Admissions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;