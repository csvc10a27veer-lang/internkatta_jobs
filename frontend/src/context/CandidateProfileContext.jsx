// frontend/src/context/CandidateProfileContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { calculateProfileCompletion } from '../utils/skillMatcher';

export const CandidateProfileContext = createContext(null);

export const DEFAULT_CANDIDATE_PROFILE = {
  name: 'Aniket Rajendra Patil',
  email: 'aniket.patil@example.com',
  education: 'B.Tech in Computer Science',
  role: 'System Engineer',
  company: 'Tata Consultancy Services',
  headline: 'System Engineer @ Tata Consultancy Services',
  college: 'Pune Institute of Computer Technology',
  gradYear: '2025',
  domain: 'Software & Web Development',
  skills: ['React.js', 'Node.js', 'JavaScript', 'MongoDB', 'CSS3', 'Python'],
  skillsInput: 'React.js, Node.js, JavaScript, MongoDB, CSS3, Python',
  completedInternships: [],
  enrolledInternships: [],
  profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  resumeName: 'Aniket_Patil_Resume.pdf',
  resumeSize: '1.2 MB'
};

export const CandidateProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('internkatta_candidate_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CANDIDATE_PROFILE,
          ...parsed,
          skillsInput: parsed.skillsInput || (Array.isArray(parsed.skills) ? parsed.skills.join(', ') : '')
        };
      }
    } catch (e) {
      console.error('Error loading candidate profile from localStorage:', e);
    }
    return DEFAULT_CANDIDATE_PROFILE;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Compute live completion percentage strictly based on the 6 mandatory fields
  const completionPercentage = useMemo(() => {
    return calculateProfileCompletion(profile);
  }, [profile]);

  // Save profile completely to state & localStorage
  const saveCandidateProfile = useCallback((updatedFields) => {
    setProfile((prev) => {
      const merged = {
        ...prev,
        ...updatedFields,
        skillsInput: updatedFields.skillsInput !== undefined 
          ? updatedFields.skillsInput 
          : (Array.isArray(updatedFields.skills) ? updatedFields.skills.join(', ') : prev.skillsInput)
      };
      merged.profileCompletion = calculateProfileCompletion(merged);
      try {
        localStorage.setItem('internkatta_candidate_profile', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('internkatta_profile_updated', { detail: merged }));
      } catch (err) {
        console.error('Failed to save profile to localStorage:', err);
      }
      return merged;
    });
  }, []);

  // Live draft update while user types or uploads inside the modal
  const updateLiveDraft = useCallback((draftFields) => {
    setProfile((prev) => {
      const merged = {
        ...prev,
        ...draftFields
      };
      if (draftFields.skillsInput !== undefined && !draftFields.skills) {
        merged.skills = draftFields.skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
      }
      merged.profileCompletion = calculateProfileCompletion(merged);
      try {
        localStorage.setItem('internkatta_candidate_profile', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('internkatta_profile_updated', { detail: merged }));
      } catch (err) {}
      return merged;
    });
  }, []);

  // Listen to cross-tab storage and window events
  useEffect(() => {
    const handleStorageUpdate = (e) => {
      if (e.key === 'internkatta_candidate_profile' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setProfile((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
    };

    const handleCustomUpdate = (e) => {
      if (e?.detail) {
        setProfile((prev) => ({ ...prev, ...e.detail }));
      }
    };

    const handleOpenModal = () => setIsProfileModalOpen(true);

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('internkatta_profile_updated', handleCustomUpdate);
    window.addEventListener('open-candidate-profile-modal', handleOpenModal);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('internkatta_profile_updated', handleCustomUpdate);
      window.removeEventListener('open-candidate-profile-modal', handleOpenModal);
    };
  }, []);

  const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
  const closeProfileModal = useCallback(() => setIsProfileModalOpen(false), []);

  const value = useMemo(() => ({
    profile,
    candidateProfile: profile,
    completionPercentage,
    isProfileModalOpen,
    setIsProfileModalOpen,
    openProfileModal,
    closeProfileModal,
    saveCandidateProfile,
    updateCandidateProfile: saveCandidateProfile,
    updateLiveDraft
  }), [profile, completionPercentage, isProfileModalOpen, openProfileModal, closeProfileModal, saveCandidateProfile, updateLiveDraft]);

  return (
    <CandidateProfileContext.Provider value={value}>
      {children}
    </CandidateProfileContext.Provider>
  );
};

export const useCandidateProfile = () => {
  const context = useContext(CandidateProfileContext);
  if (!context) {
    throw new Error('useCandidateProfile must be used within a CandidateProfileProvider');
  }
  return context;
};
