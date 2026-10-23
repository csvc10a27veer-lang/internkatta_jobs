// src/components/EligibilityModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  UserCheck, 
  GraduationCap, 
  Code2, 
  Award, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Camera, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  RotateCcw,
  User,
  Trash2,
  RefreshCw,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';
import api from '../utils/api';
import { parseResumeFile } from '../utils/resumeParser';
import toast from 'react-hot-toast';
import { useCandidateProfile } from '../context/CandidateProfileContext';

export default function EligibilityModal({ isOpen, onClose, userProfile: propUserProfile, onSaveProfile }) {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const {
    candidateProfile: ctxProfile,
    updateLiveDraft,
    saveCandidateProfile
  } = useCandidateProfile();

  const userProfile = propUserProfile || ctxProfile;

  const [formData, setFormData] = useState({
    name: userProfile?.name || 'Aniket Rajendra Patil',
    email: userProfile?.email || 'aniket.patil@example.com',
    education: userProfile?.education || 'B.Tech in Computer Science',
    college: userProfile?.college || 'Pune Institute of Computer Technology',
    gradYear: userProfile?.gradYear || '2025',
    domain: userProfile?.domain || 'Software & Web Development',
    skillsInput: userProfile?.skillsInput || (userProfile?.skills?.join(', ') || 'React.js, Node.js, JavaScript, MongoDB, CSS3'),
    completedInternships: userProfile?.completedInternships || [],
    profilePicture: userProfile?.profilePicture || userProfile?.avatar || ''
  });

  // Resume File & Parsing State
  const [resumeStatus, setResumeStatus] = useState(userProfile?.resumeName ? 'success' : 'idle'); // 'idle' | 'parsing' | 'success'
  const [uploadedResumeName, setUploadedResumeName] = useState(userProfile?.resumeName || '');
  const [uploadedResumeSize, setUploadedResumeSize] = useState(userProfile?.resumeSize || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(Boolean(userProfile?.resumeName));

  // Sync live draft to CandidateProfileContext so widgets update in real-time
  useEffect(() => {
    updateLiveDraft({
      ...formData,
      resumeName: uploadedResumeName,
      resumeSize: uploadedResumeSize
    });
  }, [formData, uploadedResumeName, uploadedResumeSize, updateLiveDraft]);

  // File Input Refs
  const profileImageInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Live Enrolled Internships from Backend API
  const [liveInternships, setLiveInternships] = useState(userProfile?.enrolledInternships || []);
  const [isLoadingInternships, setIsLoadingInternships] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveInternships = async () => {
      setIsLoadingInternships(true);
      try {
        const { data } = await api.get('/api/users/my-internships');
        const list = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
        if (isMounted) {
          if (list.length > 0) {
            setLiveInternships(list);
          } else if (userProfile?.enrolledInternships?.length > 0) {
            setLiveInternships(userProfile.enrolledInternships);
          } else if (userProfile?.completedInternships?.length > 0) {
            setLiveInternships(
              userProfile.completedInternships.map((title) => ({
                title,
                progress: 100,
                status: 'Completed'
              }))
            );
          } else {
            setLiveInternships([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (userProfile?.enrolledInternships?.length > 0) {
            setLiveInternships(userProfile.enrolledInternships);
          } else if (userProfile?.completedInternships?.length > 0) {
            setLiveInternships(
              userProfile.completedInternships.map((title) => ({
                title,
                progress: 100,
                status: 'Completed'
              }))
            );
          } else {
            setLiveInternships([]);
          }
        }
      } finally {
        if (isMounted) setIsLoadingInternships(false);
      }
    };

    fetchLiveInternships();
    return () => { isMounted = false; };
  }, [userProfile]);

  // Profile Picture Handler
  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (PNG, JPG, JPEG)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result
        }));
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      profilePicture: ''
    }));
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = '';
    }
  };

  // Helper: Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || typeof bytes !== 'number') return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Resume Upload & Extraction Handler
  const handleResumeUpload = async (file) => {
    if (!file) return;

    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      toast.error('Please upload a valid PDF, DOCX, or TXT resume file');
      return;
    }

    setResumeStatus('parsing');
    setUploadedResumeName(file.name);
    const formattedSize = formatFileSize(file.size);
    setUploadedResumeSize(formattedSize);

    try {
      const parsedData = await parseResumeFile(file);

      // Populate form fields with extracted data (only override if extracted)
      setFormData((prev) => ({
        ...prev,
        name: parsedData.name ? parsedData.name : prev.name,
        email: parsedData.email ? parsedData.email : prev.email,
        education: parsedData.education ? parsedData.education : prev.education,
        domain: parsedData.domain ? parsedData.domain : prev.domain,
        skillsInput: parsedData.skills && parsedData.skills.length > 0 
          ? parsedData.skills.join(', ') 
          : prev.skillsInput
      }));

      setResumeStatus('success');
      setIsAutoFilled(true);
      toast.success('Resume parsed successfully! Candidate details auto-filled.');
    } catch (err) {
      console.error('Error parsing resume:', err);
      setResumeStatus('success');
      toast.success('Resume uploaded! Please review your details below.');
    }
  };

  // Remove Attached Resume File
  const handleRemoveResume = (e) => {
    e.stopPropagation();
    setResumeStatus('idle');
    setUploadedResumeName('');
    setUploadedResumeSize('');
    setIsAutoFilled(false);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
    toast('Attached resume removed', { icon: '🗑️' });
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleResumeUpload(file);
    }
  };


  // Mandatory 6 Fields Verification & Dynamic Profile Completion Metric
  const hasProfilePic = Boolean(formData.profilePicture);
  const hasResume = Boolean(uploadedResumeName || userProfile?.resumeName);
  const hasName = Boolean(formData.name && formData.name.trim());
  const hasEmail = Boolean(formData.email && formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email.trim()));
  const hasEducation = Boolean(formData.education && formData.education.trim());
  const skillsArray = formData.skillsInput
    ? formData.skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const hasSkills = skillsArray.length > 0;

  const mandatoryChecks = [
    { id: 'pic', label: 'Profile Picture', filled: hasProfilePic },
    { id: 'resume', label: 'Resume Upload', filled: hasResume },
    { id: 'name', label: 'Full Name', filled: hasName },
    { id: 'email', label: 'Email Address', filled: hasEmail },
    { id: 'education', label: 'Degree / Qualification', filled: hasEducation },
    { id: 'skills', label: 'Skills (at least 1)', filled: hasSkills }
  ];

  const filledCount = mandatoryChecks.filter((c) => c.filled).length;
  const completionPercentage = Math.round((filledCount / 6) * 100);

  const handleSave = (e) => {
    e.preventDefault();

    const missingFields = mandatoryChecks.filter((c) => !c.filled).map((c) => c.label);
    if (missingFields.length > 0) {
      toast.error(`Please complete all 6 mandatory fields: ${missingFields.join(', ')}`);
      return;
    }

    const liveCompleted = liveInternships
      .filter((i) => (i.progress || 0) >= 100 || i.status === 'Completed' || i.isCompleted)
      .map((i) => i.title);

    const payload = {
      ...formData,
      skills: skillsArray,
      resumeName: uploadedResumeName,
      resumeSize: uploadedResumeSize,
      profileCompletion: completionPercentage,
      completedInternships: liveCompleted,
      enrolledInternships: liveInternships.map((i) => {
        const prog = i.progress ?? 0;
        const statusLabel = prog >= 100 || i.status === 'Completed'
          ? 'Completed'
          : prog > 0
            ? `In Progress (${prog}%)`
            : 'Enrolled';
        return {
          id: i._id || i.id,
          title: i.title,
          progress: prog,
          status: statusLabel
        };
      })
    };

    saveCandidateProfile(payload);
    if (typeof onSaveProfile === 'function') {
      onSaveProfile(payload);
    }
    toast.success('Candidate profile saved!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-150 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Candidate Intake & Eligibility Profile</h2>
              <p className="text-xs text-orange-100">Upload your resume to auto-fill or enter your credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Profile Completion Metric Bar */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-white border-b border-orange-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-gray-800">
                Profile Completion:
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs ${
                completionPercentage === 100
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : completionPercentage >= 50
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {completionPercentage === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {completionPercentage === 100 ? 'Profile 100% Complete' : `${completionPercentage}%`}
              </span>
            </div>

            {completionPercentage < 100 && (
              <span className="text-[11px] font-semibold text-gray-500">
                All 6 starred (<span className="text-red-500 font-bold">*</span>) fields required to apply
              </span>
            )}
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-gray-200/90 rounded-full overflow-hidden p-0.5 border border-gray-100">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                completionPercentage === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : completionPercentage >= 50
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-red-500 to-orange-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Required Fields Pill Indicators */}
          {completionPercentage < 100 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Required:</span>
              {mandatoryChecks.map((f) => (
                <span
                  key={f.id}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    f.filled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                  }`}
                >
                  {f.filled ? `✓ ${f.label}` : `• ${f.label}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          
          {/* 1. TOP PROFILE PICTURE UPLOAD (MANDATORY) */}
          <div className="flex flex-col items-center justify-center pt-1 pb-1">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Profile Picture</span>
              <span className="text-red-500 font-bold">*</span>
            </div>
            <input
              type="file"
              ref={profileImageInputRef}
              onChange={handleProfileImageChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
            
            <div className="relative group">
              <div 
                onClick={() => profileImageInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-3 border-orange-400 p-0.5 bg-orange-50 shadow-md cursor-pointer hover:border-orange-600 transition-all overflow-hidden flex items-center justify-center"
              >
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex flex-col items-center justify-center text-orange-600">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>

              {/* Camera Badge Overlay */}
              <button
                type="button"
                onClick={() => profileImageInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-md border-2 border-white transition-all cursor-pointer hover:scale-105"
                title="Upload Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => profileImageInputRef.current?.click()}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                {formData.profilePicture ? 'Change Photo' : 'Upload Photo'}
              </button>
              {formData.profilePicture && (
                <>
                  <span className="text-gray-300">•</span>
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="text-xs font-medium text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 2. RESUME UPLOAD & ATTACHED FILE SECTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-500" />
                <span>Upload Resume & Auto-fill</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <span className="text-[10px] text-gray-400 font-medium">Supports PDF, DOCX, TXT</span>
            </div>

            <input
              type="file"
              ref={resumeInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleResumeUpload(file);
              }}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />

            {/* Parsing State */}
            {resumeStatus === 'parsing' && (
              <div className="border-2 border-dashed border-orange-400 bg-orange-50/70 rounded-2xl p-6 text-center animate-pulse">
                <div className="flex flex-col items-center justify-center text-orange-600">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-orange-600" />
                  <p className="text-xs font-bold text-gray-900">Extracting text & parsing candidate profile...</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Detecting Name, Email, Degree & Skills from document body</p>
                </div>
              </div>
            )}

            {/* Attached File Card / Chip State (Replacing empty dropzone when file present) */}
            {resumeStatus === 'success' && uploadedResumeName && (
              <div className="bg-gradient-to-r from-orange-50/40 via-emerald-50/40 to-white border border-emerald-300/80 rounded-2xl p-4 shadow-xs transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  
                  {/* File Meta */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[220px] sm:max-w-xs">
                          {uploadedResumeName}
                        </span>
                        {uploadedResumeSize && (
                          <span className="text-[11px] text-gray-500 font-mono">
                            ({uploadedResumeSize})
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" /> Auto-filled
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Details extracted from resume body. Review or edit below.
                      </p>
                    </div>
                  </div>

                  {/* Actions: Change & Remove */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold shadow-2xs hover:border-orange-300 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="p-1.5 bg-white hover:bg-red-50 text-red-500 hover:text-red-700 border border-gray-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                      title="Remove attached resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* Empty Idle Dropzone */}
            {resumeStatus === 'idle' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => resumeInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? 'border-orange-500 bg-orange-50/80 scale-[0.99]'
                    : 'border-gray-200 bg-gray-50/80 hover:bg-orange-50/40 hover:border-orange-300'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-1.5 shadow-2xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-gray-800">
                    Drag & drop resume or <span className="text-orange-600 underline">browse file</span>
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Automatically extracts your Name, Email, Degree & Skills from the document
                  </p>
                </div>
              </div>
            )}

            {/* Subtle Auto-filled Notice */}
            {isAutoFilled && (
              <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Fields auto-populated from resume body. Feel free to review or add more skills below.</span>
              </div>
            )}
          </div>

          {/* 3. CANDIDATE PROFILE FORM FIELDS (All fully editable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                placeholder="e.g. rahul@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Degree / Qualification <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                placeholder="e.g. B.Tech in Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Target Domain
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white font-medium text-gray-800"
              >
                <option value="Software & Web Development">Software & Web Development</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Robotic Process Automation (RPA)">Robotic Process Automation (RPA)</option>
                <option value="Enterprise Systems (ERP)">Enterprise Systems (ERP)</option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="Marketing & Business">Marketing & Business</option>
              </select>
            </div>
          </div>

          {/* Skills Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>
                Skills (Comma Separated) <span className="text-red-500 font-bold">*</span>
                {hasSkills ? (
                  <span className="ml-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {skillsArray.length} added
                  </span>
                ) : (
                  <span className="ml-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                    At least 1 required
                  </span>
                )}
              </span>
              <span className="text-[10px] text-gray-400 font-normal">e.g. React.js, Node.js, Python, MongoDB</span>
            </label>
            <input
              type="text"
              value={formData.skillsInput}
              onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              placeholder="React.js, Node.js, JavaScript, Python, SQL"
            />
          </div>

          {/* Verified Completed InternKatta Internships (Read-Only Live Statuses) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-orange-500" />
                <span>Verified Completed InternKatta Internships</span>
              </label>
              {liveInternships.length > 0 && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {liveInternships.filter((i) => (i.progress || 0) >= 100 || i.status === 'Completed').length} Completed
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mb-2.5 leading-normal">
              Live records fetched from your InternKatta Learning Dashboard. Completed internships automatically unlock the green <strong className="text-emerald-700 font-bold">Apply Now</strong> button on matching partner jobs!
            </p>

            {isLoadingInternships ? (
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span>Fetching live internship enrollment & progress...</span>
              </div>
            ) : liveInternships.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/90 text-center">
                <p className="text-xs font-semibold text-gray-700">No Enrolled Internships Found</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Enroll in InternKatta internship accelerators to earn verified credentials and fast-track job applications.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-200/90">
                {liveInternships.map((internship, index) => {
                  const progress = internship.progress ?? 0;
                  const isCompleted = progress >= 100 || internship.status === 'Completed' || internship.isCompleted;
                  const isInProgress = !isCompleted && (progress > 0 || internship.status?.includes('Progress'));
                  const targetId = internship._id || internship.id;

                  const handleCardClick = () => {
                    onClose?.();
                    if (targetId) {
                      navigate(`/internship/${targetId}`);
                    } else {
                      navigate('/internship');
                    }
                  };

                  return (
                    <button
                      key={targetId || `${internship.title}-${index}`}
                      type="button"
                      onClick={handleCardClick}
                      className="w-full text-left cursor-pointer transition-all duration-200 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-between gap-3 p-2.5 bg-white rounded-xl border border-gray-200/80 shadow-2xs group"
                      title={`View ${internship.title} details`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : isInProgress
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isInProgress ? (
                            <TrendingUp className="w-4 h-4 text-sky-600" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {internship.title}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-100'
                          : isInProgress
                            ? 'bg-sky-50 text-sky-700 border-sky-200 group-hover:bg-sky-100'
                            : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-200'
                      }`}>
                        {isCompleted
                          ? 'Completed'
                          : isInProgress
                            ? `In Progress (${progress}%)`
                            : 'Enrolled'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              Save Profile & Evaluate Eligibility
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
