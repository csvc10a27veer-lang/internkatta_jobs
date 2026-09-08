// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const asyncHandler = require('express-async-handler');

const protectUser = asyncHandler(async (req, res, next) => {
    let token;
    // Check for user-specific authorization header first
    if (req.headers['user-authorization'] && req.headers['user-authorization'].startsWith('Bearer')) {
        token = req.headers['user-authorization'].split(' ')[1];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Fallback to regular authorization header for backward compatibility
        token = req.headers.authorization.split(' ')[1];
    } 
    // --- THIS IS THE NEWLY ADDED LOGIC ---
    // Fallback to a query parameter, which is needed for download links (<a> tags)
    else if (req.query.token) {
        token = req.query.token;
    }
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                res.status(401);
                throw new Error('User not found');
            }
            req.user = user;
            next();
        } catch (error) {
            // Provide more specific error messages
            if (error.name === 'TokenExpiredError') {
                res.status(401);
                throw new Error('Token expired. Please login again.');
            } else if (error.name === 'JsonWebTokenError') {
                res.status(401);
                throw new Error('Invalid token. Please login again.');
            } else {
                res.status(401);
                throw new Error('Not authorized, token failed');
            }
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const protectAdmin = asyncHandler(async (req, res, next) => {
    let token;
    
    // Check for admin-specific authorization header first
    if (req.headers['admin-authorization'] && req.headers['admin-authorization'].startsWith('Bearer')) {
        token = req.headers['admin-authorization'].split(' ')[1];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Fallback to regular authorization header for backward compatibility
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await Admin.findById(decoded.id).select('-password');
            
            if (!admin) {
                res.status(401);
                throw new Error('Admin not found');
            }
            
            req.user = admin.toObject();
            req.user.role = 'admin';
            next();
        } catch (error) {
            // Provide more specific error messages
            if (error.name === 'TokenExpiredError') {
                console.error('Admin auth failed: jwt expired');
                res.status(401);
                throw new Error('Token expired. Please login again.');
            } else if (error.name === 'JsonWebTokenError') {
                console.error('Admin auth failed: invalid token');
                res.status(401);
                throw new Error('Invalid token. Please login again.');
            } else {
                console.error('Admin auth failed:', error.message);
                res.status(401);
                throw new Error('Not authorized as admin, token failed');
            }
        }
    } else {
        res.status(401);
        throw new Error('Not authorized as admin, no token');
    }
});

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Not an admin role.' });
    }
};

const optionalUser = asyncHandler(async (req, res, next) => {
    let token;
    // Check for user-specific authorization header first
    if (req.headers['user-authorization'] && req.headers['user-authorization'].startsWith('Bearer')) {
        token = req.headers['user-authorization'].split(' ')[1];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Fallback to regular authorization header for backward compatibility
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }
    
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
        } catch (error) {
            console.log('Optional user verification failed (non-blocking):', error.message);
        }
    }
    next();
});

module.exports = {
    protectUser,
    protectAdmin,
    isAdmin,
    optionalUser,
};