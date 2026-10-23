import React from 'react';
import { UserCheck, Search, Award, SlidersHorizontal, X } from 'lucide-react';
import { calculateProfileCompletion } from '../utils/skillMatcher';
import { useCandidateProfile } from '../context/CandidateProfileContext';

export default function JobNavbar({
  searchQuery,
  onSearchChange,
  userProfile: propUserProfile,
  onOpenProfileModal,
  onToggleMobileFilters,
  activeFilterCount = 0
}) {
  const { candidateProfile: ctxProfile, completionPercentage: ctxCompletion, openProfileModal: ctxOpenModal } = useCandidateProfile();
  const userProfile = propUserProfile || ctxProfile;
  const completion = ctxCompletion !== undefined ? ctxCompletion : calculateProfileCompletion(userProfile);
  const handleOpenModal = onOpenProfileModal || ctxOpenModal;

  return (
    <div className="pt-2 sm:pt-3 pb-1 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1360px] mx-auto">
        <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] shadow-xl min-h-[160px] sm:min-h-[175px] md:min-h-[190px] flex flex-col justify-center items-center px-4 py-4 sm:px-8 sm:py-5 md:px-10 md:py-5.5 border border-white/15 bg-[#060c18]">
          
          {/* Background Image: Modern Corporate Tech Headquarters & Careers Setting */}
          <img 
            src="/jobs-banner.jpg" 
            alt="Modern corporate tech headquarters and career opportunities"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />

          {/* Translucent Soft Dark Overlays */}
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-slate-950/40 to-black/75 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-transparent to-blue-950/40 pointer-events-none" />

          {/* Center Content: Heading, Subtitle, Search */}
          <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center w-full">
            
            {/* Main Heading: "InternKatta Job Board" with Color Split */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-black tracking-tight text-white mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] leading-tight">
              InternKatta{' '}
              <span className="bg-gradient-to-r from-[#60a5fa] via-[#93c5fd] to-[#fb923c] bg-clip-text text-transparent">
                Job Board
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-white/90 font-normal max-w-xl mx-auto leading-normal mb-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] px-2">
              Find the perfect role based on your skills and verified InternKatta experience in a structured, fast-tracked way.
            </p>

            {/* Pill-Shaped Search Bar */}
            <div className="relative max-w-xl w-full mx-auto flex items-center bg-white rounded-full p-1 sm:p-1.5 shadow-2xl shadow-black/40 border border-white/20">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-3 mr-2 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search jobs by title, skills, or company..."
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-xs sm:text-sm focus:outline-none px-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 mr-1 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                type="button"
                onClick={() => {
                  const mainContent = document.getElementById('jobs-feed-list');
                  if (mainContent) mainContent.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#1877F2] hover:bg-[#1565C0] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md shrink-0 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Explore</span>
                <span>→</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
