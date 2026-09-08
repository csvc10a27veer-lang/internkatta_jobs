import React from 'react';

/**
 * Tag/Chip component for categories, difficulty, and metadata
 * Small, pill-shaped tags as per design system
 */
const TagChip = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors';
  
  const variantClasses = {
    default: 'bg-surface text-muted border border-border',
    primary: 'bg-brand-blue text-white',
    accent: 'bg-accent-orange text-white',
    muted: 'bg-gray-100 text-gray-700',
  };
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs h-6',
    default: 'px-3 py-1 text-small h-7',
    large: 'px-4 py-1.5 text-sm h-8',
  };
  
  return (
    <span 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} rounded-full ${className}`}
    >
      {children}
    </span>
  );
};

export default TagChip;

