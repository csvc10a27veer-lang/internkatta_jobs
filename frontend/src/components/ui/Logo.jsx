import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';

const Logo = ({ className = "", onClick }) => {
  const navigate = useNavigate();
  const { navigateWithLoading } = useNavigationWithLoading();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigateWithLoading("/");
    }
  };

  return (
    <div 
      className={`flex items-center cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Logo Image */}
      <img
        src="/logo2-transparent.png"
        alt="InternKatta Logo"
        className="h-10 sm:h-12 md:h-14 w-auto object-contain"
      />
      
      {/* Text Block */}
      <div className="ml-2 sm:ml-3 flex flex-col justify-center">
        {/* Brand Name */}
        <div className="flex items-center">
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#0052A3]">
            Intern
          </span>
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#f97316]">
            Katta
          </span>
        </div>
        
        {/* Tagline */}
        <span className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium tracking-wide mt-0.5">
          Intern <strong>Smarter</strong>, Grow <strong>Faster</strong>
        </span>
      </div>
    </div>
  );
};

export default Logo;

