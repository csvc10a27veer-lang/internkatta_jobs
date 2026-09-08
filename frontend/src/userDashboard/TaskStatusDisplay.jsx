import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const TaskStatusDisplay = ({ activeProgress, activeLecture, handleTaskSubmit }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    
    const handleFileChange = async (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const files = Array.from(event.target.files);
            
            if (files.length > 5) {
                toast.error('You can only upload up to 5 files.');
                return;
            }
            
            // Check file size (10MB limit per file)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            for (let file of files) {
                if (file.size > maxSize) {
                    toast.error(`File ${file.name} is too large! Please select files smaller than 10MB.`);
                    return;
                }
            }
            
            setSelectedFiles(files);
        }
    };
    
    const submitTask = async () => {
        if (selectedFiles.length > 0) {
            setIsUploading(true);
            await handleTaskSubmit(activeLecture._id, selectedFiles);
            setIsUploading(false);
            setSelectedFiles([]);
        }
    };

    switch (activeProgress?.status) {
        case 'Pending': 
            return (
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Clock size={16} />
                    Pending Approval
                </div>
            );
        case 'Approved': 
        case 'Completed': 
            return (
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle size={16} />
                    Task Approved
                </div>
            );
        case 'Rejected': 
            return (
                <div className="flex flex-col items-center gap-3 w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-red-100 text-red-800 border border-red-200">
                        <AlertTriangle size={16} />
                        Task Rejected
                    </div>
                    {selectedFiles.length > 0 ? (
                        <div className="flex flex-col items-center gap-3 w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-700">Selected {selectedFiles.length} file(s)</span>
                            <div className="flex gap-2 w-full">
                                <button 
                                    onClick={() => setSelectedFiles([])}
                                    className="flex-1 py-2 text-sm font-semibold rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={submitTask}
                                    className="flex-1 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#0052A3] to-[#004080] hover:from-[#004080] hover:to-[#003366] disabled:bg-gray-400 shadow-sm transition-colors"
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Submit Task'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label 
                            htmlFor={`file-upload-${activeLecture._id}`} 
                            className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <Upload size={16} />
                            Select Document to Re-submit
                        </label>
                    )}
                    <input 
                        type="file" 
                        id={`file-upload-${activeLecture._id}`} 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={isUploading} 
                        multiple 
                        accept=".pdf,.zip,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv" 
                    />
                </div>
            );
        default: 
            return (
                <div className="flex flex-col items-center gap-3 w-full">
                    {selectedFiles.length > 0 ? (
                        <div className="flex flex-col items-center gap-3 w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <span className="text-sm font-medium text-gray-700">Selected {selectedFiles.length} file(s)</span>
                            <div className="flex gap-2 w-full">
                                <button 
                                    onClick={() => setSelectedFiles([])}
                                    className="flex-1 py-2 text-sm font-semibold rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={submitTask}
                                    className="flex-1 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#0052A3] to-[#004080] hover:from-[#004080] hover:to-[#003366] disabled:bg-gray-400 shadow-sm transition-colors"
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Submit Task'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label 
                            htmlFor={`file-upload-${activeLecture._id}`} 
                            className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#0052A3] to-[#004080] hover:from-[#004080] hover:to-[#003366] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <Upload size={16} />
                            Select Document
                        </label>
                    )}
                    <input 
                        type="file" 
                        id={`file-upload-${activeLecture._id}`} 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={isUploading} 
                        multiple 
                        accept=".pdf,.zip,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv" 
                    />
                </div>
            );
    }
};

export default TaskStatusDisplay;
