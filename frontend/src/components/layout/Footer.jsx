import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaWhatsapp, FaRegCompass, FaHeadset, FaRegEnvelope, FaChevronRight } from 'react-icons/fa';

const Footer = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/user') || location.pathname.startsWith('/admin');

  const socialLinks = [
    { href: 'https://www.instagram.com/internkatta/', icon: <FaInstagram />, label: 'Instagram' },
    { href: 'https://whatsapp.com/channel/0029Vb7H5GjKWEKwErJC5004', icon: <FaWhatsapp />, label: 'WhatsApp' },
    { href: 'https://youtube.com/@internkatta?si=LNH9gEk4fQYmukDf', icon: <FaYoutube />, label: 'YouTube' },
    { href: 'https://www.linkedin.com/company/internkatta/ ', icon: <FaLinkedin />, label: 'LinkedIn' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    e.target.reset();
  };

  const gridContainerClass = isDashboard 
    ? "grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-4 md:gap-8" 
    : "grid grid-cols-2 md:grid-cols-12 lg:grid-cols-4 gap-y-10 gap-x-4 md:gap-8";
  
  const col1Class = isDashboard
    ? "col-span-2 lg:col-span-1 lg:pr-8 md:border-b md:border-white/20 md:pb-6 lg:border-b-0 lg:pb-0"
    : "col-span-2 md:col-span-5 lg:col-span-1 md:border-r md:border-white/20 md:pr-6 lg:pr-8";
    
  const col2Class = isDashboard
    ? "col-span-1 lg:col-span-1 border-r border-white/20 pr-4 lg:border-none lg:pr-0 lg:pl-0"
    : "col-span-1 md:col-span-3 lg:col-span-1 border-r border-white/20 pr-4 md:pl-6 md:pr-6 lg:border-none lg:pr-0 lg:pl-0";
    
  const col3Class = isDashboard
    ? "col-span-1 lg:col-span-1 pl-4 lg:pl-0"
    : "col-span-1 md:col-span-4 lg:col-span-1 pl-4 md:pl-6 lg:pl-0";
    
  const col4Class = isDashboard
    ? "col-span-2 lg:col-span-1"
    : "col-span-2 md:col-span-12 lg:col-span-1";

  const newsletterContainerClass = isDashboard
    ? "flex flex-col justify-between gap-6"
    : "flex flex-col md:flex-row lg:flex-col justify-between md:items-center lg:items-start gap-6";

  return (
    <footer className="bg-gradient-to-br from-[#0052A3] via-[#004085] to-[#003366] text-muted relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
      </div>

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-section-mobile md:py-section-tablet lg:py-section-desktop relative z-10">
        {/* Top Section: Links and Newsletter */}
        <div className={gridContainerClass}>

          {/* Column 1: Brand and Description */}
          <div className={col1Class}>
            <h2 className="text-h2 font-headline font-bold mb-2">
              <span className="text-white">Intern</span>
              <span className="text-[#F97316]">Katta</span>
            </h2>
            <div className="w-12 h-[3px] bg-[#F97316] mb-4 rounded-full"></div>
            <p className="text-small leading-relaxed text-white">
              Your launchpad to a successful tech career. We provide industry-relevant courses, hands-on internships, and specialized training to make you job-ready.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className={col2Class}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 mb-4">
              <div className="w-10 h-10 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg md:text-sm lg:text-lg text-[#F97316] shrink-0">
                <FaRegCompass />
              </div>
              <h3 className="text-h3 font-headline font-semibold m-0 text-[#F97316]">Explore</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/courses"
                  onClick={scrollToTop}
                  className="flex items-center gap-2 group text-small text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text rounded"
                >
                  <FaChevronRight className="text-xs text-[#F97316]" />
                  <span className="group-hover:text-[#F97316]">Courses</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/internship"
                  onClick={scrollToTop}
                  className="flex items-center gap-2 group text-small text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text rounded"
                >
                  <FaChevronRight className="text-xs text-[#F97316]" />
                  <span className="group-hover:text-[#F97316]">Internships</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/training"
                  onClick={scrollToTop}
                  className="flex items-center gap-2 group text-small text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text rounded"
                >
                  <FaChevronRight className="text-xs text-[#F97316]" />
                  <span className="group-hover:text-[#F97316]">Industrial Training</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={scrollToTop}
                  className="flex items-center gap-2 group text-small text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text rounded"
                >
                  <FaChevronRight className="text-xs text-[#F97316]" />
                  <span className="group-hover:text-[#F97316]">Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className={col3Class}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 mb-4">
              <div className="w-10 h-10 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg md:text-sm lg:text-lg text-[#F97316] shrink-0">
                <FaHeadset />
              </div>
              <h3 className="text-h3 font-headline font-semibold m-0 text-[#F97316]">Support</h3>
            </div>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  onClick={scrollToTop}
                  className="flex items-center gap-2 group text-small text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text rounded"
                >
                  <FaChevronRight className="text-xs text-[#F97316]" />
                  <span className="group-hover:text-[#F97316]">About InternKatta</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  onClick={scrollToTop}
                  className="flex items-center gap-2 group text-small text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text rounded"
                >
                  <FaChevronRight className="text-xs text-[#F97316]" />
                  <span className="group-hover:text-[#F97316]">FAQ</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  onClick={scrollToTop}
                  className="flex items-center gap-2 group text-small text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text rounded"
                >
                  <FaChevronRight className="text-xs text-[#F97316]" />
                  <span className="group-hover:text-[#F97316]">Terms and Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  onClick={scrollToTop}
                  className="flex items-center gap-2 group text-small text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text rounded"
                >
                  <FaChevronRight className="text-xs text-[#F97316]" />
                  <span className="group-hover:text-[#F97316]">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  onClick={scrollToTop}
                  className="flex items-center gap-2 group text-small text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text rounded"
                >
                  <FaChevronRight className="text-xs text-[#F97316]" />
                  <span className="group-hover:text-[#F97316]">Refund Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className={col4Class}>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:bg-transparent lg:border-none lg:p-0">
              <div className={newsletterContainerClass}>

                <div className="flex items-start md:items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 lg:w-10 lg:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl lg:text-lg text-[#F97316] shrink-0">
                    <FaRegEnvelope />
                  </div>
                  <div>
                    <h3 className="text-h3 font-headline font-semibold m-0 text-[#F97316] mb-1">Stay Updated</h3>
                    <p className="text-small text-white m-0">Get the latest news on new courses and internship opportunities.</p>
                  </div>
                </div>

                <div className="w-full md:w-[350px] lg:w-full shrink-0">
                  <form onSubmit={handleNewsletterSubmit}>
                    <div className="flex">
                      <input
                        type="email"
                        placeholder="Your email"
                        required
                        className="w-full px-4 py-2 bg-white/10 border border-white/30 text-white placeholder:text-white/60 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]"
                        aria-label="Email address for newsletter"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#F97316] text-white font-medium rounded-r-lg hover:bg-[#E06512] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 focus:ring-offset-[#003366]"
                      >
                        Go
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Copyright and Socials */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6 md:gap-0">
          <p className="text-small text-white">
            © {new Date().getFullYear()} InternKatta Inc. All rights reserved.
          </p>
          <div className="flex space-x-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-lg text-white hover:text-white hover:bg-[#F97316] hover:border-[#F97316] transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-text"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;