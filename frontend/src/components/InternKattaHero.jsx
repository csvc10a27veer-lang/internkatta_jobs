import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

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

const InternKattaHero = () => {
  const [activeTab, setActiveTab] = useState('internships');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const sliderIntervalRef = useRef(null);

  // Mock data for internships
  const internshipsData = [
    {
      id: 1,
      organization: 'TechCorp Solutions',
      title: 'Full Stack Web Development Internship',
      duration: '6 months',
      stipend: '₹15,000/month',
      paid: true,
    },
    {
      id: 2,
      organization: 'DataAnalytics Pro',
      title: 'Data Science & Machine Learning Internship',
      duration: '4 months',
      stipend: '₹20,000/month',
      paid: true,
    },
    {
      id: 3,
      organization: 'CloudTech Innovations',
      title: 'Cloud Computing & DevOps Internship',
      duration: '5 months',
      stipend: '₹18,000/month',
      paid: true,
    },
    {
      id: 4,
      organization: 'MobileFirst Apps',
      title: 'React Native Mobile Development Internship',
      duration: '3 months',
      stipend: '₹12,000/month',
      paid: true,
    },
  ];

  // Mock data for trainings
  const trainingsData = [
    {
      id: 1,
      organization: 'Industry Experts',
      title: 'Advanced MERN Stack Training Program',
      duration: '8 weeks',
      stipend: 'Certificate',
      paid: false,
    },
    {
      id: 2,
      organization: 'SkillBuild Academy',
      title: 'Data Science & AI Masterclass',
      duration: '12 weeks',
      stipend: 'Certificate',
      paid: false,
    },
    {
      id: 3,
      organization: 'CodeMaster Institute',
      title: 'DevOps & Cloud Infrastructure Training',
      duration: '10 weeks',
      stipend: 'Certificate',
      paid: false,
    },
    {
      id: 4,
      organization: 'TechMentor Pro',
      title: 'UI/UX Design & Frontend Development',
      duration: '6 weeks',
      stipend: 'Certificate',
      paid: false,
    },
  ];

  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Remote'];
  const skills = ['React', 'Node.js', 'Python', 'Data Science', 'Machine Learning', 'DevOps', 'UI/UX'];

  const currentData = activeTab === 'internships' ? internshipsData : trainingsData;

  // Auto-play slider
  useEffect(() => {
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentData.length);
    }, 4500);

    return () => {
      if (sliderIntervalRef.current) {
        clearInterval(sliderIntervalRef.current);
      }
    };
  }, [currentData.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % currentData.length);
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
      sliderIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % currentData.length);
      }, 4500);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + currentData.length) % currentData.length);
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
      sliderIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % currentData.length);
      }, 4500);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
      sliderIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % currentData.length);
      }, 4500);
    }
  };

  // Reset slide when tab changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeTab]);

  const [stats, setStats] = useState([
    { value: 10000, suffix: '+', label: 'Students trained', decimals: 0 },
    { value: 500, suffix: '+', label: 'Industry partners', decimals: 0 },
    { value: 95, suffix: '%', label: 'Success rate', decimals: 0 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/analytics/public-stats');
        if (res.data.success) {
          const { internsTrained, hiringPartners } = res.data.data;
          setStats([
            { value: internsTrained || 10000, suffix: '+', label: 'Students trained', decimals: 0 },
            { value: hiringPartners || 500, suffix: '+', label: 'Industry partners', decimals: 0 },
            { value: 95, suffix: '%', label: 'Success rate', decimals: 0 },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch hero stats", err);
      }
    };
    fetchStats();
  }, []);

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
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Decorative blob behind slider */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-amber-100/40 rounded-full blur-3xl -z-0 hidden lg:block" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          {/* LEFT SIDE - Content Block */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6 md:space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
                Learn with InternKatta
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Your career starts here —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-amber-500">
                internships & hands-on trainings
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl"
            >
              Discover exciting internship opportunities and comprehensive training programs designed to kickstart your career. Gain real-world experience and build skills that matter.
            </motion.p>

            {/* Tabs */}
            <motion.div variants={fadeInUp} className="flex gap-2">
              <button
                onClick={() => setActiveTab('internships')}
                className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                  activeTab === 'internships'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BriefcaseIcon className="w-5 h-5 inline-block mr-2" />
                Internships
              </button>
              <button
                onClick={() => setActiveTab('trainings')}
                className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                  activeTab === 'trainings'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AcademicCapIcon className="w-5 h-5 inline-block mr-2" />
                Trainings
              </button>
            </motion.div>

            {/* Search & Filters */}
            <motion.div variants={fadeInUp} className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-3">
                {/* Location Dropdown */}
                <div className="relative flex-1 min-w-[140px]">
                  <button
                    onClick={() => {
                      setShowLocationDropdown(!showLocationDropdown);
                      setShowSkillDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition-colors text-gray-700 text-sm md:text-base"
                  >
                    <span className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedLocation || 'Location'}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showLocationDropdown && (
                    <div className="absolute z-20 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setSelectedLocation('');
                            setShowLocationDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
                        >
                          All Locations
                        </button>
                        {locations.map((location) => (
                          <button
                            key={location}
                            onClick={() => {
                              setSelectedLocation(location);
                              setShowLocationDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm ${
                              selectedLocation === location ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills Dropdown */}
                <div className="relative flex-1 min-w-[140px]">
                  <button
                    onClick={() => {
                      setShowSkillDropdown(!showSkillDropdown);
                      setShowLocationDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition-colors text-gray-700 text-sm md:text-base"
                  >
                    <span>{selectedSkill || 'Skills'}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showSkillDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showSkillDropdown && (
                    <div className="absolute z-20 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setSelectedSkill('');
                            setShowSkillDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
                        >
                          All Skills
                        </button>
                        {skills.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => {
                              setSelectedSkill(skill);
                              setShowSkillDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm ${
                              selectedSkill === skill ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link
                to={activeTab === 'internships' ? '/internship' : '/training'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base"
              >
                Explore {activeTab === 'internships' ? 'Internships' : 'Trainings'}
              </Link>
              <Link
                to={activeTab === 'internships' ? '/internship' : '/training'}
                className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 text-sm md:text-base"
              >
                Browse all
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-amber-500">
                    <AnimatedCounter to={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - Slider Area */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Featured Opportunities Slider */}
            <div className="relative bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100 overflow-hidden">
              {/* Slider Container */}
              <div className="relative h-64 md:h-80 overflow-hidden rounded-xl">
                <AnimatePresence mode="wait">
                  {currentData.map((item, index) => {
                    if (index !== currentSlide) return null;
                    return (
                      <motion.div
                        key={`${activeTab}-${item.id}`}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="absolute inset-0 bg-white rounded-xl p-6 md:p-8 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                              {item.organization}
                            </span>
                            {item.paid && (
                              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                                Paid
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                            {item.title}
                          </h3>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center text-gray-600">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm md:text-base">{item.duration}</span>
                          </div>
                          <div className="text-sm md:text-base font-semibold text-blue-600">
                            {item.stipend}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="w-6 h-6 text-gray-700" />
              </button>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {currentData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Talk to a Mentor Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 bg-gradient-to-r from-amber-50 to-blue-50 rounded-xl p-4 md:p-6 flex items-center gap-4 border border-amber-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm md:text-base">Talk to a mentor</h4>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Get personalized career guidance</p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showLocationDropdown || showSkillDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowLocationDropdown(false);
            setShowSkillDropdown(false);
          }}
        />
      )}
    </section>
  );
};

export default InternKattaHero;

