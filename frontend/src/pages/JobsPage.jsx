// src/pages/JobsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  Layers, 
  X, 
  RotateCcw, 
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import JobNavbar from '../components/JobNavbar';
import JobFilterSidebar from '../components/JobFilterSidebar';
import SidebarProfileCard from '../components/SidebarProfileCard';
import JobCard from '../components/JobCard';
import EligibilityModal from '../components/EligibilityModal';
import SuccessModal from '../components/SuccessModal';
import SEO from '../components/SEO';
import { fetchJobs, applyToJob, MOCK_JOBS } from '../api/client';
import { calculateSkillMatchMetrics, getMatchedSkills, calculateProfileCompletion } from '../utils/skillMatcher';
import api from '../utils/api';
import { useCandidateProfile } from '../context/CandidateProfileContext';
import { getAppliedJobIds } from '../utils/appliedJobsService';
import toast from 'react-hot-toast';

/**
 * Calculates a relevance match score and tier for a job against candidate profile skills
 */
const calculateJobRelevance = (job, profile) => {
  if (!profile || !profile.skills || profile.skills.length === 0) {
    return {
      score: job.featured ? 10 : 0,
      matchedCount: 0,
      matchPercentage: 0,
      isLikelyEligible: false,
      tier: 3
    };
  }

  // Exact Canonical Skill overlap calculation
  const {
    matchedSkills,
    matchedCount,
    matchPercentage
  } = calculateSkillMatchMetrics(profile.skills || [], job.skills || []);

  // Check verified completed InternKatta internships
  const completedInternships = profile.completedInternships || [];
  const hasMatchingInternship = (job.required_internships || []).some(
    (req) => completedInternships.includes(req) || completedInternships.some((c) => c.toLowerCase().includes(job.domain.toLowerCase()))
  );

  // Eligibility criteria: completed internship OR >= 50% skill match (with at least 2 skills) OR >= 3 matched skills
  const isLikelyEligible = Boolean(
    hasMatchingInternship || 
    profile.isEligibleOverride || 
    (matchedCount >= 2 && matchPercentage >= 50) || 
    matchedCount >= 3
  );

  // Tier 1: Likely Eligible (Top)
  // Tier 2: Partially Matched (1+ skill matches)
  // Tier 3: Skill Gap / Internship Recommended
  let tier = 3;
  if (isLikelyEligible) {
    tier = 1;
  } else if (matchedCount > 0) {
    tier = 2;
  }

  // Weight score: Tier priority + matched skill multiplier + percentage + featured bonus
  const score = ((4 - tier) * 1000) + (matchedCount * 40) + matchPercentage + (job.featured ? 15 : 0);

  return {
    score,
    matchedCount,
    matchPercentage,
    isLikelyEligible,
    tier
  };
};

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Saved & Applied Jobs State & Active Feed Tab ('all' vs 'saved' vs 'applied')
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('internkatta_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });
  const [appliedJobIds, setAppliedJobIds] = useState(() => getAppliedJobIds());
  const [feedTab, setFeedTab] = useState('all');

  // Real-time synchronization for saved and applied jobs
  useEffect(() => {
    const handleSavedSync = () => {
      try {
        setSavedJobIds(JSON.parse(localStorage.getItem('internkatta_saved_jobs') || '[]'));
      } catch {}
    };
    const handleAppliedSync = () => {
      setAppliedJobIds(getAppliedJobIds());
    };

    window.addEventListener('storage', handleSavedSync);
    window.addEventListener('storage', handleAppliedSync);
    window.addEventListener('internkatta_saved_jobs_updated', handleSavedSync);
    window.addEventListener('internkatta_applied_jobs_updated', handleAppliedSync);

    return () => {
      window.removeEventListener('storage', handleSavedSync);
      window.removeEventListener('storage', handleAppliedSync);
      window.removeEventListener('internkatta_saved_jobs_updated', handleSavedSync);
      window.removeEventListener('internkatta_applied_jobs_updated', handleAppliedSync);
    };
  }, []);

  // Multi-Select Filter States
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Candidate Profile State (Lifted to shared CandidateProfileContext)
  const {
    candidateProfile: userProfile,
    saveCandidateProfile,
    isProfileModalOpen,
    setIsProfileModalOpen
  } = useCandidateProfile();

  // Load all jobs with live API query synchronization
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const queryParams = {};
        if (selectedDomains.length > 0) {
          queryParams.domain = selectedDomains.join(',');
        }
        if (selectedLocations.length > 0) {
          queryParams.location = selectedLocations.join('|');
        }
        if (searchQuery.trim()) {
          queryParams.search = searchQuery.trim();
        }

        const data = await fetchJobs(queryParams);
        if (isMounted) {
          setJobs(data || MOCK_JOBS);
        }
      } catch (e) {
        if (isMounted) {
          setJobs(MOCK_JOBS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(load, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedDomains, selectedLocations, searchQuery]);

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

  // Sync saved jobs with localStorage updates & custom events
  useEffect(() => {
    const handleSyncSavedJobs = (e) => {
      try {
        if (e?.detail) {
          setSavedJobIds(e.detail);
        } else {
          const saved = JSON.parse(localStorage.getItem('internkatta_saved_jobs') || '[]');
          setSavedJobIds(saved);
        }
      } catch {}
    };

    window.addEventListener('storage', handleSyncSavedJobs);
    window.addEventListener('internkatta_saved_jobs_updated', handleSyncSavedJobs);

    return () => {
      window.removeEventListener('storage', handleSyncSavedJobs);
      window.removeEventListener('internkatta_saved_jobs_updated', handleSyncSavedJobs);
    };
  }, []);

  // Fetch and sync user's actual enrolled internships from live backend API
  useEffect(() => {
    let isMounted = true;
    const syncLiveInternships = async () => {
      try {
        const { data } = await api.get('/api/users/my-internships');
        const list = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
        if (isMounted && list.length > 0) {
          const liveCompleted = list
            .filter((i) => (i.progress || 0) >= 100 || i.status === 'Completed')
            .map((i) => i.title);

          saveCandidateProfile({
            completedInternships: liveCompleted,
            enrolledInternships: list.map((i) => ({
              id: i._id,
              title: i.title,
              progress: i.progress || 0,
              status: (i.progress || 0) >= 100 ? 'Completed' : (i.progress || 0) > 0 ? `In Progress (${i.progress}%)` : 'Enrolled'
            }))
          });
        }
      } catch (err) {
        // Guest or unauthenticated - keep existing state
      }
    };

    syncLiveInternships();
    return () => { isMounted = false; };
  }, [saveCandidateProfile]);

  // Save profile to localStorage and notify
  const handleSaveProfile = (newProfile) => {
    saveCandidateProfile(newProfile);
    toast.success('Candidate profile updated! Job feed re-sorted.');
  };

  // Toggle multi-select domain
  const handleToggleDomain = (domain) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  // Toggle multi-select location
  const handleToggleLocation = (loc) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  // Clear all filters helper
  const handleClearFilters = () => {
    setSelectedDomains([]);
    setSelectedLocations([]);
    setSearchQuery('');
  };

  // Calculate active filter count
  const activeFilterCount = selectedDomains.length + 
                            selectedLocations.length + 
                            (searchQuery.trim() ? 1 : 0);

  // Multi-Filter & Relevance-based sorting of jobs
  const sortedAndFilteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const jobId = job.id || job._id;

      // 1. If "Saved Jobs" tab is active, filter only bookmarked jobs
      if (feedTab === 'saved') {
        const isSaved = savedJobIds.some((id) => String(id) === String(jobId));
        if (!isSaved) return false;
      }

      // 1b. If "Applied Jobs" tab is active, filter only applied jobs
      if (feedTab === 'applied') {
        const isApplied = appliedJobIds.some((id) => String(id) === String(jobId));
        if (!isApplied) return false;
      }

      const jobDomain = job.domain || 'Software & Web Development';
      const jobLoc = job.location || '';
      const jobTitle = job.title || job.jobTitle || '';
      const jobComp = job.company || job.companyName || '';
      const jobDesc = job.description || job.jobDescription || '';

      // 2. Multi-select Domain match
      const domainMatch = selectedDomains.length === 0 || 
                          selectedDomains.some((d) => {
                            const dLower = d.toLowerCase();
                            const jLower = jobDomain.toLowerCase();
                            if (dLower === jLower) return true;
                            // Alias checks for backward compatibility
                            if (d === 'Software & Web Development' && jLower === 'software development') return true;
                            if (d === 'Data Science & Analytics' && jLower === 'data science') return true;
                            if (d === 'AI & Machine Learning' && (jLower === 'artificial intelligence & machine learning' || jLower === 'ai & machine learning' || jLower === 'ai & ml')) return true;
                            if (d === 'Artificial Intelligence & Machine Learning' && (jLower === 'ai & machine learning' || jLower === 'ai & ml')) return true;
                            if (d === 'Cloud & DevOps' && (jLower === 'cloud computing & devops' || jLower === 'cloud & devops')) return true;
                            if (d === 'Cloud Computing & DevOps' && jLower === 'cloud & devops') return true;
                            if (d === 'Marketing & Business' && jLower === 'digital marketing') return true;
                            return false;
                          });

      // 3. Multi-select Location match
      const locationMatch = selectedLocations.length === 0 || 
                            selectedLocations.some((l) => jobLoc.toLowerCase().includes(l.toLowerCase()));

      // 4. Search query match
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || 
                          jobTitle.toLowerCase().includes(q) ||
                          jobComp.toLowerCase().includes(q) ||
                          jobLoc.toLowerCase().includes(q) ||
                          (job.skills || []).some((s) => s.toLowerCase().includes(q)) ||
                          jobDesc.toLowerCase().includes(q);

      return domainMatch && locationMatch && searchMatch;
    });

    // Sort descending by candidate skill match relevance score
    return [...filtered].sort((a, b) => {
      const relA = calculateJobRelevance(a, userProfile);
      const relB = calculateJobRelevance(b, userProfile);

      if (relB.score !== relA.score) {
        return relB.score - relA.score;
      }
      return 0;
    });
  }, [jobs, selectedDomains, selectedLocations, searchQuery, userProfile, feedTab, savedJobIds, appliedJobIds]);

  // Check if any job in the filtered list has at least 1 matching skill with candidate
  const maxSkillMatchCount = useMemo(() => {
    if (!userProfile?.skills || userProfile.skills.length === 0) return 0;
    let maxCount = 0;
    for (const job of sortedAndFilteredJobs) {
      const matches = getMatchedSkills(userProfile.skills, job.skills || []);
      if (matches.length > maxCount) maxCount = matches.length;
    }
    return maxCount;
  }, [sortedAndFilteredJobs, userProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-orange-50/20 text-gray-900 pb-20">
      <SEO
        title="InternKatta AI Job Board & Recommendation Platform"
        description="Discover top tech jobs with dynamic intelligent qualification gating and curated InternKatta skill recommendations."
      />

      {/* Top Navbar Header */}
      <JobNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        userProfile={userProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onToggleMobileFilters={() => setIsMobileFilterOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Sub-bar with "All Jobs" vs "Saved Jobs" Switcher */}
      <div id="jobs-feed-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 border-b border-gray-200/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clean Segmented Control: "All Jobs" vs "Saved Jobs" */}
            <div className="inline-flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setFeedTab('all')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  feedTab === 'all'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                <span>All Jobs</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  feedTab === 'all' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {jobs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFeedTab('saved')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  feedTab === 'saved'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${feedTab === 'saved' ? 'fill-orange-500 text-orange-500' : 'text-gray-500'}`} />
                <span>Saved Jobs</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  feedTab === 'saved' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {savedJobIds.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFeedTab('applied')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  feedTab === 'applied'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${feedTab === 'applied' ? 'text-emerald-500' : 'text-gray-500'}`} />
                <span>Applied Jobs</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  feedTab === 'applied' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {appliedJobIds.length}
                </span>
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-gray-500 font-medium">
              Showing <strong className="text-orange-600 font-black text-sm">{sortedAndFilteredJobs.length}</strong> {feedTab === 'saved' ? 'Saved' : feedTab === 'applied' ? 'Applied' : ''} Positions
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Multi-Select Collapsible Filter Sidebar (Sticky on Desktop) */}
          <div className="hidden lg:block w-72 shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 pr-1">
            {/* Professional Network Style Sidebar Profile Card */}
            <SidebarProfileCard
              userProfile={userProfile}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />

            <JobFilterSidebar
              selectedDomains={selectedDomains}
              onToggleDomain={handleToggleDomain}
              selectedLocations={selectedLocations}
              onToggleLocation={handleToggleLocation}
              jobs={
                feedTab === 'saved'
                  ? jobs.filter((j) => savedJobIds.some((id) => String(id) === String(j.id || j._id)))
                  : feedTab === 'applied'
                    ? jobs.filter((j) => appliedJobIds.some((id) => String(id) === String(j.id || j._id)))
                    : jobs
              }
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Right Column: Active Filter Badges, Sort Notice & Job Grid */}
          <main className="flex-1 w-full min-w-0">
            
            {/* Sorting & Filter Header Bar - Render only when active skill match exists or filters are active */}
            {(maxSkillMatchCount > 0 || activeFilterCount > 0) && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-gray-200/90 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  {maxSkillMatchCount > 0 && (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Sorted by Best Skill Match
                      </span>
                      {userProfile?.skills && userProfile.skills.length > 0 && (
                        <span className="text-[11px] text-gray-500 font-normal hidden sm:inline">
                          Matching {userProfile.skills.length} skills for <strong>{userProfile.name}</strong>
                        </span>
                      )}
                    </>
                  )}
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-orange-600 hover:text-orange-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All ({activeFilterCount})</span>
                  </button>
                )}
              </div>
            )}

            {/* Active Multi-Select Filter Badges */}
            {activeFilterCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {selectedDomains.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-800 border border-orange-200 rounded-lg text-xs font-semibold shadow-2xs">
                    <Layers className="w-3 h-3 text-orange-600" />
                    <span>{d}</span>
                    <button
                      onClick={() => handleToggleDomain(d)}
                      className="hover:text-orange-950 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedLocations.map((l) => (
                  <span key={l} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>{l}</span>
                    <button
                      onClick={() => handleToggleLocation(l)}
                      className="hover:text-blue-950 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg text-xs font-semibold shadow-2xs">
                    <Search className="w-3 h-3 text-gray-600" />
                    <span>"{searchQuery}"</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-gray-950 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Job Grid Feed */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-72 bg-gray-200/70 rounded-2xl border border-gray-300"></div>
                ))}
              </div>
            ) : sortedAndFilteredJobs.length === 0 ? (
              feedTab === 'saved' ? (
                savedJobIds.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs max-w-lg mx-auto my-6">
                    <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100 shadow-2xs">
                      <Bookmark className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-1.5">No Saved Jobs Yet</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                      You haven't saved any jobs yet. Click the bookmark icon on any job card to save it here for quick access later.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFeedTab('all')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Browse All Jobs</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs max-w-lg mx-auto my-6">
                    <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-1.5">No Matching Saved Jobs</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                      None of your {savedJobIds.length} saved jobs match your selected domain, location, or search filters.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 text-xs font-bold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  </div>
                )
              ) : feedTab === 'applied' ? (
                appliedJobIds.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs max-w-lg mx-auto my-6">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-2xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-1.5">No Applied Jobs Yet</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                      You haven't applied to any jobs yet. Check eligibility and submit an application to track it here.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFeedTab('all')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Browse All Jobs</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs max-w-lg mx-auto my-6">
                    <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-1.5">No Matching Applied Jobs</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
                      None of your {appliedJobIds.length} applied jobs match your selected domain, location, or search filters.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 text-xs font-bold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  </div>
                )
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No matching positions found</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    No jobs match your selected domain, location, or search filters. Try clearing some filters.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 px-5 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedAndFilteredJobs.map((job) => (
                  <JobCard
                    key={job.id || job._id}
                    job={job}
                    userProfile={userProfile}
                  />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Mobile Filters Off-Canvas Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-xs animate-fade-in lg:hidden">
          <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl p-4 overflow-y-auto">
            <SidebarProfileCard
              userProfile={userProfile}
              onOpenProfileModal={() => {
                setIsProfileModalOpen(true);
                setIsMobileFilterOpen(false);
              }}
            />
            <JobFilterSidebar
              selectedDomains={selectedDomains}
              onToggleDomain={handleToggleDomain}
              selectedLocations={selectedLocations}
              onToggleLocation={handleToggleLocation}
              jobs={
                feedTab === 'saved'
                  ? jobs.filter((j) => savedJobIds.some((id) => String(id) === String(j.id || j._id)))
                  : feedTab === 'applied'
                    ? jobs.filter((j) => appliedJobIds.some((id) => String(id) === String(j.id || j._id)))
                    : jobs
              }
              onClearFilters={() => {
                handleClearFilters();
                setIsMobileFilterOpen(false);
              }}
              isMobileDrawer={true}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
            />
          </div>
          <div 
            className="flex-1" 
            onClick={() => setIsMobileFilterOpen(false)}
          />
        </div>
      )}

      {/* Candidate Intake Modal */}
      <EligibilityModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
