import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
    Folder, 
    Image as ImageIcon, 
    Upload, 
    Trash2, 
    Plus, 
    Loader2,
    X
} from 'lucide-react';

const ManageCategoryImages = () => {
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [deletingImage, setDeletingImage] = useState(null);

    // Fetch folders on component mount
    useEffect(() => {
        fetchFolders();
    }, []);

    // Fetch images when folder is selected
    useEffect(() => {
        if (selectedFolder) {
            fetchImages(selectedFolder);
        } else {
            setImages([]);
        }
    }, [selectedFolder]);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/category-folders');
            if (response.data.success) {
                setFolders(response.data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
            toast.error('Failed to fetch folders');
        } finally {
            setLoading(false);
        }
    };

    const fetchImages = async (folderName) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/admin/category-images/${encodeURIComponent(folderName)}`);
            if (response.data.success) {
                // Handle both old format (array of strings) and new format (array of objects)
                const imageList = response.data.images || [];
                const formattedImages = imageList.map(img => {
                    if (typeof img === 'string') {
                        return {
                            name: img.split('/').pop(),
                            path: img
                        };
                    }
                    return img;
                });
                setImages(formattedImages);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            toast.error('Failed to fetch images');
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!selectedFolder) {
            toast.error('Please select a folder first');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image size must be less than 10MB');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', selectedFolder);

        try {
            setUploading(true);
            const response = await api.post('/api/admin/category-images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success('Image uploaded successfully');
                // Refresh images list
                fetchImages(selectedFolder);
                // Reset file input
                e.target.value = '';
            } else {
                toast.error(response.data.message || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageName) => {
        if (!window.confirm(`Are you sure you want to delete "${imageName}"?`)) {
            return;
        }

        try {
            setDeletingImage(imageName);
            const response = await api.delete(`/api/admin/category-images/${encodeURIComponent(selectedFolder)}/${encodeURIComponent(imageName)}`);

            if (response.data.success) {
                toast.success('Image deleted successfully');
                // Refresh images list
                fetchImages(selectedFolder);
            } else {
                toast.error(response.data.message || 'Failed to delete image');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error(error.response?.data?.message || 'Failed to delete image');
        } finally {
            setDeletingImage(null);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            toast.error('Please enter a folder name');
            return;
        }

        try {
            const response = await api.post('/api/admin/category-folders/create', {
                folderName: newFolderName.trim()
            });

            if (response.data.success) {
                toast.success('Folder created successfully');
                setShowNewFolderModal(false);
                setNewFolderName('');
                // Refresh folders list
                fetchFolders();
                // Select the newly created folder
                setSelectedFolder(response.data.folderName);
            } else {
                toast.error(response.data.message || 'Failed to create folder');
            }
        } catch (error) {
            console.error('Error creating folder:', error);
            toast.error(error.response?.data?.message || 'Failed to create folder');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Category Images</h1>
                <p className="text-gray-600">Upload, delete, and organize images in category folders</p>
            </div>

            {/* Create New Folder Button */}
            <div className="mb-6">
                <button
                    onClick={() => setShowNewFolderModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Create New Folder
                </button>
            </div>

            {/* New Folder Modal */}
            {showNewFolderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Create New Folder</h2>
                            <button
                                onClick={() => {
                                    setShowNewFolderModal(false);
                                    setNewFolderName('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Folder Name
                            </label>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Enter folder name (letters, numbers, hyphens, underscores only)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreateFolder();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowNewFolderModal(false);
                                    setNewFolderName('');
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFolder}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Folders List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Folder size={24} />
                        Folders
                    </h2>
                    {loading && folders.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-blue-600" size={24} />
                        </div>
                    ) : folders.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No folders found</p>
                    ) : (
                        <div className="space-y-2">
                            {folders.map((folder) => (
                                <button
                                    key={folder}
                                    onClick={() => setSelectedFolder(folder)}
                                    className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                                        selectedFolder === folder
                                            ? 'bg-blue-100 text-blue-700 font-semibold'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {folder}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Images List */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <ImageIcon size={24} />
                            Images
                            {selectedFolder && (
                                <span className="text-sm font-normal text-gray-500">
                                    ({selectedFolder})
                                </span>
                            )}
                        </h2>
                        {selectedFolder && (
                            <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer transition-colors">
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        Upload Image
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {!selectedFolder ? (
                        <div className="text-center py-12 text-gray-500">
                            <Folder size={48} className="mx-auto mb-4 text-gray-400" />
                            <p>Please select a folder to view images</p>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
                            <p>No images in this folder</p>
                            <p className="text-sm mt-2">Upload an image to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={image.path}
                                            alt={image.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                    <div className="p-2 bg-white">
                                        <p className="text-xs text-gray-600 truncate" title={image.name}>
                                            {image.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteImage(image.name)}
                                        disabled={deletingImage === image.name}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                                        title="Delete image"
                                    >
                                        {deletingImage === image.name ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCategoryImages;


