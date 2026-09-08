import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

import { getImageUrl } from '../utils/api';
import { PlayCircleIcon, ArrowLeftIcon, CheckCircleIcon, UserCircleIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/solid';
import { Bars3Icon as Menu, XMarkIcon as X, StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
const CoursePlayerView = () => {
    const { id: courseId } = useParams(); // Renamed 'id' to 'courseId' for clarity
    const navigate = useNavigate();
    const { auth } = useUserAuth(); // Get the user's authentication state

    const [course, setCourse] = useState(null);
    const [userProgress, setUserProgress] = useState(null); // New state to hold user progress
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [videoError, setVideoError] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Discussion States
    const [discussions, setDiscussions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [replyText, setReplyText] = useState({});
    const [postingDiscussion, setPostingDiscussion] = useState(false);

    // Edit/Delete States
    const [editingDiscussionId, setEditingDiscussionId] = useState(null);
    const [editQuestionText, setEditQuestionText] = useState("");
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editReplyTextState, setEditReplyTextState] = useState("");
    
    // Review States
    const [userReview, setUserReview] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);
    
    const videoRef = useRef(null);
    const lastProgressSaveRef = useRef(0);

    useEffect(() => {
        const fetchCourseData = async () => {
            // This new logic checks for a logged-in user before fetching
            if (!auth || !auth.token) {
                setLoading(false);
                setError("You must be logged in to view this course.");
                return;
            }
            try {
                setLoading(true);
                setError(null);
                // We now call the new protected route to get both course content and user progress
                const { data } = await api.get(`/api/courses/user-data/${courseId}`);
                
                if (!data.course) throw new Error('No course data received');
                
                setCourse(data.course);
                // Set the user's progress, or a default object if they have no progress yet
                setUserProgress(data.userProgress || { courseId, completedLectures: [] }); 
                
                let initialLecture = null;
                if (data.userProgress?.lastWatchedLecture) {
                    for (const section of data.course.sections) {
                        initialLecture = section.lectures.find(l => l._id === data.userProgress.lastWatchedLecture);
                        if (initialLecture) break;
                    }
                }
                
                if (initialLecture) {
                    setCurrentLecture(initialLecture);
                } else if (data.course.sections?.[0]?.lectures?.[0]) {
                    setCurrentLecture(data.course.sections[0].lectures[0]);
                }
            } catch (err) {
                console.error('Error fetching course:', err);
                setError(err.response?.data?.message || 'Failed to load course content.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [courseId, auth]); // Effect now depends on 'auth' to prevent the loading race condition

    // Fetch User's Review
    useEffect(() => {
        const fetchUserReview = async () => {
            if (!auth || !auth.token) return;
            try {
                const { data } = await api.get(`/api/reviews/course/${courseId}/my-review`);
                if (data) {
                    setUserReview(data);
                    setRating(data.rating);
                    setReviewText(data.reviewText);
                }
            } catch (err) {
                console.error("Failed to load user review:", err);
            }
        };
        fetchUserReview();
    }, [courseId, auth]);

    // New function to handle when a video finishes playing and save progress
    const handleVideoEnd = async (lectureId) => {
        try {
            const { data } = await api.post(
                '/api/users/mark-lecture-complete',
                { courseId, lectureId }
            );
            // Instantly update the component's state with the new progress from the backend
            setUserProgress(data.progress);
            toast.success("Lecture completed!");
        } catch (error) {
            console.error("Failed to mark lecture as complete:", error);
            toast.error("Could not update progress.");
        }
    };

    const handleLectureChange = (lecture) => {
        setCurrentLecture(lecture);
        setVideoError(false);
        setIsSidebarOpen(false);
        lastProgressSaveRef.current = 0; // reset save reference for the new lecture
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current || !currentLecture) return;
        const currentTime = videoRef.current.currentTime;
        
        // Save every 10 seconds
        if (currentTime - lastProgressSaveRef.current > 10 || currentTime < lastProgressSaveRef.current - 10) {
            lastProgressSaveRef.current = currentTime;
            saveProgress(currentTime);
        }
    };

    const saveProgress = async (timestamp) => {
        try {
            await api.post('/api/users/update-video-progress', {
                courseId,
                lectureId: currentLecture._id,
                timestamp: timestamp
            });
        } catch (error) {
            console.error("Failed to update video progress:", error);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current && currentLecture && userProgress?.lastWatchedLecture === currentLecture._id) {
            videoRef.current.currentTime = userProgress.lastWatchedTimestamp || 0;
            lastProgressSaveRef.current = userProgress.lastWatchedTimestamp || 0;
        }
    };

    const handleVideoError = () => {
        setVideoError(true);
    };
    
    // New function to calculate the overall course progress percentage
    const overallProgress = useMemo(() => {
        if (!userProgress || !course?.sections) return 0;
        const totalLectures = course.sections.reduce((count, section) => count + section.lectures.length, 0);
        if (totalLectures === 0) return 0;
        const completedLectures = userProgress.completedLectures || [];
        const completedCount = completedLectures.filter(l => l.status === 'Completed').length || completedLectures.length;
        return Math.round((completedCount / totalLectures) * 100);
    }, [userProgress, course]);

    // Fetch discussions for the current lecture
    useEffect(() => {
        const fetchDiscussions = async () => {
            if (!currentLecture) return;
            try {
                const { data } = await api.get(`/api/discussions/${courseId}/${currentLecture._id}`);
                setDiscussions(data);
            } catch (err) {
                console.error("Failed to load discussions:", err);
            }
        };
        fetchDiscussions();
    }, [currentLecture, courseId]);

    const handlePostQuestion = async () => {
        if (!newQuestion.trim()) return;
        setPostingDiscussion(true);
        try {
            const { data } = await api.post('/api/discussions', {
                courseId,
                lectureId: currentLecture._id,
                question: newQuestion
            });
            setDiscussions([data, ...discussions]);
            setNewQuestion("");
            toast.success("Question posted successfully.");
        } catch (err) {
            console.error("Failed to post question:", err);
            toast.error("Failed to post question.");
        } finally {
            setPostingDiscussion(false);
        }
    };

    const handlePostReply = async (discussionId) => {
        const text = replyText[discussionId];
        if (!text || !text.trim()) return;
        try {
            const { data } = await api.post(`/api/discussions/${discussionId}/reply`, { text });
            setDiscussions(discussions.map(d => d._id === discussionId ? data : d));
            setReplyText(prev => ({ ...prev, [discussionId]: "" }));
            toast.success("Reply posted.");
        } catch (err) {
            console.error("Failed to post reply:", err);
            toast.error("Failed to post reply.");
        }
    };

    const handleEditQuestion = async (discussionId) => {
        if (!editQuestionText.trim()) return;
        try {
            const { data } = await api.put(`/api/discussions/${discussionId}`, { question: editQuestionText });
            setDiscussions(discussions.map(d => d._id === discussionId ? data : d));
            setEditingDiscussionId(null);
            toast.success("Question updated.");
        } catch (err) {
            console.error("Failed to update question:", err);
            toast.error("Failed to update question.");
        }
    };

    const handleDeleteQuestion = async (discussionId) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;
        try {
            await api.delete(`/api/discussions/${discussionId}`);
            setDiscussions(discussions.filter(d => d._id !== discussionId));
            toast.success("Question deleted.");
        } catch (err) {
            console.error("Failed to delete question:", err);
            toast.error("Failed to delete question.");
        }
    };

    const handleEditReply = async (discussionId, replyId) => {
        if (!editReplyTextState.trim()) return;
        try {
            const { data } = await api.put(`/api/discussions/${discussionId}/reply/${replyId}`, { text: editReplyTextState });
            setDiscussions(discussions.map(d => d._id === discussionId ? data : d));
            setEditingReplyId(null);
            toast.success("Reply updated.");
        } catch (err) {
            console.error("Failed to update reply:", err);
            toast.error("Failed to update reply.");
        }
    };

    const handleDeleteReply = async (discussionId, replyId) => {
        if (!window.confirm("Are you sure you want to delete this reply?")) return;
        try {
            const { data } = await api.delete(`/api/discussions/${discussionId}/reply/${replyId}`);
            setDiscussions(discussions.map(d => d._id === discussionId ? data : d));
            toast.success("Reply deleted.");
        } catch (err) {
            console.error("Failed to delete reply:", err);
            toast.error("Failed to delete reply.");
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        setSubmittingReview(true);
        try {
            const { data } = await api.post(`/api/reviews/course/${courseId}`, {
                rating,
                reviewText
            });
            setUserReview(data);
            setIsEditingReview(false);
            toast.success(userReview ? "Review updated!" : "Review submitted!");
        } catch (error) {
            console.error("Failed to submit review:", error);
            toast.error(error.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!userReview) return;
        if (!window.confirm("Are you sure you want to delete your review?")) return;
        try {
            await api.delete(`/api/reviews/${userReview._id}`);
            setUserReview(null);
            setRating(0);
            setReviewText("");
            setIsEditingReview(false);
            toast.success("Review deleted.");
        } catch (error) {
            console.error("Failed to delete review:", error);
            toast.error("Failed to delete review.");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-100">
            <div className="text-center p-10 text-lg font-semibold text-gray-600">Loading Player...</div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-screen bg-slate-100">
            <div className="text-center p-10 text-lg font-semibold text-red-500">{error}</div>
        </div>
    );

    if (!course) return (
        <div className="flex items-center justify-center h-screen bg-slate-100">
            <div className="text-center p-10 text-lg font-semibold text-gray-600">Course not found.</div>
        </div>
    );

    const SidebarContent = () => (
        <>
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold truncate">{course.title}</h2>
                {/* Progress Bar added to the sidebar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${overallProgress}%` }}></div>
                </div>
                <p className="text-xs text-right text-gray-500 mt-1">{overallProgress}% Complete</p>
            </div>
            
            <nav className="divide-y divide-gray-200">
                {course.sections.map((section) => (
                    <div key={section._id}>
                        <h3 className="px-4 py-3 font-bold text-gray-800 bg-gray-50 text-sm uppercase tracking-wider">
                            {section.title}
                        </h3>
                        <ul>
                            {section.lectures.map((lecture) => {
                                // Check if the current lecture is in the user's progress list
                                const isCompleted = userProgress?.completedLectures.some(l => l.lectureId === lecture._id);
                                return (
                                    <li key={lecture._id}>
                                        <button
                                            onClick={() => handleLectureChange(lecture)}
                                            className={`w-full text-left px-4 py-3 flex items-start text-sm transition-colors duration-200 ${
                                                currentLecture?._id === lecture._id 
                                                    ? 'bg-sky-100 text-sky-800 font-semibold' 
                                                    : 'text-gray-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            {/* Show a checkmark if completed, otherwise the play icon */}
                                            {isCompleted ? <CheckCircleIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-blue-500" /> : <PlayCircleIcon 
                                                className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                                                    currentLecture?._id === lecture._id 
                                                        ? 'text-sky-500' 
                                                        : 'text-gray-400'
                                                }`} 
                                            />}
                                            <span className="text-left">{lecture.title}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </>
    );

    return (
        <div className="flex flex-col h-screen bg-slate-100">
            <header className="bg-white shadow-sm p-4 flex items-center justify-between z-20">
                <Link 
                    to="/user/mycourse" 
                    className="flex items-center text-sm font-semibold text-gray-600 hover:text-sky-600 transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to My Courses
                </Link>
                <h1 className="hidden md:block text-lg font-bold text-gray-800 truncate max-w-md">{course.title}</h1>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden flex items-center gap-2 text-sm font-semibold text-sky-600"
                >
                    <Menu className="h-6 w-6" />
                    Course Content
                </button>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <aside className={`fixed inset-0 z-30 transition-transform transform md:hidden ${ isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
                    <aside className="relative w-80 max-w-[85vw] h-full bg-white overflow-y-auto">
                        <SidebarContent />
                    </aside>
                </aside>
                <aside className="hidden md:block w-80 lg:w-96 bg-white border-r overflow-y-auto flex-shrink-0">
                    <SidebarContent />
                </aside>
                <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-slate-100 overflow-y-auto">
                    {currentLecture ? (
                        <div className="flex flex-col w-full max-w-5xl mx-auto pb-8">
                            <div className="bg-black rounded-lg md:rounded-xl overflow-hidden shadow-2xl flex-shrink-0 relative w-full aspect-video">
                                {videoError ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6">
                                        <p className="text-lg font-semibold mb-2">Video Playback Error</p>
                                        <p className="text-sm mb-4">The video could not be loaded. Please check the URL or try again.</p>
                                        <button onClick={() => setVideoError(false)} className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Try Again</button>
                                    </div>
                                ) : (
                                    <video
                                        ref={videoRef}
                                        key={currentLecture._id}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        onContextMenu={(e) => e.preventDefault()}
                                        onError={handleVideoError}
                                        onEnded={() => handleVideoEnd(currentLecture._id)}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={handleLoadedMetadata}
                                        src={currentLecture.videoUrl}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                            <div className="bg-white p-4 md:p-5 mt-4 md:mt-6 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{currentLecture.title}</h2>
                                </div>
                                {currentLecture.description && (
                                    <div className="relative">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                            {currentLecture.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Q&A Section */}
                            <div className="bg-white p-4 md:p-5 mt-4 md:mt-6 rounded-lg shadow-sm">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Q&A / Discussion</h3>
                                
                                <div className="mb-6">
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                                        rows="3"
                                        placeholder="Ask a question about this lecture..."
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end mt-2">
                                        <button 
                                            onClick={handlePostQuestion}
                                            disabled={postingDiscussion || !newQuestion.trim()}
                                            className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 disabled:opacity-50 transition"
                                        >
                                            {postingDiscussion ? 'Posting...' : 'Post Question'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {discussions.map(discussion => (
                                        <div key={discussion._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                                                        {discussion.userId?.profilePicture ? (
                                                            <img src={getImageUrl(discussion.userId.profilePicture)} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                                                        ) : (
                                                            <UserCircleIcon className="w-10 h-10 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-800">{discussion.userId?.fullName || 'User'}</span>
                                                            {discussion.userId?.role === 'admin' && (
                                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">Instructor</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500">{new Date(discussion.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                
                                                {auth.user?._id === discussion.userId?._id && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => { setEditingDiscussionId(discussion._id); setEditQuestionText(discussion.question); }} className="text-gray-400 hover:text-sky-600 transition" title="Edit">
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteQuestion(discussion._id)} className="text-gray-400 hover:text-red-600 transition" title="Delete">
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {editingDiscussionId === discussion._id ? (
                                                <div className="mb-4 pl-13">
                                                    <textarea
                                                        className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                                                        rows="2"
                                                        value={editQuestionText}
                                                        onChange={(e) => setEditQuestionText(e.target.value)}
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                        <button onClick={() => handleEditQuestion(discussion._id)} className="text-xs bg-sky-600 text-white px-3 py-1 rounded hover:bg-sky-700">Save</button>
                                                        <button onClick={() => setEditingDiscussionId(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-800 mb-4 pl-13">{discussion.question}</p>
                                            )}
                                            
                                                <div className="ml-3 sm:ml-8 md:ml-12 pl-3 sm:pl-4 border-l-2 border-gray-100 space-y-4">
                                                    {discussion.replies.map(reply => {
                                                        const isInstructor = !!reply.adminId;
                                                        const author = isInstructor ? reply.adminId : reply.userId;
                                                        const authorName = isInstructor ? (author?.fullName || 'Instructor') : (author?.fullName || 'User');
                                                        
                                                        return (
                                                        <div key={reply._id} className="bg-slate-50 p-2 sm:p-3 rounded-lg group overflow-hidden">
                                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                                                    <div className="h-6 w-6 flex-shrink-0">
                                                                        {author?.profilePicture ? (
                                                                            <img src={getImageUrl(author.profilePicture)} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                                                                        ) : (
                                                                            <UserCircleIcon className="w-6 h-6 text-gray-400" />
                                                                        )}
                                                                    </div>
                                                                    <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate max-w-[100px] sm:max-w-none">{authorName}</span>
                                                                    {isInstructor && (
                                                                        <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap">Instructor</span>
                                                                    )}
                                                                    <span className="text-[10px] sm:text-xs text-gray-500 ml-auto sm:ml-2 whitespace-nowrap">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                {!isInstructor && auth.user?._id === author?._id && (
                                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => { setEditingReplyId(reply._id); setEditReplyTextState(reply.text); }} className="text-gray-400 hover:text-sky-600 transition" title="Edit">
                                                                        <PencilIcon className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteReply(discussion._id, reply._id)} className="text-gray-400 hover:text-red-600 transition" title="Delete">
                                                                        <TrashIcon className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {editingReplyId === reply._id ? (
                                                            <div className="mt-2 pl-8">
                                                                <input
                                                                    type="text"
                                                                    className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
                                                                    value={editReplyTextState}
                                                                    onChange={(e) => setEditReplyTextState(e.target.value)}
                                                                />
                                                                <div className="flex gap-2 mt-2">
                                                                    <button onClick={() => handleEditReply(discussion._id, reply._id)} className="text-xs bg-sky-600 text-white px-3 py-1 rounded hover:bg-sky-700">Save</button>
                                                                    <button onClick={() => setEditingReplyId(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-700 pl-8">{reply.text}</p>
                                                        )}
                                                    </div>
                                                    )})}
                                                
                                                <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                                                    <input 
                                                        type="text"
                                                        placeholder="Write a reply..."
                                                        className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition min-w-0"
                                                        value={replyText[discussion._id] || ''}
                                                        onChange={(e) => setReplyText({ ...replyText, [discussion._id]: e.target.value })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handlePostReply(discussion._id);
                                                        }}
                                                    />
                                                    <button 
                                                        onClick={() => handlePostReply(discussion._id)}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {discussions.length === 0 && (
                                        <p className="text-center text-gray-500 italic">No questions yet. Be the first to ask!</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Course Review Section */}
                            <div className="bg-white p-4 md:p-5 mt-4 md:mt-6 rounded-lg shadow-sm">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Rate this Course</h3>
                                
                                {userReview && !isEditingReview ? (
                                    <div className="bg-slate-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Your Review</h4>
                                                <div className="flex items-center mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon 
                                                            key={star} 
                                                            className={`h-5 w-5 ${star <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setIsEditingReview(true)} className="text-gray-400 hover:text-sky-600 transition" title="Edit Review">
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button onClick={handleDeleteReview} className="text-gray-400 hover:text-red-600 transition" title="Delete Review">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                        {userReview.reviewText && (
                                            <p className="text-gray-700 mt-2 text-sm">{userReview.reviewText}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        className="focus:outline-none transition-transform hover:scale-110"
                                                    >
                                                        {(hoverRating || rating) >= star ? (
                                                            <StarIcon className="h-8 w-8 text-yellow-400" />
                                                        ) : (
                                                            <StarOutlineIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Written Review (Optional)</label>
                                            <textarea
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                                                rows="3"
                                                placeholder="Tell us what you thought about the course..."
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            {isEditingReview && (
                                                <button 
                                                    onClick={() => {
                                                        setIsEditingReview(false);
                                                        setRating(userReview.rating);
                                                        setReviewText(userReview.reviewText);
                                                    }}
                                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button 
                                                onClick={handleSubmitReview}
                                                disabled={submittingReview || rating === 0}
                                                className="bg-sky-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sky-700 disabled:opacity-50 transition"
                                            >
                                                {submittingReview ? 'Saving...' : (userReview ? 'Update Review' : 'Submit Review')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-white rounded-lg">
                            <div className="text-center p-6 text-gray-500">
                                <PlayCircleIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold">Welcome!</h3>
                                <p>Select a lecture from the sidebar to begin watching.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CoursePlayerView;