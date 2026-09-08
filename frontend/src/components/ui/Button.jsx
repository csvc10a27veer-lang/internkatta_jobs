import React from 'react';

/**
 * Button component following InternKatta design system
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  className = '',
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-brand-blue text-white hover:bg-brand-blue-700 focus:ring-brand-blue',
    secondary: 'bg-white text-brand-blue border border-border hover:bg-surface focus:ring-brand-blue',
    accent: 'bg-accent-orange text-white hover:bg-orange-500 focus:ring-accent-orange',
  };
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm rounded-button',
    default: 'px-6 py-3 text-body rounded-button',
    large: 'px-8 py-4 text-base rounded-hero-cta',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

