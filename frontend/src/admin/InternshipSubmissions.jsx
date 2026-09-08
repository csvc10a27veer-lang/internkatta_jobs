import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Check, X, Download, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const InternshipSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [filter, setFilter] = useState('Pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth } = useAdminAuth();

    const fetchSubmissions = async () => {
        try {
            // No need to set loading to true here if it's already true initially
            const { data } = await api.get('/api/v1/internships/submissions/all');
            setSubmissions(data);
            setError(null);
        } catch (err) {
            setError('Failed to load submissions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.token) {
            fetchSubmissions();
        }
    }, [auth.token]);

    useEffect(() => {
        if (filter === 'All') {
            setFilteredSubmissions(submissions);
        } else {
            setFilteredSubmissions(submissions.filter(s => s.status === filter));
        }
    }, [submissions, filter]);

    // --- UPDATED HANDLE STATUS CHANGE ---
    const handleStatusChange = async (submission, newStatus) => {
        try {
            await api.put(
                '/api/v1/internships/submissions/update-status',
                { 
                    userId: submission.userId,
                    internshipId: submission.internshipId,
                    lectureId: submission.lectureId,
                    newStatus: newStatus
                }
            );
            toast.success(`Submission ${newStatus.toLowerCase()}!`);
            // Re-fetch all data to ensure the UI is perfectly in sync with the database.
            // This is a more robust way to handle the update.
            fetchSubmissions();
        } catch (err) {
            const message = err.response?.data?.message || `Failed to update status.`;
            toast.error(message);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader className="animate-spin" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Submissions</h1>
            <div className="flex flex-wrap gap-2 mb-6">
                {['Pending', 'Approved', 'Rejected', 'All'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            filter === status
                                ? 'bg-sky-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">User</th>
                            <th className="p-4 font-semibold text-gray-600">Internship & Task</th>
                            <th className="p-4 font-semibold text-gray-600">Submitted File</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubmissions.length > 0 ? (
                            filteredSubmissions.map((sub, index) => (
                                // --- CREATING A UNIQUE KEY USING MULTIPLE PROPERTIES ---
                                <tr key={`${sub.userId}-${sub.internshipId}-${sub.lectureId}-${index}`} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800 align-top">{sub.userName}</td>
                                    <td className="p-4 align-top">
                                        <p className="font-medium text-gray-800">{sub.internshipTitle}</p>
                                        <p className="text-sm text-gray-500" style={{maxWidth: '300px'}}>{sub.taskDescription}</p>
                                    </td>
                                    <td className="p-4 align-top">
                                        {sub.submittedFiles && sub.submittedFiles.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {sub.submittedFiles.map((file, i) => (
                                                    <a 
                                                        key={i}
                                                        href={`${import.meta.env.VITE_API_URL}${file.url}`} 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="inline-flex items-center gap-2 text-sky-600 hover:underline font-medium text-sm"
                                                    >
                                                        <Download size={16} />
                                                        {file.url.split('/').pop()}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <a 
                                                href={`${import.meta.env.VITE_API_URL}${sub.submittedFileUrl}`} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="inline-flex items-center gap-2 text-sky-600 hover:underline font-medium text-sm"
                                            >
                                                <Download size={16} />
                                                {sub.submittedFileUrl?.split('/').pop()}
                                            </a>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">{new Date(sub.submittedAt).toLocaleString()}</p>
                                    </td>
                                    <td className="p-4 text-center align-top">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            sub.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            sub.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center align-top">
                                        {sub.status === 'Pending' && (
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleStatusChange(sub, 'Approved')}
                                                    className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                                                    title="Approve"
                                                ><Check size={18} /></button>
                                                <button 
                                                    onClick={() => handleStatusChange(sub, 'Rejected')}
                                                    className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                                                    title="Reject"
                                                ><X size={18} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center p-8 text-gray-500">No submissions found for the "{filter}" filter.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InternshipSubmissions;