import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Trash2, RotateCcw, AlertTriangle, BookOpen, Briefcase, Calendar, X } from 'lucide-react';

const RecycleBin = () => {
  const [deletedCourses, setDeletedCourses] = useState([]);
  const [deletedInternships, setDeletedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'courses', 'internships'
  const [restoreModal, setRestoreModal] = useState({ isOpen: false, type: null, id: null, title: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null, title: null });

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/recycle-bin');
      setDeletedCourses(response.data.courses || []);
      setDeletedInternships(response.data.internships || []);
    } catch (error) {
      console.error('Error fetching deleted items:', error);
      toast.error('Failed to load recycle bin');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      const { type, id } = restoreModal;
      const endpoint = type === 'course' 
        ? `/api/recycle-bin/restore-course/${id}`
        : `/api/recycle-bin/restore-internship/${id}`;

      await api.post(endpoint);
      toast.success(`${type === 'course' ? 'Course' : 'Internship'} restored successfully!`);
      setRestoreModal({ isOpen: false, type: null, id: null, title: null });
      fetchDeletedItems();
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error(error.response?.data?.message || 'Failed to restore item');
    }
  };

  const handlePermanentDelete = async () => {
    try {
      const { type, id } = deleteModal;
      const endpoint = type === 'course'
        ? `/api/recycle-bin/permanent-delete-course/${id}`
        : `/api/recycle-bin/permanent-delete-internship/${id}`;

      await api.delete(endpoint);
      toast.success(`${type === 'course' ? 'Course' : 'Internship'} permanently deleted!`);
      setDeleteModal({ isOpen: false, type: null, id: null, title: null });
      fetchDeletedItems();
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalItems = deletedCourses.length + deletedInternships.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recycle Bin</h1>
          <p className="text-gray-600 mt-1">
            {totalItems} deleted {totalItems === 1 ? 'item' : 'items'} 
            ({deletedCourses.length} courses, {deletedInternships.length} internships)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Items ({totalItems})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'courses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Courses ({deletedCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('internships')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'internships'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Internships ({deletedInternships.length})
          </button>
        </nav>
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <div className="text-center py-12">
          <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No deleted items</h3>
          <p className="mt-1 text-sm text-gray-500">Deleted courses and internships will appear here.</p>
        </div>
      )}

      {/* Courses List */}
      {(activeTab === 'all' || activeTab === 'courses') && deletedCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Deleted Courses
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deletedCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.subtitle}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Calendar className="h-4 w-4" />
                  Deleted: {formatDate(course.deletedAt)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRestoreModal({ isOpen: true, type: 'course', id: course._id, title: course.title })}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <RotateCcw className="h-4 w-4" /> Restore
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, type: 'course', id: course._id, title: course.title })}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internships List */}
      {(activeTab === 'all' || activeTab === 'internships') && deletedInternships.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Deleted Internships
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deletedInternships.map((internship) => (
              <div key={internship._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{internship.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{internship.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Calendar className="h-4 w-4" />
                  Deleted: {formatDate(internship.deletedAt)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRestoreModal({ isOpen: true, type: 'internship', id: internship._id, title: internship.title })}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <RotateCcw className="h-4 w-4" /> Restore
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, type: 'internship', id: internship._id, title: internship.title })}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {restoreModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <RotateCcw className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Restore {restoreModal.type === 'course' ? 'Course' : 'Internship'}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to restore "<strong>{restoreModal.title}</strong>"? 
                      It will be available again in the main list.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleRestore}
              >
                Restore
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setRestoreModal({ isOpen: false, type: null, id: null, title: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Permanently Delete {deleteModal.type === 'course' ? 'Course' : 'Internship'}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to permanently delete "<strong>{deleteModal.title}</strong>"? 
                      This action cannot be undone and all associated files will be deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handlePermanentDelete}
              >
                Delete Permanently
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setDeleteModal({ isOpen: false, type: null, id: null, title: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleBin;



