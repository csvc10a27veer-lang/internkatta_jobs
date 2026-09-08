import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

/**
 * Hero component for homepage
 * - Subtle blue→purple gradient
 * - H1 = 40px
 * - Primary accent CTA and secondary CTA
 */
const Hero = ({ 
  title = "Unlock Your Potential with InternKatta",
  subtitle = "Your journey to a successful tech career starts here. Explore industry-relevant courses, hands-on internships, and specialized training programs.",
  primaryCTA = { text: "Explore Courses", link: "/courses" },
  secondaryCTA = { text: "Watch Video", link: "/internship" },
  className = ""
}) => {
  return (
    <section className={`relative bg-gradient-to-br from-brand-blue via-brand-blue to-brand-purple text-white overflow-hidden ${className}`}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full"></div>
      </div>
      
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-section-mobile md:py-section-tablet lg:py-section-desktop relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-h1 font-headline font-bold mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={primaryCTA.link}>
              <Button variant="accent" size="large">
                {primaryCTA.text}
              </Button>
            </Link>
            <Link to={secondaryCTA.link}>
              <Button variant="secondary" size="large" className="bg-white text-brand-blue border-white hover:bg-gray-100">
                {secondaryCTA.text}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

