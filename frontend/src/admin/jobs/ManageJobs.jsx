import React, { useState, useEffect, useMemo } from 'react';
import { initialJobs } from './mockJobs';
import JobDetailsModal from './JobDetailsModal';
import JobFormModal from './JobFormModal';
import toast from 'react-hot-toast';
import { 
  Search, Briefcase, Building2, MapPin, Edit, Eye, Trash2, 
  Plus, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight 
} from 'lucide-react';

// Reusable Modal Component for Deletion
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle, companyName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Job
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the job "<strong>{jobTitle}</strong>" at "<strong>{companyName}</strong>"? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageJobs = () => {
  // Main State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: '',
    status: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedJob, setSelectedJob] = useState(null);

  // Initialize with dummy data (prepared for future API integration)
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Future Phase: Fetch from API
        // const response = await api.get('/api/jobs');
        // setJobs(response.data);
        
        // Current Phase: Use dummy data
        setTimeout(() => {
          setJobs(initialJobs);
          setLoading(false);
        }, 500); // simulate network request
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Filter and Search Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search
      const searchMatch = 
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));

      // Filters
      const locationMatch = !filters.location || job.location.includes(filters.location);
      const jobTypeMatch = !filters.jobType || job.jobType === filters.jobType;
      const expMatch = !filters.experience || job.experience === filters.experience;
      const statusMatch = !filters.status || job.status === filters.status;

      return searchMatch && locationMatch && jobTypeMatch && expMatch && statusMatch;
    });
  }, [jobs, searchTerm, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Derived Stats
  const stats = useMemo(() => {
    const activeJobs = jobs.filter(j => j.status === 'Active').length;
    const uniqueCompanies = new Set(jobs.map(j => j.companyName)).size;
    const uniqueLocations = new Set(jobs.map(j => j.location.split(',')[0].trim())).size;
    
    return {
      total: jobs.length,
      active: activeJobs,
      companies: uniqueCompanies,
      locations: uniqueLocations
    };
  }, [jobs]);

  // Extract unique filter options
  const uniqueLocations = [...new Set(jobs.map(j => j.location.split(',')[0].trim()))].sort();
  const uniqueJobTypes = [...new Set(jobs.map(j => j.jobType))].sort();
  const uniqueExperiences = [...new Set(jobs.map(j => j.experience))].sort();

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleStatus = (job) => {
    const newStatus = job.status === 'Active' ? 'Inactive' : 'Active';
    // Future: Call API here
    
    setJobs(jobs.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
    toast.success(`Job marked as ${newStatus}`);
  };

  const handleDeleteConfirm = () => {
    // Future: Call API here
    // await api.delete(`/api/jobs/${selectedJob._id}`);
    
    setJobs(jobs.filter(j => j._id !== selectedJob._id));
    toast.success('Job deleted successfully');
    setIsDeleteModalOpen(false);
    setSelectedJob(null);
  };

  const handleSaveJob = (jobData) => {
    // Future: Call API here
    if (selectedJob) {
      // Update
      setJobs(jobs.map(j => j._id === selectedJob._id ? { ...jobData, _id: selectedJob._id } : j));
      toast.success('Job updated successfully');
    } else {
      // Create
      const newJob = {
        ...jobData,
        _id: `job_new_${Date.now()}`,
        postedDate: new Date().toISOString().split('T')[0],
        source: 'Manual'
      };
      setJobs([newJob, ...jobs]);
      toast.success('New job added successfully');
    }
    setIsFormModalOpen(false);
  };

  const openDeleteModal = (job) => {
    setSelectedJob(job);
    setIsDeleteModalOpen(true);
  };

  const openDetailsModal = (job) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setIsFormModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedJob(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Jobs Management</h1>
        <p className="text-gray-500 mt-2">Manage and monitor job opportunities collected from different sources.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Briefcase size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Companies</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.companies}</h3>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Building2 size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Locations</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.locations}</h3>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <MapPin size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="relative flex-grow max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search by title, company, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
            />
          </div>
          
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Manual Job
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select 
            name="location" 
            value={filters.location} 
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 bg-gray-50"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          
          <select 
            name="jobType" 
            value={filters.jobType} 
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 bg-gray-50"
          >
            <option value="">All Job Types</option>
            {uniqueJobTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          
          <select 
            name="experience" 
            value={filters.experience} 
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 bg-gray-50"
          >
            <option value="">All Experience</option>
            {uniqueExperiences.map(exp => <option key={exp} value={exp}>{exp}</option>)}
          </select>
          
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 bg-gray-50"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Company & Job Title</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Type / Exp</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Source</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-500">Loading jobs...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{job.jobTitle}</div>
                      <div className="text-gray-500 flex items-center mt-1">
                        <Building2 size={14} className="mr-1" />
                        {job.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 flex items-center">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        {job.location.split(',')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs w-fit border border-blue-100">
                          {job.jobType}
                        </span>
                        <span className="text-gray-500 text-xs">{job.experience}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        job.source === 'Scraped' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        job.source === 'Manual' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                        'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {job.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(job)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          job.status === 'Active' 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {job.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {job.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openDetailsModal(job)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => openEditModal(job)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md transition-colors"
                          title="Edit Job"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(job)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Briefcase size={40} className="text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-600">No jobs found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredJobs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredJobs.length)}</span> of <span className="font-medium">{filteredJobs.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <JobDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        job={selectedJob}
      />

      <JobFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        job={selectedJob}
        onSave={handleSaveJob}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        jobTitle={selectedJob?.jobTitle}
        companyName={selectedJob?.companyName}
      />

    </div>
  );
};

export default ManageJobs;
