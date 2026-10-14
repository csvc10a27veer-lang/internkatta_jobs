import React from 'react';
import { X, Building2, MapPin, Briefcase, Clock, Mail, Phone, ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';

const formatDate = (dateVal) => {
  if (!dateVal) return 'Not Specified';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return String(dateVal);
  }
};

// Check if contact is an old dummy/auto-filled number
const isDummyContact = (c) => {
  if (!c || typeof c !== 'string') return true;
  const trimmed = c.trim();
  return /^\+91\s*(80\s*4567\s*8900|98765432\d\d|80\s*6789|80\s*4681|80\s*6000|12\s*0464|22\s*6778|80\s*2852|44\s*4209|20\s*6601|40\s*6718|80\s*4108|80\s*4127|22\s*4890|80\s*4040|12\s*0400|80\s*4077|20\s*6703|22\s*6755|40\s*6762|6872|98765)/.test(trimmed);
};

const JobDetailsModal = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null;

  const registrationDateStr = formatDate(job.registrationDate || job.postedDate);
  const endDateStr = job.endDate ? formatDate(job.endDate) : 'Ongoing / No Deadline';
  const hasValidContact = job.contact && !isDummyContact(job.contact);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Job Details</h2>
              <p className="text-xs text-gray-500">Complete job overview, schedule, and company credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          
          {/* Top Job Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {job.source || 'Scraped'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {job.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {job.status}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{job.jobTitle}</h1>
            </div>
            
            {job.salary && (
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-left md:text-right shrink-0">
                <span className="text-xs text-emerald-600 font-medium block">Salary / Stipend</span>
                <span className="text-lg font-bold text-emerald-800">{job.salary}</span>
              </div>
            )}
          </div>

          {/* COMPANY DETAILS SECTION */}
          <div className="bg-gray-50/70 rounded-xl p-5 border border-gray-200 space-y-5">
            
            {/* 1. Core Company Details: Company, Location, Job Type, Experience */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                Company & Role Overview
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Building2 size={14} className="text-indigo-600" /> Company Name
                  </p>
                  <p className="font-semibold text-gray-900 text-sm truncate">{job.companyName}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <MapPin size={14} className="text-indigo-600" /> Location
                  </p>
                  <p className="font-semibold text-gray-900 text-sm truncate">{job.location}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Briefcase size={14} className="text-indigo-600" /> Job Type
                  </p>
                  <p className="font-semibold text-gray-900 text-sm">{job.jobType}</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Clock size={14} className="text-indigo-600" /> Experience
                  </p>
                  <p className="font-semibold text-indigo-700 text-sm">{job.experience}</p>
                </div>
              </div>
            </div>

            {/* 2. DISPLAYED DIRECTLY BELOW EXPERIENCE: Registration Date & End Date */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                Registration & Application Dates
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-lg border border-indigo-100 shadow-sm flex items-start gap-3">
                  <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Registration Date</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">{registrationDateStr}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Application start / opening date</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-rose-100 shadow-sm flex items-start gap-3">
                  <div className="bg-rose-100 text-rose-700 p-2 rounded-lg shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">End Date (Application Deadline)</p>
                    <p className="text-base font-bold text-rose-900 mt-0.5">{endDateStr}</p>
                    <p className="text-[11px] text-rose-500 mt-0.5">Last date for candidates to apply</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. DISPLAYED DIRECTLY BELOW THE DATES: Company Email ID & Contact Number */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                Company Contact Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-lg shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500">Company Email ID</p>
                    {job.email ? (
                      <a 
                        href={`mailto:${job.email}`} 
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate block mt-0.5"
                      >
                        {job.email}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-0.5">No email provided</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-0.5">Official hiring communication email</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3">
                  <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg shrink-0">
                    <Phone size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500">Contact Number (Manual)</p>
                    {hasValidContact ? (
                      <a 
                        href={`tel:${job.contact}`} 
                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 hover:underline truncate block mt-0.5"
                      >
                        {job.contact}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-0.5">Manual contact not entered</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-0.5">Manual contact entry only</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1.5">
              Job Description
            </h3>
            <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border border-gray-100">
              {job.jobDescription}
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1.5">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills && job.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {(!job.skills || job.skills.length === 0) && (
                <span className="text-gray-400 text-sm italic">No specific skills listed.</span>
              )}
            </div>
          </div>

          {/* Original Source Link */}
          {job.sourceUrl && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">External listing source:</span>
              <a 
                href={job.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 hover:underline"
              >
                View on {job.source || 'Original Site'} <ExternalLink size={13} />
              </a>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors cursor-pointer text-sm shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
