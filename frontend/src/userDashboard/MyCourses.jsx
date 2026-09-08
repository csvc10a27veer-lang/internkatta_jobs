import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import toast from 'react-hot-toast';
import { Play, Clock, Star, BookOpen, Award, Globe, Calendar, Users, CheckCircle, ShoppingCart, Heart, Share2, AlertCircle, ArrowRight, TrendingUp, Target, Download, BookCopy } from 'lucide-react';
import api from '../utils/api';
const MyCourses = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth } = useUserAuth();

    // --- THIS IS THE CORRECTED PART ---
    useEffect(() => {
        const fetchMyCourses = async () => {
            // First, check if the user is authenticated.
            // This check is now robust and won't crash if 'auth' is null.
            if (!auth || !auth.token) {
                setError("Please log in to see your courses.");
                setLoading(false);
                return;
            }

            try {
                // setLoading is already true from the initial state, but we can set it again for clarity.
                setLoading(true);
                const { data } = await api.get('/api/users/my-courses');
                
                // Ensure data is an array
                if (data && Array.isArray(data)) {
                    setMyCourses(data);
                } else if (data && data.data && Array.isArray(data.data)) {
                    setMyCourses(data.data);
                } else {
                    setMyCourses([]);
                }
                setError(null);
            } catch (err) {
                setError("Failed to load your enrolled courses. The server might be down.");
                console.error("Fetch my courses error:", err);
                setMyCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    // The dependency array is changed to [auth].
    // This is safer and runs the effect whenever the auth object changes.
    }, [auth]);

    const handleDownload = async (course) => {
        try {
            toast.loading('Downloading certificate...', { id: `cert-${course._id}` });
            
            const response = await api.get(`/api/users/certificate/${course._id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            let filename = `${course.title.replace(/\\s+/g, '_')}_Certificate.pdf`;
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
            
            toast.success('Certificate downloaded successfully!', { id: `cert-${course._id}` });
        } catch (err) {
            console.error('Download failed:', err);
            toast.error('Failed to download certificate.', { id: `cert-${course._id}` });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-600">Loading Your Learning...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
                    <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/login" className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
                            <p className="text-gray-600 mt-2">Track your progress and continue your learning journey</p>
                        </div>
                        <div className="flex items-center gap-6 sm:gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Total Courses</p>
                                <p className="text-2xl font-bold text-blue-600">{myCourses?.length || 0}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {myCourses?.filter(course => (course.progress || 0) === 100).length || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {myCourses && Array.isArray(myCourses) && myCourses.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {myCourses.map(course => (
                            <div key={course._id} className="bg-white rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <Link to={`/user/course-player/${course._id}`} className="relative block">
                                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                                        <img 
                                            src={`${course.thumbnailUrl}?v=${Math.random()}&t=${Date.now()}`} 
                                            alt={course.title} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center" style={{display: 'none'}}>
                                            <div className="text-white text-center">
                                                <BookOpen className="h-12 w-12 mx-auto mb-2" />
                                                <p className="text-sm font-medium">{course.title}</p>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 transform scale-110 group-hover:scale-100 transition-transform duration-300">
                                                <Play className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                (course.progress || 0) === 100 
                                                    ? 'bg-green-600 text-white' 
                                                    : course.isStarted
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-gray-600 text-white'
                                            }`}>
                                                {(course.progress || 0) === 100 ? 'Completed' : course.isStarted ? 'In Progress' : 'Not Started'}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h2>
                                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        By {course.tutor}
                                    </p>
                                    
                                    {/* Progress Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Progress</span>
                                            <span className="text-sm font-bold text-blue-600">{course.progress || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
                                                style={{ width: `${course.progress || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Button */}
                                    {(course.progress || 0) === 100 ? (
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => handleDownload(course)}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 group"
                                            >
                                                <Download className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                                                Download Certificate
                                            </button>
                                            <Link
                                                to={`/user/course-player/${course._id}`}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-50 text-blue-600 font-semibold rounded-lg hover:bg-sky-100 transition-all duration-200 group border border-sky-200"
                                            >
                                                Review Course
                                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <Link
                                            to={`/user/course-player/${course._id}`}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 group"
                                        >
                                            {(course.progress || 0) > 0 ? 'Continue Learning' : 'Start Course'}
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
                            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookCopy className="h-10 w-10 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Learning Journey</h2>
                            <p className="text-gray-600 mb-8">You haven't enrolled in any courses yet. Discover amazing courses and start building your skills today!</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/courses" 
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Browse Courses
                                </Link>
                                <Link 
                                    to="/internship" 
                                    className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md border border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Target className="h-4 w-4" />
                                    View Internships
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;