// src/components/JobCard.jsx
import React from 'react';
import { MapPin, Building2, Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateSkillMatchMetrics, isSkillMatch } from '../utils/skillMatcher';

export default function JobCard({ job, onSelect, userProfile }) {
  // Quick preview of qualification match if profile is filled
  let qualificationStatus = null;
  let matchedSkillsList = [];

  if (userProfile?.skills && userProfile.skills.length > 0) {
    const {
      matchedSkills,
      matchedCount,
      totalSkillsCount,
      matchPercentage
    } = calculateSkillMatchMetrics(userProfile.skills, job.skills || []);

    matchedSkillsList = matchedSkills;

    const hasInternship = (userProfile.completedInternships || []).some(
      (c) => (job.required_internships || []).includes(c) || c.toLowerCase().includes(job.domain.toLowerCase())
    );
    
    const isEligible = Boolean(
      hasInternship || 
      userProfile.isEligibleOverride || 
      (matchPercentage >= 50 && matchedCount >= 2) || 
      matchedCount >= 3
    );

    if (matchedCount > 0) {
      if (isEligible) {
        qualificationStatus = { 
          type: 'qualified', 
          label: `Likely Eligible (${matchPercentage}% Match)`, 
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' 
        };
      } else {
        qualificationStatus = { 
          type: 'underqualified', 
          label: `Internship Recommended (${matchPercentage}% Match)`, 
          color: 'bg-amber-50 text-amber-800 border-amber-300 font-bold' 
        };
      }
    } else {
      // Zero skill matches: Show only "Internship Recommended" without percentage
      qualificationStatus = { 
        type: 'underqualified', 
        label: 'Internship Recommended', 
        color: 'bg-amber-50 text-amber-800 border-amber-300 font-bold' 
      };
    }
  }

  return (
    <div className="group relative bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Meta Header: Single-line Flex Row */}
      <div>
        <div className="flex items-center justify-between gap-2 flex-nowrap mb-3.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100 shrink-0 whitespace-nowrap">
            {job.domain}
          </span>

          {qualificationStatus && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] sm:text-[11px] border shrink-0 whitespace-nowrap ${qualificationStatus.color}`}>
              {qualificationStatus.type === 'qualified' ? (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600 shrink-0" />
              )}
              <span>{qualificationStatus.label}</span>
            </span>
          )}
        </div>

        {/* Job Title & Company */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1.5 line-clamp-1">
          {job.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-gray-700">{job.company}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{job.posted || 'Recently'}</span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
          {job.description}
        </p>

        {/* Key Info Pills */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Package / CTC</span>
            <span className="text-xs font-bold text-gray-800">{job.salary}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Experience</span>
            <span className="text-xs font-bold text-gray-800">{job.experience}</span>
          </div>
        </div>

        {/* Skills List */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(job.skills || []).slice(0, 5).map((skill, idx) => {
            const isSkillMatched = matchedSkillsList.some(
              (ms) => isSkillMatch(ms, skill)
            );
            return (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  isSkillMatched
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                    : 'bg-gray-100 text-gray-600 border-transparent'
                }`}
              >
                {isSkillMatched ? `✓ ${skill}` : skill}
              </span>
            );
          })}
          {(job.skills || []).length > 5 && (
            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[11px] font-medium border border-gray-200">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Action Button: Opens Dedicated Job Details Page in New Tab */}
      <Link
        to={`/jobs/${job.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full mt-2 py-2.5 px-4 bg-gray-900 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 group/btn shadow-xs hover:shadow-md cursor-pointer"
      >
        <span>View Details & Check Eligibility</span>
        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
