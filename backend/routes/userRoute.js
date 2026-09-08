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