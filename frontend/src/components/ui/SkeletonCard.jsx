import React from 'react';

/**
 * Skeleton loader for internship/course cards
 * Matches the structure of the actual card component
 */
const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="w-full h-[140px] bg-gray-200"></div>
      
      <div className="p-4 space-y-3">
        {/* Category tag skeleton */}
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-gray-200 rounded"></div>
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
        </div>
        
        {/* Meta info skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        
        {/* Price and actions skeleton */}
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for listing grid
 */
export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default SkeletonCard;

