// frontend/src/components/layout/UserLayout.jsx

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Header from './Header'; // This component will show the user's name
import Footer from './Footer';
import { Menu, X, BookOpen, User, Award, Briefcase, FileText, FileCheck, LogOut } from 'lucide-react';
import { useUserAuth } from '../../context/UserAuthContext'; // Import useUserAuth
import { Toaster } from 'react-hot-toast';

const UserLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useUserAuth(); // Get the logout function from user context

  const handleLogout = () => {
    logout(); // Use the context's logout function
    navigate('/'); // Redirect to homepage after logout
  };

  const navItems = [
    { name: 'My Courses', path: '/user/mycourse', icon: BookOpen },
    { name: 'Profile', path: '/user/profile', icon: User },
    { name: 'Certificate', path: '/user/certificate', icon: Award },
    { name: 'Internship', path: '/user/internship', icon: Briefcase },
    { name: 'Offer Letter', path: '/user/offerletter', icon: FileText },
    { name: 'Internship Letter', path: '/user/internshipletter', icon: FileCheck },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="bg-gray-50 user-dashboard-theme">
      {/* This Header will now be dynamic */}
      <Header /> 
      <div className="flex min-h-screen">
        {/* --- Sidebar (No changes needed in the JSX below) --- */}
        {sidebarOpen && (
          <div
            onClick={closeSidebar}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            aria-hidden="true"
          ></div>
        )}
        <aside
          className={`
            fixed top-24 left-0 bottom-0 bg-white shadow-xl w-64 z-30
            flex flex-col justify-between
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            border-r border-gray-200
          `}
        >
          <div>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-blue-600">Dashboard</h2>
              <button onClick={closeSidebar} className="text-gray-500 md:hidden hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1 px-4">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                        ? 'bg-[#0052A3] text-white shadow-md'
                        : 'text-gray-700 hover:bg-[#0052A3] hover:text-white'
                      }`
                    }
                  >
                    <IconComponent size={20} />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-colors shadow-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* --- Main Content (No changes needed here) --- */}
        <div className="flex-1 flex flex-col md:ml-64">
          <div className="md:hidden sticky top-0 flex items-center justify-between px-4 py-3 bg-white shadow-sm z-10">
            <span className="text-xl font-semibold">
              <span className="text-blue-600">Intern</span>
              <span className="text-[#FF8C42]">Katta</span>
            </span>
            <button onClick={() => setSidebarOpen(true)} className="text-blue-600 hover:text-blue-700 transition-colors">
              <Menu size={24} />
            </button>
          </div>
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50">
            <Outlet />
          </main>
          <Footer />
        </div>
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

export default UserLayout;