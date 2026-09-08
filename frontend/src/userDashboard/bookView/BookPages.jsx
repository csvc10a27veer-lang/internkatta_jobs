import React, { useState, useLayoutEffect, useRef } from 'react';
import { BookOpen, Code, Trophy, LockKeyhole, Lightbulb, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import TaskStatusDisplay from '../TaskStatusDisplay.jsx'; // Reuse existing component

export const BookCover = ({ title, duration, internshipTitle, moduleTitle, topicIndex, onStart }) => (
    <div className="h-full flex flex-col justify-center items-center text-center px-4 md:px-8 relative bg-white overflow-hidden">
        {/* Decorative background elements (pointer-events-none so they don't block clicks) */}
        <div className="absolute top-0 left-0 text-[#0052A3] opacity-[0.02] transform -translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <BookOpen size={240} />
        </div>
        <div className="absolute bottom-0 right-0 text-[#0052A3] opacity-[0.02] transform translate-x-1/4 translate-y-1/4 rotate-180 pointer-events-none">
            <BookOpen size={240} />
        </div>
        
        {/* Main Content Container - h-full ensures we stay inside the page */}
        <div className="flex flex-col justify-between items-center w-full max-w-2xl mx-auto z-10 h-full py-6 md:py-8">
            
            {/* Top Area: Vertically Centered Title & Metadata */}
            <div className="flex flex-col items-center justify-center flex-1 w-full min-h-0">
                
                {/* Book Icon */}
                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#F5F8FC] rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-[#e6f0fa] shrink-0">
                    <BookOpen size={24} className="text-[#0052A3]" />
                </div>

                {/* Topic Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1a2b4b] mb-4 md:mb-6 leading-tight md:leading-snug w-full break-words max-w-lg mx-auto shrink-0">
                    {title}
                </h1>
                
                {/* Divider */}
                <div className="h-1 w-16 bg-gradient-to-r from-[#0052A3] to-blue-400 rounded-full mb-4 md:mb-6 opacity-80 shrink-0"></div>
                
                {/* Secondary Metadata */}
                {(internshipTitle || moduleTitle) && (
                    <div className="flex flex-col items-center gap-2 mb-4 shrink-0">
                        {internshipTitle && (
                            <span className="text-gray-400 font-bold tracking-widest uppercase text-[10px] md:text-xs">
                                {internshipTitle}
                            </span>
                        )}
                        {(moduleTitle || topicIndex) && (
                            <span className="text-[#0052A3] font-semibold bg-[#F5F8FC] px-3 py-1 rounded-full border border-[#e6f0fa] shadow-sm text-xs md:text-sm">
                                {moduleTitle ? `${moduleTitle} • ` : ''}Topic {topicIndex || 1}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Area: Fixed CTA Button */}
            <div className="flex flex-col items-center gap-3 md:gap-4 w-full shrink-0 mt-4 pb-2">
                {duration && (
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                        <Clock size={14} />
                        Estimated Time: {duration}
                    </span>
                )}
                
                <button 
                    onClick={onStart}
                    className="px-6 py-3 md:px-8 md:py-3.5 bg-gradient-to-r from-[#0052A3] to-[#004080] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-[#004080] hover:to-[#003366] transition-all transform hover:-translate-y-1 w-full max-w-xs text-sm md:text-base shrink-0"
                >
                    Start Learning
                </button>
            </div>
        </div>
    </div>
);

export const TextPage = ({ content }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [fontSize, setFontSize] = useState(22); // Start with a comfortable large size

    useLayoutEffect(() => {
        setFontSize(22); // Reset to max font size when content changes
    }, [content]);

    useLayoutEffect(() => {
        if (!containerRef.current || !contentRef.current) return;
        
        const container = containerRef.current;
        const contentNode = contentRef.current;
        
        // If content overflows and we haven't reached the minimum readable size (12px)
        if (contentNode.scrollHeight > container.clientHeight + 2 && fontSize > 12) {
            setFontSize(prev => prev - 1);
        }
    }, [fontSize, content]);

    // Reusing the logic from ContentSectionsRenderer to format text
    // We use em units so that everything scales proportionally with the parent fontSize
    const formatText = (text) => {
        if (!text) return null;
        
        // Basic HTML check
        if (/<[^>]+>/.test(text)) {
            return <div dangerouslySetInnerHTML={{ __html: text.replace(/\\n/g, '<br />') }} style={{ fontSize: '1em', lineHeight: '1.6' }} />;
        }
        
        return text.split('\\n').map((line, idx) => {
            const trimmedLine = line.trim();
            const isNumberedHeading = /^\\d+\\.\\s+.*/.test(trimmedLine);
            const isBoldHeading = trimmedLine.startsWith('**') && trimmedLine.endsWith('**');
            
            if (isNumberedHeading) {
                return <h3 key={idx} className="font-bold text-gray-900 mb-[0.8em] mt-[1.2em] first:mt-0 break-words" style={{ fontSize: '1.25em', lineHeight: '1.4' }}>{trimmedLine}</h3>;
            } else if (isBoldHeading) {
                return <h4 key={idx} className="font-semibold text-gray-800 mb-[0.6em] mt-[1em] break-words" style={{ fontSize: '1.1em', lineHeight: '1.4' }}>{trimmedLine.replace(/\\*\\*/g, '')}</h4>;
            } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                return (
                    <ul key={idx} className="mb-[0.6em]">
                        <li className="flex items-start gap-2 break-words" style={{ fontSize: '1em', lineHeight: '1.5' }}>
                            <span className="text-[#0052A3] font-bold mt-[0.2em]">•</span>
                            <span>{trimmedLine.substring(2)}</span>
                        </li>
                    </ul>
                );
            } else if (trimmedLine === '') {
                return <div key={idx} className="mb-[0.4em]"></div>;
            } else {
                return <p key={idx} className="mb-[0.8em] last:mb-0 break-words text-left text-gray-800" style={{ fontSize: '1em', lineHeight: '1.6' }}>{line}</p>;
            }
        });
    };

    return (
        <div ref={containerRef} className="h-full w-full overflow-hidden flex flex-col justify-start">
            <div 
                ref={contentRef} 
                className="w-full max-w-none text-gray-800"
                style={{ fontSize: `${fontSize}px` }}
            >
                {formatText(content)}
            </div>
        </div>
    );
};

export const CodePage = ({ code, language }) => (
    <div className="h-full flex flex-col justify-start">
        <div className="flex items-center gap-2 mb-4">
            <Code size={24} className="text-[#0052A3]" />
            <h3 className="text-xl font-bold text-gray-900">Code Example</h3>
        </div>
        
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl overflow-hidden shadow-lg w-full">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3 text-sm text-gray-300 border-b border-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                {language && <span className="font-mono text-xs opacity-75">{language}</span>}
            </div>
            <pre className="p-6 overflow-x-auto text-sm lg:text-base font-mono w-full text-left" style={{ whiteSpace: 'pre-wrap' }}>
                <code>{code}</code>
            </pre>
        </div>
    </div>
);

export const ImagePage = ({ src, alt }) => (
    <div className="h-full flex flex-col justify-center items-center">
        <div className="relative rounded-xl overflow-hidden shadow-md max-w-full">
            <img 
                src={src || '/assets/content/content 1.png'} 
                alt={alt || "Educational Content"} 
                className="max-h-[60vh] object-contain w-auto"
                onError={(e) => {
                    if (e.target.src !== '/assets/content/content 1.png') {
                        e.target.src = '/assets/content/content 1.png';
                    }
                }}
            />
        </div>
        {alt && <p className="mt-4 text-sm text-gray-500 italic text-center">{alt}</p>}
    </div>
);

export const TaskPage = ({ activeProgress, activeLecture, handleTaskSubmit, onNext }) => (
    <div className="h-full flex flex-col justify-start max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 border-b pb-4">
            <span className="w-8 h-8 bg-[#0052A3] rounded-full flex items-center justify-center text-white text-sm">1</span>
            Submit Your Task
        </h3>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h4 className="font-bold text-lg mb-4">Task Instructions:</h4>
            <p className="text-gray-700 leading-relaxed text-lg" style={{ userSelect: 'none' }}>
                {activeLecture?.taskPrompt}
            </p>
        </div>
        
        <div className="w-full">
            <TaskStatusDisplay 
                activeProgress={activeProgress}
                activeLecture={activeLecture}
                handleTaskSubmit={handleTaskSubmit}
            />
        </div>
    </div>
);

export const QuizLockedPage = () => (
    <div className="h-full flex flex-col justify-center items-center text-center px-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <LockKeyhole size={48} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Quiz Locked</h3>
        <p className="text-gray-600 max-w-md text-lg">
            You must successfully submit and get your task approved before you can access this quiz.
        </p>
    </div>
);

export const QuizEntryPage = ({ onStartQuiz }) => (
    <div className="h-full flex flex-col justify-center items-center text-center px-6">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-600">
            <Lightbulb size={48} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready for the Quiz?</h3>
        <p className="text-gray-600 max-w-md text-lg mb-8">
            Test your knowledge on this lecture to proceed.
        </p>
        <button 
            onClick={onStartQuiz}
            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
        >
            <Lightbulb size={20} />
            Start Quiz
        </button>
    </div>
);

export const CompletionPage = ({ onNextLecture, hasNextLecture }) => (
    <div className="h-full flex flex-col justify-center items-center text-center px-6">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-500">
            <Trophy size={48} />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Lecture Completed!</h3>
        <p className="text-gray-600 max-w-md text-lg mb-8">
            Great job! You have completed all tasks and quizzes for this lecture.
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 mb-6 text-sm font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
            <CheckCircle size={20} />
            All Done
        </div>
        {hasNextLecture && onNextLecture && (
            <button 
                onClick={onNextLecture}
                className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
                Go To Next Topic
                <ArrowRight size={20} />
            </button>
        )}
    </div>
);
