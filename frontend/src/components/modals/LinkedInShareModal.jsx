import React, { useState } from 'react';
import toast from 'react-hot-toast';

function LinkedInShareModal({ isOpen, onClose, certificate, verificationUrl }) {
    if (!isOpen || !certificate) return null;

    const courseTitle = certificate.courseTitle || 'program';
    
    // Default text for the post
    const defaultText = `I'm excited to share that I have successfully completed the ${courseTitle} at Fourise Software Solutions Pvt. Ltd.\n\nCredential ID: ${certificate.certificateId || (certificate._id ? certificate._id.slice(-8) : '')}\n\nVerify Certificate:\n${verificationUrl}\n\n#InternKatta #FouriseSoftware #Certification #${courseTitle.replace(/\s+/g, '')}`;

    const [postText, setPostText] = useState(defaultText);

    const handleContinue = async () => {
        try {
            await navigator.clipboard.writeText(postText);
            toast.success("Text copied to clipboard!");
            
            // Open LinkedIn share URL
            const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
            window.open(linkedinShareUrl, '_blank');
            
            onClose();
        } catch (err) {
            console.error("Failed to copy text: ", err);
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = postText;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success("Text copied to clipboard!");
                const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
                window.open(linkedinShareUrl, '_blank');
                onClose();
            } catch (fallbackErr) {
                toast.error("Failed to copy. Please manually copy the text.");
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#0a66c2] text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        Share on LinkedIn
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <p className="text-gray-600 mb-4 text-sm">
                        LinkedIn doesn't allow apps to pre-fill posts automatically. Review and edit your post below. 
                        When you click <strong>Continue</strong>, we will copy this text and open LinkedIn. You can then just paste it!
                    </p>
                    
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Post Content
                    </label>
                    <textarea 
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a66c2] focus:border-[#0a66c2] min-h-[160px] text-sm text-gray-800 font-sans resize-y bg-gray-50"
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                    />

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex gap-4 items-start">
                            <div className="bg-white p-1 shadow-sm border border-gray-200 rounded shrink-0">
                                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{courseTitle} Certificate</p>
                                <p className="text-xs text-gray-500 truncate">{verificationUrl}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleContinue}
                        className="px-5 py-2.5 text-white bg-[#0a66c2] font-semibold rounded-lg hover:bg-[#004182] shadow-md transition-colors flex items-center gap-2"
                    >
                        Copy & Continue to LinkedIn
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LinkedInShareModal;
