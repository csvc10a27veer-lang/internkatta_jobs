import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { 
    CheckCircleIcon, 
    ExclamationCircleIcon, 
    AcademicCapIcon, 
    ArrowPathIcon
} from '@heroicons/react/24/solid';

const VerificationPage = () => {
    const { certificateId } = useParams();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCertificateData = async () => {
            if (!certificateId) {
                setError('Certificate ID is missing in URL.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // Fetch the clean verification details from the backend route using axios
                const response = await axios.get(`${API_BASE_URL}/api/verify/${certificateId}`);
                
                const data = response.data;
                if (data && data.success && data.certificate) {
                    setCertificate(data.certificate);
                } else {
                    setError('Invalid verification data received.');
                }
            } catch (err) {
                console.error('Error fetching certificate details:', err);
                if (err.response?.status === 404 || err.response?.status === 403) {
                    setError('Certificate not found');
                } else {
                    setError(err.response?.data?.message || 'Certificate verification failed.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCertificateData();
    }, [certificateId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <ArrowPathIcon className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-600 font-body">Verifying Certificate...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-body">
                <div className="text-center max-w-lg w-full bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-red-100">
                    <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <ExclamationCircleIcon className="h-16 w-16 text-red-500" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 font-headline">Certificate Not Verified</h2>
                    <p className="text-slate-600 mb-8 font-body leading-relaxed text-lg">
                        We could not verify this certificate.<br/><br/>
                        The certificate ID provided is invalid, does not exist, or is no longer valid.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-slate-800 text-white font-semibold rounded-xl shadow hover:bg-slate-900 transition duration-300 font-body"
                    >
                        Return to InternKatta
                    </button>
                </div>
            </div>
        );
    }

    if (!certificate) {
        return null;
    }

    // Format date nicely
    const formatCertDate = (dt) => {
        if (!dt) return 'N/A';
        return new Date(dt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-body flex items-center justify-center">
            <Helmet>
                <title>Verified Certificate - {certificate.studentName}</title>
                <meta property="og:title" content={`Verified Certificate of Completion - ${certificate.studentName}`} />
                <meta property="og:description" content={`Verified Certificate of Completion for ${certificate.title} at InternKatta. Certificate ID: ${certificate.certificateId}.`} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 transform transition-all">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white relative">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <AcademicCapIcon className="h-8 w-8 text-white" />
                            <span className="text-2xl font-black tracking-wider font-headline">InternKatta</span>
                        </div>
                        <div className="mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md shadow-inner">
                            <CheckCircleIcon className="h-16 w-16 text-white drop-shadow-md" />
                        </div>
                        <h1 className="text-3xl font-bold font-headline mb-3 text-white drop-shadow">Certificate Verified</h1>
                        <p className="text-blue-100 font-medium text-sm md:text-base max-w-xs mx-auto leading-relaxed">
                            This certificate has been verified and is officially issued by InternKatta.
                        </p>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-8 md:p-10 space-y-7 bg-white relative">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awarded To</p>
                        <p className="text-2xl font-black text-slate-800 font-headline">{certificate.studentName}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Program</p>
                        <p className="text-xl font-bold text-slate-700">{certificate.title}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md uppercase tracking-widest border border-indigo-100">
                            {certificate.type}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Certificate ID</p>
                            <p className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded inline-block">{certificate.certificateId}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Issued Date</p>
                            <p className="font-bold text-slate-700">{formatCertDate(certificate.issueDate)}</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="font-bold tracking-wide uppercase text-sm">Status: Verified</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
