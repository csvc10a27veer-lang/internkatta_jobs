import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const CategoryCarousel = ({ categories, selectedCategories, onCategoryToggle, onViewAll }) => {
    const [startIndex, setStartIndex] = useState(0);
    const visibleCategories = categories.slice(startIndex, startIndex + 5);

    const nextCategories = () => {
        if (startIndex + 5 < categories.length) {
            setStartIndex(startIndex + 1);
        }
    };

    const prevCategories = () => {
        if (startIndex > 0) {
            setStartIndex(startIndex - 1);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            {/* Fixed left section - Title */}
            <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap flex-shrink-0">Explore by Category</h2>
            
            {/* Fixed right section - View All Categories button */}
            <button
                onClick={onViewAll}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-600 rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0 order-3 sm:order-3"
            >
                View All Categories
            </button>
            
            {/* Middle section - Carousel with arrows */}
            <div className="flex items-center gap-2 flex-1 min-w-0 order-2">
                <button
                    onClick={prevCategories}
                    disabled={startIndex === 0}
                    className="p-1.5 rounded-full bg-white border border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                    <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
                </button>
                
                <div className="flex gap-1.5 overflow-hidden flex-1 justify-center min-w-0">
                    {visibleCategories.map(category => (
                        <button
                            key={category._id || category.name}
                            onClick={() => onCategoryToggle(category.name)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                                selectedCategories.includes(category.name)
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                            }`}
                        >
                            {category?.name || 'Unknown Category'}
                        </button>
                    ))}
                </div>
                
                <button
                    onClick={nextCategories}
                    disabled={startIndex + 5 >= categories.length}
                    className="p-1.5 rounded-full bg-white border border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                    <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                </button>
            </div>
        </div>
    );
};

export default CategoryCarousel;
