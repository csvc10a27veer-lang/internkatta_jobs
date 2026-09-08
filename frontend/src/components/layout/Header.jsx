import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import { Menu, X, UserCircle2, Bell, ShoppingCart } from 'lucide-react';
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
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center space-x-3 lg:hidden">
          {/* Cart Button (Mobile/Tablet) */}
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