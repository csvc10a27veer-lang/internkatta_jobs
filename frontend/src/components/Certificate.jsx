import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';

const Certificate = ({ 
    type = 'internship', // 'internship' or 'course'
    title, 
    userName, 
    completedDate, 
    duration,
    category,
    onDownload 
}) => {
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isInternship = type === 'internship';
    const descText = isInternship 
        ? `This certificate recognizes the successful completion of the ${title || 'program'} internship, demonstrating practical learning, professional development, and applied technical skills.`
        : `This certificate recognizes the successful completion of the ${title || 'program'} course, demonstrating commitment to professional learning and technical skill development.`;

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* The Certificate Preview Box */}
            <div 
                className="bg-[#FDFBF7] border-[4px] sm:border-[8px] border-[#003366] rounded-sm p-2 sm:p-4 shadow-md relative overflow-hidden flex flex-col w-full mx-auto"
                style={{ aspectRatio: '1.414 / 1', maxWidth: '100%' }}
            >
                {/* Inner subtle border */}
                <div className="absolute inset-1 sm:inset-2 border border-[#003366]/20 rounded-sm pointer-events-none"></div>
                
                {/* Content wrapper - we use flex-grow to distribute space */}
                <div className="relative h-full flex flex-col items-center justify-between z-10 p-1 sm:p-2">
                    
                    {/* Header */}
                    <div className="text-center w-full mt-1 sm:mt-2">
                        <img src="/logo1.png" alt="InternKatta" className="h-3 sm:h-5 object-contain mx-auto mb-1 sm:mb-2" />
                        <h2 className="text-[10px] sm:text-[14px] font-serif text-[#003366] uppercase tracking-widest leading-none">Certificate</h2>
                        <p className="text-[7px] sm:text-[10px] font-serif text-[#003366] uppercase tracking-[0.2em] mt-0.5">Of Completion</p>
                    </div>

                    {/* Recipient */}
                    <div className="text-center w-full mt-1 sm:mt-2 px-4">
                        <p className="text-[5px] sm:text-[7px] font-sans tracking-widest text-gray-500 mb-1 sm:mb-2 uppercase">This certificate is proudly presented to</p>
                        <h3 className="text-xs sm:text-lg md:text-xl font-serif text-[#003366] italic px-4 sm:px-8 pb-0.5 sm:pb-1 border-b border-orange-400 inline-block max-w-full truncate">
                            {userName || 'Student Name'}
                        </h3>
                    </div>

                    {/* Program */}
                    <div className="text-center w-full mt-1 sm:mt-2 px-2 sm:px-6">
                        <p className="text-[5px] sm:text-[7px] font-sans tracking-widest text-gray-500 mb-0.5 sm:mb-1 uppercase">For successfully completing</p>
                        <h4 className="text-[9px] sm:text-sm md:text-base font-serif font-bold text-[#003366] max-w-full line-clamp-2 leading-snug">
                            {title || 'Program Name'}
                        </h4>
                        <p className="text-[4px] sm:text-[6px] font-sans text-gray-600 mt-1 sm:mt-2 leading-relaxed line-clamp-2 max-w-[90%] mx-auto">
                            {descText}
                        </p>
                    </div>

                    {/* Metadata Columns */}
                    <div className="w-full flex justify-between items-end mt-2 sm:mt-4 px-2 sm:px-8 relative z-20">
                        <div className="text-center flex-1">
                            <p className="text-[4px] sm:text-[5px] font-sans font-bold text-gray-400 tracking-wider mb-0.5 uppercase">{type} Duration</p>
                            <p className="text-[5px] sm:text-[7px] font-sans font-semibold text-[#003366]">{duration || 'Self-Paced'}</p>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-[4px] sm:text-[5px] font-sans font-bold text-gray-400 tracking-wider mb-0.5 uppercase">Issued Date</p>
                            <p className="text-[5px] sm:text-[7px] font-sans font-semibold text-[#003366]">{formatDate(completedDate)}</p>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-[4px] sm:text-[5px] font-sans font-bold text-gray-400 tracking-wider mb-0.5 uppercase">Certificate ID</p>
                            <p className="text-[5px] sm:text-[7px] font-sans font-semibold text-[#003366]">IK-XXXXXX-XXXXXX</p>
                        </div>
                    </div>

                    {/* Bottom Stamps (Absolute to ensure they sit at the bottom properly) */}
                    <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 w-full flex justify-between items-end px-2 sm:px-6 pointer-events-none opacity-80">
                        {/* Fake InternKatta Stamp */}
                        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full border border-gray-300 flex items-center justify-center rotate-[-15deg]">
                            <span className="text-[3px] sm:text-[4px] text-gray-400 text-center font-bold">InternKatta<br/>Seal</span>
                        </div>
                        
                        {/* Fake ISO Mark */}
                        <div className="w-6 h-6 sm:w-10 sm:h-10 flex items-center justify-center">
                            <img src="/ISO_Stamp.png" alt="ISO Certified" className="w-full h-full object-contain" />
                        </div>

                        {/* Fake QR */}
                        <div className="text-center">
                            <div className="w-5 h-5 sm:w-8 sm:h-8 bg-gray-200 flex items-center justify-center mx-auto mb-0.5">
                                <span className="text-[3px] sm:text-[4px] text-gray-500">QR</span>
                            </div>
                            <p className="text-[3px] sm:text-[4px] text-gray-400 tracking-widest leading-none font-bold">VERIFY</p>
                            <p className="text-[3px] sm:text-[4px] text-[#003366] leading-none mt-0.5 font-bold">www.internkatta.com</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Download Button */}
            {onDownload && (
                <button
                    onClick={onDownload}
                    className="w-full bg-[#0052A3] text-white font-bold py-2.5 px-4 rounded-lg hover:bg-[#004080] transition-colors shadow flex items-center justify-center gap-2 text-sm shrink-0"
                >
                    <ArrowDownTrayIcon className="h-4 w-4" /> Download Certificate
                </button>
            )}
        </div>
    );
};

export default Certificate;
