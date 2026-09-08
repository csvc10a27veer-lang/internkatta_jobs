import React from 'react';
import OptimizedImage from './OptimizedImage';

// Helper function to remove "Part X:" prefixes from display
const removePartPrefixes = (content) => {
    return content.replace(/^Part\s+\d+:\s*/gm, '');
};

// Helper function to detect math-only paragraphs
// Math blocks are wrapped in $$ ... $$ OR $ ... $
const isMathOnly = (content) => {
    if (!content) return false;
    const trimmed = content.trim();
    return (
        (trimmed.startsWith('$$') && trimmed.endsWith('$$')) ||
        (trimmed.startsWith('$') && trimmed.endsWith('$'))
    );
};

const ContentSectionsRenderer = ({ sections }) => {
    if (!sections || sections.length === 0) {
        return null;
    }

    // Debug logging to track sections and images
    console.log('🟢 ContentSectionsRenderer: Rendering sections', sections.length);
    sections.forEach((section, index) => {
        console.log(`🟢 ContentSectionsRenderer: Section ${index}`, {
            type: section.type,
            hasImage: Boolean(section.image),
            image: section.image,
            isMathOnly: isMathOnly(section.content),
            contentPreview: section.content?.substring(0, 50) + '...'
        });
    });

    return (
        <div className="space-y-12">
            {sections.map((section, index) => {
                // HARD VALIDATION LOGGING (MANDATORY)
                // This error must NEVER appear after the fix
                if (section.type === 'text' && !isMathOnly(section.content) && (!section.image || section.image.trim() === '')) {
                    console.error('❌ IMAGE MISSING FOR TEXT PARAGRAPH IN RENDERER', section);
                }

                // Handle code sections separately - render as full-width, outside alternating layout
                if (section.type === 'code') {
                    const language = section.language;
                    
                    return (
                        <div 
                            key={section._id || index} 
                            className="w-full my-6 flex-none" 
                            style={{ 
                                maxWidth: '100%', 
                                overflow: 'hidden', 
                                width: '100%',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none'
                            }}
                            onCopy={(e) => e.preventDefault()}
                        >
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl overflow-hidden shadow-lg w-full" style={{ width: '100%' }}>
                                <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-300 border-b border-gray-600 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>Code Example</span>
                                    </div>
                                    {language && language.trim() && (
                                        <span className="text-xs font-mono bg-gray-600 px-2 py-1 rounded">
                                            {language}
                                        </span>
                                    )}
                                </div>
                                <pre 
                                    className="p-3 md:p-6 overflow-x-auto text-xs md:text-sm lg:text-base whitespace-pre font-mono w-full"
                                    style={{
                                        maxWidth: '100%',
                                        WebkitOverflowScrolling: 'touch',
                                        wordBreak: 'normal',
                                        overflowWrap: 'normal',
                                        whiteSpace: 'pre'
                                    }}
                                >
                                    <code className="whitespace-pre font-mono block">{section.content || ''}</code>
                                </pre>
                            </div>
                        </div>
                    );
                }
                
                // Handle text and text-only sections with alternating layout
                return (
                    <div key={section._id || index} className={`flex flex-col lg:flex-row gap-8 items-center ${
                        (index % 2 === 0) ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}>
                        {/* Text Content */}
                        <div className="flex-1 space-y-4">
                            <div className="prose prose-gray max-w-none">
                                {(() => {
                                    const content = removePartPrefixes(section.content || '');
                                    // Check if content contains HTML tags
                                    const hasHTML = /<[^>]+>/.test(content);
                                    
                                    if (hasHTML) {
                                        // Render HTML content
                                        return (
                                            <div 
                                                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
                                            />
                                        );
                                    } else {
                                        // Render plain text with formatting
                                        return content.split('\n').map((line, lineIndex) => {
                                            const trimmedLine = line.trim();
                                            
                                            // Check for numbered headings
                                            const isNumberedHeading = /^\d+\.\s+.*/.test(trimmedLine);
                                            
                                            // Check for bold headings
                                            const isBoldHeading = trimmedLine.startsWith('**') && trimmedLine.endsWith('**');
                                            
                                            // Check for sub-headings
                                            const isSubHeading = trimmedLine.length < 100 && 
                                                (trimmedLine.includes('**') || 
                                                 /^[A-Z][a-zA-Z\s&]+:$/.test(trimmedLine) ||
                                                 /^[A-Z][a-zA-Z\s&]+\s+\([^)]+\)$/.test(trimmedLine));
                                            
                                            if (isNumberedHeading) {
                                                return (
                                                    <h3 key={lineIndex} className="text-xl font-bold text-gray-900 mb-4 mt-6 first:mt-0 break-words">
                                                        {trimmedLine}
                                                    </h3>
                                                );
                                            } else if (isBoldHeading) {
                                                return (
                                                    <h4 key={lineIndex} className="text-lg font-semibold text-gray-800 mb-3 mt-4 break-words">
                                                        {trimmedLine.replace(/\*\*/g, '')}
                                                    </h4>
                                                );
                                            } else if (isSubHeading) {
                                                return (
                                                    <h5 key={lineIndex} className="text-base font-semibold text-gray-700 mb-2 mt-3 break-words">
                                                        {trimmedLine}
                                                    </h5>
                                                );
                                            } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                                                return (
                                                    <ul key={lineIndex} className="mb-4">
                                                        <li className="flex items-start gap-2 break-words">
                                                            <span className="text-[#0052A3] font-bold mt-1">•</span>
                                                            <span>{trimmedLine.substring(2)}</span>
                                                        </li>
                                                    </ul>
                                                );
                                            } else if (trimmedLine === '') {
                                                return <div key={lineIndex} className="mb-2"></div>;
                                            } else {
                                                return (
                                                    <p key={lineIndex} className="mb-4 last:mb-0 break-words text-left">
                                                        {line}
                                                    </p>
                                                );
                                            }
                                        });
                                    }
                                })()}
                            </div>
                        </div>
                        
                        {/* Image Content */}
                        {/* RENDER-TIME SAFETY: DO NOT render image for code blocks or math-only blocks */}
                        {/* ALWAYS render image for text paragraphs (with fallback) */}
                        <div className="flex-1">
                            {section.type === 'code' || isMathOnly(section.content) ? (
                                // Code blocks and math-only blocks: NO image rendered
                                <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500 mb-2">
                                            {section.type === 'code' ? 'Code Block' : 'Math Block'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // Text paragraphs: ALWAYS render image (with fallback)
                                <div className="relative rounded-xl overflow-hidden shadow-lg">
                                    <OptimizedImage 
                                        src={section.image || '/assets/content/content 1.png'}
                                        alt={`Content section ${index + 1}`}
                                        className="w-full h-auto max-h-80 object-contain"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => {
                                            // Fallback to default image if current image fails
                                            if (e.target.src !== '/assets/content/content 1.png') {
                                                e.target.src = '/assets/content/content 1.png';
                                            } else {
                                                e.target.style.display = 'none';
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ContentSectionsRenderer;

