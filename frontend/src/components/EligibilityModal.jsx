// src/components/EligibilityModal.jsx
import React, { useState, useRef } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { INTERNKATTA_INTERNSHIPS_CATALOG } from '../api/client';
import { parseResumeFile } from '../utils/resumeParser';
import toast from 'react-hot-toast';

export default function EligibilityModal({ isOpen, onClose, userProfile, onSaveProfile }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: userProfile?.name || 'Aarav Sharma',
    email: userProfile?.email || 'aarav.sharma@example.com',
    education: userProfile?.education || 'B.Tech in Computer Science',
    college: userProfile?.college || 'Pune Institute of Computer Technology',
    gradYear: userProfile?.gradYear || '2025',
    domain: userProfile?.domain || 'Software Development',
    skillsInput: userProfile?.skills?.join(', ') || 'React.js, Node.js, JavaScript, MongoDB, CSS3',
    completedInternships: userProfile?.completedInternships || ['Full Stack Web Development Internship'],
    profilePicture: userProfile?.profilePicture || userProfile?.avatar || ''
  });

  // Resume File & Parsing State
  const [resumeStatus, setResumeStatus] = useState(userProfile?.resumeName ? 'success' : 'idle'); // 'idle' | 'parsing' | 'success'
  const [uploadedResumeName, setUploadedResumeName] = useState(userProfile?.resumeName || '');
  const [uploadedResumeSize, setUploadedResumeSize] = useState(userProfile?.resumeSize || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(Boolean(userProfile?.resumeName));

  // File Input Refs
  const profileImageInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const availableInternships = INTERNKATTA_INTERNSHIPS_CATALOG.map((i) => i.title);

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

  const toggleInternship = (title) => {
    setFormData((prev) => {
      const exists = prev.completedInternships.includes(title);
      return {
        ...prev,
        completedInternships: exists
          ? prev.completedInternships.filter((t) => t !== title)
          : [...prev.completedInternships, title]
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const skillsArray = formData.skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSaveProfile({
      ...formData,
      skills: skillsArray,
      resumeName: uploadedResumeName,
      resumeSize: uploadedResumeSize
    });
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          
          {/* 1. TOP PROFILE PICTURE UPLOAD */}
          <div className="flex flex-col items-center justify-center pt-1 pb-1">
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
                Full Name
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
                Email Address
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
                Degree / Qualification
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
                <option value="Software Development">Software Development</option>
                <option value="Data Science">Data Science</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
              </select>
            </div>
          </div>

          {/* Skills Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Skills (Comma Separated)</span>
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

          {/* Completed InternKatta Internships */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-orange-500" />
              <span>Verified Completed InternKatta Internships</span>
            </label>
            <p className="text-[11px] text-gray-500 mb-2.5">
              Check any internships completed on InternKatta. Having a verified completed internship unlocks the green <strong>Apply Now</strong> button on matching partner jobs!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200/80">
              {availableInternships.map((title) => {
                const isChecked = formData.completedInternships.includes(title);
                return (
                  <button
                    type="button"
                    key={title}
                    onClick={() => toggleInternship(title)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg text-left transition-all border text-xs cursor-pointer ${
                      isChecked
                        ? 'bg-orange-50 border-orange-300 text-orange-950 font-semibold shadow-2xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                      isChecked ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300'
                    }`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="leading-tight flex-1">{title}</span>
                  </button>
                );
              })}
            </div>
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
