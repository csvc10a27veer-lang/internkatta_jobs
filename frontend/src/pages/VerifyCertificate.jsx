import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckBadgeIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';

function VerifyCertificate() {
    const { certificateId } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyCert = async () => {
            try {
                setLoading(true);
                // Call the public verify-certificate API
                const response = await api.get(`/api/users/verify-certificate/${certificateId}`);
                setCertificate(response.data.certificate);
            } catch (err) {
                console.error("Verification failed:", err);
                setError(err.response?.data?.message || "Certificate not found or invalid.");
            } finally {
                setLoading(false);
            }
        };

        if (certificateId) {
            verifyCert();
        }
    }, [certificateId]);

    const handleDownload = () => {
        if (!certificate) return;
        const certType = certificate.type || 'course';
        // Download via the public download route
        const downloadUrl = `https://internkatta.com/download-certificate?certificateId=${certificate.certificateId}&type=${certType}`;
        window.open(downloadUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-600">Verifying Certificate...</p>
                </div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
                    <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Certificate</h2>
                    <p className="text-gray-600 mb-6">{error || "This certificate could not be verified."}</p>
                    <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    const title = certificate.type === 'internship' ? certificate.internshipId?.title : certificate.courseId?.title;
    const recipientName = certificate.userId?.fullName;
    const issueDate = new Date(certificate.issueDate || certificate.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-center">
                        <CheckBadgeIcon className="h-20 w-20 mx-auto text-green-400 mb-4" />
                        <h1 className="text-3xl font-bold text-white">Certificate Verified ✓</h1>
                        <p className="text-blue-100 mt-2 text-lg">This is a valid, authentic certificate.</p>
                    </div>
                    
                    <div className="p-8 sm:p-12">
                        <div className="space-y-6">
                            <div className="border-b border-gray-100 pb-6">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Recipient</p>
                                <p className="text-2xl font-bold text-gray-900">{recipientName}</p>
                            </div>
                            
                            <div className="border-b border-gray-100 pb-6">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Program Completed</p>
                                <p className="text-xl font-semibold text-gray-800">{title}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Issued By</p>
                                    <p className="font-medium text-gray-800">Fourise Software Solutions Pvt. Ltd.</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Issue Date</p>
                                    <p className="font-medium text-gray-800">{issueDate}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Credential ID</p>
                                <p className="font-mono text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 inline-block">{certificate.certificateId}</p>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleDownload}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                Download PDF
                            </button>
                            <Link
                                to="/"
                                className="flex-1 flex items-center justify-center px-6 py-3 bg-white text-gray-700 border border-gray-300 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyCertificate;
