import React from 'react';

const Preloader = () => {
  return (
    <>
      {/* Custom CSS for dot sequence animation */}
      <style>
        {`
          @keyframes dotSequence {
            0%, 20% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.3);
              opacity: 0.7;
            }
            80%, 100% { 
              transform: scale(1);
              opacity: 1;
            }
          }
          .dot-1 {
            animation: dotSequence 1.2s infinite;
            animation-delay: 0ms;
          }
          .dot-2 {
            animation: dotSequence 1.2s infinite;
            animation-delay: 400ms;
          }
          .dot-3 {
            animation: dotSequence 1.2s infinite;
            animation-delay: 800ms;
          }
        `}
      </style>
      
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Dots with Custom Animation */}
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full dot-1"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full dot-2"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full dot-3"></div>
          </div>
          
          {/* Loading Text */}
          <p className="text-blue-600 font-semibold text-lg animate-pulse">Loading...</p>
        </div>
      </div>
    </>
  );
};

export default Preloader;
