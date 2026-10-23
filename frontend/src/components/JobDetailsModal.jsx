// src/components/JobDetailsModal.jsx (Core Gating Logic)
import React, { useState, useEffect, useMemo } from 'react';
import { X, Building2, MapPin, IndianRupee, Clock, CheckCircle2, AlertTriangle, Lock, ExternalLink, Sparkles, BookOpen, ShieldCheck, Bookmark, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSkillMatch } from '../utils/skillMatcher';
import { isJobApplied, markJobAsApplied } from '../utils/appliedJobsService';
import { getRecommendedInternships } from '../utils/internshipRecommendations';
import toast from 'react-hot-toast';

export default function JobDetailsModal({
  job,
  eligibility,
  onApplySuccess,
  onClose,
  onOpenIntakeModal,
  userProfile
}) {
  if (!job) return null;

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

  const isEligible = eligibility?.is_eligible;
  const engineRecos = useMemo(() => getRecommendedInternships(job, userProfile, 2), [job, userProfile]);
  const recos = (engineRecos && engineRecos.length > 0) ? engineRecos : (eligibility?.recommended_internships || []);
  const matchScore = eligibility?.match_score ?? (isEligible ? 100 : 35);
  const missingSkills = eligibility?.missing_skills || [];
  const matchedSkills = eligibility?.matched_skills || [];

  const handleApplyClick = () => {
    markJobAsApplied(jobId);
    setIsApplied(true);
    onApplySuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-150 overflow-hidden my-8 modal-card">
        
        {/* Header with Close & Upper Save Button */}
        <div className="p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative">
          <div className="absolute top-5 right-5 flex items-center gap-2">
            {/* Discrete Outlined Save Button in Upper Section */}
            <button
              type="button"
              onClick={handleToggleSave}
              title={isSaved ? "Remove from saved jobs" : "Save this job"}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
                isSaved
                  ? 'bg-orange-500/20 border-orange-400 text-orange-200'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-orange-400 text-orange-400' : 'text-white'}`} />
              <span>{isSaved ? 'Saved Job' : 'Save Job'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500 text-white">
              {job.domain}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-gray-200">
              {job.type || 'Full-time'}
            </span>
          </div>

          <h2 className="text-2xl font-black text-white mb-2 leading-tight">{job.title}</h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300 company">
            <span className="flex items-center gap-1.5 font-medium text-orange-300">
              <Building2 className="w-4 h-4" /> {job.company}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" /> {job.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-400" /> {job.salary}
            </span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          
          {/* Job Overview */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Job Description</h4>
            <p className="text-sm text-gray-700 leading-relaxed description whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Key Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key Requirements</h4>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Required */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {(job.skills || []).map((skill, idx) => {
                const isMatched = matchedSkills.some((s) => isSkillMatch(s, skill));
                return (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      isMatched
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 flex items-center gap-1'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {isMatched && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Candidate Profile Evaluation Bar */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">Candidate Profile Evaluation:</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                  isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {matchScore}% Match
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Evaluating candidate: <strong>{userProfile?.name || 'Default Candidate'}</strong>
              </p>
            </div>
            {onOpenIntakeModal && (
              <button
                type="button"
                onClick={onOpenIntakeModal}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline focus:outline-none cursor-pointer"
              >
                Update / Switch Candidate Intake Profile &rarr;
              </button>
            )}
          </div>

          {/* --- DYNAMIC GATING SECTION --- */}

          {/* STATE A: UNDERQUALIFIED - SHOW RECOMMENDATION CARD */}
          {!isEligible && (
            <div className="reco-alert-box animate-fade-in">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-red-900 leading-tight">
                    Recommended Internship before applying
                  </h4>
                  <p className="text-xs text-red-700 mt-1">
                    You need additional verified skills or an accredited domain internship to qualify for this role. Complete one of these InternKatta internships to unlock this job:
                  </p>
                </div>
              </div>

              {/* Recommended Internships List */}
              <div className="reco-cards-list space-y-2.5 my-4">
                {recos.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-row items-center justify-between w-full p-3 bg-orange-50 border border-orange-200 rounded-lg"
                  >
                    <div className="flex flex-col gap-1 min-w-0 pr-2">
                      <span className="text-xs font-bold text-orange-700 uppercase flex items-center gap-1">
                        <Sparkles size={14} className="text-orange-600 shrink-0" />
                        BRIDGE SKILL GAP
                      </span>
                      <span className="text-sm font-bold text-slate-900 whitespace-normal break-words" title={c.title}>
                        {c.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.open(c.url || `/internship?search=${encodeURIComponent(c.title || '')}`, '_blank', 'noopener,noreferrer')}
                      className="bg-[#f04e0e] hover:bg-[#d6450c] text-white px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                    >
                      Enroll <ArrowUpRight size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Locked Button */}
              <div className="mt-4">
                <button disabled className="btn-locked flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>APPLY NOW (LOCKED - COMPLETE INTERNSHIP)</span>
                </button>
                <p className="text-center text-[11px] text-gray-500 mt-2">
                  Complete any recommended InternKatta internship to automatically unlock application access for this partner employer.
                </p>
              </div>
            </div>
          )}

          {/* STATE B: QUALIFIED OR COMPLETED - ENABLE APPLICATION */}
          {isEligible && (
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fade-in space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-900">
                    Candidate Verified & Eligible!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Your credentials, skill profile, and completed InternKatta certifications match all requirements for this position.
                  </p>
                </div>
              </div>

              {isApplied ? (
                <div className="w-full py-3 px-4 bg-emerald-100 text-emerald-900 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>Application Submitted & Verified ✓</span>
                </div>
              ) : (
                <button
                  onClick={handleApplyClick}
                  className="btn-active-green flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 text-base cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>APPLY NOW (Internship Completed & Verified)</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-150 flex items-center justify-between text-xs text-gray-500">
          <span>Powered by InternKatta Intelligent Career Gating System</span>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 font-semibold cursor-pointer">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
