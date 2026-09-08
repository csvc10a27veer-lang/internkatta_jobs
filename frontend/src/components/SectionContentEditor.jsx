import React, { useState } from 'react';
import { Plus, Trash2, Upload, Image as ImageIcon, Type, AlignLeft, AlignRight } from 'lucide-react';

const SectionContentEditor = ({ content, onChange, sectionIndex, lectureIndex, onImageUpload }) => {
    const [sections, setSections] = useState(content || []);

    const handleSectionChange = (sectionIdx, field, value) => {
        const newSections = [...sections];
        newSections[sectionIdx] = { ...newSections[sectionIdx], [field]: value };
        setSections(newSections);
        onChange(newSections);
    };

    const addSection = () => {
        const newSections = [...sections, {
            id: Date.now(),
            type: 'text', // 'text' or 'image'
            content: '',
            image: null,
            imagePreview: null,
            alignment: sections.length % 2 === 0 ? 'left' : 'right' // Alternate alignment
        }];
        setSections(newSections);
        onChange(newSections);
    };

    const deleteSection = (sectionIdx) => {
        const newSections = sections.filter((_, idx) => idx !== sectionIdx);
        setSections(newSections);
        onChange(newSections);
    };

    const handleImageUpload = (sectionIdx, file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleSectionChange(sectionIdx, 'imagePreview', e.target.result);
                handleSectionChange(sectionIdx, 'type', 'image');
                
                // Store the file for upload
                if (onImageUpload) {
                    onImageUpload(sectionIndex, lectureIndex, sectionIdx, file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleAlignment = (sectionIdx) => {
        const currentAlignment = sections[sectionIdx].alignment;
        const newAlignment = currentAlignment === 'left' ? 'right' : 'left';
        handleSectionChange(sectionIdx, 'alignment', newAlignment);
    };

    const getPlaceholderImage = (index) => {
        // Return different placeholder images based on index
        const placeholders = [
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop'
        ];
        return placeholders[index % placeholders.length];
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">Content Sections</h4>
                <button
                    type="button"
                    onClick={addSection}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                </button>
            </div>

            {sections.map((section, sectionIdx) => (
                <div key={section.id || sectionIdx} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">
                                Section {sectionIdx + 1}
                            </span>
                            <button
                                type="button"
                                onClick={() => toggleAlignment(sectionIdx)}
                                className={`p-1 rounded ${
                                    section.alignment === 'left' 
                                        ? 'bg-blue-100 text-blue-600' 
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                                title={`Currently aligned ${section.alignment}`}
                            >
                                {section.alignment === 'left' ? <AlignLeft className="h-4 w-4" /> : <AlignRight className="h-4 w-4" />}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => deleteSection(sectionIdx)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Content Area */}
                        <div className={`${section.alignment === 'left' ? 'order-1' : 'order-2'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <Type className="h-4 w-4 text-gray-500" />
                                <label className="text-sm font-medium text-gray-700">Content</label>
                            </div>
                            <textarea
                                value={section.content}
                                onChange={(e) => handleSectionChange(sectionIdx, 'content', e.target.value)}
                                placeholder="Enter your content here..."
                                rows="6"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Image Area */}
                        <div className={`${section.alignment === 'left' ? 'order-2' : 'order-1'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <ImageIcon className="h-4 w-4 text-gray-500" />
                                <label className="text-sm font-medium text-gray-700">Image</label>
                            </div>
                            
                            {/* Image Preview */}
                            <div className="relative">
                                <img
                                    src={section.imagePreview || getPlaceholderImage(sectionIdx)}
                                    alt={`Section ${sectionIdx + 1}`}
                                    className="w-full h-48 object-cover rounded-md border border-gray-200"
                                />
                                {!section.imagePreview && (
                                    <div className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center">
                                        <div className="text-center text-gray-500">
                                            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                            <p className="text-sm">Placeholder Image</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Image Upload */}
                            <div className="mt-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(sectionIdx, e.target.files[0])}
                                    className="hidden"
                                    id={`image-upload-${sectionIndex}-${lectureIndex}-${sectionIdx}`}
                                />
                                <label
                                    htmlFor={`image-upload-${sectionIndex}-${lectureIndex}-${sectionIdx}`}
                                    className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {section.imagePreview ? 'Change Image' : 'Upload Image'}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Preview of how it will look */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                        <div className={`flex items-center space-x-4 ${section.alignment === 'right' ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700 line-clamp-3">
                                    {section.content || 'Your content will appear here...'}
                                </p>
                            </div>
                            <div className="w-20 h-16">
                                <img
                                    src={section.imagePreview || getPlaceholderImage(sectionIdx)}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {sections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No content sections yet. Click "Add Section" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default SectionContentEditor;
