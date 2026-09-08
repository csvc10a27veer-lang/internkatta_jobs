import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

const MockPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [activeTab, setActiveTab] = useState('card'); // card, upi, qr
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef(null);

  const transactionId = searchParams.get('transactionId');
  const amount = searchParams.get('amount');
  const itemType = searchParams.get('itemType');
  const itemId = searchParams.get('itemId');

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    upiId: ''
  });

  useEffect(() => {
    if (!transactionId || !amount) {
      toast.error('Invalid payment parameters');
      navigate('/');
    }
  }, [transactionId, amount, navigate]);

  // Generate QR code data when QR tab is active
  useEffect(() => {
    if (activeTab === 'qr' && transactionId && amount) {
      const upiData = `upi://pay?pa=mock@InternKatta&pn=InternKatta&am=${amount}&tn=${transactionId}&cu=INR`;
      setQrCodeData(upiData);
      
      // Generate QR code
      QRCode.toCanvas(canvasRef.current, upiData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error);
        }
      });
    }
  }, [activeTab, transactionId, amount]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    try {
      // Call backend to update payment status
      await api.post('/api/payment/callback', {
        transactionId,
        status: 'SUCCESS'
      });

      setPaymentStatus('success');
      toast.success('Payment successful!');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        if (itemType === 'course') {
          navigate('/user/mycourse');
        } else {
          navigate('/user/internship');
        }
      }, 3000);

    } catch (error) {
      console.error('Payment callback error:', error);
      toast.error('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = async () => {
    setLoading(true);
    try {
      // Call backend to update payment status
      await api.post('/api/payment/callback', {
        transactionId,
        status: 'FAILED'
      });

      setPaymentStatus('failed');
      toast.error('Payment failed!');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        if (itemType === 'course') {
          navigate('/courses');
        } else {
          navigate('/internships');
        }
      }, 3000);

    } catch (error) {
      console.error('Payment callback error:', error);
      toast.error('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment of ₹{amount} has been processed successfully.
          </p>
          <p className="text-sm text-gray-500">
            Transaction ID: {transactionId}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed!</h2>
          <p className="text-gray-600 mb-4">
            Your payment of ₹{amount} could not be processed.
          </p>
          <p className="text-sm text-gray-500">
            Transaction ID: {transactionId}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Redirecting you back...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mock Payment Gateway</h1>
          <p className="text-gray-600">Testing Payment Interface</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Amount:</span>
            <span className="text-xl font-bold text-blue-600">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Transaction ID:</span>
            <span className="font-mono">{transactionId}</span>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                activeTab === 'card'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💳 Card
            </button>
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                activeTab === 'upi'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📱 UPI
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                activeTab === 'qr'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📷 QR Code
            </button>
          </div>
        </div>

        {/* Card Payment Tab */}
        {activeTab === 'card' && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Holder Name
              </label>
              <input
                type="text"
                name="cardHolderName"
                value={formData.cardHolderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        )}

        {/* UPI Payment Tab */}
        {activeTab === 'upi' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID
              </label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                placeholder="username@upi"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Popular UPI Apps:</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-2xl mb-1">📱</div>
                  <div className="text-xs">PhonePe</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-xs">Paytm</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="text-2xl mb-1">🏦</div>
                  <div className="text-xs">GPay</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <div className="text-4xl mb-2">📱</div>
                <div className="text-sm text-gray-600 mb-4">QR Code Scanner</div>
                
                {/* QR Code Display */}
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="text-center">
                    <div className="inline-block bg-white p-4 rounded-lg shadow-sm">
                      <canvas 
                        ref={canvasRef}
                        className="w-48 h-48 border border-gray-200"
                        style={{ display: activeTab === 'qr' ? 'block' : 'none' }}
                      />
                      {activeTab !== 'qr' && (
                        <div className="w-48 h-48 bg-white border-2 border-gray-300 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-2">📱</div>
                            <div className="text-xs text-gray-500">QR Code</div>
                            <div className="text-xs text-gray-400 mt-1">Will appear here</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Open any UPI app and scan this QR code to complete payment
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">QR Code Data:</h4>
              <div className="bg-white p-3 rounded border font-mono text-xs break-all">
                {qrCodeData}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                This QR code contains UPI payment data that can be scanned by any UPI app
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">How to Scan:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Open PhonePe, Paytm, GPay, or any UPI app</li>
                <li>• Tap on "Scan QR Code" or "Pay via QR"</li>
                <li>• Point camera at the QR code above</li>
                <li>• Confirm payment details and complete transaction</li>
              </ul>
            </div>
          </div>
        )}

        {/* Payment Action Buttons */}
        <div className="pt-6 space-y-3">
          <button
            type="button"
            onClick={handlePaymentSuccess}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Processing...' : `✅ Simulate Successful ${activeTab.toUpperCase()} Payment`}
          </button>

          <button
            type="button"
            onClick={handlePaymentFailure}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Processing...' : `❌ Simulate Failed ${activeTab.toUpperCase()} Payment`}
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Testing Instructions:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Switch between Card, UPI, and QR Code payment methods</li>
            <li>• For QR Code: Use any UPI app to scan the mock QR code</li>
            <li>• Click "Simulate Successful Payment" to test successful payment flow</li>
            <li>• Click "Simulate Failed Payment" to test failed payment flow</li>
            <li>• Both scenarios will be recorded in the admin panel</li>
            <li>• This is a mock interface for testing purposes only</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
