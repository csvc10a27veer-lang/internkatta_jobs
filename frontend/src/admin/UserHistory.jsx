import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon, UserMinusIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon, ShieldExclamationIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Helper function to generate avatar placeholder
const generateAvatar = (name) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=150`;
};

// --- Reusable Modal Components ---

const UserDetailsModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">User Profile Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                <div className="p-6">
                    {/* Basic Information */}
                    <div className="flex items-center space-x-4 mb-6">
                        <img src={generateAvatar(user.fullName)} alt={user.fullName} className="h-20 w-20 rounded-full object-cover" />
                        <div>
                            <p className="text-xl font-bold text-gray-800">{user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.phone}</p>
                            <p className="text-xs text-gray-400 mt-1">Joined: {new Date(user.registrationDate).toLocaleDateString()}</p>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mt-2 ${
                                user.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                user.status === 'Suspended' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {user.status}
                            </span>
                        </div>
                    </div>

                    {/* Enrolled Courses */}
                    <div className="border-t pt-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Enrolled Courses ({user.enrolledCourses?.length || 0})</h4>
                        {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {user.enrolledCourses.map(course => (
                                    <div key={course._id} className="bg-gray-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-gray-800">{course.title}</h5>
                                        {course.description && <p className="text-sm text-gray-600 mt-1">{course.description}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">This user has not enrolled in any courses.</p>
                        )}
                    </div>

                    {/* Enrolled Internships */}
                    <div className="border-t pt-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Enrolled Internships ({user.enrolledInternships?.length || 0})</h4>
                        {user.enrolledInternships && user.enrolledInternships.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {user.enrolledInternships.map(internship => (
                                    <div key={internship._id} className="bg-gray-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-gray-800">{internship.title}</h5>
                                        {internship.description && <p className="text-sm text-gray-600 mt-1">{internship.description}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">This user has not enrolled in any internships.</p>
                        )}
                    </div>

                    {/* Course Progress */}
                    {user.courseProgress && user.courseProgress.length > 0 && (
                        <div className="border-t pt-4 mb-4">
                            <h4 className="font-semibold text-gray-800 mb-3">Course Progress</h4>
                            <div className="space-y-2">
                                {user.courseProgress.map((progress, index) => (
                                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-gray-800">{progress.courseId?.title || 'Course'}</h5>
                                        <p className="text-sm text-gray-600">Completed Lectures: {progress.completedLectures?.length || 0}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Internship Progress */}
                    {user.internshipProgress && user.internshipProgress.length > 0 && (
                        <div className="border-t pt-4 mb-4">
                            <h4 className="font-semibold text-gray-800 mb-3">Internship Progress</h4>
                            <div className="space-y-2">
                                {user.internshipProgress.map((progress, index) => (
                                    <div key={index} className="bg-green-50 p-3 rounded-lg">
                                        <h5 className="font-medium text-gray-800">{progress.internshipId?.title || 'Internship'}</h5>
                                        <p className="text-sm text-gray-600">Completed Lectures: {progress.completedLectures?.length || 0}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText, icon, showReasonInput = false, reason, onReasonChange, isLoading = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            {icon}
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">{message}</p>
                                {showReasonInput && (
                                    <div className="mt-3">
                                        <label htmlFor="suspension-reason" className="block text-sm font-medium text-gray-700 mb-1">
                                            Reason for suspension:
                                        </label>
                                        <textarea
                                            id="suspension-reason"
                                            value={reason}
                                            onChange={onReasonChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter reason for suspension..."
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        disabled={isLoading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        {isLoading ? 'Processing...' : confirmButtonText}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isLoading}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main User History Component ---
const UserHistory = () => {
    const { auth } = useAdminAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // State for modals
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmAction, setConfirmAction] = useState({ action: null, title: '', message: '', confirmText: '', icon: null });
    const [suspensionReason, setSuspensionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (auth?.token) {
                setCurrentPage(1); // Reset to first page when filters change
                fetchUsers();
            }
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer);
    }, [auth, statusFilter, searchTerm]);

    useEffect(() => {
        if (auth?.token) {
            fetchUsers();
        }
    }, [auth, currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                status: statusFilter !== 'All' ? statusFilter : '',
                search: searchTerm
            });

            const response = await api.get(`/api/admin/users?${params}`);
            
            if (response.data.success) {
                setUsers(response.data.users);
                setTotalPages(response.data.pagination.totalPages);
                setTotalUsers(response.data.pagination.totalUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (user) => {
        try {
            const response = await api.get(`/api/admin/users/${user._id}`);
            if (response.data.success) {
                setSelectedUser(response.data.user);
                setIsDetailsModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to fetch user details');
        }
    };
    
    const handleSuspendClick = (user) => {
        setSelectedUser(user);
        setConfirmAction({
            action: 'suspend',
            title: 'Suspend User',
            message: `Are you sure you want to suspend ${user.fullName}? They will lose access to their account.`,
            confirmText: 'Yes, Suspend',
            icon: <ShieldExclamationIcon className="h-6 w-6 text-red-600" />
        });
        setIsConfirmModalOpen(true);
    };
    
    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setConfirmAction({
            action: 'delete',
            title: 'Delete User',
            message: `Are you sure you want to permanently delete ${user.fullName}? This action cannot be undone.`,
            confirmText: 'Yes, Delete',
            icon: <TrashIcon className="h-6 w-6 text-red-600" />
        });
        setIsConfirmModalOpen(true);
    };

    const handleActivateUser = async (user) => {
        try {
            const response = await api.put(`/api/admin/users/${user._id}/activate`);
            
            if (response.data.success) {
                toast.success('User activated successfully');
                fetchUsers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error activating user:', error);
            toast.error('Error activating user');
        }
    };

    const handleConfirm = async () => {
        try {
            setActionLoading(true);
            if (confirmAction.action === 'suspend') {
                const response = await api.put(`/api/admin/users/${selectedUser._id}/suspend`, {
                    reason: suspensionReason || 'Suspended by admin'
                });
                
                if (response.data.success) {
                    toast.success('User suspended successfully');
                    fetchUsers(); // Refresh the list
                }
            } else if (confirmAction.action === 'delete') {
                const response = await api.delete(`/api/admin/users/${selectedUser._id}`);
                
                if (response.data.success) {
                    toast.success('User deleted successfully');
                    fetchUsers(); // Refresh the list
                }
            }
        } catch (error) {
            console.error('Error performing action:', error);
            const action = confirmAction.action === 'suspend' ? 'suspending' : 'deleting';
            toast.error(`Error ${action} user`);
        } finally {
            setActionLoading(false);
            setIsConfirmModalOpen(false);
            setSelectedUser(null);
            setSuspensionReason('');
        }
    };

    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setSelectedUser(null);
        setSuspensionReason('');
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Users</h1>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></span>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Status:</label>
                    <select 
                        id="status-filter" 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)} 
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Internships</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading users...</td></tr>}
                            {!loading && filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-full object-cover" src={generateAvatar(user.fullName)} alt={user.fullName} />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.registrationDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                            <div className="text-center">
                                                <div className="font-bold text-blue-600">{user.totalCourses}</div>
                                                <div className="text-xs text-gray-500">Courses</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                            <div className="text-center">
                                                <div className="font-bold text-green-600">{user.totalInternships}</div>
                                                <div className="text-xs text-gray-500">Internships</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                                user.status === 'Suspended' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-4">
                                                <button onClick={() => handleViewDetails(user)} title="View Details" className="text-blue-600 hover:text-blue-900"><EyeIcon className="h-5 w-5"/></button>
                                                {user.status === 'Active' ? (
                                                    <button onClick={() => handleSuspendClick(user)} title="Suspend User" className="text-yellow-600 hover:text-yellow-900"><UserMinusIcon className="h-5 w-5"/></button>
                                                ) : (
                                                    <button onClick={() => handleActivateUser(user)} title="Activate User" className="text-green-600 hover:text-green-900"><CheckCircleIcon className="h-5 w-5"/></button>
                                                )}
                                                <button onClick={() => handleDeleteClick(user)} title="Delete User" className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !loading && <tr><td colSpan="6" className="text-center py-10 text-gray-500">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm mt-4">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * 10, totalUsers)}</span> of{' '}
                                <span className="font-medium">{totalUsers}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                page === currentPage
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            } border`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            <UserDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} user={selectedUser} />
            <ConfirmationModal 
                isOpen={isConfirmModalOpen} 
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirm}
                title={confirmAction.title}
                message={confirmAction.message}
                confirmButtonText={confirmAction.confirmText}
                icon={confirmAction.icon}
                showReasonInput={confirmAction.action === 'suspend'}
                reason={suspensionReason}
                onReasonChange={(e) => setSuspensionReason(e.target.value)}
                isLoading={actionLoading}
            />
        </div>
    );
};

export default UserHistory;