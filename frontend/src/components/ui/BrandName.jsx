import React from 'react';

/**
 * BrandName Component
 * Renders "InternKatta" with "Intern" in blue (#0052A3) and "Katta" in orange color
 * @param {string} className - Additional CSS classes
 * @param {string} internColor - Color for "Intern" part (default: #0052A3)
 * @param {string} kattaColor - Color for "Katta" part (default: #FF8C42)
 */
const BrandName = ({ 
  className = '', 
  internColor = '#0052A3',
  kattaColor = '#FF8C42' 
}) => {
  return (
    <span className={className}>
      <span style={{ color: internColor }}>Intern</span>
      <span style={{ color: kattaColor }}>Katta</span>
    </span>
  );
};

export default BrandName;


