import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DownloadCertificate = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const downloadCertificate = async () => {
            const certificateId = searchParams.get('certificateId');
            const type = searchParams.get('type');

            if (!certificateId || !type) {
                setError('Invalid certificate link. Missing certificate ID or type.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Download the certificate PDF
                const response = await api.get('/api/users/certificate/download', {
                    params: { certificateId, type },
                    responseType: 'blob', // Important for PDF download
                });

                // Create a blob URL and trigger download
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                // Set filename based on type
                const filename = type === 'course' 
                    ? `Certificate-${certificateId}.pdf`
                    : `Internship-Letter-${certificateId}.pdf`;
                
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                // Show success message and redirect after a moment
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } catch (err) {
                console.error('Error downloading certificate:', err);
                setError(err.response?.data?.message || 'Failed to download certificate. Please try again.');
                setLoading(false);
            }
        };

        downloadCertificate();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Preparing your certificate download...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                    <div className="text-red-600 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Download Failed</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default DownloadCertificate;

