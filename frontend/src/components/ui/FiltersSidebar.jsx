import React, { useState } from 'react';
import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Filters Sidebar component
 * - Collapsible groups: Category, Duration, Price, Difficulty
 * - Show selected counts
 * - Clear All control
 * - Sticky on desktop
 */
const FiltersSidebar = ({
  categories = [],
  selectedCategories = [],
  selectedDurations = [],
  selectedPriceRanges = [],
  selectedDifficulties = [],
  showDifficulty = false,
  onCategoryToggle,
  onDurationToggle,
  onPriceToggle,
  onDifficultyToggle,
  onClearFilters,
  onClose,
  isOpen = true,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    difficulty: false,
    duration: false,
    price: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const durationRanges = ['1 Month', '3 Months', '6 Months'];
  const priceRanges = ['₹99 - ₹499', '₹499 - ₹999', '₹999 - ₹1499', '₹1499 - ₹1999'];

  const getSelectedCount = (section) => {
    switch (section) {
      case 'category':
        return selectedCategories.length;
      case 'duration':
        return selectedDurations.length;
      case 'price':
        return selectedPriceRanges.length;
      case 'difficulty':
        return selectedDifficulties.length;
      default:
        return 0;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:sticky inset-y-0 left-0 z-40 w-72 bg-white shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:top-6 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="text-h3 font-headline font-semibold text-text">Filters</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
              aria-label="Close filters"
            >
              <XMarkIcon className="h-5 w-5 text-text" />
            </button>
          </div>

          {/* Clear Filters */}
          <div className="mb-4">
            <button
              onClick={onClearFilters}
              className="w-full px-3 py-2 text-sm font-medium text-white bg-[#FF7A1A] rounded-lg hover:bg-[#e66a15] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7A1A] focus:ring-offset-2"
            >
              Clear All Filters
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('category')}
              className="flex items-center justify-between w-full mb-2 text-small font-semibold text-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded"
            >
              <span>Category {getSelectedCount('category') > 0 && `(${getSelectedCount('category')})`}</span>
              <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedSections.category ? 'rotate-90' : ''}`} />
            </button>
            {expandedSections.category && (
              <div className="space-y-1.5">
                {categories.map(category => (
                  <label key={category._id || category.name} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => onCategoryToggle(category.name)}
                      className="h-4 w-4 accent-[#FF7A1A] rounded border-gray-300 focus:ring-[#FF7A1A] cursor-pointer"
                    />
                    <span className="ml-2 text-small text-text">{category?.name || 'Unknown Category'}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty Filter */}
          {showDifficulty && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection('difficulty')}
                className="flex items-center justify-between w-full mb-2 text-small font-semibold text-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded"
              >
                <span>Difficulty Level {getSelectedCount('difficulty') > 0 && `(${getSelectedCount('difficulty')})`}</span>
                <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedSections.difficulty ? 'rotate-90' : ''}`} />
              </button>
              {expandedSections.difficulty && (
                <div className="space-y-1.5">
                  {difficultyLevels.map(level => (
                    <label key={level} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDifficulties.includes(level)}
                        onChange={() => onDifficultyToggle(level)}
                        className="h-4 w-4 accent-[#FF7A1A] rounded border-gray-300 focus:ring-[#FF7A1A] cursor-pointer"
                      />
                      <span className="ml-2 text-small text-text">{level}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Duration Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('duration')}
              className="flex items-center justify-between w-full mb-2 text-small font-semibold text-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded"
            >
              <span>Duration {getSelectedCount('duration') > 0 && `(${getSelectedCount('duration')})`}</span>
              <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedSections.duration ? 'rotate-90' : ''}`} />
            </button>
            {expandedSections.duration && (
              <div className="space-y-1.5">
                {durationRanges.map(range => (
                  <label key={range} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDurations.includes(range)}
                      onChange={() => onDurationToggle(range)}
                      className="h-4 w-4 accent-[#FF7A1A] rounded border-gray-300 focus:ring-[#FF7A1A] cursor-pointer"
                    />
                    <span className="ml-2 text-small text-text">{range}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full mb-2 text-small font-semibold text-text focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 rounded"
            >
              <span>Price Range {getSelectedCount('price') > 0 && `(${getSelectedCount('price')})`}</span>
              <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedSections.price ? 'rotate-90' : ''}`} />
            </button>
            {expandedSections.price && (
              <div className="space-y-1.5">
                {priceRanges.map(range => (
                  <label key={range} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(range)}
                      onChange={() => onPriceToggle(range)}
                      className="h-4 w-4 accent-[#FF7A1A] rounded border-gray-300 focus:ring-[#FF7A1A] cursor-pointer"
                    />
                    <span className="ml-2 text-small text-text">{range}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FiltersSidebar;

