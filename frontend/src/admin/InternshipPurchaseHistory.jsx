import React, { useState, useEffect } from 'react';
import { Eye, X, Search } from 'lucide-react';
import api from '../utils/api';

const InternshipPurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Fetch payment data from backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/payment/admin/all');
        
        if (response.data.success) {
          // Filter only internship payments
          const internshipPayments = response.data.payments.filter(
            payment => payment.type === 'INTERNSHIP'
          );
          setPurchases(internshipPayments);
        } else {
          setError('Failed to fetch payment data');
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Error loading payment data');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Effect for applying filters
  useEffect(() => {
    let result = purchases;

    if (searchTerm) {
      result = result.filter(p =>
        p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter.toUpperCase());
    }

    setFilteredPurchases(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, purchases]);
  
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const currentItems = filteredPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Internship Purchase History</h1>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-48 border rounded-md p-2 bg-white">
          <option value="All">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 font-semibold">Order ID</th>
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold">Internship</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((purchase) => (
                <tr key={purchase._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">{purchase.orderId}</td>
                  <td className="p-4">
                      <div>{purchase.customerName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{purchase.customerEmail || 'N/A'}</div>
                  </td>
                  <td className="p-4 text-gray-600 max-w-xs truncate">
                    {purchase.internshipId?.title || purchase.internshipId?._id || 'N/A'}
                  </td>
                  <td className="p-4 text-gray-600">{formatDate(purchase.paymentDate)}</td>
                  <td className="p-4 font-medium">₹{purchase.amount?.toLocaleString('en-IN') || '0'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(purchase.status)}`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleViewDetails(purchase)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-full" title="View Details">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="text-center p-8 text-gray-500">No records match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="float-right text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2"><strong>Order ID:</strong><span>{selectedPurchase.orderId}</span></div>
                <div className="flex justify-between border-b pb-2"><strong>Transaction ID:</strong><span>{selectedPurchase.transactionId}</span></div>
                <div className="flex justify-between border-b pb-2"><strong>Customer Name:</strong><span>{selectedPurchase.customerName || 'N/A'}</span></div>
                <div className="flex justify-between border-b pb-2"><strong>Customer Email:</strong><span>{selectedPurchase.customerEmail || 'N/A'}</span></div>
                <div className="flex justify-between border-b pb-2"><strong>Customer Phone:</strong><span>{selectedPurchase.customerPhone || 'N/A'}</span></div>
                <div className="flex justify-between border-b pb-2 items-start">
                    <strong className="flex-shrink-0 mr-4">Internship Title:</strong>
                    <span className="text-right">{selectedPurchase.internshipId?.title || selectedPurchase.internshipId?._id || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2"><strong>Purchase Date:</strong><span>{formatDate(selectedPurchase.paymentDate)}</span></div>
                <div className="flex justify-between border-b pb-2"><strong>Payment Method:</strong><span>{selectedPurchase.paymentMethod || 'PhonePe'}</span></div>
                <div className="flex justify-between border-b pb-2"><strong>Status:</strong><span className="font-bold">{selectedPurchase.status}</span></div>
                {selectedPurchase.failureReason && (
                  <div className="flex justify-between border-b pb-2"><strong>Failure Reason:</strong><span className="text-red-600">{selectedPurchase.failureReason}</span></div>
                )}
                <div className="flex justify-between pt-2 text-lg"><strong>Amount:</strong><span className="font-bold text-green-600">₹{selectedPurchase.amount?.toLocaleString('en-IN') || '0'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipPurchaseHistory;