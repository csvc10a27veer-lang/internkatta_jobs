import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import { 
  Home, 
  Briefcase, 
  GraduationCap, 
  BarChart2, 
  MessageSquare, 
  ShoppingCart, 
  User, 
  ArrowRight, 
  ChevronDown, 
  Bell, 
  UserCircle2, 
  Menu, 
  X,
  Award,
  UserCheck,
  Sparkles,
  Building2
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { CartContext } from '../../context/CartContext';
import { useCandidateProfile } from '../../context/CandidateProfileContext';
import Logo from '../ui/Logo';
import { trackNavLinkClick } from '../../utils/trackClick';
import { getImageUrl } from '../../utils/api';
import { calculateProfileCompletion } from '../../utils/skillMatcher';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInternshipOpen, setIsInternshipOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [imageError, setImageError] = useState(false);

  const { auth, logout } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateWithLoading } = useNavigationWithLoading();
  const { unreadCount, notifications, markAsRead } = useSocket();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { cart } = React.useContext(CartContext);

  // Scope candidate profile in top navbar EXCLUSIVELY to dedicated Job Details pages (/jobs/:id or /job-details/:id)
  const isJobDetailsPage = (
    (location.pathname.startsWith('/jobs/') && location.pathname !== '/jobs' && location.pathname !== '/jobs/') ||
    (location.pathname.startsWith('/job-details/') && location.pathname !== '/job-details' && location.pathname !== '/job-details/')
  );

  // Candidate Profile State from global CandidateProfileContext
  const { candidateProfile, completionPercentage: candidateCompletion } = useCandidateProfile();

  const internshipDropdownRef = useRef(null);
  const coursesDropdownRef = useRef(null);

  // Reset image error if user profile picture changes
  useEffect(() => {
    setImageError(false);
  }, [auth?.user?.profilePicture]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsProfileOpen(false);
    navigate('/login');
  };

  const handleNavClick = (linkName, linkPath) => {
    trackNavLinkClick({
      linkName,
      linkPath,
      page: location.pathname,
    });
    setIsOpen(false);
    setIsInternshipOpen(false);
    setIsCoursesOpen(false);
    navigateWithLoading(linkPath);
  };

  const closeAllMenus = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
    setIsInternshipOpen(false);
    setIsCoursesOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('#profile-menu-container')) {
        setIsProfileOpen(false);
      }
      if (isNotifOpen && !event.target.closest('#notif-menu-container') && !event.target.closest('#mobile-notif-menu-container')) {
        setIsNotifOpen(false);
      }
      if (isInternshipOpen && internshipDropdownRef.current && !internshipDropdownRef.current.contains(event.target)) {
        setIsInternshipOpen(false);
      }
      if (isCoursesOpen && coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setIsCoursesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, isNotifOpen, isInternshipOpen, isCoursesOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isUserLoggedIn = auth && auth.token && auth.user?.role === 'user';

  const internshipCategories = [
    { name: 'All Internships', path: '/internship' },
    { name: 'Full Stack Web Development', path: '/internship?category=Web' },
    { name: 'AI & Machine Learning', path: '/internship?category=AIML' },
    { name: 'Python & Django Development', path: '/internship?category=Python' },
    { name: 'Data Science & Analytics', path: '/internship?category=Data+Science' },
    { name: 'Android App Development', path: '/internship?category=Android' },
    { name: 'Cyber Security & Ethical Hacking', path: '/internship?category=Cyber' },
  ];

  const courseCategories = [
    { name: 'All Courses', path: '/courses' },
    { name: 'MERN Stack Development', path: '/courses?category=MERN' },
    { name: 'Python Full Stack Mastery', path: '/courses?category=Python' },
    { name: 'Java & Spring Boot', path: '/courses?category=Java' },
    { name: 'Database & SQL Engineering', path: '/courses?category=SQL' },
    { name: 'Cloud Computing & DevOps', path: '/courses?category=Cloud' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-transform duration-300 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      {/* ── TOP ACCENT LINE ─────────────────────────────────────────────────── */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-[#0052A3] via-[#0066FF] to-[#FF7A1A]" />

      <div className="max-w-8xl mx-auto w-full flex justify-between items-center px-4 sm:px-6 lg:px-8 py-2.5">
        
        {/* ── LEFT: Logo & Divider ──────────────────────────────────────────── */}
        <div className="flex items-center">
          <Logo />
          <div className="h-6 w-[1px] bg-slate-200 ml-4 mr-2 hidden xl:block" />
        </div>

        {/* ── CENTER: Modern Nav Links with Icons ───────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* 1. Home */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleNavClick('Home', '/')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive('/') 
                  ? 'bg-[#EBF3FE] text-[#0052A3] shadow-xs' 
                  : 'text-slate-600 hover:text-[#0052A3] hover:bg-slate-50'
              }`}
            >
              <Home className={`w-3.5 h-3.5 ${isActive('/') ? 'text-[#0052A3] fill-current' : 'text-slate-500'}`} />
              <span>Home</span>
            </button>
            {isActive('/') && (
              <div className="w-6 h-[2px] bg-[#0052A3] rounded-full mt-0.5" />
            )}
          </div>

          {/* 2. Internships (with Dropdown) */}
          <div 
            className="relative" 
            ref={internshipDropdownRef}
            onMouseEnter={() => setIsInternshipOpen(true)}
            onMouseLeave={() => setIsInternshipOpen(false)}
          >
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleNavClick('Internships', '/internship')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive('/internship') 
                    ? 'bg-[#EBF3FE] text-[#0052A3] shadow-xs' 
                    : 'text-slate-600 hover:text-[#0052A3] hover:bg-slate-50'
                }`}
              >
                <Briefcase className={`w-3.5 h-3.5 ${isActive('/internship') ? 'text-[#0052A3]' : 'text-slate-500'}`} />
                <span>Internships</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isInternshipOpen ? 'rotate-180 text-[#0052A3]' : ''}`} />
              </button>
              {isActive('/internship') && (
                <div className="w-6 h-[2px] bg-[#0052A3] rounded-full mt-0.5" />
              )}
            </div>

            {/* Dropdown Menu */}
            {isInternshipOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-100 py-2.5 z-50 animate-fadeIn">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Browse by Domain
                </div>
                {internshipCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavClick(cat.name, cat.path)}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0052A3] transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3 h-3 text-[#0052A3] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Courses (with Dropdown) */}
          <div 
            className="relative" 
            ref={coursesDropdownRef}
            onMouseEnter={() => setIsCoursesOpen(true)}
            onMouseLeave={() => setIsCoursesOpen(false)}
          >
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleNavClick('Courses', '/courses')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive('/courses') 
                    ? 'bg-[#EBF3FE] text-[#0052A3] shadow-xs' 
                    : 'text-slate-600 hover:text-[#0052A3] hover:bg-slate-50'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${isActive('/courses') ? 'text-[#0052A3]' : 'text-slate-500'}`} />
                <span>Courses</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isCoursesOpen ? 'rotate-180 text-[#0052A3]' : ''}`} />
              </button>
              {isActive('/courses') && (
                <div className="w-6 h-[2px] bg-[#0052A3] rounded-full mt-0.5" />
              )}
            </div>

            {/* Dropdown Menu */}
            {isCoursesOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-100 py-2.5 z-50 animate-fadeIn">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Featured Programs
                </div>
                {courseCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavClick(cat.name, cat.path)}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0052A3] transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3 h-3 text-[#0052A3] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Training */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleNavClick('Training', '/training')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive('/training') 
                  ? 'bg-[#EBF3FE] text-[#0052A3] shadow-xs' 
                  : 'text-slate-600 hover:text-[#0052A3] hover:bg-slate-50'
              }`}
            >
              <BarChart2 className={`w-3.5 h-3.5 ${isActive('/training') ? 'text-[#0052A3]' : 'text-slate-500'}`} />
              <span>Training</span>
            </button>
            {isActive('/training') && (
              <div className="w-6 h-[2px] bg-[#0052A3] rounded-full mt-0.5" />
            )}
          </div>

          {/* 5. Jobs */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleNavClick('Jobs', '/jobs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive('/jobs') 
                  ? 'bg-[#EBF3FE] text-[#0052A3] shadow-xs' 
                  : 'text-slate-600 hover:text-[#0052A3] hover:bg-slate-50'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${isActive('/jobs') ? 'text-[#0052A3]' : 'text-slate-500'}`} />
              <span>Jobs</span>
            </button>
            {isActive('/jobs') && (
              <div className="w-6 h-[2px] bg-[#0052A3] rounded-full mt-0.5" />
            )}
          </div>

          {/* 6. Contact */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleNavClick('Contact', '/contact')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive('/contact') 
                  ? 'bg-[#EBF3FE] text-[#0052A3] shadow-xs' 
                  : 'text-slate-600 hover:text-[#0052A3] hover:bg-slate-50'
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${isActive('/contact') ? 'text-[#0052A3]' : 'text-slate-500'}`} />
              <span>Contact</span>
            </button>
            {isActive('/contact') && (
              <div className="w-6 h-[2px] bg-[#0052A3] rounded-full mt-0.5" />
            )}
          </div>
        </nav>

        {/* ── RIGHT: Cart, Candidate Widget / Auth / Profile ────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Candidate Profile Widget: Exclusively on Dedicated Job Details Pages for Guests */}
          {isJobDetailsPage && !isUserLoggedIn ? (
            <div className="hidden lg:flex items-center gap-2.5 bg-gray-50 border border-gray-200/90 rounded-xl p-1.5 pr-3 shadow-2xs">
              <div className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xs ${
                candidateProfile?.completedInternships?.length > 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {candidateProfile?.profilePicture ? (
                  <img
                    src={candidateProfile.profilePicture}
                    alt={candidateProfile.name || 'Candidate'}
                    className="w-full h-full object-cover"
                  />
                ) : candidateProfile?.completedInternships?.length > 0 ? (
                  <Award className="w-4 h-4 text-emerald-600" />
                ) : (
                  <UserCheck className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-gray-800">{candidateProfile?.name || 'Candidate'}</p>
                <p className="text-[10px] text-gray-500 truncate max-w-[130px] flex items-center gap-1 font-medium">
                  <span>Profile:</span>
                  <span className={`font-bold ${candidateCompletion === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {candidateCompletion}%
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-candidate-profile-modal'));
                }}
                className="ml-2 text-xs font-semibold text-orange-600 hover:text-orange-700 underline focus:outline-none cursor-pointer"
              >
                Edit
              </button>
            </div>
          ) : null}

          {/* Shopping Cart Button */}
          <button
            onClick={() => handleNavClick('Cart', '/cart')}
            aria-label="View Cart"
            className="p-2 relative text-slate-700 hover:text-[#0052A3] hover:bg-slate-100/70 rounded-full transition-colors focus:outline-none cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            <span className="absolute -top-0.5 -right-0.5 bg-[#0066FF] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {cart?.length || 0}
            </span>
          </button>

          {isUserLoggedIn ? (
            <div className="hidden lg:flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative" id="notif-menu-container">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  aria-label="Notifications"
                  className="p-2 relative text-slate-600 hover:text-[#0052A3] hover:bg-slate-100/70 rounded-full transition-colors focus:outline-none cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl py-2 z-50 border border-slate-100 max-h-96 overflow-y-auto">
                    <h3 className="px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Notifications
                    </h3>
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          className={`px-4 py-3 border-b border-slate-50 hover:bg-blue-50/50 cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                          onClick={() => {
                            if (!notif.isRead) markAsRead(notif._id);
                            setIsNotifOpen(false);
                            if (notif.link) navigate(notif.link);
                          }}
                        >
                          <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-xs text-slate-500 text-center">No notifications yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <div className="relative" id="profile-menu-container">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
                >
                  {(auth.user?.profilePicture && !imageError) ? (
                    <img 
                      src={getImageUrl(auth.user.profilePicture)} 
                      alt="Profile" 
                      className="h-7 w-7 rounded-full object-cover border border-slate-200"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <UserCircle2 className="h-6 w-6 text-[#0052A3]" />
                  )}
                  <span className="text-xs font-bold text-slate-800">
                    {auth.user?.fullName ? auth.user.fullName.split(' ')[0] : 'Profile'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl py-1.5 z-50 border border-slate-100">
                    <Link
                      to="/user/mycourse"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0052A3] transition-colors"
                    >
                      My Dashboard
                    </Link>
                    <Link
                      to="/user/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0052A3] transition-colors"
                    >
                      My Profile
                    </Link>
                    <div className="h-[1px] bg-slate-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : !isJobDetailsPage ? (
            /* Login & Register Buttons (Modern Pill Style) */
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full border border-[#0052A3] text-[#0052A3] hover:bg-blue-50/80 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-[#0052A3]" />
                <span>Login</span>
              </Link>

              <Link
                to="/register"
                className="px-5 py-1.5 rounded-full bg-gradient-to-r from-[#0052A3] to-[#0066FF] hover:from-[#004080] hover:to-[#0052cc] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : null}

          {/* Mobile Candidate Profile button on job details page */}
          {isJobDetailsPage && !isUserLoggedIn && (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-candidate-profile-modal'));
              }}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 cursor-pointer"
            >
              {candidateProfile?.profilePicture ? (
                <img
                  src={candidateProfile.profilePicture}
                  alt={candidateProfile.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span>{candidateProfile?.name ? candidateProfile.name.split(' ')[0] : 'Profile'}</span>
            </button>
          )}

          {/* Mobile Notification for logged in user */}
          {isUserLoggedIn && (
            <div className="lg:hidden relative" id="mobile-notif-menu-container">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 relative text-slate-600 hover:text-[#0052A3] transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl py-2 z-50 border border-slate-100 max-h-96 overflow-y-auto">
                  <h3 className="px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Notifications
                  </h3>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        className={`px-4 py-3 border-b border-slate-50 hover:bg-blue-50/50 cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                        onClick={() => {
                          if (!notif.isRead) markAsRead(notif._id);
                          setIsNotifOpen(false);
                          if (notif.link) navigateWithLoading(notif.link);
                        }}
                      >
                        <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-xs text-slate-500 text-center">No notifications yet</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER MENU ──────────────────────────────────────────────── */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 shadow-xl animate-fadeIn">
          <div className="space-y-1">
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Home', '/'); }}
              className={`flex items-center gap-2.5 w-full text-left py-2.5 px-3.5 rounded-xl font-semibold text-sm transition-colors ${
                isActive('/') ? 'bg-[#EBF3FE] text-[#0052A3]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Internships', '/internship'); }}
              className={`flex items-center gap-2.5 w-full text-left py-2.5 px-3.5 rounded-xl font-semibold text-sm transition-colors ${
                isActive('/internship') ? 'bg-[#EBF3FE] text-[#0052A3]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Internships</span>
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Courses', '/courses'); }}
              className={`flex items-center gap-2.5 w-full text-left py-2.5 px-3.5 rounded-xl font-semibold text-sm transition-colors ${
                isActive('/courses') ? 'bg-[#EBF3FE] text-[#0052A3]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Courses</span>
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Training', '/training'); }}
              className={`flex items-center gap-2.5 w-full text-left py-2.5 px-3.5 rounded-xl font-semibold text-sm transition-colors ${
                isActive('/training') ? 'bg-[#EBF3FE] text-[#0052A3]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Training</span>
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Jobs', '/jobs'); }}
              className={`flex items-center gap-2.5 w-full text-left py-2.5 px-3.5 rounded-xl font-semibold text-sm transition-colors ${
                isActive('/jobs') ? 'bg-[#EBF3FE] text-[#0052A3]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Jobs</span>
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Contact', '/contact'); }}
              className={`flex items-center gap-2.5 w-full text-left py-2.5 px-3.5 rounded-xl font-semibold text-sm transition-colors ${
                isActive('/contact') ? 'bg-[#EBF3FE] text-[#0052A3]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact</span>
            </button>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100">
            {isUserLoggedIn ? (
              <div className="flex items-center justify-between px-2">
                <Link
                  to="/user/mycourse"
                  onClick={closeAllMenus}
                  className="text-sm font-bold text-[#0052A3] hover:underline"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : isJobDetailsPage ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3 p-3 bg-orange-50/80 border border-orange-200 rounded-xl">
                  <div className={`w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 ${
                    candidateProfile?.completedInternships?.length > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {candidateProfile?.profilePicture ? (
                      <img
                        src={candidateProfile.profilePicture}
                        alt={candidateProfile.name || 'Candidate'}
                        className="w-full h-full object-cover"
                      />
                    ) : candidateProfile?.completedInternships?.length > 0 ? (
                      <Award className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-gray-900 truncate">{candidateProfile?.name || 'Candidate'}</p>
                    <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 font-medium">
                      <span>Profile:</span>
                      <span className={`font-bold ${candidateCompletion === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {candidateCompletion}%
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    closeAllMenus();
                    window.dispatchEvent(new CustomEvent('open-candidate-profile-modal'));
                  }}
                  className="block w-full text-center py-2 px-4 rounded-button bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors focus:outline-none"
                >
                  Edit Candidate Profile
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={closeAllMenus}
                  className="flex-1 py-2 text-center rounded-full border border-[#0052A3] text-[#0052A3] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-50 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={closeAllMenus}
                  className="flex-1 py-2 text-center rounded-full bg-gradient-to-r from-[#0052A3] to-[#0066FF] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;