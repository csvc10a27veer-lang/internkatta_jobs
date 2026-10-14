// src/components/JobNavbar.jsx
import React from 'react';
import { UserCheck, Sparkles, Search, Award, SlidersHorizontal } from 'lucide-react';

export default function JobNavbar({
  searchQuery,
  onSearchChange,
  userProfile,
  onOpenProfileModal,
  onToggleMobileFilters,
  activeFilterCount = 0
}) {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          
          {/* Left: AI Job Board Badge & Mobile Filter Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Filter Drawer Trigger */}
            <button
              onClick={onToggleMobileFilters}
              className="lg:hidden relative p-2 rounded-xl bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-700 transition-colors border border-gray-200 cursor-pointer"
              aria-label="Toggle Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* AI Job Board & Gating Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500/10 via-amber-500/15 to-orange-500/10 text-orange-700 border border-orange-200/80 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-orange-500 animate-pulse" />
                InternKatta AI Job Board & Gating
              </span>
            </div>
          </div>

          {/* Center: Search Input Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search jobs by title, skill, or company..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Right: Candidate Profile Status Card & Mobile Button */}
          <div className="shrink-0">
            {/* Desktop Profile Card */}
            <div className="hidden sm:flex items-center gap-3">
              {userProfile ? (
                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/90 rounded-xl p-1.5 pr-3 shadow-2xs">
                  <div className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center font-bold text-xs ${
                    userProfile.completedInternships?.length > 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {userProfile.profilePicture ? (
                      <img
                        src={userProfile.profilePicture}
                        alt={userProfile.name || 'Candidate'}
                        className="w-full h-full object-cover"
                      />
                    ) : userProfile.completedInternships?.length > 0 ? (
                      <Award className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-gray-800">{userProfile.name || 'Candidate'}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[130px]">
                      {userProfile.completedInternships?.length > 0
                        ? '✓ Verified InternKatta Alum'
                        : `${userProfile.skills?.length || 0} Skills Added`}
                    </p>
                  </div>
                  <button
                    onClick={onOpenProfileModal}
                    className="ml-2 text-xs font-semibold text-orange-600 hover:text-orange-700 underline focus:outline-none cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  Fill Intake Form
                </button>
              )}
            </div>

            {/* Mobile Profile Icon Button */}
            <button
              onClick={onOpenProfileModal}
              className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 cursor-pointer"
            >
              {userProfile?.profilePicture ? (
                <img
                  src={userProfile.profilePicture}
                  alt={userProfile.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span>{userProfile?.name ? userProfile.name.split(' ')[0] : 'Profile'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
