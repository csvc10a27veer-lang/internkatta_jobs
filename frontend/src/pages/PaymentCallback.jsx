// frontend/src/pages/PaymentCallback.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      setPaymentStatus('error');
      toast.error('Invalid payment callback');
      return;
    }

    let attempts = 0;
    const maxAttempts = 8; // e.g. ~40s if interval is 5s

    const checkStatus = async () => {
      try {
        const response = await api.get(`/api/payment/status/${transactionId}`);

        if (!response.data.success || !response.data.payment) {
          setPaymentStatus('error');
          toast.error('Failed to get payment status');
          return;
        }

        const payment = response.data.payment;
        setPaymentDetails(payment);

        if (payment.status === 'COMPLETED') {
          setPaymentStatus('success');
          toast.success('Payment successful! You are now enrolled.');

          // Safety net: sync enrollments to guarantee the course/internship
          // is in the user's account even if the backend webhook missed it.
          try {
            await api.post('/api/users/sync-enrollments');
            console.log('✅ Enrollment sync completed after payment.');
          } catch (syncError) {
            // Non-critical — don't block the success flow
            console.warn('⚠️ Enrollment sync failed (non-critical):', syncError.message);
          }
        } else if (payment.status === 'FAILED') {
          setPaymentStatus('failed');
          toast.error('Payment failed. Please try again.');
        } else {
          // Still pending on the gateway / our backend
          setPaymentStatus('pending');
          // Only show the info toast on the first pending state
          if (attempts === 0) {
            toast('Payment is being processed. This may take a few seconds...');
          }

          attempts += 1;
          if (attempts < maxAttempts) {
            // Re-check after a short delay
            setTimeout(checkStatus, 5000);
          }
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setPaymentStatus('error');
        toast.error('Error processing payment callback');
      }
    };

    checkStatus();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-16 w-16 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-16 w-16 text-yellow-500" />;
      default:
        return <ClockIcon className="h-16 w-16 text-gray-400 animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Payment Processing';
      default:
        return 'Checking Payment Status...';
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Your payment has been processed successfully. You are now enrolled in the course/internship.';
      case 'failed':
        return 'Your payment could not be processed. Please try again or contact support if the issue persists.';
      case 'pending':
        return 'Your payment is being processed. This may take a few minutes. Please wait...';
      default:
        return 'We are checking your payment status. Please wait...';
    }
  };

  // Auto-redirect after 5 seconds when payment is successful
  useEffect(() => {
    if (paymentStatus === 'success') {
      const itemType = searchParams.get('itemType');
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Redirect based on what was purchased
            if (itemType === 'internship') {
              navigate('/user/internship');
            } else if (itemType === 'course') {
              navigate('/user/mycourse');
            } else {
              // Fallback to default dashboard
              navigate('/user/internship');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup on unmount
      return () => clearInterval(countdownInterval);
    } else {
      // Reset countdown when status changes
      setCountdown(5);
    }
  }, [paymentStatus, searchParams, navigate]);

  const handleRetry = () => {
    // Redirect back to the item page to retry payment
    const itemType = searchParams.get('itemType');
    const itemId = searchParams.get('itemId');
    
    if (itemType === 'course') {
      navigate(`/course/${itemId}`);
    } else if (itemType === 'internship') {
      navigate(`/internship/${itemId}`);
    } else {
      navigate('/courses');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {getStatusIcon()}
            
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {getStatusTitle()}
            </h2>
            
            <p className="mt-4 text-gray-600">
              {getStatusMessage()}
            </p>

            {paymentDetails && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{paymentDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>₹{paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-semibold ${
                      paymentDetails.status === 'COMPLETED' ? 'text-green-600' :
                      paymentDetails.status === 'FAILED' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {paymentDetails.status}
                    </span>
                  </div>
                  {paymentDetails.paymentMethod && (
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span>{paymentDetails.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Redirecting to your dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
              </div>
            )}

            <div className="mt-8 space-y-4">
              
              {paymentStatus === 'failed' && (
                <div className="space-y-3">
                  <button
                    onClick={handleRetry}
                    className="w-full bg-[#0052A3] text-white py-3 px-4 rounded-md hover:bg-[#004085] transition duration-300"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/courses')}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition duration-300"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
              
              {paymentStatus === 'pending' && (
                <button
                  onClick={() => navigate('/user/internship')}
                  className="w-full bg-[#0052A3] text-white py-3 px-4 rounded-md hover:bg-[#004085] transition duration-300"
                >
                  Go to Dashboard
                </button>
              )}
              
              {paymentStatus === 'error' && (
                <div className="space-y-3">
                  <button
                    onClick={handleRetry}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/courses')}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition duration-300"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
