import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, UploadCloud, Loader, Star, Copy, Clipboard, ArrowUp, ArrowDown, Move, Edit2, X, GripVertical, CheckSquare, Square, Eye, Video, Image } from 'lucide-react';
import api, { getImageUrl } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import toast from 'react-hot-toast';
import AutoContentParser from '../components/AutoContentParser';
import StarRating from '../components/ui/StarRating';
import ContentSectionsRenderer from '../components/ContentSectionsRenderer';
import { getWordCount, trimToWordLimit } from '../utils/validation';

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

const EditInternship = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { auth } = useAdminAuth();
    const lectureContentRefs = useRef({});

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
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const thumbnailInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const [contentImages, setContentImages] = useState({}); // For content section images
    const [copiedLecture, setCopiedLecture] = useState(null); // For copy/paste functionality
    const [isPositionMode, setIsPositionMode] = useState(false); // For position change mode
    const [allInternships, setAllInternships] = useState([]); // For fetching all internships for copy
    const [expandedLectures, setExpandedLectures] = useState(new Set()); // Track which lectures are expanded for editing
    const [draggedIndex, setDraggedIndex] = useState(null); // Track which lecture is being dragged
    const [dragOverIndex, setDragOverIndex] = useState(null); // Track which position is being dragged over
    const [selectedLectures, setSelectedLectures] = useState(new Set()); // Track which lectures are selected for multi-copy
    const [copiedMultipleLectures, setCopiedMultipleLectures] = useState([]); // Store multiple copied lectures
    const [lectureCategories, setLectureCategories] = useState({}); // Track selected category for each lecture

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

    // Sync editor DOM content to lectureContent before parsing
    // This ensures code block edits are captured before Apply Sections
    const syncEditorContentToLectureContent = (lectureIndex) => {
        const editor = lectureContentRefs.current[lectureIndex];
        if (!editor) return null;
        
        const content = editor.innerHTML;
        const newLectures = [...formData.lectures];
        newLectures[lectureIndex].lectureContent = content;
        setFormData(prev => ({ ...prev, lectures: newLectures }));
        
        // Return the synced content for immediate use
        return content;
    };

    const handleAutoContentSectionsGenerated = (lectureIndex, sections) => {
        console.log('🔵 EditInternship: handleAutoContentSectionsGenerated called');
        console.log('🔵 EditInternship: lectureIndex:', lectureIndex);
        console.log('🔵 EditInternship: sections received:', sections);
        console.log('🔵 EditInternship: sections.length:', sections.length);
        
        // CRITICAL: Sync editor DOM to lectureContent before processing sections
        // This ensures code block edits are captured in contentSections
        const syncedContent = syncEditorContentToLectureContent(lectureIndex);
        
        const editor = lectureContentRefs.current[lectureIndex];
        const newLectures = [...formData.lectures];
        console.log('🔵 EditInternship: current lectures:', newLectures);
        
        // CRITICAL: For code blocks, read content directly from editor DOM to ensure latest edits are captured
        // The sections were parsed from lectureContent, but code block content might be stale
        // Extract fresh code block content from the editor DOM
        const codeBlockArray = [];
        if (editor) {
            const codeBlocks = editor.querySelectorAll('pre[data-type="code"]');
            codeBlocks.forEach((codeBlock) => {
                const content = codeBlock.textContent || codeBlock.innerText || '';
                const language = codeBlock.getAttribute('data-language') || null;
                codeBlockArray.push({ content: content.trim(), language });
            });
        }
        
        // Track code block index separately from section index
        let codeBlockIndex = 0;
        
        // Update contentSections
        // FIX: contentSections is the source of truth. Do NOT overwrite lectureContent.
        newLectures[lectureIndex].contentSections = sections.map((section, index) => {
            console.log('🔵 EditInternship: Mapping section with image:', section.image);
            console.log('🔵 EditInternship: Section object:', JSON.stringify(section, null, 2));
            
            // If this is a code section, use the fresh content from editor DOM
            if (section.type === 'code') {
                // Get the corresponding code block from editor DOM (in order)
                const codeBlockData = codeBlockArray[codeBlockIndex];
                const codeContent = codeBlockData ? codeBlockData.content : section.content;
                const codeLanguage = codeBlockData ? codeBlockData.language : (section.language || null);
                
                codeBlockIndex++; // Move to next code block for next code section
                
                const mappedSection = {
                    type: 'code',
                    content: codeContent, // Use fresh content from editor DOM
                    image: '', // Code blocks never have images
                    alignment: 'left'
                };
                if (codeLanguage) {
                    mappedSection.language = codeLanguage;
                }
                console.log('🔵 EditInternship: Code section updated with fresh content:', codeContent.substring(0, 50));
                return mappedSection;
            }
            
            // For non-code sections, use parsed content as-is
            const mappedSection = {
                type: section.type || 'text', // Preserve original type (text, text-only)
                content: section.content,
                image: section.image || '', // Preserve image path
                alignment: 'left' // Will be handled by the display logic
            };
            console.log('🔵 EditInternship: Mapped section:', JSON.stringify(mappedSection, null, 2));
            return mappedSection;
        });
        
        // FIX: Do NOT overwrite lectureContent with "Part X:" format.
        // lectureContent should remain unchanged or be deprecated.
        // contentSections is the authoritative source of structured content.
        // Only update lectureContent if it doesn't exist (for backward compatibility)
        if (!newLectures[lectureIndex].lectureContent) {
            // If lectureContent is missing, create a simple fallback (not "Part X:" format)
            const simpleContent = sections.map(section => section.content).join('\n\n');
            newLectures[lectureIndex].lectureContent = simpleContent;
            console.log('🔵 EditInternship: Created fallback lectureContent (was missing)');
        } else {
            // Keep existing lectureContent unchanged
            console.log('🔵 EditInternship: Preserving existing lectureContent (not overwriting)');
        }
        
        console.log('🔵 EditInternship: updated lecture contentSections:', newLectures[lectureIndex].contentSections);
        console.log('🔵 EditInternship: updated lectureContent:', newLectures[lectureIndex].lectureContent);
        console.log('🔵 EditInternship: about to call setFormData...');
        
        setFormData(prev => {
            console.log('🔵 EditInternship: setFormData callback called with prev:', prev);
            const newFormData = { ...prev, lectures: newLectures };
            console.log('🔵 EditInternship: new formData:', newFormData);
            return newFormData;
        });
        
        console.log('🔵 EditInternship: about to show toast...');
        toast.success(`Generated ${sections.length} content sections automatically!`);
        console.log('🔵 EditInternship: handleAutoContentSectionsGenerated completed successfully');
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

        const fetchAllInternships = async () => {
            try {
                const { data } = await api.get('/api/v1/internships/all');
                setAllInternships(data);
            } catch (error) {
                console.error("Couldn't fetch all internships for copy feature.");
            }
        };

        const fetchInternshipData = async () => {
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
                    mode: data.mode || 'Online',
                    seats: data.seats || 'Unlimited',
                    projectsCount: data.projectsCount || 0,
                    hasCertificate: data.hasCertificate !== undefined ? data.hasCertificate : true,
                    smallDescription: data.smallDescription || '',
                    whatYouWillLearn: data.whatYouWillLearn ? data.whatYouWillLearn.join('\n') : '',
                    toolsAndTechnologies: data.toolsAndTechnologies ? data.toolsAndTechnologies.join('\n') : '',
                    prerequisites: data.prerequisites ? data.prerequisites.join('\n') : '',
                    skills: data.skills ? data.skills.join('\n') : '',
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
        fetchAllInternships();
        fetchInternshipData();

        // Check if there's a copied lecture in localStorage
        const storedLecture = localStorage.getItem('copiedLecture');
        if (storedLecture) {
            try {
                setCopiedLecture(JSON.parse(storedLecture));
            } catch (error) {
                console.error('Failed to parse copied lecture from localStorage');
            }
        }

        // Check if there are multiple copied lectures in localStorage
        const storedMultipleLectures = localStorage.getItem('copiedMultipleLectures');
        if (storedMultipleLectures) {
            try {
                setCopiedMultipleLectures(JSON.parse(storedMultipleLectures));
            } catch (error) {
                console.error('Failed to parse copied multiple lectures from localStorage');
            }
        }
    }, [id, navigate, auth.token]);

    // --- Input Handlers ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;
        
        // Word limit validation for descriptions
        if (name === 'smallDescription' && typeof newValue === 'string') {
            const wordCount = getWordCount(newValue);
            if (wordCount > 30) {
                toast.error('Small description cannot exceed 30 words.', { id: 'smallDescLimit' });
                newValue = trimToWordLimit(newValue, 30);
            }
        }
        
        if (name === 'description' && typeof newValue === 'string') {
            const wordCount = getWordCount(newValue);
            if (wordCount > 100) {
                toast.error('Detailed description cannot exceed 100 words.', { id: 'descLimit' });
                newValue = trimToWordLimit(newValue, 100);
            }
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };
    
    // --- Rich text helpers for lecture content ---
    const applyTextFormat = (lectureIndex, formatter) => {
        const editor = lectureContentRefs.current[lectureIndex];
        if (!editor) return;

        // Focus the editor to restore selection
        editor.focus();
        
        // Restore selection if needed
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            // If no selection, select all text
            const range = document.createRange();
            range.selectNodeContents(editor);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        try {
            switch (formatter.type) {
                case 'bold':
                    document.execCommand('bold', false, null);
                    break;
                case 'italic':
                    document.execCommand('italic', false, null);
                    break;
                case 'color':
                    document.execCommand('foreColor', false, formatter.value);
                    break;
                case 'fontSize':
                    document.execCommand('fontSize', false, '3'); // This sets a base size
                    // Then apply custom size via style
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const span = document.createElement('span');
                        span.style.fontSize = `${formatter.value}px`;
                        try {
                            range.surroundContents(span);
                        } catch (e) {
                            // If surroundContents fails, use alternative method
                            span.appendChild(range.extractContents());
                            range.insertNode(span);
                        }
                    }
                    break;
                case 'fontFamily':
                    document.execCommand('fontName', false, formatter.value);
                    break;
                default:
                    break;
            }
            
            // Update the form data with the HTML content
            const newLectures = [...formData.lectures];
            newLectures[lectureIndex].lectureContent = editor.innerHTML;
            setFormData(prev => ({ ...prev, lectures: newLectures }));
        } catch (error) {
            console.error('Error applying format:', error);
        }
    };

    // Insert code block at cursor position
    const insertCodeBlock = (lectureIndex) => {
        const editor = lectureContentRefs.current[lectureIndex];
        if (!editor) return;

        editor.focus();
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // Create wrapper div for code block with delete button
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.style.width = '100%';
            wrapper.style.margin = '8px 0';
            
            // Create code block
            const codeBlock = document.createElement('pre');
            codeBlock.setAttribute('data-type', 'code');
            // Don't set data-language by default - only if user enters a language
            codeBlock.setAttribute('contenteditable', 'true');
            codeBlock.textContent = '// Enter your code here';
            codeBlock.style.backgroundColor = '#1f2937';
            codeBlock.style.color = '#10b981';
            codeBlock.style.padding = '12px';
            codeBlock.style.borderRadius = '6px';
            codeBlock.style.margin = '0';
            codeBlock.style.fontFamily = 'monospace';
            codeBlock.style.fontSize = '14px';
            codeBlock.style.overflowX = 'auto';
            codeBlock.style.whiteSpace = 'pre';
            codeBlock.style.minHeight = '40px';
            
            // Create language input
            const languageInput = document.createElement('input');
            languageInput.setAttribute('type', 'text');
            languageInput.setAttribute('data-code-block-language', 'true');
            languageInput.setAttribute('contenteditable', 'false');
            languageInput.setAttribute('placeholder', 'Language (optional)');
            languageInput.style.position = 'absolute';
            languageInput.style.top = '4px';
            languageInput.style.right = '32px';
            languageInput.style.width = '100px';
            languageInput.style.padding = '2px 6px';
            languageInput.style.borderRadius = '4px';
            languageInput.style.border = '1px solid #4b5563';
            languageInput.style.backgroundColor = '#374151';
            languageInput.style.color = '#d1d5db';
            languageInput.style.fontSize = '11px';
            languageInput.style.fontFamily = 'monospace';
            languageInput.style.zIndex = '10';
            languageInput.style.outline = 'none';
            languageInput.value = '';
            
            // Language change handler
            languageInput.onblur = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const enteredLanguage = languageInput.value.trim();
                if (enteredLanguage) {
                    codeBlock.setAttribute('data-language', enteredLanguage);
                } else {
                    codeBlock.removeAttribute('data-language');
                }
                // Update form data
                const newLectures = [...formData.lectures];
                newLectures[lectureIndex].lectureContent = editor.innerHTML;
                setFormData(prev => ({ ...prev, lectures: newLectures }));
            };
            
            // Prevent clicks from affecting code block selection
            languageInput.onclick = (e) => {
                e.stopPropagation();
            };
            
            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '×';
            deleteButton.setAttribute('type', 'button');
            deleteButton.setAttribute('data-code-block-delete', 'true');
            deleteButton.setAttribute('contenteditable', 'false');
            deleteButton.style.position = 'absolute';
            deleteButton.style.top = '4px';
            deleteButton.style.right = '4px';
            deleteButton.style.width = '24px';
            deleteButton.style.height = '24px';
            deleteButton.style.borderRadius = '50%';
            deleteButton.style.backgroundColor = '#ef4444';
            deleteButton.style.color = 'white';
            deleteButton.style.border = 'none';
            deleteButton.style.cursor = 'pointer';
            deleteButton.style.display = 'flex';
            deleteButton.style.alignItems = 'center';
            deleteButton.style.justifyContent = 'center';
            deleteButton.style.fontSize = '18px';
            deleteButton.style.fontWeight = 'bold';
            deleteButton.style.lineHeight = '1';
            deleteButton.style.zIndex = '10';
            deleteButton.style.opacity = '0.8';
            deleteButton.style.transition = 'opacity 0.2s';
            
            // Hover effect
            deleteButton.onmouseenter = () => {
                deleteButton.style.opacity = '1';
                deleteButton.style.backgroundColor = '#dc2626';
            };
            deleteButton.onmouseleave = () => {
                deleteButton.style.opacity = '0.8';
                deleteButton.style.backgroundColor = '#ef4444';
            };
            
            // Delete handler
            deleteButton.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                wrapper.remove();
                // Update form data
                const newLectures = [...formData.lectures];
                newLectures[lectureIndex].lectureContent = editor.innerHTML;
                setFormData(prev => ({ ...prev, lectures: newLectures }));
            };
            
            // Append code block, language input, and delete button to wrapper
            wrapper.appendChild(codeBlock);
            wrapper.appendChild(languageInput);
            wrapper.appendChild(deleteButton);
            
            // Insert wrapper
            range.deleteContents();
            range.insertNode(wrapper);
            
            // Place cursor inside code block
            const newRange = document.createRange();
            newRange.selectNodeContents(codeBlock);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Update form data
            const newLectures = [...formData.lectures];
            newLectures[lectureIndex].lectureContent = editor.innerHTML;
            setFormData(prev => ({ ...prev, lectures: newLectures }));
        }
    };

    // Handle content change in WYSIWYG editor
    const handleContentEditableChange = (lectureIndex, e) => {
        // CRITICAL: Do NOT use e.target.innerHTML - e.target can be a child UI element (button, input)
        // which would cause lectureContent to be overwritten with UI element content (e.g., "×" from delete button)
        // Always read from the editor ref to guarantee we get the actual editor container content
        const editor = lectureContentRefs.current[lectureIndex];
        if (!editor) return;
        
        // Defensive guard: ignore events from child UI nodes (buttons, inputs, etc.)
        if (e.target !== editor) return;
        
        const newLectures = [...formData.lectures];
        const content = editor.innerHTML;
        newLectures[lectureIndex].lectureContent = content;
        setFormData(prev => ({ ...prev, lectures: newLectures }));
    };

    // Initialize delete buttons and language selectors for existing code blocks
    const initializeCodeBlockDeleteButtons = (editor, lectureIndex) => {
        if (!editor) return;
        
        // Find all code blocks (pre elements with data-type="code")
        const codeBlocks = editor.querySelectorAll('pre[data-type="code"]');
        
        codeBlocks.forEach((codeBlock) => {
            // Check if it already has a delete button
            const parent = codeBlock.parentElement;
            const existingButton = parent?.querySelector('[data-code-block-delete="true"]');
            const existingLanguageInput = parent?.querySelector('[data-code-block-language="true"]');
            
            // Determine if we need to create a wrapper
            let wrapper = parent;
            const needsWrapper = !wrapper || 
                                wrapper.tagName !== 'DIV' || 
                                wrapper.style.position !== 'relative';
            
            if (needsWrapper) {
                // Create wrapper
                wrapper = document.createElement('div');
                wrapper.style.position = 'relative';
                wrapper.style.display = 'inline-block';
                wrapper.style.width = '100%';
                wrapper.style.margin = '8px 0';
                
                // Insert wrapper before code block
                const oldParent = codeBlock.parentNode;
                if (oldParent) {
                    oldParent.insertBefore(wrapper, codeBlock);
                }
                wrapper.appendChild(codeBlock);
            }
            
            // Get current language from code block (if exists)
            const currentLanguage = codeBlock.getAttribute('data-language') || '';
            
            // Create language input if it doesn't exist
            if (!existingLanguageInput) {
                const languageInput = document.createElement('input');
                languageInput.setAttribute('type', 'text');
                languageInput.setAttribute('data-code-block-language', 'true');
                languageInput.setAttribute('contenteditable', 'false');
                languageInput.setAttribute('placeholder', 'Language (optional)');
                languageInput.style.position = 'absolute';
                languageInput.style.top = '4px';
                languageInput.style.right = '32px';
                languageInput.style.width = '100px';
                languageInput.style.padding = '2px 6px';
                languageInput.style.borderRadius = '4px';
                languageInput.style.border = '1px solid #4b5563';
                languageInput.style.backgroundColor = '#374151';
                languageInput.style.color = '#d1d5db';
                languageInput.style.fontSize = '11px';
                languageInput.style.fontFamily = 'monospace';
                languageInput.style.zIndex = '10';
                languageInput.style.outline = 'none';
                languageInput.value = currentLanguage;
                
                // Language change handler
                languageInput.onblur = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const enteredLanguage = languageInput.value.trim();
                    if (enteredLanguage) {
                        codeBlock.setAttribute('data-language', enteredLanguage);
                    } else {
                        codeBlock.removeAttribute('data-language');
                    }
                    // Update form data
                    const newLectures = [...formData.lectures];
                    newLectures[lectureIndex].lectureContent = editor.innerHTML;
                    setFormData(prev => ({ ...prev, lectures: newLectures }));
                };
                
                // Prevent clicks from affecting code block selection
                languageInput.onclick = (e) => {
                    e.stopPropagation();
                };
                
                wrapper.appendChild(languageInput);
            }
            
            // Create delete button if it doesn't exist
            if (!existingButton) {
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '×';
                deleteButton.setAttribute('type', 'button');
                deleteButton.setAttribute('data-code-block-delete', 'true');
                deleteButton.setAttribute('contenteditable', 'false');
                deleteButton.style.position = 'absolute';
                deleteButton.style.top = '4px';
                deleteButton.style.right = '4px';
                deleteButton.style.width = '24px';
                deleteButton.style.height = '24px';
                deleteButton.style.borderRadius = '50%';
                deleteButton.style.backgroundColor = '#ef4444';
                deleteButton.style.color = 'white';
                deleteButton.style.border = 'none';
                deleteButton.style.cursor = 'pointer';
                deleteButton.style.display = 'flex';
                deleteButton.style.alignItems = 'center';
                deleteButton.style.justifyContent = 'center';
                deleteButton.style.fontSize = '18px';
                deleteButton.style.fontWeight = 'bold';
                deleteButton.style.lineHeight = '1';
                deleteButton.style.zIndex = '10';
                deleteButton.style.opacity = '0.8';
                deleteButton.style.transition = 'opacity 0.2s';
                
                // Hover effect
                deleteButton.onmouseenter = () => {
                    deleteButton.style.opacity = '1';
                    deleteButton.style.backgroundColor = '#dc2626';
                };
                deleteButton.onmouseleave = () => {
                    deleteButton.style.opacity = '0.8';
                    deleteButton.style.backgroundColor = '#ef4444';
                };
                
                // Delete handler
                deleteButton.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Always remove the wrapper when delete is clicked - do not check for <pre> existence
                    // The delete intent comes from clicking ❌, not from checking child elements
                    if (editor.contains(wrapper)) {
                        wrapper.remove();
                        // Update form data
                        const newLectures = [...formData.lectures];
                        newLectures[lectureIndex].lectureContent = editor.innerHTML;
                        setFormData(prev => ({ ...prev, lectures: newLectures }));
                    }
                };
                
                wrapper.appendChild(deleteButton);
            }
        });
    };

    // Handle clicks in contentEditable to support delete buttons
    const handleContentEditableClick = (lectureIndex, e) => {
        const target = e.target;
        if (target.getAttribute('data-code-block-delete') === 'true') {
            e.preventDefault();
            e.stopPropagation();
            const editor = lectureContentRefs.current[lectureIndex];
            if (!editor) return;
            
            // Find the wrapper that contains this delete button
            // Walk up the DOM to find the wrapper div with position: relative
            // Do NOT check for <pre> existence - delete intent comes from clicking ❌
            let wrapper = target.parentElement;
            
            while (wrapper && wrapper !== editor) {
                const style = window.getComputedStyle(wrapper);
                if (style.position === 'relative') {
                    // Found the wrapper - always remove it when delete button is clicked
                    if (editor.contains(wrapper)) {
                        wrapper.remove();
                        const newLectures = [...formData.lectures];
                        newLectures[lectureIndex].lectureContent = editor.innerHTML;
                        setFormData(prev => ({ ...prev, lectures: newLectures }));
                        return;
                    }
                }
                wrapper = wrapper.parentElement;
            }
        }
    };

    // Toggle lecture expansion for editing
    const toggleLectureEdit = (lecIndex) => {
        setExpandedLectures(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lecIndex)) {
                newSet.delete(lecIndex);
            } else {
                newSet.add(lecIndex);
            }
            return newSet;
        });
    };

    // Sync contentEditable divs when a lecture is expanded
    useEffect(() => {
        // Sync content for newly expanded lectures
        const timeoutId = setTimeout(() => {
            expandedLectures.forEach((lecIndex) => {
                const editor = lectureContentRefs.current[lecIndex];
                const lecture = formData.lectures[lecIndex];
                
                if (editor) {
                    // Get content to display - prefer lectureContent, but reconstruct from contentSections if needed
                    let contentToDisplay = lecture?.lectureContent || '';
                    
                    // If lectureContent is empty but contentSections exists, reconstruct the text
                    if (!contentToDisplay && lecture?.contentSections && Array.isArray(lecture.contentSections) && lecture.contentSections.length > 0) {
                        // Helper function to escape HTML
                        const escapeHtml = (text) => {
                            if (!text) return '';
                            return String(text)
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&#039;');
                        };
                        
                        // Reconstruct text from contentSections, preserving code blocks
                        contentToDisplay = lecture.contentSections.map((section, idx) => {
                            if (section.type === 'code') {
                                // For code sections, create the HTML structure with escaped content
                                const language = section.language || '';
                                const escapedContent = escapeHtml(section.content || '');
                                return `<div style="position: relative; display: inline-block; width: 100%; margin: 8px 0px;"><pre data-type="code" data-language="${escapeHtml(language)}" style="background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; margin: 0;">${escapedContent}</pre></div>`;
                            } else {
                                // For text sections, use the content as-is (may contain HTML from rich text editor)
                                return section.content || '';
                            }
                        }).join('\n\n');
                        
                        // Update lectureContent in state for future use
                        const newLectures = [...formData.lectures];
                        newLectures[lecIndex].lectureContent = contentToDisplay;
                        setFormData(prev => ({ ...prev, lectures: newLectures }));
                    }
                    
                    if (contentToDisplay && editor.innerHTML !== contentToDisplay && document.activeElement !== editor) {
                        editor.innerHTML = contentToDisplay;
                        setTimeout(() => {
                            initializeCodeBlockDeleteButtons(editor, lecIndex);
                        }, 0);
                    }
                }
            });
        }, 150); // Delay to ensure DOM is rendered after expansion

        return () => clearTimeout(timeoutId);
    }, [expandedLectures, formData.lectures]);

    // Sync contentEditable divs when formData.lectures changes (e.g., on load)
    useEffect(() => {
        // Only sync lectures that are currently expanded (editors exist)
        const timeoutId = setTimeout(() => {
            formData.lectures.forEach((lecture, index) => {
                // Only try to sync if lecture is expanded (editor exists)
                if (!expandedLectures.has(index)) {
                    return;
                }
                
                const editor = lectureContentRefs.current[index];
                if (editor) {
                    // Get content to display - prefer lectureContent, but reconstruct from contentSections if needed
                    let contentToDisplay = lecture.lectureContent || '';
                    
                    // If lectureContent is empty but contentSections exists, reconstruct the text
                    if (!contentToDisplay && lecture.contentSections && Array.isArray(lecture.contentSections) && lecture.contentSections.length > 0) {
                        // Helper function to escape HTML
                        const escapeHtml = (text) => {
                            if (!text) return '';
                            return String(text)
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&#039;');
                        };
                        
                        // Reconstruct text from contentSections, preserving code blocks
                        contentToDisplay = lecture.contentSections.map((section, idx) => {
                            if (section.type === 'code') {
                                // For code sections, create the HTML structure with escaped content
                                const language = section.language || '';
                                const escapedContent = escapeHtml(section.content || '');
                                return `<div style="position: relative; display: inline-block; width: 100%; margin: 8px 0px;"><pre data-type="code" data-language="${escapeHtml(language)}" style="background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; margin: 0;">${escapedContent}</pre></div>`;
                            } else {
                                // For text sections, use the content as-is (may contain HTML from rich text editor)
                                return section.content || '';
                            }
                        }).join('\n\n');
                    }
                    
                    if (contentToDisplay && editor.innerHTML !== contentToDisplay && document.activeElement !== editor) {
                        editor.innerHTML = contentToDisplay;
                        setTimeout(() => {
                            initializeCodeBlockDeleteButtons(editor, index);
                        }, 0);
                    }
                    // Mark as initialized if not already
                    if (!editor.hasAttribute('data-initialized')) {
                        editor.setAttribute('data-initialized', 'true');
                    }
                }
            });
        }, 100); // Small delay to ensure refs are set

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.lectures.map(lec => lec.lectureContent || '').join('|'), formData.lectures.length, expandedLectures]); // Sync when lectureContent, number of lectures, or expanded lectures change
    
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

    const handleLectureChange = (lecIndex, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            lectures: prev.lectures.map((lec, index) =>
                index === lecIndex ? { ...lec, [name]: value } : lec
            )
        }));
    };

    const addLecture = () => {
        setFormData(prev => ({
            ...prev,
            lectures: [...prev.lectures, createNewLecture()]
        }));
    };

    const removeLecture = (lecIndex) => {
        setFormData(prev => ({
            ...prev,
            lectures: prev.lectures.filter((_, index) => index !== lecIndex)
        }));
    };

    // --- Copy/Paste Lecture Functions ---
    const copyLecture = (lecIndex) => {
        const lectureToCopy = formData.lectures[lecIndex];
        // Store in localStorage for persistence across page navigation
        localStorage.setItem('copiedLecture', JSON.stringify(lectureToCopy));
        setCopiedLecture(lectureToCopy);
        toast.success('Lecture copied! You can now paste it into any internship.');
    };

    const pasteLecture = (targetIndex = null) => {
        // Check if multiple lectures are copied
        if (copiedMultipleLectures.length > 0) {
            setFormData(prev => {
                const newLectures = [...prev.lectures];
                if (targetIndex !== null) {
                    // Insert multiple lectures at specific position
                    copiedMultipleLectures.forEach((lecture, index) => {
                        newLectures.splice(targetIndex + index, 0, { ...lecture });
                    });
                } else {
                    // Add multiple lectures at the end
                    copiedMultipleLectures.forEach(lecture => {
                        newLectures.push({ ...lecture });
                    });
                }
                return { ...prev, lectures: newLectures };
            });
            toast.success(`${copiedMultipleLectures.length} lecture(s) pasted successfully!`);
            return;
        }

        // Single lecture paste (existing functionality)
        const storedLecture = localStorage.getItem('copiedLecture');
        if (!storedLecture) {
            toast.error('No lecture copied. Please copy a lecture first.');
            return;
        }

        try {
            const lectureToPaste = JSON.parse(storedLecture);
            setFormData(prev => {
                const newLectures = [...prev.lectures];
                if (targetIndex !== null) {
                    // Insert at specific position
                    newLectures.splice(targetIndex, 0, { ...lectureToPaste });
                } else {
                    // Add at the end
                    newLectures.push({ ...lectureToPaste });
                }
                return { ...prev, lectures: newLectures };
            });
            toast.success('Lecture pasted successfully!');
        } catch (error) {
            toast.error('Failed to paste lecture. Please try copying again.');
        }
    };

    // --- Multi-Select Functions ---
    const toggleLectureSelection = (lecIndex) => {
        setSelectedLectures(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lecIndex)) {
                newSet.delete(lecIndex);
            } else {
                newSet.add(lecIndex);
            }
            return newSet;
        });
    };

    const selectAllLectures = () => {
        setSelectedLectures(new Set(formData.lectures.map((_, index) => index)));
    };

    const deselectAllLectures = () => {
        setSelectedLectures(new Set());
    };

    const copySelectedLectures = () => {
        if (selectedLectures.size === 0) {
            toast.error('No lectures selected. Please select lectures first.');
            return;
        }

        const lecturesToCopy = Array.from(selectedLectures)
            .sort((a, b) => a - b)
            .map(index => formData.lectures[index]);
        
        // Store in localStorage
        localStorage.setItem('copiedMultipleLectures', JSON.stringify(lecturesToCopy));
        setCopiedMultipleLectures(lecturesToCopy);
        // Clear single lecture copy
        setCopiedLecture(null);
        localStorage.removeItem('copiedLecture');
        
        toast.success(`${selectedLectures.size} lecture(s) copied! You can now paste them.`);
    };

    // --- Position Change Functions ---
    const moveLectureUp = (lecIndex) => {
        if (lecIndex === 0) return;
        setFormData(prev => {
            const newLectures = [...prev.lectures];
            [newLectures[lecIndex - 1], newLectures[lecIndex]] = [newLectures[lecIndex], newLectures[lecIndex - 1]];
            return { ...prev, lectures: newLectures };
        });
        toast.success('Lecture moved up');
    };

    const moveLectureDown = (lecIndex) => {
        if (lecIndex === formData.lectures.length - 1) return;
        setFormData(prev => {
            const newLectures = [...prev.lectures];
            [newLectures[lecIndex], newLectures[lecIndex + 1]] = [newLectures[lecIndex + 1], newLectures[lecIndex]];
            return { ...prev, lectures: newLectures };
        });
        toast.success('Lecture moved down');
    };

    const handleMcqChange = (lecIndex, mcqIndex, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            lectures: prev.lectures.map((lec, index) =>
                index === lecIndex
                    ? {
                        ...lec,
                        mcqs: lec.mcqs.map((mcq, mcqIdx) =>
                            mcqIdx === mcqIndex ? { ...mcq, [name]: value } : mcq
                        )
                    }
                    : lec
            )
        }));
    };

    const handleMcqOptionChange = (lecIndex, mcqIndex, optIndex, e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            lectures: prev.lectures.map((lec, index) =>
                index === lecIndex
                    ? {
                        ...lec,
                        mcqs: lec.mcqs.map((mcq, mcqIdx) =>
                            mcqIdx === mcqIndex
                                ? {
                                    ...mcq,
                                    options: mcq.options.map((opt, optIdx) =>
                                        optIdx === optIndex ? value : opt
                                    )
                                }
                                : mcq
                        )
                    }
                    : lec
            )
        }));
    };

    const setCorrectAnswer = (lecIndex, mcqIndex, optIndex) => {
        setFormData(prev => ({
            ...prev,
            lectures: prev.lectures.map((lec, index) =>
                index === lecIndex
                    ? {
                        ...lec,
                        mcqs: lec.mcqs.map((mcq, mcqIdx) =>
                            mcqIdx === mcqIndex ? { ...mcq, correctAnswer: optIndex } : mcq
                        )
                    }
                    : lec
            )
        }));
    };

    // --- Drag and Drop Functions ---
    const handleDragStart = (e, lecIndex) => {
        setDraggedIndex(lecIndex);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target);
        e.target.style.opacity = '0.5';
    };

    const handleDragOver = (e, lecIndex) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(lecIndex);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        setFormData(prev => {
            const newLectures = [...prev.lectures];
            const draggedLecture = newLectures[draggedIndex];
            
            // Remove the dragged lecture
            newLectures.splice(draggedIndex, 1);
            
            // Insert at new position
            const newIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
            newLectures.splice(newIndex, 0, draggedLecture);
            
            return { ...prev, lectures: newLectures };
        });

        toast.success('Lecture moved successfully!');
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // --- Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
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
        // FIX: Ensure contentSections is authoritative. Do not send corrupted lectureContent.
        const lecturesForUpload = formData.lectures.map((lecture, lIndex) => {
            console.log('🔵 EditInternship: Preparing lecture', lIndex, 'for upload:', lecture);
            console.log('🔵 EditInternship: Lecture contentSections:', lecture.contentSections);
            
            // Detailed logging for contentSections
            if (lecture.contentSections && Array.isArray(lecture.contentSections) && lecture.contentSections.length > 0) {
                console.log('✅ EditInternship: Sending contentSections to backend!');
                console.log('📊 EditInternship: Number of sections being sent:', lecture.contentSections.length);
                lecture.contentSections.forEach((section, index) => {
                    console.log(`📋 EditInternship: Section ${index} being sent:`, {
                        type: section.type,
                        content: section.content?.substring(0, 50) + '...',
                        image: section.image,
                        alignment: section.alignment,
                        language: section.language
                    });
                });
            } else if (Array.isArray(lecture.contentSections) && lecture.contentSections.length === 0) {
                console.log('🟡 EditInternship: Sending empty contentSections array (valid state)');
            } else {
                console.log('❌ EditInternship: contentSections is not an array or is missing!');
            }
            
            // FIX: If contentSections exists (even if empty array), it is authoritative.
            // Only send lectureContent if contentSections doesn't exist (for backward compatibility).
            // Do NOT send corrupted "Part X:" format lectureContent when contentSections exists.
            const lectureData = {
                _id: lecture._id,
                lectureTitle: lecture.lectureTitle,
                lectureDescription: lecture.lectureDescription,
                codeSnippet: lecture.codeSnippet,
                taskPrompt: lecture.taskPrompt,
                mcqs: lecture.mcqs
            };
            
            // contentSections is the source of truth - always send it if it's an array
            if (Array.isArray(lecture.contentSections)) {
                lectureData.contentSections = lecture.contentSections;
                // Only send lectureContent if it doesn't contain "Part X:" corruption
                // or if contentSections is empty (for backward compatibility)
                if (lecture.contentSections.length === 0 && lecture.lectureContent) {
                    // Empty sections but has legacy content - send it for backward compatibility
                    lectureData.lectureContent = lecture.lectureContent;
                } else if (lecture.contentSections.length > 0) {
                    // Has sections - do NOT send corrupted lectureContent
                    // Only send if it doesn't contain "Part X:" pattern
                    if (lecture.lectureContent && !lecture.lectureContent.match(/^Part\s+\d+\s*:/m)) {
                        lectureData.lectureContent = lecture.lectureContent;
                    }
                    // Otherwise omit lectureContent to prevent corruption
                }
            } else {
                // contentSections is not an array - send lectureContent as fallback
                lectureData.lectureContent = lecture.lectureContent || '';
                lectureData.contentSections = [];
            }
            
            return lectureData;
        });
        
        submissionData.append('lectures', JSON.stringify(lecturesForUpload));

        try {
            const { data } = await api.put(`/api/v1/internships/${id}`, submissionData);
            toast.success('Internship updated successfully!');
            
            // Update thumbnail preview if thumbnail was uploaded
            if (formData.thumbnail && data.thumbnail && data.thumbnail.url) {
                setThumbnailPreview(data.thumbnail.url);
                // Reset thumbnail file since it's been uploaded
                setFormData(prev => ({ ...prev, thumbnail: null }));
            }
            if (formData.bannerImage && data.bannerImage && data.bannerImage.url) {
                setBannerPreview(data.bannerImage.url);
                setFormData(prev => ({ ...prev, bannerImage: null }));
            }
            
            // Refetch the internship data to get the latest thumbnail URL
            // This ensures the preview is updated with the correct URL format
            try {
                const { data: updatedData } = await api.get(`/api/v1/internships/admin-view/${id}`);
                if (updatedData.thumbnail && updatedData.thumbnail.url) {
                    setThumbnailPreview(updatedData.thumbnail.url);
                    // Update formData with the latest data
                    setFormData(prev => ({
                        ...prev,
                        thumbnail: null, // Reset file since it's uploaded
                    }));
                    // Reset the file input
                    if (thumbnailInputRef.current) {
                        thumbnailInputRef.current.value = '';
                    }
                }
                if (updatedData.bannerImage && updatedData.bannerImage.url) {
                    setBannerPreview(updatedData.bannerImage.url);
                    setFormData(prev => ({ ...prev, bannerImage: null }));
                    if (bannerInputRef.current) {
                        bannerInputRef.current.value = '';
                    }
                }
            } catch (refetchError) {
                console.error('Error refetching internship data:', refetchError);
            }
            
            // Optionally stay on the page to see the updated thumbnail
            // Or navigate away - uncomment the line below if you want to navigate
            // navigate('/admin/manage-internship');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred.';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) { 
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-sky-600" size={48} /></div>; 
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Star className="h-8 w-8 mr-3 text-indigo-500" />
                Edit Internship
            </h1>

            <form id="edit-internship-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center"><Star className="h-6 w-6 mr-2 text-indigo-500" />Program Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Internship Title" type="text" name="title" value={formData.title} onChange={handleChange} required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <InputField label="Tutor Name" type="text" name="tutor" value={formData.tutor} onChange={handleChange} required />
                        <InputField label="Duration" type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 4 weeks" required />
                        <InputField label="Price (INR)" type="number" name="price" value={formData.price} onChange={handleChange} required />
                        <InputField label="Discounted Price (INR)" type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} placeholder="e.g., 3999" />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                                <select 
                                    name="difficulty" 
                                    id="difficulty" 
                                    value={formData.difficulty} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <StarRating 
                                    rating={formData.rating || 0} 
                                    onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                                    interactive={true}
                                />
                            </div>
                        </div>
                        <div className="mt-6 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Detailed Description (For About Section)
                                <span className={`float-right ${getWordCount(formData.description || '') > 100 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                    {getWordCount(formData.description || '')} / 100 words
                                </span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className={`w-full px-3 py-2 bg-white border ${getWordCount(formData.description || '') >= 100 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm focus:outline-none`}
                                required
                            />
                            {getWordCount(formData.description || '') >= 100 && (
                                <p className="mt-1 text-sm text-red-500">Maximum word limit reached.</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Small Description (For Hero Banner)
                                <span className={`float-right ${getWordCount(formData.smallDescription || '') > 30 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                    {getWordCount(formData.smallDescription || '')} / 30 words
                                </span>
                            </label>
                            <textarea 
                                name="smallDescription" 
                                value={formData.smallDescription} 
                                onChange={handleChange} 
                                rows="2" 
                                className={`mt-1 block w-full px-3 py-2 bg-white border ${getWordCount(formData.smallDescription || '') >= 30 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm focus:outline-none`}
                            ></textarea>
                            {getWordCount(formData.smallDescription || '') >= 30 && (
                                <p className="mt-1 text-sm text-red-500">Maximum word limit reached.</p>
                            )}
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

                    {/* Media */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center"><Image className="h-6 w-6 mr-2 text-indigo-500" />Media</h2>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
                                <input
                                    ref={thumbnailInputRef}
                                    type="file"
                                    name="thumbnail"
                                    accept="image/*, image/svg+xml, .svg"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {thumbnailPreview && (
                                    <img src={getImageUrl(thumbnailPreview)} alt="Preview" className="mt-2 h-20 w-auto rounded" />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image (For Internship Details Page)</label>
                                <input
                                    ref={bannerInputRef}
                                    type="file"
                                    name="bannerImage"
                                    accept="image/*, image/svg+xml, .svg"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {bannerPreview && (
                                    <img src={getImageUrl(bannerPreview)} alt="Banner Preview" className="mt-2 h-20 w-auto rounded" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Curriculum */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b pb-2">
                            <h2 className="text-xl font-semibold flex items-center"><Video className="h-6 w-6 mr-2 text-indigo-500" />Internship Curriculum</h2>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPositionMode(!isPositionMode)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                        isPositionMode 
                                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                    }`}
                                >
                                    <Move size={20} />
                                    {isPositionMode ? 'Exit Position Mode' : 'Change Positions'}
                                </button>
                                {selectedLectures.size > 0 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={copySelectedLectures}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                        >
                                            <Copy size={20} />
                                            Copy Selected ({selectedLectures.size})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={deselectAllLectures}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                        >
                                            Deselect All
                                        </button>
                                    </>
                                )}
                                {selectedLectures.size === 0 && formData.lectures.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={selectAllLectures}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        Select All
                                    </button>
                                )}
                                {(copiedLecture || copiedMultipleLectures.length > 0) && (
                                    <button
                                        type="button"
                                        onClick={() => pasteLecture()}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        <Clipboard size={20} />
                                        {copiedMultipleLectures.length > 0 
                                            ? `Paste ${copiedMultipleLectures.length} Lecture(s)`
                                            : 'Paste Lecture'
                                        }
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={addLecture}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    <Plus size={20} />
                                    Add Lecture
                                </button>
                            </div>
                        </div>
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Tip:</strong> You can drag and drop lectures using the grip icon (⋮⋮) to reorder them, or use "Change Positions" mode for arrow buttons.
                            </p>
                        </div>
                        {isPositionMode && (
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                                <p className="text-sm text-orange-800">
                                    <strong>Position Mode Active:</strong> Use the up/down arrows next to each lecture to change their order.
                                </p>
                            </div>
                        )}
                        {(copiedLecture || copiedMultipleLectures.length > 0) && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-800">
                                    <strong>
                                        {copiedMultipleLectures.length > 0 
                                            ? `${copiedMultipleLectures.length} Lecture(s) Copied:`
                                            : 'Lecture Copied:'
                                        }
                                    </strong> Click "Paste Lecture" to add {copiedMultipleLectures.length > 0 ? 'them' : 'it'} to this internship, or use the paste button next to any lecture to insert {copiedMultipleLectures.length > 0 ? 'them' : 'it'} after that position.
                                </p>
                            </div>
                        )}
                        {selectedLectures.size > 0 && (
                            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                                <p className="text-sm text-purple-800">
                                    <strong>{selectedLectures.size} Lecture(s) Selected:</strong> Click "Copy Selected" to copy them, or use individual checkboxes to select/deselect.
                                </p>
                            </div>
                        )}

                        {formData.lectures.map((lecture, lecIndex) => {
                            const isExpanded = expandedLectures.has(lecIndex);
                            const isDragging = draggedIndex === lecIndex;
                            const isDragOver = dragOverIndex === lecIndex;
                            const isSelected = selectedLectures.has(lecIndex);
                            
                            return (
                            <div 
                                key={lecIndex} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, lecIndex)}
                                onDragOver={(e) => handleDragOver(e, lecIndex)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, lecIndex)}
                                onDragEnd={handleDragEnd}
                                className={`border rounded-lg p-4 mb-4 transition-all cursor-move ${
                                    isDragging ? 'opacity-50 bg-gray-200' : isSelected ? 'bg-blue-50 border-blue-400' : 'bg-gray-50'
                                } ${
                                    isDragOver ? 'border-blue-500 border-2 shadow-lg' : 'border-gray-300'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLectureSelection(lecIndex);
                                            }}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                            title={isSelected ? "Deselect lecture" : "Select lecture"}
                                        >
                                            {isSelected ? (
                                                <CheckSquare size={20} className="text-blue-600" />
                                            ) : (
                                                <Square size={20} />
                                            )}
                                        </button>
                                        <div 
                                            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                            title="Drag to reorder"
                                        >
                                            <GripVertical size={20} />
                                        </div>
                                        {isPositionMode && (
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveLectureUp(lecIndex)}
                                                    disabled={lecIndex === 0}
                                                    className={`p-1 rounded ${lecIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="Move up"
                                                >
                                                    <ArrowUp size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveLectureDown(lecIndex)}
                                                    disabled={lecIndex === formData.lectures.length - 1}
                                                    className={`p-1 rounded ${lecIndex === formData.lectures.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
                                                    title="Move down"
                                                >
                                                    <ArrowDown size={18} />
                                                </button>
                                            </div>
                                        )}
                                        <h3 className="text-lg font-medium">Lecture {lecIndex + 1}</h3>
                                        {!isExpanded && (
                                            <span className="text-sm text-gray-600 font-normal">
                                                {lecture.lectureTitle || 'Untitled Lecture'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2" onDragStart={(e) => e.stopPropagation()}>
                                        {!isExpanded ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleLectureEdit(lecIndex)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                                    title="Edit this lecture"
                                                >
                                                    <Edit2 size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(
                                                        `/user/internship-view/${id}?preview=true&lectureIndex=${lecIndex}`,
                                                        {
                                                            state: {
                                                                previewData: formData
                                                            }
                                                        }
                                                    )}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                                    title="Preview this lecture"
                                                >
                                                    <Eye size={16} />
                                                    Show
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => toggleLectureEdit(lecIndex)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                                title="Close editing"
                                            >
                                                <X size={16} />
                                                Close
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => copyLecture(lecIndex)}
                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded"
                                            title="Copy this lecture"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        {copiedLecture && (
                                            <button
                                                type="button"
                                                onClick={() => pasteLecture(lecIndex + 1)}
                                                className="text-green-600 hover:text-green-800 p-2 hover:bg-green-100 rounded"
                                                title="Paste after this lecture"
                                            >
                                                <Clipboard size={18} />
                                            </button>
                                        )}
                                        {formData.lectures.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLecture(lecIndex)}
                                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded"
                                                title="Delete lecture"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && (
                                <div onDragStart={(e) => e.stopPropagation()}>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                        <input
                                            type="text"
                                            name="lectureTitle"
                                            value={lecture.lectureTitle}
                                            onChange={(e) => handleLectureChange(lecIndex, e)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <input
                                            type="text"
                                            name="lectureDescription"
                                            value={lecture.lectureDescription}
                                            onChange={(e) => handleLectureChange(lecIndex, e)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Auto Content Parser */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Lecture Content (Auto-Parse)</label>
                                        {/* Formatting toolbar */}
                                        <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-gray-50 border border-gray-300 rounded-t-md">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    applyTextFormat(lecIndex, { type: 'bold' });
                                                }}
                                                className="px-3 py-1 border rounded text-sm hover:bg-gray-200 font-bold"
                                                title="Bold"
                                            >
                                                <strong>B</strong>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    applyTextFormat(lecIndex, { type: 'italic' });
                                                }}
                                                className="px-3 py-1 border rounded text-sm italic hover:bg-gray-200"
                                                title="Italic"
                                            >
                                                I
                                            </button>
                                            <label className="flex items-center gap-1 text-sm">
                                                Color
                                                <input
                                                    type="color"
                                                    defaultValue="#1f2937"
                                                    onChange={(e) => {
                                                        e.preventDefault();
                                                        applyTextFormat(lecIndex, { type: 'color', value: e.target.value });
                                                    }}
                                                    className="w-8 h-8 p-0 border rounded cursor-pointer"
                                                />
                                            </label>
                                            <select
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    if (e.target.value) {
                                                        applyTextFormat(lecIndex, { type: 'fontSize', value: e.target.value });
                                                        e.target.value = ''; // Reset dropdown
                                                    }
                                                }}
                                                defaultValue=""
                                                className="px-2 py-1 border rounded text-sm"
                                            >
                                                <option value="" disabled>Font size</option>
                                                {[14, 16, 18, 20, 24, 28].map(size => (
                                                    <option key={size} value={size}>{size}px</option>
                                                ))}
                                            </select>
                                            <select
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    if (e.target.value) {
                                                        applyTextFormat(lecIndex, { type: 'fontFamily', value: e.target.value });
                                                        e.target.value = ''; // Reset dropdown
                                                    }
                                                }}
                                                defaultValue=""
                                                className="px-2 py-1 border rounded text-sm"
                                            >
                                                <option value="" disabled>Font family</option>
                                                {['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Inter', 'Roboto'].map(font => (
                                                    <option key={font} value={font}>{font}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    insertCodeBlock(lecIndex);
                                                }}
                                                className="px-3 py-1 border rounded text-sm hover:bg-gray-200 font-mono"
                                                title="Add Code Block"
                                            >
                                                {'</>'}
                                            </button>
                                            
                                            {/* Parse Content - Category Dropdown and Button */}
                                            <div className="ml-auto flex items-center gap-2 border-l pl-2">
                                                <AutoContentParser
                                                    content={lecture.lectureContent}
                                                    selectedCategory={lectureCategories[lecIndex] || ''}
                                                    onCategoryChange={(value) => {
                                                        setLectureCategories(prev => ({ ...prev, [lecIndex]: value }));
                                                    }}
                                                    toolbarMode={true}
                                                    onParseClick={(sections) => {
                                                        console.log('🟠 EditInternship: Toolbar Parse Content clicked');
                                                        console.log('🟠 EditInternship: sections from toolbar:', sections);
                                                        // CRITICAL: Sync editor DOM to lectureContent before processing sections
                                                        // This ensures code block edits are captured in contentSections
                                                        // The sections were parsed from lectureContent, but we need to ensure
                                                        // lectureContent is up-to-date with the editor DOM before processing
                                                        syncEditorContentToLectureContent(lecIndex);
                                                        handleAutoContentSectionsGenerated(lecIndex, sections);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    
                                    {/* Preview Section - Above content editor */}
                                    <div className="mt-2">
                                        <AutoContentParser
                                            content={lecture.lectureContent}
                                            existingSections={lecture.contentSections || []}
                                            selectedCategory={lectureCategories[lecIndex] || ''}
                                            onCategoryChange={(value) => {
                                                setLectureCategories(prev => ({ ...prev, [lecIndex]: value }));
                                            }}
                                            previewOnly={true}
                                            onContentSectionsGenerated={(sections) => {
                                                handleAutoContentSectionsGenerated(lecIndex, sections);
                                            }}
                                        />
                                    </div>
                                    
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        onInput={(e) => {
                                            handleContentEditableChange(lecIndex, e);
                                            // Re-initialize delete buttons after content changes
                                            setTimeout(() => {
                                                initializeCodeBlockDeleteButtons(e.target, lecIndex);
                                            }, 0);
                                        }}
                                        onBlur={(e) => handleContentEditableChange(lecIndex, e)}
                                        onClick={(e) => handleContentEditableClick(lecIndex, e)}
                                        data-placeholder="Enter your content here (e.g., 1. What is Data Science? Data Science combines...). The system will automatically divide it into sections with predefined images."
                                        className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            wordWrap: 'break-word'
                                        }}
                                        ref={(el) => { 
                                            if (el) {
                                                lectureContentRefs.current[lecIndex] = el;
                                                
                                                // Get content to display - prefer lectureContent, but reconstruct from contentSections if needed
                                                let contentToDisplay = lecture.lectureContent || '';
                                                
                                                // If lectureContent is empty but contentSections exists, reconstruct the text
                                                if (!contentToDisplay && lecture.contentSections && Array.isArray(lecture.contentSections) && lecture.contentSections.length > 0) {
                                                    // Helper function to escape HTML
                                                    const escapeHtml = (text) => {
                                                        const div = document.createElement('div');
                                                        div.textContent = text;
                                                        return div.innerHTML;
                                                    };
                                                    
                                                    // Reconstruct text from contentSections, preserving code blocks
                                                    contentToDisplay = lecture.contentSections.map((section) => {
                                                        if (section.type === 'code') {
                                                            // For code sections, create the HTML structure with escaped content
                                                            const language = section.language || '';
                                                            const escapedContent = escapeHtml(section.content || '');
                                                            return `<div style="position: relative; display: inline-block; width: 100%; margin: 8px 0px;"><pre data-type="code" data-language="${escapeHtml(language)}" style="background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.5; margin: 0;">${escapedContent}</pre></div>`;
                                                        } else {
                                                            // For text sections, use the content as-is (may contain HTML from rich text editor)
                                                            return section.content || '';
                                                        }
                                                    }).join('\n\n');
                                                }
                                                
                                                // Always sync content when ref is set, regardless of initialization state
                                                // This ensures content is set even if data loads after initial render
                                                if (contentToDisplay && el.innerHTML !== contentToDisplay && document.activeElement !== el) {
                                                    el.innerHTML = contentToDisplay;
                                                    if (!el.hasAttribute('data-initialized')) {
                                                        el.setAttribute('data-initialized', 'true');
                                                    }
                                                    // Initialize delete buttons for existing code blocks
                                                    setTimeout(() => {
                                                        initializeCodeBlockDeleteButtons(el, lecIndex);
                                                    }, 0);
                                                } else if (!el.hasAttribute('data-initialized')) {
                                                    // Mark as initialized even if no content yet
                                                    el.setAttribute('data-initialized', 'true');
                                                }
                                            }
                                        }}
                                    />
                                    <style>{`
                                        [contenteditable][data-placeholder]:empty:before {
                                            content: attr(data-placeholder);
                                            color: #9ca3af;
                                            pointer-events: none;
                                        }
                                    `}</style>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Code Snippet</label>
                                    <textarea
                                        name="codeSnippet"
                                        value={lecture.codeSnippet}
                                        onChange={(e) => handleLectureChange(lecIndex, e)}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Optional code example"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Prompt</label>
                                    <textarea
                                        name="taskPrompt"
                                        value={lecture.taskPrompt}
                                        onChange={(e) => handleLectureChange(lecIndex, e)}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Task for students to complete"
                                    />
                                </div>

                                {/* MCQs */}
                                <div className="border-t pt-4">
                                    <h4 className="text-md font-medium mb-3">Quiz Questions</h4>
                                    {lecture.mcqs.map((mcq, mcqIndex) => (
                                        <div key={mcqIndex} className="border rounded p-3 mb-3 bg-white">
                                            <div className="mb-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Question {mcqIndex + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    name="question"
                                                    value={mcq.question}
                                                    onChange={(e) => handleMcqChange(lecIndex, mcqIndex, e)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {mcq.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${lecIndex}-${mcqIndex}`}
                                                            checked={mcq.correctAnswer === optIndex}
                                                            onChange={() => setCorrectAnswer(lecIndex, mcqIndex, optIndex)}
                                                            className="text-indigo-600"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => handleMcqOptionChange(lecIndex, mcqIndex, optIndex, e)}
                                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                                            placeholder={`Option ${optIndex + 1}`}
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                </div>
                                )}
                            </div>
                            );
                        })}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/manage-internship')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-2"
                        >
                            {submitting ? <Loader className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                            {submitting ? 'Updating...' : 'Update Internship'}
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

export default EditInternship;
