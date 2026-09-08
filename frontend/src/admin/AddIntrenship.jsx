import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, UploadCloud, Loader, Star, Video, Image } from 'lucide-react';
import api, { getImageUrl } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import toast from 'react-hot-toast';
import SectionContentEditor from '../components/SectionContentEditor';
import AutoContentParser from '../components/AutoContentParser';
import StarRating from '../components/ui/StarRating';
import { LIMITS, getWordCount, trimToWordLimit } from '../utils/validation';

// Helper function to create a new, empty lecture object with MCQs
const createNewLecture = () => ({
    lectureTitle: '',
    lectureDescription: '',
    lectureContent: '',
    contentSections: [], // New field for section-wise content
    codeSnippet: '',
    taskPrompt: '',
    mcqs: [ // Each new lecture starts with 4 empty MCQs
        { question: '', options: ['', '', '', ''], correctAnswer: 0 },
        { question: '', options: ['', '', '', ''], correctAnswer: 0 },
        { question: '', options: ['', '', '', ''], correctAnswer: 0 },
        { question: '', options: ['', '', '', ''], correctAnswer: 0 },
    ]
});

const AddIntrenship = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);
    const { auth } = useAdminAuth();

    // --- State Management ---
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        tutor: '',
        price: '',
        discountedPrice: '',
        rating: 0,
        difficulty: 'Intermediate',
        duration: '',
        mode: 'Online',
        seats: 'Unlimited',
        projectsCount: 0,
        hasCertificate: true,
        smallDescription: '',
        whatYouWillLearn: '',
        toolsAndTechnologies: '',
        prerequisites: '',
        skills: '',
        thumbnail: null,
        bannerImage: null,
        lectures: [createNewLecture()]
    });
    const [categories, setCategories] = useState([]);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [bannerPreview, setBannerPreview] = useState('');
    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [contentImages, setContentImages] = useState({}); // For content section images
    const [validationErrors, setValidationErrors] = useState({ description: '', smallDescription: '' });

    // --- Content Sections Handlers ---
    const handleContentSectionsChange = (lectureIndex, contentSections) => {
        const newLectures = [...formData.lectures];
        newLectures[lectureIndex].contentSections = contentSections;
        setFormData(prev => ({ ...prev, lectures: newLectures }));
    };

    const handleContentImageUpload = (lectureIndex, contentSectionIndex, file) => {
        const imageKey = `${lectureIndex}-${contentSectionIndex}`;
        setContentImages(prev => ({ ...prev, [imageKey]: file }));
    };

    const handleAutoContentSectionsGenerated = (lectureIndex, sections) => {
        console.log('🔵 AddInternship: handleAutoContentSectionsGenerated called');
        console.log('🔵 AddInternship: lectureIndex:', lectureIndex);
        console.log('🔵 AddInternship: sections received:', sections);
        console.log('🔵 AddInternship: sections.length:', sections.length);
        
        const newLectures = [...formData.lectures];
        console.log('🔵 AddInternship: current lectures:', newLectures);
        
        // Update contentSections
        newLectures[lectureIndex].contentSections = sections.map(section => {
            console.log('🔵 AddInternship: Mapping section with image:', section.image);
            console.log('🔵 AddInternship: Section object:', JSON.stringify(section, null, 2));
            const mappedSection = {
                type: 'text',
                content: section.content,
                image: section.image, // Include the image path
                alignment: 'left' // Will be handled by the display logic
            };
            console.log('🔵 AddInternship: Mapped section:', JSON.stringify(mappedSection, null, 2));
            return mappedSection;
        });
        
        // Update lectureContent to show the parsed content for easy editing
        const parsedContent = sections.map((section, index) => {
            return `Part ${index + 1}: ${section.content}`;
        }).join('\n\n');
        
        newLectures[lectureIndex].lectureContent = parsedContent;
        
        console.log('🔵 AddInternship: updated lecture contentSections:', newLectures[lectureIndex].contentSections);
        console.log('🔵 AddInternship: updated lectureContent:', newLectures[lectureIndex].lectureContent);
        console.log('🔵 AddInternship: about to call setFormData...');
        
        setFormData(prev => {
            console.log('🔵 AddInternship: setFormData callback called with prev:', prev);
            const newFormData = { ...prev, lectures: newLectures };
            console.log('🔵 AddInternship: new formData:', newFormData);
            return newFormData;
        });
        
        console.log('🔵 AddInternship: about to show toast...');
        toast.success(`Generated ${sections.length} content sections automatically!`);
        console.log('🔵 AddInternship: handleAutoContentSectionsGenerated completed successfully');
    };

    // --- Fetch Categories and Existing Data ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/v1/internship-category/all');
                setCategories(data);
            } catch (error) {
                toast.error("Couldn't fetch categories.");
            }
        };

        const fetchInternshipData = async () => {
            if (!isEditing) return;
            try {
                const { data } = await api.get(`/api/v1/internships/admin-view/${id}`);
                
                const sanitizedLectures = data.lectures.map(lec => ({
                    ...lec,
                    mcqs: (Array.isArray(lec.mcqs) && lec.mcqs.length === 4) ? lec.mcqs : createNewLecture().mcqs
                }));

                setFormData({
                    title: data.title,
                    description: data.description || '',
                    category: data.category._id,
                    tutor: data.tutor,
                    price: data.price,
                    discountedPrice: data.discountedPrice || '',
                    rating: data.rating || 0,
                    difficulty: data.difficulty || 'Intermediate',
                    duration: data.duration,
                    thumbnail: null,
                    bannerImage: null,
                    lectures: sanitizedLectures.length > 0 ? sanitizedLectures : [createNewLecture()],
                });
                setThumbnailPreview(data.thumbnail?.url || '');
                setBannerPreview(data.bannerImage?.url || '');
            } catch (error) {
                toast.error("Failed to load internship data.");
                navigate('/admin/manage-internship');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
        fetchInternshipData();
        if (!isEditing) setLoading(false);
    }, [id, isEditing, navigate, auth.token]);

    // --- Input Handlers ---
    const handleChange = (e) => {
        let { name, value, type, checked } = e.target;
        
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

        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [name]: file }));
            if (name === 'thumbnail') {
                setThumbnailPreview(URL.createObjectURL(file));
            } else if (name === 'bannerImage') {
                setBannerPreview(URL.createObjectURL(file));
            }
        }
    };

    // --- Lecture Handlers ---
    const handleLectureChange = (lecIndex, e) => {
        const { name, value } = e.target;
        const newLectures = [...formData.lectures];
        newLectures[lecIndex][name] = value;
        setFormData(prev => ({ ...prev, lectures: newLectures }));
    };
    const addLecture = () => {
        setFormData(prev => ({ ...prev, lectures: [...prev.lectures, createNewLecture()] }));
    };
    const removeLecture = (lecIndex) => {
        if (formData.lectures.length <= 1) {
            toast.error("An internship must have at least one lecture.");
            return;
        }
        const newLectures = formData.lectures.filter((_, i) => i !== lecIndex);
        setFormData(prev => ({ ...prev, lectures: newLectures }));
    };

    // --- MCQ Handlers ---
    const handleMcqChange = (lecIndex, mcqIndex, e) => {
        const { name, value } = e.target;
        const newLectures = [...formData.lectures];
        newLectures[lecIndex].mcqs[mcqIndex][name] = value;
        setFormData(prev => ({ ...prev, lectures: newLectures }));
    };
    const handleMcqOptionChange = (lecIndex, mcqIndex, optIndex, e) => {
        const { value } = e.target;
        const newLectures = [...formData.lectures];
        newLectures[lecIndex].mcqs[mcqIndex].options[optIndex] = value;
        setFormData(prev => ({ ...prev, lectures: newLectures }));
    };
    const setCorrectAnswer = (lecIndex, mcqIndex, optIndex) => {
        const newLectures = [...formData.lectures];
        newLectures[lecIndex].mcqs[mcqIndex].correctAnswer = optIndex;
        setFormData(prev => ({ ...prev, lectures: newLectures }));
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEditing && !formData.thumbnail) {
            toast.error("A thumbnail image is required.");
            return;
        }
        setSubmitting(true);
        const submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('description', formData.description);
        submissionData.append('category', formData.category);
        submissionData.append('tutor', formData.tutor);
        submissionData.append('price', formData.price);
        submissionData.append('discountedPrice', formData.discountedPrice || '');
        submissionData.append('rating', formData.rating || 0);
        submissionData.append('difficulty', formData.difficulty || 'Intermediate');
        submissionData.append('duration', formData.duration);
        submissionData.append('mode', formData.mode);
        submissionData.append('seats', formData.seats);
        submissionData.append('projectsCount', formData.projectsCount || 0);
        submissionData.append('hasCertificate', formData.hasCertificate);
        submissionData.append('smallDescription', formData.smallDescription);
        
        const parseArray = (str) => (str || '').split('\n').map(s => s.trim()).filter(s => s);
        submissionData.append('whatYouWillLearn', JSON.stringify(parseArray(formData.whatYouWillLearn)));
        submissionData.append('toolsAndTechnologies', JSON.stringify(parseArray(formData.toolsAndTechnologies)));
        submissionData.append('prerequisites', JSON.stringify(parseArray(formData.prerequisites)));
        submissionData.append('skills', JSON.stringify(parseArray(formData.skills)));
        if (formData.thumbnail) {
            submissionData.append('thumbnail', formData.thumbnail);
        }
        if (formData.bannerImage) {
            submissionData.append('bannerImage', formData.bannerImage);
        }
        
        // Handle content section images
        Object.keys(contentImages).forEach(key => {
            submissionData.append('contentImages', contentImages[key]);
        });
        
        // Prepare lectures data with contentSections
        const lecturesForUpload = formData.lectures.map((lecture, lIndex) => {
            console.log('🔵 AddInternship: Preparing lecture', lIndex, 'for upload:', lecture);
            console.log('🔵 AddInternship: Lecture contentSections:', lecture.contentSections);
            return {
                lectureTitle: lecture.lectureTitle,
                lectureDescription: lecture.lectureDescription,
                lectureContent: lecture.lectureContent,
                contentSections: lecture.contentSections || [],
                codeSnippet: lecture.codeSnippet,
                taskPrompt: lecture.taskPrompt,
                mcqs: lecture.mcqs
            };
        });
        
        submissionData.append('lectures', JSON.stringify(lecturesForUpload));

        try {
            const apiEndpoint = isEditing ? `/api/v1/internships/${id}` : '/api/v1/internships/create';
            const method = isEditing ? 'put' : 'post';
                          await api[method](apiEndpoint, submissionData);
            toast.success(`Internship ${isEditing ? 'updated' : 'created'} successfully!`);
            navigate('/admin/manage-internship');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred.';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) { return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-indigo-600" size={48} /></div>; }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Internship Program' : 'Add New Internship Program'}</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- Program Information --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center"><Star className="h-6 w-6 mr-2 text-indigo-500" />Program Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Internship Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Full Stack Web Development" required />
                        <InputField label="Tutor / Guide" name="tutor" value={formData.tutor} onChange={handleChange} placeholder="e.g., John Doe" required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                                <option value="">Select a Category</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <InputField label="Duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 6 Weeks" required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                            <select name="difficulty" id="difficulty" value={formData.difficulty} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Detailed Description (For About Section)
                                <span className={`float-right text-xs ${getWordCount(formData.description) >= LIMITS.DETAILED_DESCRIPTION_MAX_WORDS ? 'text-red-500' : 'text-gray-500'}`}>
                                    {getWordCount(formData.description)} / {LIMITS.DETAILED_DESCRIPTION_MAX_WORDS} words
                                </span>
                            </label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="4" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Describe the internship..."></textarea>
                            {validationErrors.description && <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Small Description (For Hero Banner)
                                <span className={`float-right text-xs ${getWordCount(formData.smallDescription) >= LIMITS.SMALL_DESCRIPTION_MAX_WORDS ? 'text-red-500' : 'text-gray-500'}`}>
                                    {getWordCount(formData.smallDescription)} / {LIMITS.SMALL_DESCRIPTION_MAX_WORDS} words
                                </span>
                            </label>
                            <textarea name="smallDescription" value={formData.smallDescription} onChange={handleChange} rows="2" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                            {validationErrors.smallDescription && <p className="text-red-500 text-xs mt-1">{validationErrors.smallDescription}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">What You'll Learn (Enter one item per line)</label>
                            <textarea name="whatYouWillLearn" value={formData.whatYouWillLearn} onChange={handleChange} rows="4" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Master Power BI from scratch&#10;Build interactive dashboards"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Tools and Technologies (Enter one item per line)</label>
                            <textarea name="toolsAndTechnologies" value={formData.toolsAndTechnologies} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Power BI&#10;DAX&#10;Excel"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Prerequisites (Enter one item per line)</label>
                            <textarea name="prerequisites" value={formData.prerequisites} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Basic understanding of data concepts&#10;No prior coding experience required"></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Skills You'll Gain (Enter one item per line)</label>
                            <textarea name="skills" value={formData.skills} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Data Analysis&#10;Dashboard Design&#10;DAX"></textarea>
                        </div>
                        <InputField label="Mode" name="mode" value={formData.mode} onChange={handleChange} placeholder="e.g. Online" />
                        <InputField label="Number of Projects" name="projectsCount" type="number" value={formData.projectsCount} onChange={handleChange} placeholder="e.g. 5" />
                        <InputField label="Seats Available" name="seats" value={formData.seats} onChange={handleChange} placeholder="e.g. Unlimited" />
                        <div className="flex items-center mt-4 md:mt-0">
                            <input
                                type="checkbox"
                                name="hasCertificate"
                                checked={formData.hasCertificate}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Provides Certificate of Completion
                            </label>
                        </div>
                    </div>
                </div>

                {/* --- Media & Pricing --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center"><Image className="h-6 w-6 mr-2 text-indigo-500" />Media & Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Original Price (INR)" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g., 4999" required />
                        <InputField label="Discounted Price (INR)" name="discountedPrice" type="number" value={formData.discountedPrice} onChange={handleChange} placeholder="e.g., 3999" />
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <StarRating 
                                rating={formData.rating || 0} 
                                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                                interactive={true}
                            />
                        </div>
                        
                        <div className="md:col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative cursor-pointer hover:bg-gray-50 transition-colors">
                                <input type="file" name="thumbnail" accept="image/*, image/svg+xml, .svg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="space-y-1 text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium text-indigo-600 hover:text-indigo-500">Upload a file</span> or drag and drop
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, SVG, GIF up to 10MB</p>
                                </div>
                            </div>
                            {thumbnailPreview && (
                                <div className="mt-4 flex justify-center">
                                    <img src={getImageUrl(thumbnailPreview)} alt="Thumbnail Preview" className="h-32 w-auto object-cover rounded-md shadow-sm" />
                                </div>
                            )}
                        </div>

                        {/* Banner Image Upload */}
                        <div className="md:col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image (For Internship Details Page) (Optional)</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative cursor-pointer hover:bg-gray-50 transition-colors">
                                <input type="file" name="bannerImage" accept="image/*, image/svg+xml, .svg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="space-y-1 text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium text-indigo-600 hover:text-indigo-500">Upload a file</span> or drag and drop
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, SVG, GIF up to 10MB</p>
                                </div>
                            </div>
                            {bannerPreview && (
                                <div className="mt-4 flex justify-center">
                                    <img src={getImageUrl(bannerPreview)} alt="Banner Preview" className="h-48 w-full object-cover rounded-md shadow-sm" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Curriculum Section --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center"><Video className="h-6 w-6 mr-2 text-indigo-500" />Internship Curriculum</h2>
                    <div className="space-y-6">
                        {formData.lectures.map((lecture, lecIndex) => (
                            <div key={lecIndex} className="bg-gray-50 p-4 rounded-md border space-y-4 relative">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-lg text-gray-700">Lecture {lecIndex + 1}</h3>
                                    {formData.lectures.length > 1 && (
                                        <button type="button" onClick={() => removeLecture(lecIndex)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"><Trash2 size={18} /></button>
                                    )}
                                </div>
                                <InputField label="Lecture Title" name="lectureTitle" value={lecture.lectureTitle} onChange={(e) => handleLectureChange(lecIndex, e)} placeholder="Lecture Title" required />
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Short Description</label>
                                    <textarea name="lectureDescription" value={lecture.lectureDescription} onChange={(e) => handleLectureChange(lecIndex, e)} rows="2" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Brief description..."></textarea>
                                </div>
                                
                                {/* Auto Content Parser */}
                                <div className="border-t pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Lecture Content (Auto-Parse)</label>
                                    <textarea 
                                        name="lectureContent" 
                                        placeholder="Enter your content here (e.g., 1. What is Data Science? Data Science combines...). The system will automatically divide it into sections with predefined images." 
                                        value={lecture.lectureContent} 
                                        onChange={(e) => handleLectureChange(lecIndex, e)} 
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
                                        rows="8"
                                    ></textarea>
                                    
                                    {/* Auto Content Parser Component */}
                                    <div className="mt-4">
                                        <AutoContentParser
                                            content={lecture.lectureContent}
                                            existingSections={lecture.contentSections || []}
                                            onContentSectionsGenerated={(sections) => {
                                                console.log('🟠 AddInternship: AutoContentParser callback triggered');
                                                console.log('🟠 AddInternship: lecIndex:', lecIndex);
                                                console.log('🟠 AddInternship: sections from AutoContentParser:', sections);
                                                handleAutoContentSectionsGenerated(lecIndex, sections);
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Manual Section Content Editor */}
                                <div className="border-t pt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Manual Section Editor (Optional)</label>
                                    <SectionContentEditor
                                        content={lecture.contentSections || []}
                                        onChange={(contentSections) => handleContentSectionsChange(lecIndex, contentSections)}
                                        sectionIndex={0} // Not used in internship context
                                        lectureIndex={lecIndex}
                                        onImageUpload={handleContentImageUpload}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Code Snippet (Optional)</label>
                                    <textarea name="codeSnippet" value={lecture.codeSnippet} onChange={(e) => handleLectureChange(lecIndex, e)} rows="6" className="mt-1 block w-full px-3 py-2 bg-gray-900 text-green-400 font-mono text-sm rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Paste code here..."></textarea>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Task / Assignment</label>
                                    <textarea name="taskPrompt" value={lecture.taskPrompt} onChange={(e) => handleLectureChange(lecIndex, e)} rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Describe the task..." required></textarea>
                                </div>

                                <div className="pt-4 mt-4 border-t">
                                    <h4 className="font-semibold text-gray-700 mb-3">MCQ Quiz for this Lecture</h4>
                                    <div className="space-y-4">
                                        {lecture.mcqs.map((mcq, mcqIndex) => (
                                            <div key={mcqIndex} className="bg-white p-3 rounded border">
                                                <InputField label={`Question ${mcqIndex + 1}`} name="question" value={mcq.question} onChange={(e) => handleMcqChange(lecIndex, mcqIndex, e)} placeholder={`Enter question ${mcqIndex + 1}`} required />
                                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {mcq.options.map((option, optIndex) => (
                                                        <div key={optIndex} className="flex items-center">
                                                            <input type="text" value={option} onChange={(e) => handleMcqOptionChange(lecIndex, mcqIndex, optIndex, e)} className={`w-full px-3 py-2 bg-white border rounded-md focus:outline-none text-sm ${mcq.correctAnswer === optIndex ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder={`Option ${optIndex + 1}`} required />
                                                            <button type="button" onClick={() => setCorrectAnswer(lecIndex, mcqIndex, optIndex)} className={`ml-2 p-1 rounded-full ${mcq.correctAnswer === optIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`} title="Mark as correct answer"><Star size={14} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addLecture} className="w-full flex justify-center items-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 font-semibold transition">
                            <Plus size={18} /> Add Lecture
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-end pt-4 border-t">
                    <button type="submit" disabled={submitting} className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center">
                        {submitting && <Loader className="animate-spin mr-2" size={20} />}
                        {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Internship')}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Reusable Input Field Component
const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

export default AddIntrenship;
