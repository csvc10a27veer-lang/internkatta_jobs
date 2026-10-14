// src/pages/JobDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ExternalLink, 
  BookOpen, 
  ShieldCheck, 
  ArrowLeft, 
  UserCheck, 
  Share2, 
  Check, 
  Layers,
  Award
} from 'lucide-react';
import { fetchJobs, checkEligibility, applyToJob, MOCK_JOBS } from '../api/client';
import { isSkillMatch } from '../utils/skillMatcher';
import EligibilityModal from '../components/EligibilityModal';
import SuccessModal from '../components/SuccessModal';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [applicationResult, setApplicationResult] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  // Candidate Profile State from localStorage
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('internkatta_candidate_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      education: 'B.Tech in Computer Science',
      college: 'Pune University',
      gradYear: '2025',
      domain: 'Software Development',
      skills: ['React.js', 'JavaScript', 'Node.js', 'MongoDB', 'CSS3', 'HTML5', 'Git'],
      completedInternships: ['Full Stack Web Development Internship']
    };
  });

  // Listen to profile updates from other tabs or modals
  useEffect(() => {
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem('internkatta_candidate_profile');
      if (saved) {
        try {
          setUserProfile(JSON.parse(saved));
        } catch (e) {}
      }
    };

    const handleCustomEvent = (e) => {
      if (e.detail) {
        setUserProfile(e.detail);
      } else {
        handleStorageUpdate();
      }
    };

    const handleOpenModal = () => setIsProfileModalOpen(true);

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('internkatta_profile_updated', handleCustomEvent);
    window.addEventListener('open-candidate-profile-modal', handleOpenModal);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('internkatta_profile_updated', handleCustomEvent);
      window.removeEventListener('open-candidate-profile-modal', handleOpenModal);
    };
  }, []);

  // Load Job details and evaluate eligibility
  useEffect(() => {
    let isMounted = true;
    const loadJobDetails = async () => {
      setLoading(true);
      try {
        const allJobs = await fetchJobs();
        const found = (allJobs || []).find((j) => j.id === id) || 
                      MOCK_JOBS.find((j) => j.id === id) || 
                      MOCK_JOBS[0];

        if (isMounted) {
          setJob(found);
          // Evaluate eligibility against current candidate profile
          const eligibility = await checkEligibility(
            userProfile?.email || 'user-1',
            found.id,
            userProfile
          );
          setEligibilityData(eligibility);
        }
      } catch (err) {
        console.error('Error loading job details:', err);
        if (isMounted) {
          const fallbackJob = MOCK_JOBS.find((j) => j.id === id) || MOCK_JOBS[0];
          setJob(fallbackJob);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadJobDetails();
    return () => {
      isMounted = false;
    };
  }, [id, userProfile]);

  // Save profile and re-run eligibility check
  const handleSaveProfile = async (newProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('internkatta_candidate_profile', JSON.stringify(newProfile));
    window.dispatchEvent(new CustomEvent('internkatta_profile_updated', { detail: newProfile }));
    toast.success('Candidate profile updated!');

    if (job) {
      const eligibility = await checkEligibility(
        newProfile.email || 'user-1',
        job.id,
        newProfile
      );
      setEligibilityData(eligibility);
    }
  };

  // Submit Application (State B)
  const handleApply = async () => {
    if (!job) return;
    setIsApplying(true);
    try {
      const result = await applyToJob(userProfile?.email || 'user-1', job.id, userProfile);
      setApplicationResult(result);
      setIsSuccessModalOpen(true);
      toast.success(`Successfully applied to ${job.title}!`);
    } catch (err) {
      toast.error('Application failed to submit. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const isEligible = eligibilityData?.is_eligible;
  const recos = eligibilityData?.recommended_internships || [];
  const matchScore = eligibilityData?.match_score ?? (isEligible ? 100 : 35);
  const matchedSkills = eligibilityData?.matched_skills || [];
  const missingSkills = eligibilityData?.missing_skills || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center animate-pulse space-y-4">
          <div className="w-12 h-12 bg-orange-200 rounded-2xl mx-auto flex items-center justify-center text-orange-600">
            <Briefcase className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-bold text-gray-700">Loading Job & Eligibility Details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-3xl p-8 max-w-md border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Opening Not Found</h2>
          <p className="text-xs text-gray-500 mb-6">The requested position may have been filled or relocated.</p>
          <Link
            to="/jobs"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Job Board</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-orange-50/20 text-gray-900 pb-24">
      <SEO
        title={`${job.title} at ${job.company} | InternKatta AI Jobs`}
        description={`Apply for ${job.title} at ${job.company}. Dynamic qualification gating and curated InternKatta skill recommendations.`}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Main Job Hero Header Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-150">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  {job.domain}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                  {job.type || 'Full-time'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1.5 font-bold text-gray-800">
                  <Building2 className="w-4 h-4 text-orange-500" /> {job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" /> {job.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" /> Posted {job.posted || 'Recently'}
                </span>
              </div>
            </div>

            {/* Quick CTC & Experience Highlight Box */}
            <div className="flex sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <div className="flex-1 lg:flex-none p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 min-w-[170px]">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Package / CTC</span>
                <span className="text-sm sm:text-base font-black text-emerald-700">{job.salary}</span>
              </div>
              <div className="flex-1 lg:flex-none p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 min-w-[170px]">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Experience Required</span>
                <span className="text-sm sm:text-base font-bold text-gray-800">{job.experience}</span>
              </div>
            </div>
          </div>

          {/* Candidate Profile Evaluation Bar */}
          <div className="mt-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                isEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {isEligible ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">
                    Candidate Match Score:
                  </span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                    isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {matchScore}% Match ({matchedSkills.length}/{job.skills?.length || 0} Skills)
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Profile: <strong>{userProfile?.name || 'Candidate'}</strong> ({userProfile?.education || 'Graduate'})
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
            >
              Update Candidate Intake Profile &rarr;
            </button>
          </div>
        </div>

        {/* 2-Column Job Body: Left Details & Right Gating Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2 Cols): Job Description & Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                Job Overview & Role Summary
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Key Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Key Qualifications & Requirements
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills with Candidate Match Status */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                Required Technical & Domain Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(job.skills || []).map((skill, idx) => {
                  const isMatched = matchedSkills.some((s) => isSkillMatch(s, skill));
                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isMatched
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold flex items-center gap-1.5'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {isMatched ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      )}
                      <span>{skill}</span>
                    </span>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (1 Col): Dynamic Gating & Prerequisite Recommendation Box */}
          <div className="lg:col-span-1 sticky top-20 space-y-6">
            <div className={`rounded-2xl border p-6 sm:p-7 shadow-xs space-y-4 ${
              isEligible ? 'bg-white border-emerald-200/90' : 'bg-red-50/80 border-red-300'
            }`}>
              
              {/* Header */}
              <div className={`flex items-start gap-3 pb-3 border-b ${
                isEligible ? 'border-emerald-100' : 'border-red-200'
              }`}>
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  isEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                }`}>
                  {isEligible ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`text-base font-bold leading-tight ${
                    isEligible ? 'text-emerald-950' : 'text-red-900'
                  }`}>
                    {isEligible 
                      ? 'Prerequisite Verification & Application' 
                      : 'Recommended Internship before applying'}
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${
                    isEligible ? 'text-gray-600' : 'text-red-700'
                  }`}>
                    {isEligible
                      ? 'Review your accredited InternKatta prerequisite status and submit your verified application below:'
                      : 'You need additional accredited skills or an approved domain internship to qualify for this role. Complete one of these InternKatta internships:'}
                  </p>
                </div>
              </div>

              {/* Recommended / Prerequisite Internships Cards List */}
              <div className="reco-cards-list space-y-3 my-4">
                {recos.map((c, i) => {
                  const isCompleted = (userProfile?.completedInternships || []).some(
                    (ci) => ci.toLowerCase() === c.title?.toLowerCase() || 
                            c.title?.toLowerCase().includes(ci.toLowerCase()) || 
                            ci.toLowerCase().includes(c.domain?.toLowerCase())
                  );

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        isCompleted
                          ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                          : 'bg-white border-red-200 shadow-2xs hover:border-orange-400 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-xs font-bold text-gray-900 truncate">{c.title}</h5>
                            {isCompleted && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-bold shrink-0">
                                Verified ✓
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                            {c.description || 'Industrial mentorship, real projects and ISO certification'}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-600 font-medium">
                            <span className="text-amber-600 font-bold">{c.rating || '4.9 ★'}</span>
                            <span>•</span>
                            <span>{c.duration || '2 Months'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action: Completed Status Badge OR Enroll Link */}
                      {isCompleted ? (
                        <div className="w-full py-2 px-3 bg-emerald-100/90 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Completed & Verified ✓</span>
                        </div>
                      ) : (
                        <a
                          href={c.url || '/internship'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="reco-item w-full py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <span>Enroll & Qualify</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action / Gating Submission Section */}
              <div className="pt-2">
                {isEligible ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleApply}
                      disabled={isApplying}
                      className="btn-active-green w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span>
                        {isApplying
                          ? 'Submitting Application...'
                          : 'Candidate Verified & Eligible! - APPLY NOW (Internship Completed & Verified)'}
                      </span>
                    </button>
                    <p className="text-center text-[11px] text-gray-500">
                      Your verified resume and credentials will be forwarded directly to the hiring managers at <strong>{job.company}</strong>.
                    </p>
                  </div>
                ) : (
                  <div>
                    <button disabled className="btn-locked w-full py-2.5 px-4 bg-gray-150 text-gray-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-not-allowed border border-gray-200">
                      <Lock className="w-4 h-4" />
                      <span>APPLY NOW (LOCKED - COMPLETE INTERNSHIP)</span>
                    </button>
                    <p className="text-center text-[10px] text-gray-500 mt-2">
                      Completing an accredited InternKatta internship verifies your portfolio and automatically unlocks direct applying.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Candidate Intake Modal */}
      <EligibilityModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Application Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        job={job}
        applicationData={applicationResult}
        userProfile={userProfile}
      />
    </div>
  );
}
