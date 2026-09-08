import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon, XMarkIcon, TrashIcon, CheckIcon, ClockIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';
import ErrorBoundary from './ErrorBoundary';

// --- Contact Details Modal Component ---
const ContactDetailsModal = ({ isOpen, onClose, contact, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        if (contact) {
            setEditData({
                status: contact.status,
                adminNotes: contact.adminNotes || '',
                isResolved: contact.isResolved || false
            });
        }
    }, [contact]);

    if (!isOpen || !contact) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSave = async () => {
        try {
            const response = await api.put(`/api/contact/admin/${contact._id}`, editData);
            if (response.data.success) {
                onUpdate(response.data.contact);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'NEW': 'bg-blue-100 text-blue-800',
            'READ': 'bg-yellow-100 text-yellow-800',
            'REPLIED': 'bg-green-100 text-green-800',
            'CLOSED': 'bg-gray-100 text-gray-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200" onClick={(e) => e.stopPropagation()}>
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
                        Contact Inquiry Details
                    </h3>
                </div>

                <div className="p-6 space-y-6">
                    {/* Contact Information */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                            Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Name</p>
                                <p className="text-gray-800">{contact.name}</p>
                            </div>
                            <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Email</p>
                                <p className="text-gray-800">{contact.email}</p>
                            </div>
                            <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Subject</p>
                                <p className="text-gray-800">{contact.subject}</p>
                            </div>
                            <div className="bg-white p-3 rounded-md border border-slate-200">
                                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Submitted</p>
                                <p className="text-gray-800">{formatDate(contact.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            Message
                        </h4>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                            <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                        </div>
                    </div>

                    {/* Admin Management */}
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                            Admin Management
                        </h4>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 space-y-4">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <select
                                            value={editData.status}
                                            onChange={(e) => setEditData({...editData, status: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="NEW">New</option>
                                            <option value="READ">Read</option>
                                            <option value="REPLIED">Replied</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                                        <textarea
                                            value={editData.adminNotes}
                                            onChange={(e) => setEditData({...editData, adminNotes: e.target.value})}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Add notes about this inquiry..."
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isResolved"
                                            checked={editData.isResolved}
                                            onChange={(e) => setEditData({...editData, isResolved: e.target.checked})}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isResolved" className="ml-2 text-sm text-gray-700">
                                            Mark as resolved
                                        </label>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">Status:</span>
                                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(contact.status)}`}>
                                                {contact.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    {contact.adminNotes && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">Admin Notes:</span>
                                            <p className="mt-1 text-gray-700 bg-white p-2 rounded border">{contact.adminNotes}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>Resolved: {contact.isResolved ? 'Yes' : 'No'}</span>
                                        {contact.resolvedAt && (
                                            <span>Resolved on: {formatDate(contact.resolvedAt)}</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Inquiry History Component ---
const InquiryHistory = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, [currentPage, statusFilter, searchTerm]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                status: statusFilter,
                search: searchTerm
            });

            const response = await api.get(`/api/contact/admin/all?${params}`);
            
            if (response.data && response.data.success) {
                setContacts(response.data.contacts);
                setTotalPages(response.data.pagination.totalPages);
            } else {
                setError('Failed to fetch contact data');
                setContacts([]);
            }
        } catch (err) {
            setError('Error loading contact data');
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (contact) => {
        if (!contact || typeof contact !== 'object') {
            return;
        }
        
        setSelectedContact(contact);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedContact(null);
        setIsModalOpen(false);
    };

    const handleContactUpdate = (updatedContact) => {
        setContacts(prev => prev.map(contact => 
            contact._id === updatedContact._id ? updatedContact : contact
        ));
    };

    const handleDeleteContact = async (contactId) => {
        if (!window.confirm('Are you sure you want to delete this contact submission?')) {
            return;
        }

        try {
            const response = await api.delete(`/api/contact/admin/${contactId}`);
            if (response.data.success) {
                setContacts(prev => prev.filter(contact => contact._id !== contactId));
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'NEW': 'bg-blue-100 text-blue-800',
            'READ': 'bg-yellow-100 text-yellow-800',
            'REPLIED': 'bg-green-100 text-green-800',
            'CLOSED': 'bg-gray-100 text-gray-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
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

    if (loading && contacts.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    if (error && contacts.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Inquiry History</h1>
            
            {/* Search and Filter Controls */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, subject, or message..."
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
                            <option value="NEW">New</option>
                            <option value="READ">Read</option>
                            <option value="REPLIED">Replied</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading inquiries...</td></tr>
                            ) : contacts.length > 0 ? (
                                contacts.map(contact => {
                                    if (!contact || typeof contact !== 'object') {
                                        return null;
                                    }
                                    
                                    return (
                                        <tr key={contact._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {contact.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {contact.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 max-w-xs truncate" title={contact.subject}>
                                                    {contact.subject}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(contact.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(contact.status)}`}>
                                                    {contact.status}
                                                </span>
                                                {contact.isResolved && (
                                                    <CheckIcon className="inline-block w-4 h-4 text-green-600 ml-1" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleOpenModal(contact)} 
                                                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="h-5 w-5 mr-1"/> View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteContact(contact._id)} 
                                                        className="text-red-600 hover:text-red-900 flex items-center"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-5 w-5 mr-1"/> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }).filter(Boolean)
                            ) : (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-500">No inquiries found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white shadow-md rounded-lg p-4 mt-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ContactDetailsModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                contact={selectedContact}
                onUpdate={handleContactUpdate}
            />
        </div>
    );
};

const InquiryHistoryWithErrorBoundary = () => (
    <ErrorBoundary>
        <InquiryHistory />
    </ErrorBoundary>
);

export default InquiryHistoryWithErrorBoundary;
