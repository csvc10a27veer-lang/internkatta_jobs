// frontend/src/pages/userDashboard/InternshipLetter.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
//import { useAuth } from '../context/AuthContext';
import { useUserAuth } from '../context/UserAuthContext';
import { DocumentCheckIcon, ArrowDownTrayIcon, ExclamationCircleIcon, CalendarIcon, CheckCircleIcon, TrophyIcon, StarIcon, BriefcaseIcon, ShareIcon, EyeIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
function InternshipLetter() {
    const { auth } = useUserAuth();
    const [completedInternships, setCompletedInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchCompletedInternships = async () => {
            if (!auth || !auth.token) {
                setError("You must be logged in to view your internship letters.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Call the new backend endpoint to get the list of completed internships
                const { data } = await api.get('/api/users/completed-internships');

                // Ensure data is an array
                if (data && Array.isArray(data)) {
                    setCompletedInternships(data);
                } else if (data && data.data && Array.isArray(data.data)) {
                    setCompletedInternships(data.data);
                } else {
                    setCompletedInternships([]);
                }

            } catch (err) {
                setError("Could not load your internship letters at this time.");
                console.error("Fetch completed internships error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedInternships();
    }, [auth]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-600">Loading Your Internship Letters...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
                    <ExclamationCircleIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Internship Completion Letters</h1>
                            <p className="text-gray-600 mt-2">Your official internship completion certificates and letters</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Total Letters</p>
                                <p className="text-2xl font-bold text-blue-600">{completedInternships?.length || 0}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {completedInternships?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {completedInternships && Array.isArray(completedInternships) && completedInternships.length > 0 ? (
                    <div className="space-y-6">
                        {/* Achievement Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white text-sm">Total Completion Letters</p>
                                        <p className="text-3xl font-bold">{completedInternships.length}</p>
                                    </div>
                                    <DocumentCheckIcon className="h-12 w-12 text-blue-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">Completed Internships</p>
                                        <p className="text-3xl font-bold">{completedInternships.length}</p>
                                    </div>
                                    <CheckCircleIcon className="h-12 w-12 text-green-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">Achievements</p>
                                        <p className="text-3xl font-bold">{completedInternships.length}</p>
                                    </div>
                                    <TrophyIcon className="h-12 w-12 text-purple-200" />
                                </div>
                            </div>
                        </div>

                        {/* Completion Letters Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {completedInternships.map((internship) => (
                                <div
                                    key={internship._id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Completion Letter Header */}
                                    <div className="relative h-48 overflow-hidden">
                                        {internship.thumbnail?.url ? (
                                            <img
                                                src={internship.thumbnail.url}
                                                alt={internship.internshipTitle || 'Internship Completion Letter'}
                                                title={internship.internshipTitle || 'Internship Completion Letter'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                                                <TrophyIcon className="h-12 w-12 text-white" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                Completion Letter
                                            </span>
                                        </div>
                                    </div>

                                    {/* Completion Letter Content */}
                                    <div className="p-6">
                                        <div className="text-center mb-4">
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">{internship.internshipTitle}</h4>
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>Completed Successfully</span>
                                            </div>
                                        </div>

                                        {/* Completion Letter Details */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 gap-1 sm:gap-4">
                                                <span className="text-sm text-gray-600 shrink-0">Internship</span>
                                                <span className="text-sm font-semibold text-gray-900 sm:text-right">{internship.internshipTitle}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 gap-1 sm:gap-4">
                                                <span className="text-sm text-gray-600 shrink-0">Status</span>
                                                <span className="text-sm font-semibold text-green-600 flex items-center sm:justify-end gap-1">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    Completed
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 sm:gap-4">
                                                <span className="text-sm text-gray-600 shrink-0">Document ID</span>
                                                <span className="text-sm font-mono text-gray-500 sm:text-right">
                                                    {auth?.user?._id && internship._id
                                                        ? `#${auth.user._id.slice(-6).toUpperCase()}-${internship._id.slice(-6).toUpperCase()}`
                                                        : `#${internship._id.slice(-8)}`
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const toastId = toast.loading('Downloading letter...');
                                                        const response = await api.get(
                                                            internship.downloadUrl,
                                                            {
                                                                responseType: 'blob',
                                                                headers: {
                                                                    'Accept': 'application/pdf'
                                                                }
                                                            }
                                                        );

                                                        // Create blob URL and trigger download
                                                        const blob = new Blob([response.data], { type: 'application/pdf' });
                                                        const url = window.URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = `InternKatta-Completion-Letter-${(internship.internshipTitle || 'Internship').replace(/\s/g, '-')}.pdf`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        window.URL.revokeObjectURL(url);

                                                        toast.success('Letter downloaded successfully!', { id: toastId });
                                                    } catch (error) {
                                                        console.error('Download error:', error);
                                                        toast.error(error.response?.data?.message || 'Failed to download letter');
                                                    }
                                                }}
                                                title={`Download completion letter for ${internship.internshipTitle || 'this internship'}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors group text-sm"
                                            >
                                                <ArrowDownTrayIcon className="h-4 w-4 group-hover:animate-bounce" />
                                                Download
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const certId = auth?.user?._id && internship._id 
                                                        ? `IK-INT-${auth.user._id.slice(-6).toUpperCase()}-${internship._id.toString().slice(-6).toUpperCase()}`
                                                        : internship._id;
                                                    const shareUrl = `https://internkatta.com/verify/${certId}`;
                                                    navigator.clipboard.writeText(shareUrl)
                                                        .then(() => toast.success('Link Copied!'))
                                                        .catch(() => {
                                                            const textArea = document.createElement("textarea");
                                                            textArea.value = shareUrl;
                                                            document.body.appendChild(textArea);
                                                            textArea.select();
                                                            try {
                                                                document.execCommand('copy');
                                                                toast.success('Link Copied!');
                                                            } catch (err) {
                                                                toast.error('Failed to copy link');
                                                            }
                                                            document.body.removeChild(textArea);
                                                        });
                                                }}
                                                title="Share verification link"
                                                className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <ShareIcon className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedImage(internship.thumbnail?.url || 'https://internkatta.com/outer.png');
                                                }}
                                                title="View completion letter full size"
                                                className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <TrophyIcon className="h-10 w-10 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Completion Letters Yet</h2>
                            <p className="text-gray-600 mb-8">Complete an internship 100% to earn your official completion letter!</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/user/internship"
                                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <BriefcaseIcon className="h-4 w-4" />
                                    My Internships
                                </Link>
                                <Link
                                    to="/internship"
                                    className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-md border border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <StarIcon className="h-4 w-4" />
                                    Browse Internships
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-white rounded-xl max-w-4xl w-full p-2 overflow-hidden shadow-2xl">
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-10 bg-slate-800/80 text-white rounded-full p-2 hover:bg-slate-700 transition"
                        >
                            ✕
                        </button>
                        <div className="max-h-[80vh] overflow-auto flex items-center justify-center">
                            <img src={selectedImage} alt="Completion Letter Preview" className="max-w-full h-auto rounded-lg object-contain" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InternshipLetter;