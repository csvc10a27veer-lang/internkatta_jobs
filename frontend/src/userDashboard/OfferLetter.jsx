// frontend/src/pages/userDashboard/OfferLetter.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
// import { useAuth } from '../context/AuthContext';
import { useUserAuth } from '../context/UserAuthContext';
import { DocumentTextIcon, ArrowDownTrayIcon, ExclamationCircleIcon, CalendarIcon, CheckCircleIcon, ShareIcon, EyeIcon, TrophyIcon, StarIcon, BriefcaseIcon } from '@heroicons/react/24/solid';

function OfferLetter() {
    const { auth } = useUserAuth();
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEnrolledInternships = async () => {
            if (!auth || !auth.token) {
                setError("You must be logged in to view your offer letters.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const { data } = await api.get('/api/users/my-internships', config);
                
                console.log('OfferLetter - API response:', data);
                
                // Ensure data is an array
                if (data && Array.isArray(data)) {
                    setInternships(data);
                } else if (data && data.data && Array.isArray(data.data)) {
                    setInternships(data.data);
                } else {
                    console.log('OfferLetter - Setting empty array, data was:', data);
                    setInternships([]);
                }
            } catch (err) {
                console.error("OfferLetter - Fetch internships error:", err);
                setError("Could not load your enrolled internships.");
                setInternships([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrolledInternships();
    }, [auth]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-600">Loading Your Offer Letters...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">My Offer Letters</h1>
                            <p className="text-gray-600 mt-2">Your official internship offer letters and documents</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Total Letters</p>
                                <p className="text-2xl font-bold text-blue-600">{internships?.length || 0}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Available</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {internships?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {internships && Array.isArray(internships) && internships.length > 0 ? (
                    <div className="space-y-6">
                        {/* Achievement Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white text-sm">Total Offer Letters</p>
                                        <p className="text-3xl font-bold">{internships.length}</p>
                                    </div>
                                    <DocumentTextIcon className="h-12 w-12 text-blue-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">Available</p>
                                        <p className="text-3xl font-bold">{internships.length}</p>
                                    </div>
                                    <CheckCircleIcon className="h-12 w-12 text-green-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">Internships</p>
                                        <p className="text-3xl font-bold">{internships.length}</p>
                                    </div>
                                    <BriefcaseIcon className="h-12 w-12 text-purple-200" />
                                </div>
                            </div>
                        </div>

                        {/* Offer Letters Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {internships.map((internship) => (
                                <div 
                                    key={internship._id} 
                                    className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Offer Letter Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-green-500 to-emerald-600 overflow-hidden">
                                        <img 
                                            src={internship.thumbnail?.url || '/api/placeholder/400/200'} 
                                            alt={internship.title} 
                                            className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute top-4 right-4">
                                            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                Offer Letter
                                            </div>
                                        </div>
                                    </div>

                                    {/* Offer Letter Content */}
                                    <div className="p-6">
                                        <div className="text-center mb-4">
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">{internship.title}</h4>
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>Available Now</span>
                                            </div>
                                        </div>

                                        {/* Offer Letter Details */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 gap-1 sm:gap-4">
                                                <span className="text-sm text-gray-600 shrink-0">Position</span>
                                                <span className="text-sm font-semibold text-gray-900 sm:text-right">{internship.title}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 gap-1 sm:gap-4">
                                                <span className="text-sm text-gray-600 shrink-0">Status</span>
                                                <span className="text-sm font-semibold text-green-600 flex items-center sm:justify-end gap-1">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    Available
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1 sm:gap-4">
                                                <span className="text-sm text-gray-600 shrink-0">Document ID</span>
                                                <span className="text-sm font-mono text-gray-500 sm:text-right">#{internship._id.slice(-8)}</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex justify-center">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const config = {
                                                            headers: { Authorization: `Bearer ${auth.token}` },
                                                            responseType: 'blob'
                                                        };
                                                        const response = await api.get(`/api/users/offer-letter/${internship._id}/download`, config);

                                                        const contentType = response.headers['content-type'] || '';
                                                        if (!contentType.includes('application/pdf')) {
                                                            const blobText = await response.data.text();
                                                            try {
                                                                const errJson = JSON.parse(blobText);
                                                                throw new Error(errJson.message || 'Failed to download PDF');
                                                            } catch (e) {
                                                                throw new Error('Server did not return a PDF');
                                                            }
                                                        }

                                                        const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
                                                        const url = window.URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = `InternKatta-Offer-Letter-${internship.title.replace(/\s/g, '-')}.pdf`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        window.URL.revokeObjectURL(url);
                                                    } catch (error) {
                                                        console.error('Error downloading offer letter:', error);
                                                        alert(error.message || 'Failed to download offer letter. Please try again.');
                                                    }
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors group"
                                            >
                                                <ArrowDownTrayIcon className="h-4 w-4 group-hover:animate-bounce" />
                                                Download
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
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <DocumentTextIcon className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Offer Letters Yet</h2>
                            <p className="text-gray-600 mb-8">Enroll in an internship program to receive your official offer letter!</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/internship" 
                                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <BriefcaseIcon className="h-4 w-4" />
                                    Browse Internships
                                </Link>
                                <Link 
                                    to="/user/internship" 
                                    className="px-6 py-3 bg-white text-green-600 font-semibold rounded-lg shadow-md border border-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <StarIcon className="h-4 w-4" />
                                    My Internships
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OfferLetter;