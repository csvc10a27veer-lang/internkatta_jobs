// frontend/src/admin/ManageCategories.jsx

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit3, Trash2, Check, X } from 'lucide-react';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for handling inline editing
    const [editingItem, setEditingItem] = useState(null); // Will store the whole category object
    const [editingText, setEditingText] = useState('');

    // Fetch categories from the API on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/api/categories');
                setCategories(response.data);
                setError('');
            } catch (err) {
                setError('Failed to fetch categories.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            alert('Category name cannot be empty.');
            return;
        }
        try {
            const response = await api.post('/api/categories', { name: newCategory.trim() });
            setCategories([response.data, ...categories]); // Add new category to the top of the list
            setNewCategory(''); // Clear input
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add category.');
        }
    };
    
    const handleDeleteCategory = async (categoryToDelete) => {
        if (window.confirm(`Are you sure you want to delete the category: "${categoryToDelete.name}"?`)) {
            try {
                await api.delete(`/api/categories/${categoryToDelete._id}`);
                setCategories(categories.filter(cat => cat._id !== categoryToDelete._id));
            } catch (err) {
                alert('Failed to delete category.');
            }
        }
    };

    const handleEditStart = (category) => {
        setEditingItem(category);
        setEditingText(category.name);
    };

    const handleEditCancel = () => {
        setEditingItem(null);
        setEditingText('');
    };

    const handleEditSave = async () => {
        if (!editingText.trim() || !editingItem) {
            alert('Category name cannot be empty.');
            return;
        }
        try {
            const response = await api.put(`/api/categories/${editingItem._id}`, { name: editingText.trim() });
            setCategories(categories.map(cat => cat._id === editingItem._id ? response.data : cat));
            handleEditCancel(); // Reset editing state
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update category.');
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading categories...</div>;
    }
    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>
    }

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Internship Categories</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add a new category (e.g., Cybersecurity)"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <button type="submit" className="flex items-center justify-center gap-2 px-5 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors">
                        <Plus size={20} /> Add Category
                    </button>
                </form>
            </div>
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-700">Existing Categories ({categories.length})</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                    {categories.map((category) => (
                        <li key={category._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            {editingItem?._id === category._id ? (
                                <div className="flex-grow flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="flex-grow px-3 py-1 border border-sky-500 rounded-md"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                    />
                                    <button onClick={handleEditSave} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><Check size={18}/></button>
                                    <button onClick={handleEditCancel} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><X size={18}/></button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-gray-800 font-medium">{category.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEditStart(category)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit"><Edit3 size={16} /></button>
                                        <button onClick={() => handleDeleteCategory(category)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ManageCategories;