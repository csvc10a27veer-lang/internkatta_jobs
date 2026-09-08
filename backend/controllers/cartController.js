const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');
const Coupon = require('../models/couponModel');

// Helper to calculate discounted price
const calculateDiscount = async (itemType, itemId, couponCode, userId) => {
    let ItemModel = itemType === 'Course' ? Course : Internship;
    const item = await ItemModel.findById(itemId);
    
    if (!item || item.deleted) {
        throw new Error(`${itemType} not found`);
    }

    let actualFinalPrice = item.discountedPrice || item.price;
    let appliedCouponId = null;

    if (couponCode) {
        const query = { 
            code: couponCode.toUpperCase(),
            isActive: true,
            validUntil: { $gt: new Date() }
        };
        
        if (itemType === 'Course') {
            query.courseId = itemId;
        } else {
            query.internshipId = itemId;
        }

        const coupon = await Coupon.findOne(query);

        if (!coupon) {
            throw new Error('Invalid or expired coupon code');
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            throw new Error('Coupon usage limit exceeded');
        }

        const hasUsedCoupon = coupon.usedBy.some(usage => 
            usage.user.toString() === userId.toString()
        );

        if (hasUsedCoupon) {
            throw new Error('You have already used this coupon');
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (actualFinalPrice * coupon.discountAmount) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else {
            discountAmount = coupon.discountAmount;
        }

        if (discountAmount > actualFinalPrice) {
            discountAmount = actualFinalPrice;
        }

        actualFinalPrice = actualFinalPrice - discountAmount;
        appliedCouponId = coupon._id;
    }

    return {
        price: item.discountedPrice || item.price,
        discountedPrice: actualFinalPrice,
        couponId: appliedCouponId,
        name: item.title,
        thumbnail: item.thumbnailUrl || (item.thumbnail ? item.thumbnail.url : null)
    };
};

const addToCart = async (req, res) => {
    try {
        const { itemType, itemId, couponCode } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already in cart
        const exists = user.cart.some(cartItem => 
            cartItem.itemId.toString() === itemId.toString() && 
            cartItem.itemType === itemType
        );

        if (exists) {
            return res.status(400).json({ message: 'Item is already in cart' });
        }

        // Check if already enrolled
        if (itemType === 'Course') {
            const isEnrolled = user.enrolledCourses.some(id => id.toString() === itemId.toString());
            if (isEnrolled) return res.status(400).json({ message: 'Already enrolled in this course' });
        } else {
            const isEnrolled = user.enrolledInternships.some(id => id.toString() === itemId.toString());
            if (isEnrolled) return res.status(400).json({ message: 'Already enrolled in this internship' });
        }

        // Calculate price and validate coupon
        const { price, discountedPrice, couponId, name, thumbnail } = await calculateDiscount(itemType, itemId, couponCode, userId);

        user.cart.push({
            itemType,
            itemId,
            price,
            discountedPrice,
            couponCode: couponCode ? couponCode.toUpperCase() : null,
            couponId,
            name,
            thumbnail
        });

        await user.save();

        res.status(200).json({ success: true, message: 'Added to cart', cart: user.cart });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to add to cart' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.cart = user.cart.filter(item => item.itemId.toString() !== itemId);
        await user.save();

        res.status(200).json({ success: true, message: 'Removed from cart', cart: user.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to remove from cart' });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Refresh thumbnails dynamically so existing buggy cart items are fixed
        const updatedCart = await Promise.all(user.cart.map(async (item) => {
            const ItemModel = item.itemType === 'Course' ? Course : Internship;
            const realItem = await ItemModel.findById(item.itemId).select('thumbnailUrl thumbnail');
            let realThumbnail = null;
            if (realItem) {
                realThumbnail = realItem.thumbnailUrl || (realItem.thumbnail ? realItem.thumbnail.url : null);
            }
            return {
                ...item.toObject(),
                thumbnail: realThumbnail || item.thumbnail
            };
        }));

        res.status(200).json({ success: true, cart: updatedCart });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: 'Failed to get cart' });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.cart = [];
        await user.save();

        res.status(200).json({ success: true, message: 'Cart cleared', cart: [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to clear cart' });
    }
};

const applyCouponToCartItem = async (req, res) => {
    try {
        const { itemId, couponCode } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const cartItemIndex = user.cart.findIndex(item => item.itemId.toString() === itemId.toString());
        if (cartItemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        const cartItem = user.cart[cartItemIndex];

        // Re-calculate discount
        const { price, discountedPrice, couponId } = await calculateDiscount(
            cartItem.itemType, 
            itemId, 
            couponCode, 
            userId
        );

        user.cart[cartItemIndex].price = price;
        user.cart[cartItemIndex].discountedPrice = discountedPrice;
        user.cart[cartItemIndex].couponCode = couponCode.toUpperCase();
        user.cart[cartItemIndex].couponId = couponId;

        await user.save();

        res.status(200).json({ success: true, message: 'Coupon applied', cart: user.cart });
    } catch (error) {
        console.error('Apply coupon error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to apply coupon' });
    }
};

module.exports = {
    addToCart,
    removeFromCart,
    getCart,
    clearCart,
    applyCouponToCartItem
};
