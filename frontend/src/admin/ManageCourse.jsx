import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Edit, Trash2, Eye, Play, Users, Star, Calendar, DollarSign, BookOpen, Award, Globe, Clock, CheckCircle, Plus, Search, Filter, Download, Share2, MoreVertical, AlertTriangle, Tag } from 'lucide-react';

// Reusable Modal Component (Your original code, preserved)
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, courseTitle }) => {
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
                Delete Course
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the course "<strong>{courseTitle}</strong>"? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Coupon Modal Component
const CouponModal = ({ isOpen, onClose, courseId, courseTitle }) => {
  const [couponData, setCouponData] = useState({
    code: '',
    discountAmount: '',
    discountType: 'fixed',
    usageLimit: 1,
    validUntil: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!couponData.code || !couponData.discountAmount || !couponData.validUntil) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/coupons', {
        ...couponData,
        courseId: courseId,
        discountAmount: parseFloat(couponData.discountAmount),
        usageLimit: parseInt(couponData.usageLimit)
      });
      
      toast.success('Coupon created successfully!');
      onClose();
      setCouponData({
        code: '',
        discountAmount: '',
        discountType: 'fixed',
        usageLimit: 1,
        validUntil: ''
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
              <Tag className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Create Coupon for "{courseTitle}"
              </h3>
              <div className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Coupon Code *</label>
                    <input
                      type="text"
                      value={couponData.code}
                      onChange={(e) => setCouponData({...couponData, code: e.target.value.toUpperCase()})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., SAVE20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                    <select
                      value={couponData.discountType}
                      onChange={(e) => setCouponData({...couponData, discountType: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="fixed">Fixed Amount (₹)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Discount Amount *
                      {couponData.discountType === 'fixed' ? ' (₹)' : ' (%)'}
                    </label>
                    <input
                      type="number"
                      value={couponData.discountAmount}
                      onChange={(e) => setCouponData({...couponData, discountAmount: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={couponData.discountType === 'fixed' ? '100' : '20'}
                      min="0"
                      step={couponData.discountType === 'fixed' ? '1' : '0.1'}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
                    <input
                      type="number"
                      value={couponData.usageLimit}
                      onChange={(e) => setCouponData({...couponData, usageLimit: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valid Until *</label>
                    <input
                      type="datetime-local"
                      value={couponData.validUntil}
                      onChange={(e) => setCouponData({...couponData, validUntil: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Coupon'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const ManageCourse = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [courseForCoupon, setCourseForCoupon] = useState(null);
  
  // --- FIX 1: Get the 'auth' object, which contains the token ---
  const { auth } = useAdminAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/courses');
        setCourses(response.data);
      } catch (err) {
        setError("Failed to fetch courses. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch courses if the token is available
    if (auth && auth.token) {
        fetchCourses();
    }
  }, [auth]); // Dependency array now includes 'auth'
  
  const handleOpenDeleteModal = (course) => {
    setCourseToDelete(course);
    setIsModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setCourseToDelete(null);
    setIsModalOpen(false);
  };

  const handleOpenCouponModal = (course) => {
    setCourseForCoupon(course);
    setIsCouponModalOpen(true);
  };

  const handleCloseCouponModal = () => {
    setCourseForCoupon(null);
    setIsCouponModalOpen(false);
  };

  // --- THIS FUNCTION IS NOW CORRECT ---
  const handleDeleteCourse = async () => {
    if (!courseToDelete || !auth?.token) { // Check against the 'auth' object
      alert("Could not delete course. Authentication token is missing.");
      return;
    }

    try {
      await api.delete(`/api/courses/${courseToDelete._id}`);
      
      setCourses(prevCourses => prevCourses.filter(c => c._id !== courseToDelete._id));
      
    } catch (err) {
      alert('Failed to delete the course. Please try again.');
      console.error(err);
    } finally {
      handleCloseDeleteModal();
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Courses</h1>
        <Link 
            to="/admin/addcourse" 
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700"
        >
            <Plus className="h-5 w-5 mr-2" />
            Add New Course
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search for a course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      {error && <div className="text-red-500 text-center bg-red-100 p-3 rounded-lg">{error}</div>}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limit</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10">Loading courses...</td></tr>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={`${course.thumbnailUrl}?t=${Date.now()}`} 
                        alt={course.title} 
                        className="h-10 w-16 object-cover rounded" 
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2NCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iMjAiIHI9IjgiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 w-64 truncate">{course.title}</div>
                      <div className="text-sm text-gray-500">{course.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.tutor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{course.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatBytes(course.totalSizeBytes || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 GB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <Link to={`/admin/course-player/${course._id}`} title="View Course Content" className="text-blue-600 hover:text-blue-900">
                           <Eye className="h-5 w-5" />
                        </Link>
                        <Link to={`/admin/edit-course/${course._id}`} title="Edit Course" className="text-indigo-600 hover:text-indigo-900">
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button onClick={() => handleOpenCouponModal(course)} title="Create Coupon" className="text-green-600 hover:text-green-900">
                          <Tag className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleOpenDeleteModal(course)} title="Delete Course" className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-10">No courses found. Add one to get started!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteCourse}
        courseTitle={courseToDelete?.title}
      />
      
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={handleCloseCouponModal}
        courseId={courseForCoupon?._id}
        courseTitle={courseForCoupon?.title}
      />
    </div>
  );
};

// Helper to format bytes nicely
const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[i]}`;
};

export default ManageCourse;