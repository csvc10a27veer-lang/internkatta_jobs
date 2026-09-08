import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, RefreshCw, Download, Edit3, X, Save, GripVertical } from 'lucide-react';
import api from '../utils/api';

const AutoContentParser = ({ content, onContentSectionsGenerated, existingSections = [], selectedCategory: externalCategory, onCategoryChange, toolbarMode = false, onParseClick, hideHeader = false, previewOnly = false }) => {
    console.log('🟣 AutoContentParser: Component initialized');
    console.log('🟣 AutoContentParser: content prop:', content);
    console.log('🟣 AutoContentParser: onContentSectionsGenerated prop:', onContentSectionsGenerated);
    console.log('🟣 AutoContentParser: existingSections prop:', existingSections);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [generatedSections, setGeneratedSections] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [internalCategory, setInternalCategory] = useState('');
    const [categories, setCategories] = useState([
        { value: '', label: 'Default (Content)' }
    ]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categoryImages, setCategoryImages] = useState([]); // Store images for selected category
    
    // Use external category if provided, otherwise use internal state
    const selectedCategory = externalCategory !== undefined ? externalCategory : internalCategory;
    const setSelectedCategory = onCategoryChange || setInternalCategory;
    
    // Fetch category folders from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await api.get('/api/admin/category-folders');
                if (response.data.success && response.data.categories) {
                    // Format categories for dropdown
                    const categoryOptions = [
                        { value: '', label: 'Default (Content)' },
                        ...response.data.categories.map(cat => ({
                            value: cat,
                            label: cat
                        }))
                    ];
                    setCategories(categoryOptions);
                }
            } catch (error) {
                console.error('Error fetching category folders:', error);
                // Keep default category on error
            } finally {
                setLoadingCategories(false);
            }
        };
        
        fetchCategories();
    }, []);
    
    // Fetch images for the selected category
    useEffect(() => {
        const fetchCategoryImages = async () => {
            if (!selectedCategory || selectedCategory.trim() === '') {
                setCategoryImages([]);
                return;
            }
            
            try {
                const response = await api.get(`/api/admin/category-images/${encodeURIComponent(selectedCategory)}`);
                if (response.data.success && response.data.images) {
                    console.log(`🟢 Fetched ${response.data.images.length} images for category: ${selectedCategory}`, response.data.images);
                    
                    // Normalize and prioritize WebP images, but keep PNG and JPEG as fallbacks
                    // Handle both old format (array of strings) and new format (array of objects)
                    const normalizedImages = response.data.images
                        .map((img) => {
                            // Extract path from object format or use string directly
                            const imgPath = typeof img === 'string' ? img : img.path || img;
                            // Replace trailing .jpg /.JPG with .jpeg to match filesystem
                            return imgPath.replace(/\.jpg$/i, '.jpeg');
                        })
                        .sort((a, b) => {
                            // Prioritize WebP images first, then PNG, then JPEG
                            const aIsWebP = a.toLowerCase().endsWith('.webp');
                            const bIsWebP = b.toLowerCase().endsWith('.webp');
                            const aIsPng = a.toLowerCase().endsWith('.png');
                            const bIsPng = b.toLowerCase().endsWith('.png');
                            
                            if (aIsWebP && !bIsWebP) return -1;
                            if (!aIsWebP && bIsWebP) return 1;
                            if (aIsPng && !bIsPng && !bIsWebP) return -1;
                            if (!aIsPng && bIsPng && !aIsWebP) return 1;
                            return 0;
                        })
                        // Remove duplicates: keep WebP if exists, otherwise keep PNG, otherwise keep JPEG
                        .filter((img, index, arr) => {
                            if (img.toLowerCase().endsWith('.webp')) return true;
                            const baseName = img.replace(/\.(jpeg|jpg|png|webp)$/i, '');
                            const hasWebP = arr.some(other => 
                                other.toLowerCase().replace(/\.(webp|jpeg|jpg|png)$/i, '') === baseName.toLowerCase() && 
                                other.toLowerCase().endsWith('.webp')
                            );
                            if (hasWebP) return false; // Remove if WebP version exists
                            
                            // Keep PNG even if JPEG exists (PNG is preferred over JPEG)
                            if (img.toLowerCase().endsWith('.png')) return true;
                            
                            // For JPEG, only keep if no WebP or PNG version exists
                            const hasPng = arr.some(other => 
                                other.toLowerCase().replace(/\.(webp|jpeg|jpg|png)$/i, '') === baseName.toLowerCase() && 
                                other.toLowerCase().endsWith('.png')
                            );
                            return !hasPng; // Keep JPEG only if no PNG version exists
                        });
                    
                    console.log(`🟢 Normalized category images for ${selectedCategory}:`, normalizedImages);
                    setCategoryImages(normalizedImages);
                } else {
                    console.warn(`⚠️ No images found for category: ${selectedCategory}`);
                    setCategoryImages([]);
                }
            } catch (error) {
                console.error(`Error fetching images for category ${selectedCategory}:`, error);
                setCategoryImages([]);
            }
        };
        
        fetchCategoryImages();
    }, [selectedCategory]);

    // When the category changes, refresh images in already-generated sections to match the new category.
    useEffect(() => {
        if (!generatedSections || generatedSections.length === 0) return;
        if (!selectedCategory && selectedCategory !== '') return; // no change

        // Re-enforce images using the same invariant logic
        setGeneratedSections(prevSections => {
            const refreshedSections = enforceImages(prevSections);
            console.log('🟢 Refreshed images for category change:', refreshedSections);
            return refreshedSections;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    // Sync generatedSections with existingSections when they change (for toolbar mode)
    useEffect(() => {
        if (existingSections && existingSections.length > 0) {
            // Convert existingSections to the format expected by generatedSections
            // Remove image property - enforceImages() will set it correctly
            const convertedSections = existingSections.map(section => ({
                content: section.content || '',
                type: section.type || 'text'
                // NO image property - enforceImages() will enforce invariants
            }));
            // Enforce images to guarantee invariants are met
            // This ensures every non-code section gets an image, only code sections get empty images
            const sectionsWithImages = enforceImages(convertedSections);
            setGeneratedSections(sectionsWithImages);
        }
        // SAFETY: Do NOT clear generatedSections when existingSections is empty.
        // Empty existingSections can occur due to:
        // - Transient state sync issues (e.g., code block deletion updates lectureContent but not contentSections)
        // - Component re-renders during DOM mutations
        // - Initial load states
        // Clearing generatedSections here would wipe user's parsed content when they delete a code block.
        // generatedSections should ONLY be cleared via explicit user actions (Regenerate button, etc.)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingSections?.length]);

    // Smart image selection based on content type
    // visualIndex: Only counts text sections (0 = first visible text section, 1 = second, etc.)
    // Helper function to detect math-only paragraphs
    // Math blocks are wrapped in $$ ... $$ OR $ ... $
    // After trimming, content matches ONLY math (no prose)
    const isMathOnly = (content) => {
        if (!content) return false;
        const trimmed = content.trim();
        return (
            (trimmed.startsWith('$$') && trimmed.endsWith('$$')) ||
            (trimmed.startsWith('$') && trimmed.endsWith('$'))
        );
    };

    const getImageForContent = (content, visualIndex) => {
        const contentLower = content.toLowerCase();
        
        console.log(`🟡 getImageForContent called for visualIndex ${visualIndex}:`, content.substring(0, 50) + '...');
        console.log(`🟡 Selected category:`, selectedCategory);
        
        // First visible text section (visualIndex 0) ALWAYS uses Welcome folder, regardless of category
        if (visualIndex === 0) {
            const welcomeImages = [
                '/assets/Welcome/panda.png',
                '/assets/Welcome/green.png',
                '/assets/Welcome/crab.png',
                '/assets/Welcome/bee.png',
                '/assets/Welcome/lady.png',
                '/assets/Welcome/robot.png'
            ];
            const selectedImage = welcomeImages[Math.floor(Math.random() * welcomeImages.length)];
            console.log(`🟢 VisualIndex ${visualIndex}: Using Welcome folder image:`, selectedImage);
            return selectedImage;
        }
        
        // If a category is selected, use ONLY that category's folder for remaining sections
        // This takes priority over quiz/thinking detection
        if (selectedCategory && selectedCategory.trim() !== '') {
            const hasApiImages = categoryImages && categoryImages.length > 0;
            if (hasApiImages) {
                // Use random selection instead of sequential modulo for variety across lectures
                const imageIndex = Math.floor(Math.random() * categoryImages.length);
                const selectedImage = categoryImages[imageIndex];
                console.log(`🟢 VisualIndex ${visualIndex}: Using category folder (${selectedCategory}) image (random):`, selectedImage);
                return selectedImage;
            }

            // Fallback: deterministic filenames within the chosen category folder
            // Try WebP first, then fallback to PNG, then JPEG
            console.warn(`⚠️ No images from API for category ${selectedCategory}, falling back to static names`);
            const fallbackImages = [
                `/assets/Categories/${selectedCategory}/1.webp`,
                `/assets/Categories/${selectedCategory}/2.webp`,
                `/assets/Categories/${selectedCategory}/3.webp`,
                `/assets/Categories/${selectedCategory}/4.webp`,
                `/assets/Categories/${selectedCategory}/5.webp`,
                `/assets/Categories/${selectedCategory}/1.png`,
                `/assets/Categories/${selectedCategory}/2.png`,
                `/assets/Categories/${selectedCategory}/3.png`,
                `/assets/Categories/${selectedCategory}/4.png`,
                `/assets/Categories/${selectedCategory}/5.png`,
                `/assets/Categories/${selectedCategory}/1.jpeg`,
                `/assets/Categories/${selectedCategory}/2.jpeg`,
                `/assets/Categories/${selectedCategory}/3.jpeg`,
                `/assets/Categories/${selectedCategory}/4.jpeg`,
                `/assets/Categories/${selectedCategory}/5.jpeg`
            ];
            // Use random selection instead of sequential modulo for variety across lectures
            const imageIndex = Math.floor(Math.random() * fallbackImages.length);
            const selectedImage = fallbackImages[imageIndex];
            console.log(`🟡 VisualIndex ${visualIndex}: Using fallback image for category (${selectedCategory}) (random):`, selectedImage);
            return selectedImage;
        }
        
        // No category selected - use default logic for remaining sections
        // Check for question mark (?) in the content - ONLY use thinking folder if ? is present
        if (contentLower.includes('?')) {
            const thinkingImages = [
                '/assets/thinking/thinking 1.png',
                '/assets/thinking/thinking 2.png',
                '/assets/thinking/thinking 3.png',
                '/assets/thinking/thinking 4.png',
                '/assets/thinking/thinking 5.png'
            ];
            const selectedImage = thinkingImages[Math.floor(Math.random() * thinkingImages.length)];
            console.log(`🟢 VisualIndex ${visualIndex}: Using thinking folder image:`, selectedImage);
            return selectedImage;
        }
        
        // Check for quiz/task content
        const quizKeywords = ['quiz', 'question', 'task', 'exercise', 'assignment', 'test', 'exam', 'mcq', 'multiple choice'];
        const hasQuiz = quizKeywords.some(keyword => contentLower.includes(keyword));
        if (hasQuiz) {
            const quizImages = [
                '/assets/Quiz/Quiz 1.png',
                '/assets/Quiz/Quiz 2.png',
                '/assets/Quiz/Quiz 3.png',
                '/assets/Quiz/Quiz 4.png',
                '/assets/Quiz/Quiz 5.png'
            ];
            const selectedImage = quizImages[Math.floor(Math.random() * quizImages.length)];
            console.log(`🟢 VisualIndex ${visualIndex}: Using quiz folder image:`, selectedImage);
            return selectedImage;
        }
        
        // Default to content folder if no category selected
        const contentImages = [
            '/assets/content/content 1.png',
            '/assets/content/content 2.png',
            '/assets/content/content 3.png',
            '/assets/content/content 4.png',
            '/assets/content/content 5.png'
        ];
        const selectedImage = contentImages[Math.floor(Math.random() * contentImages.length)];
        console.log(`🟢 VisualIndex ${visualIndex}: Using content folder image:`, selectedImage);
        
        // CRITICAL: Ensure we never return an empty string
        if (!selectedImage || selectedImage.trim() === '') {
            console.error(`🔴 CRITICAL: getImageForContent returned empty for visualIndex ${visualIndex}, using fallback`);
            return '/assets/content/content 1.png'; // Ultimate fallback
        }
        
        return selectedImage;
    };

    // Function to get a deterministic fallback image based on index
    const getFallbackImage = (index) => {
        const contentImages = [
            '/assets/content/content 1.png',
            '/assets/content/content 2.png',
            '/assets/content/content 3.png',
            '/assets/content/content 4.png',
            '/assets/content/content 5.png'
        ];
        return contentImages[index % contentImages.length];
    };

    // HARD INVARIANT ENFORCEMENT FUNCTION
    // Rules (NON-NEGOTIABLE):
    // 1. type === 'code' → image: '' (NO IMAGE)
    // 2. isMathOnly(content) → image: '' (NO IMAGE) - Math blocks wrapped in $$ or $
    // 3. ALL other sections → image: ALWAYS SET (NEVER EMPTY)
    //
    // Implementation:
    // - Iterate sequentially using visualIndex counter
    // - visualIndex increments ONLY for sections that ARE ALLOWED images (not code, not math-only)
    // - Assign image to EVERY allowed section using getImageForContent(content, visualIndex)
    // - Guarantee image is never empty for allowed sections
    // - Use '/assets/content/content 1.png' as ultimate fallback
    // - Final validation ensures no allowed sections have empty images
    const enforceImages = (sections) => {
        if (!sections || sections.length === 0) {
            return sections;
        }

        let visualIndex = 0; // Only increments for sections that ARE ALLOWED images

        const enforcedSections = sections.map((section) => {
            // RULE 1: Code sections NEVER have images
            if (section.type === 'code') {
                return {
                    ...section,
                    image: ''
                };
            }

            // RULE 2: Math-only sections NEVER have images
            if (isMathOnly(section.content)) {
                return {
                    ...section,
                    image: ''
                };
            }

            // RULE 3: ALL other sections MUST ALWAYS have images
            // visualIndex increments ONLY for sections that ARE ALLOWED images
            let image = '';
            
            try {
                // Get image using visualIndex (only allowed sections increment this)
                // CRITICAL: getImageForContent() is NEVER called for code or math-only blocks
                image = getImageForContent(section.content, visualIndex);
                
                // Increment visualIndex for next allowed section
                visualIndex++;
                
                // CRITICAL: Ensure image is never empty
                if (!image || image.trim() === '') {
                    console.error(`🔴 CRITICAL: getImageForContent returned empty for visualIndex ${visualIndex - 1}, using ultimate fallback`);
                    image = '/assets/content/content 1.png';
                }
            } catch (error) {
                console.error(`🔴 Error in enforceImages for section at visualIndex ${visualIndex}:`, error);
                image = '/assets/content/content 1.png';
                visualIndex++;
            }

            // Normalize deprecated 'text-only' to 'text' (backward compatibility)
            const normalizedType = section.type === 'text-only' ? 'text' : (section.type || 'text');

            return {
                ...section,
                type: normalizedType,
                image: image
            };
        });

        // Final validation: verify invariants
        const validatedSections = enforcedSections.map((section, index) => {
            // Code sections must have empty image
            if (section.type === 'code') {
                if (section.image && section.image.trim() !== '') {
                    console.error(`🔴 INVARIANT VIOLATION: Code section at index ${index} has non-empty image!`);
                    return { ...section, image: '' };
                }
                return section;
            }
            
            // Math-only sections must have empty image
            if (isMathOnly(section.content)) {
                if (section.image && section.image.trim() !== '') {
                    console.error(`🔴 INVARIANT VIOLATION: Math-only section at index ${index} has non-empty image!`);
                    return { ...section, image: '' };
                }
                return section;
            }
            
            // ALL other sections (text paragraphs) must have non-empty image
            if (!section.image || section.image.trim() === '') {
                console.error(`🔴 INVARIANT VIOLATION: Text paragraph at index ${index} (type: ${section.type}) has empty image!`);
                
                // Calculate visualIndex for deterministic fallback
                // Count only sections that ARE ALLOWED images (not code, not math-only)
                let visualIdx = 0;
                for (let i = 0; i < index; i++) {
                    if (enforcedSections[i].type !== 'code' && !isMathOnly(enforcedSections[i].content)) {
                        visualIdx++;
                    }
                }
                
                // Get deterministic fallback
                let fallbackImage = '/assets/content/content 1.png';
                try {
                    const tempImage = getImageForContent(section.content, visualIdx);
                    if (tempImage && tempImage.trim() !== '') {
                        fallbackImage = tempImage;
                    }
                } catch (error) {
                    console.error(`🔴 Error getting fallback image:`, error);
                }
                
                return {
                    ...section,
                    image: fallbackImage
                };
            }
            
            return section;
        });

        return validatedSections;
    };

    // Function to sanitize content by removing editor-only UI elements
    // Editor UI (wrapper divs, language inputs, delete buttons) must NEVER enter the parsing pipeline
    const sanitizeContentFromEditorUI = (htmlContent) => {
        try {
            // Parse HTML into a DOM document
            const parser = new DOMParser();
            const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
            const container = doc.body.firstChild;
            
            if (!container) return htmlContent;
            
            // Remove editor-only UI elements
            // 1. Remove language input elements
            const languageInputs = container.querySelectorAll('input[data-code-block-language="true"]');
            languageInputs.forEach(input => input.remove());
            
            // 2. Remove delete button elements
            const deleteButtons = container.querySelectorAll('button[data-code-block-delete="true"]');
            deleteButtons.forEach(button => button.remove());
            
            // 3. Handle wrapper divs that contain code block UI
            // Find all divs with position: relative (code block wrappers)
            // Collect them first to avoid modifying DOM while iterating
            const wrapperDivs = [];
            const allDivs = container.querySelectorAll('div');
            allDivs.forEach(div => {
                const style = div.getAttribute('style') || '';
                // Check if this is a code block wrapper (has position: relative and contains code block)
                if ((style.includes('position: relative') || style.includes('position:relative')) && 
                    div.querySelector('pre[data-type="code"]')) {
                    wrapperDivs.push(div);
                }
            });
            
            // Replace wrapper divs while preserving ALL meaningful content (text nodes, pre elements)
            // Process in reverse order to avoid index issues when replacing
            wrapperDivs.reverse().forEach(div => {
                const codeBlock = div.querySelector('pre[data-type="code"]');
                if (codeBlock) {
                    const parent = div.parentNode;
                    if (parent) {
                        // Collect all nodes to preserve from the wrapper div
                        // Keep: text nodes (if not empty), pre element, other elements (except UI elements)
                        const nodesToPreserve = [];
                        const childNodes = Array.from(div.childNodes);
                        
                        childNodes.forEach(node => {
                            // Keep text nodes if they contain non-whitespace content
                            if (node.nodeType === Node.TEXT_NODE) {
                                const textContent = node.textContent || '';
                                if (textContent.trim() !== '') {
                                    nodesToPreserve.push(node.cloneNode(true));
                                }
                            }
                            // Keep the pre code block
                            else if (node.nodeType === Node.ELEMENT_NODE && 
                                     node.tagName === 'PRE' && 
                                     node.getAttribute('data-type') === 'code') {
                                nodesToPreserve.push(node.cloneNode(true));
                            }
                            // Keep other elements (but skip UI elements - already removed above)
                            else if (node.nodeType === Node.ELEMENT_NODE) {
                                const tagName = node.tagName;
                                const isUIElement = 
                                    (tagName === 'INPUT' && node.getAttribute('data-code-block-language') === 'true') ||
                                    (tagName === 'BUTTON' && node.getAttribute('data-code-block-delete') === 'true');
                                
                                if (!isUIElement) {
                                    nodesToPreserve.push(node.cloneNode(true));
                                }
                            }
                        });
                        
                        // Replace wrapper div with preserved nodes
                        if (nodesToPreserve.length === 0) {
                            // No content to preserve, just remove the wrapper
                            div.remove();
                        } else if (nodesToPreserve.length === 1) {
                            // Single node, use replaceChild
                            parent.replaceChild(nodesToPreserve[0], div);
                        } else {
                            // Multiple nodes, insert them before the wrapper, then remove wrapper
                            const referenceNode = div.nextSibling;
                            nodesToPreserve.forEach(node => {
                                parent.insertBefore(node, referenceNode);
                            });
                            div.remove();
                        }
                    }
                }
            });
            
            // Serialize cleaned DOM back to HTML
            const sanitized = container.innerHTML;
            return sanitized;
        } catch (error) {
            console.warn('Failed to sanitize content from editor UI, using original:', error);
            // Fallback: use regex to remove UI elements if DOM parsing fails
            return htmlContent
                .replace(/<input[^>]*data-code-block-language=["']true["'][^>]*>[\s\S]*?<\/input>/gi, '')
                .replace(/<input[^>]*data-code-block-language=["']true["'][^>]*\/?>/gi, '')
                .replace(/<button[^>]*data-code-block-delete=["']true["'][^>]*>[\s\S]*?<\/button>/gi, '')
                .replace(/<div[^>]*style=["'][^"]*position\s*:\s*relative[^"]*["'][^>]*>[\s\S]*?<pre\s+data-type=["']code["'][^>]*>([\s\S]*?)<\/pre>[\s\S]*?<\/div>/gi, '<pre data-type="code">$1</pre>');
        }
    };

    // Function to normalize paragraph content
    // Strips ALL HTML tags, decodes HTML entities, trims whitespace
    const normalizeContent = (htmlContent) => {
        if (!htmlContent) return '';
        
        // First, use regex to strip HTML tags and basic formatting
        let normalized = htmlContent
            .replace(/<br\s*\/?>/gi, ' ') // Replace <br> with space
            .replace(/<\/?div[^>]*>/gi, ' ') // Replace <div> tags with space
            .replace(/<\/?p[^>]*>/gi, ' ') // Replace <p> tags with space
            .replace(/<[^>]+>/g, '') // Strip all remaining HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/')
            .replace(/&[a-z]+;/gi, ' ') // Replace other named entities with space
            .replace(/&#\d+;/g, ' ') // Replace numeric entities with space
            .replace(/\s+/g, ' ') // Collapse multiple whitespace to single space
            .trim();
        
        // Try DOM-based decoding if available (more accurate)
        if (typeof document !== 'undefined') {
            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = normalized;
                normalized = tempDiv.textContent || tempDiv.innerText || normalized;
            } catch (error) {
                // Fallback to regex result
            }
        }
        
        return normalized;
    };

    // Function to validate if content is substantial enough to create a section
    // Returns true if normalized content has at least 3 characters
    const isValidContent = (content) => {
        const normalized = normalizeContent(content);
        return normalized.length >= 3;
    };

    // Function to parse content and create sections (WITHOUT images)
    // 
    // HARD INVARIANTS ENFORCED AT PARSE TIME:
    // 1. EVERY non-code section MUST have an image (enforced by enforceImages + final validation)
    // 2. ONLY sections with type === 'code' may have image === ""
    // 3. $...$ blocks are NORMAL text sections (type: 'text') and MUST have images
    // 4. No sections created from empty/whitespace/formatting-only HTML
    // 5. Discarded fragments (< 3 chars) are merged into nearest valid text section
    //
    // PARSING FLOW:
    // 1. Sanitize content (remove editor UI elements) - preserves <p> structure
    // 2. Extract code blocks (replace with placeholders)
    // 3. Split by $...$ blocks and code placeholders
    // 4. For each block:
    //    a. extractParagraphs() - extract <p> tags FIRST (preserves boundaries)
    //    b. Each <p> becomes exactly ONE section
    //    c. normalizeContent() - strips HTML, decodes entities, trims (AFTER extraction)
    //    d. isValidContent() - validates >= 3 characters
    //    e. Create section only if valid, otherwise merge fragment
    // 5. enforceImages() - assigns images to all sections
    // 6. Final validation pass - ensures no non-code sections have empty images
    //
    // CRITICAL: Paragraph extraction happens BEFORE normalization to preserve boundaries
    //
    // RESULT: Sections with { content, type } - NO images assigned during parsing
    const parseContentIntoSections = (content) => {
        if (!content || content.trim() === '') {
            return [];
        }

        // CRITICAL: Sanitize content to remove editor-only UI elements BEFORE parsing
        // Editor UI (wrapper divs, language inputs, delete buttons) must NEVER be treated as content
        const sanitizedFromUI = sanitizeContentFromEditorUI(content);

        // Strip leading "Part X:" labels if present to avoid duplication on re-parse
        const sanitizedContent = sanitizedFromUI.replace(/^Part\s*\d+\s*:\s*/gim, '').trim();

        // First, extract code blocks (<pre data-type="code">...</pre>)
        // This regex matches <pre data-type="code" ...>...</pre> including nested content
        const codeBlockRegex = /<pre\s+data-type=["']code["'][^>]*>([\s\S]*?)<\/pre>/gi;
        const codeBlocks = [];
        let codeBlockIndex = 0;
        let match;
        const codeBlockMap = new Map();
        
        // Extract all code blocks and replace with placeholders
        let processedContent = sanitizedContent;
        while ((match = codeBlockRegex.exec(sanitizedContent)) !== null) {
            const fullMatch = match[0];
            const codeContent = match[1].trim();
            const languageMatch = match[0].match(/data-language=["']([^"']+)["']/i);
            const language = languageMatch && languageMatch[1] ? languageMatch[1].trim() : null;
            const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
            codeBlockMap.set(placeholder, { content: codeContent, language: language || null });
            processedContent = processedContent.replace(fullMatch, placeholder);
            codeBlockIndex++;
        }

        // CRITICAL: Extract paragraphs FIRST using <p> tags BEFORE normalization
        // This preserves paragraph boundaries that would be lost if we normalize first
        // Each <p>...</p> becomes exactly ONE section
        // Empty <p>, <p>&nbsp;</p>, or whitespace-only paragraphs are ignored
        const extractParagraphs = (htmlContent) => {
            const paragraphs = [];
            
            if (!htmlContent || htmlContent.trim() === '') {
                return paragraphs;
            }
            
            try {
                // Use DOM parsing to extract <p> tags
                const parser = new DOMParser();
                const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
                const container = doc.body.firstChild;
                
                if (container) {
                    // Extract all <p> elements in order
                    const pElements = container.querySelectorAll('p');
                    
                    if (pElements.length > 0) {
                        // Each <p> becomes exactly one paragraph
                        pElements.forEach(p => {
                            const pContent = p.innerHTML.trim();
                            // Only include non-empty paragraphs
                            // Ignore: empty <p></p>, <p>&nbsp;</p>, or whitespace-only
                            const normalizedCheck = pContent.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
                            if (normalizedCheck && normalizedCheck.length > 0) {
                                paragraphs.push(pContent); // Keep original HTML content
                            }
                        });
                    }
                }
                
                // If DOM parsing found paragraphs, return them
                if (paragraphs.length > 0) {
                    return paragraphs;
                }
            } catch (error) {
                console.warn('DOM parsing failed, using regex fallback:', error);
            }
            
            // Fallback: use regex to extract <p> tags if DOM parsing didn't find any
            const pTagRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
            let pMatch;
            const foundParagraphs = [];
            while ((pMatch = pTagRegex.exec(htmlContent)) !== null) {
                const pContent = pMatch[1].trim();
                const normalizedCheck = pContent.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
                if (normalizedCheck && normalizedCheck.length > 0) {
                    foundParagraphs.push(pContent);
                }
            }
            
            return foundParagraphs;
        };

        // Split out custom blocks delimited by $...$ and code block placeholders
        // Process in order: code blocks, $...$ blocks, then paragraphs
        const sections = [];
        let pendingFragment = ''; // Accumulate discarded fragments to merge into next valid section

        // Helper to push a section (ONLY content and type - NO images)
        // Images are assigned later by enforceImages()
        // Normalizes and validates content AFTER paragraph extraction
        const pushSection = (paragraphContent, isDollarBlock = false, isCode = false, codeLanguage = 'auto') => {
            if (!paragraphContent) return null;

            // Check if this is a code block placeholder
            if (isCode || codeBlockMap.has(paragraphContent.trim())) {
                const codeData = codeBlockMap.get(paragraphContent.trim());
                const codeLanguage = codeData ? codeData.language : null;
                const sectionData = {
                    content: codeData ? codeData.content : paragraphContent,
                    type: 'code'
                    // NO image property - will be set to '' by enforceImages()
                };
                // Only include language if it's set
                if (codeLanguage) {
                    sectionData.language = codeLanguage;
                }
                sections.push(sectionData);
                return sectionData;
            }

            // For text sections: NORMALIZE AFTER extraction, then validate
            // CRITICAL: normalizeContent() runs AFTER paragraph boundaries are preserved
            const normalized = normalizeContent(paragraphContent);
            
            // CRITICAL: Validate normalized content - reject < 3 chars / whitespace / HTML-only fragments
            // Discard if normalized content is too short (< 3 characters)
            if (normalized.length < 3) {
                // Accumulate fragment to merge into the nearest valid text section
                if (normalized.length > 0) {
                    pendingFragment += (pendingFragment ? ' ' : '') + normalized;
                }
                return null; // Don't create section - fragment will be merged later
            }

            // Merge any pending fragments into this valid section
            const finalContent = pendingFragment 
                ? (pendingFragment + ' ' + paragraphContent).trim()
                : paragraphContent;
            
            // Clear pending fragment
            pendingFragment = '';

            // $...$ blocks are now treated as normal text sections (they get images)
            const sectionData = {
                content: finalContent,
                type: 'text' // $...$ blocks are now 'text', not 'text-only'
                // NO image property - will be set by enforceImages()
            };
            
            sections.push(sectionData);
            return sectionData;
        };

        // Process content: extract paragraphs FIRST, then process each one
        // Split by $...$ blocks and code block placeholders first
        // Split by either $...$ blocks OR code block placeholders
        const parts = processedContent.split(/(\$[\s\S]*?\$|__CODE_BLOCK_\d+__)/).filter(p => p && p.trim() !== '');
        
        parts.forEach(part => {
            const trimmed = part.trim();
            if (!trimmed) return;
            
            // Check for code block placeholder
            if (codeBlockMap.has(trimmed)) {
                pushSection(trimmed, false, true);
                return;
            }
            
            // Check for $...$ block
            if (trimmed.startsWith('$') && trimmed.endsWith('$')) {
                const inner = trimmed.slice(1, -1).trim();
                pushSection(inner, true);
                return;
            }
            
            // Regular content - extract paragraphs using <p> tags FIRST
            const paragraphs = extractParagraphs(trimmed);
            
            if (paragraphs.length > 0) {
                // Each <p> becomes exactly ONE section
                paragraphs.forEach(pContent => {
                    // Normalize and validate AFTER extraction
                    const normalized = normalizeContent(pContent);
                    if (normalized.length >= 3) {
                        pushSection(pContent, false); // Use original content, not normalized
                    } else if (normalized.length > 0) {
                        // Accumulate short fragments
                        pendingFragment += (pendingFragment ? ' ' : '') + normalized;
                    }
                });
            } else {
                // No <p> tags found - check for double line breaks as fallback
                const doubleLineBreakParagraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim() !== '');
                if (doubleLineBreakParagraphs.length > 1) {
                    // Each double-line-break becomes one section
                    doubleLineBreakParagraphs.forEach(pContent => {
                        const normalized = normalizeContent(pContent);
                        if (normalized.length >= 3) {
                            pushSection(pContent, false);
                        } else if (normalized.length > 0) {
                            pendingFragment += (pendingFragment ? ' ' : '') + normalized;
                        }
                    });
                } else if (trimmed.trim() !== '') {
                    // Single block - validate and create one section (no merging)
                    const normalized = normalizeContent(trimmed);
                    if (normalized.length >= 3) {
                        pushSection(trimmed, false);
                    } else if (normalized.length > 0) {
                        pendingFragment += (pendingFragment ? ' ' : '') + normalized;
                    }
                }
            }
        });
        
        // Merge any remaining pending fragment into the last section if it exists
        if (pendingFragment && sections.length > 0) {
            const lastSection = sections[sections.length - 1];
            if (lastSection.type === 'text') {
                lastSection.content = (lastSection.content + ' ' + pendingFragment).trim();
            }
        }
        
        // REMOVED: Fallback that creates one section from all content
        // This was causing multiple paragraphs to be merged into one section
        // If no sections are created, return empty array (content was invalid/empty)

        console.log('🔴 Parsed sections (before image enforcement):', sections);
        console.log('🔴 Number of sections parsed:', sections.length);
        
        // ENFORCE IMAGES: Single post-processing function that enforces hard invariants
        // Called exactly once after parsing and before returning
        const sectionsWithImages = enforceImages(sections);
        
        // FINAL VALIDATION PASS (MANDATORY SAFETY NET)
        // This is a CRITICAL safety net - no silent failures allowed
        // If any text paragraph has empty image, force deterministic fallback
        const finalSections = sectionsWithImages.map((section, index) => {
            // Code sections are allowed to have empty images (invariant)
            if (section.type === 'code') {
                return section;
            }
            
            // Math-only sections are allowed to have empty images (invariant)
            if (isMathOnly(section.content)) {
                return section;
            }
            
            // ALL text paragraphs MUST have non-empty images (invariant)
            // If empty, this is a CRITICAL error - force fallback immediately
            if (!section.image || section.image.trim() === '') {
                console.error(`🔴 CRITICAL: FINAL VALIDATION FAILED - Text paragraph at index ${index} (type: ${section.type}) has empty image! Forcing deterministic fallback.`);
                
                // Calculate visualIndex for this section to get deterministic fallback
                // Count only sections that ARE ALLOWED images (not code, not math-only)
                let visualIndex = 0;
                for (let i = 0; i < index; i++) {
                    if (sectionsWithImages[i].type !== 'code' && !isMathOnly(sectionsWithImages[i].content)) {
                        visualIndex++;
                    }
                }
                
                // Get deterministic fallback image using visualIndex
                let fallbackImage = '/assets/content/content 1.png';
                try {
                    const tempImage = getImageForContent(section.content, visualIndex);
                    if (tempImage && tempImage.trim() !== '') {
                        fallbackImage = tempImage;
                    }
                } catch (error) {
                    console.error(`🔴 Error getting fallback image in final validation:`, error);
                    // Ultimate fallback already set above
                }
                
                return {
                    ...section,
                    image: fallbackImage
                };
            }
            
            return section;
        });
        
        console.log('🔴 Sections with images enforced (final):', finalSections);
        finalSections.forEach((section, index) => {
            console.log(`🔴 Section ${index} (type: ${section.type}) image:`, section.image);
        });

        return finalSections;
    };

    const handleParseContent = () => {
        setIsProcessing(true);
        
        // Simulate processing time
        setTimeout(() => {
            const sections = parseContentIntoSections(content);
            setGeneratedSections(sections);
            setIsProcessing(false);
            
            // If toolbar mode, call the external parse handler
            if (toolbarMode && onParseClick) {
                onParseClick(sections);
            }
        }, 1000);
    };

    const handleApplySections = async () => {
        console.log('🟡 handleApplySections function called');
        console.log('🟡 generatedSections.length:', generatedSections.length);
        console.log('🟡 generatedSections:', generatedSections);
        console.log('🟡 onContentSectionsGenerated function:', onContentSectionsGenerated);
        
        if (generatedSections.length > 0) {
            console.log('🟢 Sections found, proceeding with application...');
            
            // Detailed logging for generated sections
            console.log('✅ AutoContentParser: Generated sections with images!');
            console.log('📊 AutoContentParser: Number of sections generated:', generatedSections.length);
            generatedSections.forEach((section, index) => {
                console.log(`📋 AutoContentParser: Section ${index} generated:`, {
                    content: section.content?.substring(0, 50) + '...',
                    image: section.image,
                    alignment: section.alignment
                });
            });
            
            setIsApplying(true);
            console.log('🟢 Set isApplying to true');
            console.log('🟢 Calling onContentSectionsGenerated with sections:', generatedSections);
            
            try {
                console.log('🟢 About to call onContentSectionsGenerated...');
                const result = await onContentSectionsGenerated(generatedSections);
                console.log('🟢 onContentSectionsGenerated completed, result:', result);
                
                setPreviewMode(false);
                setEditMode(false);
                setEditingSection(null);
                console.log('🟢 UI state reset completed');
                console.log('🟢 Sections applied successfully!');
            } catch (error) {
                console.error('🔴 Error applying sections:', error);
                console.error('🔴 Error stack:', error.stack);
            } finally {
                setIsApplying(false);
                console.log('🟢 Set isApplying to false');
            }
        } else {
            console.log('🔴 No sections to apply - generatedSections is empty');
        }
    };

    const handleRegenerate = () => {
        setGeneratedSections([]);
        setPreviewMode(false);
        setEditMode(false);
        setEditingSection(null);
    };

    const handleEditSection = (sectionIndex) => {
        setEditingSection(sectionIndex);
        setEditMode(true);
    };

    const handleSaveSection = (sectionIndex, updatedContent, updatedImage) => {
        const newSections = [...generatedSections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            content: updatedContent,
            image: updatedImage
        };
        setGeneratedSections(newSections);
        setEditMode(false);
        setEditingSection(null);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditingSection(null);
    };

    // Drag and drop handlers for reordering sections
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (dropIndex) => {
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const newSections = [...generatedSections];
        const draggedSection = newSections[draggedIndex];
        
        // Remove the dragged section from its original position
        newSections.splice(draggedIndex, 1);
        
        // Calculate the new index after removal
        const newDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        
        // Insert it at the new position
        newSections.splice(newDropIndex, 0, draggedSection);
        
        setGeneratedSections(newSections);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // Remove image from a section (only allowed for code sections and math-only blocks)
    // For all other sections (text paragraphs), images are re-enforced to maintain invariant
    const handleRemoveImage = (sectionIndex) => {
        const newSections = [...generatedSections];
        const section = newSections[sectionIndex];
        
        // Only allow removal for code sections and math-only blocks (they must have empty images)
        if (section.type === 'code' || isMathOnly(section.content)) {
            newSections[sectionIndex] = {
                ...section,
                image: ''
            };
        } else {
            // For text paragraphs, re-enforce image to maintain invariant
            console.warn(`⚠️ Cannot remove image from text paragraph (type: ${section.type}), re-enforcing image`);
        }
        
        // Re-enforce images to ensure invariants are maintained
        const enforcedSections = enforceImages(newSections);
        setGeneratedSections(enforcedSections);
    };

    // Toolbar elements (dropdown and button) - can be rendered separately
    const toolbarElements = (
        <>
            {/* Category Dropdown */}
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={toolbarMode ? "px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" : "px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"}
            >
                {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                        {category.label}
                    </option>
                ))}
            </select>
            <button
                type="button"
                onClick={handleParseContent}
                disabled={!content || isProcessing}
                className={toolbarMode ? "flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" : "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"}
            >
                {isProcessing ? (
                    <>
                        <RefreshCw className={toolbarMode ? "h-3 w-3 animate-spin" : "h-4 w-4 animate-spin"} />
                        Processing...
                    </>
                ) : (
                    <>
                        <Sparkles className={toolbarMode ? "h-3 w-3" : "h-4 w-4"} />
                        Parse Content
                    </>
                )}
            </button>
        </>
    );

    // Render toolbar version (just dropdown and button)
    if (toolbarMode) {
        return toolbarElements;
    }

    // Render preview section only
    if (previewOnly) {
        if (generatedSections.length === 0) {
            return null; // Don't render anything if no sections generated
        }
        
        return (
            <div className="space-y-4">
                {/* Preview Section */}
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Generated Sections Preview</h4>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPreviewMode(!previewMode)}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Eye className="h-4 w-4" />
                            {previewMode ? 'Hide Preview' : 'Show Preview'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditMode(!editMode)}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                            <Edit3 className="h-4 w-4" />
                            {editMode ? 'Exit Edit' : 'Edit Parse Content'}
                        </button>
                        <button
                            type="button"
                            onClick={handleRegenerate}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Regenerate
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                console.log('🔴 BUTTON CLICKED - Apply Sections button was clicked!');
                                console.log('🔴 Current generatedSections:', generatedSections);
                                console.log('🔴 generatedSections.length:', generatedSections.length);
                                console.log('🔴 isApplying:', isApplying);
                                handleApplySections();
                            }}
                            disabled={isApplying || generatedSections.length === 0}
                            className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {isApplying ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Apply Sections
                                </>
                            )}
                        </button>
                    </div>
                </div>

                    {/* Preview Content */}
                {previewMode && (
                    <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
                        {generatedSections.map((section, index) => {
                            // HARD VALIDATION LOGGING (MANDATORY)
                            // This error must NEVER appear after the fix
                            if (section.type === 'text' && !isMathOnly(section.content) && (!section.image || section.image.trim() === '')) {
                                console.error('❌ IMAGE MISSING FOR TEXT PARAGRAPH', section);
                            }
                            return (
                                <div
                                    key={index}
                                    draggable={editMode}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={() => handleDrop(index)}
                                    onDragEnd={handleDragEnd}
                                    className={`
                                        ${editMode ? 'cursor-move border-2 border-dashed border-transparent hover:border-purple-300 rounded-lg p-2' : ''}
                                        ${draggedIndex === index ? 'opacity-50 border-purple-500' : ''}
                                        ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-400 bg-blue-50' : ''}
                                        transition-all
                                    `}
                                >
                                    {editMode && (
                                        <div className="flex items-center gap-2 mb-2 text-purple-600">
                                            <GripVertical className="h-4 w-4" />
                                            <span className="text-xs font-medium">Drag to reorder</span>
                                        </div>
                                    )}
                                    <EditableSection
                                        section={section}
                                        index={index}
                                        editMode={editMode}
                                        isEditing={editingSection === index}
                                        selectedCategory={selectedCategory}
                                        categoryImagesFromApi={categoryImages}
                                        onEdit={() => handleEditSection(index)}
                                        onSave={(updatedContent, updatedImage) => handleSaveSection(index, updatedContent, updatedImage)}
                                        onCancel={handleCancelEdit}
                                        onRemoveImage={() => handleRemoveImage(index)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Section Summary */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <strong>Generated {generatedSections.length} sections</strong> with alternating layout. 
                        Click "Apply Sections" to use this layout in your internship.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header - only show if not in toolbar mode and header not hidden */}
            {!toolbarMode && !hideHeader && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Auto Content Parser</h3>
                            <p className="text-sm text-gray-600">Automatically divide content into sections with predefined images</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {toolbarElements}
                    </div>
                </div>
            )}

            {/* Category Dropdown and Parse Button - Always visible when header is hidden */}
            {!toolbarMode && hideHeader && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Category:</label>
                    {toolbarElements}
                </div>
            )}

            {/* Preview Section */}
            {generatedSections.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Generated Sections Preview</h4>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPreviewMode(!previewMode)}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Eye className="h-4 w-4" />
                                {previewMode ? 'Hide Preview' : 'Show Preview'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditMode(!editMode)}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                                <Edit3 className="h-4 w-4" />
                                {editMode ? 'Exit Edit' : 'Edit Parse Content'}
                            </button>
                            <button
                                type="button"
                                onClick={handleRegenerate}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Regenerate
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    console.log('🔴 BUTTON CLICKED - Apply Sections button was clicked!');
                                    console.log('🔴 Current generatedSections:', generatedSections);
                                    console.log('🔴 generatedSections.length:', generatedSections.length);
                                    console.log('🔴 isApplying:', isApplying);
                                    handleApplySections();
                                }}
                                disabled={isApplying || generatedSections.length === 0}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                {isApplying ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Apply Sections
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Preview Content */}
                    {previewMode && (
                        <div className="space-y-6 p-4 bg-gray-50 rounded-lg border">
                            {generatedSections.map((section, index) => {
                                // HARD VALIDATION LOGGING (MANDATORY)
                                // This error must NEVER appear after the fix
                                if (section.type === 'text' && !isMathOnly(section.content) && (!section.image || section.image.trim() === '')) {
                                    console.error('❌ IMAGE MISSING FOR TEXT PARAGRAPH', section);
                                }
                                return (
                                <div
                                    key={index}
                                    draggable={editMode}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={() => handleDrop(index)}
                                    onDragEnd={handleDragEnd}
                                    className={`
                                        ${editMode ? 'cursor-move border-2 border-dashed border-transparent hover:border-purple-300 rounded-lg p-2' : ''}
                                        ${draggedIndex === index ? 'opacity-50 border-purple-500' : ''}
                                        ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-400 bg-blue-50' : ''}
                                        transition-all
                                    `}
                                >
                                    {editMode && (
                                        <div className="flex items-center gap-2 mb-2 text-purple-600">
                                            <GripVertical className="h-4 w-4" />
                                            <span className="text-xs font-medium">Drag to reorder</span>
                                        </div>
                                    )}
                                    <EditableSection
                                        section={section}
                                        index={index}
                                        editMode={editMode}
                                        isEditing={editingSection === index}
                                        selectedCategory={selectedCategory}
                                        categoryImagesFromApi={categoryImages}
                                        onEdit={() => handleEditSection(index)}
                                        onSave={(updatedContent, updatedImage) => handleSaveSection(index, updatedContent, updatedImage)}
                                        onCancel={handleCancelEdit}
                                        onRemoveImage={() => handleRemoveImage(index)}
                                    />
                                </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Section Summary */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Generated {generatedSections.length} sections</strong> with alternating layout. 
                            Click "Apply Sections" to use this layout in your internship.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to remove "Part X:" prefixes from display
const removePartPrefixes = (content) => {
    return content.replace(/^Part\s+\d+:\s*/gm, '');
};

// Editable Section Component
const EditableSection = ({ section, index, editMode, isEditing, selectedCategory, categoryImagesFromApi = [], onEdit, onSave, onCancel, onRemoveImage }) => {
    const [editContent, setEditContent] = useState(section.content);
    const [editImage, setEditImage] = useState(section.image);

    // Sync editImage with section.image when it changes (important for preview)
    React.useEffect(() => {
        if (section.image !== editImage && !isEditing) {
            console.log(`🟢 EditableSection ${index}: Syncing editImage with section.image`, {
                oldImage: editImage,
                newImage: section.image
            });
            setEditImage(section.image);
        }
    }, [section.image, isEditing, index]);

    // Get all available image options from all folders
    const getAllImageOptions = () => {
        const allImages = [];
        
        // Welcome folder images
        const welcomeImages = [
            '/assets/Welcome/panda.png',
            '/assets/Welcome/green.png',
            '/assets/Welcome/crab.png',
            '/assets/Welcome/bee.png',
            '/assets/Welcome/lady.png',
            '/assets/Welcome/robot.png'
        ];
        
        // Thinking folder images
        const thinkingImages = [
            '/assets/thinking/thinking 1.png',
            '/assets/thinking/thinking 2.png',
            '/assets/thinking/thinking 3.png',
            '/assets/thinking/thinking 4.png',
            '/assets/thinking/thinking 5.png',
            '/assets/thinking/thinking 6.png',
            '/assets/thinking/thinking.png'
        ];
        
        // Quiz folder images
        const quizImages = [
            '/assets/Quiz/Quiz 1.png',
            '/assets/Quiz/Quiz 2.png',
            '/assets/Quiz/Quiz 3.png',
            '/assets/Quiz/Quiz 4.png',
            '/assets/Quiz/Quiz 5.png'
        ];
        
        // Content folder images
        const contentImages = [
            '/assets/content/content 1.png',
            '/assets/content/content 2.png',
            '/assets/content/content 3.png',
            '/assets/content/content 4.png',
            '/assets/content/content 5.png',
            '/assets/content/content 6.png'
        ];
        
        // Category folder images (if category is selected)
        const categoryImages = [];
        if (selectedCategory) {
            if (categoryImagesFromApi && categoryImagesFromApi.length > 0) {
                categoryImages.push(...categoryImagesFromApi);
            } else {
                // Fallback to common patterns if API did not return images
                categoryImages.push(
                    `/assets/Categories/${selectedCategory}/1.png`,
                    `/assets/Categories/${selectedCategory}/2.png`,
                    `/assets/Categories/${selectedCategory}/3.png`,
                    `/assets/Categories/${selectedCategory}/4.png`,
                    `/assets/Categories/${selectedCategory}/5.png`,
                    `/assets/Categories/${selectedCategory}/1.jpeg`,
                    `/assets/Categories/${selectedCategory}/2.jpeg`,
                    `/assets/Categories/${selectedCategory}/3.jpeg`,
                    `/assets/Categories/${selectedCategory}/4.jpeg`,
                    `/assets/Categories/${selectedCategory}/5.jpeg`,
                    `/assets/Categories/${selectedCategory}/image1.png`,
                    `/assets/Categories/${selectedCategory}/image2.png`,
                    `/assets/Categories/${selectedCategory}/image3.png`,
                    `/assets/Categories/${selectedCategory}/image4.png`,
                    `/assets/Categories/${selectedCategory}/image5.png`
                );
            }
        }
        
        // Combine all images with labels for better organization
        return {
            'Welcome': welcomeImages,
            'Thinking': thinkingImages,
            'Quiz': quizImages,
            'Content': contentImages,
            ...(selectedCategory ? { [selectedCategory]: categoryImages } : {})
        };
    };

    // Smart image selection based on content type (for initial parsing)
    const getImageOptions = (content, index) => {
        const contentLower = content.toLowerCase();
        
        // First section (index 0) uses Welcome folder only
        if (index === 0) {
            return [
                '/assets/Welcome/panda.png',
                '/assets/Welcome/green.png',
                '/assets/Welcome/crab.png',
                '/assets/Welcome/bee.png',
                '/assets/Welcome/lady.png',
                '/assets/Welcome/robot.png'
            ];
        }
        
        // Check for question mark (?) in the content - ONLY use thinking folder if ? is present
        if (contentLower.includes('?')) {
            return [
                '/assets/thinking/thinking 1.png',
                '/assets/thinking/thinking 2.png',
                '/assets/thinking/thinking 3.png',
                '/assets/thinking/thinking 4.png',
                '/assets/thinking/thinking 5.png',
                '/assets/thinking/thinking 6.png',
                '/assets/thinking/thinking.png'
            ];
        }
        
        // Check for quiz/task content
        const quizKeywords = ['quiz', 'question', 'task', 'exercise', 'assignment', 'test', 'exam', 'mcq', 'multiple choice'];
        const hasQuiz = quizKeywords.some(keyword => contentLower.includes(keyword));
        if (hasQuiz) {
            return [
                '/assets/Quiz/Quiz 1.png',
                '/assets/Quiz/Quiz 2.png',
                '/assets/Quiz/Quiz 3.png',
                '/assets/Quiz/Quiz 4.png',
                '/assets/Quiz/Quiz 5.png'
            ];
        }
        
        // Use selected category folder if available, otherwise default to content folder
        if (selectedCategory) {
            return [
                `/assets/Categories/${selectedCategory}/1.png`,
                `/assets/Categories/${selectedCategory}/2.png`,
                `/assets/Categories/${selectedCategory}/3.png`,
                `/assets/Categories/${selectedCategory}/4.png`,
                `/assets/Categories/${selectedCategory}/5.png`,
                `/assets/Categories/${selectedCategory}/image1.png`,
                `/assets/Categories/${selectedCategory}/image2.png`,
                `/assets/Categories/${selectedCategory}/image3.png`,
                `/assets/Categories/${selectedCategory}/image4.png`,
                `/assets/Categories/${selectedCategory}/image5.png`
            ];
        }
        
        // Default to content folder for all other content
        return [
            '/assets/content/content 1.png',
            '/assets/content/content 2.png',
            '/assets/content/content 3.png',
            '/assets/content/content 4.png',
            '/assets/content/content 5.png',
            '/assets/content/content 6.png'
        ];
    };

    const contentEditableRef = React.useRef(null);

    const applyFormat = (cmd, value = null) => {
        if (contentEditableRef.current) {
            contentEditableRef.current.focus();
            document.execCommand(cmd, false, value);
            const html = contentEditableRef.current.innerHTML;
            setEditContent(html);
        }
    };

    const handleSave = () => {
        // capture latest html before save
        const html = contentEditableRef.current ? contentEditableRef.current.innerHTML : editContent;
        onSave(html, editImage);
    };

    const handleCancel = () => {
        setEditContent(section.content);
        setEditImage(section.image);
        onCancel();
    };

    // Helper function to detect math-only paragraphs (same as parent)
    const isMathOnly = (content) => {
        if (!content) return false;
        const trimmed = content.trim();
        return (
            (trimmed.startsWith('$$') && trimmed.endsWith('$$')) ||
            (trimmed.startsWith('$') && trimmed.endsWith('$'))
        );
    };

    // Determine if image should be shown
    // DO NOT show image for code blocks or math-only blocks
    // ALWAYS show image column for text sections (they must have images)
    const shouldShowImage = section.type !== 'code' && !isMathOnly(section.content);
    // For text sections, always show image column (they must have images per invariant)
    // For code/math sections, never show image column
    const showImageColumn = isEditing || shouldShowImage;
    
    // Debug logging for image visibility
    console.log(`🟡 EditableSection ${index}: Image visibility check`, {
        type: section.type,
        image: section.image,
        shouldShowImage: shouldShowImage,
        showImageColumn: showImageColumn,
        isEditing: isEditing,
        isMathOnly: isMathOnly(section.content)
    });
    
    if (shouldShowImage && (!section.image || section.image.trim() === '')) {
        console.error(`❌ EditableSection: Text section ${index} has empty image!`, {
            type: section.type,
            image: section.image,
            content: section.content?.substring(0, 50) + '...'
        });
    }

    return (
        <div className={`flex flex-col ${showImageColumn ? ((index % 2 === 0) ? 'lg:flex-row' : 'lg:flex-row-reverse') : 'lg:flex-col'} gap-6 items-start`}>
            {/* Text Content */}
            <div className="flex-1 space-y-3">
                {isEditing ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">Edit Section {index + 1}</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => applyFormat('bold')}
                                className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                            >
                                B
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('italic')}
                                className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                            >
                                I
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('fontSize', '4')}
                                className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                            >
                                A+
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFormat('fontSize', '3')}
                                className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                            >
                                A
                            </button>
                        </div>
                        <div
                            ref={contentEditableRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={(e) => setEditContent(e.currentTarget.innerHTML)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[180px] leading-relaxed space-y-2 text-justify"
                            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                            dangerouslySetInnerHTML={{ __html: editContent }}
                        />
                    </div>
                ) : (
                    <div className="prose prose-gray max-w-none text-justify">
                        {editMode && (
                            <div className="mb-3">
                                <button
                                    onClick={onEdit}
                                    className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    Edit Section
                                </button>
                            </div>
                        )}
                        {removePartPrefixes(section.content).split('\n').map((line, lineIndex) => {
                            const trimmedLine = line.trim();
                            
                            // Check for headings
                            const isNumberedHeading = /^\d+\.\s+.*/.test(trimmedLine);
                            const isBoldHeading = trimmedLine.startsWith('**') && trimmedLine.endsWith('**');
                            const isColonHeading = /^[A-Z][a-zA-Z\s&]+:$/.test(trimmedLine);
                            
                            if (isNumberedHeading) {
                                return (
                                    <h3 key={lineIndex} className="text-lg font-bold text-gray-900 mb-3">
                                        {trimmedLine}
                                    </h3>
                                );
                            } else if (isBoldHeading) {
                                return (
                                    <h4 key={lineIndex} className="text-base font-semibold text-gray-800 mb-2">
                                        {trimmedLine.replace(/\*\*/g, '')}
                                    </h4>
                                );
                            } else if (isColonHeading) {
                                return (
                                    <h4 key={lineIndex} className="text-base font-semibold text-gray-800 mb-2">
                                        {trimmedLine}
                                    </h4>
                                );
                            } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                                return (
                                    <ul key={lineIndex} className="mb-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold mt-1">•</span>
                                            <span>{trimmedLine.substring(2)}</span>
                                        </li>
                                    </ul>
                                );
                            } else if (trimmedLine === '') {
                                return <div key={lineIndex} className="mb-1"></div>;
                            } else {
                                return (
                                    <p key={lineIndex} className="mb-2 text-gray-700 text-justify">
                                        {line}
                                    </p>
                                );
                            }
                        })}
                    </div>
                )}
            </div>
            
            {/* Image Content */}
            {/* CRITICAL: Always show image column for text sections (they must have images) */}
            <div className={showImageColumn ? "flex-1 w-full" : "hidden"}>
                {isEditing ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">Select Image</label>
                            <button
                                type="button"
                                onClick={() => setEditImage(null)}
                                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                <X className="h-4 w-4" />
                                Remove Image
                            </button>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {Object.entries(getAllImageOptions()).map(([folderName, images]) => (
                                <div key={folderName} className="space-y-2">
                                    <h5 className="text-sm font-semibold text-gray-700 capitalize">
                                        {folderName} ({images.length} images)
                                    </h5>
                                    <div className="grid grid-cols-3 gap-2">
                                        {images.map((image, imgIndex) => (
                                            <div
                                                key={`${folderName}-${imgIndex}`}
                                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                                                    editImage === image ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setEditImage(image)}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${folderName} ${imgIndex + 1}`}
                                                    className="w-full h-20 object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div class="w-full h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-400">Not Found</div>';
                                                    }}
                                                />
                                                {editImage === image && (
                                                    <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                                                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                            Selected
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {editImage === null && (
                            <div className="p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 text-center">
                                <p className="text-sm text-gray-600">No image selected for this section</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="relative">
                        {/* RENDER-TIME SAFETY: DO NOT render image for code blocks or math-only blocks */}
                        {section.type === 'code' || isMathOnly(section.content) ? (
                            // Code blocks and math-only blocks: NO image rendered
                            <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-2">
                                        {section.type === 'code' ? 'Code Block' : 'Math Block'}
                                    </p>
                                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                        Section {index + 1}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Text paragraphs: ALWAYS render image (with fallback)
                            // CRITICAL: Text sections MUST always have images per invariant
                            (() => {
                                const imageSrc = section.image && section.image.trim() !== '' ? section.image : '/assets/content/content 1.png';
                                console.log(`🟢 EditableSection ${index}: Rendering image`, {
                                    sectionImage: section.image,
                                    finalImageSrc: imageSrc,
                                    shouldShowImage: shouldShowImage,
                                    showImageColumn: showImageColumn,
                                    type: section.type
                                });
                                return (
                                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                        <img 
                                            src={imageSrc}
                                            alt={`Section ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            style={{ minHeight: '192px', display: 'block' }}
                                            onLoad={() => {
                                                console.log(`✅ Image loaded successfully for section ${index}:`, imageSrc);
                                            }}
                                            onError={(e) => {
                                                // If image fails to load, try fallback
                                                console.error(`❌ Image failed to load for section ${index}:`, imageSrc);
                                                const imgElement = e.target;
                                                const currentSrc = imgElement.src;
                                                const fallbackSrc = '/assets/content/content 1.png';
                                                
                                                // Check if we're already trying the fallback
                                                if (!currentSrc.includes('content 1.png')) {
                                                    console.log(`🔄 Trying fallback image for section ${index}`);
                                                    imgElement.src = fallbackSrc;
                                                } else {
                                                    // If fallback also fails, log error but keep trying
                                                    console.error(`❌ Fallback image also failed for section ${index}`);
                                                    // Keep image visible with error state
                                                    imgElement.style.opacity = '0.5';
                                                    imgElement.style.backgroundColor = '#f3f4f6';
                                                }
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                                            Section {index + 1}
                                        </div>
                                    </div>
                                );
                            })()
                        )}
                        {editMode && (
                            <div className="absolute top-2 left-2 flex gap-2">
                                <button
                                    onClick={onEdit}
                                    className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-purple-700 transition-colors"
                                >
                                    <Edit3 className="h-3 w-3 inline mr-1" />
                                    Edit
                                </button>
                                {section.image && onRemoveImage && (
                                    <button
                                        onClick={onRemoveImage}
                                        className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                                        title="Remove image from this section"
                                    >
                                        <X className="h-3 w-3 inline mr-1" />
                                        Remove Image
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoContentParser;
