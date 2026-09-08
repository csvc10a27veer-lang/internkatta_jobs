// backend/controllers/couponController.js

const Coupon = require('../models/couponModel');
const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');

// @desc    Create a new coupon (Admin only)
const createCoupon = async (req, res) => {
    try {
        console.log('Coupon creation request body:', req.body);
        const { 
            code, 
            discountAmount, 
            discountType, 
            maxDiscountAmount,
            courseId, 
            internshipId, 
            usageLimit, 
            validUntil 
        } = req.body;

        // Validate that either courseId or internshipId is provided, but not both
        if (!courseId && !internshipId) {
            return res.status(400).json({ 
                message: 'Either courseId or internshipId must be provided' 
            });
        }

        if (courseId && internshipId) {
            return res.status(400).json({ 
                message: 'Cannot create coupon for both course and internship' 
            });
        }

        // Check if course/internship exists
        if (courseId) {
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }
        }

        if (internshipId) {
            const internship = await Internship.findById(internshipId);
            if (!internship) {
                return res.status(404).json({ message: 'Internship not found' });
            }
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountAmount,
            discountType: discountType || 'fixed',
            maxDiscountAmount,
            courseId: courseId || null,
            internshipId: internshipId || null,
            usageLimit: usageLimit || 1,
            validUntil: new Date(validUntil),
            createdBy: req.user._id
        });

        res.status(201).json(coupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        console.error('Error details:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                details: error.message 
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all coupons (Admin only)
const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({})
            .populate('courseId', 'title')
            .populate('internshipId', 'title')
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 });
        
        res.status(200).json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get coupons for a specific course or internship (Admin only)
const getCouponsByItem = async (req, res) => {
    try {
        const { itemId, itemType } = req.params;
        
        let query = {};
        if (itemType === 'course') {
            query.courseId = itemId;
        } else if (itemType === 'internship') {
            query.internshipId = itemId;
        } else {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        const coupons = await Coupon.find(query)
            .populate('courseId', 'title')
            .populate('internshipId', 'title')
            .sort({ createdAt: -1 });
        
        res.status(200).json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Validate and apply coupon (User)
const validateCoupon = async (req, res) => {
    try {
        const { code, courseId, internshipId } = req.body;
        const userId = req.user?._id;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        if (!courseId && !internshipId) {
            return res.status(400).json({ message: 'Either courseId or internshipId is required' });
        }

        // Find the coupon
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(),
            isActive: true,
            validUntil: { $gt: new Date() }
        });

        if (!coupon) {
            return res.status(400).json({ message: 'Invalid or expired coupon' });
        }

        // Check if coupon is for a specific course
        if (coupon.courseId) {
            if (!courseId || coupon.courseId.toString() !== courseId) {
                return res.status(400).json({ message: 'This coupon is not valid for this course or internship' });
            }
        }

        // Check if coupon is for a specific internship
        if (coupon.internshipId) {
            if (!internshipId || coupon.internshipId.toString() !== internshipId) {
                return res.status(400).json({ message: 'This coupon is not valid for this course or internship' });
            }
        }

        // Check usage limit
        if (coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit exceeded' });
        }

        // Check if user has already used this coupon (only if user is logged in)
        if (userId) {
            const hasUsedCoupon = coupon.usedBy.some(usage => 
                usage.user.toString() === userId.toString()
            );

            if (hasUsedCoupon) {
                return res.status(400).json({ message: 'You have already used this coupon' });
            }
        }

        // Get the item price
        let itemPrice = 0;
        if (courseId) {
            const course = await Course.findById(courseId);
            if (course) {
                itemPrice = course.discountedPrice || course.price;
            }
        } else if (internshipId) {
            const internship = await Internship.findById(internshipId);
            if (internship) {
                itemPrice = internship.discountedPrice || internship.price;
            }
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (itemPrice * coupon.discountAmount) / 100;
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else {
            discountAmount = coupon.discountAmount;
        }

        // Ensure discount doesn't exceed item price
        if (discountAmount > itemPrice) {
            discountAmount = itemPrice;
        }

        const finalPrice = itemPrice - discountAmount;

        res.status(200).json({
            valid: true,
            coupon: {
                code: coupon.code,
                discountAmount: discountAmount,
                discountType: coupon.discountType,
                originalPrice: itemPrice,
                finalPrice: finalPrice
            }
        });

    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Apply coupon and mark as used (User)
const applyCoupon = async (req, res) => {
    try {
        const { code, courseId, internshipId } = req.body;
        const userId = req.user._id;

        // First validate the coupon
        const validationResult = await validateCoupon(req, res);
        if (validationResult.statusCode !== 200) {
            return validationResult;
        }

        // Find and update the coupon
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        
        // Add user to usedBy array and increment usedCount
        coupon.usedBy.push({ user: userId });
        coupon.usedCount += 1;
        
        await coupon.save();

        res.status(200).json({
            message: 'Coupon applied successfully',
            coupon: validationResult.data.coupon
        });

    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete coupon (Admin only)
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await coupon.deleteOne();
        res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update coupon (Admin only)
const updateCoupon = async (req, res) => {
    try {
        const { isActive, usageLimit, validUntil } = req.body;
        
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        if (isActive !== undefined) coupon.isActive = isActive;
        if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
        if (validUntil !== undefined) coupon.validUntil = new Date(validUntil);

        await coupon.save();
        res.status(200).json(coupon);
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createCoupon,
    getCoupons,
    getCouponsByItem,
    validateCoupon,
    applyCoupon,
    deleteCoupon,
    updateCoupon
};
