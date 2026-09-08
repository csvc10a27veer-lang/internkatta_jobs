import React, { useEffect } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const Brochure = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <section className="py-20 text-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <DocumentTextIcon className="h-24 w-24 text-[#0052A3] mx-auto mb-8" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Brochure <span className="text-[#FF8C42]">Coming Soon</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            We're working on creating an amazing brochure for you. Check back soon!
          </p>
        </div>
      </section>
    </div>
  );
};

export default Brochure;









