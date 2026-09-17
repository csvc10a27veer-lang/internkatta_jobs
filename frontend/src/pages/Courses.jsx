// frontend/src/pages/Courses.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigationWithLoading } from '../hooks/useNavigationWithLoading';
import { useCompletionStatus } from '../hooks/useCompletionStatus';
import PaymentButton from '../components/PaymentButton';
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
    AcademicCapIcon,
    BookOpenIcon,
    PlayCircleIcon,
    FunnelIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';

const Rating = ({ rating, reviews }) => {
    // Ensure rating is a number
    const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    const roundedRating = Math.round(numericRating);
    
    return (
        <div className="flex items-center">
            <span className="text-blue-500 font-bold mr-1">{numericRating.toFixed(1)}</span>
            <div className="flex">{[...Array(5)].map((_, i) => (<StarSolid key={i} className={`h-4 w-4 ${i < roundedRating ? 'text-blue-500' : 'text-gray-300'}`} />))}</div>
            <span className="text-xs text-gray-500 ml-2">({reviews || 0})</span>
        </div>
    );
};

const CourseCard = ({ course }) => {
    const { auth } = useUserAuth();
    const { navigateWithLoading } = useNavigationWithLoading();
    const { isEnrolled, loading } = useCompletionStatus(course._id, 'course');

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full animate-pulse group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out hover:shadow-2xl max-w-xs mx-auto">
                <div className="w-full h-40 bg-gray-300"></div>
                <div className="p-4 flex flex-col flex-grow">
                    <div className="h-6 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="mt-auto">
                        <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    const handleCardClick = (e) => {
        // Prevent navigation if clicking on buttons
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        navigateWithLoading(`/course/${course._id}`);
    };

    return (
        <div 
            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out hover:shadow-2xl max-w-xs mx-auto cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="relative">
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-40 object-cover"/>
                {isEnrolled && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                        <BookOpenIcon className="h-3 w-3 mr-1" />
                        Enrolled
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-4 flex flex-col h-full">
                <div className="flex items-center mb-2">
                    <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-blue-600 font-medium">{course.category || 'General'}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                    By {course.tutor}
                </p>
                <div className="mb-4">
                    <Rating rating={course.rating} reviews={course.reviews} />
                </div>
                <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-baseline gap-2 mb-3">
                        {course.discountedPrice && course.discountedPrice > 0 ? (
                            <>
                                <p className="text-xl font-bold text-blue-600">₹{course.discountedPrice.toLocaleString('en-IN')}</p>
                                <p className="text-sm text-gray-500 line-through">₹{course.price.toLocaleString('en-IN')}</p>
                            </>
                        ) : (
                            <p className="text-xl font-bold text-blue-600">₹{course.price.toLocaleString('en-IN')}</p>
                        )}
                    </div>

                    <div className="w-full mt-3">
                        {/* Price left aligned */}
                        <div className="w-full text-left mb-2">
                            {/* Price already rendered above; keep this area for coupon rendering */}
                            {/* Render coupon UI (if any) left aligned — PaymentButton with hideButton */}
                            {!isEnrolled && (
                                <div className="w-full text-left">
                                    <PaymentButton
                                        itemId={course._id}
                                        itemType="course"
                                        price={course.discountedPrice || course.price}
                                        title={course.title}
                                        showCouponLink={true}
                                        hideButton={true}
                                        className=""
                                      />
                                </div>
                            )}
                        </div>

                        {/* Buttons row */}
                        <div className="flex flex-row items-center gap-3 justify-center w-full">
                            <Link to={`/course/${course._id}`} className="flex-1 min-w-0">
                                <button className="w-full h-10 inline-flex items-center justify-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-blue-600 bg-white border-2 border-blue-600 rounded-button hover:bg-blue-50 transition-colors whitespace-nowrap">
                                    View Details
                                </button>
                            </Link>

                            {isEnrolled ? (
                                <Link to="/user/mycourse" className="flex-1 min-w-0">
                                    <button className="w-full h-10 inline-flex items-center justify-center px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-button shadow-md bg-[#0052A3] text-white hover:bg-[#004085] transition-colors whitespace-nowrap">
                                        <PlayCircleIcon className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                                        Go to Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <div className="flex-1 min-w-0">
                                    {/* Render payment button only (hide coupon) */}
                                    <PaymentButton
                                        itemId={course._id}
                                        itemType="course"
                                        price={course.discountedPrice || course.price}
                                        title={course.title}
                                        hideCoupon={true}
                                        hidePriceDisplay={true}
                                        className="w-full h-10 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-button shadow-md bg-[#0052A3] text-white hover:bg-[#004085] transition-colors"
                                    >
                                        Register Now
                                    </PaymentButton>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
    selectedDifficulty,
    selectedPriceRanges,
    onCategoryToggle, 
    onDifficultyToggle,
    onPriceToggle,
    onClearFilters,
    onClose,
    isOpen 
}) => {
    const [expandedSections, setExpandedSections] = useState({
        category: false,
        price: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const priceRanges = ['₹99 - ₹499', '₹499 - ₹999', '₹999 - ₹1499', '₹1499 - ₹1999'];

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

const CoursesPage = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('price-low');
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    const { auth, updateUser } = useUserAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                setLoading(true);
                const [coursesRes, categoriesRes] = await Promise.all([
                    api.get('/api/courses'),
                    api.get('/api/categories')
                ]);
                console.log('Courses data:', coursesRes.data);
                console.log('Categories data:', categoriesRes.data);
                setAllCourses(coursesRes.data);
                setCategories(categoriesRes.data);
                setError(null);
            } catch (err) {
                setError("Failed to load courses. Please try again later.");
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
            'AI Course',
            'MERN Stack Course',
            'Data Analytics Course',
            'Python Development',
            'Web Development',
            'Machine Learning'
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
            if (range === '₹99 - ₹499') return priceNum >= 99 && priceNum <= 499;
            if (range === '₹499 - ₹999') return priceNum >= 499 && priceNum <= 999;
            if (range === '₹999 - ₹1499') return priceNum >= 999 && priceNum <= 1499;
            if (range === '₹1499 - ₹1999') return priceNum >= 1499 && priceNum <= 1999;
            return false;
        });
    };


    const filteredAndSortedCourses = useMemo(() => {
        let filtered = allCourses.filter(course => {
            const courseCategoryName = course.category ? (typeof course.category === 'object' ? course.category.name : course.category) : '';
            
            const categoryMatch = selectedCategories.length === 0 || 
                (courseCategoryName && selectedCategories.some(sc => sc.toLowerCase() === courseCategoryName.toLowerCase()));
            
            const searchMatch = searchTerm === '' || 
                course.title.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Price filter
            const effectivePrice = course.discountedPrice && course.discountedPrice > 0 ? course.discountedPrice : course.price;
            const priceMatch = isPriceInRange(effectivePrice, selectedPriceRanges);

            // Difficulty filter
            const isCourseAllLevels = course.level && course.level.toLowerCase().includes('all');
            const isAllSelected = selectedDifficulty.some(sd => sd.toLowerCase() === 'all' || sd.toLowerCase() === 'all levels');
            
            const difficultyMatch = selectedDifficulty.length === 0 ||
                 isAllSelected ||
                 isCourseAllLevels ||
                 (course.level && selectedDifficulty.some(sd => 
                     course.level.toLowerCase().includes(sd.toLowerCase()) ||
                     sd.toLowerCase().includes(course.level.toLowerCase())
                 ));
            
            // URL parameter filters
            const categoryParam = searchParams.get('category');
            const difficultyParam = searchParams.get('difficulty');
            const languageParam = searchParams.get('language');
            const durationParam = searchParams.get('duration');
            
            const categoryParamMatch = !categoryParam || 
                categoryParam.toLowerCase() === 'all' ||
                (courseCategoryName && courseCategoryName.toLowerCase() === categoryParam.toLowerCase());
            
            const difficultyParamMatch = !difficultyParam || 
                difficultyParam.toLowerCase() === 'all' ||
                (course.level && (
                    course.level.toLowerCase().includes(difficultyParam.toLowerCase()) ||
                    course.level.toLowerCase().includes('all')
                ));
            
            const languageParamMatch = !languageParam || 
                (course.language && course.language.toLowerCase() === languageParam.toLowerCase());
            
            const durationParamMatch = !durationParam || 
                (course.duration && course.duration.toLowerCase().includes(durationParam.toLowerCase()));
            
            return categoryMatch && searchMatch && priceMatch && difficultyMatch && categoryParamMatch && difficultyParamMatch && 
languageParamMatch && durationParamMatch;
        });

        // Sort courses
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'price-low':
                    const priceA = a.discountedPrice && a.discountedPrice > 0 ? a.discountedPrice : (a.price || 0);
                    const priceB = b.discountedPrice && b.discountedPrice > 0 ? b.discountedPrice : (b.price || 0);
                    return priceA - priceB;
                case 'price-high':
                    const priceAHigh = a.discountedPrice && a.discountedPrice > 0 ? a.discountedPrice : (a.price || 0);
                    const priceBHigh = b.discountedPrice && b.discountedPrice > 0 ? b.discountedPrice : (b.price || 0);
                    return priceBHigh - priceAHigh;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [allCourses, selectedCategories, selectedDifficulty, selectedPriceRanges, searchTerm, sortBy, searchParams]);

    // Show only categories that have at least one course available
    const availableCategories = useMemo(() => {
        return categories.filter(category => {
            const catName = (category?.name || '').trim().toLowerCase();
            const catId = category?._id ? String(category._id) : '';
            if (!catName && !catId) return false;
            return allCourses.some(course => {
                const courseCat = course.category;
                if (!courseCat) return false;
                if (typeof courseCat === 'object') {
                    const cName = (courseCat.name || '').trim().toLowerCase();
                    const cId = courseCat._id ? String(courseCat._id) : '';
                    return (catName && cName === catName) || (catId && cId === catId);
                }
                const strCat = String(courseCat).trim().toLowerCase();
                return (catName && strCat === catName) || (catId && String(courseCat) === catId);
            });
        });
    }, [categories, allCourses]);

    const handleCategoryToggle = (categoryName) => {
        setSelectedCategories(prev => 
            prev.includes(categoryName)
                ? prev.filter(cat => cat !== categoryName)
                : [...prev, categoryName]
        );
    };


    const handlePriceToggle = (priceRange) => {
        setSelectedPriceRanges(prev => 
            prev.includes(priceRange)
                ? prev.filter(p => p !== priceRange)
                : [...prev, priceRange]
        );
    };

    const handleDifficultyToggle = (level) => {
        setSelectedDifficulty(prev => 
            prev.includes(level)
                ? prev.filter(l => l !== level)
                : [...prev, level]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedDifficulty([]);
        setSelectedPriceRanges([]);
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

    const renderCourseContent = () => {
        if (loading) return <div className="text-center col-span-full py-10">Loading courses...</div>;
        if (error) return <div className="text-center col-span-full py-10 text-red-500">{error}</div>;
        if (filteredAndSortedCourses.length === 0) {
            return (
                <div className="text-center col-span-full py-16 bg-gray-50 rounded-xl">
                    <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">No Courses Found</h2>
                    <p className="text-gray-500">Please try a different search or category.</p>
                </div>
            );
        }
        return filteredAndSortedCourses.map(course => (
            <div key={course._id} className="group">
                <CourseCard course={course} />
            </div>
        ));
    };

    const coursesStructuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Online Courses - InternKatta",
        "description": "Browse our comprehensive collection of premium online courses. Learn from industry experts with lifetime access and certification.",
        "url": "https://internkatta.com/courses"
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEO
                title="Online Courses - Premium Skill Development Courses | InternKatta"
                description="Explore our wide range of premium online courses. Learn from industry experts with lifetime access, quizzes, exercises, and certification. Prices starting from ₹500."
                keywords="online courses, skill development courses, premium courses, certification courses, expert-led courses, lifetime access, career courses, professional development"
                url="https://internkatta.com/courses"
                structuredData={coursesStructuredData}
            />
            {/* Hero Section - Image Background with Overlapping Text */}
            <div className="pt-3 sm:pt-4 pb-1 px-3 sm:px-6 lg:px-8">
                <div className="max-w-[1360px] mx-auto">
                    <div className="relative overflow-hidden rounded-[20px] sm:rounded-[26px] md:rounded-[28px] shadow-2xl min-h-[250px] sm:min-h-[270px] md:min-h-[300px] flex flex-col justify-center items-center px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-9 border border-white/15 bg-[#060c18]">
                        
                        {/* Background Image: Collaborative Learning & Online Courses */}
                        <img 
                            src="/courses-banner.jpg" 
                            alt="Students learning online courses collaboratively"
                            className="absolute inset-0 w-full h-full object-cover object-center"
                            loading="eager"
                        />

                        {/* Dark Soft Overlay - Balanced for vivid photo visibility and sharp text readability */}
                        <div className="absolute inset-0 bg-slate-950/40" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-slate-950/35 to-black/75 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-transparent to-blue-950/40 pointer-events-none" />

                        {/* Center Overlapping Content */}
                        <div className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center w-full">
                            
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e3a8a]/70 backdrop-blur-md border border-blue-400/40 text-xs font-medium text-blue-200 shadow-md mb-2 sm:mb-2.5">
                                <AcademicCapIcon className="w-3.5 h-3.5 text-blue-300" />
                                <span>Industry-Recognized Certifications</span>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight text-white mb-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] leading-tight flex items-center justify-center gap-2">
                                <span>Courses</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-xs sm:text-sm md:text-base text-white/95 font-normal max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                                Here you'll find all our courses. Each course will teach you about specific technologies and skills in a structured, time-boxed way, usually around 1-2 hours.
                            </p>
                            
                            {/* Search Bar */}
                            <div className="w-full max-w-xl mx-auto">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute h-5 w-5 text-gray-400 top-1/2 left-4 -translate-y-1/2 z-10" />
                                    <input 
                                        type="text" 
                                        placeholder={typingText || "AI Course..."} 
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-gray-800 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl focus:ring-4 focus:ring-blue-400/50 focus:outline-none border-2 border-white/80 placeholder-gray-400 text-sm sm:text-base transition-all duration-200"
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        value={searchTerm}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setIsSearchFocused(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                                 {/* Left Sidebar - Filters */}
             <div className="lg:block">
                                 <FilterSidebar 
                            categories={availableCategories}
                            selectedCategories={selectedCategories}
                            selectedDifficulty={selectedDifficulty}
                            selectedPriceRanges={selectedPriceRanges}
                            onCategoryToggle={handleCategoryToggle}
                            onDifficultyToggle={handleDifficultyToggle}
                            onPriceToggle={handlePriceToggle}
                            onClearFilters={clearFilters}
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
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
                                        {filteredAndSortedCourses.length} Results
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
                                        <option value="rating">Rating</option>
                                    </select>
                                </div>
                            </div>
                        </div>



                        {/* Course Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderCourseContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;