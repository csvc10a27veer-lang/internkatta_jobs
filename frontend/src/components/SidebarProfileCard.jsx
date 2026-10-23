// src/components/SidebarProfileCard.jsx
import React from 'react';
import { useCandidateProfile } from '../context/CandidateProfileContext';
import { calculateProfileCompletion } from '../utils/skillMatcher';

export default function SidebarProfileCard({ userProfile: propUserProfile, onOpenProfileModal }) {
  const { candidateProfile: ctxProfile, completionPercentage: ctxCompletion, openProfileModal: ctxOpenModal } = useCandidateProfile();
  const userProfile = propUserProfile || ctxProfile;
  const completion = ctxCompletion !== undefined ? ctxCompletion : calculateProfileCompletion(userProfile);
  const handleOpen = onOpenProfileModal || ctxOpenModal;

  const displayName = userProfile?.name && userProfile.name !== 'Aarav Sharma'
    ? userProfile.name 
    : 'Aniket Rajendra Patil';

  // Candidate's actual Degree / Qualification fetched from profile state
  const qualification = userProfile?.education || userProfile?.degree || userProfile?.qualification || 'B.Tech in Computer Science';

  // Dynamic color logic based on live profile completion percentage:
  // 0% - 10%: Red
  // 11% - 99%: Yellow/Amber
  // Exactly 100%: Green
  const getColorClasses = (pct) => {
    if (pct <= 10) {
      return {
        border: 'border-red-500',
        bg: 'bg-red-500'
      };
    }
    if (pct < 100) {
      return {
        border: 'border-amber-500',
        bg: 'bg-amber-500'
      };
    }
    return {
      border: 'border-emerald-500',
      bg: 'bg-emerald-500'
    };
  };

  const statusColors = getColorClasses(completion);

  return (
    <div className="font-sans bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 mb-5 text-center">
      {/* Centered Circular Avatar with Dynamic Completion Ring */}
      <div className="relative inline-block mx-auto mb-3">
        <div className={`w-20 h-20 rounded-full border-[3px] ${statusColors.border} overflow-hidden flex items-center justify-center bg-slate-50 shadow-xs`}>
          {userProfile?.profilePicture ? (
            <img
              src={userProfile.profilePicture}
              alt={displayName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-lg">
              {displayName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
          )}
        </div>

        {/* Dynamic Percentage Badge */}
        <div 
          className={`absolute -bottom-1 -right-1 px-2 py-0.5 ${statusColors.bg} text-white text-[11px] font-black rounded-full shadow-xs border-2 border-white flex items-center justify-center`}
          title={`Profile Completion: ${completion}%`}
        >
          <span>{completion}%</span>
        </div>
      </div>

      {/* User Full Name */}
      <h4 className="font-sans font-semibold text-lg text-slate-900 leading-snug tracking-tight">
        {displayName}
      </h4>

      {/* Degree / Qualification */}
      <p className="font-sans font-normal text-sm text-slate-600 mt-1 leading-relaxed px-1 line-clamp-2">
        {qualification}
      </p>

      {/* Centered Inline "View profile" Button */}
      <div className="mt-3.5 flex justify-center">
        <button
          type="button"
          onClick={handleOpen}
          className="inline-block mx-auto px-5 py-1.5 bg-[#1877F2] hover:bg-[#1565C0] text-white rounded-full text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer"
        >
          <span>View profile</span>
        </button>
      </div>
    </div>
  );
}
