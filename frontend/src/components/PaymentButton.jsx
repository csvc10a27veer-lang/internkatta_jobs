
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Tag, X } from 'lucide-react';

// Module-level variables for syncing coupon state across different instances of PaymentButton for the same item
const couponSyncCache = {}; // key: `${itemType}_${itemId}`, value: { appliedCoupon, finalPrice, couponCode, showCouponInput }
const couponSyncListeners = {}; // key: `${itemType}_${itemId}`, value: Set of callbacks

const getCouponSessionKey = (itemType, itemId) => `applied_coupon_${itemType}_${itemId}`;

const getSyncState = (itemType, itemId, defaultPrice) => {
  const key = `${itemType}_${itemId}`;
  if (!couponSyncCache[key]) {
    // Try to load from sessionStorage
    try {
      const saved = sessionStorage.getItem(getCouponSessionKey(itemType, itemId));
      if (saved) {
        const parsed = JSON.parse(saved);
        couponSyncCache[key] = {
          appliedCoupon: parsed.appliedCoupon || null,
          finalPrice: Number(parsed.finalPrice ?? defaultPrice ?? 0),
          couponCode: parsed.couponCode || '',
          showCouponInput: parsed.showCouponInput || false
        };
      }
    } catch (e) {
      console.error('Error loading coupon from sessionStorage:', e);
    }

    if (!couponSyncCache[key]) {
      couponSyncCache[key] = {
        appliedCoupon: null,
        finalPrice: Number(defaultPrice || 0),
        couponCode: '',
        showCouponInput: false
      };
    }
  }
  return couponSyncCache[key];
};

const updateSyncState = (itemType, itemId, newState) => {
  const key = `${itemType}_${itemId}`;
  const currentState = couponSyncCache[key] || {
    appliedCoupon: null,
    finalPrice: 0,
    couponCode: '',
    showCouponInput: false
  };
  
  const updatedState = {
    ...currentState,
    ...newState
  };
  couponSyncCache[key] = updatedState;

  // Persist to sessionStorage
  try {
    sessionStorage.setItem(
      getCouponSessionKey(itemType, itemId),
      JSON.stringify(updatedState)
    );
  } catch (e) {
    console.error('Error saving coupon to sessionStorage:', e);
  }

  // Notify listeners
  if (couponSyncListeners[key]) {
    couponSyncListeners[key].forEach(listener => {
      listener(couponSyncCache[key]);
    });
  }
};

const subscribeSync = (itemType, itemId, listener) => {
  const key = `${itemType}_${itemId}`;
  if (!couponSyncListeners[key]) {
    couponSyncListeners[key] = new Set();
  }
  couponSyncListeners[key].add(listener);
  return () => {
    couponSyncListeners[key].delete(listener);
    if (couponSyncListeners[key].size === 0) {
      delete couponSyncListeners[key];
    }
  };
};

const PaymentButton = ({ 
  itemId, 
  itemType, // 'course' or 'internship'
  price, 
  title,
  className = '',
  children,
  showCouponLink = true,
  initialShowCouponInput = false,
  onCouponInputChange,
  couponLinkTextColor = 'text-black', // Default to black, can be overridden
  autoTrigger = false,
  hideButton = false, // when true, don't render the final payment button
  hideCoupon = false, // when true, hide coupon UI
  hidePriceDisplay = false, // when true, don't render the price display when a coupon is applied
  extraButton = null // Optional extra button to render alongside the payment button
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { auth, updateUser } = useUserAuth();
  const navigate = useNavigate();
  
  // Get initial values from sync state or props
  const initialSyncState = getSyncState(itemType, itemId, price);
  
  // Coupon states
  const [showCouponInput, setShowCouponInput] = useState(initialSyncState.showCouponInput);
  
  // Update coupon input visibility when prop changes
  useEffect(() => {
    updateSyncState(itemType, itemId, { showCouponInput: initialShowCouponInput });
  }, [initialShowCouponInput, itemId, itemType]);

  const [couponCode, setCouponCode] = useState(initialSyncState.couponCode);
  const [appliedCoupon, setAppliedCoupon] = useState(initialSyncState.appliedCoupon);
  const [couponLoading, setCouponLoading] = useState(false);
  const [finalPrice, setFinalPrice] = useState(initialSyncState.finalPrice);
  const location = useLocation();

  // Subscribe to sync events
  useEffect(() => {
    // Sync initially or if price changes
    const currentSync = getSyncState(itemType, itemId, price);
    if (!currentSync.appliedCoupon) {
      updateSyncState(itemType, itemId, { finalPrice: Number(price || 0) });
    }
    
    const unsubscribe = subscribeSync(itemType, itemId, (state) => {
      setShowCouponInput(state.showCouponInput);
      setCouponCode(state.couponCode);
      setAppliedCoupon(state.appliedCoupon);
      setFinalPrice(state.finalPrice);
    });
    
    return unsubscribe;
  }, [itemId, itemType, price]);

  // Auto-trigger payment flow after login (when returning with ?autopay=1)
  const autoTriggeredRef = useRef(false);
  // Prevent multiple enrollment attempts
  const enrollmentInProgressRef = useRef(false);

  // Coupon functions
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await api.post('/api/coupons/validate', {
        code: couponCode.trim().toUpperCase(),
        [itemType === 'course' ? 'courseId' : 'internshipId']: itemId
      });

      if (response.data.valid) {
        const newAppliedCoupon = response.data.coupon;
        const newFinalPrice = Number(response.data.coupon.finalPrice || price || 0);
        updateSyncState(itemType, itemId, {
          appliedCoupon: newAppliedCoupon,
          finalPrice: newFinalPrice,
          showCouponInput: false
        });
        toast.success(`Coupon applied! You saved ₹${response.data.coupon.discountAmount}`);
      } else {
        toast.error('Wrong coupon code. Please check and try again.');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      let errorMessage = 'Failed to validate coupon. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 404) {
          errorMessage = 'Coupon validation endpoint not found or coupon does not exist.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Something happened in setting up the request
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    updateSyncState(itemType, itemId, {
      appliedCoupon: null,
      finalPrice: Number(price || 0),
      couponCode: '',
      showCouponInput: false
    });
    try {
      sessionStorage.removeItem(getCouponSessionKey(itemType, itemId));
    } catch (e) {
      console.error('Error removing coupon from sessionStorage:', e);
    }
    toast.success('Coupon removed');
  };

  const handlePayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    // Prevent multiple simultaneous enrollment attempts
    if (enrollmentInProgressRef.current) {
      return;
    }

    if (!auth || !auth.user) {
      // Preserve intent and return to this item with autopay=1 after login
      const params = new URLSearchParams(location.search);
      params.set('autopay', '1');
      const redirectTo = `${location.pathname}?${params.toString()}`;
      toast.error('Please login to purchase this item');
      navigate('/login', { state: { redirectTo } });
      return;
    }

    // Normal payment flow for all users
    setIsLoading(true);

    try {
      const endpoint = itemType === 'course' ? '/api/payment/course' : '/api/payment/internship';
      const numericPrice = Number(price || 0);
      const numericFinal = Number(finalPrice || 0);

      const requestBody = {
        [itemType === 'course' ? 'courseId' : 'internshipId']: itemId,
        userId: auth.user._id,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        price: numericPrice,
        finalPrice: numericFinal
      };

      const response = await api.post(endpoint, requestBody);

      if (response.data.success) {
        const paymentUrl = response.data.paymentUrl;
        console.log('Payment URL received:', paymentUrl);
        
        // Clear coupon state on successful checkout redirection
        try {
          sessionStorage.removeItem(getCouponSessionKey(itemType, itemId));
        } catch (e) {}
        
        // Validate that we got a real PhonePe URL, not a mock URL
        if (paymentUrl && !paymentUrl.includes('localhost') && !paymentUrl.includes('mock')) {
          console.log('Redirecting to PhonePe payment page...');
          window.location.href = paymentUrl;
        } else {
          console.error('Invalid payment URL received:', paymentUrl);
          toast.error('Invalid payment URL received. Please try again.');
        }
      } else {
        console.error('Payment API returned success: false');
        console.error('Error message:', response.data.message);
        toast.error(response.data.message || 'Payment initiation failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || '';
      
      // Check if user is already enrolled
      if (error.response?.status === 400 && 
          (errorMessage.toLowerCase().includes('already enrolled') || 
           errorMessage.toLowerCase().includes('already purchased'))) {
        // Show SweetAlert popup for already enrolled
        Swal.fire({
          title: 'Already Enrolled',
          text: errorMessage || 'You are already enrolled in this internship.',
          icon: 'info',
          confirmButtonText: 'OK',
          confirmButtonColor: '#0052A3',
          allowOutsideClick: true,
          allowEscapeKey: true
        });
      } else {
        // For other errors, show toast
        let displayMessage = 'Payment initiation failed';
        
        if (error.response?.status === 522) {
          displayMessage = 'Payment gateway timeout. Please try again in a few minutes.';
        } else if (error.response?.status === 500) {
          displayMessage = 'Server error. Please try again later.';
        } else if (error.response?.status === 400) {
          displayMessage = errorMessage || 'Invalid payment request.';
        } else if (error.response?.status === 401) {
          displayMessage = 'Authentication failed. Please login again.';
          // Show SweetAlert popup for authentication failure
          Swal.fire({
            title: 'Authentication Failed',
            text: displayMessage,
            icon: 'error',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#dc2626',
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then(() => {
            navigate('/login');
          });
          return; // Don't show toast after showing SweetAlert
        } else if (error.response?.status === 403) {
          displayMessage = 'Access denied. Please check your account.';
        } else if (error.response?.status === 404) {
          displayMessage = 'Item not found. Please refresh the page.';
        } else if (errorMessage) {
          displayMessage = errorMessage;
        }
        
        // Add retry suggestion for certain errors
        if (error.response?.status === 522 || error.response?.status === 500) {
          displayMessage += ' Click "Try Again" to retry.';
        }
        
        toast.error(displayMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-trigger payment once when autoTrigger is set and user is logged in
  useEffect(() => {
    if (autoTriggeredRef.current) return;
    if (!auth || !auth.user) return;
    if (enrollmentInProgressRef.current) return;
    // Look for autopay flag in URL
    const params = new URLSearchParams(location.search);
    const shouldAutoPay = autoTrigger || params.get('autopay') === '1';
    if (shouldAutoPay) {
      autoTriggeredRef.current = true;
      // Small delay to ensure component is fully mounted
      setTimeout(() => {
        handlePayment();
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user?._id]);

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      {/* Coupon Section */}
      {!hideCoupon && showCouponLink && (
        <div className="space-y-2">
          {!appliedCoupon && !showCouponInput && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateSyncState(itemType, itemId, { showCouponInput: true });
                if (onCouponInputChange) onCouponInputChange(true);
              }}
              className={`flex items-center gap-2 text-sm ${couponLinkTextColor} hover:opacity-80 transition-colors`}
            >
              <Tag className="h-4 w-4" />
              Have a coupon code?
            </button>
          )}

          {showCouponInput && !appliedCoupon && (
            <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setCouponCode(val);
                  updateSyncState(itemType, itemId, { couponCode: val });
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter coupon code"
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white uppercase"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyCoupon();
                }}
                disabled={couponLoading}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-green-400 whitespace-nowrap shrink-0"
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateSyncState(itemType, itemId, { showCouponInput: false, couponCode: '' });
                  if (onCouponInputChange) onCouponInputChange(false);
                }}
                className="px-3 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 shrink-0 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {appliedCoupon && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  {appliedCoupon.code} applied - Save ₹{appliedCoupon.discountAmount}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCoupon();
                }}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Price Display */}
      {appliedCoupon && !hidePriceDisplay && (
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Original Price:</span>
            <span className="line-through">₹{price.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-semibold text-green-600">
            <span>Final Price:</span>
            <span>₹{finalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Payment Button */}
      {!hideButton && (
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePayment(e);
            }}
            disabled={isLoading}
            type="button"
            className={`text-white rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className} flex items-center justify-center`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              children || 'Register Now'
            )}
          </button>
          {extraButton}
        </div>
      )}
    </div>
  );
};

export default PaymentButton;
