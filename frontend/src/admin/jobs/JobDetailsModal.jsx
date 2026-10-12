import React from 'react';
import { X, Building2, MapPin, Briefcase, Clock, Mail, Phone, ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';

const JobDetailsModal = ({ isOpen, onClose, job }) => {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Job Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.jobTitle}</h1>
              <div className="flex items-center text-gray-600 mt-2 gap-4 flex-wrap">
                <span className="flex items-center gap-1"><Building2 size={16} /> {job.companyName}</span>
                <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                <span className="flex items-center gap-1"><Briefcase size={16} /> {job.jobType}</span>
                <span className="flex items-center gap-1"><Clock size={16} /> {job.experience}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
                job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {job.status === 'Active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {job.status}
              </span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar size={14} /> Posted: {new Date(job.postedDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 md:col-span-2">
              <h3 className="font-semibold text-blue-900 mb-2">Salary Expectation</h3>
              <p className="text-blue-800 text-lg">{job.salary || "Not Disclosed"}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Source Information</h3>
              <p className="text-gray-700 text-sm mb-1"><span className="font-medium">Type:</span> {job.source}</p>
              {job.sourceUrl && (
                <a 
                  href={job.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                >
                  View Original <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Job Description</h3>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.jobDescription}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills && job.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
              {(!job.skills || job.skills.length === 0) && (
                <span className="text-gray-500 italic">No specific skills listed.</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.email && (
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email Address</p>
                    <a href={`mailto:${job.email}`} className="text-gray-800 hover:text-indigo-600">{job.email}</a>
                  </div>
                </div>
              )}
              {job.contact && (
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                    <a href={`tel:${job.contact}`} className="text-gray-800 hover:text-indigo-600">{job.contact}</a>
                  </div>
                </div>
              )}
              {!job.email && !job.contact && (
                <p className="text-gray-500 italic">No contact information provided.</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
