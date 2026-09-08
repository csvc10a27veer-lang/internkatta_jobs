import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigationWithLoading } from '../hooks/useNavigationWithLoading';
import { useCompletionStatus } from '../hooks/useCompletionStatus';
import { CartContext } from '../context/CartContext';
import PaymentButton from '../components/PaymentButton';
import Certificate from '../components/Certificate';
import TagChip from '../components/ui/TagChip';
import SEO from '../components/SEO';
import GenericProjectIllustration from '../components/GenericProjectIllustration';
import { getShortDescription } from '../utils/text';
import toast from 'react-hot-toast';
import {
    StarIcon,
    ClockIcon,
    UserGroupIcon,
    CurrencyRupeeIcon,
    ArrowLeftIcon,
    CogIcon,
    ChatBubbleLeftRightIcon,
    CubeIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    ShareIcon,
    TrophyIcon,
    LockClosedIcon,
    ChevronDownIcon,
    PlayCircleIcon,
    TagIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/solid';

const InternshipDetail = () => {
    const { id } = useParams();
    const { auth } = useUserAuth();
    const [searchParams] = useSearchParams();
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('about');
    const [currentPage, setCurrentPage] = useState(1);
    const curriculumRef = useRef(null);

    // Reset pagination when tab changes
    useEffect(() => {
        if (activeTab === 'curriculum') {
            setCurrentPage(1);
        }
    }, [activeTab]);
    const [isCopied, setIsCopied] = useState(false);
    const [showSampleCertificate, setShowSampleCertificate] = useState(false);
    const { navigateWithLoading } = useNavigationWithLoading();
    const { isCompleted, isEnrolled, completionData, loading: completionLoading } = useCompletionStatus(id, 'internship');
    const { addToCart, cart } = useContext(CartContext);

    const isInCart = cart && cart.some(item => item.itemId === internship?._id);

    const handleCertificateDownload = async () => {
        try {
            toast.loading('Downloading certificate...', { id: 'cert-download' });
            const response = await api.get(`/api/users/internship-letter/${id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            let filename = `${internship.title.replace(/\\s+/g, '_')}_Certificate.pdf`;
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

            toast.success('Certificate downloaded successfully!', { id: 'cert-download' });
        } catch (err) {
            console.error('Download failed:', err);
            toast.error('Failed to download certificate.', { id: 'cert-download' });
        }
    };

    // Scroll to top when component mounts or ID changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [id]);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/v1/internships/public/${id}`);
                setInternship(response.data);
                setError(null);
            } catch (err) {
                setError("Failed to load internship details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);



    // Filter navigation handlers
    const handleFilterClick = (filterType, filterValue) => {
        const params = new URLSearchParams();
        params.set(filterType, filterValue);
        navigateWithLoading(`/internship?${params.toString()}`);
    };

    if (loading) return <div className="text-center py-20">Loading internship details...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!internship) return null;

    // Dynamic SEO data
    const seoTitle = `${internship.title} - Internship Program | InternKatta`;
    const seoDescription = internship.description
        ? `${internship.description.substring(0, 155)}...`
        : `Learn ${internship.title} with expert-led online internship. Lifetime access, quizzes, exercises, and certification.`;
    const seoImage = internship.thumbnail?.url || 'https://internkatta.com/og-image.jpg';
    const seoUrl = `https://internkatta.com/course/${internship._id}`;

    const internshipStructuredData = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": internship.title,
        "description": internship.description || "",
        "provider": {
            "@type": "Organization",
            "name": "InternKatta",
            "url": "https://internkatta.com"
        },
        "courseCode": internship._id,
        "educationalCredentialAwarded": "Certificate",
        "instructor": {
            "@type": "Person",
            "name": internship.tutor || "Expert Instructor"
        },
        "offers": {
            "@type": "Offer",
            "price": internship.discountedPrice || internship.price || 0,
            "priceCurrency": "INR"
        },
        "image": seoImage
    };

    const renderPurchaseButton = (customClass, additionalProps = {}) => {
        const AddToCartBtn = !isInCart ? (
            <button 
                onClick={() => addToCart('Internship', internship._id)}
                className={`w-full ${customClass ? 'sm:flex-1 px-4 py-3 text-sm whitespace-nowrap mt-4 sm:mt-0' : 'sm:flex-1 mt-4 sm:mt-0 py-3'} bg-white text-[#0052A3] font-bold rounded-lg shadow-sm border-2 border-[#0052A3] hover:bg-blue-50 flex items-center justify-center gap-1.5`}
            >
                <ShoppingCartIcon className="w-4 h-4" /> Add to Cart
            </button>
        ) : (
            <Link
                to="/cart"
                className={`w-full ${customClass ? 'sm:flex-1 px-4 py-3 text-sm whitespace-nowrap mt-4 sm:mt-0' : 'sm:flex-1 mt-4 sm:mt-0 py-3'} bg-green-50 text-green-700 font-bold rounded-lg shadow-sm border-2 border-green-600 hover:bg-green-100 flex items-center justify-center gap-1.5 text-center`}
            >
                <CheckCircleIcon className="w-4 h-4" /> Added to Cart
            </Link>
        );

        if (isEnrolled) {
            return (
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 w-full">
                    <Link to={`/user/internship-player/${internship._id}`} className={`${customClass || "w-full sm:w-auto mt-4 sm:mt-0 py-3 px-8 bg-[#0052A3] text-white font-bold rounded-lg shadow-lg hover:bg-[#004085] flex items-center justify-center gap-2"} text-center`}>
                        Go to Internship {customClass && <ArrowRightIcon className="h-5 w-5" />}
                    </Link>
                    {additionalProps.extraButton}
                </div>
            );
        }

        return (
            <PaymentButton
                itemId={internship._id}
                itemType="internship"
                price={internship.discountedPrice || internship.price}
                title={internship.title}
                className={customClass || "w-full sm:flex-1 mt-4 sm:mt-0 py-3 bg-[#0052A3] text-white font-bold rounded-lg shadow-lg hover:bg-[#004085]"}
                // If returning from login with autopay=1, auto-trigger payment
                autoTrigger={searchParams.get('autopay') === '1'}
                {...additionalProps}
                extraButton={
                    <>
                        {additionalProps.extraButton}
                        {AddToCartBtn}
                    </>
                }
            >
                Register Now {customClass && <ArrowRightIcon className="h-5 w-5" />}
            </PaymentButton>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title={seoTitle}
                description={seoDescription}
                keywords={`${internship.title}, online internship, ${internship.category?.name || ''}, ${internship.difficulty || ''}, certification, ${internship.tutor || ''}`}
                image={seoImage}
                url={seoUrl}
                structuredData={internshipStructuredData}
            />
            {/* Hero Section with 2-Column Layout */}
            <div className="bg-[#012065] relative overflow-hidden text-white">
                {/* Dynamic curved shape pattern in background */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-b from-[#00A3FF] to-transparent opacity-20 rounded-bl-[100%]"></div>
                <div className="absolute -bottom-20 right-20 w-64 h-64 bg-[#00A3FF] rounded-full blur-3xl opacity-30"></div>

                <div className="max-w-container mx-auto px-4 sm:px-6 py-12 md:py-16 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        {/* Left Column: Content */}
                        <div>
                            {/* Breadcrumb */}
                            <div className="mb-6 flex items-center gap-2 text-sm text-blue-200">
                                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                                <span>&gt;</span>
                                <Link to="/internship" className="hover:text-white transition-colors">Internships</Link>
                                <span>&gt;</span>
                                <span className="text-white font-medium">{internship.title}</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                                {internship.title}
                            </h1>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium border border-white/20">
                                    {internship.difficulty || 'Beginner'}
                                </span>
                                <span className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium border border-white/20">
                                    {internship.duration || '1 Month'}
                                </span>
                                <span className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium border border-white/20">
                                    {internship.category?.name || 'General'}
                                </span>
                                {internship.mode && (
                                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium border border-white/20">
                                        {internship.mode}
                                    </span>
                                )}
                            </div>

                            <div className={`text-blue-100 mb-6 sm:mb-8 max-w-xl leading-relaxed whitespace-pre-wrap md:text-lg ${
                                (internship.smallDescription || internship.description || '').length > 300 ? 'text-sm' :
                                (internship.smallDescription || internship.description || '').length > 150 ? 'text-base' : 'text-lg'
                            }`}>
                                <span className="md:hidden">{internship.smallDescription || internship.description || ''}</span>
                                <span className="hidden md:inline">{internship.smallDescription || getShortDescription(internship.description, 150)}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row items-end gap-6">
                                <div className="w-full sm:w-auto">
                                    {renderPurchaseButton("w-full sm:flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap text-sm", {
                                        couponLinkTextColor: 'text-blue-200 hover:text-white mb-2',
                                        extraButton: (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        if (navigator.clipboard && window.isSecureContext) {
                                                            await navigator.clipboard.writeText(window.location.href);
                                                        } else {
                                                            const textArea = document.createElement('textarea');
                                                            textArea.value = window.location.href;
                                                            textArea.style.position = 'fixed';
                                                            textArea.style.left = '-999999px';
                                                            textArea.style.top = '-999999px';
                                                            document.body.appendChild(textArea);
                                                            textArea.focus();
                                                            textArea.select();
                                                            document.execCommand('copy');
                                                            textArea.remove();
                                                        }
                                                        setIsCopied(true);
                                                        setTimeout(() => setIsCopied(false), 2000);
                                                    } catch (err) {
                                                        console.error('Failed to copy: ', err);
                                                    }
                                                }}
                                                className={`w-full sm:flex-1 flex-shrink-0 px-4 py-3 flex items-center justify-center gap-1.5 border rounded-lg font-semibold transition-colors whitespace-nowrap text-sm ${isCopied
                                                        ? 'bg-green-500/20 border-green-400 text-green-300'
                                                        : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40 text-white'
                                                    }`}
                                            >
                                                {isCopied ? <><CheckCircleIcon className="h-4 w-4" /> Copied!</> : <><ShareIcon className="h-4 w-4" /> Copy link</>}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Image */}
                        <div className="relative hidden lg:block">
                            {/* Decorative background circle behind image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 rounded-full blur-2xl"></div>

                            <img
                                src={internship.bannerImage?.url || internship.thumbnail?.url || 'https://internkatta.com/og-image.jpg'}
                                alt={internship.title}
                                className="relative z-10 w-full max-w-lg mx-auto object-contain drop-shadow-2xl rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Facts Strip */}
            <div className="hidden md:block relative z-20 max-w-container mx-auto px-4 sm:px-6 mb-12">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 md:p-6 -mt-8 mx-2 sm:mx-0 grid grid-cols-2 md:flex md:flex-wrap lg:flex-nowrap justify-center lg:justify-between items-start md:items-center gap-y-6 gap-x-4 md:gap-8 lg:gap-6 lg:divide-x lg:divide-y-0 divide-gray-100">
                    <div className="flex items-start md:items-center gap-3 md:px-4 flex-1 md:flex-none lg:flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0"><ClockIcon className="h-5 w-5 md:h-6 md:w-6" /></div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium mb-0.5 md:mb-0">Duration</p>
                            <p className="font-bold text-sm md:text-base text-gray-900 break-words leading-tight">{internship.duration || '1 Month'}</p>
                        </div>
                    </div>
                    <div className="flex items-start md:items-center gap-3 md:px-4 flex-1 md:flex-none lg:flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0"><svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium mb-0.5 md:mb-0">Level</p>
                            <p className="font-bold text-sm md:text-base text-gray-900 break-words leading-tight">{internship.difficulty || 'Beginner'}</p>
                        </div>
                    </div>
                    <div className="flex items-start md:items-center gap-3 md:px-4 flex-1 md:flex-none lg:flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0"><svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium mb-0.5 md:mb-0">Mode</p>
                            <p className="font-bold text-sm md:text-base text-gray-900 break-words leading-tight">{internship.mode || 'Online'}</p>
                        </div>
                    </div>
                    <div className="flex items-start md:items-center gap-3 md:px-4 flex-1 md:flex-none lg:flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0"><svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium mb-0.5 md:mb-0">Projects</p>
                            <p className="font-bold text-sm md:text-base text-gray-900 break-words leading-tight">{internship.projectsCount ? (internship.projectsCount === 1 ? '1 Major Project' : `${internship.projectsCount} Projects`) : '1 Major Project'}</p>
                        </div>
                    </div>
                    <div className="flex items-start md:items-center gap-3 md:px-4 flex-1 md:flex-none lg:flex-1">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0"><TrophyIcon className="h-5 w-5 md:h-6 md:w-6" /></div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium mb-0.5 md:mb-0">Certificate</p>
                            <p className="font-bold text-sm md:text-base text-gray-900 break-words leading-tight">{internship.hasCertificate !== false ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-container mx-auto px-4 sm:px-6 pb-12">
                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 sm:space-x-12 justify-between max-w-2xl mx-auto px-4 sm:px-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab('about')}
                                className={`py-4 px-1 border-b-2 font-semibold text-lg md:text-xl ${activeTab === 'about'
                                        ? 'border-blue-600 text-gray-900'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                    }`}
                            >
                                About
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('projects')}
                                className={`py-4 px-1 border-b-2 font-semibold text-lg md:text-xl ${activeTab === 'projects'
                                        ? 'border-blue-600 text-gray-900'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                    }`}
                            >
                                Projects
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('curriculum')}
                                className={`py-4 px-1 border-b-2 font-semibold text-lg md:text-xl ${activeTab === 'curriculum'
                                        ? 'border-blue-600 text-gray-900'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                    }`}
                            >
                                Curriculum
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === 'about' && (
                            <div className="space-y-8 lg:space-y-12 animate-fade-in mt-4">
                                {/* About Section Top */}
                                <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
                                    <div className="text-left">
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                            About This {internship.category?.name?.toLowerCase().includes('internship') ? 'Internship' : 'Course'}
                                        </h2>
                                        <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap max-w-4xl">
                                            {internship.description}
                                        </p>
                                    </div>
                                </div>

                                {/* 4 Features Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2 text-lg">Hands-on Learning</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">20+ practical tasks with real datasets</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2 text-lg">Real-world Projects</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">Work on industry-relevant {internship.category?.name || internship.title} projects</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2 text-lg">Mentor Guidance</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">Get feedback and support from industry mentors</p>
                                        </div>
                                    </div>
                                    {internship.hasCertificate !== false && (
                                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-2 text-lg">Certificate of Completion</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed">Earn a certificate after successful completion</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Learning Objectives */}
                                <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
                                    <div className="mb-6 lg:mb-8 text-left">
                                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                                    </div>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
                                            {internship.whatYouWillLearn && internship.whatYouWillLearn.length > 0 ? (
                                                internship.whatYouWillLearn.map((item, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                                                        <span className="text-gray-700 font-medium">{item}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <>
                                                    <li className="flex items-start">
                                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                                                        <span className="text-gray-700 font-medium">Master fundamental concepts and best practices</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                                                        <span className="text-gray-700 font-medium">Build real-world {internship.category?.name || 'technology'} projects</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                                                        <span className="text-gray-700 font-medium">Develop problem-solving and critical thinking skills</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                                                        <span className="text-gray-700 font-medium">Gain hands-on experience with industry tools</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                                                        <span className="text-gray-700 font-medium">Prepare for professional development roles</span>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Tools & Prerequisites Side by Side */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Tools & Technologies</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {internship.toolsAndTechnologies && internship.toolsAndTechnologies.length > 0 ? (
                                                    internship.toolsAndTechnologies.map((tool, idx) => (
                                                        <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">{tool}</span>
                                                    ))
                                                ) : (
                                                    <>
                                                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">{internship.category?.name || 'Technology'}</span>
                                                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">Industry Tools</span>
                                                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">Best Practices</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-[#E6FAEF] rounded-2xl p-8 border border-[#B3F0D1]">
                                            <h3 className="text-xl font-bold text-green-900 mb-4">Prerequisites</h3>
                                            <ul className="space-y-3">
                                                {internship.prerequisites && internship.prerequisites.length > 0 ? (
                                                    internship.prerequisites.map((prereq, idx) => (
                                                        <li key={idx} className="flex items-start">
                                                            <svg className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                            <span className="text-green-900 font-medium">{prereq}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <>
                                                        <li className="flex items-start">
                                                            <svg className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                            <span className="text-green-900 font-medium">Basic understanding of computers</span>
                                                        </li>
                                                        <li className="flex items-start">
                                                            <svg className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                            <span className="text-green-900 font-medium">No prior {internship.category?.name || 'technical'} experience required</span>
                                                        </li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="space-y-8 lg:space-y-12 animate-fade-in mt-4">
                                <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
                                    <div className="mb-6 lg:mb-8 text-left">
                                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Projects You'll Build</h3>
                                        <p className="text-gray-700 text-base sm:text-lg leading-relaxed max-w-4xl">
                                            Apply what you learn by building practical, real-world projects that enhance your portfolio.
                                        </p>
                                    </div>

                                    {/* Project Cards Array Setup */}
                                    {(() => {
                                        const displayProjects = internship.projects && internship.projects.length > 0 ? internship.projects : [
                                            {
                                                title: internship.projectsCount > 1 ? "Major Capstone Project" : "1 Major Project",
                                                description: internship.description
                                                    ? "Build a complete, real-world application from scratch. This comprehensive project will test your understanding of core concepts and industry best practices."
                                                    : "End-to-end implementation applying all the skills learned throughout the internship.",
                                                technologies: internship.toolsAndTechnologies && internship.toolsAndTechnologies.length > 0
                                                    ? internship.toolsAndTechnologies.slice(0, 4)
                                                    : (internship.category?.name ? [internship.category?.name] : []),
                                                highlights: [
                                                    "End-to-end implementation",
                                                    "Real-world scenario",
                                                    "Apply course skills",
                                                    "Mentor reviewed"
                                                ],
                                                isFeatured: true
                                            }
                                        ];

                                        return (
                                            <div className={`grid gap-8 ${displayProjects.length === 1 ? 'grid-cols-1' : displayProjects.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                                                {displayProjects.map((proj, idx) => (
                                                    <div key={idx} className={`group bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 ${displayProjects.length === 1 ? 'md:flex md:flex-row' : 'flex flex-col'}`}>

                                                        {/* Project Visual Area */}
                                                        <div className={`bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-8 relative border-b md:border-b-0 md:border-r border-gray-200 ${displayProjects.length === 1 ? 'md:w-2/5' : 'h-56'}`}>
                                                            <div className="absolute top-4 left-4">
                                                                <span className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                                                                    Project {idx + 1}
                                                                </span>
                                                            </div>
                                                            {proj.isFeatured && (
                                                                <div className="absolute top-4 right-4">
                                                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-yellow-200 flex items-center gap-1.5">
                                                                        <StarIcon className="w-3.5 h-3.5" /> Featured
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {/* Icon or Image Placeholder */}
                                                            <div className="bg-white p-6 rounded-2xl shadow-sm transform group-hover:scale-105 transition-transform duration-300 border border-blue-100">
                                                                <GenericProjectIllustration className="w-32 h-32 sm:w-40 sm:h-40 transform hover:scale-105 transition-transform duration-500 drop-shadow-xl" />
                                                            </div>
                                                        </div>

                                                        {/* Project Details Area */}
                                                        <div className={`p-8 bg-white ${displayProjects.length === 1 ? 'md:w-3/5 flex flex-col justify-center' : 'flex-1 flex flex-col'}`}>
                                                            <h4 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{proj.title}</h4>
                                                            <p className="text-gray-600 mb-6 leading-relaxed">
                                                                {proj.description}
                                                            </p>

                                                            {proj.technologies && proj.technologies.length > 0 && (
                                                                <div className="mb-8">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {proj.technologies.map((tech, tIdx) => (
                                                                            <span key={tIdx} className="bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-200">
                                                                                {tech}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className={`grid gap-3 ${displayProjects.length === 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 xl:grid-cols-2 mt-auto'}`}>
                                                                {(proj.highlights || [
                                                                    "End-to-end implementation",
                                                                    "Real-world scenario",
                                                                    "Apply course skills",
                                                                    "Mentor reviewed"
                                                                ]).map((highlight, hIdx) => (
                                                                    <div key={hIdx} className="flex items-center text-sm text-gray-700 bg-gray-50 py-2.5 px-4 rounded-lg border border-gray-100">
                                                                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                                                        <span className="font-medium">{highlight}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    {/* Real-world Callout */}
                                    <div className="mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl">
                                        <div className="bg-white p-3 rounded-xl shadow-sm flex-shrink-0">
                                            <StarIcon className="w-6 h-6 text-yellow-500" />
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <h4 className="font-bold text-gray-900 text-lg mb-1">Industry-Ready Portfolio</h4>
                                            <p className="text-gray-700 leading-relaxed">All projects use real-world datasets and are reviewed by industry mentors to ensure you meet professional standards.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative overflow-hidden bg-gradient-to-br from-[#F7FAFF] to-[#EEF5FF] rounded-3xl p-8 lg:p-10 border border-blue-50 mt-8 shadow-[0_8px_30px_rgb(1,32,101,0.04)]">
                                    {/* Subtle Decorative Background Elements */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100/30 rounded-full blur-2xl pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
                                    <svg className="absolute right-10 bottom-10 w-24 h-24 text-blue-500/5 pointer-events-none transform rotate-12" viewBox="0 0 100 100" fill="currentColor">
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                                    </svg>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100/50 text-[#012065]">
                                                <StarIcon className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-[#012065]">Skills You'll Gain</h3>
                                        </div>
                                        <p className="text-gray-600 mb-8 text-lg">Build practical skills that you can apply across real-world projects.</p>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            {(internship.skills && internship.skills.length > 0 ? internship.skills : [
                                                "Data Analysis", "Dashboard Design", "Real-world Problem Solving", "Analytical Thinking"
                                            ]).map((skill, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#012065] rounded-full font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                                                >
                                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'curriculum' && (
                            <div ref={curriculumRef} className="bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 mt-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] scroll-mt-24">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Detailed Curriculum
                                    </h2>
                                    <p className="text-gray-500">Step-by-step learning path with practical lessons</p>
                                </div>

                                {internship.introVideoUrl && (
                                    <div className="mb-10">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <PlayCircleIcon className="w-5 h-5 text-blue-500" />
                                            Course Preview
                                        </h3>
                                        <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden bg-gray-900 shadow-lg">
                                            <video
                                                controls
                                                className="w-full h-full object-cover"
                                                src={internship.introVideoUrl}
                                                controlsList="nodownload"
                                            >
                                                Your browser does not support HTML video.
                                            </video>
                                        </div>
                                    </div>
                                )}

                                {(() => {
                                    const allLectures = internship.lectures || [];

                                    if (allLectures.length === 0) {
                                        return <p className="text-gray-500 italic text-center py-8 bg-gray-50 rounded-2xl">No curriculum available yet.</p>;
                                    }

                                    const itemsPerPage = 10;
                                    const totalPages = Math.ceil(allLectures.length / itemsPerPage);
                                    const paginatedLectures = allLectures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                                    const handlePageChange = (newPage) => {
                                        setCurrentPage(newPage);
                                        if (curriculumRef.current) {
                                            const yOffset = -100;
                                            const y = curriculumRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                            window.scrollTo({ top: y, behavior: 'smooth' });
                                        }
                                    };

                                    return (
                                        <>
                                            <div className="mb-6 flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                                    {allLectures.length} Lesson{allLectures.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {paginatedLectures.map((lecture, lIndex) => {
                                                    const absoluteIndex = (currentPage - 1) * itemsPerPage + lIndex + 1;
                                                    const paddedNumber = absoluteIndex.toString().padStart(2, '0');
                                                    
                                                    return (
                                                        <div key={lIndex} className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 sm:p-5 hover:border-blue-100 hover:shadow-md transition-all flex items-center gap-4 group">
                                                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-[#012065] font-bold text-base sm:text-lg shrink-0">
                                                                {paddedNumber}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-gray-800 text-[13px] sm:text-sm md:text-base flex items-center gap-2 group-hover:text-[#012065] transition-colors leading-snug">
                                                                    <span>{lecture.lectureTitle}</span>
                                                                </h4>
                                                            </div>
                                                            <div className="shrink-0">
                                                                <PlayCircleIcon className="w-6 h-6 text-blue-300 group-hover:text-blue-500 transition-colors" />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {totalPages > 1 && (
                                                <div className="mt-8 flex items-center justify-center sm:justify-between gap-2 sm:gap-4 border-t border-gray-100 pt-6">
                                                    <button
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                                        aria-label="Previous page"
                                                    >
                                                        <ArrowLeftIcon className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Previous</span>
                                                    </button>

                                                    <div className="flex items-center gap-1.5">
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                                            // Logic for ellipsis
                                                            if (
                                                                pageNum === 1 || 
                                                                pageNum === totalPages || 
                                                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                                            ) {
                                                                return (
                                                                    <button
                                                                        key={pageNum}
                                                                        onClick={() => handlePageChange(pageNum)}
                                                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                                                            currentPage === pageNum
                                                                                ? 'bg-[#012065] text-white shadow-sm'
                                                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                                                                        }`}
                                                                        aria-label={`Go to page ${pageNum}`}
                                                                        aria-current={currentPage === pageNum ? 'page' : undefined}
                                                                    >
                                                                        {pageNum}
                                                                    </button>
                                                                );
                                                            } else if (
                                                                pageNum === currentPage - 2 || 
                                                                pageNum === currentPage + 2
                                                            ) {
                                                                return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                                                            }
                                                            return null;
                                                        })}
                                                    </div>

                                                    <button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                                        aria-label="Next page"
                                                    >
                                                        <span className="hidden sm:inline">Next</span>
                                                        <ArrowRightIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 items-start">
                            {/* Program At a Glance */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                <div className="bg-[#012065] text-white py-4 px-6">
                                    <h3 className="text-lg font-bold">Program At a Glance</h3>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <ul className="grid grid-cols-1 gap-4 lg:gap-5 mb-6">
                                        <li className="flex items-start gap-4">
                                            <ClockIcon className="h-6 w-6 text-blue-600 shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Duration</p>
                                                <p className="font-semibold text-gray-900 text-sm">{internship.duration || '1 Month'}</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <svg className="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Level</p>
                                                <p className="font-semibold text-gray-900 text-sm">{internship.difficulty || 'Beginner'}</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <TagIcon className="h-6 w-6 text-blue-600 shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Domain</p>
                                                <p className="font-semibold text-gray-900 text-sm">{internship.category?.name || 'General'}</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <svg className="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Mode</p>
                                                <p className="font-semibold text-gray-900 text-sm">{internship.mode || 'Online'}</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <svg className="h-6 w-6 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Projects</p>
                                                <p className="font-semibold text-gray-900 text-sm">{internship.projectsCount ? (internship.projectsCount === 1 ? '1 Major Project' : `${internship.projectsCount} Projects`) : '1 Major Project'}</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <TrophyIcon className="h-6 w-6 text-blue-600 shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Certificate</p>
                                                <p className="font-semibold text-gray-900 text-sm">{internship.hasCertificate !== false ? 'Yes, on completion' : 'No'}</p>
                                            </div>
                                        </li>

                                    </ul>
                                    <div className="mt-auto">
                                        {renderPurchaseButton("w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow hover:from-orange-600 hover:to-orange-700 transition-all text-center flex items-center justify-center gap-2")}
                                    </div>
                                </div>
                            </div>

                            {/* Certificate Card */}
                            {isCompleted && completionData ? (
                                <div className="bg-white border-2 border-yellow-200 rounded-xl p-4 w-full flex flex-col">
                                    <Certificate
                                        type="internship"
                                        title={internship.title}
                                        userName={auth?.user?.fullName || 'Student'}
                                        completedDate={completionData.completedDate}
                                        duration={internship.duration || 'Self-paced'}
                                        category={internship.category?.name || 'General'}
                                        onDownload={handleCertificateDownload}
                                    />
                                </div>
                            ) : (
                                <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 relative overflow-hidden w-full flex flex-col">
                                    {/* Decorative Stars */}
                                    <StarIcon className="absolute top-4 left-6 h-4 w-4 text-orange-200" />
                                    <StarIcon className="absolute top-1/2 right-3 h-5 w-5 text-yellow-200" />
                                    <StarIcon className="absolute bottom-16 left-3 h-6 w-6 text-orange-200/60" />

                                    <div className="absolute top-2 right-2 z-0">
                                        <TrophyIcon className="h-24 w-24 text-yellow-300 opacity-60 transform rotate-12" />
                                    </div>

                                    <div className="relative z-10 pr-24">
                                        <h4 className="font-bold text-gray-900 mb-1 text-lg">Certificate of Completion</h4>
                                        <p className="text-sm text-gray-700 mb-4">Complete all tasks and projects to receive</p>
                                    </div>

                                    <ul className="space-y-3 mb-6 relative z-10 flex-1">
                                        <li className="flex items-start gap-2">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                                            <span className="text-sm text-gray-700 pr-8">Verified & shareable certificate</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                                            <span className="text-sm text-gray-700 pr-8">Boosts your resume and LinkedIn profile</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                                            <span className="text-sm text-gray-700 pr-8">Recognized by InternKatta</span>
                                        </li>
                                    </ul>

                                    <div className="mt-auto relative z-10">
                                        <button
                                            onClick={() => setShowSampleCertificate(true)}
                                            className="w-full py-2.5 bg-white border border-orange-400 text-orange-500 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
                                        >
                                            View Certificate Sample
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sample Certificate Modal */}
            {showSampleCertificate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSampleCertificate(false)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">Sample Certificate</h3>
                            <button
                                onClick={() => setShowSampleCertificate(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 md:p-8 bg-gray-100 flex items-center justify-center">
                            <div
                                className="relative bg-[#FAFAFA] p-4 sm:p-8 md:p-10 flex flex-col justify-between shadow-xl ring-1 ring-gray-900/5"
                                style={{
                                    width: '100%',
                                    maxWidth: 'min(900px, 110vh)',
                                    aspectRatio: '1.414 / 1',
                                    border: '12px solid #012065',
                                }}
                            >
                                {/* Inner Gold Border */}
                                <div className="absolute inset-2 border-2 border-yellow-500/80 pointer-events-none"></div>
                                
                                {/* Corner Decorative Elements */}
                                <div className="absolute top-0 left-0 w-6 h-6 sm:w-12 sm:h-12 border-t-4 border-l-4 border-yellow-500 m-2 pointer-events-none"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 sm:w-12 sm:h-12 border-t-4 border-r-4 border-yellow-500 m-2 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-12 sm:h-12 border-b-4 border-l-4 border-yellow-500 m-2 pointer-events-none"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-12 sm:h-12 border-b-4 border-r-4 border-yellow-500 m-2 pointer-events-none"></div>

                                <div className="text-center flex-1 flex flex-col items-center justify-center relative z-10 px-4">
                                    {/* Logo / Brand Name */}
                                    <div className="mb-2 sm:mb-4">
                                        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-widest text-[#012065] uppercase">
                                            INTERNKATTA
                                        </h1>
                                    </div>
                                    
                                    <h2 className="text-[10px] sm:text-sm md:text-lg text-yellow-600 font-bold tracking-[0.2em] sm:tracking-[0.3em] mb-4 sm:mb-8 uppercase">
                                        Certificate of Completion
                                    </h2>

                                    <p className="text-[9px] sm:text-xs md:text-sm text-gray-500 italic mb-2 sm:mb-4 font-serif">
                                        This is to certify that
                                    </p>

                                    <h3 className="text-xl sm:text-3xl md:text-5xl font-bold text-gray-900 border-b-2 border-gray-300 pb-1 sm:pb-3 mb-2 sm:mb-4 px-6 sm:px-16 inline-block font-serif">
                                        John Doe
                                    </h3>

                                    <p className="text-[9px] sm:text-xs md:text-sm text-gray-500 italic mb-2 sm:mb-4 font-serif">
                                        has successfully completed the course
                                    </p>

                                    <h4 className="text-base sm:text-xl md:text-3xl font-bold text-[#012065] px-2 sm:px-8 uppercase max-w-full truncate whitespace-normal leading-tight">
                                        {internship.title}
                                    </h4>
                                    
                                    <p className="text-[8px] sm:text-xs md:text-sm text-gray-600 mt-1 sm:mt-3">
                                        in {internship.category?.name || 'Professional Development'}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-end mt-2 sm:mt-8 px-2 sm:px-12 relative z-10 pb-1 sm:pb-2">
                                    <div className="text-center">
                                        <div className="border-t-2 border-gray-400 w-16 sm:w-32 pt-1 sm:pt-2">
                                            <p className="text-[7px] sm:text-[10px] md:text-xs font-bold text-gray-800 uppercase tracking-wider">Completed Date</p>
                                            <p className="text-[7px] sm:text-[10px] md:text-xs text-gray-600 mt-0.5">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Seal */}
                                    <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full border-4 border-white shadow-xl z-10 -my-2 sm:-my-4">
                                        <svg className="w-5 h-5 sm:w-10 sm:h-10 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>

                                    <div className="text-center">
                                        <div className="border-t-2 border-gray-400 w-16 sm:w-32 pt-1 sm:pt-2">
                                            <p className="text-[7px] sm:text-[10px] md:text-xs font-bold text-gray-800 uppercase tracking-wider">Duration</p>
                                            <p className="text-[7px] sm:text-[10px] md:text-xs text-gray-600 mt-0.5">{internship.duration || 'Self-paced'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InternshipDetail;
