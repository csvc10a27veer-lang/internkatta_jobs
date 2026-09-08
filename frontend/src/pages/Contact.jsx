import React, { useEffect } from 'react';
import ContactSection from '../components/ui/ContactSection';
import api from '../utils/api';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';

const Contact = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleSubmit = async (formData) => {
    const response = await api.post('/api/contact/submit', formData);
    if (!response.data.success) {
      throw new Error('Submission failed');
    }
    return response.data;
  };

  const contactStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact InternKatta",
    "description": "Get in touch with InternKatta for inquiries about our internships, courses, and training programs. Our admissions team is ready to help you.",
    "url": "https://internkatta.com/contact"
  };

  return (
    <div className="bg-white">
      <SEO
        title="Contact Us - InternKatta | Get in Touch"
        description="Contact InternKatta for inquiries about internships, courses, and training programs. Our admissions team is ready to help you choose the perfect program for your goals."
        keywords="contact internkatta, get in touch, admissions, inquiry, support, help"
        url="https://internkatta.com/contact"
        structuredData={contactStructuredData}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0052A3] via-[#004085] to-[#003366] text-white shadow-xl">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-2">
              <ChatBubbleLeftRightIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-200 mr-2" />
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                Get in Touch
              </h1>
            </div>
            <p className="text-sm md:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed">
              We're here to help. Whether you have a question about our programs, need support, or just want to say hello, we'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection onSubmit={handleSubmit} />
    </div>
  );
};

export default Contact;