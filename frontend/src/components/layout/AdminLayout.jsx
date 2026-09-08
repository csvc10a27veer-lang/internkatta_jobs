import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../utils/api';
import { Toaster } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import {
  Menu,
  BookOpenText,
  Users,
  History,
  ShoppingCart,
  LogOut,
  Briefcase,
  GraduationCap,
  UploadCloud,
  Trash2,
  Image,
  BarChart,
  Activity,
  MessageSquare,
  Bell,
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();
  const [unansweredCount, setUnansweredCount] = useState(0);
  
  const { notifications, unreadCount, markAsRead } = useSocket();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Check if we're on the edit internship page
  const isEditInternshipPage = location.pathname.includes('/edit-internship/');

  const handleLogout = () => {
    logout(); // This will clear admin auth from context and localStorage
    navigate('/admin/login');
  };

  useEffect(() => {
    const fetchUnansweredCount = async () => {
      try {
        const response = await api.get('/api/discussions/admin/unanswered-count');
        setUnansweredCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unanswered count:', error);
      }
    };
    fetchUnansweredCount();
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden h-screen w-64 flex-col overflow-hidden bg-white shadow-md md:flex">
        <div className="shrink-0 py-6 text-center text-xl font-bold text-blue-700">
          Admin Dashboard
        </div>
        <nav className="flex min-h-0 flex-1 flex-col space-y-2 overflow-y-auto px-4 pb-4">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold' : 'text-gray-600'
              }`
            }
          >
            <Activity size={20} /> Dashboard
          </NavLink>
          <NavLink
            to="manage-categories"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <BookOpenText size={20} /> Manage-Categories
          </NavLink>
          <NavLink
            to="manage-category-images"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <Image size={20} /> Add Images
          </NavLink>
          <NavLink
            to="addcourse"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <BookOpenText size={20} /> Add Course
          </NavLink>

          <NavLink
            to="managecourse"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <BookOpenText size={20} /> Manage Course
          </NavLink>

          <NavLink
            to="add-internship"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <Briefcase size={20} /> Add Internship
          </NavLink>

          <NavLink
            to="manage-internship"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <Briefcase size={20} /> Manage Internship
          </NavLink>
          <NavLink
            to="internship-submissions"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <Briefcase size={20} /> internship-submissions
          </NavLink>
          <NavLink
            to="internshipurchasedhistory"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <Briefcase size={20} /> Internship Purchased History
          </NavLink>

          <NavLink
            to="inquiry-history"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <History size={20} /> Inquiry History
          </NavLink>

          <NavLink
            to="qa"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 relative ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <MessageSquare size={20} /> Course Q&A
            {unansweredCount > 0 && (
              <span className="absolute right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unansweredCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="purchased-history"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <ShoppingCart size={20} /> Purchased History
          </NavLink>

          <NavLink
            to="user-history"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <Users size={20} /> User History
          </NavLink>

          <NavLink
            to="training-registrations"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <GraduationCap size={20} /> Training Registrations
          </NavLink>
          <NavLink
            to="recycle-bin"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <Trash2 size={20} /> Recycle Bin
          </NavLink>
          <NavLink
            to="site-analytics"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <BarChart size={20} /> Site Analytics
          </NavLink>
          <NavLink
            to="internship-learning-analytics"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            <Activity size={20} /> Learning Analytics
          </NavLink>
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-auto flex shrink-0 items-center gap-2 border-t border-gray-200 px-4 py-3 text-red-600 hover:bg-red-100"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between relative z-50">
          <div className="text-xl font-bold text-blue-900">
            <span>Intern</span><span className="text-[#FF8C42]">Katta</span> 
          </div>
          <div className="flex items-center gap-6">
            {isEditInternshipPage && (
              <button
                type="submit"
                form="edit-internship-form"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <UploadCloud size={20} />
                Update Internship
              </button>
            )}
            
            {/* Notification Bell */}
            <div className="relative cursor-pointer" id="admin-notif-container">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 relative text-gray-500 hover:text-blue-600 transition-colors focus:outline-none"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#6C5CE7] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200 max-h-96 overflow-y-auto">
                  <h3 className="px-4 py-2 font-bold text-gray-700 border-b border-gray-200">Notifications</h3>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-blue-50'}`}
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

            {/* Admin Profile */}
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] font-bold text-sm">
                A
              </div>
              <div className="hidden md:flex items-center gap-1 text-gray-700 font-medium text-sm">
                Admin
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            <button className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100">
              <Menu size={24} />
            </button>
          </div>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          <Outlet />
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </div>
  );
};

export default AdminLayout;
