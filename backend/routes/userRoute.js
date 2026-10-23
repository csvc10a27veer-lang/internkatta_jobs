// backend/routes/userRoute.js

const express = require('express');
const multer = require('multer');
// const cors = require('cors'); // CORS handled at server level (Nginx/Express)
const router = express.Router();
const { protectUser } = require('../middleware/authMiddleware');
const { uploadSubmission, uploadThumbnail, processProfilePicture } = require('../middleware/uploadMiddleware');

const {
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
  submitQuiz,
  getMyEnrolledCourses,
  markLectureAsCompleted,
  updateVideoProgress,
  getCourseProgress,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getCompletedCourses,
  generateCertificate,
  generateOfferLetter,
  // --- 1. IMPORT THE NEW FUNCTIONS ---
  getCompletedInternships,
  generateInternshipLetter,
  downloadCertificateByQR,
  setSecurityQuestion,
  setupSecurityQuestionByEmail,
  updateProfilePicture,
  verifyCertificate
} = require('../controllers/userController');

// --- Auth Routes ---
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/register', registerUser);
router.post('/login', loginUser);

// Dev-Only 1-Click Login Route for development testing
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev-login', async (req, res) => {
    try {
      const User = require('../models/userModel');
      const Internship = require('../models/internshipModel');
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');
      const mongoose = require('mongoose');

      const email = 'testcandidate@internkatta.local';
      let user = await User.findOne({ email });

      // Fetch available internships from the database
      const allInternships = await Internship.find({}).lean();
      const int1 = allInternships.find((i) => (i.lectures || []).length > 0) || allInternships[0];
      const int2 = allInternships.find((i) => i._id.toString() !== int1?._id.toString() && (i.lectures || []).length > 1)
        || allInternships.find((i) => i._id.toString() !== int1?._id.toString())
        || allInternships[1];

      const enrolled = [];
      const progress = [];

      if (int1) {
        enrolled.push(int1._id);
        const lectures1 = int1.lectures || [];
        const completedLectures1 = lectures1.length > 0
          ? lectures1.map((lec) => ({
              lectureId: lec._id,
              status: 'Completed',
              completedAt: new Date()
            }))
          : [{
              lectureId: new mongoose.Types.ObjectId(),
              status: 'Completed',
              completedAt: new Date()
            }];

        progress.push({
          internshipId: int1._id,
          completedLectures: completedLectures1
        });
      }

      if (int2) {
        enrolled.push(int2._id);
        const lectures2 = int2.lectures || [];
        let completedCount = 1;
        if (lectures2.length > 1) {
          completedCount = Math.max(1, Math.floor(lectures2.length * 0.4));
        }

        const inProgressLectures = lectures2.slice(0, completedCount).map((lec) => ({
          lectureId: lec._id,
          status: 'Completed',
          completedAt: new Date()
        }));

        progress.push({
          internshipId: int2._id,
          completedLectures: inProgressLectures
        });
      }

      if (!user) {
        const hashedPassword = await bcrypt.hash('TestCandidate@123', 10);
        user = new User({
          fullName: 'Test Candidate',
          email,
          phone: '9876543210',
          password: hashedPassword,
          role: 'user',
          status: 'Active',
          loginMethod: 'email',
          profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          enrolledInternships: enrolled,
          internshipProgress: progress
        });
        await user.save();
      } else {
        // Ensure user has up-to-date mock enrolled internships and progress
        user.enrolledInternships = enrolled;
        user.internshipProgress = progress;
        await user.save();
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

      return res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        enrolledCourses: user.enrolledCourses || [],
        enrolledInternships: user.enrolledInternships || [],
        token
      });
    } catch (error) {
      console.error('Error during dev-login:', error);
      return res.status(500).json({ message: 'Dev login server error', error: error.message });
    }
  });
}
router.post('/forgot-password', forgotPassword);
router.post('/verify-security-answer', verifySecurityAnswer);
router.post('/reset-password', resetPassword);
router.post('/setup-security-question', setupSecurityQuestionByEmail);

// Public Certificate Download via QR Code (no authentication required)
router.get('/certificate/download', downloadCertificateByQR);

// Public Certificate Verification API (for LinkedIn and public verification page)
router.get('/verify-certificate/:certificateId', verifyCertificate);

// 🔍 DEBUG ENDPOINT - Check enrollment status
const debugEnrollment = require('../controllers/debugEnrollment');
router.get('/debug/:courseId', protectUser, debugEnrollment);

// 🔧 AUTO-ENROLL SYNC - Fix missing enrollments
const { syncEnrollments } = require('../controllers/userController');
router.post('/sync-enrollments', protectUser, syncEnrollments);





// Protected User Routes
router.post('/set-security-question', protectUser, setSecurityQuestion);
router.post('/enroll', protectUser, enrollInCourse);
router.post('/enroll-internship', protectUser, enrollInInternship);
router.get('/my-internships', protectUser, getMyEnrolledInternships);
router.get('/my-courses', protectUser, getMyEnrolledCourses);
router.get('/internship-progress/:internshipId', protectUser, getInternshipProgress);
router.get('/course-progress/:courseId', protectUser, getCourseProgress);
// CORS preflight is handled by Nginx in production, Express in development
// router.options('/submit-task', cors()); // Disabled - handled at server level
router.post(
  '/submit-task',
  protectUser,
  uploadSubmission.array('submissionFiles', 5),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ message: `Unknown upload error: ${err.message}` });
    }
    next();
  },
  submitTask
);
router.post('/submit-quiz', protectUser, submitQuiz);
router.post('/mark-lecture-complete', protectUser, markLectureAsCompleted);
router.post('/update-video-progress', protectUser, updateVideoProgress);
router.route('/profile').get(protectUser, getUserProfile).put(protectUser, updateUserProfile);
router.put('/change-password', protectUser, changeUserPassword);

// Profile Picture Route
router.put('/profile-picture', protectUser, uploadThumbnail.single('profilePicture'), processProfilePicture, updateProfilePicture);

// Certificate Routes
router.get('/certificates', protectUser, getCompletedCourses);
router.get('/certificate/:courseId/download', protectUser, generateCertificate);

// Offer Letter Route
router.get('/offer-letter/:internshipId/download', protectUser, generateOfferLetter);

// --- 2. ADD THE NEW ROUTES FOR INTERNSHIP COMPLETION ---
// This route gets the list of completed internships
router.get('/completed-internships', protectUser, getCompletedInternships);
// This route generates and downloads the completion letter PDF
router.get('/internship-letter/:internshipId/download', protectUser, generateInternshipLetter);


module.exports = router;    