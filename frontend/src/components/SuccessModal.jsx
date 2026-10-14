// src/components/SuccessModal.jsx
import React, { useEffect } from 'react';
import { CheckCircle2, Award, ArrowRight, Sparkles, Building2, Calendar, FileText, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuccessModal({ isOpen, onClose, job, applicationData, userProfile }) {
  // Keyboard Escape listener to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const appId = applicationData?.application_id || `IK-APP-${Math.floor(100000 + Math.random() * 900000)}`;
  const submittedAt = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-150 overflow-hidden text-center p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right 'X' Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Animated Celebration Icon */}
        <div className="mx-auto w-20 h-20 bg-emerald-100 border-4 border-emerald-200 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
        </div>

        {/* Headline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Application Successfully Submitted
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">
          SUCCESS! Applied to {job.title}
        </h2>
        
        <p className="text-xs text-gray-600 mb-6">
          Your verified credentials and completed InternKatta internship portfolio have been forwarded directly to the hiring team at <strong>{job.company}</strong>.
        </p>

        {/* Submission Details Card */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 text-left space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200">
            <span className="text-gray-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" /> Application ID:
            </span>
            <span className="font-mono font-bold text-gray-800">{appId}</span>
          </div>
          <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-200">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-400" /> Employer:
            </span>
            <span className="font-bold text-gray-800">{job.company}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" /> Submitted Date:
            </span>
            <span className="text-gray-700 font-medium">{submittedAt}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/jobs"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Browse More Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            to="/internship"
            onClick={onClose}
            className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4 text-orange-500" />
            <span>Explore Internships</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
