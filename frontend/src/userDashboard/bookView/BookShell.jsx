import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookShell = ({ 
    pages, 
    title, 
    progress, 
    streaksToday,
    onClose,
    onOpenSidebar,
    isPreview,
    lectureCount,
    currentLectureIndex,
    internshipTitle,
    moduleTitle,
    topicTitle,
    isSidebarOpen,
    sidebarContent
}) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [direction, setDirection] = useState('next');
    const [animating, setAnimating] = useState(false);
    
    // Animation state
    const [targetPageIndex, setTargetPageIndex] = useState(null);
    const [turningIndex, setTurningIndex] = useState(null);

    // Reset to cover page when switching to a different topic/lecture
    useEffect(() => {
        setCurrentPageIndex(0);
        setDirection('next');
        setAnimating(false);
        setTargetPageIndex(null);
        setTurningIndex(null);
    }, [currentLectureIndex]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile && currentPageIndex > 0 && currentPageIndex % 2 !== 1) {
                setCurrentPageIndex(Math.max(1, currentPageIndex - 1));
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentPageIndex]);

    const handleNext = () => {
        if (animating) return;
        const step = isMobile || currentPageIndex === 0 ? 1 : 2;
        if (currentPageIndex + step < pages.length) {
            const nextIdx = currentPageIndex + step;
            setDirection('next');
            setTurningIndex(currentPageIndex);
            setTargetPageIndex(nextIdx);
            setAnimating(true);
            
            setTimeout(() => {
                setCurrentPageIndex(nextIdx);
                setAnimating(false);
                setTargetPageIndex(null);
                setTurningIndex(null);
            }, 800); // 800ms to match the CSS animation duration
        }
    };

    const handlePrev = () => {
        if (animating) return;
        if (currentPageIndex > 0) {
            let nextIdx;
            if (!isMobile) {
                if (currentPageIndex === 1 || currentPageIndex === 2) {
                    nextIdx = 0;
                } else {
                    nextIdx = Math.max(1, currentPageIndex - 2);
                }
            } else {
                nextIdx = Math.max(0, currentPageIndex - 1);
            }
            
            setDirection('prev');
            setTurningIndex(currentPageIndex);
            setTargetPageIndex(nextIdx);
            setAnimating(true);
            
            setTimeout(() => {
                setCurrentPageIndex(nextIdx);
                setAnimating(false);
                setTargetPageIndex(null);
                setTurningIndex(null);
            }, 800);
        }
    };

    let leftPage = null;
    let rightPage = null;
    let centerPage = null;

    if (isMobile) {
        centerPage = pages[currentPageIndex];
    } else {
        if (currentPageIndex === 0) {
            centerPage = pages[0];
        } else {
            leftPage = pages[currentPageIndex];
            rightPage = currentPageIndex + 1 < pages.length ? pages[currentPageIndex + 1] : null;
        }
    }

    const progressPercentage = Math.round((currentPageIndex / Math.max(1, pages.length - 1)) * 100);

    return (
        <div className="h-screen bg-[#F5F8FC] flex flex-col font-sans overflow-hidden">
            <div className="bg-white text-gray-800 px-4 md:px-6 lg:px-8 py-3 md:py-5 lg:py-6 flex items-center justify-between shadow-sm border-b border-gray-200 z-10 flex-shrink-0 gap-4">
                
                {/* Left Section (Fixed) */}
                <div className="flex items-center gap-3 md:gap-4 lg:gap-6 justify-start flex-shrink-0">
                    <button 
                        onClick={onClose} 
                        className="flex items-center gap-2 text-gray-500 hover:text-[#0052A3] transition-colors font-medium text-sm md:text-base lg:text-lg"
                    >
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="hidden md:inline font-bold">Back</span>
                    </button>
                    {!isPreview && (
                        <button 
                            onClick={onOpenSidebar}
                            className={`text-gray-500 hover:text-[#0052A3] transition-colors p-2 rounded-xl hover:bg-gray-100 ${isSidebarOpen ? 'bg-gray-100 text-[#0052A3]' : ''}`}
                        >
                            <Menu className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    )}
                </div>
                
                {/* Center Section (Flexible) */}
                <div className="hidden md:flex flex-col justify-center items-center flex-1 min-w-0 px-4">
                    {(internshipTitle || topicTitle) && (
                        <>
                            <span className="text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-wider text-gray-500 mb-1 truncate w-full text-center">
                                {internshipTitle} {moduleTitle ? ` • ${moduleTitle}` : ''}
                            </span>
                            <span className="text-base md:text-lg lg:text-xl font-extrabold text-gray-900 truncate w-full text-center">
                                {topicTitle || title}
                            </span>
                        </>
                    )}
                </div>
                
                {/* Right Section (Fixed) */}
                <div className="flex items-center justify-end gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
                    {lectureCount > 0 && (
                        <div className="hidden md:flex items-center bg-gray-50 rounded-full px-3 md:px-4 lg:px-5 py-1.5 md:py-2 border border-gray-200 shadow-sm">
                            <span className="text-xs md:text-sm lg:text-base font-bold text-gray-700 whitespace-nowrap">
                                Topic {currentLectureIndex + 1} <span className="text-gray-400 mx-1">/</span> {lectureCount}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center bg-[#e6f0fa] rounded-full px-3 md:px-4 lg:px-5 py-1.5 md:py-2 border border-[#cce0f5] shadow-sm">
                        <span className="text-xs md:text-sm lg:text-base font-bold text-[#0052A3] whitespace-nowrap">
                            {progressPercentage}% Complete
                        </span>
                    </div>
                    {streaksToday > 0 && (
                        <span className="text-[10px] md:text-xs lg:text-sm bg-amber-500 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full font-bold animate-pulse shadow-sm whitespace-nowrap">
                            🔥 {streaksToday}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Backdrop for mobile/tablet when sidebar is open */}
                {isSidebarOpen && !isPreview && (
                    <div 
                        className="lg:hidden absolute inset-0 bg-black/20 z-40 transition-opacity"
                        onClick={onOpenSidebar}
                    />
                )}
                {!isPreview && (
                    <div 
                        className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full md:w-80 border-r border-gray-200' : 'w-0'} bg-white overflow-hidden flex-shrink-0 z-50 absolute lg:relative h-full shadow-2xl lg:shadow-none left-0`}
                    >
                        <div className="w-full md:w-80 h-full">
                            {sidebarContent}
                        </div>
                    </div>
                )}
                
                <div className="flex-1 w-full h-full min-h-0 flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">

                
                {!isMobile && (
                    <div className="relative flex-1 w-full md:max-w-4xl lg:max-w-6xl min-h-[400px] flex items-center justify-center mx-auto" style={{ perspective: '2000px' }}>
                        {/* Base state / Non-animating Desktop */}
                        {!animating && (
                            centerPage ? (
                                <div className={`w-1/2 h-full bg-[#fcfbfa] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-r-3xl rounded-l-md border-l-8 border-[#0052A3] overflow-hidden`}>
                                    <div className="w-full h-full p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar">
                                        {centerPage ? React.cloneElement(centerPage, { onStart: handleNext }) : null}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-3xl overflow-hidden bg-[#fcfbfa] relative border border-gray-200/60">
                                    <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-transparent via-black/5 to-transparent z-20 pointer-events-none"></div>
                                    <div className="w-1/2 h-full border-r border-gray-200 p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar relative bg-[#fcfbfa] z-10">
                                        {leftPage}
                                    </div>
                                    <div className="w-1/2 h-full p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar relative bg-[#fcfbfa] z-10 shadow-[-10px_0_20px_-15px_rgba(0,0,0,0.1)]">
                                        {rightPage ? rightPage : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                End of Section
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        )}

                        {/* Animating State Desktop */}
                        {animating && !isMobile && (
                            <div className="w-full h-full flex shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-3xl overflow-hidden bg-[#fcfbfa] relative perspective-[2000px] border border-gray-200/60">
                                <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-transparent via-black/5 to-transparent z-40 pointer-events-none"></div>
                                
                                {/* NEXT TURN: 
                                    Base Left: Old Left (turningIndex).
                                    Base Right: New Right (targetPageIndex + 1).
                                    Turning Right: Front is Old Right, Back is New Left.
                                */}
                                {direction === 'next' && (
                                    <>
                                        <div className="w-1/2 h-full border-r border-gray-200 p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar relative bg-[#fcfbfa] z-10">
                                            {turningIndex === 0 ? null : pages[turningIndex]}
                                        </div>
                                        <div className="w-1/2 h-full p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar relative bg-[#fcfbfa] z-10 shadow-[-10px_0_20px_-15px_rgba(0,0,0,0.1)]">
                                            {pages[targetPageIndex + (targetPageIndex === 0 ? 0 : 1)] || <div className="w-full h-full flex items-center justify-center text-gray-400">End of Section</div>}
                                        </div>
                                        
                                        {/* Turning Page */}
                                        <div className="absolute top-0 right-0 w-1/2 h-full origin-left transform-style-3d z-30 page-turn-next-enter shadow-2xl">
                                            <div 
                                                className="absolute inset-0 backface-hidden bg-[#fcfbfa] p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar border-l border-black/5 shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.1)]"
                                                style={{ transform: 'rotateY(0deg) translateZ(1px)' }}
                                            >
                                                {turningIndex === 0 ? React.cloneElement(pages[0], { onStart: handleNext }) : pages[turningIndex + 1]}
                                            </div>
                                            <div 
                                                className="absolute inset-0 backface-hidden bg-[#fcfbfa] p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar border-r border-black/5"
                                                style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
                                            >
                                                {pages[targetPageIndex]}
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                {/* PREV TURN:
                                    Base Left: New Left (targetPageIndex).
                                    Base Right: Old Right (turningIndex + 1).
                                    Turning Left: Front is Old Left, Back is New Right.
                                */}
                                {direction === 'prev' && (
                                    <>
                                        <div className="w-1/2 h-full border-r border-gray-200 p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar relative bg-[#fcfbfa] z-10">
                                            {targetPageIndex === 0 ? null : pages[targetPageIndex]}
                                        </div>
                                        <div className="w-1/2 h-full p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar relative bg-[#fcfbfa] z-10 shadow-[-10px_0_20px_-15px_rgba(0,0,0,0.1)]">
                                            {turningIndex === 0 ? null : pages[turningIndex + 1] || <div className="w-full h-full flex items-center justify-center text-gray-400">End of Section</div>}
                                        </div>
                                        
                                        {/* Turning Page */}
                                        <div className="absolute top-0 left-0 w-1/2 h-full origin-right transform-style-3d z-30 page-turn-prev-enter shadow-2xl">
                                            <div 
                                                className="absolute inset-0 backface-hidden bg-[#fcfbfa] p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar border-r border-black/5 shadow-[5px_0_15px_-5px_rgba(0,0,0,0.1)]"
                                                style={{ transform: 'rotateY(0deg) translateZ(1px)' }}
                                            >
                                                {turningIndex === 0 ? pages[0] : pages[turningIndex]}
                                            </div>
                                            <div 
                                                className="absolute inset-0 backface-hidden bg-[#fcfbfa] p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar border-l border-black/5"
                                                style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
                                            >
                                                {pages[targetPageIndex + (targetPageIndex === 0 ? 0 : 1)]}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                    </div>
                )}

                {/* Desktop Navigation Below Book */}
                {!isMobile && (
                    <div className="w-full md:max-w-4xl lg:max-w-6xl mt-6 flex justify-between items-center px-4 md:px-0 mx-auto">
                        <button 
                            onClick={handlePrev}
                            disabled={currentPageIndex === 0}
                            className="px-6 py-3 md:px-8 md:py-4 bg-white text-gray-700 border border-gray-300 shadow-sm rounded-xl hover:bg-gray-50 hover:text-[#0052A3] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-all text-base md:text-lg"
                        >
                            <ChevronLeft size={24} /> Previous
                        </button>
                        
                        <div className="text-gray-500 font-bold text-xs md:text-sm bg-white px-4 md:px-6 py-2.5 rounded-full shadow-sm border border-gray-200 whitespace-nowrap">
                            Page {Math.max(1, currentPageIndex)} of {Math.max(1, pages.length - 1)}
                        </div>

                        <button 
                            onClick={handleNext}
                            disabled={currentPageIndex + (currentPageIndex === 0 ? 1 : 2) >= pages.length && (currentPageIndex !== 0 || pages.length <= 1)}
                            className="px-8 py-3 md:px-10 md:py-4 bg-[#0052A3] text-white shadow-md rounded-xl hover:bg-[#004080] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 font-bold transition-all text-base md:text-lg"
                        >
                            Next <ChevronRight size={24} />
                        </button>
                    </div>
                )}

                {isMobile && (
                    <div className="w-full max-w-md h-[80vh] flex flex-col shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden bg-white relative border border-gray-100">
                        {/* Mobile 3D Page Turn Content Area */}
                        <div className="flex-1 relative perspective-[2000px] overflow-hidden bg-[#fcfbfa]">
                            {!animating ? (
                                <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar z-10 bg-[#fcfbfa]">
                                    {centerPage ? React.cloneElement(centerPage, { onStart: handleNext }) : null}
                                </div>
                            ) : (
                                <>
                                    {direction === 'next' && (
                                        <>
                                            {/* Base Layer: New Content */}
                                            <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar z-10 bg-[#fcfbfa]">
                                                {pages[targetPageIndex] ? React.cloneElement(pages[targetPageIndex], { onStart: handleNext }) : null}
                                            </div>
                                            {/* Turning Layer: Old Content */}
                                            <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar z-30 mobile-page-turn-next-enter shadow-[5px_0_15px_rgba(0,0,0,0.1)] border-r border-gray-100 bg-[#fcfbfa] backface-hidden transform-style-3d">
                                                {pages[turningIndex] ? React.cloneElement(pages[turningIndex], { onStart: handleNext }) : null}
                                            </div>
                                        </>
                                    )}
                                    {direction === 'prev' && (
                                        <>
                                            {/* Base Layer: Old Content */}
                                            <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar z-10 bg-[#fcfbfa]">
                                                {pages[turningIndex] ? React.cloneElement(pages[turningIndex], { onStart: handleNext }) : null}
                                            </div>
                                            {/* Turning Layer: New Content */}
                                            <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar z-30 mobile-page-turn-prev-enter shadow-[5px_0_15px_rgba(0,0,0,0.1)] border-r border-gray-100 bg-[#fcfbfa] backface-hidden transform-style-3d">
                                                {pages[targetPageIndex] ? React.cloneElement(pages[targetPageIndex], { onStart: handleNext }) : null}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div className="bg-gray-50/80 backdrop-blur border-t border-gray-100 p-4 flex justify-between items-center z-40 relative">
                            <button 
                                onClick={handlePrev}
                                disabled={currentPageIndex === 0}
                                className="px-2 sm:px-4 py-2 text-[#0052A3] disabled:text-gray-400 flex items-center gap-0.5 sm:gap-1 font-medium whitespace-nowrap"
                            >
                                <ChevronLeft size={18} /> Prev
                            </button>
                            <span className="text-xs sm:text-sm text-gray-500 font-bold px-3 sm:px-4 py-1.5 bg-gray-100 rounded-full border border-gray-200 shadow-sm whitespace-nowrap">
                                Page {Math.max(1, currentPageIndex)} of {pages.length - 1}
                            </span>
                            <button 
                                onClick={handleNext}
                                disabled={currentPageIndex >= pages.length - 1}
                                className="px-2 sm:px-4 py-2 text-[#0052A3] disabled:text-gray-400 flex items-center gap-0.5 sm:gap-1 font-medium whitespace-nowrap"
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        
            <style dangerouslySetInnerHTML={{__html: `
                .page-turn-next-enter {
                    animation: pageFlipNext 0.8s cubic-bezier(0.3, 0, 0.2, 1) forwards;
                    transform-origin: left center;
                }
                .page-turn-prev-enter {
                    animation: pageFlipPrev 0.8s cubic-bezier(0.3, 0, 0.2, 1) forwards;
                    transform-origin: right center;
                }
                @keyframes pageFlipNext {
                    0% { transform: rotateY(0deg); }
                    20% { transform: rotateY(-20deg) translateZ(10px) scale(1.02); }
                    80% { transform: rotateY(-160deg) translateZ(10px) scale(1.02); }
                    100% { transform: rotateY(-180deg); }
                }
                @keyframes pageFlipPrev {
                    0% { transform: rotateY(0deg); }
                    20% { transform: rotateY(20deg) translateZ(10px) scale(1.02); }
                    80% { transform: rotateY(160deg) translateZ(10px) scale(1.02); }
                    100% { transform: rotateY(180deg); }
                }
                .mobile-page-turn-next-enter {
                    animation: mobilePageFlipNext 0.8s cubic-bezier(0.3, 0, 0.2, 1) forwards;
                    transform-origin: left center;
                }
                .mobile-page-turn-prev-enter {
                    animation: mobilePageFlipPrev 0.8s cubic-bezier(0.3, 0, 0.2, 1) forwards;
                    transform-origin: left center;
                }
                @keyframes mobilePageFlipNext {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(-90deg); opacity: 0; }
                }
                @keyframes mobilePageFlipPrev {
                    0% { transform: rotateY(-90deg); opacity: 0; }
                    5% { opacity: 1; }
                    100% { transform: rotateY(0deg); opacity: 1; }
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                    -webkit-transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.2);
                }
            `}} />
        </div>
    );
};

export default BookShell;
