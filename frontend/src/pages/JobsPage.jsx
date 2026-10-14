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
  CheckCircle2
} from 'lucide-react';
import JobNavbar from '../components/JobNavbar';
import JobFilterSidebar from '../components/JobFilterSidebar';
import JobCard from '../components/JobCard';
import EligibilityModal from '../components/EligibilityModal';
import SuccessModal from '../components/SuccessModal';
import SEO from '../components/SEO';
import { fetchJobs, applyToJob, MOCK_JOBS } from '../api/client';
import { calculateSkillMatchMetrics, getMatchedSkills } from '../utils/skillMatcher';
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
  
  // Multi-Select Filter States
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Modals & State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Candidate Profile State (Persisted in localStorage)
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
      completedInternships: ['Full Stack Web Development Internship'],
      profilePicture: '',
      resumeName: ''
    };
  });

  // Load all jobs
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchJobs();
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
    load();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Save profile to localStorage and notify
  const handleSaveProfile = (newProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('internkatta_candidate_profile', JSON.stringify(newProfile));
    window.dispatchEvent(new CustomEvent('internkatta_profile_updated', { detail: newProfile }));
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
      // 1. Multi-select Domain match
      const domainMatch = selectedDomains.length === 0 || 
                          selectedDomains.some((d) => d.toLowerCase() === job.domain?.toLowerCase());

      // 2. Multi-select Location match
      const locationMatch = selectedLocations.length === 0 || 
                            selectedLocations.some((l) => job.location?.toLowerCase().includes(l.toLowerCase()));

      // 3. Search query match
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || 
                          job.title?.toLowerCase().includes(q) ||
                          job.company?.toLowerCase().includes(q) ||
                          job.location?.toLowerCase().includes(q) ||
                          (job.skills || []).some((s) => s.toLowerCase().includes(q)) ||
                          job.description?.toLowerCase().includes(q);

      return domainMatch && locationMatch && searchMatch;
    });

    // Sort descending by candidate skill match relevance score
    return [...filtered].sort((a, b) => {
      const relA = calculateJobRelevance(a, userProfile);
      const relB = calculateJobRelevance(b, userProfile);

      if (relB.score !== relA.score) {
        return relB.score - relA.score;
      }
      if (b.featured !== a.featured) {
        return b.featured ? 1 : -1;
      }
      return 0;
    });
  }, [jobs, selectedDomains, selectedLocations, searchQuery, userProfile]);

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

      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              Verified Industry Partner Openings
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Explore Tech Jobs & Internships
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
              Partner opportunities ranked by your skill match. Click any position to view details, match scores, and intelligent gating in a dedicated view.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-orange-600" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-orange-600">{sortedAndFilteredJobs.length}</span>
              <span className="text-xs font-semibold text-gray-500 block">Positions Found</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Multi-Select Collapsible Filter Sidebar (Sticky on Desktop) */}
          <div className="hidden lg:block w-72 shrink-0 sticky top-24">
            <JobFilterSidebar
              selectedDomains={selectedDomains}
              onToggleDomain={handleToggleDomain}
              selectedLocations={selectedLocations}
              onToggleLocation={handleToggleLocation}
              jobs={jobs}
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
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No matching positions found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  No jobs match your selected domain or location filters. Try clearing some filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-5 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedAndFilteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
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
            <JobFilterSidebar
              selectedDomains={selectedDomains}
              onToggleDomain={handleToggleDomain}
              selectedLocations={selectedLocations}
              onToggleLocation={handleToggleLocation}
              jobs={jobs}
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
