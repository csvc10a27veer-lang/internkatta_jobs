import React, { useState } from 'react';
import { BuildingOffice2Icon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import Button from './Button';

// ─── Validation helpers ───────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name, value) {
  const v = value.trim();
  switch (name) {
    case 'name':
      if (!v) return 'Full name is required.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      return '';
    case 'email':
      if (!v) return 'Email address is required.';
      if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.';
      return '';
    case 'subject':
      if (!v) return 'Subject is required.';
      if (v.length < 3) return 'Subject must be at least 3 characters.';
      return '';
    case 'message':
      if (!v) return 'Message is required.';
      if (v.length < 10) return 'Message must be at least 10 characters.';
      return '';
    default:
      return '';
  }
}

function validateAll(formData) {
  const errs = {};
  Object.keys(formData).forEach((key) => {
    const msg = validateField(key, formData[key]);
    if (msg) errs[key] = msg;
  });
  return errs;
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contact section component
 * - Left: Contact information
 * - Right: Boxed form with full inline validation (Fix L8)
 */
const ContactSection = ({ onSubmit, className = '' }) => {
  const EMPTY = { name: '', email: '', subject: '', message: '' };

  const [formData, setFormData]   = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [touched, setTouched]     = useState({});
  const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [serverError, setServerError] = useState('');

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types (only if already touched)
    if (touched[name]) {
      const msg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const msg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Mark all fields as touched so all errors become visible
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const validationErrors = validateAll(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus the first invalid field for accessibility
      const firstInvalidKey = Object.keys(validationErrors)[0];
      document.getElementById(firstInvalidKey)?.focus();
      return;
    }

    setFormStatus('sending');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const response = await fetch('/api/contact/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.message || 'Submission failed. Please try again.');
        }
      }

      setFormStatus('success');
      setFormData(EMPTY);
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setFormStatus('error');
      // Surface the actual server message if available
      setServerError(
        error?.message || 'Something went wrong on our end. Please try again later.'
      );
    }
  };

  // ── field config ─────────────────────────────────────────────────────────
  const baseInputClass =
    'w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 transition-all';
  const validClass   = 'border-gray-300 focus:ring-[#0052A3] focus:border-[#0052A3]';
  const invalidClass = 'border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-400';

  const fieldClass = (name) =>
    `${baseInputClass} ${touched[name] && errors[name] ? invalidClass : validClass}`;

  return (
    <section className={`py-12 md:py-16 lg:py-20 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Left Side: Contact Information ── */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0052A3] mb-4">Contact Information</h2>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Fill up the form and our team will get back to you within 24 hours. Alternatively, you can reach us through the channels below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
              {/* Call Us */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="bg-[#0052A3]/10 p-3 rounded-full flex-shrink-0">
                    <PhoneIcon className="h-6 w-6 text-[#0052A3]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
                    <p className="text-sm text-gray-600 mb-2">For admissions and support, please call.</p>
                    <a href="tel:9527605805" className="text-sm text-[#0052A3] font-medium hover:text-[#004085] transition-colors">
                      9527605805
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Us */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="bg-[#FF7A1A]/10 p-3 rounded-full flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-[#FF7A1A]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
                    <p className="text-sm text-gray-600 mb-2">For general inquiries, drop us an email.</p>
                    <a href="mailto:internkatta@gmail.com" className="text-sm text-[#0052A3] font-medium hover:text-[#004085] transition-colors underline break-all">
                      internkatta@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Our Office */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="bg-[#0052A3]/10 p-3 rounded-full flex-shrink-0">
                    <BuildingOffice2Icon className="h-6 w-6 text-[#0052A3]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Our Office</h3>
                    <p className="text-sm text-gray-600">City Vista Kharadi, Pune</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Side: Contact Form ── */}
          <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0052A3] mb-6">Send a Message</h2>

            {/* noValidate: suppress browser native bubbles; we handle all feedback inline */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldClass('name')}
                  placeholder="Enter your full name"
                  aria-required="true"
                  aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
                  aria-invalid={!!(touched.name && errors.name)}
                />
                {touched.name && errors.name && (
                  <p id="name-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldClass('email')}
                  placeholder="Enter your email address"
                  aria-required="true"
                  aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                  aria-invalid={!!(touched.email && errors.email)}
                />
                {touched.email && errors.email && (
                  <p id="email-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldClass('subject')}
                  placeholder="What is this regarding?"
                  aria-required="true"
                  aria-describedby={errors.subject && touched.subject ? 'subject-error' : undefined}
                  aria-invalid={!!(touched.subject && errors.subject)}
                />
                {touched.subject && errors.subject && (
                  <p id="subject-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${fieldClass('message')} resize-none`}
                  placeholder="Tell us how we can help you..."
                  aria-required="true"
                  aria-describedby={errors.message && touched.message ? 'message-error' : undefined}
                  aria-invalid={!!(touched.message && errors.message)}
                />
                {touched.message && errors.message && (
                  <p id="message-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div>
                <Button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  variant="primary"
                  className="w-full py-3 text-base font-semibold bg-[#0052A3] hover:bg-[#004085] text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {formStatus === 'sending' ? 'Sending…' : 'Send Message'}
                </Button>
              </div>

              {/* Success banner */}
              {formStatus === 'success' && (
                <div role="status" className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-center text-green-700 font-medium text-sm">
                    ✓ Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              {/* Error banner (server-side feedback) */}
              {formStatus === 'error' && (
                <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-center text-red-700 font-medium text-sm">
                    ✗ {serverError || 'An error occurred. Please try again later.'}
                  </p>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
