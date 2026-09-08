// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../utils/api';
// import { useUserAuth } from '../context/UserAuthContext';
// // import { useAuth } from '../context/AuthContext';
// import { AcademicCapIcon, ArrowDownTrayIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

// function Certificate() {
//     const { auth } = useUserAuth();
//     const [certificates, setCertificates] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchCertificates = async () => {
//             if (!auth || !auth.token) {
//                 setError("You must be logged in to view certificates.");
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 setLoading(true);
//                 const config = { headers: { Authorization: `Bearer ${auth.token}` } };

//                 const { data } = await api.get('/api/users/certificates', config);
//                 setCertificates(data);

//             } catch (err) {
//                 setError("Could not load your certificates at this time.");
//                 console.error("Fetch certificates error:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchCertificates();
//     }, [auth]);

//     if (loading) {
//         return <div className="p-8 text-center text-lg font-semibold text-gray-600">Loading Your Certificates...</div>;
//     }

//     if (error) {
//         return (
//             <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg m-4">
//                 <ExclamationCircleIcon className="h-12 w-12 mx-auto" />
//                 <p className="mt-4 font-semibold">{error}</p>
//             </div>
//         );
//     }

//     return (
//         <div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-8">My Certificates</h1>

//             {certificates.length > 0 ? (
//                 <div className="space-y-4">
//                     {certificates.map((cert) => (
//                         <div 
//                           key={cert._id}
//                           className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4"
//                         >
//                             <div className="flex items-center">
//                                 <AcademicCapIcon className="h-8 w-8 text-indigo-500 mr-4 flex-shrink-0" />
//                                 <h2 className="text-lg font-semibold text-gray-800 text-center sm:text-left">
//                                   {cert.courseTitle}
//                                 </h2>
//                             </div>

//                             {/* --- THIS IS THE FIX ---
//                                 The href now needs to include the user's token for authentication.
//                                 Since an <a> tag cannot send headers, we pass it as a query parameter.
//                                 We will update the backend middleware to read the token from here.
//                             */}
//                             <a
//                                 href={`${cert.downloadUrl}?token=${auth.token}`}
//                                 // The 'download' attribute is still useful but the backend handles the filename.
//                                 download
//                                 className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-300"
//                             >
//                                 <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
//                                 <span>Download</span>
//                             </a>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <div className="p-10 text-center bg-gray-50 rounded-lg">
//                     <p className="text-lg text-gray-600">
//                         You have no certificates yet. Complete a course 100% to earn one!
//                     </p>
//                     <Link to="/user/mycourse" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">
//                         Go to My Courses
//                     </Link>
//                 </div>
//             )}
//         </div>
//     );

// }

// export default Certificate; 
// frontend/src/pages/Certificate.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { AcademicCapIcon, ArrowDownTrayIcon, ExclamationCircleIcon, TrophyIcon, StarIcon, CalendarIcon, CheckCircleIcon, ShareIcon, EyeIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';

import toast from 'react-hot-toast';
import LinkedInShareModal from '../components/modals/LinkedInShareModal';

function Certificate() {
    const { auth } = useUserAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [linkedInModalOpen, setLinkedInModalOpen] = useState(false);
    const [selectedCertForLinkedIn, setSelectedCertForLinkedIn] = useState(null);
    const [verificationUrlForLinkedIn, setVerificationUrlForLinkedIn] = useState('');

    const handleCertificateDownload = async (cert) => {
        try {
            toast.loading('Downloading certificate...', { id: `cert-${cert._id}` });
            
            const cleanUrl = cert.downloadUrl.split('?')[0];
            const response = await api.get(cleanUrl, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            let filename = `${cert.courseTitle.replace(/\\s+/g, '_')}_Certificate.pdf`;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Certificate downloaded successfully!', { id: `cert-${cert._id}` });
        } catch (err) {
            console.error('Download failed:', err);
            toast.error('Failed to download certificate.', { id: `cert-${cert._id}` });
        }
    };

    useEffect(() => {
        const fetchCertificates = async () => {
            if (!auth || !auth.token) {
                setError("You must be logged in to view certificates.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const { data } = await api.get('/api/users/certificates');

                // Safely extract the array from the response data
                const certificateData = data.certificates || data || [];

                if (!Array.isArray(certificateData)) {
                    throw new Error("API response did not contain a valid array of certificates.");
                }

                setCertificates(certificateData);

            } catch (err) {
                setError("Could not load your certificates at this time.");
                console.error("Fetch certificates error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [auth]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-600">Loading Your Certificates...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
                            <p className="text-gray-600 mt-2">Your achievements and completed certifications</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Total Certificates</p>
                                <p className="text-2xl font-bold text-blue-600">{certificates.length}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Achievements</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {certificates.length > 0 ? '🏆' : '⭐'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {certificates.length > 0 ? (
                    <div className="space-y-6">
                        {/* Achievement Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Certificates</p>
                                        <p className="text-3xl font-bold">{certificates.length}</p>
                                    </div>
                                    <TrophyIcon className="h-12 w-12 text-blue-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">Completed Courses</p>
                                        <p className="text-3xl font-bold">{certificates.length}</p>
                                    </div>
                                    <CheckCircleIcon className="h-12 w-12 text-green-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">Skills Mastered</p>
                                        <p className="text-3xl font-bold">{certificates.length}</p>
                                    </div>
                                    <StarIcon className="h-12 w-12 text-purple-200" />
                                </div>
                            </div>
                        </div>

                        {/* Certificates Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {certificates.map((cert, index) => (
                                <div
                                    key={cert._id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Certificate Header */}
                                    <div className="relative h-48 overflow-hidden">
                                        {cert.thumbnailUrl ? (
                                            <>
                                                <img
                                                    src={`${cert.thumbnailUrl}?v=${Math.random()}&t=${Date.now()}`}
                                                    alt={cert.courseTitle}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.log('Image failed to load:', cert.thumbnailUrl);
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center" style={{ display: 'none' }}>
                                                    <div className="text-center">
                                                        <h3 className="text-lg font-bold text-white mb-1">Certificate of Completion</h3>
                                                        <p className="text-blue-100 text-sm">InternKatta Academy</p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <h3 className="text-lg font-bold text-white mb-1">Certificate of Completion</h3>
                                                    <p className="text-blue-100 text-sm">InternKatta Academy</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Certificate Content */}
                                    <div className="p-6">
                                        <div className="text-center mb-4">
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">{cert.courseTitle}</h4>
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>Completed Recently</span>
                                            </div>
                                        </div>

                                        {/* Certificate Details */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-600">Course</span>
                                                <span className="text-sm font-semibold text-gray-900">{cert.courseTitle}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm text-gray-600">Status</span>
                                                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    Completed
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-sm text-gray-600">Certificate ID</span>
                                                <span className="text-sm font-mono text-gray-500">
                                                    {auth?.user?._id && cert._id
                                                        ? `#${auth.user._id.slice(-6).toUpperCase()}-${cert._id.slice(-6).toUpperCase()}`
                                                        : `#${cert._id.slice(-8)}`
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleCertificateDownload(cert)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors group"
                                                >
                                                    <ArrowDownTrayIcon className="h-4 w-4 group-hover:animate-bounce" />
                                                    Download
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const certId = cert.certificateId || (auth?.user?._id && cert._id 
                                                            ? `IK-${auth.user._id.slice(-6).toUpperCase()}-${cert._id.slice(-6).toUpperCase()}`
                                                            : cert._id);
                                                        const shareUrl = `${window.location.origin}/verify/${certId}`;
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
                                                        setSelectedImage(cert.thumbnailUrl || 'https://internkatta.com/outer.png');
                                                    }}
                                                    title="View certificate full size"
                                                    className="hidden sm:flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                            
                                            <button 
                                                onClick={() => {
                                                    const certId = cert.certificateId || (auth?.user?._id && cert._id 
                                                        ? `IK-${auth.user._id.slice(-6).toUpperCase()}-${cert._id.slice(-6).toUpperCase()}`
                                                        : cert._id);
                                                    const url = `${window.location.origin}/verify/${certId}`;
                                                    setSelectedCertForLinkedIn(cert);
                                                    setVerificationUrlForLinkedIn(url);
                                                    setLinkedInModalOpen(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0a66c2] text-white font-semibold rounded-lg hover:bg-[#004182] transition-colors shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                                </svg>
                                                Add to LinkedIn
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
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <TrophyIcon className="h-10 w-10 text-yellow-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Certificates Yet</h2>
                            <p className="text-gray-600 mb-8">Complete your courses to earn certificates and showcase your achievements!</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/user/mycourse"
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <AcademicCapIcon className="h-4 w-4" />
                                    My Courses
                                </Link>
                                <Link
                                    to="/courses"
                                    className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md border border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <StarIcon className="h-4 w-4" />
                                    Browse Courses
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl w-full flex justify-center">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Certificate Full View" 
                            className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* LinkedIn Share Modal */}
            <LinkedInShareModal
                isOpen={linkedInModalOpen}
                onClose={() => setLinkedInModalOpen(false)}
                certificate={selectedCertForLinkedIn}
                verificationUrl={verificationUrlForLinkedIn}
            />
        </div>
    );

}

export default Certificate;