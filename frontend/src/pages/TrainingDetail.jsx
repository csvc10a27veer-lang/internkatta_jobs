import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useNavigationWithLoading } from '../hooks/useNavigationWithLoading';
import { 
    BookOpenIcon, 
    ListBulletIcon, 
    ClockIcon, 
    UserGroupIcon, 
    ComputerDesktopIcon,
    CheckCircleIcon,
    SparklesIcon,
    CommandLineIcon,
    ChartBarIcon,
    ArrowLeftIcon,
    TrophyIcon,
    LockClosedIcon,
    HomeIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
    TrophyIcon as TrophySolidIcon 
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import TrainingRegistrationForm from '../components/TrainingRegistrationForm';

// Training data - in a real app, this would come from an API
const trainingPrograms = {
  'industrial': {
    id: 'industrial',
    image: '/training-1.jpg',
    title: 'Industrial Training',
    description: 'A comprehensive program designed for engineering students to gain hands-on industrial experience.',
    duration: '4 / 6 Weeks',
    mode: 'Live Online Sessions',
    idealFor: '2nd, 3rd & Final Year Engineering Students',
    category: 'Industrial Training',
    difficulty: 'Intermediate',
    language: 'English',
    keyFeatures: [
      'Live project development from scratch',
      'Direct mentorship by industry veterans',
      'Fulfills academic/college requirements',
      'Dedicated sessions for soft skills & interview prep',
      'Build a professional-grade portfolio'
    ],
    technologies: ['Python & Django', 'Java Full Stack', 'MERN Stack', 'Data Science', 'Cloud Computing'],
    longDescription: 'Our intensive Industrial Training program is designed to bridge the gap between academic learning and real-world application. Students will work in teams, follow agile methodologies, and build a complete project that can be showcased to potential employers.',
    stats: [
      { value: '95%', label: 'Completion Rate' },
      { value: '80%', label: 'Placement Assistance' },
      { value: '5+', label: 'Real Projects' }
    ]
  },
  'msbte': {
    id: 'msbte',
    image: '/training-2.jpg',
    title: 'MSBTE Sponsored Training',
    description: 'Official programs aligned with the MSBTE curriculum to fulfill academic requirements with practical skills.',
    duration: '4 Weeks',
    mode: 'Hybrid (Online + Offline)',
    idealFor: 'Polytechnic & Diploma Students (MSBTE)',
    category: 'MSBTE Training',
    difficulty: 'Beginner',
    language: 'English',
    keyFeatures: [
      'Curriculum approved by MSBTE',
      'Practical labs and assignments',
      'Guaranteed certification upon completion',
      'Focus on in-demand technical skills',
      'Industry-expert led sessions'
    ],
    technologies: ['Embedded Systems', 'PLC/SCADA', 'Web Technologies', 'Networking'],
    longDescription: 'This program is officially recognized and designed in collaboration with MSBTE standards. It provides diploma students the perfect platform to gain practical skills that complement their theoretical knowledge, making them highly employable.',
    stats: [
      { value: '100%', label: 'Certified' },
      { value: 'MSBTE', label: 'Approved' },
      { value: '4.8/5', label: 'Rating' }
    ]
  },
  'workshops': {
    id: 'workshops',
    image: '/training-3.jpg',
    title: 'Specialized Workshops',
    description: 'Intensive 1-3 day workshops focused on a single, cutting-edge technology or tool.',
    duration: '1 to 3 Days',
    mode: 'Live Online or In-Person',
    idealFor: 'Students & Professionals wanting to upskill quickly',
    category: 'Workshops',
    difficulty: 'All Levels',
    language: 'English',
    keyFeatures: [
      'Deep dive into one specific topic',
      'Hands-on, practical sessions',
      'Perfect for weekend learning',
      'Certificate of Participation',
      'Network with peers and instructors'
    ],
    technologies: ['Git & GitHub', 'Docker', 'Figma for Developers', 'Advanced JavaScript'],
    longDescription: 'Our workshops are short, intensive, and designed for maximum impact. Whether you want to master a new tool over a weekend or get a crash course in a new technology, these workshops are the most efficient way to learn.',
    stats: [
      { value: '10+', label: 'Workshops' },
      { value: '98%', label: 'Satisfaction' },
      { value: '500+', label: 'Participants' }
    ]
  }
};

const TrainingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { navigateWithLoading } = useNavigationWithLoading();
    const [activeTab, setActiveTab] = useState('overview');
    const [isCopied, setIsCopied] = useState(false);
    const [training, setTraining] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        // Simulate API call
        const fetchTraining = async () => {
            setLoading(true);
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const trainingData = trainingPrograms[id];
            if (trainingData) {
                setTraining(trainingData);
            }
            setLoading(false);
        };

        fetchTraining();
    }, [id]);

    // Scroll to form when it's shown
    useEffect(() => {
        if (showRegistrationForm && formRef.current) {
            // Small delay to ensure the form is rendered
            setTimeout(() => {
                formRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }
    }, [showRegistrationForm]);

    const handleFilterClick = (filterType, value) => {
        navigateWithLoading(`/training?${filterType}=${encodeURIComponent(value)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading training details...</p>
                </div>
            </div>
        );
    }

    if (!training) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Training Not Found</h1>
                    <p className="text-gray-600 mb-6">The training program you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigateWithLoading('/training')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Training Programs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-[#0658A8] via-[#0658A8] to-[#0658A8] overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                
                <div className="relative z-10">
                    {/* Breadcrumbs */}
                    <div className="container mx-auto px-6 pt-8">
                        <nav className="flex items-center space-x-2 text-blue-200">
                            <button
                                onClick={() => navigateWithLoading('/')}
                                className="flex items-center hover:text-white transition-colors"
                            >
                                <HomeIcon className="h-4 w-4 mr-1" />
                                Home
                            </button>
                            <ChevronRightIcon className="h-4 w-4" />
                            <button
                                onClick={() => navigateWithLoading('/training')}
                                className="hover:text-white transition-colors"
                            >
                                Training
                            </button>
                            <ChevronRightIcon className="h-4 w-4" />
                            <span className="text-white">{training.title}</span>
                        </nav>
                    </div>

                    {/* Hero Content */}
                    <div className="container mx-auto px-6 py-10 md:py-14">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                            {/* Left Column: Text & Actions */}
                            <div className="flex-1 max-w-2xl text-left">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-white mb-5 leading-tight tracking-tight">
                                    {training.title}
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed font-normal">
                                    {training.description}
                                </p>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <button 
                                        onClick={() => {
                                            setShowRegistrationForm(true);
                                        }}
                                        className="px-8 py-3.5 bg-white text-[#0658A8] font-bold text-base md:text-lg rounded-xl hover:bg-blue-50 active:scale-95 transition-all duration-200 shadow-lg shadow-blue-950/20 flex items-center justify-center cursor-pointer"
                                    >
                                        Register Now
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                if (navigator.clipboard && window.isSecureContext) {
                                                    await navigator.clipboard.writeText(window.location.href);
                                                } else {
                                                    // Fallback for older browsers or non-HTTPS
                                                    const textArea = document.createElement('textarea');
                                                    textArea.value = window.location.href;
                                                    textArea.style.position = 'fixed';
                                                    textArea.style.left = '-999999px';
                                                    textArea.style.top = '-999999px';
                                                    document.body.appendChild(textArea);
                                                    textArea.focus();
                                                    textArea.select();
                                                    document.execCommand('copy');
                                                    textArea.remove();
                                                }
                                                
                                                // Show "Copied!" state
                                                setIsCopied(true);
                                                setTimeout(() => {
                                                    setIsCopied(false);
                                                }, 2000);
                                            } catch (err) {
                                                console.error('Failed to copy: ', err);
                                            }
                                        }}
                                        className={`px-7 py-3.5 border-2 font-bold text-base md:text-lg rounded-xl transition-colors flex items-center justify-center cursor-pointer ${
                                            isCopied 
                                                ? 'bg-green-100 border-green-200 text-green-800' 
                                                : 'bg-transparent border-white text-white hover:bg-white hover:text-[#0658A8]'
                                        }`}
                                    >
                                        {isCopied ? 'Copied!' : 'Copy shareable link'}
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Hero Image */}
                            <div className="w-full lg:w-[440px] xl:w-[480px] flex-shrink-0 flex items-center justify-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.45, ease: "easeOut" }}
                                    className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/40 border-2 border-white/20 group"
                                >
                                    <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                                        <img 
                                            src={training.image || (training.id === 'msbte' ? '/training-2.jpg' : training.id === 'workshops' ? '/training-3.jpg' : '/training-1.jpg')} 
                                            alt={training.title}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                                        
                                        {/* Overlay pill chips */}
                                        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0658A8]/90 text-white shadow-sm border border-white/20 backdrop-blur-sm">
                                                {training.category}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white/95 border border-white/15 backdrop-blur-sm">
                                                {training.duration}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Content */}
                    <div className="lg:col-span-3">
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <button
                                onClick={() => handleFilterClick('difficulty', training.difficulty)}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                                        <ChartBarIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Difficulty level</p>
                                        <p className="font-semibold text-gray-900">{training.difficulty}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleFilterClick('language', training.language)}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                                        <UserGroupIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Content language</p>
                                        <p className="font-semibold text-gray-900">{training.language}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleFilterClick('category', training.category)}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                                        <BookOpenIcon className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="font-semibold text-gray-900">{training.category}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleFilterClick('duration', training.duration)}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-orange-200 transition-colors">
                                        <ClockIcon className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Duration</p>
                                        <p className="font-semibold text-gray-900">{training.duration}</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="border-b border-gray-200">
                                <nav className="flex">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`px-8 py-4 font-semibold text-sm border-b-2 transition-colors ${
                                            activeTab === 'overview'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('curriculum')}
                                        className={`px-8 py-4 font-semibold text-sm border-b-2 transition-colors ${
                                            activeTab === 'curriculum'
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Curriculum
                                    </button>
                                </nav>
                            </div>

                            <div className="p-4 sm:p-8">
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        {/* Registration Form */}
                                        {showRegistrationForm && (
                                            <div ref={formRef} id="registration-form" className="mb-8 scroll-mt-8">
                                                <TrainingRegistrationForm 
                                                    training={training} 
                                                    onClose={() => setShowRegistrationForm(false)}
                                                />
                                            </div>
                                        )}
                                        
                                        {/* About Section */}
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                                <BookOpenIcon className="h-6 w-6 text-blue-600 mr-3" />
                                                About the {training.title}
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {training.longDescription}
                                            </p>
                                        </div>

                                        {/* Audience Section */}
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                                <UserGroupIcon className="h-6 w-6 text-blue-600 mr-3" />
                                                Audience
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                This training program is designed for {training.idealFor.toLowerCase()}. 
                                                It's perfect for individuals who want to gain practical experience and advance their career in the tech industry.
                                            </p>
                                        </div>

                                        {/* Learning Objectives */}
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                                <SparklesIcon className="h-6 w-6 text-blue-600 mr-3" />
                                                Learning objectives
                                            </h3>
                                            <ul className="space-y-3">
                                                {training.keyFeatures.map((feature, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                        <span className="text-gray-700 text-lg">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Agenda */}
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                                <ListBulletIcon className="h-6 w-6 text-blue-600 mr-3" />
                                                Agenda
                                            </h3>
                                            <ul className="space-y-3">
                                                <li className="flex items-center text-gray-700 text-lg">
                                                    <ArrowLeftIcon className="h-5 w-5 text-blue-600 mr-3" />
                                                    Introduction and setup
                                                </li>
                                                <li className="flex items-center text-gray-700 text-lg">
                                                    <ArrowLeftIcon className="h-5 w-5 text-blue-600 mr-3" />
                                                    Core concepts and fundamentals
                                                </li>
                                                <li className="flex items-center text-gray-700 text-lg">
                                                    <ArrowLeftIcon className="h-5 w-5 text-blue-600 mr-3" />
                                                    Hands-on project development
                                                </li>
                                                <li className="flex items-center text-gray-700 text-lg">
                                                    <ArrowLeftIcon className="h-5 w-5 text-blue-600 mr-3" />
                                                    Industry best practices
                                                </li>
                                                <li className="flex items-center text-gray-700 text-lg">
                                                    <ArrowLeftIcon className="h-5 w-5 text-blue-600 mr-3" />
                                                    Portfolio building and presentation
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'curriculum' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                            <CommandLineIcon className="h-6 w-6 text-blue-600 mr-3" />
                                            Technologies Covered
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {training.technologies.map((tech, index) => (
                                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <div className="flex items-center">
                                                        <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                                                        <span className="font-medium text-gray-900">{tech}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Enroll Card */}
                            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Get your certificate!</h3>
                                <p className="text-gray-600 text-sm mb-4">Complete the training to unlock your certificate of completion.</p>
                                <button 
                                    onClick={() => {
                                        setShowRegistrationForm(true);
                                    }}
                                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Register Now
                                </button>
                            </div>

                            {/* Golden Floating Certificate Card */}
                            <motion.div 
                                initial={{ y: 0 }}
                                animate={{ y: [-5, 5, -5] }}
                                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                                className="relative rounded-3xl bg-gradient-to-b from-[#FFFDF5] via-[#FEF3C7] to-[#FDE68A] p-6 sm:p-7 text-center border-2 border-[#F59E0B]/50 shadow-[0_16px_40px_-10px_rgba(245,158,11,0.32)] hover:shadow-[0_20px_50px_-10px_rgba(245,158,11,0.45)] transition-shadow duration-300 overflow-hidden group"
                            >
                                {/* Background Ambient Rays and Golden Glows */}
                                <div 
                                    className="absolute -top-16 -right-16 w-44 h-44 rounded-full pointer-events-none opacity-60 blur-2xl"
                                    style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.7) 0%, transparent 70%)' }}
                                />
                                <div 
                                    className="absolute -bottom-14 -left-14 w-40 h-40 rounded-full pointer-events-none opacity-50 blur-xl"
                                    style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.5) 0%, transparent 70%)' }}
                                />

                                <div className="relative z-10 flex flex-col items-center">
                                    {/* Golden Credential Badge Tag */}
                                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-sm shadow-amber-500/30 mb-4 border border-yellow-200/70">
                                        Official Credential
                                    </span>

                                    {/* Floating Golden Trophy Pedestal */}
                                    <div className="relative mb-3.5 flex items-center justify-center">
                                        {/* Golden Pulsing Halo */}
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 opacity-40 blur-md animate-pulse scale-110" />
                                        
                                        {/* Golden Trophy Pedestal with Bobbing Animation */}
                                        <motion.div
                                            animate={{ y: [-3, 3, -3], rotate: [-1.5, 1.5, -1.5] }}
                                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                            className="relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-[#D97706] via-[#F59E0B] to-[#FDE047] p-4 shadow-lg shadow-amber-600/35 border-2 border-yellow-100 flex items-center justify-center"
                                        >
                                            <TrophySolidIcon className="h-11 w-11 sm:h-12 sm:w-12 text-[#451A03] drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
                                        </motion.div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="text-xl sm:text-[22px] font-black text-[#78350F] tracking-tight mb-1 leading-snug drop-shadow-sm">
                                        Certificate of Completion
                                    </h4>

                                    {/* Subtitle */}
                                    <p className="text-xs sm:text-[13px] font-bold text-[#B45309] uppercase tracking-wider mb-4">
                                        {training?.title || 'Industrial Training'}
                                    </p>

                                    {/* Key Benefits / Highlights */}
                                    <div className="w-full space-y-2 mb-4 text-left bg-white/65 backdrop-blur-sm rounded-xl p-3 border border-amber-200/80 shadow-sm">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
                                            <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>Industry & Employer Recognized</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
                                            <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>Verifiable QR-Code Credential</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
                                            <CheckCircleIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>Shareable on LinkedIn & Resumes</span>
                                        </div>
                                    </div>

                                    {/* Lock Footer Indicator */}
                                    <div className="w-full flex items-center justify-center gap-2 text-amber-900 bg-amber-500/15 py-2.5 px-3 rounded-xl border border-amber-400/40">
                                        <LockClosedIcon className="h-4 w-4 text-amber-800 shrink-0" />
                                        <span className="text-xs sm:text-[13px] font-bold text-amber-950">
                                            Complete the training to unlock
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TrainingDetail;
