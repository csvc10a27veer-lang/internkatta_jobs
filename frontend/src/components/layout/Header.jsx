import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import { Menu, X, UserCircle2, Bell, ShoppingCart, Award, UserCheck, Sparkles } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { CartContext } from '../../context/CartContext';
import Logo from '../ui/Logo';
import { trackNavLinkClick } from '../../utils/trackClick';
import { getImageUrl } from '../../utils/api';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
  // Main Jobs feed (/jobs, /jobs/, /job-portal, /careers) retains the original Cart, Login, Register buttons
  const isJobDetailsPage = (
    (location.pathname.startsWith('/jobs/') && location.pathname !== '/jobs' && location.pathname !== '/jobs/') ||
    (location.pathname.startsWith('/job-details/') && location.pathname !== '/job-details' && location.pathname !== '/job-details/')
  );

  // Candidate Profile State for Job Details Views
  const [candidateProfile, setCandidateProfile] = useState(() => {
    const saved = localStorage.getItem('internkatta_candidate_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      education: 'B.Tech in Computer Science',
      college: 'Pune University',
      gradYear: '2025',
      domain: 'Software Development',
      skills: ['React.js', 'JavaScript', 'Node.js', 'MongoDB', 'CSS3', 'HTML5', 'Git'],
      completedInternships: ['Full Stack Web Development Internship'],
      profilePicture: '',
      resumeName: ''
    };
  });

  // Sync candidate profile across tabs and window custom events
  useEffect(() => {
    const syncProfile = () => {
      const saved = localStorage.getItem('internkatta_candidate_profile');
      if (saved) {
        try {
          setCandidateProfile(JSON.parse(saved));
        } catch (e) {}
      }
    };

    const handleCustomUpdate = (e) => {
      if (e.detail) {
        setCandidateProfile(e.detail);
      } else {
        syncProfile();
      }
    };

    window.addEventListener('storage', syncProfile);
    window.addEventListener('internkatta_profile_updated', handleCustomUpdate);
    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('internkatta_profile_updated', handleCustomUpdate);
    };
  }, []);

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
    navigateWithLoading(linkPath);
  };

  const closeAllMenus = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('#profile-menu-container')) {
        setIsProfileOpen(false);
      }
      if (isNotifOpen && !event.target.closest('#notif-menu-container') && !event.target.closest('#mobile-notif-menu-container')) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, isNotifOpen]);

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

  return (
    // ✅ Added `relative` for absolute centering of nav links
    <header className={`bg-white shadow-sm sticky top-0 z-50 transition-transform duration-300 border-b border-border relative ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-8xl mx-auto w-full flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">

        {/* LEFT: Logo */}
        <Logo />

        {/* CENTER: Nav Links — absolute centered on large screens */}
        <div className="hidden lg:flex items-center space-x-8 text-body font-body font-medium absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => handleNavClick('Home', '/')}
            className={`transition-colors duration-300 focus:outline-none rounded ${
              isActive('/') ? 'text-[#FF8C42]' : 'text-text hover:text-[#FF7A1A]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('Internships', '/internship')}
            className={`transition-colors duration-300 focus:outline-none rounded ${
              isActive('/internship') ? 'text-[#FF8C42]' : 'text-text hover:text-[#FF7A1A]'
            }`}
          >
            Internships
          </button>
          <button
            onClick={() => handleNavClick('Courses', '/courses')}
            className={`transition-colors duration-300 focus:outline-none rounded ${
              isActive('/courses') ? 'text-[#FF8C42]' : 'text-text hover:text-[#FF7A1A]'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => handleNavClick('Training', '/training')}
            className={`transition-colors duration-300 focus:outline-none rounded ${
              isActive('/training') ? 'text-[#FF8C42]' : 'text-text hover:text-[#FF7A1A]'
            }`}
          >
            Training
          </button>
          <button
            onClick={() => handleNavClick('Jobs', '/jobs')}
            className={`transition-colors duration-300 focus:outline-none rounded relative ${
              isActive('/jobs') ? 'text-[#FF8C42] font-semibold' : 'text-text hover:text-[#FF7A1A]'
            }`}
          >
            <span>Jobs</span>
            <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold bg-orange-100 text-orange-600 rounded-full">AI</span>
          </button>
          <button
            onClick={() => handleNavClick('Contact', '/contact')}
            className={`transition-colors duration-300 focus:outline-none rounded ${
              isActive('/contact') ? 'text-[#FF8C42]' : 'text-text hover:text-[#FF7A1A]'
            }`}
          >
            Contact
          </button>
        </div>

        {/* RIGHT: Auth / Profile */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* Candidate Profile Widget: Exclusively on Dedicated Job Details Pages for Guests */}
          {isJobDetailsPage && !isUserLoggedIn ? (
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/90 rounded-xl p-1.5 pr-3 shadow-2xs">
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
                <p className="text-[10px] text-gray-500 truncate max-w-[130px]">
                  {candidateProfile?.completedInternships?.length > 0
                    ? '✓ Verified InternKatta Alum'
                    : `${candidateProfile?.skills?.length || 0} Skills Added`}
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
          ) : (
            <>
              {/* Cart Button */}
              <button
                onClick={() => handleNavClick('Cart', '/cart')}
                className="p-2 relative text-gray-500 hover:text-brand-blue transition-colors focus:outline-none"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart && cart.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cart.length > 99 ? '99+' : cart.length}
                  </span>
                )}
              </button>

              {isUserLoggedIn ? (
                <>
                  {/* Notification Bell */}
                  <div className="relative" id="notif-menu-container">
                    <button
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="p-2 relative text-gray-500 hover:text-brand-blue transition-colors focus:outline-none"
                    >
                      <Bell className="w-6 h-6" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-card shadow-lg py-2 z-50 border border-border max-h-96 overflow-y-auto">
                        <h3 className="px-4 py-2 font-bold text-gray-700 border-b border-border">Notifications</h3>
                        {notifications.length > 0 ? (
                          notifications.map(notif => (
                            <div 
                              key={notif._id} 
                              className={`px-4 py-3 border-b border-border hover:bg-gray-50 cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-indigo-50'}`}
                              onClick={() => {
                                if (!notif.isRead) markAsRead(notif._id);
                                setIsNotifOpen(false);
                                if (notif.link) navigate(notif.link);
                              }}
                            >
                              <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                            </div>
                          ))
                        ) : (
                          <p className="px-4 py-3 text-sm text-gray-500 text-center">No notifications yet</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Profile Menu */}
                  <div className="relative" id="profile-menu-container">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded"
                    >
                      {(auth.user?.profilePicture && !imageError) ? (
                        <img 
                          src={getImageUrl(auth.user.profilePicture)} 
                          alt="Profile" 
                          className="h-8 w-8 rounded-full object-cover border border-gray-200"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <UserCircle2 className="h-7 w-7 text-brand-blue" />
                      )}
                      <span className="font-semibold text-text">
                        {auth.user?.fullName ? auth.user.fullName.split(' ')[0] : 'Profile'}
                      </span>
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-card shadow-lg py-1 z-50 border border-border">
                        <Link
                          to="/user/mycourse"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-text hover:bg-surface transition-colors focus:outline-none focus:bg-surface"
                        >
                          My Dashboard
                        </Link>
                        <Link
                          to="/user/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-text hover:bg-surface transition-colors focus:outline-none focus:bg-surface"
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-surface transition-colors focus:outline-none focus:bg-surface"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 border border-border rounded-button text-brand-blue hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-brand-blue text-white rounded-button hover:bg-brand-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                  >
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center space-x-3 lg:hidden">
          {isJobDetailsPage && !isUserLoggedIn ? (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-candidate-profile-modal'));
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 cursor-pointer"
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
          ) : (
            <button
              onClick={() => handleNavClick('Cart', '/cart')}
              className="p-2 relative text-gray-500 hover:text-brand-blue transition-colors focus:outline-none"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart && cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cart.length > 99 ? '99+' : cart.length}
                </span>
              )}
            </button>
          )}

          {isUserLoggedIn && (
            <div className="relative" id="mobile-notif-menu-container">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 relative text-gray-500 hover:text-brand-blue transition-colors focus:outline-none"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-card shadow-lg py-2 z-50 border border-border max-h-96 overflow-y-auto">
                  <h3 className="px-4 py-2 font-bold text-gray-700 border-b border-border">Notifications</h3>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        className={`px-4 py-3 border-b border-border hover:bg-gray-50 cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-indigo-50'}`}
                        onClick={() => {
                          if (!notif.isRead) markAsRead(notif._id);
                          setIsNotifOpen(false);
                          if (notif.link) navigateWithLoading(notif.link);
                        }}
                      >
                        <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-500 text-center">No notifications yet</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none p-2 hover:bg-surface rounded-lg transition-colors focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} className="text-text" /> : <Menu size={24} className="text-text" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-border shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Home', '/'); }}
              className={`block w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors focus:outline-none focus:bg-surface ${
                isActive('/') ? 'text-[#FF8C42] font-semibold' : 'text-text'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Internships', '/internship'); }}
              className={`block w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors focus:outline-none focus:bg-surface ${
                isActive('/internship') ? 'text-[#FF8C42] font-semibold' : 'text-text'
              }`}
            >
              Internships
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Courses', '/courses'); }}
              className={`block w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors focus:outline-none focus:bg-surface ${
                isActive('/courses') ? 'text-[#FF8C42] font-semibold' : 'text-text'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Training', '/training'); }}
              className={`block w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors focus:outline-none focus:bg-surface ${
                isActive('/training') ? 'text-[#FF8C42] font-semibold' : 'text-text'
              }`}
            >
              Training
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Jobs', '/jobs'); }}
              className={`block w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors focus:outline-none focus:bg-surface ${
                isActive('/jobs') ? 'text-[#FF8C42] font-semibold' : 'text-text'
              }`}
            >
              Jobs (AI Platform)
            </button>
            <button
              onClick={() => { closeAllMenus(); handleNavClick('Contact', '/contact'); }}
              className={`block w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors focus:outline-none focus:bg-surface ${
                isActive('/contact') ? 'text-[#FF8C42] font-semibold' : 'text-text'
              }`}
            >
              Contact
            </button>

            <button
              onClick={() => { closeAllMenus(); handleNavClick('Cart', '/cart'); }}
              className={`flex justify-between items-center w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors focus:outline-none focus:bg-surface ${
                isActive('/cart') ? 'text-[#FF8C42] font-semibold' : 'text-text'
              }`}
            >
              <span>Cart</span>
              {cart && cart.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cart.length > 99 ? '99+' : cart.length}
                </span>
              )}
            </button>

            <hr className="my-3 border-border" />

            {isUserLoggedIn ? (
              <div className="space-y-1">
                <Link
                  to="/user/mycourse"
                  onClick={closeAllMenus}
                  className="block w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors font-semibold text-brand-blue focus:outline-none focus:bg-surface"
                >
                  My Dashboard
                </Link>
                <Link
                  to="/user/profile"
                  onClick={closeAllMenus}
                  className="block w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors text-text focus:outline-none focus:bg-surface"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-3 rounded-lg hover:bg-surface transition-colors text-red-600 focus:outline-none focus:bg-surface"
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
                    <p className="text-[11px] text-gray-500 truncate">
                      {candidateProfile?.completedInternships?.length > 0
                        ? '✓ Verified InternKatta Alum'
                        : `${candidateProfile?.skills?.length || 0} Skills Added`}
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
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={closeAllMenus}
                  className="block w-full text-center py-2 px-4 rounded-button border border-border text-brand-blue hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeAllMenus}
                  className="block w-full text-center py-2 px-4 rounded-button bg-brand-blue text-white hover:bg-brand-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                >
                  Register
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