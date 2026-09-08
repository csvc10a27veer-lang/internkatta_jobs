// frontend/src/pages/Internship.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigationWithLoading } from '../hooks/useNavigationWithLoading';
import PaymentButton from '../components/PaymentButton';
import InternshipCard from '../components/ui/InternshipCard';
import FiltersSidebar from '../components/ui/FiltersSidebar';
import { SkeletonGrid } from '../components/ui/SkeletonCard';
import Button from '../components/ui/Button';
import SEO from '../components/SEO';

import { 
    StarIcon as StarSolid, 
    MagnifyingGlassIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    ClockIcon, 
    LockClosedIcon, 
    ArrowRightIcon, 
    UserGroupIcon,
    ExclamationCircleIcon,
    BriefcaseIcon,
    AcademicCapIcon,
    PlayCircleIcon,
    FunnelIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';

const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out hover:shadow-2xl max-w-xs mx-auto">
        <div className="bg-gray-300 h-40 w-full"></div>
        <div className="p-4">
            <div className="bg-gray-300 h-4 w-1/3 rounded"></div>
            <div className="bg-gray-400 h-6 w-full mt-2 rounded"></div>
            <div className="bg-gray-300 h-4 w-1/2 mt-2 rounded"></div>
            <div className="mt-4 flex justify-between items-center">
                <div className="bg-gray-300 h-5 w-1/4 rounded"></div>
                <div className="bg-gray-300 h-5 w-1/4 rounded"></div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="bg-gray-400 h-8 w-1/3 rounded"></div>
                <div className="bg-gray-300 h-10 w-1/2 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const InternshipCardWithPurchaseStatus = ({ internship, userId, enrolledInternshipIds = [] }) => {
    const [isPurchased, setIsPurchased] = useState(false);
    const [loading, setLoading] = useState(true);
    const { auth } = useUserAuth();

    useEffect(() => {
        const checkPurchaseStatus = async () => {
            if (!userId || !auth?.token) {
                setIsPurchased(false);
                setLoading(false);
                return;
            }

            // First check if it's in the enrolled list (faster and more reliable)
            const internshipId = internship._id?.toString();
            if (enrolledInternshipIds.length > 0 && enrolledInternshipIds.includes(internshipId)) {
                setIsPurchased(true);
                setLoading(false);
                return;
            }

            // Fallback to API check if not in enrolled list
            try {
                const response = await api.get(`/api/payment/check/${userId}/internship/${internship._id}`, {
                    headers: { 'user-authorization': `Bearer ${auth.token}` }
                });
                // Handle different possible response structures
                const hasPurchased = response.data?.hasPurchased || response.data?.data?.hasPurchased || false;
                setIsPurchased(hasPurchased);
            } catch (error) {
                console.error('Error checking purchase status:', error);
                // If error, assume not purchased
                setIsPurchased(false);
            } finally {
                setLoading(false);
            }
        };

        checkPurchaseStatus();
    }, [userId, internship._id, auth?.token, enrolledInternshipIds]);

    if (loading) {
        return <SkeletonCard />;
    }

    const handleRegister = () => {
        // Payment button will handle this
    };

    return (
        <InternshipCard 
            internship={internship} 
            isPurchased={isPurchased}
            onRegister={handleRegister}
        />
    );
};

const CategoryCarousel = ({ categories, selectedCategories, onCategoryToggle, onViewAll }) => {
    const [startIndex, setStartIndex] = useState(0);
    const visibleCategories = categories.slice(startIndex, startIndex + 5);

    const nextCategories = () => {
        if (startIndex + 5 < categories.length) {
            setStartIndex(startIndex + 1);
        }
    };

    const prevCategories = () => {
        if (startIndex > 0) {
            setStartIndex(startIndex - 1);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap">Explore by Category</h2>
            
            <div className="flex items-center gap-2 flex-1">
                <button
                    onClick={prevCategories}
                    disabled={startIndex === 0}
                    className="p-1.5 rounded-full bg-white border border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
                </button>
                
                <div className="flex gap-1.5 overflow-hidden flex-1 justify-center">
                    {visibleCategories.map(category => (
                        <button
                            key={category._id || category.name}
                            onClick={() => onCategoryToggle(category.name)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                                selectedCategories.includes(category.name)
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            {category?.name || 'Unknown Category'}
                        </button>
                    ))}
                </div>
                
                <button
                    onClick={nextCategories}
                    disabled={startIndex + 5 >= categories.length}
                    className="p-1.5 rounded-full bg-white border border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                </button>
            </div>
            
            <button
                onClick={onViewAll}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-600 rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
                View All Categories
            </button>
        </div>
    );
};

const FilterSidebar = ({ 
    categories, 
    selectedCategories, 
    selectedDurations,
    selectedPriceRanges,
    onCategoryToggle, 
    onDurationToggle,
    onPriceToggle,
    onClearFilters,
    onClose,
    isOpen 
}) => {
    const [expandedSections, setExpandedSections] = useState({
        category: false,
        difficulty: false,
        duration: false,
        price: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const difficultyLevels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const durationRanges = ['3 Months', '6 Months', '9 Months', '12 Months'];
    const priceRanges = ['₹0-₹2000', '₹2000-₹5000', '₹5000-₹10000', '₹10000+'];

    return (
        <>
                         {/* Mobile Overlay */}
             {isOpen && (
                 <div 
                     className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                     onClick={onClose}
                 />
             )}
            
                         {/* Sidebar */}
             <div className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${
                 isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
             }`}>
                 <div className="p-4 h-full overflow-y-auto">
                                         {/* Header */}
                     <div className="flex items-center justify-between mb-4 lg:hidden">
                         <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                         <button
                             onClick={onClose}
                             className="p-2 rounded-full hover:bg-gray-100"
                         >
                             <XMarkIcon className="h-5 w-5 text-gray-600" />
                         </button>
                     </div>

                     {/* Clear Filters */}
                     <div className="mb-4">
                         <button
                             onClick={onClearFilters}
                             className="w-full px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                         >
                             Clear All Filters
                         </button>
                     </div>

                     {/* Category Filter */}
                     <div className="mb-4">
                         <button
                             onClick={() => toggleSection('category')}
                             className="flex items-center justify-between w-full mb-2 text-sm font-semibold text-gray-900"
                         >
                             Category
                             <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedSections.category ? 'rotate-90' : ''}`} />
                         </button>
                         {expandedSections.category && (
                             <div className="space-y-1.5">
                                 {categories.map(category => (
                                     <label key={category._id || category.name} className="flex items-center">
                                         <input
                                             type="checkbox"
                                             checked={selectedCategories.includes(category.name)}
                                             onChange={() => onCategoryToggle(category.name)}
                                             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                         />
                                         <span className="ml-2 text-sm text-gray-700">{category?.name || 'Unknown Category'}</span>
                                     </label>
                                 ))}
                             </div>
                         )}
                     </div>

                                         {/* Difficulty Filter */}
                     <div className="mb-4">
                         <button
                             onClick={() => toggleSection('difficulty')}
                             className="flex items-center justify-between w-full mb-2 text-sm font-semibold text-gray-900"
                         >
                             Difficulty Level
                             <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedSections.difficulty ? 'rotate-90' : ''}`} />
                         </button>
                         {expandedSections.difficulty && (
                             <div className="space-y-1.5">
                                 {difficultyLevels.map(level => (
                                     <label key={level} className="flex items-center">
                                         <input
                                             type="checkbox"
                                             checked={selectedDifficulty.includes(level)}
                                             onChange={() => {
                                                        console.log("Checkbox clicked:", level);
                                                        handleDifficultyToggle(level);

                                             }}

                                             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                         />
                                         <span className="ml-2 text-sm text-gray-700">{level}</span>
                                     </label>
                                 ))}
                             </div>
                         )}
                     </div>

                     {/* Duration Filter */}
                     <div className="mb-4">
                         <button
                             onClick={() => toggleSection('duration')}
                             className="flex items-center justify-between w-full mb-2 text-sm font-semibold text-gray-900"
                         >
                             Duration
                             <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedSections.duration ? 'rotate-90' : ''}`} />
                         </button>
                         {expandedSections.duration && (
                             <div className="space-y-1.5">
                                 {durationRanges.map(range => (
                                     <label key={range} className="flex items-center">
                                         <input
                                             type="checkbox"
                                             checked={selectedDurations.includes(range)}
                                             onChange={() => onDurationToggle(range)}
                                             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                         />
                                         <span className="ml-2 text-sm text-gray-700">{range}</span>
                                     </label>
                                 ))}
                             </div>
                         )}
                     </div>

                     {/* Price Filter */}
                     <div className="mb-4">
                         <button
                             onClick={() => toggleSection('price')}
                             className="flex items-center justify-between w-full mb-2 text-sm font-semibold text-gray-900"
                         >
                             Price Range
                             <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedSections.price ? 'rotate-90' : ''}`} />
                         </button>
                         {expandedSections.price && (
                             <div className="space-y-1.5">
                                 {priceRanges.map(range => (
                                     <label key={range} className="flex items-center">
                                         <input
                                             type="checkbox"
                                             checked={selectedPriceRanges.includes(range)}
                                             onChange={() => onPriceToggle(range)}
                                             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                         />
                                         <span className="ml-2 text-sm text-gray-700">{range}</span>
                                     </label>
                                 ))}
                             </div>
                         )}
                     </div>

                </div>
            </div>
        </>
    );
};

const InternshipPage = () => {
    const [allInternships, setAllInternships] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedDurations, setSelectedDurations] = useState([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('price-low');
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [enrolledInternshipIds, setEnrolledInternshipIds] = useState([]);
    
    const { auth, updateUser } = useUserAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Fetch enrolled internships for logged-in users
    useEffect(() => {
        const fetchEnrolledInternships = async () => {
            if (!auth?.user?._id || !auth?.token) {
                setEnrolledInternshipIds([]);
                return;
            }

            try {
                const response = await api.get('/api/users/my-internships', {
                    headers: { 'user-authorization': `Bearer ${auth.token}` }
                });
                const internships = response.data?.data || response.data || [];
                const ids = internships.map(internship => internship._id || internship);
                setEnrolledInternshipIds(ids);
            } catch (error) {
                console.error('Error fetching enrolled internships:', error);
                setEnrolledInternshipIds([]);
            }
        };

        fetchEnrolledInternships();
    }, [auth?.user?._id, auth?.token]);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                setLoading(true);
                const [internshipsRes, categoriesRes] = await Promise.all([
                    api.get('/api/v1/internships/public/all'),
                    api.get('/api/v1/internship-category/all')
                ]);
                console.log('Internships data:', internshipsRes.data);
                console.log('Categories data:', categoriesRes.data);
                setAllInternships(internshipsRes.data);
                setCategories(categoriesRes.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError("Failed to load internships. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, []);

    // Handle URL parameters for filtering
    useEffect(() => {
        const category = searchParams.get('category');
        const difficulty = searchParams.get('difficulty');
        const language = searchParams.get('language');
        const duration = searchParams.get('duration');

        if (category) {
            setSelectedCategories([category]);
        }
        if (difficulty) {
            setSearchTerm(`Difficulty: ${difficulty}`);
        }
        if (language) {
            setSearchTerm(`Language: ${language}`);
        }
        if (duration) {
            setSearchTerm(`Duration: ${duration}`);
        }
    }, [searchParams]);

    // Auto-typing effect
    useEffect(() => {
        // Stop animation if search is focused
        if (isSearchFocused) {
            return;
        }
        
        const phrases = [
            'AI Internship',
            'MERN Stack Internship',
            'Data Analytics Internship',
            'Python Development Internship',
            'Web Development Internship',
            'Machine Learning Internship'
        ];
        
        let currentPhraseIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let timeoutId;
        
        const typeText = () => {
            // Stop if search is focused
            if (isSearchFocused) {
                return;
            }
            
            const currentPhrase = phrases[currentPhraseIndex];
            
            if (isDeleting) {
                setTypingText(currentPhrase.substring(0, currentCharIndex - 1) + '|');
                currentCharIndex--;
            } else {
                setTypingText(currentPhrase.substring(0, currentCharIndex + 1) + '|');
                currentCharIndex++;
            }
            
            if (!isDeleting && currentCharIndex === currentPhrase.length) {
                timeoutId = setTimeout(() => {
                    if (!isSearchFocused) {
                        isDeleting = true;
                    }
                }, 1500); // Wait 1.5 seconds before deleting
            } else if (isDeleting && currentCharIndex === 0) {
                isDeleting = false;
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                timeoutId = setTimeout(() => {
                    if (!isSearchFocused) {
                        typeText();
                    }
                }, 500); // Pause between phrases
                return;
            }
            
            // Variable speed for more natural typing
            const baseSpeed = isDeleting ? 50 : 80;
            const randomDelay = Math.random() * 30; // Add slight randomness
            const speed = baseSpeed + randomDelay;
            
            timeoutId = setTimeout(() => {
                if (!isSearchFocused) {
                    typeText();
                }
            }, speed);
        };
        
        typeText();
        
        // Cleanup function
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isSearchFocused]);

    // Helper function to check if price matches selected ranges
    const isPriceInRange = (price, ranges) => {
        if (ranges.length === 0) return true;
        
        return ranges.some(range => {
            const priceNum = parseFloat(price) || 0;
            if (range === '₹0-₹2000') return priceNum >= 0 && priceNum <= 2000;
            if (range === '₹2000-₹5000') return priceNum > 2000 && priceNum <= 5000;
            if (range === '₹5000-₹10000') return priceNum > 5000 && priceNum <= 10000;
            if (range === '₹10000+') return priceNum > 10000;
            return false;
        });
    };

    // Helper function to check if duration matches selected ranges
    const isDurationInRange = (duration, ranges) => {
        if (ranges.length === 0) return true;
        return ranges.some(range => duration && duration.toLowerCase().includes(range.toLowerCase().split(' ')[0]));
    };

    const filteredAndSortedInternships = useMemo(() => {
        let filtered = allInternships.filter(internship => {
            const internshipCategoryName = internship.category ? (typeof internship.category === 'object' ? internship.category.name : internship.category) : '';

            const categoryMatch = selectedCategories.length === 0 || 
                (internshipCategoryName && selectedCategories.some(sc => sc.toLowerCase() === internshipCategoryName.toLowerCase()));
            
            const searchMatch = searchTerm === '' || 
                internship.title.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Price filter
            const effectivePrice = internship.discountedPrice && internship.discountedPrice > 0 ? internship.discountedPrice : internship.price;
            const priceMatch = isPriceInRange(effectivePrice, selectedPriceRanges);
            
            // Duration filter
            const durationMatch = isDurationInRange(internship.duration, selectedDurations);

            // Difficulty filter
            const isInternshipAllLevels = internship.difficulty && internship.difficulty.toLowerCase().includes('all');
            const isAllSelected = selectedDifficulty.some(sd => sd.toLowerCase() === 'all' || sd.toLowerCase() === 'all levels');
            
            const difficultyMatch = selectedDifficulty.length === 0 ||
                 isAllSelected ||
                 isInternshipAllLevels ||
                 (internship.difficulty && selectedDifficulty.some(sd => 
                     internship.difficulty.toLowerCase().includes(sd.toLowerCase()) ||
                     sd.toLowerCase().includes(internship.difficulty.toLowerCase())
                 ));
            
            // URL parameter filters
            const categoryParam = searchParams.get('category');
            const difficultyParam = searchParams.get('difficulty');
            const languageParam = searchParams.get('language');
            const durationParam = searchParams.get('duration');
            
            const categoryParamMatch = !categoryParam || 
                categoryParam.toLowerCase() === 'all' ||
                (internshipCategoryName && internshipCategoryName.toLowerCase() === categoryParam.toLowerCase());
            
            const difficultyParamMatch = !difficultyParam || 
                difficultyParam.toLowerCase() === 'all' ||
                (internship.difficulty && (
                    internship.difficulty.toLowerCase().includes(difficultyParam.toLowerCase()) ||
                    internship.difficulty.toLowerCase().includes('all')
                ));
            
            const languageParamMatch = !languageParam || 
                (internship.language && internship.language.toLowerCase() === languageParam.toLowerCase());
            
            const durationParamMatch = !durationParam || 
                (internship.duration && internship.duration.toLowerCase().includes(durationParam.toLowerCase()));
            
            return categoryMatch && searchMatch && priceMatch && durationMatch && difficultyMatch && categoryParamMatch && difficultyParamMatch && 
                   languageParamMatch && durationParamMatch;
        });

        // Sort internships
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'price-low':
                    return (a.price || 0) - (b.price || 0);
                case 'price-high':
                    return (b.price || 0) - (a.price || 0);
                case 'duration':
                    return (a.duration || '').localeCompare(b.duration || '');
                default:
                    return 0;
            }
        });

        return filtered;
    }, [allInternships, selectedCategories, selectedDurations, selectedPriceRanges, searchTerm, sortBy, searchParams]);

    const handleCategoryToggle = (categoryName) => {
        setSelectedCategories(prev => 
            prev.includes(categoryName)
                ? prev.filter(cat => cat !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleDurationToggle = (duration) => {
        setSelectedDurations(prev => 
            prev.includes(duration)
                ? prev.filter(d => d !== duration)
                : [...prev, duration]
        );
    };

    const handleDifficultyToggle = (level) => {
    console.log("Clicked difficulty:", level);

    setSelectedDifficulty(prev => 
        prev.includes(level)
            ? prev.filter(d => d !== level)
            : [...prev, level]
        );
    };

    const handlePriceToggle = (priceRange) => {
        setSelectedPriceRanges(prev => 
            prev.includes(priceRange)
                ? prev.filter(p => p !== priceRange)
                : [...prev, priceRange]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedDurations([]);
        setSelectedPriceRanges([]);
        setSelectedDifficulty([]);
        setSearchTerm('');
        setSortBy('price-low');
        setSearchParams({});
    };

    const getActiveFilters = () => {
        const filters = [];
        const category = searchParams.get('category');
        const difficulty = searchParams.get('difficulty');
        const language = searchParams.get('language');
        const duration = searchParams.get('duration');

        if (category) filters.push({ type: 'Category', value: category });
        if (difficulty) filters.push({ type: 'Difficulty', value: difficulty });
        if (language) filters.push({ type: 'Language', value: language });
        if (duration) filters.push({ type: 'Duration', value: duration });

        return filters;
    };

    const removeFilter = (filterType) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete(filterType.toLowerCase());
        setSearchParams(newParams);
    };

    const renderInternshipContent = () => {
        if (error) return <div className="text-center col-span-full py-10 text-red-500">{error}</div>;
        if (filteredAndSortedInternships.length === 0) {
            return (
                <div className="text-center col-span-full py-16 bg-surface rounded-card">
                    <BriefcaseIcon className="h-16 w-16 text-muted mx-auto mb-4" />
                    <h2 className="text-h2 font-headline font-bold text-text mb-2">No Internships Found</h2>
                    <p className="text-body text-muted">Please try a different search or category.</p>
                </div>
            );
        }
        return filteredAndSortedInternships.map(internship => (
            <div key={internship._id} className="group">
                <InternshipCardWithPurchaseStatus 
                    internship={internship} 
                    userId={auth?.user?._id} 
                    enrolledInternshipIds={enrolledInternshipIds}
                />
            </div>
        ));
    };

    const internshipStructuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Internship Programs - InternKatta",
        "description": "Browse our comprehensive collection of industry-ready internship programs. Get hands-on experience, mentorship, and certification.",
        "url": "https://internkatta.com/internship"
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEO
                title="Internship Programs - Online Internships with Certification | InternKatta"
                description="Explore our wide range of internship programs. Get hands-on experience with real-world projects, expert mentorship, and industry-recognized certification. Prices starting from ₹199."
                keywords="internships, online internships, internship programs, industrial training, project-based learning, mentorship, certification, career development, skill development"
                url="https://internkatta.com/internship"
                structuredData={internshipStructuredData}
            />
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#0052A3] via-[#004085] to-[#003366] text-white shadow-xl">
                <div className="container mx-auto px-4 py-6 md:py-8 text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                        <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full"></div>
                        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full"></div>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-center mb-2">
                            <BriefcaseIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-200 mr-2" />
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                                Internship Programs
                            </h1>
                        </div>
                        <p className="text-sm md:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed">
                            Bridge the gap between learning and doing. Gain real-world experience and launch your career with our comprehensive internship programs.
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mt-4">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute h-5 w-5 md:h-6 md:w-6 text-gray-400 top-1/2 left-4 -translate-y-1/2 z-10" />
                                <input 
                                    type="text" 
                                    placeholder={typingText || "Web Development Internship..."} 
                                    className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-gray-700 bg-white rounded-full shadow-lg focus:ring-4 focus:ring-blue-300 focus:outline-none border-2 border-transparent placeholder-gray-400 text-sm md:text-base"
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    value={searchTerm}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar - Filters */}
                    <div className="lg:block">
                        <FiltersSidebar
                            categories={categories}
                            selectedCategories={selectedCategories}
                            selectedDurations={selectedDurations}
                            selectedPriceRanges={selectedPriceRanges}
                            selectedDifficulties={selectedDifficulty}
                            onCategoryToggle={handleCategoryToggle}
                            onDurationToggle={handleDurationToggle}
                            onPriceToggle={handlePriceToggle}
                            onDifficultyToggle={handleDifficultyToggle}
                            onClearFilters={clearFilters}
                            onClose={() => setSidebarOpen(false)}
                            isOpen={sidebarOpen}
                        />
                    </div>

                                         {/* Right Content Area */}
                     <div className="flex-1 min-w-0 overflow-hidden">
                        {/* Mobile Filter Button */}
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                            >
                                <FunnelIcon className="h-5 w-5 text-gray-600" />
                                <span className="font-medium text-gray-700">Filters</span>
                                {selectedCategories.length > 0 && (
                                    <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                                        {selectedCategories.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Results Header - Compact Layout */}
                        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {filteredAndSortedInternships.length} internships
                                    </h2>
                                    {selectedCategories.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {selectedCategories.map(category => (
                                                <span
                                                    key={category}
                                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center gap-1"
                                                >
                                                    {category}
                                                    <button
                                                        onClick={() => handleCategoryToggle(category)}
                                                        className="hover:text-blue-600"
                                                    >
                                                        <XMarkIcon className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {getActiveFilters().length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {getActiveFilters().map((filter, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1"
                                                >
                                                    {filter.type}: {filter.value}
                                                    <button
                                                        onClick={() => removeFilter(filter.type)}
                                                        className="hover:text-green-600"
                                                    >
                                                        <XMarkIcon className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Sort by:</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="price-low">Price (Low to High)</option>
                                        <option value="price-high">Price (High to Low)</option>
                                        <option value="duration">Duration</option>
                                    </select>
                                </div>
                            </div>
                        </div>



                        {/* Internship Grid - Responsive: 1 col (mobile), 2 cols (tablet), 3 cols (desktop ≥1400px) */}
                        {loading ? (
                            <SkeletonGrid count={6} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {renderInternshipContent()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Ensure no diagonal line before footer */}
            <div className="relative overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ overflow: 'hidden' }}></div>
            </div>
        </div>
    );
};

export default InternshipPage;