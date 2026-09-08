import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { UserAuthContext } from '../context/UserAuthContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../utils/api';
import { toast } from 'react-hot-toast';

const Cart = () => {
    const { cart, removeFromCart, clearCart, cartTotal, cartOriginalTotal, applyCouponToCart } = useContext(CartContext);
    const { auth } = useContext(UserAuthContext);
    const user = auth?.user;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [couponInputs, setCouponInputs] = useState({});

    const handleApplyCoupon = async (itemId) => {
        const code = couponInputs[itemId];
        if (!code) {
            toast.error('Please enter a coupon code');
            return;
        }
        await applyCouponToCart(itemId, code);
    };

    const handleCheckout = async () => {
        if (!cart || cart.length === 0) return;
        setLoading(true);
        try {
            const res = await api.post('/api/payment/create-cart-payment', {
                userId: user._id
            });

            if (res.data.success && res.data.paymentUrl) {
                window.location.href = res.data.paymentUrl;
            } else {
                toast.error('Failed to initiate payment');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <button 
                    onClick={() => navigate('/courses')}
                    className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-700 transition"
                >
                    Browse Courses
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item, index) => (
                        <div key={item._id || `${item.itemId}-${index}`} className="flex items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-border">
                            <img 
                                src={item.thumbnail ? getImageUrl(item.thumbnail) : '/logo.jpg'} 
                                alt={item.name} 
                                className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-lg flex-shrink-0"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpg'; }}
                            />
                            <div className="ml-4 flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between overflow-hidden">
                                <div className="flex-grow">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2 leading-tight">{item.name}</h3>
                                    <p className="text-xs sm:text-sm text-brand-blue font-semibold mt-1">{item.itemType}</p>
                                    
                                    {item.couponCode ? (
                                        <div className="mt-2">
                                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                                                Coupon: {item.couponCode}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-2 flex items-center">
                                            <input 
                                                type="text" 
                                                placeholder="Coupon"
                                                className="px-2 py-1.5 border rounded-l-md text-xs sm:text-sm w-24 sm:w-32 outline-none focus:border-brand-blue"
                                                value={couponInputs[item.itemId] || ''}
                                                onChange={(e) => setCouponInputs({...couponInputs, [item.itemId]: e.target.value})}
                                            />
                                            <button 
                                                onClick={() => handleApplyCoupon(item.itemId)}
                                                className="bg-brand-blue text-white px-2 sm:px-3 py-1.5 rounded-r-md text-xs sm:text-sm hover:bg-brand-blue-700"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-3 sm:mt-0 flex flex-row sm:flex-col justify-between sm:justify-end items-center sm:items-end flex-shrink-0 w-full sm:w-auto">
                                    <div className="flex items-baseline sm:flex-col sm:items-end gap-2 sm:gap-0">
                                        <div className="text-lg sm:text-xl font-bold text-gray-900">₹{item.discountedPrice}</div>
                                        {item.price !== item.discountedPrice && (
                                            <div className="text-xs sm:text-sm text-gray-400 line-through">₹{item.price}</div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.itemId)}
                                        className="text-red-500 hover:text-red-700 flex items-center text-sm sm:mt-2 ml-4 sm:ml-0"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1"/> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={clearCart}
                            className="text-gray-500 hover:text-red-600 text-sm font-semibold transition"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-border sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Original Price</span>
                                <span>₹{cartOriginalTotal}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Discounts</span>
                                <span>-₹{cartOriginalTotal - cartTotal}</span>
                            </div>
                            <hr className="border-border" />
                            <div className="flex justify-between text-xl font-bold text-gray-900">
                                <span>Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-white font-bold text-lg transition-colors ${
                                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF8C42] hover:bg-[#FF7A1A]'
                            }`}
                        >
                            {loading ? 'Processing...' : 'Checkout'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
