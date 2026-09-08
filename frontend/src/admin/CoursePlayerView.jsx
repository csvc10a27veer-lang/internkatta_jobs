// frontend/src/admin/CoursePlayerView.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { PlayCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

const CoursePlayerView = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get(`/api/courses/${id}`);
                setCourse(response.data);
                if (response.data.sections && response.data.sections[0]?.lectures[0]) {
                    setCurrentLecture(response.data.sections[0].lectures[0]);
                }
            } catch (err) {
                setError('Failed to load course content.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    if (loading) return <div className="text-center p-10">Loading Player...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!course) return <div className="text-center p-10">Course not found.</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white shadow-md p-4 flex items-center justify-between z-10">
                <Link to="/admin/managecourse" className="flex items-center text-sm font-semibold text-gray-600 hover:text-indigo-600">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Manage Courses
                </Link>
                <h1 className="text-lg font-bold text-gray-800 truncate">{course.title}</h1>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-80 bg-white border-r overflow-y-auto flex-shrink-0">
                    <div className="p-4"><h2 className="text-xl font-bold">{course.title}</h2></div>
                    <nav>
                        <ul>
                            {course.sections.map((section, sectionIndex) => (
                                <li key={sectionIndex}>
                                    <h3 className="px-4 py-2 font-bold text-gray-800 bg-gray-50 border-t border-b">{section.title}</h3>
                                    <ul>
                                        {section.lectures.map((lecture) => (
                                            <li key={lecture._id}>
                                                <button
                                                    onClick={() => setCurrentLecture(lecture)}
                                                    className={`w-full text-left px-4 py-3 flex items-start text-sm ${currentLecture?._id === lecture._id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
                                                >
                                                    <PlayCircleIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-gray-400" />
                                                    <span>{lecture.title}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* --- THIS IS THE UPDATED SECTION --- */}
                <main className="flex-1 flex flex-col p-4 md:p-8 bg-gray-200 overflow-y-auto">
                    {currentLecture ? (
                        <div className="flex flex-col h-full">
                            {/* The Video Player Container */}
                            {/* The min-h-0 class is crucial. It allows the flex item to shrink correctly. */}
                            <div className="bg-black rounded-lg overflow-hidden shadow-2xl flex-1 min-h-0">
                                <video
                                    key={currentLecture._id}
                                    className="w-full h-full object-contain" // Use object-contain to prevent stretching
                                    controls // This attribute provides all the built-in controls
                                    autoPlay
                                    src={currentLecture.videoUrl}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            
                            {/* Lecture Title Below Player */}
                            <div className="bg-white p-4 mt-4 rounded-lg shadow flex-shrink-0">
                                <h2 className="text-2xl font-bold">{currentLecture.title}</h2>
                                <p className="text-gray-600 mt-2">{currentLecture.description}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-300 rounded-lg">
                            <p className="text-gray-600">Select a lecture to begin playing.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CoursePlayerView;