import React from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating Component
 * Displays or allows selection of a 5-star rating
 * @param {number} rating - Current rating (0-5)
 * @param {function} onRatingChange - Callback when rating changes (for admin forms)
 * @param {boolean} interactive - Whether the rating can be changed (default: false for display)
 * @param {string} className - Additional CSS classes
 */
const StarRating = ({ 
  rating = 0, 
  onRatingChange = null, 
  interactive = false,
  className = '' 
}) => {
  const handleStarClick = (starIndex) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const handleStarHover = (starIndex) => {
    // Optional: Add hover effect for interactive ratings
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((index) => {
        const isFilled = index < rating;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(index)}
            onMouseEnter={() => handleStarHover(index)}
            disabled={!interactive}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
              ${isFilled ? 'text-yellow-400' : 'text-gray-300'}
              disabled:opacity-100
            `}
            aria-label={`${index + 1} star${index + 1 !== 1 ? 's' : ''}`}
          >
            <Star 
              size={interactive ? 24 : 16} 
              fill={isFilled ? 'currentColor' : 'none'}
              className="transition-colors"
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-1 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;























