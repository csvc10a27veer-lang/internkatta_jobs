// src/components/JobDetailsModal.jsx (Core Gating Logic)
import React from 'react';
import { X, Building2, MapPin, IndianRupee, Clock, CheckCircle2, AlertTriangle, Lock, ExternalLink, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSkillMatch } from '../utils/skillMatcher';

export default function JobDetailsModal({
  job,
  eligibility,
  onApplySuccess,
  onClose,
  onOpenIntakeModal,
  userProfile
}) {
  if (!job) return null;

  const isEligible = eligibility?.is_eligible;
  const recos = eligibility?.recommended_internships || [];
  const matchScore = eligibility?.match_score ?? (isEligible ? 100 : 35);
  const missingSkills = eligibility?.missing_skills || [];
  const matchedSkills = eligibility?.matched_skills || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-150 overflow-hidden my-8 modal-card">
        
        {/* Header with Close */}
        <div className="p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

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
                    className="p-3.5 bg-white rounded-xl border border-red-200 shadow-xs hover:border-orange-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-900">{c.title}</h5>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{c.description || 'Industrial internship with live project and ISO certificate'}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600 font-medium">
                          <span className="text-amber-600 font-bold">{c.rating || '4.9 ★'}</span>
                          <span>•</span>
                          <span>{c.duration || '2 Months'}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">{c.learners || 'Industry Recognized'}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={c.url || '/internship'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="reco-item shrink-0 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Enroll & Qualify</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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

              <button
                onClick={onApplySuccess}
                className="btn-active-green flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 text-base"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span>APPLY NOW (Internship Completed & Verified)</span>
              </button>
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
