const mongoose = require('mongoose');

// --- NEW: Define a schema for tracking progress in a single course ---
// Defining it separately keeps the main userSchema clean.
const courseProgressSchema = new mongoose.Schema({
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course' 
    },
    completedLectures: [{
        lectureId: { type: mongoose.Schema.Types.ObjectId },
        status: { type: String, enum: ['Completed'], default: 'Completed' },
        completedAt: { type: Date, default: Date.now }
    }],
    lastWatchedLecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' },
    lastWatchedTimestamp: { type: Number, default: 0 }
}, { _id: false }); // _id: false prevents MongoDB from creating an extra _id for this subdocument

// --- We can also define the internshipProgressSchema separately for consistency ---
const internshipProgressSchema = new mongoose.Schema({
    internshipId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Internship' 
    },
    completedLectures: [{
        lectureId: { type: mongoose.Schema.Types.ObjectId }, 
        status: { 
            type: String, 
            enum: ['Not Started', 'Pending', 'Approved', 'Rejected', 'Completed', 'QuizPassed'], 
            default: 'Not Started' 
        },
        submittedFile: {
            public_id: String,
            url: String
        },
        submittedFiles: [{
            public_id: String,
            url: String
        }],
        submittedAt: { type: Date },
        completedAt: { type: Date }
    }]
}, { _id: false });


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: false, // Make optional by default
        validate: {
            validator: function(v) {
                // If loginMethod is 'google', fullName is optional
                if (this.loginMethod === 'google') {
                    return true; // Always valid for Google users (can be empty)
                }
                // For non-Google users, fullName must be provided
                if (!v || v.trim().length === 0) {
                    return false;
                }
                return true;
            },
            message: 'Please provide a full name'
        }
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,10}$/,
            'Please provide a valid email',
        ],
    },
    phone: {
        type: String,
        required: false, // Make optional by default
        validate: {
            validator: function(v) {
                // If loginMethod is 'google', phone is optional
                if (this.loginMethod === 'google') {
                    return true; // Always valid for Google users (can be empty)
                }
                // For non-Google users, phone must be provided
                if (!v || v.trim().length === 0) {
                    return false;
                }
                return true;
            },
            message: 'Please provide a phone number'
        }
    },
    password: {
        type: String,
        required: false, // Make optional by default
        validate: {
            validator: function(v) {
                // If loginMethod is 'google', password is optional
                if (this.loginMethod === 'google') {
                    return true; // Always valid for Google users (can be empty)
                }
                // For non-Google users, password must be provided and at least 6 characters
                if (!v || v.length < 6) {
                    return false;
                }
                return true;
            },
            message: 'Password must be at least 6 characters'
        }
    },
    securityQuestion: {
        type: String,
        required: false,
    },
    securityAnswer: {
        type: String,
        required: false, // Make optional by default
        validate: {
            validator: function(v) {
                // If loginMethod is 'google', securityAnswer is optional
                if (this.loginMethod === 'google') {
                    return true; // Always valid for Google users (can be empty)
                }
                // For non-Google users, securityAnswer must be provided
                if (!v || v.trim().length === 0) {
                    return false;
                }
                return true;
            },
            message: 'Please provide a security answer'
        }
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    status: {
        type: String,
        default: 'Active',
        enum: ['Active', 'Suspended', 'Inactive']
    },
    suspensionReason: {
        type: String
    },
    suspendedAt: {
        type: Date
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    profilePicture: {
        type: String
    },
    loginMethod: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course' 
    }],
    enrolledInternships: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship'
    }],
    
    // Both progress fields now use the clean, predefined schemas
    internshipProgress: [internshipProgressSchema],
    courseProgress: [courseProgressSchema],
    
    // Cart array for Add to Cart feature
    cart: [{
        itemType: { type: String, enum: ['Course', 'Internship'], required: true },
        itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'cart.itemType' },
        price: { type: Number, required: true },
        discountedPrice: { type: Number, required: true },
        couponCode: { type: String },
        couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
        name: { type: String },
        thumbnail: { type: String }
    }]
}, {
    timestamps: true,
});

// Pre-validate hook to handle Google user validation
// This runs BEFORE Mongoose validates required fields
userSchema.pre('validate', function(next) {
    console.log('[Pre-validate] loginMethod:', this.loginMethod);
    console.log('[Pre-validate] isNew:', this.isNew);
    
    // If loginMethod is 'google', ensure optional fields have defaults
    if (this.loginMethod === 'google') {
        // Ensure fullName has a default value if not provided
        if (!this.fullName || this.fullName.trim() === '') {
            this.fullName = 'Google User';
        }
        // phone, password, and securityAnswer are optional for Google users
        // They can remain undefined - the conditional required function should handle this
        console.log('[Pre-validate] Google user - setting defaults');
    }
    next();
});

// Pre-save hook for additional Google user handling
userSchema.pre('save', function(next) {
    // Ensure fullName has a default for Google users
    if (this.loginMethod === 'google' && (!this.fullName || this.fullName.trim() === '')) {
        this.fullName = 'Google User';
    }
    next();
});

module.exports = mongoose.model('User', userSchema);