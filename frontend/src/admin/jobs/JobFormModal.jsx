import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Mail, Phone, Briefcase, Building2, MapPin } from 'lucide-react';

const formatDateForInput = (d) => {
  if (!d) return '';
  try {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// Filter out old placeholder/auto-fill numbers so contact is strictly manual
const isDummyContact = (c) => {
  if (!c || typeof c !== 'string') return true;
  const trimmed = c.trim();
  return /^\+91\s*(80\s*4567\s*8900|98765432\d\d|80\s*6789|80\s*4681|80\s*6000|12\s*0464|22\s*6778|80\s*2852|44\s*4209|20\s*6601|40\s*6718|80\s*4108|80\s*4127|22\s*4890|80\s*4040|12\s*0400|80\s*4077|20\s*6703|22\s*6755|40\s*6762|6872|98765)/.test(trimmed);
};

const JobFormModal = ({ isOpen, onClose, job, onSave, initialPlatform }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    location: '',
    salary: '',
    jobType: 'Full Time',
    experience: 'Fresher',
    registrationDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    email: '',
    contact: '', // manual entry only
    status: 'Active',
    platform: initialPlatform || 'Direct',
    skills: '',
    jobDescription: ''
  });

  useEffect(() => {
    if (job) {
      setFormData({
        ...job,
        platform: job.platform || job.source || initialPlatform || 'Direct',
        contact: (job.contact && !isDummyContact(job.contact)) ? job.contact : '', // strictly manual, not auto-filled
        skills: job.skills ? (Array.isArray(job.skills) ? job.skills.join(', ') : job.skills) : '',
        registrationDate: formatDateForInput(job.registrationDate || job.postedDate) || new Date().toISOString().split('T')[0],
        endDate: formatDateForInput(job.endDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        companyName: '',
        jobTitle: '',
        location: '',
        salary: '',
        jobType: 'Full Time',
        experience: 'Fresher',
        registrationDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        email: '',
        contact: '', // manual entry
        status: 'Active',
        platform: initialPlatform || 'Direct',
        skills: '',
        jobDescription: ''
      });
    }
  }, [job, isOpen, initialPlatform]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Process skills string to array
    const processedSkills = formData.skills
      ? formData.skills.split(',').map(s => s.trim()).filter(s => s)
      : [];

    const jobDataToSave = {
      ...formData,
      skills: processedSkills
    };

    onSave(jobDataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {job ? 'Edit Job' : 'Add New Job'}
              </h2>
              <p className="text-xs text-gray-500">Configure company details, registration schedule, and job criteria</p>
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
        <div className="p-6 overflow-y-auto flex-grow">
          <form id="job-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1: Company Name & Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Building2 size={15} className="text-indigo-600" /> Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Cred"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Briefcase size={15} className="text-indigo-600" /> Job Title *
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Frontend Engineering Trainee"
                />
              </div>

              {/* Row 2: Location & Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin size={15} className="text-indigo-600" /> Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Bangalore, Karnataka"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., ₹35,000/month or ₹6-10 LPA"
                />
              </div>

              {/* Row 3: Job Type & Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Fresher">Fresher</option>
                  <option value="0-1 Years">0-1 Years</option>
                  <option value="0-2 Years">0-2 Years</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="2-5 Years">2-5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>

              {/* Row 4 (DISPLAYED DIRECTLY BELOW EXPERIENCE): Registration Date & End Date */}
              <div className="bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-100">
                <label className="block text-sm font-semibold text-indigo-900 mb-1 flex items-center gap-1.5">
                  <Calendar size={15} className="text-indigo-600" /> Registration Date *
                </label>
                <input
                  type="date"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                />
                <p className="text-xs text-indigo-600 mt-1">Application opening date</p>
              </div>

              <div className="bg-rose-50/50 p-3.5 rounded-lg border border-rose-100">
                <label className="block text-sm font-semibold text-rose-900 mb-1 flex items-center gap-1.5">
                  <Calendar size={15} className="text-rose-600" /> End Date (Application Deadline) *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-800"
                />
                <p className="text-xs text-rose-600 mt-1">Last date to apply for this job</p>
              </div>

              {/* Row 5 (DISPLAYED DIRECTLY BELOW THE DATES): Company Email ID & Contact Number (Manual) */}
              <div className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                  <Mail size={15} className="text-blue-600" /> Company Email ID
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., hr@cred.club or careers@company.com"
                />
                <p className="text-xs text-gray-500 mt-1">Hiring and company communication email</p>
              </div>

              <div className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                  <Phone size={15} className="text-emerald-600" /> Contact Number (Manual Entry)
                </label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter manual contact number (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">Manual entry only (never auto-filled)</p>
              </div>

              {/* Row 6: Status & Platform Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Category</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Direct">Direct HR / Company</option>
                  <option value="Indeed">Indeed</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Naukri">Naukri.com</option>
                  <option value="Glassdoor">Glassdoor</option>
                  <option value="Internshala">Internshala</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., React, TypeScript, TailwindCSS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Detailed description of the job role..."
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="job-form"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Save size={18} /> {job ? 'Update Job' : 'Save Job'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobFormModal;
