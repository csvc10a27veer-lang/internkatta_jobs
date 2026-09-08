const User = require('../models/userModel');

// @desc    Debug user enrollment status for specific course
// @route   GET /api/users/debug/:courseId
// @access  Private  
const debugEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id.toString();
    
    console.log(`🔍 DEBUG ENROLLMENT - User: ${userId}, Course: ${courseId}`);
    
    const user = await User.findById(userId)
      .select('enrolledCourses _id fullName email')
      .lean();
      
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found', 
        userId 
      });
    }
    
    const enrolledCourseIds = user.enrolledCourses.map(id => id.toString());
    const isEnrolled = enrolledCourseIds.includes(courseId);
    
    console.log(`✅ User found: ${user.fullName} (${user.email})`);
    console.log(`📚 Enrolled courses (${enrolledCourseIds.length}):`, enrolledCourseIds.slice(0,5));
    console.log(`🎯 Target course enrolled:`, isEnrolled);
    
    res.json({
      success: true,
      userId,
      userName: user.fullName,
      userEmail: user.email,
      targetCourseId: courseId,
      isEnrolled,
      enrolledCourses: enrolledCourseIds,
      enrolledCoursesCount: enrolledCourseIds.length
    });
    
  } catch (error) {
    console.error('❌ Debug enrollment error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = debugEnrollment;

