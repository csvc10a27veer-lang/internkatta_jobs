// frontend/src/admin/AddCourse.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, X, Plus, Trash2, Save, ArrowLeft, Star, Video, Image } from 'lucide-react';
import SectionContentEditor from '../components/SectionContentEditor';
import StarRating from '../components/ui/StarRating';
import { LIMITS, getWordCount, trimToWordLimit } from '../utils/validation';

const AddCourse = () => {
    // --- UPDATED STATE to match the full form ---
    const [courseData, setCourseData] = useState({
        title: '',
        subtitle: '',
        smallDescription: '',
        description: '',
        category: '',
        level: 'Beginner',
        tutor: '',
        price: '',
        discountedPrice: '',
        rating: 0,
        duration: '1 Month',
        mode: 'Online',
        projectsCount: 0,
        seats: 'Unlimited',
        hasCertificate: true,
        whatYouWillLearn: '',
        toolsAndTechnologies: '',
        prerequisites: '',
        skills: '',
        sections: [{ title: '', lectures: [{ title: '', description: '', contentSections: [], hasVideo: false }] }],
    });

    // --- NEW STATE to handle individual file objects ---
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [introVideo, setIntroVideo] = useState(null); 
    const [lectureVideos, setLectureVideos] = useState({}); // e.g., { '0-0': file1, '0-1': file2 }
    const [contentImages, setContentImages] = useState({}); // e.g., { '0-0-0': file1, '0-0-1': file2 }
    const [validationErrors, setValidationErrors] = useState({ description: '', smallDescription: '' });

    // State for categories, status, and preview
    const [categories, setCategories] = useState([]);
    const [status, setStatus] = useState('idle');
    const [statusMessage, setStatusMessage] = useState('');

    // --- CHANGE 1: Get 'auth' from the context, not 'user' ---
    const { auth } = useAdminAuth();

    // Fetch categories for the dropdown (your existing code, preserved)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories');
                setCategories(response.data);
                if (response.data.length > 0) {
                    setCourseData(prev => ({ ...prev, category: response.data[0].name }));
                }
            } catch (error) {
                setStatus('error');
                setStatusMessage('Could not load categories. Please add a category first.');
            }
        };
        fetchCategories();
    }, []);

    // Handles changes for all text-based inputs (your existing code, preserved)
    const handleChange = (e) => {
        let { name, value } = e.target;
        
        if (name === 'description') {
            const wordCount = getWordCount(value);
            if (wordCount > LIMITS.DETAILED_DESCRIPTION_MAX_WORDS) {
                value = trimToWordLimit(value, LIMITS.DETAILED_DESCRIPTION_MAX_WORDS);
                setValidationErrors(prev => ({ ...prev, description: `Detailed description cannot exceed ${LIMITS.DETAILED_DESCRIPTION_MAX_WORDS} words.` }));
            } else {
                setValidationErrors(prev => ({ ...prev, description: '' }));
            }
        } else if (name === 'smallDescription') {
            const wordCount = getWordCount(value);
            if (wordCount > LIMITS.SMALL_DESCRIPTION_MAX_WORDS) {
                value = trimToWordLimit(value, LIMITS.SMALL_DESCRIPTION_MAX_WORDS);
                setValidationErrors(prev => ({ ...prev, smallDescription: `Small description cannot exceed ${LIMITS.SMALL_DESCRIPTION_MAX_WORDS} words.` }));
            } else {
                setValidationErrors(prev => ({ ...prev, smallDescription: '' }));
            }
        }

        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    // --- UPDATED to handle multiple file inputs ---
    const handleFileChange = (e, sectionIndex, lectureIndex) => {
        const { name, files } = e.target;
        const file = files[0];
        if (!file) return;

        switch (name) {
            case 'thumbnail':
                setThumbnail(file);
                setThumbnailPreview(URL.createObjectURL(file));
                break;
            case 'bannerImage':
                setBannerImage(file);
                setBannerPreview(URL.createObjectURL(file));
                break;
            case 'introVideo':
                setIntroVideo(file);
                break;
            case 'lectureVideo':
                // Store the file in a separate state using a unique key
                setLectureVideos(prev => ({ ...prev, [`${sectionIndex}-${lectureIndex}`]: file }));
                // Mark in the main courseData that this lecture has a video file to be uploaded
                const newSections = [...courseData.sections];
                newSections[sectionIndex].lectures[lectureIndex].hasVideo = true;
                setCourseData(prev => ({ ...prev, sections: newSections }));
                break;
            default:
                break;
        }
    };

    // --- NEW: Handlers for the dynamic curriculum builder ---
    const handleSectionChange = (sectionIndex, e) => {
        const newSections = [...courseData.sections];
        newSections[sectionIndex][e.target.name] = e.target.value;
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };

    const addSection = () => {
        setCourseData(prev => ({
            ...prev,
            sections: [...prev.sections, { title: '', lectures: [{ title: '', description: '', hasVideo: false }] }]
        }));
    };

    const deleteSection = (sectionIndex) => {
        const newSections = courseData.sections.filter((_, i) => i !== sectionIndex);
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };

    const handleLectureChange = (sectionIndex, lectureIndex, e) => {
        const { name, value } = e.target;
        const newSections = [...courseData.sections];
        newSections[sectionIndex].lectures[lectureIndex][name] = value;
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };

    const addLecture = (sectionIndex) => {
        const newSections = [...courseData.sections];
        newSections[sectionIndex].lectures.push({ title: '', description: '', contentSections: [], hasVideo: false });
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };

    const deleteLecture = (sectionIndex, lectureIndex) => {
        const newSections = [...courseData.sections];
        newSections[sectionIndex].lectures = newSections[sectionIndex].lectures.filter((_, i) => i !== lectureIndex);
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };

    const handleContentSectionsChange = (sectionIndex, lectureIndex, contentSections) => {
        const newSections = [...courseData.sections];
        newSections[sectionIndex].lectures[lectureIndex].contentSections = contentSections;
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };

    const handleContentImageUpload = (sectionIndex, lectureIndex, contentSectionIndex, file) => {
        const imageKey = `${sectionIndex}-${lectureIndex}-${contentSectionIndex}`;
        setContentImages(prev => ({ ...prev, [imageKey]: file }));
    };

    // --- SUBMIT FUNCTION WITH DETAILED ERROR LOGGING ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        for (let sIndex = 0; sIndex < courseData.sections.length; sIndex++) {
            const section = courseData.sections[sIndex];
            for (let lIndex = 0; lIndex < section.lectures.length; lIndex++) {
                const videoFileKey = `${sIndex}-${lIndex}`;
                if (!lectureVideos[videoFileKey]) {
                    toast.error(`Please upload a video for Lecture ${lIndex + 1} in Section ${sIndex + 1}.`);
                    return; 
                }
            }
        }

        setStatus('submitting');
        setStatusMessage('Saving course...');
        const formData = new FormData();
        formData.append('title', courseData.title);
        formData.append('subtitle', courseData.subtitle);
        formData.append('description', courseData.description);
        formData.append('category', courseData.category);
        formData.append('level', courseData.level);
        formData.append('tutor', courseData.tutor);
        formData.append('price', courseData.price);
        formData.append('discountedPrice', courseData.discountedPrice || '');
        formData.append('rating', courseData.rating || 0);
        formData.append('duration', courseData.duration);
        formData.append('mode', courseData.mode);
        formData.append('projectsCount', courseData.projectsCount || 0);
        formData.append('seats', courseData.seats);
        formData.append('hasCertificate', courseData.hasCertificate);

        const parseArray = (str) => (str || '').split('\n').map(s => s.trim()).filter(s => s);
        formData.append('whatYouWillLearn', JSON.stringify(parseArray(courseData.whatYouWillLearn)));
        formData.append('toolsAndTechnologies', JSON.stringify(parseArray(courseData.toolsAndTechnologies)));
        formData.append('prerequisites', JSON.stringify(parseArray(courseData.prerequisites)));
        formData.append('skills', JSON.stringify(parseArray(courseData.skills)));

        if (thumbnail) formData.append('thumbnail', thumbnail);
        if (bannerImage) formData.append('bannerImage', bannerImage);
        if (introVideo) formData.append('introVideo', introVideo);

        const sectionsForUpload = courseData.sections.map((section, sIndex) => {
            return {
                ...section,
                lectures: section.lectures.map((lecture, lIndex) => {
                    const videoFile = lectureVideos[`${sIndex}-${lIndex}`];
                    if (videoFile) {
                        formData.append('lectureVideos', videoFile);
                    }
                    
                    // Handle content section images
                    if (lecture.contentSections) {
                        lecture.contentSections.forEach((contentSection, cIndex) => {
                            const imageKey = `${sIndex}-${lIndex}-${cIndex}`;
                            const imageFile = contentImages[imageKey];
                            if (imageFile) {
                                formData.append('contentImages', imageFile);
                            }
                        });
                    }
                    
                    return {
                        title: lecture.title,
                        description: lecture.description,
                        contentSections: lecture.contentSections || []
                    };
                })
            };
        });
        formData.append('sections', JSON.stringify(sectionsForUpload));

        try {
            // --- CHANGE 2: Use API interceptor for authentication ---
            await api.post('/api/courses', formData);
            setStatus('success');
            setStatusMessage('✅ Course has been saved successfully!');
        } catch (error) {
            // --- NEW DETAILED LOGGING ---
            console.error("--- FULL ERROR OBJECT ---", error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("--- BACKEND RESPONSE DATA ---", error.response.data);
                console.error("--- BACKEND RESPONSE STATUS ---", error.response.status);
                console.error("--- BACKEND RESPONSE HEADERS ---", error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("--- NO RESPONSE RECEIVED ---", error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('--- ERROR IN REQUEST SETUP ---', error.message);
            }
            // --- END OF NEW LOGGING ---

            setStatus('error');
            toast.error(error.response?.data?.message || 'An error occurred. Check the console.');
            setStatusMessage(error.response?.data?.message || 'An error occurred while saving the course.');
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Course</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- Course Information --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center"><Star className="h-6 w-6 mr-2 text-indigo-500" />Course Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Course Title" name="title" value={courseData.title} onChange={handleChange} required />
                        <InputField label="Course Subtitle" name="subtitle" value={courseData.subtitle} onChange={handleChange} required />
                        <InputField label="Tutor Name" name="tutor" value={courseData.tutor} onChange={handleChange} required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select name="category" value={courseData.category} onChange={handleChange} className="mt-1 block w-full input-style" required>
                                {categories.length === 0 ? <option disabled>Loading...</option> : categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Level</label>
                            <select name="level" value={courseData.level} onChange={handleChange} className="mt-1 block w-full input-style">
                                <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All Levels</option>
                            </select>
                        </div>
                        <InputField label="Duration" name="duration" value={courseData.duration} onChange={handleChange} placeholder="e.g. 1 Month, Self-paced" required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mode</label>
                            <select name="mode" value={courseData.mode} onChange={handleChange} className="mt-1 block w-full input-style">
                                <option>Online</option><option>Offline</option><option>Hybrid</option>
                            </select>
                        </div>
                        <InputField label="Number of Projects" name="projectsCount" type="number" value={courseData.projectsCount} onChange={handleChange} required />
                        <InputField label="Seats Available" name="seats" value={courseData.seats} onChange={handleChange} placeholder="e.g. Limited, 100, Unlimited" required />
                        <div className="flex items-center mt-6">
                            <input 
                                type="checkbox" 
                                name="hasCertificate" 
                                checked={courseData.hasCertificate} 
                                onChange={(e) => setCourseData(prev => ({ ...prev, hasCertificate: e.target.checked }))} 
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Provides Certificate of Completion
                            </label>
                        </div>

                        {/* Banner Image Upload */}
                        <div className="md:col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-700">Course Banner Image (For Course Details Page) (Optional)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative cursor-pointer hover:bg-gray-50 transition-colors">
                                <input type="file" name="bannerImage" accept="image/*, image/svg+xml, .svg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="space-y-1 text-center">
                                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium text-indigo-600 hover:text-indigo-500">Upload a file</span> or drag and drop
                                    </div>
                                    <p className="text-xs text-gray-500">SVG, PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                            {bannerPreview && (
                                <div className="mt-4 flex justify-center">
                                    <img src={bannerPreview} alt="Banner Preview" className="h-48 object-cover rounded-md shadow-sm" />
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Detailed Description (For About Section)
                                <span className={`float-right text-xs ${getWordCount(courseData.description) >= LIMITS.DETAILED_DESCRIPTION_MAX_WORDS ? 'text-red-500' : 'text-gray-500'}`}>
                                    {getWordCount(courseData.description)} / {LIMITS.DETAILED_DESCRIPTION_MAX_WORDS} words
                                </span>
                            </label>
                            <textarea name="description" value={courseData.description} onChange={handleChange} rows="4" className="mt-1 block w-full input-style" required></textarea>
                            {validationErrors.description && <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Small Description (For Hero Banner)
                                <span className={`float-right text-xs ${getWordCount(courseData.smallDescription) >= LIMITS.SMALL_DESCRIPTION_MAX_WORDS ? 'text-red-500' : 'text-gray-500'}`}>
                                    {getWordCount(courseData.smallDescription)} / {LIMITS.SMALL_DESCRIPTION_MAX_WORDS} words
                                </span>
                            </label>
                            <textarea name="smallDescription" value={courseData.smallDescription} onChange={handleChange} rows="2" className="mt-1 block w-full input-style"></textarea>
                            {validationErrors.smallDescription && <p className="text-red-500 text-xs mt-1">{validationErrors.smallDescription}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">What You'll Learn (Enter one item per line)</label>
                            <textarea name="whatYouWillLearn" value={courseData.whatYouWillLearn} onChange={handleChange} rows="4" className="mt-1 block w-full input-style" placeholder="e.g. Master Power BI from scratch&#10;Build interactive dashboards"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Tools and Technologies (Enter one item per line)</label>
                            <textarea name="toolsAndTechnologies" value={courseData.toolsAndTechnologies} onChange={handleChange} rows="3" className="mt-1 block w-full input-style" placeholder="e.g. Power BI&#10;DAX&#10;Excel"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Prerequisites (Enter one item per line)</label>
                            <textarea name="prerequisites" value={courseData.prerequisites} onChange={handleChange} rows="3" className="mt-1 block w-full input-style" placeholder="e.g. Basic understanding of data concepts&#10;No prior coding experience required"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Skills You'll Gain (Enter one item per line)</label>
                            <textarea name="skills" value={courseData.skills} onChange={handleChange} rows="3" className="mt-1 block w-full input-style" placeholder="e.g. Data Analysis&#10;Dashboard Design&#10;DAX"></textarea>
                        </div>
                    </div>
                </div>

                {/* --- Media & Pricing --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Media & Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Thumbnail</label>
                            <input type="file" name="thumbnail" accept="image/*, image/svg+xml, .svg" required onChange={handleFileChange} className="file-input-style" />
                            {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" className="mt-4 h-32 w-auto rounded-md object-cover" />}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Intro Video</label>
                            <input type="file" name="introVideo" accept="video/*" onChange={handleFileChange} className="file-input-style" />
                            {introVideo && <p className="text-sm text-gray-500 mt-2">Selected: {introVideo.name}</p>}
                        </div>
                        <InputField label="Original Price (INR)" name="price" type="number" value={courseData.price} onChange={handleChange} required />
                        <InputField label="Discounted Price (INR)" name="discountedPrice" type="number" value={courseData.discountedPrice} onChange={handleChange} />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <StarRating 
                                rating={courseData.rating || 0} 
                                onRatingChange={(rating) => setCourseData(prev => ({ ...prev, rating }))}
                                interactive={true}
                            />
                        </div>
                    </div>
                </div>

                {/* --- Curriculum Builder --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center"><Video className="h-6 w-6 mr-2 text-indigo-500" />Course Curriculum</h2>
                    <div className="space-y-6">
                        {courseData.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="p-4 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <input type="text" name="title" value={section.title} onChange={(e) => handleSectionChange(sectionIndex, e)} placeholder={`Section ${sectionIndex + 1} Title`} className="text-lg font-medium input-style w-full mr-4" />
                                    <button type="button" onClick={() => deleteSection(sectionIndex)}><Trash2 className="h-6 w-6 text-red-500 hover:text-red-700" /></button>
                                </div>
                                <div className="space-y-4 pl-4 border-l-2 ml-2">
                                    {section.lectures.map((lecture, lectureIndex) => (
                                        <div key={lectureIndex} className="p-4 bg-white rounded-md border">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800">Lecture {lectureIndex + 1}</h4>
                                                <button type="button" onClick={() => deleteLecture(sectionIndex, lectureIndex)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <InputField label={`Lecture ${lectureIndex + 1} Title`} name="title" value={lecture.title} onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, e)} />
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Lecture Video</label>
                                                    <input type="file" name="lectureVideo" accept="video/*" onChange={(e) => handleFileChange(e, sectionIndex, lectureIndex)} className="file-input-style" />
                                                    {lectureVideos[`${sectionIndex}-${lectureIndex}`] && (<p className="text-sm text-gray-600 mt-2">File: {lectureVideos[`${sectionIndex}-${lectureIndex}`].name}</p>)}
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">Brief Description</label>
                                                <textarea name="description" rows="2" value={lecture.description} onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, e)} className="mt-1 block w-full input-style" placeholder="Brief description of this lecture..."></textarea>
                                            </div>

                                            {/* Section Content Editor */}
                                            <div className="border-t pt-4">
                                                <SectionContentEditor
                                                    content={lecture.contentSections || []}
                                                    onChange={(contentSections) => handleContentSectionsChange(sectionIndex, lectureIndex, contentSections)}
                                                    sectionIndex={sectionIndex}
                                                    lectureIndex={lectureIndex}
                                                    onImageUpload={handleContentImageUpload}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addLecture(sectionIndex)} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mt-2">
                                        <Plus className="h-5 w-5 mr-1" /> Add Lecture
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addSection} className="w-full py-2 px-4 border border-dashed rounded-lg text-gray-600 hover:bg-gray-100">+ Add New Section</button>
                    </div>
                </div>

                <div className="flex flex-col items-end pt-4 border-t">
                    <button type="submit" disabled={status === 'submitting'} className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                        {status === 'submitting' ? 'Saving Course...' : 'Save & Publish'}
                    </button>
                    {statusMessage && <p className={`mt-4 text-center text-lg font-semibold ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>{statusMessage}</p>}
                </div>
            </form>
        </div>
    );
};

// Reusable Input Field Component
const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

export default AddCourse;
