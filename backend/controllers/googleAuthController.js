// backend/controllers/googleAuthController.js

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');

// Validate that GOOGLE_CLIENT_ID is set
if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('❌ ERROR: GOOGLE_CLIENT_ID is not set in environment variables!');
    console.error('Please add GOOGLE_CLIENT_ID to your .env file');
} else {
    console.log('✅ GOOGLE_CLIENT_ID is configured:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google OAuth for Users
const googleUserAuth = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        // Validate GOOGLE_CLIENT_ID is set
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('❌ GOOGLE_CLIENT_ID is missing from environment variables');
            return res.status(500).json({ 
                message: 'Server configuration error: Google Client ID not configured' 
            });
        }

        console.log('🔐 Verifying Google token for user...');
        console.log('Backend Client ID:', process.env.GOOGLE_CLIENT_ID);

        // Verify the Google token
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            console.log('✅ Google token verified successfully');
        } catch (verifyError) {
            console.error('❌ Google token verification failed:', verifyError.message);
            
            // Try to extract audience from error for debugging
            if (verifyError.message && verifyError.message.includes('audience')) {
                // Decode token without verification to see what audience it expects
                try {
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.decode(token, { complete: true });
                    if (decoded && decoded.payload && decoded.payload.aud) {
                        console.error('Token audience (from token):', decoded.payload.aud);
                        console.error('Expected audience (from backend):', process.env.GOOGLE_CLIENT_ID);
                        console.error('❌ AUDIENCE MISMATCH - Token was issued for a different client ID!');
                        console.error('💡 SOLUTION: Ensure frontend and backend use the SAME Google Client ID');
                        console.error('💡 Also check: Clear browser cache, rebuild frontend, check Google Cloud Console');
                    }
                } catch (decodeError) {
                    console.error('Could not decode token for debugging:', decodeError.message);
                }
            }
            
            return res.status(401).json({ 
                message: 'Google token verification failed',
                error: verifyError.message 
            });
        }

        const payload = ticket.getPayload();
        console.log('Google payload:', JSON.stringify(payload, null, 2));
        
        // Extract user data from Google payload
        const email = payload.email || payload['email'];
        const name = payload.name || payload['name'] || payload.given_name + ' ' + payload.family_name || 'Google User';
        const picture = payload.picture || payload['picture'] || '';
        const googleId = payload.sub || payload['sub'];

        console.log('Extracted data:', { email, name, picture, googleId });

        if (!email) {
            return res.status(400).json({ message: 'Email not provided by Google' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user - ONLY use fields that Google provides
            // Use new User() instead of User.create() to ensure loginMethod is set before validation
            console.log('Creating new Google user...');
            console.log('Google data:', { email, name, googleId, picture });
            
            // Create user instance and set loginMethod FIRST (before other fields)
            user = new User();
            user.loginMethod = 'google'; // CRITICAL: Set this FIRST before any validation
            user.email = email;
            user.fullName = name || 'Google User';
            user.profilePicture = picture || '';
            user.googleId = googleId || '';
            // phone, password, and securityAnswer are NOT set - they're optional for Google users
            
            console.log('User instance before save:', {
                loginMethod: user.loginMethod,
                email: user.email,
                fullName: user.fullName,
                hasPhone: !!user.phone,
                hasPassword: !!user.password,
                hasSecurityAnswer: !!user.securityAnswer
            });
            
            try {
                // Save the user - this will trigger validation
                // The pre-validate hook and conditional required functions should now work correctly
                await user.save();
                console.log('✅ Google user created successfully with ID:', user._id);
            } catch (saveError) {
                console.error('❌ User.save() failed:', saveError);
                console.error('Error details:', {
                    name: saveError.name,
                    message: saveError.message,
                    errors: saveError.errors ? Object.keys(saveError.errors) : 'No errors object'
                });
                if (saveError.errors) {
                    Object.keys(saveError.errors).forEach(key => {
                        console.error(`  - ${key}:`, saveError.errors[key].message);
                    });
                }
                throw saveError;
            }
        } else {
            // Update existing user with Google info if not already set
            if (!user.googleId) {
                user.googleId = googleId;
                user.profilePicture = picture;
                user.loginMethod = 'google';
                await user.save();
            }
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: 'user' 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Google authentication successful',
            token: jwtToken,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture,
                role: 'user',
                needsSecuritySetup: !user.securityQuestion || !user.securityAnswer
            }
        });

    } catch (error) {
        console.error('Google user auth error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        res.status(500).json({ 
            message: 'Google authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Google OAuth for Admins
const googleAdminAuth = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        // Validate GOOGLE_CLIENT_ID is set
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('❌ GOOGLE_CLIENT_ID is missing from environment variables');
            return res.status(500).json({ 
                message: 'Server configuration error: Google Client ID not configured' 
            });
        }

        console.log('🔐 Verifying Google token for admin...');
        console.log('Backend Client ID:', process.env.GOOGLE_CLIENT_ID);

        // Verify the Google token
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            console.log('✅ Google token verified successfully');
        } catch (verifyError) {
            console.error('❌ Google token verification failed:', verifyError.message);
            
            // Try to extract audience from error for debugging
            if (verifyError.message && verifyError.message.includes('audience')) {
                try {
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.decode(token, { complete: true });
                    if (decoded && decoded.payload && decoded.payload.aud) {
                        console.error('Token audience (from token):', decoded.payload.aud);
                        console.error('Expected audience (from backend):', process.env.GOOGLE_CLIENT_ID);
                        console.error('❌ AUDIENCE MISMATCH - Token was issued for a different client ID!');
                    }
                } catch (decodeError) {
                    console.error('Could not decode token for debugging:', decodeError.message);
                }
            }
            
            return res.status(401).json({ 
                message: 'Google token verification failed',
                error: verifyError.message 
            });
        }

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if admin already exists
        let admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ 
                message: 'Admin account not found. Please contact administrator.' 
            });
        }

        // Update admin with Google info if not already set
        if (!admin.googleId) {
            admin.googleId = googleId;
            admin.profilePicture = picture;
            admin.loginMethod = 'google';
            await admin.save();
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { 
                id: admin._id, 
                email: admin.email, 
                role: 'admin' 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Google admin authentication successful',
            token: jwtToken,
            admin: {
                id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                profilePicture: admin.profilePicture,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error('Google admin auth error:', error);
        res.status(500).json({ message: 'Google authentication failed' });
    }
};

module.exports = {
    googleUserAuth,
    googleAdminAuth
};
