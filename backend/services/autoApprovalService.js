const User = require('../models/userModel');

const AUTO_APPROVAL_MINUTES = 60;

const autoApprovePendingSubmissions = async () => {
  try {
    const cutoff = new Date(Date.now() - AUTO_APPROVAL_MINUTES * 60 * 1000);
    console.log(`[Auto-Approval] Checking submissions pending since before ${cutoff.toISOString()}`);

    const users = await User.find({
      'internshipProgress.completedLectures.status': 'Pending',
      'internshipProgress.completedLectures.submittedAt': { $lt: cutoff }
    });

    let totalApproved = 0;

    for (const user of users) {
      for (const internshipProgress of user.internshipProgress || []) {
        for (const lecture of internshipProgress.completedLectures || []) {
          if (
            lecture.status === 'Pending' &&
            lecture.submittedAt &&
            new Date(lecture.submittedAt) < cutoff
          ) {
            const result = await User.updateOne(
              {
                _id: user._id,
                'internshipProgress.internshipId': internshipProgress.internshipId,
                'internshipProgress.completedLectures.lectureId': lecture.lectureId
              },
              {
                $set: {
                  'internshipProgress.$[ip].completedLectures.$[lec].status': 'Approved'
                }
              },
              {
                arrayFilters: [
                  { 'ip.internshipId': internshipProgress.internshipId },
                  { 'lec.lectureId': lecture.lectureId }
                ]
              }
            );

            if (result.modifiedCount > 0) {
              totalApproved += 1;
              console.log(
                `[Auto-Approval] Approved submission for user ${user._id}, internship ${internshipProgress.internshipId}, lecture ${lecture.lectureId}`
              );
            }
          }
        }
      }
    }

    if (totalApproved === 0) {
      console.log('[Auto-Approval] No pending submissions to approve.');
    } else {
      console.log(`[Auto-Approval] Approved ${totalApproved} submissions.`);
    }

    return { success: true, totalApproved };
  } catch (error) {
    console.error('[Auto-Approval] Error during auto-approval:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { autoApprovePendingSubmissions };


