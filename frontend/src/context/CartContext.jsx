import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { UserAuthContext } from './UserAuthContext';
import { toast } from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const { auth } = useContext(UserAuthContext);
    const isUserAuthenticated = !!auth;
    const user = auth?.user;

    const fetchCart = async () => {
        if (!isUserAuthenticated || !user?._id) {
            setCart([]);
            return;
        }
        try {
            setLoading(true);
            const res = await api.get('/api/cart');
            if (res.data.success) {
                setCart(res.data.cart);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [isUserAuthenticated, user?._id]);

    const addToCart = async (itemType, itemId, couponCode = null) => {
        if (!isUserAuthenticated) {
            toast.error('Please login to add to cart');
            return false;
        }
        try {
            const res = await api.post('/api/cart/add', {
                itemType,
                itemId,
                couponCode
            });
            if (res.data.success) {
                setCart(res.data.cart);
                toast.success('Item added to cart');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
            return false;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const res = await api.delete(`/api/cart/remove/${itemId}`);
            if (res.data.success) {
                setCart(res.data.cart);
                toast.success('Item removed from cart');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove from cart');
        }
    };

    const clearCart = async () => {
        try {
            const res = await api.delete('/api/cart/clear');
            if (res.data.success) {
                setCart([]);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to clear cart');
        }
    };

    const applyCouponToCart = async (itemId, couponCode) => {
        try {
            const res = await api.post('/api/cart/apply-coupon', {
                itemId,
                couponCode
            });
            if (res.data.success) {
                setCart(res.data.cart);
                toast.success('Coupon applied successfully!');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply coupon');
            return false;
        }
    };

    const cartTotal = cart.reduce((total, item) => total + (item.discountedPrice || item.price), 0);
    const cartOriginalTotal = cart.reduce((total, item) => total + item.price, 0);

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            removeFromCart,
            clearCart,
            applyCouponToCart,
            fetchCart,
            cartTotal,
            cartOriginalTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
