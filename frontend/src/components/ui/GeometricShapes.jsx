import React from 'react';

/**
 * Inline SVG Geometric Shapes for Hero Mosaic
 * All shapes are optimized for performance and accessibility
 */

// Circle shape
export const Circle = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <circle cx="80" cy="80" r="80" fill={color} />
  </svg>
);

// Rounded Square
export const RoundedSquare = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <rect x="0" y="0" width="160" height="160" rx="12" ry="12" fill={color} />
  </svg>
);

// Rounded Rectangle (horizontal)
export const RoundedRectangle = ({ color, width = 160, height = 160, className = '', style = {} }) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <rect x="0" y="0" width={width} height={height} rx="12" ry="12" fill={color} />
  </svg>
);

// Half Circle (vertical - top half)
export const HalfCircleTop = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <path d="M 0 80 A 80 80 0 0 1 160 80 L 160 0 L 0 0 Z" fill={color} />
  </svg>
);

// Half Circle (vertical - bottom half)
export const HalfCircleBottom = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <path d="M 0 80 A 80 80 0 0 0 160 80 L 160 160 L 0 160 Z" fill={color} />
  </svg>
);

// Pill shape (horizontal)
export const Pill = ({ color, width = 160, height = 160, className = '', style = {} }) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <rect x="0" y="0" width={width} height={height} rx="80" ry="80" fill={color} />
  </svg>
);

// Tall Pill (vertical pill)
export const TallPill = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <rect x="0" y="0" width="160" height="160" rx="80" ry="80" fill={color} />
  </svg>
);

// Tall Arch (D-shape, flat on left, rounded on right)
export const TallArch = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <path d="M 0 0 L 0 160 L 80 160 A 80 80 0 0 0 80 0 Z" fill={color} />
  </svg>
);

// Half Circle (horizontal half - left side)
export const HalfCircle = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <path d="M 80 0 A 80 80 0 0 1 80 160 L 0 160 L 0 0 Z" fill={color} />
  </svg>
);

// Wide Pill (horizontal pill)
export const WidePill = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <rect x="0" y="0" width="160" height="160" rx="80" ry="80" fill={color} />
  </svg>
);

// Rounded Blob (large rounded block with more rounded corners)
export const RoundedBlob = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <rect x="0" y="0" width="160" height="160" rx="24" ry="24" fill={color} />
  </svg>
);

// D-Shape (rounded on left, straight on right) - like a D rotated
export const DShape = ({ color, size = 160, className = '', style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 160 160"
    className={className}
    style={style}
    role="img"
    aria-hidden="true"
  >
    <path d="M 0 80 A 80 80 0 0 0 0 0 L 160 0 L 160 160 L 0 160 A 80 80 0 0 0 0 80 Z" fill={color} />
  </svg>
);

// Stat Tile Component (supports both square and circle)
export const StatTile = ({ value, label, bgColor, textColor = '#FFFFFF', size = 160, shape = 'square', className = '', style = {} }) => {
  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: bgColor,
    color: textColor,
    ...style,
  };

  const containerClass = shape === 'circle' 
    ? `rounded-full flex flex-col items-center justify-center ${className}`
    : `rounded-[12px] flex flex-col items-center justify-center ${className}`;

  return (
    <div
      className={containerClass}
      style={baseStyle}
      role="img"
      aria-label={`${value} ${label}`}
    >
      <div className="font-headline font-bold text-3xl mb-1" style={{ fontFamily: 'var(--font-headline, Poppins)' }}>
        {value}
      </div>
      <div className="text-xs text-center px-2" style={{ fontFamily: 'var(--font-body, Inter)' }}>
        {label}
      </div>
    </div>
  );
};

