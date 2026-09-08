import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';
import ErrorBoundary from './ErrorBoundary';

// --- Reusable Order Details Modal Component ---
const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-200" onClick={(e) => e.stopPropagation()}>
                {/* Close button outside modal */}
                <button 
                    onClick={onClose}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Order Details
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    {/* Order & Customer Info */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Order ID</p>
                                <p className="text-gray-800 font-mono text-sm">{order.orderId}</p>
                            </div>
                            <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Order Date</p>
                                <p className="text-gray-800">{formatDate(order.paymentDate)}</p>
                            </div>
                            <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Customer</p>
                                <p className="text-gray-800">{order.customerName || 'N/A'}</p>
                                <p className="text-gray-500 text-xs">{order.customerEmail || 'N/A'}</p>
                            </div>
                            <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Status</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Course Info */}
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            Purchased Course
                        </h4>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                            <div className="space-y-2">
                                <p className="text-gray-700 text-sm">
                                    <span className="font-medium">Course ID:</span> {typeof order.courseId === 'object' ? order.courseId._id || 'N/A' : order.courseId || 'N/A'}
                                </p>
                                {typeof order.courseId === 'object' && order.courseId.title && (
                                    <p className="text-gray-700 text-sm">
                                        <span className="font-medium">Course Title:</span> {order.courseId.title}
                                    </p>
                                )}
                                <div className="pt-2 border-t border-green-200">
                                    <p className="text-lg font-bold text-green-700">₹{order.amount?.toLocaleString('en-IN') || '0'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Payment Details */}
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                            Payment Details
                        </h4>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                    <span className="text-gray-600 font-medium">Transaction ID:</span>
                                    <span className="font-mono text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs">{order.transactionId}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                    <span className="text-gray-600 font-medium">Payment Method:</span>
                                    <span className="font-medium text-blue-700">{order.paymentMethod || 'PhonePe'}</span>
                                </div>
                                {order.failureReason && (
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600 font-medium">Failure Reason:</span>
                                        <span className="font-medium text-red-600 bg-red-100 px-2 py-1 rounded text-xs">{order.failureReason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Total */}
                    <div className="border-t pt-4 text-right">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-2xl font-bold text-purple-700">Total: ₹{order.amount?.toLocaleString('en-IN') || '0'}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Main Admin Purchase History Component ---
const PurchaseHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                setError(null);
                
                                 const response = await api.get('/api/payment/admin/all');
                 
                 if (response.data && response.data.success) {
                     // Validate and filter payments
                     const payments = response.data.payments || [];
                    
                    // Filter only course payments and validate each payment
                    const coursePayments = payments
                                                 .filter(payment => {
                             // Validate payment object
                             if (!payment || typeof payment !== 'object') {
                                 return false;
                             }
                             
                             // Check if it's a course payment
                             return payment.type === 'COURSE';
                         })
                        .map(payment => {
                            // Ensure all required properties exist with fallbacks
                            const processedPayment = {
                                _id: payment._id || `temp_${Date.now()}_${Math.random()}`,
                                orderId: payment.orderId || payment.transactionId || 'N/A',
                                transactionId: payment.transactionId || 'N/A',
                                customerName: payment.customerName || 'Unknown Customer',
                                customerEmail: payment.customerEmail || 'No Email',
                                paymentDate: payment.paymentDate || payment.createdAt || new Date(),
                                amount: payment.amount || 0,
                                status: payment.status || 'UNKNOWN',
                                courseId: payment.courseId || 'N/A', // Keep as is - could be string or populated object
                                paymentMethod: payment.paymentMethod || 'PhonePe',
                                failureReason: payment.failureReason || null,
                                createdAt: payment.createdAt || new Date()
                            };
                            
                                                         return processedPayment;
                        });
                    
                                         setOrders(coursePayments);
                                 } else {
                     setError('Failed to fetch payment data');
                     setOrders([]);
                 }
             } catch (err) {
                 setError('Error loading payment data');
                 setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

         const handleOpenModal = (order) => {
         // Validate order before opening modal
         if (!order || typeof order !== 'object') {
             return;
         }
         
         setSelectedOrder(order);
         setIsModalOpen(true);
     };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setIsModalOpen(false);
    };

    const filteredOrders = orders
                 .filter(order => {
             // Validate order object
             if (!order || typeof order !== 'object') {
                 return false;
             }
             
             if (statusFilter === 'All') return true;
             return order.status === statusFilter.toUpperCase();
         })
        .filter(order => {
            // Additional validation for search filter
            if (!order || typeof order !== 'object') return false;
            
            const searchLower = searchTerm.toLowerCase();
            return (
                (order.orderId && order.orderId.toLowerCase().includes(searchLower)) ||
                (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
                (order.customerEmail && order.customerEmail.toLowerCase().includes(searchLower))
            );
        });

    const getStatusBadge = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        
        switch (status.toUpperCase()) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Course Purchase History</h1>
            
            

            {/* Search and Filter Controls */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Order ID, customer name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="md:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="All">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading transactions...</td></tr>
                            ) : filteredOrders.length > 0 ? (
                                                                 filteredOrders.map(order => {
                                     // Additional validation for each order
                                     if (!order || typeof order !== 'object') {
                                         return null;
                                     }
                                     
                                     return (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order?.orderId || order?.transactionId || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order?.customerName || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {order?.customerEmail || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order?.paymentDate || order?.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                ₹{(order?.amount || 0)?.toLocaleString('en-IN') || '0'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order?.status || 'UNKNOWN')}`}>
                                                    {order?.status || 'UNKNOWN'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button 
                                                    onClick={() => handleOpenModal(order)} 
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                    disabled={!order}
                                                >
                                                    <EyeIcon className="h-5 w-5 mr-1"/> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }).filter(Boolean) // Remove any null entries
                            ) : (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500">No transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailsModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                order={selectedOrder}
            />
        </div>
    );
};

const PurchaseHistoryWithErrorBoundary = () => (
    <ErrorBoundary>
        <PurchaseHistory />
    </ErrorBoundary>
);

export default PurchaseHistoryWithErrorBoundary;