import BookShell from './bookView/BookShell';
import { BookCover, TextPage, CodePage, ImagePage, TaskPage, QuizLockedPage, QuizEntryPage, CompletionPage } from './bookView/BookPages';
import { QuizActivePage } from './bookView/QuizActivePage';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useUserAuth } from '../context/UserAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Menu, X, Upload, Clock, CheckCircle, ArrowLeft, Lightbulb, LockKeyhole, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
// --- COMPONENT 2: NextLectureButton with Auto-Loading ---
const NextLectureButton = ({ onNext, immediate = false }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (immediate) return; // do not start auto-loading when immediate action is desired

        // Start loading automatically when component mounts
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        onNext();
                    }, 200);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [onNext, immediate]);

    if (immediate) {
        return (
            <button
                onClick={onNext}
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
                Go To Next Lecture
            </button>
        );
    }

    return (
        <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg transition-all duration-300">
            <div className="relative w-6 h-6">
                <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 20 20">
                    <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="#ffffff"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.3"
                    />
                    <circle
                        cx="10"
                        cy="10"
                        r="8"
                        stroke="#ffffff"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(progress / 100) * 50.27} 50.27`}
                        className="transition-all duration-100"
                    />
                </svg>
            </div>
            <span>Loading Next Lecture...</span>
        </div>
    );
};

// --- COMPONENT 3: MAIN InternshipView Component ---
const InternshipView = () => {
    const { id: internshipId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { auth } = useUserAuth();
    const { auth: adminAuth } = useAdminAuth();
    
    // Preview mode detection
    const isPreview = searchParams.get('preview') === 'true';
    const previewLectureIndex = searchParams.get('lectureIndex') ? parseInt(searchParams.get('lectureIndex'), 10) : null;
    const previewData = location.state?.previewData; // Unsaved editor data
    
    const [internship, setInternship] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    
    // Initialize activeLectureIndex from preview, sessionStorage, or default to 0
    const [activeLectureIndex, setActiveLectureIndex] = useState(() => {
        if (previewLectureIndex !== null) return previewLectureIndex;
        const savedIndex = sessionStorage.getItem(`internship_${internshipId}_active_lecture`);
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [readingProgress, setReadingProgress] = useState({});
    const [lectureContentRef, setLectureContentRef] = useState(null);
    const [dashboardProgress, setDashboardProgress] = useState(null); // numeric percent from dashboard endpoint

    // Quiz state management
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizSubmitting, setQuizSubmitting] = useState(false);
    const [quizResults, setQuizResults] = useState(null);
    const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);
    const [showLearningPlan, setShowLearningPlan] = useState(window.innerWidth >= 1024);

    // Save activeLectureIndex to sessionStorage whenever it changes
    useEffect(() => {
        if (internshipId) {
            sessionStorage.setItem(`internship_${internshipId}_active_lecture`, activeLectureIndex);
        }
    }, [activeLectureIndex, internshipId]);

    // Quiz functions
    const handleTakeQuiz = async () => {
        const activeLecture = internship.lectures[activeLectureIndex];
        if (!activeLecture || !activeLecture.mcqs || activeLecture.mcqs.length === 0) {
            toast.error('No quiz available for this lecture');
            return;
        }
        
        setQuizLoading(true);
        setShowQuiz(true);
        setQuizData(activeLecture);
        setQuizAnswers({});
        setCurrentQuestionIndex(0);
        setQuizResults(null);
        setQuizLoading(false);
    };

    const handleQuizAnswerChange = (questionIndex, optionIndex) => {
        setQuizAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
        
        // Start countdown
        setAutoAdvanceCountdown(2);
        
        // Auto-advance to next question after 2 seconds
        const countdownInterval = setInterval(() => {
            setAutoAdvanceCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    if (questionIndex < (quizData?.mcqs?.length || 0) - 1) {
                        // Move to next question
                        setCurrentQuestionIndex(questionIndex + 1);
                    } else {
                        // This is the last question, auto-submit
                        handleSubmitQuiz();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizData.mcqs.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setAutoAdvanceCountdown(0); // Reset countdown
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setAutoAdvanceCountdown(0); // Reset countdown
        }
    };

    const handleSubmitQuiz = async () => {
        if (isPreview) {
            toast.error('Quiz submission is disabled in preview mode.');
            return;
        }
        if (Object.keys(quizAnswers).length !== quizData.mcqs.length) {
            toast.error("Please answer all questions.");
            return;
        }
        
        setQuizSubmitting(true);
        try {
            const finalAnswers = {};
            quizData.mcqs.forEach((mcq, questionIndex) => {
                if (mcq._id !== undefined && quizAnswers[questionIndex] !== undefined) {
                    finalAnswers[mcq._id] = quizAnswers[questionIndex];
                }
            });
            
            const { data } = await api.post('/api/users/submit-quiz', {
                internshipId,
                lectureId: quizData._id,
                answers: finalAnswers
            });
            
            setQuizResults({ ...data, userAnswers: quizAnswers });
            if (data.passed) {
                toast.success(data.message || "Quiz passed!");
                // Refresh the internship data to update progress
                window.location.reload();
            } else {
                toast.error("Not quite! Try again to improve your score.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit quiz.");
        } finally {
            setQuizSubmitting(false);
        }
    };

    const handleCloseQuiz = () => {
        setShowQuiz(false);
        setQuizData(null);
        setQuizAnswers({});
        setCurrentQuestionIndex(0);
        setQuizResults(null);
        setAutoAdvanceCountdown(0); // Reset countdown
    };

    const handleTryAgain = () => {
        setQuizAnswers({});
        setQuizResults(null);
        setCurrentQuestionIndex(0);
        setAutoAdvanceCountdown(0); // Reset countdown
    };

    // Navigation functions for header
    const handlePreviousLecture = () => {
        if (activeLectureIndex > 0) {
            setActiveLectureIndex(activeLectureIndex - 1);
        }
    };

    const handleNextLecture = () => {
        const nextIndex = activeLectureIndex + 1;
        if (nextIndex < internship.lectures.length && isLectureAccessible(nextIndex)) {
            setActiveLectureIndex(activeLectureIndex + 1);
        } else {
            toast.error('Complete this lecture to unlock the next one.');
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            // If preview mode with previewData, use unsaved editor data
            if (isPreview && previewData) {
                try {
                    setLoading(true);
                    // Transform previewData to match internship structure
                    const previewInternship = {
                        _id: internshipId,
                        title: previewData.title || 'Preview',
                        description: previewData.description || '',
                        category: previewData.category || '',
                        tutor: previewData.tutor || '',
                        price: previewData.price || '',
                        discountedPrice: previewData.discountedPrice || '',
                        rating: previewData.rating || 0,
                        difficulty: previewData.difficulty || 'Intermediate',
                        duration: previewData.duration || '',
                        thumbnail: previewData.thumbnail || '',
                        lectures: previewData.lectures || []
                    };
                    
                    console.log('ðŸ” InternshipView: Using preview data (unsaved changes)');
                    console.log('ðŸ” InternshipView: Preview lectures:', previewInternship.lectures);
                    
                    setInternship(previewInternship);
                    // Set initial lecture index from query param
                    if (previewLectureIndex !== null && previewLectureIndex >= 0 && previewLectureIndex < previewInternship.lectures.length) {
                        setActiveLectureIndex(previewLectureIndex);
                    }
                    setError(null);
                } catch (err) {
                    setError("Failed to load preview data.");
                } finally {
                    setLoading(false);
                }
                return;
            }
            
            // Otherwise, fetch from API (normal user view or preview without previewData)
            // In preview mode, allow using admin auth as fallback
            const token = (isPreview && adminAuth?.token) ? adminAuth.token : (auth?.token);
            
            if (!token) {
                setLoading(false);
                if (isPreview) {
                    setError("Preview mode: Could not load internship data. Please ensure you're logged in as admin or the preview data is available.");
                } else {
                    setError("You must be logged in to view this page.");
                }
                return;
            }
            try {
                setLoading(true);
                // In preview mode with admin auth, use admin endpoint; otherwise use user endpoint
                let internshipData;
                let userProgressData;
                
                if (isPreview && adminAuth?.token) {
                    // Use admin endpoint for preview mode
                    const endpoint = `/api/v1/internships/admin-view/${internshipId}`;
                    const response = await api.get(endpoint, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    // Admin endpoint returns internship directly
                    internshipData = response.data;
                } else {
                    // Use user endpoint
                    const endpoint = `/api/v1/internships/user-data/${internshipId}`;
                    const response = await api.get(endpoint, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    // User endpoint wraps it in data.internship
                    internshipData = response.data.internship;
                    userProgressData = response.data.userProgress;
                }
                console.log('ðŸ” InternshipView: Received internship data:', internshipData);
                console.log('ðŸ” InternshipView: Lectures data:', internshipData.lectures);
                if (internshipData.lectures && internshipData.lectures.length > 0) {
                    console.log('ðŸ” InternshipView: First lecture contentSections:', internshipData.lectures[0].contentSections);
                    console.log('ðŸ” InternshipView: First lecture contentSections details:', JSON.stringify(internshipData.lectures[0].contentSections, null, 2));
                    
                    // Additional debugging for contentSections
                    if (internshipData.lectures[0].contentSections) {
                        console.log('âœ… InternshipView: contentSections found!');
                        console.log('ðŸ“Š InternshipView: Number of sections:', internshipData.lectures[0].contentSections.length);
                        internshipData.lectures[0].contentSections.forEach((section, index) => {
                            console.log(`ðŸ“‹ InternshipView: Section ${index}:`, {
                                type: section.type,
                                content: section.content?.substring(0, 50) + '...',
                                image: section.image,
                                alignment: section.alignment
                            });
                        });
                    } else {
                        console.log('âŒ InternshipView: NO contentSections found!');
                        console.log('ðŸ” InternshipView: First lecture object:', internshipData.lectures[0]);
                    }
                }
                setInternship(internshipData);
                // In preview mode, don't set user progress (read-only)
                if (!isPreview && userProgressData) {
                    setUserProgress(userProgressData);
                }
                // Fetch dashboard-level precomputed progress (used by cards)
                if (!isPreview) {
                    try {
                        const myRes = await api.get('/api/users/my-internships', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const list = myRes.data;
                        let found = null;
                        if (Array.isArray(list)) {
                            found = list.find(i => i._id && i._id.toString() === internshipId.toString());
                        } else if (list && Array.isArray(list.data)) {
                            found = list.data.find(i => i._id && i._id.toString() === internshipId.toString());
                        }
                        if (found) setDashboardProgress(found.progress || 0);
                    } catch (err) {
                        console.warn('Could not fetch dashboard progress:', err?.message || err);
                    }
                }
                // Set initial lecture index from query param if in preview mode
                if (isPreview && previewLectureIndex !== null && previewLectureIndex >= 0 && previewLectureIndex < internshipData.lectures.length) {
                    setActiveLectureIndex(previewLectureIndex);
                }
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load internship data.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [internshipId, auth, adminAuth, navigate, isPreview, previewLectureIndex, previewData]);

    // Scroll tracking for reading progress (disabled in preview mode)
    useEffect(() => {
        if (isPreview) return; // Don't track progress in preview mode
        
        const handleScroll = () => {
            if (!lectureContentRef) return;
            
            const element = lectureContentRef;
            const scrollTop = element.scrollTop;
            const scrollHeight = element.scrollHeight;
            const clientHeight = element.clientHeight;
            
            if (scrollHeight > clientHeight) {
                const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
                setReadingProgress(prev => ({
                    ...prev,
                    [activeLectureIndex]: Math.round(progress)
                }));
            } else {
                // If content is shorter than container, mark as 100% read
                setReadingProgress(prev => ({
                    ...prev,
                    [activeLectureIndex]: 100
                }));
            }
        };

        const contentElement = lectureContentRef;
        if (contentElement) {
            contentElement.addEventListener('scroll', handleScroll);
            // Initial calculation
            handleScroll();
            
            return () => {
                contentElement.removeEventListener('scroll', handleScroll);
            };
        }
    }, [lectureContentRef, activeLectureIndex, isPreview]);

    const idsMatch = (left, right) => left?.toString() === right?.toString();

    const getLectureProgressEntry = (lectureId) => (
        userProgress?.completedLectures?.find(p => idsMatch(p.lectureId, lectureId))
    );

    const isLectureCompleted = (index) => {
        const lecture = internship?.lectures?.[index];
        if (!lecture) return false;
        const status = getLectureProgressEntry(lecture._id)?.status;
        
        const hasQuiz = lecture.mcqs && lecture.mcqs.some(mcq => mcq.question && mcq.question.trim().length > 0);
        const hasTask = !!lecture.taskPrompt && lecture.taskPrompt.trim().length > 0;

        if (hasQuiz && hasTask) {
            return status === 'Completed';
        } else if (hasQuiz) {
            return status === 'QuizPassed' || status === 'Completed';
        } else if (hasTask) {
            return status === 'Approved' || status === 'Completed';
        } else {
            return status === 'Completed' || status === 'Approved' || status === 'QuizPassed';
        }
    };

    const isLectureAccessible = (index) => {
        if (isPreview) return true;
        if (index <= 0) return true;
        return internship?.lectures
            ?.slice(0, index)
            .every((_, previousIndex) => isLectureCompleted(previousIndex)) || false;
    };

    useEffect(() => {
        if (!internship?.lectures?.length || isPreview) return;
        if (isLectureAccessible(activeLectureIndex)) return;

        const firstIncompleteIndex = internship.lectures.findIndex((_, index) => !isLectureCompleted(index));
        const fallbackIndex = firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;
        setActiveLectureIndex(fallbackIndex);
        toast.error('Please complete lectures in order.');
    }, [internship, userProgress, activeLectureIndex, isPreview]);

    // Calculate total progress for each lecture
    const getLectureProgress = (lectureIndex) => {
        const lecture = internship?.lectures[lectureIndex];
        if (!lecture) return 0;
        
        // In preview mode, userProgress may be null
        if (!userProgress?.completedLectures) return 0;
        
        const progress = getLectureProgressEntry(lecture._id);
        const readingProgressPercent = readingProgress[lectureIndex] || 0;
        
        if (progress?.status === 'Pending' || progress?.status === 'Approved' || progress?.status === 'Completed') {
            return 100; // Task submitted, approved or lecture fully completed
        } else if (progress?.status === 'QuizPassed') {
            return 80; // MCQ completed
        } else {
            // Theoretical path max 50%
            if (readingProgressPercent > 0) {
                return Math.min(readingProgressPercent * 0.5, 50); // Scale reading 0-100% to 0-50%
            }
            return 0; // No progress
        }
    };

    const handleTaskSubmit = async (lectureId, files) => {
        if (isPreview) {
            toast.error('Task submission is disabled in preview mode.');
            return;
        }
        if (!files || files.length === 0) return;
        if (!internshipId || !lectureId || internshipId === 'undefined' || lectureId === 'undefined') {
            toast.error('Missing course/lecture data. Please try again.');
            return;
        }

        const toastId = toast.loading('Uploading...');
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('submissionFiles', file);
        });
        formData.append('internshipId', internshipId);
        formData.append('lectureId', lectureId);
        try {
            const { data } = await api.post('/api/users/submit-task', formData);
            setUserProgress(data.progress);
            toast.success(data.message || "Task submitted!", { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed.', { id: toastId });
        }
    };
    
    // --- THIS IS THE CORRECTED FUNCTION ---
    const handleQuizComplete = (updatedProgress) => {
        setUserProgress(updatedProgress);
    };
    
    const overallProgress = useMemo(() => {
        if (!userProgress || !internship?.lectures?.length) return 0;
        
        const totalLectures = internship.lectures.length;
        if (totalLectures === 0) return 0;

        const lectureIds = new Set(internship.lectures.map(l => l._id.toString()));
        
        // Track completed lecture IDs to avoid duplicate counting
        const completedLecturesSet = new Set();
        
        if (!userProgress?.completedLectures) return 0;
        userProgress.completedLectures.forEach(lec => {
            if (lec.status === 'Completed' && lec.lectureId) {
                const lecIdStr = lec.lectureId.toString();
                if (lectureIds.has(lecIdStr)) {
                    completedLecturesSet.add(lecIdStr);
                }
            }
        });
        
        return Math.min(Math.round((completedLecturesSet.size / totalLectures) * 100), 100);
    }, [userProgress, internship]);
    
    // Prefer dashboard precomputed percent when available
    const displayedProgress = dashboardProgress !== null && dashboardProgress !== undefined ? dashboardProgress : overallProgress;
    
    const streaksToday = useMemo(() => {
        if (!userProgress?.completedLectures || !internship?.lectures?.length) return 0;
        const lectureIds = new Set(internship.lectures.map(l => l._id.toString()));
        const todayStr = new Date().toDateString();
        
        return userProgress.completedLectures.filter(lec => 
            lec.status === 'Completed' && 
            lec.lectureId && 
            lectureIds.has(lec.lectureId.toString()) && 
            lec.completedAt && 
            new Date(lec.completedAt).toDateString() === todayStr
        ).length;
    }, [userProgress, internship]);
    
    const handleSetActiveLecture = (index) => {
        if (!isLectureAccessible(index)) {
            toast.error('Complete the previous lecture to unlock this one.');
            return;
        }

        setActiveLectureIndex(index);
        setIsSidebarVisible(false);
    };

    const activeLecture = internship?.lectures?.[activeLectureIndex];
    const activeProgress = activeLecture ? getLectureProgressEntry(activeLecture._id) : null;
    // Transform activeLecture into pages for BookShell
    const pages = useMemo(() => {
        if (!activeLecture) return [];
        
        const generatedPages = [];
        
        // 1. Cover Page
        generatedPages.push(
            <BookCover 
                key="cover"
                title={activeLecture.lectureTitle || activeLecture.title}
                duration={activeLecture.duration}
                internshipTitle={internship?.title}
                moduleTitle={typeof internship?.category === 'object' ? internship?.category?.name || internship?.category?.title : undefined}
                topicIndex={activeLectureIndex + 1}
                onStart={() => {}} // Handled visually
            />
        );
        
        // Add description as a content page if it exists
        const desc = activeLecture.lectureDescription || activeLecture.description;
        if (desc) {
            generatedPages.push(<TextPage key="description" content={desc} />);
        }
        
        // 2. Content Pages
        if (activeLecture.contentSections && activeLecture.contentSections.length > 0) {
            activeLecture.contentSections.forEach((section, idx) => {
                if (section.type === 'text') {
                    generatedPages.push(<TextPage key={`content-${idx}`} content={section.content} />);
                } else if (section.type === 'code') {
                    generatedPages.push(<CodePage key={`code-${idx}`} code={section.content} language={section.language} />);
                }
            });
        } else if (activeLecture.content) {
            generatedPages.push(<TextPage key="content-fallback" content={activeLecture.content} />);
        }
        
        // Code Snippet fallback (if not in contentSections)
        if (activeLecture.codeSnippet && (!activeLecture.contentSections || activeLecture.contentSections.length === 0)) {
            generatedPages.push(<CodePage key="code-fallback" code={activeLecture.codeSnippet} />);
        }

        // 3. Task Page
        if (activeLecture.taskPrompt) {
            generatedPages.push(
                <TaskPage 
                    key="task"
                    activeProgress={activeProgress}
                    activeLecture={activeLecture}
                    handleTaskSubmit={handleTaskSubmit}
                />
            );
        }

        // 4. Quiz Entry/Locked Page
        if (activeLecture.mcqs && activeLecture.mcqs.length > 0) {
            const isQuizUnlocked = activeProgress && (activeProgress.status === 'Approved' || activeProgress.status === 'Completed' || activeProgress.status === 'QuizPassed');
            
            if (showQuiz) {
                generatedPages.push(
                    <QuizActivePage 
                        key="quiz-active"
                        quizResults={quizResults}
                        quizData={quizData}
                        currentQuestionIndex={currentQuestionIndex}
                        autoAdvanceCountdown={autoAdvanceCountdown}
                        quizAnswers={quizAnswers}
                        quizSubmitting={quizSubmitting}
                        handleQuizAnswerChange={handleQuizAnswerChange}
                        handlePreviousQuestion={handlePreviousQuestion}
                        handleCloseQuiz={handleCloseQuiz}
                        handleNextQuestion={handleNextQuestion}
                        handleSubmitQuiz={handleSubmitQuiz}
                        handleTryAgain={handleTryAgain}
                    />
                );
            } else if (isQuizUnlocked) {
                if (activeProgress?.status === 'QuizPassed' || activeProgress?.status === 'Completed') {
                     const hasNextLecture = activeLectureIndex < (internship?.lectures?.length || 1) - 1;
                     generatedPages.push(<CompletionPage key="completion" hasNextLecture={hasNextLecture} onNextLecture={() => handleSetActiveLecture(activeLectureIndex + 1)} />);
                } else {
                     generatedPages.push(
                        <QuizEntryPage 
                            key="quiz-entry"
                            onStartQuiz={handleTakeQuiz}
                        />
                    );
                }
            } else {
                generatedPages.push(<QuizLockedPage key="quiz-locked" />);
            }
        } else {
            if (activeProgress?.status === 'Approved' || activeProgress?.status === 'Completed') {
                const hasNextLecture = activeLectureIndex < (internship?.lectures?.length || 1) - 1;
                generatedPages.push(<CompletionPage key="completion" hasNextLecture={hasNextLecture} onNextLecture={() => handleSetActiveLecture(activeLectureIndex + 1)} />);
            }
        }

        return generatedPages;
    }, [
        activeLecture, activeProgress, showQuiz, 
        handleTaskSubmit, handleTakeQuiz, handleSubmitQuiz, handleCloseQuiz,
        quizResults, quizData, currentQuestionIndex, autoAdvanceCountdown, quizAnswers, quizSubmitting, handleTryAgain,
        activeLectureIndex, internship, handleSetActiveLecture
    ]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052A3] mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-gray-600">Loading internship...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-4">
                <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
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
    
    if (!internship) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-4">
                <AlertTriangle className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h2>
                <p className="text-gray-600 mb-6">Could not load internship data.</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                >
                    Refresh
                </button>
            </div>
        </div>
    );

    // In preview mode, userProgress is not required
    if (!isPreview && !userProgress) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-4">
                <AlertTriangle className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h2>
                <p className="text-gray-600 mb-6">Could not load user progress data.</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                >
                    Refresh
                </button>
            </div>
        </div>
    );

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white text-gray-800">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-xl font-bold text-[#0052A3] mb-2">{internship?.title || "Internship"}</h3>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-600">Progress</span>
                    <span className="text-sm font-bold text-[#0052A3]">{dashboardProgress || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                        className="bg-[#0052A3] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${dashboardProgress || 0}%` }}
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Topics</h4>
                <div className="space-y-2">
                    {internship?.lectures?.map((lecture, index) => {
                        const accessible = isLectureAccessible(index);
                        const completed = isLectureCompleted(index);
                        const isActive = index === activeLectureIndex;
                        
                        return (
                            <button
                                key={lecture._id || index}
                                onClick={() => accessible && handleSetActiveLecture(index)}
                                disabled={!accessible}
                                className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-[#e6f0fa] border border-[#cce0f5] shadow-sm' 
                                        : accessible 
                                            ? 'hover:bg-gray-50 border border-transparent' 
                                            : 'opacity-60 cursor-not-allowed border border-transparent'
                                }`}
                            >
                                <div className="mt-0.5">
                                    {completed ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : !accessible ? (
                                        <LockKeyhole className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <div className={`w-5 h-5 rounded-full border-2 ${isActive ? 'border-[#0052A3]' : 'border-gray-300'}`} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className={`text-sm font-semibold truncate ${isActive ? 'text-[#0052A3]' : accessible ? 'text-gray-700' : 'text-gray-500'}`}>
                                        {index + 1}. {lecture.lectureTitle || lecture.title}
                                    </h5>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {lecture.duration || '15 mins'}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <BookShell 
            pages={pages}
            title={internship?.title || "Internship"}
            progress={displayedProgress}
            streaksToday={streaksToday}
            onClose={() => navigate('/user/internship')}
            onOpenSidebar={() => setShowLearningPlan(!showLearningPlan)}
            isSidebarOpen={showLearningPlan}
            sidebarContent={sidebarContent}
            isPreview={isPreview}
            lectureCount={internship?.lectures?.length || 0}
            currentLectureIndex={activeLectureIndex}
            internshipTitle={internship?.title}
            moduleTitle={typeof internship?.category === 'object' ? internship?.category?.name || internship?.category?.title : undefined}
            topicTitle={activeLecture?.lectureTitle || activeLecture?.title}
        />
    );
};

export default InternshipView;
