import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Building2, Clock, CheckCircle2, AlertCircle, ExternalLink, Bookmark, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateSkillMatchMetrics, isSkillMatch } from '../utils/skillMatcher';
import { isJobApplied } from '../utils/appliedJobsService';
import { getRecommendedInternships } from '../utils/internshipRecommendations';
import toast from 'react-hot-toast';

export default function JobCard({ job, onSelect, userProfile }) {
  const jobId = job.id || job._id;

  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('internkatta_saved_jobs') || '[]');
      return saved.includes(jobId);
    } catch {
      return false;
    }
  });

  const [isApplied, setIsApplied] = useState(() => isJobApplied(jobId));

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('internkatta_saved_jobs') || '[]');
        setIsSaved(saved.includes(jobId));
      } catch {}
      setIsApplied(isJobApplied(jobId));
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('internkatta_saved_jobs_updated', handleSync);
    window.addEventListener('internkatta_applied_jobs_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('internkatta_saved_jobs_updated', handleSync);
      window.removeEventListener('internkatta_applied_jobs_updated', handleSync);
    };
  }, [jobId]);

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem('internkatta_saved_jobs') || '[]');
      let updated;
      if (saved.includes(jobId)) {
        updated = saved.filter((id) => id !== jobId);
        setIsSaved(false);
        toast.success(`Removed ${job.title || job.jobTitle || 'job'} from saved list`);
      } else {
        updated = [...saved, jobId];
        setIsSaved(true);
        toast.success(`Saved ${job.title || job.jobTitle || 'job'}!`);
      }
      localStorage.setItem('internkatta_saved_jobs', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('internkatta_saved_jobs_updated', { detail: updated }));
    } catch (err) {
      console.error(err);
    }
  };
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
      (c) => (job.required_internships || []).includes(c) || c.toLowerCase().includes((job.domain || '').toLowerCase())
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

  // Role & Skill-Based Internship Recommendation to Bridge Skill Gap
  const recommendedInternships = useMemo(() => {
    return getRecommendedInternships(job, userProfile, 1);
  }, [job, userProfile]);
  const primaryReco = recommendedInternships[0];

  return (
    <div className="group relative bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Meta Header: Single-line Flex Row */}
      <div>
        <div className="flex flex-row items-center justify-between w-full flex-nowrap gap-2 mb-3.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-100 min-w-0 truncate">
            {job.domain || 'Software & Web Development'}
          </span>

          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
            {isApplied && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] border font-bold bg-blue-50 text-blue-700 border-blue-200 shrink-0 shadow-2xs">
                <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
                Applied
              </span>
            )}

            {qualificationStatus && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] border flex-shrink-0 shrink-0 whitespace-nowrap ${qualificationStatus.color}`}>
                {qualificationStatus.type === 'qualified' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600 shrink-0" />
                )}
                <span className="whitespace-nowrap">{qualificationStatus.label}</span>
              </span>
            )}
          </div>
        </div>

        {/* Job Title & Company */}
        <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-1">
          {job.title || job.jobTitle}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-gray-700">{job.company || job.companyName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{job.posted || (job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently')}</span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
          {job.description || job.jobDescription}
        </p>

        {/* Key Info Pills */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Package / CTC</span>
            <span className="text-xs font-bold text-gray-800">{job.salary || job.package || 'Competitive'}</span>
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

      {/* Bottom Action Area: Save Job Outline Button + View Details Primary Button */}
      <div className="flex items-center gap-2 mt-2 w-full">
        <button
          type="button"
          onClick={handleToggleSave}
          title={isSaved ? "Remove from saved jobs" : "Save this job"}
          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0 ${
            isSaved
              ? 'bg-orange-50 border-orange-300 text-orange-600 shadow-2xs'
              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 shadow-2xs'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-orange-600 text-orange-600' : 'text-gray-500'}`} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <Link
          to={`/jobs/${job.id || job._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 group/btn shadow-xs hover:shadow-md cursor-pointer text-center min-w-0 ${
            isApplied
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-900 hover:bg-orange-600 text-white'
          }`}
        >
          <span className="truncate">{isApplied ? 'View Applied Position' : 'View Details & Check Eligibility'}</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
