const express = require('express');
const router = express.Router();
const { protectUser } = require('../middleware/authMiddleware');
const {
    addToCart,
    removeFromCart,
    getCart,
    clearCart,
    applyCouponToCartItem
} = require('../controllers/cartController');

router.use(protectUser);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/apply-coupon', applyCouponToCartItem);
router.delete('/remove/:itemId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
