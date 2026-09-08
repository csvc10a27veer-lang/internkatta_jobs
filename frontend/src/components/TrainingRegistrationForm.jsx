import React, { useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';

const TrainingRegistrationForm = ({ training, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    collegeName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const requestData = {
        ...formData,
        trainingType: training.id,
        trainingTitle: training.title
      };
      
      const response = await api.post('/api/training/register', requestData);

      if (response.data.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          mobileNumber: '',
          collegeName: ''
        });
        // Close form after 3 seconds
        setTimeout(() => {
          onClose();
          setSubmitStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Training registration error:', error);
      console.error('Error response:', error.response?.data);
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };



  if (!training) return null;

  return (
    <div className="bg-transparent rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 sm:p-6 text-white rounded-t-2xl flex justify-between items-start gap-4">
              <h2 className="text-xl sm:text-2xl font-bold mt-1">Register for {training.title}</h2>
              {onClose && (
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white flex-shrink-0"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Form Content */}
            <div className="p-5 sm:p-6 bg-white/90 backdrop-blur-sm rounded-b-2xl">
              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful!</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Thank you for registering. We will contact you soon with further details.
                  </p>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ExclamationCircleIcon className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Registration Failed</h3>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {errorMessage}
                  </p>
                  <button
                    onClick={() => setSubmitStatus(null)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-800 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label htmlFor="collegeName" className="block text-sm font-semibold text-gray-800 mb-2">
                      College/University Name *
                    </label>
                    <input
                      type="text"
                      id="collegeName"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                      placeholder="Enter your college/university name"
                    />
                  </div>

                  {/* Training Info Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 p-5 sm:p-6 rounded-xl">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Training Details:</h4>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-800 w-20 flex-shrink-0">Program:</span>
                        <span className="text-gray-700 flex-1">{training.title}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-800 w-20 flex-shrink-0">Duration:</span>
                        <span className="text-gray-700 flex-1">{training.duration}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-gray-800 w-20 flex-shrink-0">Mode:</span>
                        <span className="text-gray-700 flex-1">{training.mode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-900 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>

                  <p className="text-sm text-gray-500 text-center leading-relaxed">
                    By submitting this form, you agree to be contacted regarding this training program.
                  </p>
                </form>
              )}
            </div>
    </div>
  );
};

export default TrainingRegistrationForm;
