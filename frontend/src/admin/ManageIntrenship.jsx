import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, AlertCircle, Loader, Tag } from 'lucide-react';
import api from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import toast from 'react-hot-toast';

const ManageIntrenship = () => {
  // --- State for Internships ---
  const [internships, setInternships] = useState([]);
  
  // --- NEW: State for Categories ---
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // --- Combined Loading and Error States ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Coupon Modal States ---
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [internshipForCoupon, setInternshipForCoupon] = useState(null);
  
  const navigate = useNavigate();
  const { auth } = useAdminAuth();

  // --- Combined Data Fetching ---
  const fetchPageData = async () => {
    if (!auth.token) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Use Promise.all to fetch both internships and categories concurrently
      const [internshipsResponse, categoriesResponse] = await Promise.all([
        api.get('/api/v1/internships/all'),
        api.get('/api/v1/internship-category/all') // This is a public route, no token needed
      ]);

      setInternships(internshipsResponse.data);
      setCategories(categoriesResponse.data);
      setError(null);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch page data.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching page data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- useEffect to run on component mount ---
  useEffect(() => {
    fetchPageData();
  }, [auth.token]);

  // --- Category Management Handlers ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return toast.error('Category name cannot be empty.');
    setIsSubmittingCategory(true);
    try {
              const { data } = await api.post('/api/v1/internship-category/create', 
        { name: newCategoryName }
      );
      setCategories(prev => [data, ...prev]);
      setNewCategoryName('');
      toast.success('Category added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category.');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure? This might affect existing internships.')) {
      try {
        await api.delete(`/api/v1/internship-category/${categoryId}`);
        setCategories(prev => prev.filter(cat => cat._id !== categoryId));
        toast.success('Category deleted.');
      } catch (err) {
        toast.error('Failed to delete category.');
      }
    }
  };

  // --- Internship Management Handlers (No changes needed) ---
  const handleDelete = async (internshipId) => {
    if (window.confirm('Are you sure you want to permanently delete this internship?')) {
      try {
        await api.delete(`/api/v1/internships/${internshipId}`);
        setInternships(prev => prev.filter(i => i._id !== internshipId));
        toast.success('Internship deleted!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete internship.');
      }
    }
  };

  const handleEdit = (internshipId) => {
    navigate(`/admin/edit-internship/${internshipId}`);
  };

  // --- Coupon Modal Handlers ---
  const handleOpenCouponModal = (internship) => {
    setInternshipForCoupon(internship);
    setIsCouponModalOpen(true);
  };

  const handleCloseCouponModal = () => {
    setInternshipForCoupon(null);
    setIsCouponModalOpen(false);
  };

  // --- Render Loading/Error States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-sky-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg shadow-md">
        <AlertCircle className="mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">An Error Occurred</h2>
        <p className="mt-2">{error}</p>
        <button onClick={fetchPageData} className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
          Try Again
        </button>
      </div>
    );
  }
  
  // --- Main Combined Render ---
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* --- NEW: MANAGE CATEGORIES SECTION --- */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Categories</h2>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch gap-2 mb-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Add a new category..."
            className="w-full px-4 py-2 border rounded-md"
          />
          <button type="submit" disabled={isSubmittingCategory} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800 disabled:bg-gray-400">
            {isSubmittingCategory ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
            <span>Add</span>
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {categories.length > 0 ? (
            categories.map(cat => (
              <span key={cat._id} className="flex items-center bg-gray-100 text-gray-700 text-sm font-medium pl-3 pr-1 py-1 rounded-full">
                {cat.name}
                <button onClick={() => handleDeleteCategory(cat._id)} className="ml-2 text-gray-500 hover:bg-red-200 hover:text-red-700 rounded-full p-0.5">
                  <Trash2 size={14} />
                </button>
              </span>
            ))
          ) : <p className="text-sm text-gray-500">No categories found. Add one to get started.</p>}
        </div>
      </div>

      {/* --- MANAGE INTERNSHIPS SECTION --- */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Internships</h1>
          <Link to="/admin/add-internship" className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700">
            <Plus size={20} />
            <span>Add New Internship</span>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold">Thumbnail</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.length > 0 ? (
                internships.map((internship) => (
                  <tr key={internship._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                                                      <img src={internship.thumbnail.url} alt={internship.title} className="w-20 h-12 object-cover rounded-md border"/>
                    </td>
                    <td className="p-4 font-medium">{internship.title}</td>
                    <td className="p-4">{internship.category?.name || 'N/A'}</td>
                    <td className="p-4">₹{Number(internship.price).toLocaleString('en-IN')}</td>
                    <td className="p-4">{internship.duration}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(internship._id)} className="text-blue-600 p-2 hover:bg-blue-100 rounded-full" title="Edit"><Edit size={18} /></button>
                        <button onClick={() => handleOpenCouponModal(internship)} className="text-green-600 p-2 hover:bg-green-100 rounded-full" title="Create Coupon"><Tag size={18} /></button>
                        <button onClick={() => handleDelete(internship._id)} className="text-red-600 p-2 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-500">
                    <h2 className="text-lg font-medium">No Internships Found</h2>
                    <p className="mt-1">Create a category above, then add your first internship program.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Coupon Modal */}
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={handleCloseCouponModal}
        internshipId={internshipForCoupon?._id}
        internshipTitle={internshipForCoupon?.title}
      />
    </div>
  );
};

// Coupon Modal Component for Internships
const CouponModal = ({ isOpen, onClose, internshipId, internshipTitle }) => {
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
        internshipId: internshipId,
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
                Create Coupon for "{internshipTitle}"
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

export default ManageIntrenship;