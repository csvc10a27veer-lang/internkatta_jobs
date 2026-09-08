import React, { useState, useEffect } from 'react';
import { TrashIcon, CheckCircleIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import api, { getImageUrl } from '../utils/api';
import ErrorBoundary from '../components/ErrorBoundary';
import toast from 'react-hot-toast';

const AdminQA = () => {
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyTexts, setReplyTexts] = useState({});
    const [postingReplyId, setPostingReplyId] = useState(null);

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/discussions/admin/all');
            setDiscussions(response.data);
        } catch (err) {
            console.error('Error fetching discussions:', err);
            setError('Failed to fetch discussions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReplyChange = (discussionId, text) => {
        setReplyTexts(prev => ({ ...prev, [discussionId]: text }));
    };

    const handlePostReply = async (discussionId) => {
        const text = replyTexts[discussionId];
        if (!text || text.trim() === '') return;

        setPostingReplyId(discussionId);
        try {
            const response = await api.post(`/api/discussions/admin/${discussionId}/reply`, {
                text: text.trim()
            });
            // Update the discussion in local state with the new data
            setDiscussions(prev => prev.map(d => d._id === discussionId ? response.data : d));
            
            // Clear the reply input
            setReplyTexts(prev => {
                const newTexts = { ...prev };
                delete newTexts[discussionId];
                return newTexts;
            });
            toast.success("Reply posted successfully!");
        } catch (error) {
            console.error('Error posting admin reply:', error);
            toast.error('Failed to post reply.');
        } finally {
            setPostingReplyId(null);
        }
    };

    const handleDeleteDiscussion = async (discussionId) => {
        if (!window.confirm('Are you sure you want to delete this discussion and all its replies?')) return;
        try {
            await api.delete(`/api/discussions/admin/${discussionId}`);
            setDiscussions(prev => prev.filter(d => d._id !== discussionId));
            toast.success("Discussion deleted.");
        } catch (error) {
            console.error('Error deleting discussion:', error);
            toast.error('Failed to delete discussion.');
        }
    };

    const handleDeleteReply = async (discussionId, replyId) => {
        if (!window.confirm('Are you sure you want to delete this reply?')) return;
        try {
            await api.delete(`/api/discussions/admin/${discussionId}/reply/${replyId}`);
            setDiscussions(prev => prev.map(d => {
                if (d._id === discussionId) {
                    return { ...d, replies: d.replies.filter(r => r._id !== replyId) };
                }
                return d;
            }));
            toast.success("Reply deleted.");
        } catch (error) {
            console.error('Error deleting reply:', error);
            toast.error('Failed to delete reply.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-600">{error}</p>
                <button onClick={fetchDiscussions} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center mb-6 gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Course Q&A Management</h1>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden p-6 border border-gray-200">
                {discussions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p>No questions have been asked yet.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {discussions.map(discussion => (
                            <div key={discussion._id} className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shadow-sm">
                                {/* Header / Question */}
                                <div className="p-5 border-b border-gray-200 bg-white relative group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3 mb-3">
                                            {discussion.userId?.profilePicture ? (
                                                <img src={getImageUrl(discussion.userId.profilePicture)} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-300" />
                                            ) : (
                                                <UserCircleIcon className="w-10 h-10 text-gray-400" />
                                            )}
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{discussion.userId?.fullName || 'Unknown User'}</h4>
                                                <p className="text-xs text-gray-500">
                                                    Course: <span className="font-medium text-blue-600">{discussion.courseId?.title || 'Unknown Course'}</span>
                                                </p>
                                                <p className="text-xs text-gray-400">{new Date(discussion.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteDiscussion(discussion._id)}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-red-50"
                                            title="Delete thread"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <p className="text-gray-700 mt-2 text-sm md:text-base leading-relaxed pl-13">
                                        {discussion.question}
                                    </p>
                                </div>

                                {/* Replies */}
                                <div className="p-5 pl-12 sm:pl-16 space-y-4">
                                    {discussion.replies.map(reply => {
                                        const isInstructor = !!reply.adminId;
                                        const author = isInstructor ? reply.adminId : reply.userId;
                                        const authorName = isInstructor ? (author?.fullName || 'Instructor') : (author?.fullName || 'Unknown');
                                        const authorPic = author?.profilePicture;

                                        return (
                                            <div key={reply._id} className="relative group bg-white border border-gray-100 p-3 rounded-lg shadow-sm flex items-start space-x-3">
                                                {authorPic ? (
                                                    <img src={getImageUrl(authorPic)} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                                ) : (
                                                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-800 text-sm">{authorName}</span>
                                                        {isInstructor && (
                                                            <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                                <CheckCircleIcon className="w-3 h-3" /> Instructor
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-400">&bull; {new Date(reply.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-gray-600 mt-1 text-sm">{reply.text}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteReply(discussion._id, reply._id)}
                                                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-50 shrink-0"
                                                    title="Delete reply"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* Admin Reply Box */}
                                    <div className="flex items-start space-x-3 mt-4">
                                        <UserCircleIcon className="w-8 h-8 text-blue-500 mt-1" />
                                        <div className="flex-1">
                                            <textarea
                                                className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-shadow bg-white"
                                                placeholder="Write a reply as an instructor..."
                                                rows="2"
                                                value={replyTexts[discussion._id] || ''}
                                                onChange={(e) => handleReplyChange(discussion._id, e.target.value)}
                                            ></textarea>
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={() => handlePostReply(discussion._id)}
                                                    disabled={!replyTexts[discussion._id]?.trim() || postingReplyId === discussion._id}
                                                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-sm"
                                                >
                                                    {postingReplyId === discussion._id ? 'Posting...' : 'Reply'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminQAWithErrorBoundary = () => (
    <ErrorBoundary>
        <AdminQA />
    </ErrorBoundary>
);

export default AdminQAWithErrorBoundary;
