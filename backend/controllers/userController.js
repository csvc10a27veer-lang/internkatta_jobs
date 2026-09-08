// backend/controllers/userController.js

const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Notification = require('../models/notificationModel');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Certificate = require('../models/certificateModel');
const xss = require('xss');
const OTP = require('../models/otpModel');
const { sendSMS } = require('../utils/smsService');
const { sendEmail } = require('../utils/emailService');


// Helper to find or lazily create a Certificate record
const getOrCreateCertificateRecord = async (user, item, itemType) => {
    const query = {
        userId: user._id,
        type: itemType
    };
    if (itemType === 'course') {
        query.courseId = item._id;
    } else {
        query.internshipId = item._id;
    }

    let certificate = await Certificate.findOne(query);
    if (!certificate) {
        const userSuffix = user._id.toString().slice(-6).toUpperCase();
        const itemSuffix = item._id.toString().slice(-6).toUpperCase();

        let certificateId;
        if (itemType === 'course') {
            certificateId = `IK-${userSuffix}-${itemSuffix}`;
        } else {
            certificateId = `IK-INT-${userSuffix}-${itemSuffix}`;
        }

        const shareUrl = `https://internkatta.com/download-certificate?certificateId=${certificateId}&type=${itemType}`;

        certificate = new Certificate({
            certificateId,
            userId: user._id,
            courseId: itemType === 'course' ? item._id : null,
            internshipId: itemType === 'internship' ? item._id : null,
            type: itemType,
            shareUrl
        });
        await certificate.save();
    }
    return certificate;
};

// Helper to generate JWT for regular users
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const idsMatch = (left, right) => left?.toString() === right?.toString();

const getInternshipProgressForUser = (user, internshipId) => (
    user.internshipProgress?.find(p => idsMatch(p.internshipId, internshipId))
);

const isLectureCompleted = (lecture, progress) => {
    if (!lecture) return false;
    const item = progress?.completedLectures?.find(p => idsMatch(p.lectureId, lecture._id));
    const status = item?.status;
    if (!status) return false;

    const hasQuiz = lecture.mcqs && lecture.mcqs.some(mcq => mcq.question && mcq.question.trim().length > 0);
    const hasTask = !!lecture.taskPrompt && lecture.taskPrompt.trim().length > 0;

    if (hasQuiz && hasTask) {
        return status === 'Completed';
    } else if (hasQuiz) {
        return status === 'QuizPassed' || status === 'Completed';
    } else if (hasTask) {
        return status === 'Approved' || status === 'Completed';
    } else {
        return status === 'Completed' || status === 'Approved' || status === 'QuizPassed';
    }
};

const getLectureAccessInfo = (internship, progress, lectureId) => {
    const lectures = internship?.lectures || [];
    const lectureIndex = lectures.findIndex(l => idsMatch(l._id, lectureId));

    if (lectureIndex === -1) {
        return { lectureIndex, isAccessible: false, message: 'Lecture not found.' };
    }

    const isAccessible = lectureIndex === 0 || lectures
        .slice(0, lectureIndex)
        .every(lecture => isLectureCompleted(lecture, progress));

    return {
        lectureIndex,
        isAccessible,
        message: isAccessible ? null : 'Please complete the previous lecture before accessing this one.'
    };
};


// --- THIS IS THE ROBUST AND CORRECTED FUNCTION ---
// @desc    Authenticate a user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login attempt failed: User with email ${email} not found.`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log(`Login successful for user: ${email}`);
            res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                // Add other necessary fields here
            });
        } else {
            console.log(`Login attempt failed: Invalid password for user ${email}.`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('SERVER ERROR during login:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// --- OTHER FUNCTIONS (No changes needed) ---

// --- THIS IS THE CORRECTED AND IMPLEMENTED FUNCTION ---
// @desc    Submit a quiz and update lecture status
// @route   POST /api/users/submit-quiz
// @access  Private
const submitQuiz = async (req, res) => {
    try {
        const { internshipId, lectureId, answers } = req.body;
        const userId = req.user._id;

        const [internship, user] = await Promise.all([
            Internship.findById(internshipId).lean(),
            User.findById(userId)
        ]);

        if (!internship) return res.status(404).json({ message: 'Internship not found.' });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const lecture = internship.lectures.find(l => l._id.toString() === lectureId);
        if (!lecture || !lecture.mcqs || lecture.mcqs.length === 0) {
            return res.status(404).json({ message: 'Lecture or quiz not found.' });
        }

        const currentProgress = getInternshipProgressForUser(user, internshipId);
        const accessInfo = getLectureAccessInfo(internship, currentProgress, lectureId);
        if (!accessInfo.isAccessible) {
            return res.status(403).json({ message: accessInfo.message });
        }

        const lectureProgress = currentProgress?.completedLectures?.find(item => idsMatch(item.lectureId, lectureId));

        if (Object.keys(answers).length !== lecture.mcqs.length) {
            return res.status(400).json({ message: 'Please answer all questions.' });
        }

        let score = 0;
        const correctAnswers = {};
        lecture.mcqs.forEach(mcq => {
            const mcqIdString = mcq._id.toString();
            correctAnswers[mcqIdString] = mcq.correctAnswer;
            if (answers[mcqIdString] == mcq.correctAnswer) {
                score++;
            }
        });

        const passPercentage = 0.75; // 75% to pass
        const passed = (score / lecture.mcqs.length) >= passPercentage;
        // Refetch user to get latest progress for response
        let updatedProgress = getInternshipProgressForUser(user, internshipId);

        if (passed) {
            // Use findOneAndUpdate with arrayFilters for reliable nested updates
            const userObjId = new mongoose.Types.ObjectId(userId);
            const internshipObjId = new mongoose.Types.ObjectId(internshipId);
            const lectureObjId = new mongoose.Types.ObjectId(lectureId);

            try {
                let updatedUser;
                if (lectureProgress) {
                    // Update existing progress based on task approval status
                    // If the task is already approved, mark lecture completed after quiz pass
                    const lectureStatusToSet = lectureProgress.status === 'Not Started'
                        ? 'QuizPassed'
                        : lectureProgress.status === 'Approved'
                            ? 'Completed'
                            : lectureProgress.status;

                    updatedUser = await User.findOneAndUpdate(
                        {
                            _id: userObjId,
                            'internshipProgress.internshipId': internshipObjId,
                            'internshipProgress.completedLectures.lectureId': lectureObjId
                        },
                        {
                            $set: {
                                'internshipProgress.$[i].completedLectures.$[j].status': lectureStatusToSet,
                                'internshipProgress.$[i].completedLectures.$[j].completedAt': new Date()
                            }
                        },
                        {
                            arrayFilters: [
                                { 'i.internshipId': internshipObjId },
                                { 'j.lectureId': lectureObjId }
                            ],
                            new: true
                        }
                    );
                } else {
                    // Add new lecture progress with QuizPassed status
                    updatedUser = await User.findOneAndUpdate(
                        {
                            _id: userObjId,
                            'internshipProgress.internshipId': internshipObjId
                        },
                        {
                            $push: {
                                'internshipProgress.$[i].completedLectures': {
                                    lectureId: lectureObjId,
                                    status: 'QuizPassed',
                                    completedAt: new Date()
                                }
                            }
                        },
                        {
                            arrayFilters: [
                                { 'i.internshipId': internshipObjId }
                            ],
                            new: true
                        }
                    );

                    // If internship progress array didn't exist, create it
                    if (!updatedUser) {
                        updatedUser = await User.findOneAndUpdate(
                            { _id: userObjId },
                            {
                                $push: {
                                    internshipProgress: {
                                        internshipId: internshipObjId,
                                        completedLectures: [{
                                            lectureId: lectureObjId,
                                            status: 'QuizPassed',
                                            completedAt: new Date()
                                        }]
                                    }
                                }
                            },
                            { new: true }
                        );
                    }
                }

                if (updatedUser) {
                    // Get updated progress from the returned user
                    updatedProgress = updatedUser.internshipProgress.find(p => p.internshipId.toString() === internshipId);
                }
            } catch (updateError) {
                console.error('Error updating quiz completion status:', updateError);
                console.error('Update error details:', {
                    name: updateError.name,
                    message: updateError.message,
                    stack: updateError.stack
                });
                // Continue even if update fails - we still want to return quiz results
            }
        }

        res.status(200).json({
            passed,
            score,
            totalQuestions: lecture.mcqs.length,
            correctAnswers,
            message: passed ? 'Quiz passed!' : 'Review your answers and try again.',
            progress: updatedProgress
        });

    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Generate OTP Helper
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        // Generate OTP and save
        const otp = generateOTP();
        await OTP.deleteMany({ phone }); // Clear old OTPs for this phone
        await OTP.create({ phone, otp });

        // Send SMS
        await sendSMS(phone, otp);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

        const record = await OTP.findOne({ phone, otp });
        if (!record) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Generate a short-lived verification token (e.g. 15 mins)
        const verificationToken = jwt.sign({ verifiedPhone: phone }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
        
        // Remove OTP record so it can't be reused
        await OTP.deleteOne({ _id: record._id });

        res.status(200).json({ message: 'OTP verified successfully', verificationToken });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

const sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email address is required' });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }

        // Generate OTP and save
        const otp = generateOTP();
        await OTP.deleteMany({ email }); // Clear old OTPs for this email
        await OTP.create({ email, otp });

        // Send Email
        const html = `<h2>Email Verification</h2><p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`;
        const result = await sendEmail({
            to: email,
            subject: 'Verify your email address - Internkatta',
            html: html,
            text: `Your verification code is: ${otp}`
        });

        if (result.success) {
            res.status(200).json({ message: 'OTP sent successfully to email' });
        } else {
            res.status(500).json({ message: 'Failed to send OTP email', error: result.error });
        }
    } catch (error) {
        console.error('Error sending email OTP:', error);
        res.status(500).json({ message: 'Failed to send email OTP' });
    }
};

const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const record = await OTP.findOne({ email, otp });
        if (!record) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Generate a short-lived verification token (e.g. 15 mins)
        const verificationToken = jwt.sign({ verifiedEmail: email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
        
        // Remove OTP record so it can't be reused
        await OTP.deleteOne({ _id: record._id });

        res.status(200).json({ message: 'Email OTP verified successfully', verificationToken });
    } catch (error) {
        console.error('Error verifying email OTP:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

const registerUser = async (req, res) => {
    try {
        let { fullName, email, phone, password, securityQuestion, securityAnswer, verificationToken } = req.body;
        
        // Sanitize the display name to prevent XSS
        if (fullName) {
            fullName = xss(fullName);
        }

        if (!fullName || !email || !phone || !password || !securityAnswer) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        if (!verificationToken) {
            return res.status(400).json({ message: 'Email verification is required' });
        }

        // Verify the verificationToken
        try {
            const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET || 'fallback_secret');
            if (decoded.verifiedEmail !== email) {
                return res.status(400).json({ message: 'Email mismatch with verification token' });
            }
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired verification token' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            fullName,
            email,
            phone,
            password: hashedPassword,
            securityQuestion: securityQuestion || '',
            securityAnswer,
            role: 'user'
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Step 1 of password recovery - check if an account exists for the given email
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email address' });
        }

        // Case-insensitive lookup so "User@Gmail.com" still matches "user@gmail.com"
        const user = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: 'i' } });

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        
        if (!user.securityAnswer || !user.securityQuestion) {
            // Instead of blocking, tell the frontend to show the setup flow
            return res.status(200).json({
                noSecurityQuestion: true,
                email: user.email,
                message: 'No security question found. Please set one to recover your account.'
            });
        }

        return res.status(200).json({ message: 'Account found', email: user.email, securityQuestion: user.securityQuestion });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error while looking up account' });
    }
};

// @desc    Step 2 of password recovery - verify the security answer
// @route   POST /api/users/verify-security-answer
// @access  Public
const verifySecurityAnswer = async (req, res) => {
    try {
        const { email, securityAnswer } = req.body;
        if (!email || !securityAnswer) {
            return res.status(400).json({ message: 'Please provide the email and your answer' });
        }

        const user = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: 'i' } });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        const storedAnswer = (user.securityAnswer || '').trim().toLowerCase();
        const providedAnswer = securityAnswer.trim().toLowerCase();

        if (!storedAnswer) {
            return res.status(400).json({ message: 'No security answer set for this account. Please contact support.' });
        }

        if (storedAnswer !== providedAnswer) {
            return res.status(400).json({ message: 'Incorrect answer. Please try again.' });
        }

        return res.status(200).json({ message: 'Answer verified' });
    } catch (error) {
        console.error('Verify security answer error:', error);
        res.status(500).json({ message: 'Server error while verifying answer' });
    }
};

// @desc    Step 3 of password recovery - set a new password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, securityAnswer, newPassword } = req.body;
        if (!email || !securityAnswer || !newPassword) {
            return res.status(400).json({ message: 'Please provide email, security answer, and a new password' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: 'i' } });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        // Re-verify the security answer server-side before allowing the reset,
        // so this endpoint can't be called on its own to bypass step 2.
        const storedAnswer = (user.securityAnswer || '').trim().toLowerCase();
        const providedAnswer = securityAnswer.trim().toLowerCase();
        if (!storedAnswer || storedAnswer !== providedAnswer) {
            return res.status(400).json({ message: 'Incorrect answer. Please try again.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error while resetting password' });
    }
};

// @desc    Set security question and answer (for Google Login users)
// @route   POST /api/users/set-security-question
// @access  Private
const setSecurityQuestion = async (req, res) => {
    try {
        const { securityQuestion, securityAnswer } = req.body;
        if (!securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: 'Please provide both a security question and an answer.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.securityQuestion = securityQuestion;
        user.securityAnswer = securityAnswer;
        await user.save();

        res.status(200).json({ message: 'Security question set successfully.' });
    } catch (error) {
        console.error('Set security question error:', error);
        res.status(500).json({ message: 'Server error while setting security question.' });
    }
};

// @desc    Set security question by email (Public - for Forgot Password flow)
// @route   POST /api/users/setup-security-question
// @access  Public
const setupSecurityQuestionByEmail = async (req, res) => {
    try {
        const { email, securityQuestion, securityAnswer } = req.body;
        if (!email || !securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: 'Please provide email, question, and answer.' });
        }

        const user = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: 'i' } });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        user.securityQuestion = securityQuestion;
        user.securityAnswer = securityAnswer;
        await user.save();

        res.status(200).json({
            message: 'Security question set successfully.',
            securityQuestion: user.securityQuestion
        });
    } catch (error) {
        console.error('Setup security question by email error:', error);
        res.status(500).json({ message: 'Server error while setting security question.' });
    }
};

const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required." });
        }

        // Validate ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid course ID format." });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if already enrolled (convert to string for comparison)
        const enrolledIds = (user.enrolledCourses || []).map(id => id.toString());
        if (enrolledIds.includes(courseId.toString())) {
            return res.status(400).json({ message: "You are already enrolled in this course." });
        }

        // --- PAYMENT GUARD ---
        // Admins can enroll any user for free (manual admin-panel enrollments).
        // Regular users must have a COMPLETED payment for paid courses.
        if (req.user.role !== 'admin') {
            const course = await Course.findOne({ _id: courseId, deleted: { $ne: true } }).select('price discountedPrice').lean();
            if (!course) {
                return res.status(404).json({ message: "Course not found." });
            }

            const effectivePrice = (course.discountedPrice != null && course.discountedPrice > 0)
                ? course.discountedPrice
                : course.price;

            if (effectivePrice > 0) {
                const Payment = require('../models/paymentModel');
                const completedPayment = await Payment.findOne({
                    userId,
                    courseId,
                    type: 'COURSE',
                    status: 'COMPLETED'
                }).lean();

                if (!completedPayment) {
                    console.warn(`[SECURITY] Payment bypass attempt blocked. User ${userId} tried to enroll in paid course ${courseId} without a completed payment.`);
                    return res.status(402).json({
                        message: "Payment required. Please complete payment before enrolling in this course."
                    });
                }
            }
        }
        // --- END PAYMENT GUARD ---

        // Use updateOne with $addToSet to avoid full document validation
        console.log('Enrolling user in course using updateOne:', { userId, courseId });
        const updateResult = await User.updateOne(
            { _id: userId },
            { $addToSet: { enrolledCourses: courseId } }
        );
        console.log('Update result:', updateResult);

        // Refresh user to get updated data
        const updatedUser = await User.findById(userId).select('-password');
        console.log('Updated user enrolledCourses:', updatedUser?.enrolledCourses);

        res.status(200).json({
            message: "Successfully enrolled!",
            enrolledCourses: updatedUser.enrolledCourses || [],
        });
    } catch (error) {
        console.error("Error enrolling in course:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            courseId: req.body?.courseId,
            userId: req.user?._id,
            errorName: error.name
        });
        res.status(500).json({
            message: "Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const enrollInInternship = async (req, res) => {
    try {
        const { internshipId } = req.body;

        if (!internshipId) {
            return res.status(400).json({ message: "Internship ID is required." });
        }

        // Validate ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(internshipId)) {
            return res.status(400).json({ message: "Invalid internship ID format." });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if already enrolled (convert to string for comparison)
        const enrolledIds = (user.enrolledInternships || []).map(id => id.toString());
        if (enrolledIds.includes(internshipId.toString())) {
            return res.status(400).json({ message: "You are already enrolled in this internship." });
        }

        // --- PAYMENT GUARD ---
        // Admins can enroll any user for free (manual admin-panel enrollments).
        // Regular users must have a COMPLETED payment for paid internships.
        if (req.user.role !== 'admin') {
            const internship = await Internship.findOne({ _id: internshipId, deleted: { $ne: true } }).select('price discountedPrice').lean();
            if (!internship) {
                return res.status(404).json({ message: "Internship not found." });
            }

            const effectivePrice = (internship.discountedPrice != null && internship.discountedPrice > 0)
                ? internship.discountedPrice
                : internship.price;

            if (effectivePrice > 0) {
                const Payment = require('../models/paymentModel');
                const completedPayment = await Payment.findOne({
                    userId,
                    internshipId,
                    type: 'INTERNSHIP',
                    status: 'COMPLETED'
                }).lean();

                if (!completedPayment) {
                    console.warn(`[SECURITY] Payment bypass attempt blocked. User ${userId} tried to enroll in paid internship ${internshipId} without a completed payment.`);
                    return res.status(402).json({
                        message: "Payment required. Please complete payment before enrolling in this internship."
                    });
                }
            }
        }
        // --- END PAYMENT GUARD ---

        // Use updateOne with $addToSet to avoid full document validation
        console.log('Enrolling user in internship using updateOne:', { userId, internshipId });
        const updateResult = await User.updateOne(
            { _id: userId },
            { $addToSet: { enrolledInternships: internshipId } }
        );
        console.log('Update result:', updateResult);

        // Refresh user to get updated data
        const updatedUser = await User.findById(userId).select('-password');
        console.log('Updated user enrolledInternships:', updatedUser?.enrolledInternships);

        // --- Create Notification for Offer Letter ---
        try {
            const notification = await Notification.create({
                recipient: userId,
                type: 'offer_letter',
                title: 'Offer Letter Generated',
                message: `Your offer letter is ready for download.`,
                link: `/user/offerletter`,
                isRead: false
            });

            const io = req.app.get('io');
            const userSockets = req.app.get('userSockets');
            if (io && userSockets && userSockets.has(userId.toString())) {
                const socketId = userSockets.get(userId.toString());
                io.to(socketId).emit('newNotification', notification);
            }
        } catch (notifError) {
            console.error('Error creating notification for offer letter:', notifError);
        }

        res.status(200).json({
            message: "Successfully enrolled in internship!",
            enrolledInternships: updatedUser.enrolledInternships || [],
        });
    } catch (error) {
        console.error("Error enrolling in internship:", error);
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            internshipId: req.body?.internshipId,
            userId: req.user?._id,
            errorName: error.name
        });
        res.status(500).json({
            message: "Server Error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getMyEnrolledInternships = async (req, res) => {
    try {
        // Only fetch needed fields for better performance
        const user = await User.findById(req.user._id).select('enrolledInternships internshipProgress').lean();
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get all enrolled internship IDs from two sources:
        // 1. Direct enrollments (user.enrolledInternships array) - for bypass enrollments
        // 2. Completed payments - for paid enrollments
        const enrolledInternshipIds = new Set();

        // Add directly enrolled internships (bypass enrollments)
        if (user.enrolledInternships && Array.isArray(user.enrolledInternships)) {
            user.enrolledInternships.forEach(id => {
                enrolledInternshipIds.add(id.toString());
            });
        }

        // Get completed internship payments for this user (only get IDs, don't populate)
        const Payment = require('../models/paymentModel');
        const completedPayments = await Payment.find({
            userId: user._id,
            type: 'INTERNSHIP',
            status: 'COMPLETED'
        }).select('internshipId').lean();

        // Add internships from completed payments
        completedPayments.forEach(payment => {
            if (payment.internshipId) {
                enrolledInternshipIds.add(payment.internshipId.toString());
            }
        });

        // Convert Set to Array for MongoDB query
        const internshipIdsArray = Array.from(enrolledInternshipIds);

        if (internshipIdsArray.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch internship details WITHOUT lectures (much faster)
        const internships = await Internship.find({
            _id: { $in: internshipIdsArray }
        })
            .select('title description category tutor price discountedPrice rating duration difficulty thumbnail createdAt updatedAt')
            .populate('category', 'name')
            .lean();

        if (!internships || internships.length === 0) {
            return res.status(200).json([]);
        }

        // Get lecture counts using aggregation (lightweight - only counts, no data)
        const internshipObjectIds = internshipIdsArray.map(id => new mongoose.Types.ObjectId(id));
        const lectureCounts = await Internship.aggregate([
            { $match: { _id: { $in: internshipObjectIds } } },
            { $project: { _id: 1, lectureCount: { $size: { $ifNull: ['$lectures', []] } } } }
        ]);

        // Create a map for quick lookup
        const lectureCountMap = {};
        lectureCounts.forEach(item => {
            lectureCountMap[item._id.toString()] = item.lectureCount;
        });

        const internshipsWithProgress = internships.map(internship => {
            const progress = user.internshipProgress.find(p => p.internshipId.toString() === internship._id.toString());
            let progressPercentage = 0;
            let stricsCount = 0;
            const totalLectures = lectureCountMap[internship._id.toString()] || 0;

            if (progress && progress.completedLectures && totalLectures > 0) {
                // A lecture is only considered complete when both task and MCQ are completed (status: 'Completed')
                const completedCount = progress.completedLectures.filter(lec => lec.status === 'Completed').length;
                progressPercentage = Math.round((completedCount / totalLectures) * 100);

                // Calculate daily completed lectures (strics)
                const todayStr = new Date().toDateString();
                stricsCount = progress.completedLectures.filter(lec =>
                    lec.status === 'Completed' &&
                    lec.completedAt &&
                    new Date(lec.completedAt).toDateString() === todayStr
                ).length;
            }

            return { ...internship, progress: progressPercentage, strics: stricsCount };
        });

        // Always return an array
        res.status(200).json(internshipsWithProgress || []);
    } catch (error) {
        console.error('Error fetching user internships:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?._id
        });
        // Return empty array on error to prevent map function errors
        res.status(500).json([]);
    }
};

const getInternshipProgress = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const progress = user.internshipProgress.find(p => p.internshipId.toString() === internshipId);
        const isEnrolled = 
            (user.enrolledInternships || []).some(id => id.toString() === internshipId) ||
            !!progress;

        // Fetch internship details
        const Internship = require('../models/internshipModel');
        const internship = await Internship.findById(internshipId);

        res.status(200).json({
            isEnrolled: isEnrolled,
            progress: progress || { completedLectures: [] },
            internship: internship
        });
    } catch (error) {
        console.error('Error fetching internship progress:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const progress = user.courseProgress.find(p => p.courseId.toString() === courseId);
        const isEnrolled = 
            (user.enrolledCourses || []).some(id => id.toString() === courseId) ||
            !!progress;

        // Fetch course details
        const Course = require('../models/courseModel');
        const course = await Course.findById(courseId);

        res.status(200).json({
            isEnrolled: isEnrolled,
            progress: progress || { completedLectures: [] },
            course: course
        });
    } catch (error) {
        console.error('Error fetching course progress:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
const submitTask = async (req, res) => {
    try {
        const { internshipId, lectureId } = req.body || {};
        const userId = req.user?._id;

        if (!internshipId || !lectureId || internshipId === 'undefined' || lectureId === 'undefined') {
            return res.status(400).json({ message: 'Internship ID and Lecture ID are required.' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No file was uploaded.' });
        }

        const [internship, user] = await Promise.all([
            Internship.findById(internshipId).lean(),
            User.findById(userId)
        ]);

        if (!internship) return res.status(404).json({ message: 'Internship not found.' });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        let internshipProgress = getInternshipProgressForUser(user, internshipId);
        const accessInfo = getLectureAccessInfo(internship, internshipProgress, lectureId);
        if (!accessInfo.isAccessible) {
            return res.status(403).json({ message: accessInfo.message });
        }

        if (!internshipProgress) {
            const newProgress = { internshipId, completedLectures: [] };
            user.internshipProgress.push(newProgress);
            internshipProgress = user.internshipProgress[user.internshipProgress.length - 1];
        }

        const filesData = req.files.map(file => ({
            public_id: file.filename,
            url: `/uploads/submissions/${file.filename}`
        }));

        let lectureProgress = internshipProgress.completedLectures.find(l => idsMatch(l.lectureId, lectureId));
        if (lectureProgress) {
            lectureProgress.submittedFiles = filesData;
            lectureProgress.submittedFile = filesData[0]; // fallback
            lectureProgress.status = 'Pending';
            lectureProgress.submittedAt = new Date();
        } else {
            internshipProgress.completedLectures.push({
                lectureId,
                submittedFiles: filesData,
                submittedFile: filesData[0], // fallback
                status: 'Pending',
                submittedAt: new Date()
            });
        }

        await user.save({ validateBeforeSave: false });

        const updatedUser = await User.findById(userId);
        const updatedProgress = updatedUser.internshipProgress.find(p => p.internshipId.toString() === internshipId);

        // --- Send Notification to Admins ---
        try {
            const Admin = require('../models/adminModel');
            const admins = await Admin.find({});
            const io = req.app.get('io');
            
            for (const admin of admins) {
                const notification = await Notification.create({
                    recipient: admin._id,
                    title: 'New Task Submission',
                    message: `${user.fullName} submitted a task for ${internship.title}`,
                    type: 'SYSTEM',
                    link: `/admin/internship-submissions`
                });
                
                if (io) {
                    io.to(admin._id.toString()).emit('newNotification', notification);
                }
            }
        } catch (notifErr) {
            console.error('Failed to send admin notification:', notifErr);
        }

        res.status(200).json({
            message: 'Task submitted successfully! Awaiting approval.',
            progress: updatedProgress
        });
    } catch (error) {
        console.error('Error submitting task:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            body: req.body,
            files: req.files ? req.files.map(f => ({ filename: f.filename, size: f.size })) : null,
            user: req.user ? { id: req.user._id } : null
        });
        res.status(500).json({ message: 'Server error while submitting task.' });
    }
};

const getMyEnrolledCourses = async (req, res) => {
    try {
        // Get user with enrolled courses AND progress data
        const user = await User.findById(req.user._id)
            .select('enrolledCourses courseProgress')
            .lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get ALL enrolled course IDs from BOTH sources:
        // 1. Direct enrollments (user.enrolledCourses array)
        // 2. Completed payments (paid courses)
        const enrolledCourseIds = new Set();

        // Add direct enrollments
        if (user.enrolledCourses && Array.isArray(user.enrolledCourses)) {
            user.enrolledCourses.forEach(id => {
                enrolledCourseIds.add(id.toString());
            });
            console.log(`📚 Found ${user.enrolledCourses.length} direct enrolled courses`);
        }

        // Add paid courses from payments
        const Payment = require('../models/paymentModel');
        const completedPayments = await Payment.find({
            userId: user._id,
            type: 'COURSE',
            status: 'COMPLETED'
        }).select('courseId').lean();

        completedPayments.forEach(payment => {
            if (payment.courseId) {
                enrolledCourseIds.add(payment.courseId.toString());
            }
        });
        console.log(`💳 Found ${completedPayments.length} paid courses`);

        const courseIdsArray = Array.from(enrolledCourseIds);
        console.log(`🎯 Total unique courses: ${courseIdsArray.length}`);

        if (courseIdsArray.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch course details (lightweight - exclude heavy sections for dashboard)
        const courses = await Course.find({
            _id: { $in: courseIdsArray }
        })
            .select('title description thumbnailUrl tutor price discountedPrice totalSizeBytes rating level sections')
            .lean();

        if (!courses || courses.length === 0) {
            return res.status(200).json([]);
        }

        // Calculate progress for each course
        const coursesWithProgress = courses.map(course => {
            const progress = user.courseProgress?.find(p =>
                p.courseId.toString() === course._id.toString()
            );

            // Compute total lectures safely in JS instead of relying on the aggregate map
            let totalLectures = course.sections ? course.sections.reduce((count, section) => count + (section.lectures ? section.lectures.length : 0), 0) : 0;

            let progressPercentage = 0;
            let isStarted = false;
            
            if (progress) {
                isStarted = true;
                if (totalLectures > 0) {
                    // Filter by 'Completed' status for consistency with internships, fallback to length if status isn't strictly enforced yet
                    const completedLectures = progress.completedLectures || [];
                    const completedCount = completedLectures.filter(l => l.status === 'Completed').length || completedLectures.length;
                    progressPercentage = Math.round((completedCount / totalLectures) * 100);
                }
            }

            // Remove sections to keep the payload lightweight for the dashboard
            const courseData = { ...course };
            delete courseData.sections;

            return {
                ...courseData,
                progress: progressPercentage,
                isStarted,
                totalLectures,
                source: enrolledCourseIds.has(course._id.toString()) ? 'enrolledCourses' : 'payment'
            };
        });

        console.log(`✅ Returning ${coursesWithProgress.length} courses to dashboard`);
        res.status(200).json(coursesWithProgress);

    } catch (error) {
        console.error('❌ Error fetching user courses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const markLectureAsCompleted = async (req, res) => {
    try {
        const { courseId, lectureId } = req.body;
        const userId = req.user._id;

        if (!courseId || !lectureId) {
            return res.status(400).json({ message: "courseId and lectureId are required." });
        }

        // --- GUARD 1: Enrollment check ---
        // User must be enrolled in this course before any lecture can be marked complete.
        // This blocks attackers who call the endpoint for courses they never paid for.
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        const isEnrolled = (user.enrolledCourses || []).some(id => id.toString() === courseId.toString());
        if (!isEnrolled) {
            console.warn(`[SECURITY] Certificate bypass attempt blocked. User ${userId} tried to mark lecture complete for unenrolled course ${courseId}.`);
            return res.status(403).json({ message: "You are not enrolled in this course." });
        }
        // --- END GUARD 1 ---

        // --- GUARD 2: Lecture existence check ---
        // The lectureId must be a real lecture inside this specific course.
        // This blocks attackers who fabricate random ObjectIds to inflate completedLectures count.
        const course = await Course.findOne({ _id: courseId, deleted: { $ne: true } })
            .select('sections')
            .lean();
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        const allLectureIds = [];
        (course.sections || []).forEach(section => {
            (section.lectures || []).forEach(lecture => {
                allLectureIds.push(lecture._id.toString());
            });
        });

        if (!allLectureIds.includes(lectureId.toString())) {
            return res.status(400).json({ message: "Invalid lecture ID for this course." });
        }
        // --- END GUARD 2 ---

        // Mark lecture as completed (existing logic, unchanged)
        let courseProgress = user.courseProgress.find(p => p.courseId.toString() === courseId);
        if (!courseProgress) {
            user.courseProgress.push({ courseId, completedLectures: [] });
            courseProgress = user.courseProgress[user.courseProgress.length - 1];
        }
        const isAlreadyCompleted = courseProgress.completedLectures.some(l => l.lectureId.toString() === lectureId);
        if (!isAlreadyCompleted) {
            courseProgress.completedLectures.push({ lectureId, status: 'Completed', completedAt: new Date() });
            await user.save();
        }
        res.status(200).json({
            message: "Lecture marked as complete.",
            progress: courseProgress,
        });
    } catch (error) {
        console.error("Error marking lecture as complete:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


const submitInternshipQuiz = async (req, res) => { /* Your placeholder */ };

const getUserProfile = (req, res) => {
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        let { fullName, phone } = req.body;
        
        // Sanitize the display name to prevent XSS
        if (fullName) {
            fullName = xss(fullName);
        }

        const userId = req.user._id;

        // Validate required fields
        if (!fullName || !phone) {
            return res.status(400).json({ message: 'Full name and phone number are required.' });
        }

        // Find and update the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update the fields
        user.fullName = fullName;
        user.phone = phone;

        // Save the updated user
        await user.save();

        // Return the updated user data (without password)
        const updatedUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            enrolledCourses: user.enrolledCourses,
            enrolledInternships: user.enrolledInternships,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};

const changeUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedNewPassword;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error while changing password.' });
    }
};

const getCompletedCourses = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('enrolledCourses courseProgress').lean();
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch courses with only needed fields (exclude heavy sections/lectures)
        const courses = await Course.find({
            _id: { $in: user.enrolledCourses }
        })
            .select('_id title thumbnailUrl sections')
            .lean();

        const completedCourses = [];
        for (const course of courses) {
            const progress = user.courseProgress.find(p => p.courseId.toString() === course._id.toString());
            if (progress) {
                const totalLectures = course.sections.reduce((count, section) => count + section.lectures.length, 0);
                if (totalLectures > 0) {
                    const completedLecturesCount = progress.completedLectures.length;
                    if (completedLecturesCount === totalLectures) {
                        completedCourses.push({
                            _id: course._id,
                            courseTitle: course.title,
                            thumbnailUrl: course.thumbnailUrl,
                            downloadUrl: `/api/users/certificate/${course._id}/download`
                        });
                    }
                }
            }
        }
        res.status(200).json(completedCourses);
    } catch (error) {
        console.error("Error fetching completed courses:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Shared helper to generate the unified certificate layout for both Courses and Internships
const buildCertificatePDF = async (doc, user, itemTitle, itemId, isInternship, purchaseDate, issuedDate) => {
    const fs = require('fs');
    const path = require('path');
    const QRCode = require('qrcode');

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    const formatDate = (dt) =>
        dt
            ? new Date(dt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            : 'N/A';

    // 1. Background and Borders
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FDFBF7');

    // Inner Border (Gold/Orange)
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
       .lineWidth(1)
       .stroke('#F59E0B');

    // Outer Border (Thin Navy)
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
       .lineWidth(1)
       .stroke('#003366');

    // Top-Left Corner Accent
    doc.polygon([0, 0], [180, 0], [0, 180]).fill('#003366'); // main navy triangle
    doc.moveTo(190, 0).lineTo(0, 190).lineWidth(2).stroke('#F59E0B'); // gold diagonal
    doc.moveTo(196, 0).lineTo(0, 196).lineWidth(1).stroke('#003366'); // thin navy diagonal

    // Bottom-Right Corner Accent
    doc.polygon([pageWidth, pageHeight], [pageWidth - 180, pageHeight], [pageWidth, pageHeight - 180]).fill('#003366');
    doc.moveTo(pageWidth - 190, pageHeight).lineTo(pageWidth, pageHeight - 190).lineWidth(2).stroke('#F59E0B');
    doc.moveTo(pageWidth - 196, pageHeight).lineTo(pageWidth, pageHeight - 196).lineWidth(1).stroke('#003366');
    
    // Reset opacity
    doc.strokeOpacity(1);

    // 2. Logo
    const logoPath = path.join(__dirname, '../../frontend/public/logo1.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, (pageWidth - 140) / 2, 70, {
            width: 140,
            align: 'center'
        });
    }

    // 3. CERTIFICATE OF COMPLETION
    doc.font('Times-Bold')
       .fontSize(32)
       .fillColor('#003366')
       .text('CERTIFICATE', 0, 130, { align: 'center', characterSpacing: 5 });
    
    doc.font('Times-Bold')
       .fontSize(16)
       .text('OF COMPLETION', 0, 165, { align: 'center', characterSpacing: 3 });

    // 4. RECIPIENT
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#666666')
       .text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', 0, 220, { align: 'center', characterSpacing: 1 });

    const studentName = user.fullName || 'Student Name';
    doc.font('Times-Italic')
       .fontSize(42)
       .fillColor('#003366')
       .text(studentName, 0, 245, { align: 'center' });
       
    // Orange underline for the name
    const nameWidth = doc.widthOfString(studentName);
    const underlineX = (pageWidth - nameWidth) / 2 - 20;
    doc.moveTo(underlineX, 295)
       .lineTo(underlineX + nameWidth + 40, 295)
       .lineWidth(1.5)
       .stroke('#F59E0B');

    // 5. PROGRAM
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#666666')
       .text('FOR SUCCESSFULLY COMPLETING', 0, 325, { align: 'center', characterSpacing: 1 });

    let displayTitle = itemTitle || 'Program Name';
    const titleType = isInternship ? 'Internship' : 'Course';
    if (!displayTitle.toLowerCase().includes(titleType.toLowerCase())) {
        displayTitle = `${displayTitle} ${titleType}`;
    }

    doc.font('Times-Bold');
    let titleFontSize = 24;
    doc.fontSize(titleFontSize);
    const maxTitleWidth = pageWidth - 140;
    
    while (doc.widthOfString(displayTitle) > maxTitleWidth && titleFontSize > 12) {
        titleFontSize -= 1;
        doc.fontSize(titleFontSize);
    }

    doc.fillColor('#003366')
       .text(displayTitle, 70, 350 + (24 - titleFontSize)/2, { align: 'center', width: maxTitleWidth });

    const typeStr = isInternship ? 'internship' : 'course';
    const descText = isInternship 
        ? `This certificate recognizes the successful completion of the ${itemTitle || 'program'} internship, demonstrating practical learning, professional development, and applied technical skills.`
        : `This certificate recognizes the successful completion of the ${itemTitle || 'program'} course, demonstrating commitment to professional learning and technical skill development.`;

    doc.font('Helvetica')
       .fontSize(11)
       .fillColor('#4B5563')
       .text(descText, 100, 395, { align: 'center', width: pageWidth - 200, lineGap: 3 });

    // 6. METADATA COLUMNS & STAMPS
    const footerY = 445;
    
    const fromDate = purchaseDate ? formatDate(purchaseDate) : formatDate(user.createdAt || issuedDate);
    const toDate = formatDate(issuedDate);
    const durationText = `${fromDate} - ${toDate}`;
    
    const userIdPart = user._id.toString().slice(-6).toUpperCase();
    const itemIdPart = itemId.toString().slice(-6).toUpperCase();
    const certificateId = isInternship ? `IK-INT-${userIdPart}-${itemIdPart}` : `IK-${userIdPart}-${itemIdPart}`;

    // Column 1: Duration & InternKatta Stamp
    const col1X = 90;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#9CA3AF').text(`${typeStr.toUpperCase()} DURATION`, col1X, footerY, { characterSpacing: 1, align: 'center', width: 160 });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#003366').text(durationText, col1X, footerY + 12, { align: 'center', width: 160 });

    const bottomRowCenterY = 502; // Center alignment for bottom elements
    const stampImagePath = path.join(__dirname, '../../frontend/public/Internkatta_stamp.png');
    if (fs.existsSync(stampImagePath)) {
        const stampSize = 62;
        const stampX = col1X + (160 - stampSize)/2 - 5;
        const stampY = bottomRowCenterY - (stampSize / 2) + 2;
        
        doc.image(stampImagePath, stampX, stampY, {
            fit: [stampSize, stampSize],
            align: 'center',
            valign: 'center'
        });
    }

    // Column 2: Issued Date & ISO Mark
    const col2X = (pageWidth - 160) / 2;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#9CA3AF').text('ISSUED DATE', col2X, footerY, { characterSpacing: 1, align: 'center', width: 160 });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#003366').text(formatDate(issuedDate), col2X, footerY + 12, { align: 'center', width: 160 });

    const isoImagePath = path.join(__dirname, '../../frontend/public/ISO_Stamp.png');
    if (fs.existsSync(isoImagePath)) {
        const isoSize = 62;
        const isoX = col2X + (160 - isoSize)/2;
        const isoY = bottomRowCenterY - (isoSize / 2);
        doc.image(isoImagePath, isoX, isoY, {
            fit: [isoSize, isoSize],
            align: 'center',
            valign: 'center'
        });
    }

    // Column 3: Certificate ID & QR Code
    const col3X = pageWidth - 250;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#9CA3AF').text('CERTIFICATE ID', col3X, footerY, { characterSpacing: 1, align: 'center', width: 160 });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#003366').text(certificateId, col3X, footerY + 12, { align: 'center', width: 160 });

    const verifyUrl = `https://internkatta.com/verify-certificate/${certificateId}`;
    try {
        const qrCodeBuffer = await QRCode.toBuffer(verifyUrl, {
            errorCorrectionLevel: 'M',
            type: 'png',
            margin: 1
        });
        const qrSize = 62;
        const qrX = col3X + (160 - qrSize)/2;
        const qrY = bottomRowCenterY - (qrSize / 2);
        doc.image(qrCodeBuffer, qrX, qrY, { width: qrSize });
        
        doc.font('Helvetica-Bold')
           .fontSize(7)
           .fillColor('#003366')
           .text('VERIFY', col3X, qrY + qrSize + 4, { align: 'center', width: 160, characterSpacing: 1 });
    } catch (qrError) {
        console.error('Error generating QR code:', qrError);
    }
};

const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const [course, user] = await Promise.all([
            Course.findById(courseId),
            User.findById(userId)
        ]);

        if (!user || !course) {
            return res.status(404).json({ message: "User or Course not found." });
        }
        if (!user.enrolledCourses.includes(courseId)) {
            return res.status(403).json({ message: "You are not enrolled in this course." });
        }

        const progress = user.courseProgress.find(p => p.courseId.toString() === courseId);
        // Assuming courses might store total lectures in a different way or property, 
        // using the logic based on provided context
        const totalLectures = course.sections ? course.sections.reduce((count, section) => count + (section.lectures ? section.lectures.length : 0), 0) : 0;
        if (!progress || totalLectures === 0 || progress.completedLectures.length !== totalLectures) {
            return res.status(403).json({ message: "You have not completed this course." });
        }

        const Payment = require('../models/paymentModel');
        let purchaseDate = null;
        try {
            const paymentRecord = await Payment.findOne({
                userId,
                courseId,
                status: 'COMPLETED'
            }).sort({ paymentDate: 1 });
            if (paymentRecord) {
                purchaseDate = paymentRecord.paymentDate || paymentRecord.completedDate || paymentRecord.createdAt;
            }
        } catch (err) {
            console.warn('Unable to fetch payment for certificate duration:', err?.message);
        }

        const issuedDate = new Date();

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="Certificate-${course.title.replace(/\s/g, '_')}.pdf"`
        );
        doc.pipe(res);

        await buildCertificatePDF(doc, user, course.title, course._id, false, purchaseDate, issuedDate);

        doc.end();

    } catch (error) {
        console.error("Error generating certificate:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const generateOfferLetter = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const userId = req.user._id;
        const fs = require('fs');
        const path = require('path');

        const [internship, user] = await Promise.all([
            Internship.findById(internshipId),
            User.findById(userId)
        ]);

        if (!user || !internship) {
            return res.status(404).json({ message: "User or Internship not found." });
        }
        if (!user.enrolledInternships.includes(internshipId)) {
            return res.status(403).json({ message: "You are not enrolled in this internship." });
        }

        // Use JPG template image as background
        const templateImagePath = path.join(__dirname, '../../frontend/offersample.jpg');

        if (!fs.existsSync(templateImagePath)) {
            return res.status(500).json({ message: "Template image not found." });
        }

        // Create PDF with image as background
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="InternKatta-Offer-Letter-${internship.title.replace(/\s/g, '-')}.pdf"`);
        doc.pipe(res);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Add the template image as full-page background
        doc.image(templateImagePath, 0, 0, {
            width: pageWidth,
            height: pageHeight,
            fit: [pageWidth, pageHeight]
        });

        // Now overlay text on top of the image
        // Text positions based on the template design
        const contentX = 72;
        const contentStartY = 200; // Adjust based on template
        let currentY = contentStartY;

        // Date
        doc.fontSize(12)
            .fillColor('#000000')
            .font('Helvetica')
            .text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}`, contentX, currentY);

        // To section
        currentY += 30;
        doc.text('To,', contentX, currentY);
        currentY += 20;
        doc.font('Helvetica-Bold')
            .text(user.fullName || 'Student', contentX, currentY);
        currentY += 20;
        doc.font('Helvetica')
            .text(user.email || '', contentX, currentY);

        // Subject
        currentY += 40;
        doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('Subject: Internship Offer Letter', contentX, currentY);

        // Body paragraphs
        currentY += 40;
        const contentWidth = pageWidth - 144;
        doc.fontSize(12)
            .font('Helvetica')
            .text(`Dear ${user.fullName || 'Student'},`, contentX, currentY, { width: contentWidth });
        currentY += 30;

        doc.text(`We are pleased to offer you an internship position at InternKatta Platform. This letter confirms your acceptance into the "${internship.title}" program.`, contentX, currentY, { width: contentWidth, align: 'justify' });
        currentY += 50;

        doc.text(`Your internship is scheduled for a duration of ${internship.duration || '6 months'}. During this period, you will engage in various learning modules and practical tasks designed to enhance your skills in this domain.`, contentX, currentY, { width: contentWidth, align: 'justify' });
        currentY += 50;

        doc.text('We are confident that you will make a significant contribution to our community, and we look forward to a mutually beneficial association.', contentX, currentY, { width: contentWidth, align: 'justify' });
        currentY += 60;

        // Closing
        doc.text('Sincerely,', contentX, currentY);
        currentY += 25;
        doc.font('Helvetica-Bold')
            .text('The InternKatta Team', contentX, currentY);

        doc.end();
    } catch (error) {
        console.error("Error generating offer letter:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- THIS IS THE NEW FUNCTION ---
const getCompletedInternships = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select('enrolledInternships internshipProgress').lean();
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.enrolledInternships || user.enrolledInternships.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch internships with only needed fields (exclude heavy lectures field)
        const internships = await Internship.find({
            _id: { $in: user.enrolledInternships }
        })
            .select('_id title thumbnail')
            .lean();

        if (internships.length === 0) {
            return res.status(200).json([]);
        }

        // Get lecture counts using aggregation (lightweight - only counts, no data)
        const enrolledObjectIds = user.enrolledInternships.map(id => new mongoose.Types.ObjectId(id));
        const lectureCounts = await Internship.aggregate([
            { $match: { _id: { $in: enrolledObjectIds } } },
            { $project: { _id: 1, lectureCount: { $size: { $ifNull: ['$lectures', []] } } } }
        ]);

        // Create a map for quick lookup
        const lectureCountMap = {};
        lectureCounts.forEach(item => {
            lectureCountMap[item._id.toString()] = item.lectureCount;
        });

        const completedInternships = [];

        for (const internship of internships) {
            const progress = user.internshipProgress.find(p => p.internshipId.toString() === internship._id.toString());
            if (progress) {
                const totalLectures = lectureCountMap[internship._id.toString()] || 0;
                if (totalLectures > 0) {
                    const completedLecturesCount = progress.completedLectures.filter(l => l.status === 'Completed').length;
                    if (completedLecturesCount === totalLectures) {
                        completedInternships.push({
                            _id: internship._id,
                            internshipTitle: internship.title,
                            thumbnail: internship.thumbnail,
                            downloadUrl: `/api/users/internship-letter/${internship._id}/download`
                        });
                    }
                }
            }
        }

        res.status(200).json(completedInternships);

    } catch (error) {
        console.error("Error fetching completed internships:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const generateInternshipLetter = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const userId = req.user._id;

        const [internship, user] = await Promise.all([
            Internship.findById(internshipId),
            User.findById(userId)
        ]);

        if (!user || !internship) {
            return res.status(404).json({ message: "User or Internship not found." });
        }
        if (!user.enrolledInternships.includes(internshipId)) {
            return res.status(403).json({ message: "You are not enrolled in this internship." });
        }

        const progress = user.internshipProgress.find(p => p.internshipId.toString() === internshipId);
        // Using length of array check
        const totalLectures = internship.lectures ? internship.lectures.length : 0;
        if (!progress || totalLectures === 0 || progress.completedLectures.filter(l => l.status === 'Completed').length !== totalLectures) {
            return res.status(403).json({ message: "You have not completed this internship." });
        }

        // Purchase date for duration (if payment exists)
        const Payment = require('../models/paymentModel');
        let purchaseDate = null;
        try {
            const paymentRecord = await Payment.findOne({
                userId,
                internshipId,
                status: 'COMPLETED'
            }).sort({ paymentDate: 1 });
            if (paymentRecord) {
                purchaseDate = paymentRecord.paymentDate || paymentRecord.completedDate || paymentRecord.createdAt;
            }
        } catch (err) {
            console.warn('Unable to fetch payment for internship letter duration:', err?.message);
        }

        const issuedDate = new Date();

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="Internship-Letter-${internship.title.replace(/\s/g, '_')}.pdf"`
        );
        doc.pipe(res);

        await buildCertificatePDF(doc, user, internship.title, internship._id, true, purchaseDate, issuedDate);

        doc.end();
    } catch (error) {
        console.error('Error generating internship letter:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 🔧 AUTO-ENROLLMENT SYNC - Fix missing enrolledCourses from payments
const syncEnrollments = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(`🔄 Syncing enrollments for user ${userId}`);

        const user = await User.findById(userId).select('enrolledCourses');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const Payment = require('../models/paymentModel');
        const coursePayments = await Payment.find({
            userId,
            type: 'COURSE',
            status: 'COMPLETED'
        }).select('courseId');

        let updated = false;
        for (const payment of coursePayments) {
            const courseIdStr = payment.courseId.toString();
            if (!user.enrolledCourses.some(id => id.toString() === courseIdStr)) {
                user.enrolledCourses.push(payment.courseId);
                updated = true;
                console.log(`➕ Auto-added course ${courseIdStr} to enrolledCourses`);
            }
        }

        if (updated) {
            await user.save();
            console.log(`✅ Saved ${coursePayments.length} courses to enrolledCourses`);
        }

        res.json({
            success: true,
            addedCount: updated ? coursePayments.length : 0,
            totalEnrolled: user.enrolledCourses.length,
            courses: user.enrolledCourses.map(id => id.toString())
        });
    } catch (error) {
        console.error('❌ Enrollment sync error:', error);
        res.status(500).json({ message: 'Sync failed' });
    }
};

// Public certificate download via QR code (no authentication required)
const downloadCertificateByQR = async (req, res) => {
    try {
        const { certificateId, type } = req.query;

        if (!certificateId || !type) {
            return res.status(400).json({ message: "Certificate ID and type are required." });
        }

        if (type === 'course') {
            // Parse certificate ID format: IK-XXXXXX-YYYYYY
            // Where XXXXXX is last 6 chars of userId and YYYYYY is last 6 chars of courseId
            const certIdMatch = certificateId.match(/^IK-([A-Z0-9]{6})-([A-Z0-9]{6})$/);
            if (!certIdMatch) {
                return res.status(400).json({ message: "Invalid certificate ID format." });
            }

            const [, userIdSuffix, courseIdSuffix] = certIdMatch;
            // Find user by matching the last 6 characters of their ID
            const users = await User.find({});
            const user = users.find(u => u._id.toString().slice(-6).toUpperCase() === userIdSuffix);

            if (!user) {
                return res.status(404).json({ message: "Certificate not found." });
            }

            // Find course by matching the last 6 characters of its ID
            const courses = await Course.find({});
            const course = courses.find(c => c._id.toString().slice(-6).toUpperCase() === courseIdSuffix);

            if (!course) {
                return res.status(404).json({ message: "Certificate not found." });
            }

            // Verify user is enrolled and has completed the course
            if (!user.enrolledCourses.includes(course._id)) {
                return res.status(403).json({ message: "Certificate not found." });
            }

            const progress = user.courseProgress.find(p => p.courseId.toString() === course._id.toString());
            const totalLectures = course.sections.reduce((count, section) => count + section.lectures.length, 0);

            if (!progress || totalLectures === 0 || progress.completedLectures.length !== totalLectures) {
                return res.status(403).json({ message: "Certificate not found." });
            }

            // Generate certificate (reuse existing function logic)
            // We'll call generateCertificate but need to set req.user
            req.user = { _id: user._id };
            req.params.courseId = course._id.toString();
            return await generateCertificate(req, res);

        } else if (type === 'internship') {
            // For internships, certificate ID is just the internship._id.toString()
            // Try to find by direct ID first
            let internship = await Internship.findById(certificateId);

            if (!internship) {
                // If not found, try to parse as MongoDB ObjectId
                if (certificateId.length === 24) {
                    try {
                        internship = await Internship.findById(certificateId);
                    } catch (err) {
                        // Invalid ObjectId format
                    }
                }
            }

            if (!internship) {
                return res.status(404).json({ message: "Certificate not found." });
            }

            // Find user who has this internship completed
            // We need to search through all users to find one with this internship completed
            const users = await User.find({ enrolledInternships: internship._id });

            // Find a user who has completed this internship
            let user = null;
            for (const u of users) {
                const progress = u.internshipProgress.find(p => p.internshipId.toString() === internship._id.toString());
                if (progress && progress.completedLectures.filter(l => l.status === 'Completed').length === internship.lectures.length) {
                    user = u;
                    break;
                }
            }

            if (!user) {
                return res.status(403).json({ message: "Certificate not found." });
            }

            // Generate internship letter
            req.user = { _id: user._id };
            req.params.internshipId = internship._id.toString();
            return await generateInternshipLetter(req, res);

        } else {
            return res.status(400).json({ message: "Invalid certificate type." });
        }

    } catch (error) {
        console.error("Error downloading certificate by QR:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;

        // 1. Direct O(1) indexed lookup in Certificate collection
        let certificate = await Certificate.findOne({ certificateId })
            .populate('userId', 'fullName')
            .populate('courseId', 'title')
            .populate('internshipId', 'title');

        if (!certificate) {
            // 2. Fallback: Parse and lazily index legacy or new suffix format
            // Try course format: IK-XXXXXX-YYYYYY
            const courseMatch = certificateId.match(/^IK-([A-Z0-9]{6})-([A-Z0-9]{6})$/);
            if (courseMatch) {
                const [, userIdSuffix, courseIdSuffix] = courseMatch;
                const users = await User.find({});
                const user = users.find(u => u._id.toString().slice(-6).toUpperCase() === userIdSuffix);
                const courses = await Course.find({});
                const course = courses.find(c => c._id.toString().slice(-6).toUpperCase() === courseIdSuffix);

                if (user && course && user.enrolledCourses.includes(course._id)) {
                    const progress = user.courseProgress.find(p => p.courseId.toString() === course._id.toString());
                    const totalLectures = course.sections.reduce((count, section) => count + section.lectures.length, 0);
                    if (progress && totalLectures > 0 && progress.completedLectures.length === totalLectures) {
                        // Lazily create Certificate record
                        await getOrCreateCertificateRecord(user, course, 'course');
                        // Fetch the created record
                        certificate = await Certificate.findOne({ certificateId })
                            .populate('userId', 'fullName')
                            .populate('courseId', 'title');
                    }
                }
            }

            // Try new internship format: IK-INT-XXXXXX-YYYYYY
            if (!certificate) {
                const internshipMatch = certificateId.match(/^IK-INT-([A-Z0-9]{6})-([A-Z0-9]{6})$/);
                if (internshipMatch) {
                    const [, userIdSuffix, internshipIdSuffix] = internshipMatch;
                    const users = await User.find({});
                    const user = users.find(u => u._id.toString().slice(-6).toUpperCase() === userIdSuffix);
                    const internships = await Internship.find({});
                    const internship = internships.find(i => i._id.toString().slice(-6).toUpperCase() === internshipIdSuffix);

                    if (user && internship && user.enrolledInternships.includes(internship._id)) {
                        const progress = user.internshipProgress.find(p => p.internshipId.toString() === internship._id.toString());
                        if (progress && progress.completedLectures.filter(l => l.status === 'Completed').length === internship.lectures.length) {
                            // Lazily create Certificate record
                            await getOrCreateCertificateRecord(user, internship, 'internship');
                            // Fetch the created record
                            certificate = await Certificate.findOne({ certificateId })
                                .populate('userId', 'fullName')
                                .populate('internshipId', 'title');
                        }
                    }
                }
            }

            // Try legacy internship format: 24-character ObjectId of internship
            if (!certificate && certificateId.length === 24) {
                let internship;
                try {
                    internship = await Internship.findById(certificateId);
                } catch (err) { }

                if (internship) {
                    const users = await User.find({ enrolledInternships: internship._id });
                    let user = null;
                    for (const u of users) {
                        const progress = u.internshipProgress.find(p => p.internshipId.toString() === internship._id.toString());
                        if (progress && progress.completedLectures.filter(l => l.status === 'Completed').length === internship.lectures.length) {
                            user = u;
                            break;
                        }
                    }

                    if (user) {
                        const shareUrl = `https://internkatta.com/download-certificate?certificateId=${certificateId}&type=internship`;
                        certificate = new Certificate({
                            certificateId,
                            userId: user._id,
                            internshipId: internship._id,
                            type: 'internship',
                            shareUrl
                        });
                        await certificate.save();
                        // Populate
                        certificate = await Certificate.findOne({ certificateId })
                            .populate('userId', 'fullName')
                            .populate('internshipId', 'title');
                    }
                }
            }
        }

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found." });
        }

        // Return clean response format for frontend consumption
        const details = {
            certificateId: certificate.certificateId,
            studentName: certificate.userId ? certificate.userId.fullName : 'Student',
            title: certificate.type === 'course'
                ? (certificate.courseId ? certificate.courseId.title : 'Course')
                : (certificate.internshipId ? certificate.internshipId.title : 'Internship'),
            type: certificate.type,
            issueDate: certificate.issueDate,
            status: certificate.status
        };

        return res.status(200).json({ success: true, certificate: details });
    } catch (error) {
        console.error("Error verifying certificate:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// --- Update Profile Picture ---
const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }
        
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate the URL for the new profile picture
        const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
        
        // Update the user's profile picture field
        user.profilePicture = profilePictureUrl;
        await user.save();
        
        // Return the updated user data (without password)
        const updatedUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profilePicture: user.profilePicture,
            enrolledCourses: user.enrolledCourses,
            enrolledInternships: user.enrolledInternships,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ message: 'Server error while updating profile picture.' });
    }
};

// @desc    Update video progress (timestamp and current lecture)
// @route   POST /api/users/update-video-progress
// @access  Private
const updateVideoProgress = async (req, res) => {
    try {
        const { courseId, lectureId, timestamp } = req.body;

        if (!courseId || !lectureId) {
            return res.status(400).json({ message: 'Course ID and Lecture ID are required' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the course progress entry
        const progressIndex = user.courseProgress.findIndex(
            (p) => p.courseId.toString() === courseId.toString()
        );

        if (progressIndex > -1) {
            // Update existing progress
            user.courseProgress[progressIndex].lastWatchedLecture = lectureId;
            user.courseProgress[progressIndex].lastWatchedTimestamp = timestamp || 0;
        } else {
            // Create new progress entry if it doesn't exist
            user.courseProgress.push({
                courseId,
                completedLectures: [],
                lastWatchedLecture: lectureId,
                lastWatchedTimestamp: timestamp || 0
            });
        }

        await user.save();

        res.status(200).json({ 
            message: 'Progress updated successfully',
            progress: user.courseProgress.find(p => p.courseId.toString() === courseId.toString())
        });
    } catch (error) {
        console.error('Error in updateVideoProgress:', error);
        res.status(500).json({ message: 'Server error while updating video progress' });
    }
};

module.exports = {
    registerUser,
    sendOTP,
    verifyOTP,
    sendEmailOTP,
    verifyEmailOTP,
    loginUser,
    forgotPassword,
    verifySecurityAnswer,
    resetPassword,
    enrollInCourse,
    enrollInInternship,
    getMyEnrolledInternships,
    getInternshipProgress,
    submitTask,
    getMyEnrolledCourses,
    markLectureAsCompleted,
    updateVideoProgress,
    getCourseProgress,
    submitQuiz,
    submitInternshipQuiz,
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    getCompletedCourses,
    generateCertificate,
    generateOfferLetter,
    getCompletedInternships,
    generateInternshipLetter,
    downloadCertificateByQR,
    syncEnrollments,  // 🔧 NEW
    verifyCertificate,
    setSecurityQuestion,
    setupSecurityQuestionByEmail,
    updateProfilePicture,
};