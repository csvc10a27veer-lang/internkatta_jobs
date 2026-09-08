import React from 'react';
import { LightBulbIcon, AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const About = () => {
  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About InternKatta",
    "description": "Learn about InternKatta's mission to bridge the gap between academic education and industry demands through practical, hands-on skill development.",
    "url": "https://internkatta.com/about"
  };

  return (
    <div className="bg-white text-gray-800">
      <SEO
        title="About Us - InternKatta | Our Mission & Story"
        description="Learn about InternKatta's mission to bridge the gap between academic education and industry demands. We empower individuals with practical, hands-on skills for successful careers."
        keywords="about internkatta, our mission, skill development platform, career training, industry-ready skills, practical learning"
        url="https://internkatta.com/about"
        structuredData={aboutStructuredData}
      />
      {/* Hero Section */}
      <section className="bg-gray-50 py-20 lg:py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900">Our Mission</h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            To bridge the gap between academic education and the demands of the tech industry by empowering individuals with practical, hands-on skills for a successful career.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">The <span>Intern</span><span className="text-[#FF8C42]">Katta</span> Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <span>Intern</span><span className="text-[#FF8C42]">Katta</span> was founded by a team of industry veterans who repeatedly saw talented graduates struggle to find their footing in the professional world. While academically brilliant, many lacked the specific, practical skills that companies desperately needed.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We decided to create a platform that wasn't just about learning, but about *doing*. A place where students could gain real-world experience through live projects, receive mentorship from experts, and build a portfolio that truly stands out. That's how <span>Intern</span><span className="text-[#FF8C42]">Katta</span> was born.
            </p>
          </div>
          <div className="flex justify-center">
            <img src="/about.jpeg" alt="About InternKatta" className="w-full max-w-lg h-auto rounded-xl shadow-lg" />
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">What We Believe In</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <div className="bg-indigo-100 inline-block p-5 rounded-full mb-4">
                <LightBulbIcon className="h-10 w-10 text-indigo-600"/>
              </div>
              <h3 className="text-xl font-semibold mb-2">Practicality Over Theory</h3>
              <p className="text-gray-600">We believe the best way to learn is by building. Our curriculum is project-based to ensure you can apply what you learn immediately.</p>
            </div>
            <div>
              <div className="bg-indigo-100 inline-block p-5 rounded-full mb-4">
                <AcademicCapIcon className="h-10 w-10 text-indigo-600"/>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert-Led Mentorship</h3>
              <p className="text-gray-600">Learning from those who have been there is invaluable. Our instructors are industry professionals dedicated to your growth.</p>
            </div>
            <div>
              <div className="bg-indigo-100 inline-block p-5 rounded-full mb-4">
                <BriefcaseIcon className="h-10 w-10 text-indigo-600"/>
              </div>
              <h3 className="text-xl font-semibold mb-2">Career-Focused Outcomes</h3>
              <p className="text-gray-600">Our ultimate goal is your success. We provide the training, certification, and support needed to launch or advance your career.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700 text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold">Ready to Join Our Community?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-indigo-200">
            Start your journey with <span>Intern</span><span className="text-[#FF8C42]">Katta</span> today and take control of your future.
          </p>
          <div className="mt-8">
            <Link to="/courses" className="px-10 py-4 bg-white text-indigo-700 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-200 transition duration-300">
              Explore Our Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;