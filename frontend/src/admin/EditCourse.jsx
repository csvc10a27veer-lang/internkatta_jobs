// frontend/src/admin/EditCourse.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, X, Plus, Trash2, Save, ArrowLeft, Star, Video } from 'lucide-react';
import StarRating from '../components/ui/StarRating';
import { LIMITS, getWordCount, trimToWordLimit } from '../utils/validation';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // --- THIS IS THE FIX ---
    // Get the 'auth' object from the context, which contains the user and token.
    const { auth } = useAdminAuth(); 

    const [courseData, setCourseData] = useState({
        title: '', subtitle: '', description: '', smallDescription: '', category: '', level: 'Beginner', tutor: '',
        price: '', discountedPrice: '', rating: 0, duration: '1 Month', mode: 'Online', projectsCount: 0, seats: 'Unlimited', hasCertificate: true, 
        whatYouWillLearn: '', toolsAndTechnologies: '', prerequisites: '', skills: '', sections: [],
    });

    const [thumbnail, setThumbnail] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [introVideo, setIntroVideo] = useState(null);
    const [lectureVideos, setLectureVideos] = useState({});
    const [categories, setCategories] = useState([]);
    const [status, setStatus] = useState('loading');
    const [statusMessage, setStatusMessage] = useState('Loading course data...');
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [bannerPreview, setBannerPreview] = useState('');
    const [validationErrors, setValidationErrors] = useState({ description: '', smallDescription: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // The API calls will now automatically include the auth token thanks to our AuthContext setup
                        const coursePromise = api.get(`/api/courses/${id}`);
        const categoryPromise = api.get('/api/categories');
                const [courseResponse, categoryResponse] = await Promise.all([coursePromise, categoryPromise]);

                const fetchedData = courseResponse.data;
                const sanitizedData = {
                    ...fetchedData,
                    subtitle: fetchedData.subtitle || '',
                    description: fetchedData.description || '',
                    smallDescription: fetchedData.smallDescription || '',
                    level: fetchedData.level || 'Beginner',
                    price: fetchedData.price || '',
                    discountedPrice: fetchedData.discountedPrice || '',
                    rating: fetchedData.rating || 0,
                    duration: fetchedData.duration || '1 Month',
                    mode: fetchedData.mode || 'Online',
                    projectsCount: fetchedData.projectsCount || 0,
                    seats: fetchedData.seats || 'Unlimited',
                    hasCertificate: fetchedData.hasCertificate !== undefined ? fetchedData.hasCertificate : true,
                    whatYouWillLearn: Array.isArray(fetchedData.whatYouWillLearn) ? fetchedData.whatYouWillLearn.join('\n') : '',
                    toolsAndTechnologies: Array.isArray(fetchedData.toolsAndTechnologies) ? fetchedData.toolsAndTechnologies.join('\n') : '',
                    prerequisites: Array.isArray(fetchedData.prerequisites) ? fetchedData.prerequisites.join('\n') : '',
                    skills: Array.isArray(fetchedData.skills) ? fetchedData.skills.join('\n') : '',
                    sections: fetchedData.sections || []
                };
                
                setCourseData(sanitizedData);
                setCategories(categoryResponse.data);
                if (sanitizedData.thumbnailUrl) {
                    setThumbnailPreview(sanitizedData.thumbnailUrl);
                }
                if (sanitizedData.bannerImageUrl) {
                    setBannerPreview(sanitizedData.bannerImageUrl);
                }
                setStatus('idle');
            } catch (error) {
                setStatus('error');
                setStatusMessage('Failed to load course data.');
            }
        };
        fetchData();
    }, [id]);

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
                setLectureVideos(prev => ({ ...prev, [`${sectionIndex}-${lectureIndex}`]: file }));
                const newSections = JSON.parse(JSON.stringify(courseData.sections));
                newSections[sectionIndex].lectures[lectureIndex].hasNewVideo = true; // mark for backend mapping
                setCourseData(prev => ({ ...prev, sections: newSections }));
                break;
            default: break;
        }
    };

    const handleSectionChange = (sectionIndex, e) => {
        const newSections = JSON.parse(JSON.stringify(courseData.sections));
        newSections[sectionIndex][e.target.name] = e.target.value;
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };
    const addSection = () => {
        setCourseData(prev => ({ ...prev, sections: [...prev.sections, { title: '', lectures: [{ title: '', description: '' }] }] }));
    };
    const deleteSection = (sectionIndex) => {
        setCourseData(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== sectionIndex) }));
    };
    const handleLectureChange = (sectionIndex, lectureIndex, e) => {
        const newSections = JSON.parse(JSON.stringify(courseData.sections));
        newSections[sectionIndex].lectures[lectureIndex][e.target.name] = e.target.value;
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };
    const addLecture = (sectionIndex) => {
        const newSections = JSON.parse(JSON.stringify(courseData.sections));
        newSections[sectionIndex].lectures.push({ title: '', description: '' });
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };
    const deleteLecture = (sectionIndex, lectureIndex) => {
        const newSections = JSON.parse(JSON.stringify(courseData.sections));
        newSections[sectionIndex].lectures = newSections[sectionIndex].lectures.filter((_, i) => i !== lectureIndex);
        setCourseData(prev => ({ ...prev, sections: newSections }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setStatusMessage('Updating course...');

        const formData = new FormData();
        const excludedKeys = ['sections', '_id', 'createdBy', 'createdAt', '__v', 'updatedAt', 'whatYouWillLearn', 'toolsAndTechnologies', 'prerequisites', 'skills'];
        Object.keys(courseData).forEach(key => {
            if (!excludedKeys.includes(key)) {
                formData.append(key, courseData[key]);
            }
        });
        
        const parseArray = (str) => (str || '').split('\n').map(s => s.trim()).filter(s => s);
        formData.append('whatYouWillLearn', JSON.stringify(parseArray(courseData.whatYouWillLearn)));
        formData.append('toolsAndTechnologies', JSON.stringify(parseArray(courseData.toolsAndTechnologies)));
        formData.append('prerequisites', JSON.stringify(parseArray(courseData.prerequisites)));
        formData.append('skills', JSON.stringify(parseArray(courseData.skills)));
        
        if (thumbnail) formData.append('thumbnail', thumbnail);
        if (bannerImage) formData.append('bannerImage', bannerImage);
        if (introVideo) formData.append('introVideo', introVideo);

        const sectionsForUpload = courseData.sections.map((section, sIndex) => ({
            ...section,
            lectures: section.lectures.map((lecture, lIndex) => {
                const videoFile = lectureVideos[`${sIndex}-${lIndex}`];
                if (videoFile) {
                    formData.append('lectureVideos', videoFile);
                }
                return lecture;
            })
        }));
        formData.append('sections', JSON.stringify(sectionsForUpload));

        try {
            // Debug: Log the request details
            console.log('Sending course update request:', {
                url: `/api/courses/${id}`,
                hasThumbnail: !!thumbnail,
                hasIntroVideo: !!introVideo,
                sectionsCount: courseData.sections.length,
                authToken: auth?.token ? 'Present' : 'Missing'
            });
            
            // Because our AuthContext now automatically sets the token for all axios requests,
            // we no longer need to pass the 'config' object manually.
            const response = await api.put(`/api/courses/${id}`, formData);
            console.log('Course update successful:', response.data);
            setStatus('success');
            setStatusMessage('✅ Course updated successfully!');
            setTimeout(() => navigate('/admin/managecourse'), 2000);
        } catch (error) {
            console.error('Course update failed:', error);
            console.error('Error response:', error.response?.data);
            setStatus('error');
            setStatusMessage(error.response?.data?.message || 'Update failed.');
        }
    };
    
    if (status === 'loading') return <div className="text-center p-10">{statusMessage}</div>;
    if (status === 'error' && !courseData.title) return <div className="text-center p-10 text-red-500">{statusMessage}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Course</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center"><Star className="h-6 w-6 mr-2 text-indigo-500"/>Course Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Course Title" name="title" value={courseData.title} onChange={handleChange} required />
                        <InputField label="Course Subtitle" name="subtitle" value={courseData.subtitle} onChange={handleChange} required />
                        <InputField label="Tutor Name" name="tutor" value={courseData.tutor} onChange={handleChange} required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select name="category" value={courseData.category} onChange={handleChange} className="mt-1 block w-full input-style" required>
                                {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Detailed Description (For About Section)
                                <span className={`float-right text-xs ${getWordCount(courseData.description) >= LIMITS.DETAILED_DESCRIPTION_MAX_WORDS ? 'text-red-500' : 'text-gray-500'}`}>
                                    {getWordCount(courseData.description)} / {LIMITS.DETAILED_DESCRIPTION_MAX_WORDS} words
                                </span>
                            </label>
                            <textarea name="description" rows="4" required value={courseData.description} onChange={handleChange} className="mt-1 block w-full input-style"></textarea>
                            {validationErrors.description && <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Small Description (For Hero Banner)
                                <span className={`float-right text-xs ${getWordCount(courseData.smallDescription) >= LIMITS.SMALL_DESCRIPTION_MAX_WORDS ? 'text-red-500' : 'text-gray-500'}`}>
                                    {getWordCount(courseData.smallDescription)} / {LIMITS.SMALL_DESCRIPTION_MAX_WORDS} words
                                </span>
                            </label>
                            <textarea name="smallDescription" rows="2" value={courseData.smallDescription} onChange={handleChange} className="mt-1 block w-full input-style"></textarea>
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

                <div className="bg-white p-6 rounded-lg shadow-md">
                   <h2 className="text-xl font-semibold mb-4 border-b pb-2">Media & Pricing</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Thumbnail</label>
                            <input type="file" name="thumbnail" accept="image/*, image/svg+xml, .svg" onChange={handleFileChange} className="file-input-style"/>
                            {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" className="mt-4 h-32 w-auto rounded-md object-cover" />}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Banner Image (Optional)</label>
                            <input type="file" name="bannerImage" accept="image/*, image/svg+xml, .svg" onChange={handleFileChange} className="file-input-style"/>
                            {bannerPreview && <img src={bannerPreview} alt="Banner Preview" className="mt-4 h-32 w-auto rounded-md object-cover" />}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Intro Video</label>
                            <input type="file" name="introVideo" accept="video/*" onChange={handleFileChange} className="file-input-style"/>
                            {introVideo ? <p className="text-sm text-gray-500 mt-2">New video selected: {introVideo.name}</p> : <p className="text-sm text-gray-500 mt-2">Current video: {courseData.introVideoUrl ? 'Exists' : 'None'}</p>}
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

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center"><Video className="h-6 w-6 mr-2 text-indigo-500" />Course Curriculum</h2>
                    <div className="space-y-6">
                        {courseData.sections && courseData.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="p-4 border rounded-lg bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <input type="text" name="title" value={section.title} onChange={(e) => handleSectionChange(sectionIndex, e)} placeholder={`Section ${sectionIndex + 1} Title`} className="text-lg font-medium input-style w-full mr-4" />
                                    <button type="button" onClick={() => deleteSection(sectionIndex)}><Trash2 className="h-6 w-6 text-red-500 hover:text-red-700" /></button>
                                </div>
                                <div className="space-y-4 pl-4 border-l-2 ml-2">
                                    {section.lectures.map((lecture, lectureIndex) => (
                                        <div key={lectureIndex} className="p-3 bg-white rounded-md border">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <InputField label={`Lecture ${lectureIndex + 1} Title`} name="title" value={lecture.title} onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, e)} />
                                                </div>
                                                <button
                                                    type="button"
                                                    aria-label="Delete lecture"
                                                    title="Delete lecture"
                                                    onClick={() => {
                                                        if (window.confirm('Delete this lecture? This cannot be undone.')) {
                                                            deleteLecture(sectionIndex, lectureIndex);
                                                        }
                                                    }}
                                                    className="mt-6 p-2 rounded hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-5 w-5 text-red-500" />
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                                <textarea name="description" rows="2" value={lecture.description} onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, e)} className="mt-1 block w-full input-style"></textarea>
                                            </div>
                                            <div className="mt-2">
                                                <label className="block text-sm font-medium text-gray-700">Lecture Video</label>
                                                <input type="file" name="lectureVideo" accept="video/*" onChange={(e) => handleFileChange(e, sectionIndex, lectureIndex)} className="file-input-style" />
                                                {lectureVideos[`${sectionIndex}-${lectureIndex}`] ? (<p className="text-sm text-gray-600 mt-2">New video: {lectureVideos[`${sectionIndex}-${lectureIndex}`].name}</p>) : (<p className="text-sm text-gray-600 mt-2">Current video: {lecture.videoUrl ? 'Exists' : 'None'}</p>)}
                                            </div>
                                            <button type="button" onClick={() => { if (window.confirm('Delete this lecture? This cannot be undone.')) { deleteLecture(sectionIndex, lectureIndex); } }} className="text-xs text-red-500 hover:text-red-700 mt-2">Remove Lecture</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addLecture(sectionIndex)} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mt-2"><Plus className="h-5 w-5 mr-1" /> Add Lecture</button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addSection} className="w-full py-2 px-4 border border-dashed rounded-lg text-gray-600 hover:bg-gray-100">+ Add New Section</button>
                    </div>
                </div>

                <div className="flex flex-col items-end pt-4 border-t">
                    <button type="submit" disabled={status === 'submitting'} className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                        {status === 'submitting' ? 'Updating...' : 'Save Changes'}
                    </button>
                    {statusMessage && (status === 'success' || (status === 'error' && courseData.title)) && (<p className={`mt-4 text-center text-lg font-semibold ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>{statusMessage}</p>)}
                </div>
            </form>
        </div>
    );
};

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

export default EditCourse;
