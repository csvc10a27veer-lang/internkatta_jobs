const Internship = require('../models/internshipModel.js');
const InternshipCategory = require('../models/internshipCategoryModel.js');
const User = require('../models/userModel.js');
const Notification = require('../models/notificationModel.js');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { LIMITS, validateWordLimit } = require('../utils/validation');

// @desc    Create a new internship
const createInternship = asyncHandler(async (req, res) => {
    const { title, description, category, tutor, price, discountedPrice, rating, duration, difficulty, lectures, smallDescription, whatYouWillLearn, toolsAndTechnologies, prerequisites, skills, hasCertificate, projectsCount, seats, mode } = req.body;
    if (!title || !description || !category || !tutor || !price || !duration) {
        res.status(400);
        throw new Error('Please provide all required fields: title, description, category, tutor, price, duration.');
    }

    if (smallDescription && !validateWordLimit(smallDescription, LIMITS.SMALL_DESCRIPTION_MAX_WORDS)) {
        res.status(400);
        throw new Error(`Small description cannot exceed ${LIMITS.SMALL_DESCRIPTION_MAX_WORDS} words.`);
    }
    if (description && !validateWordLimit(description, LIMITS.DETAILED_DESCRIPTION_MAX_WORDS)) {
        res.status(400);
        throw new Error(`Detailed description cannot exceed ${LIMITS.DETAILED_DESCRIPTION_MAX_WORDS} words.`);
    }
    if (!req.files || !req.files.thumbnail || !req.files.thumbnail[0]) {
        res.status(400);
        throw new Error('Thumbnail image is required.');
    }
    
    // Helper function to get the correct protocol
    const getProtocol = () => {
        // Check if we're behind a proxy (production)
        if (req.headers['x-forwarded-proto']) {
            return req.headers['x-forwarded-proto'];
        }
        // Check if we're using HTTPS
        if (req.secure) {
            return 'https';
        }
        // Default to protocol from request
        return req.protocol;
    };

    const protocol = getProtocol();
    const baseUrl = `${protocol}://${req.get('host')}`;
    
    const host = req.get('host') || '';
    let finalBaseUrl;
    if (host.includes('localhost')) {
        finalBaseUrl = baseUrl;
    } else if (host.includes('test.internkatta.com')) {
        finalBaseUrl = 'https://api.test.internkatta.com';
    } else {
        finalBaseUrl = 'https://api.internkatta.com';
    }
    
    const parsedLectures = lectures ? JSON.parse(lectures) : [];
    const internship = await Internship.create({
        title, description, category, tutor, price, discountedPrice: discountedPrice || null, rating: rating || 0, duration, difficulty: difficulty || 'Intermediate', lectures: parsedLectures,
        smallDescription,
        whatYouWillLearn: whatYouWillLearn ? JSON.parse(whatYouWillLearn) : [],
        toolsAndTechnologies: toolsAndTechnologies ? JSON.parse(toolsAndTechnologies) : [],
        prerequisites: prerequisites ? JSON.parse(prerequisites) : [],
        skills: skills ? JSON.parse(skills) : [],
        hasCertificate: hasCertificate !== undefined ? hasCertificate === 'true' || hasCertificate === true : true,
        projectsCount: projectsCount ? Number(projectsCount) : 0,
        seats: seats || 'Unlimited',
        mode: mode || 'Online',
        thumbnail: {
            public_id: req.files.thumbnail[0].filename,
            url: `${finalBaseUrl}/uploads/thumbnails/${req.files.thumbnail[0].filename}`
        },
        ...(req.files.bannerImage && req.files.bannerImage[0] && {
            bannerImage: {
                public_id: req.files.bannerImage[0].filename,
                url: `${finalBaseUrl}/uploads/thumbnails/${req.files.bannerImage[0].filename}`
            }
        })
    });
    res.status(201).json({
        message: "Internship created successfully",
        internship,
    });
});

// @desc    Get all internships
const getAllInternships = asyncHandler(async (req, res) => {
    // Only select fields needed for listing page - exclude heavy fields like lectures
    const internships = await Internship.find({ deleted: { $ne: true } })
        .select('title description category tutor price discountedPrice rating duration difficulty thumbnail createdAt updatedAt')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .lean(); // Use lean() for better performance (returns plain JS objects)
    
    res.status(200).json(internships);
});

// @desc    Delete an internship - Soft delete
const deleteInternship = asyncHandler(async (req, res) => {
    const internship = await Internship.findById(req.params.id);
    if (internship) {
        if (internship.deleted) {
            res.status(400);
            throw new Error('Internship is already deleted');
        }
        // Soft delete - mark as deleted instead of removing
        internship.deleted = true;
        internship.deletedAt = new Date();
        await internship.save();
        res.json({ message: 'Internship moved to recycle bin successfully' });
    } else {
        res.status(404);
        throw new Error('Internship not found');
    }
});

// @desc    Get a single internship by ID
const getInternshipById = asyncHandler(async (req, res) => {
    const internship = await Internship.findOne({ _id: req.params.id, deleted: { $ne: true } }).populate('category', 'name');
    if (internship) {
        res.json(internship);
    } else {
        res.status(404);
        throw new Error('Internship not found');
    }
});

// @desc    Update an internship
const updateInternship = asyncHandler(async (req, res) => {
    const { title, description, category, tutor, price, discountedPrice, rating, duration, difficulty, lectures, smallDescription, whatYouWillLearn, toolsAndTechnologies, prerequisites, skills, hasCertificate, projectsCount, seats, mode } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
        res.status(404);
        throw new Error('Internship not found');
    }
    
    // Perform validation before updating
    const finalSmallDesc = smallDescription !== undefined ? smallDescription : internship.smallDescription;
    const finalDesc = description !== undefined ? description : internship.description;

    if (finalSmallDesc && !validateWordLimit(finalSmallDesc, LIMITS.SMALL_DESCRIPTION_MAX_WORDS)) {
        res.status(400);
        throw new Error(`Small description cannot exceed ${LIMITS.SMALL_DESCRIPTION_MAX_WORDS} words.`);
    }
    if (finalDesc && !validateWordLimit(finalDesc, LIMITS.DETAILED_DESCRIPTION_MAX_WORDS)) {
        res.status(400);
        throw new Error(`Detailed description cannot exceed ${LIMITS.DETAILED_DESCRIPTION_MAX_WORDS} words.`);
    }
    
    // Log received rating for debugging
    console.log('🔵 UpdateInternship - Received rating:', rating, 'Type:', typeof rating);
    
    internship.title = title || internship.title;
    internship.description = description || internship.description;
    internship.category = category || internship.category;
    internship.tutor = tutor || internship.tutor;
    internship.price = price !== undefined ? (typeof price === 'string' ? parseFloat(price) : price) : internship.price;
    internship.discountedPrice = discountedPrice !== undefined ? (discountedPrice ? (typeof discountedPrice === 'string' ? parseFloat(discountedPrice) : discountedPrice) : null) : internship.discountedPrice;
    
    if (smallDescription !== undefined) internship.smallDescription = smallDescription;
    if (whatYouWillLearn) internship.whatYouWillLearn = JSON.parse(whatYouWillLearn);
    if (toolsAndTechnologies) internship.toolsAndTechnologies = JSON.parse(toolsAndTechnologies);
    if (prerequisites) internship.prerequisites = JSON.parse(prerequisites);
    if (skills) internship.skills = JSON.parse(skills);
    if (hasCertificate !== undefined) internship.hasCertificate = hasCertificate === 'true' || hasCertificate === true;
    if (projectsCount !== undefined) internship.projectsCount = Number(projectsCount);
    if (seats !== undefined) internship.seats = seats;
    if (mode !== undefined) internship.mode = mode;
    
    // Parse rating as number (FormData sends as string)
    // Handle both string and number, ensure it's a valid number between 0 and 5
    if (rating !== undefined && rating !== null && rating !== '') {
        const parsedRating = typeof rating === 'string' ? parseFloat(rating) : rating;
        internship.rating = isNaN(parsedRating) ? 0 : Math.max(0, Math.min(5, parsedRating));
    } else {
        // If rating is undefined, null, or empty string, keep existing value
        internship.rating = internship.rating || 0;
    }
    internship.duration = duration || internship.duration;
    
    // Handle difficulty - explicitly check if it's provided
    if (difficulty !== undefined && difficulty !== null && difficulty !== '') {
        internship.difficulty = difficulty;
    } else if (!internship.difficulty) {
        // Only set default if difficulty doesn't exist
        internship.difficulty = 'Intermediate';
    }
    // Otherwise keep existing difficulty value
    
    // Log the rating that will be saved
    console.log('🔵 UpdateInternship - Rating to be saved:', internship.rating, 'Type:', typeof internship.rating);
    console.log('🔵 UpdateInternship - Difficulty to be saved:', internship.difficulty, 'Received:', difficulty);
    if (lectures) {
        const parsedLectures = JSON.parse(lectures);
        
        // Debug: Log what we received from frontend
        console.log('🔵 Backend received lectures:', parsedLectures.length);
        parsedLectures.forEach((lecture, index) => {
            console.log(`🔵 Lecture ${index} contentSections:`, lecture.contentSections?.length || 0);
            if (lecture.contentSections) {
                lecture.contentSections.forEach((section, sectionIndex) => {
                    console.log(`🔵 Lecture ${index}, Section ${sectionIndex} image:`, section.image);
                });
            }
        });
        
        // Smart content synchronization logic
        // FIX: contentSections is the source of truth. Empty array [] is valid and should be preserved.
        // Regeneration from lectureContent should ONLY happen when contentSections is undefined/null.
        parsedLectures.forEach((lecture, index) => {
            console.log(`🔍 Processing lecture ${index}:`, {
                hasContent: !!lecture.lectureContent,
                hasContentSections: !!lecture.contentSections,
                contentSectionsLength: lecture.contentSections?.length || 0,
                isArray: Array.isArray(lecture.contentSections),
                contentSections: lecture.contentSections
            });
            
            // If contentSections is an array (even if empty), it is authoritative - DO NOT regenerate
            if (Array.isArray(lecture.contentSections)) {
                // Empty array [] is a valid, intentional state - preserve it
                if (lecture.contentSections.length > 0) {
                    console.log(`🟢 Keeping ${lecture.contentSections.length} provided sections for lecture ${index}`);
                    console.log(`🟢 ContentSections details:`, JSON.stringify(lecture.contentSections, null, 2));
                } else {
                    // Empty array is valid - preserve it (intentional empty state)
                    console.log(`🟡 Preserving empty contentSections array for lecture ${index} (valid state)`);
                }
            } else if (lecture.contentSections === undefined || lecture.contentSections === null) {
                // Only regenerate when contentSections is truly missing (undefined/null)
                // Try to preserve existing sections from database first
                const existingLecture = internship.lectures.find(l => l.lectureTitle === lecture.lectureTitle);
                if (existingLecture && Array.isArray(existingLecture.contentSections) && existingLecture.contentSections.length > 0) {
                    // Preserve existing contentSections from database
                    lecture.contentSections = existingLecture.contentSections;
                    console.log(`🟠 Preserving ${lecture.contentSections.length} existing sections for lecture ${index}`);
                    console.log(`🟠 Preserved ContentSections details:`, JSON.stringify(lecture.contentSections, null, 2));
                } else if (lecture.lectureContent) {
                    // Last resort: create single section from lectureContent only if no existing sections
                    // This should rarely happen in practice
                    lecture.contentSections = [{
                        type: 'text',
                        content: lecture.lectureContent,
                        image: '/assets/Welcome/panda.png', // Default image
                        alignment: 'left'
                    }];
                    console.log(`🔵 Created single section from lectureContent for lecture ${index} (no existing sections)`);
                    console.log(`🔵 ContentSections details:`, JSON.stringify(lecture.contentSections, null, 2));
                } else {
                    // No content at all - set empty array
                    lecture.contentSections = [];
                    console.log(`⚪ No content available for lecture ${index}, setting empty array`);
                }
            }
            // If contentSections is neither array nor undefined/null (unexpected type), preserve existing from DB
            else {
                const existingLecture = internship.lectures.find(l => l.lectureTitle === lecture.lectureTitle);
                if (existingLecture && Array.isArray(existingLecture.contentSections)) {
                    lecture.contentSections = existingLecture.contentSections;
                    console.log(`🟠 Preserving existing sections for lecture ${index} (unexpected contentSections type)`);
                } else {
                    lecture.contentSections = [];
                    console.log(`⚪ Setting empty array for lecture ${index} (unexpected contentSections type)`);
                }
            }
        });
        // FIX: Reconstruct the lectures array by preserving existing Mongoose Subdocuments.
        // This is extremely critical because Mongoose completely regenerates _id fields 
        // if we just assign `internship.lectures = parsedLectures;`, breaking user progress.
        internship.lectures = parsedLectures.map(lecture => {
            if (lecture._id) {
                // Find existing subdocument by ID
                const existingLecture = internship.lectures.id(lecture._id);
                if (existingLecture) {
                    // Update existing subdocument in place without losing its core identity
                    existingLecture.set(lecture);
                    return existingLecture;
                }
            }
            // For brand new topics (no _id), or if an _id was sent but doesn't match anything
            // return the plain object so Mongoose will create a new Subdocument for it.
            return lecture;
        });
        
        // Debug: Log final lectures before saving
        console.log('🔵 Final lectures before saving:');
        internship.lectures.forEach((lecture, index) => {
            console.log(`🔵 Final lecture ${index}:`, {
                title: lecture.lectureTitle,
                contentSectionsLength: lecture.contentSections?.length || 0,
                contentSections: lecture.contentSections
            });
        });
    }

    const getProtocol = () => {
        if (req.headers['x-forwarded-proto']) return req.headers['x-forwarded-proto'];
        if (req.secure) return 'https';
        return req.protocol;
    };
    const protocol = getProtocol();
    const baseUrl = `${protocol}://${req.get('host')}`;
    const host = req.get('host') || '';
    let finalBaseUrl;
    if (host.includes('localhost')) {
        finalBaseUrl = baseUrl;
    } else if (host.includes('test.internkatta.com')) {
        finalBaseUrl = 'https://api.test.internkatta.com';
    } else {
        finalBaseUrl = 'https://api.internkatta.com';
    }

    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
        const oldThumbnailPath = path.join(__dirname, '..', 'uploads', 'thumbnails', internship.thumbnail.public_id);
        fs.unlink(oldThumbnailPath, (err) => {
            if (err) console.error("Could not delete old thumbnail:", err);
        });
        internship.thumbnail = {
            public_id: req.files.thumbnail[0].filename,
            url: `${finalBaseUrl}/uploads/thumbnails/${req.files.thumbnail[0].filename}`
        };
    }

    if (req.files && req.files.bannerImage && req.files.bannerImage[0]) {
        if (internship.bannerImage && internship.bannerImage.public_id) {
            const oldBannerPath = path.join(__dirname, '..', 'uploads', 'thumbnails', internship.bannerImage.public_id);
            fs.unlink(oldBannerPath, (err) => {
                if (err) console.error("Could not delete old banner image:", err);
            });
        }
        internship.bannerImage = {
            public_id: req.files.bannerImage[0].filename,
            url: `${finalBaseUrl}/uploads/thumbnails/${req.files.bannerImage[0].filename}`
        };
    }
    
    const updatedInternship = await internship.save();
    
    // Debug: Log what was actually saved to database
    console.log('🔵 Internship saved to database successfully!');
    console.log('🔵 Saved internship lectures:');
    updatedInternship.lectures.forEach((lecture, index) => {
        console.log(`🔵 Saved lecture ${index}:`, {
            title: lecture.lectureTitle,
            contentSectionsLength: lecture.contentSections?.length || 0,
            contentSections: lecture.contentSections
        });
    });
    
    res.json(updatedInternship);
});


// --- THIS IS THE CORRECTED FUNCTION ---
// @desc    Get all task submissions for the admin panel
const getAllSubmissions = async (req, res) => {
    try {
        const usersWithSubmissions = await User.find({
            "internshipProgress": {
                "$elemMatch": {
                    "completedLectures": {
                        "$elemMatch": { "status": { "$ne": "Not Started" } }
                    }
                }
            }
        })
        .select('fullName internshipProgress')
        .populate({
            path: 'internshipProgress.internshipId',
            select: 'title lectures',
        });

        let allSubmissions = [];
        usersWithSubmissions.forEach(user => {
            user.internshipProgress.forEach(progress => {
                progress.completedLectures.forEach(lecture => {
                    if (lecture.status !== 'Not Started' && progress.internshipId) {
                        const originalLecture = progress.internshipId.lectures.find(l => l._id.toString() === lecture.lectureId.toString());
                        allSubmissions.push({
                            userId: user._id,
                            userName: user.fullName,
                            internshipId: progress.internshipId._id,
                            internshipTitle: progress.internshipId.title,
                            lectureId: lecture.lectureId,
                            taskDescription: originalLecture ? originalLecture.taskPrompt : 'Task description not found.',
                            status: lecture.status,
                            submittedFileUrl: lecture.submittedFile?.url || '',
                            submittedFiles: lecture.submittedFiles || (lecture.submittedFile ? [lecture.submittedFile] : []),
                            submittedAt: lecture.submittedAt,
                        });
                    }
                });
            });
        });
        
        allSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        res.status(200).json(allSubmissions);

    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Server error while fetching submissions." });
    }
};

// --- THIS IS THE CORRECTED AND IMPLEMENTED FUNCTION ---
// @desc    Get internship content and user progress for the player
// @route   GET /api/v1/internships/user-data/:id
// @access  Private (User)
const getInternshipDataForUser = async (req, res) => {
    try {
        const { id: internshipId } = req.params;
        const userId = req.user._id;

        const [internship, user] = await Promise.all([
            Internship.findById(internshipId).lean(),
            User.findById(userId).select('internshipProgress enrolledInternships')
        ]);

        if (!internship) {
            return res.status(404).json({ message: "Internship not found" });
        }

        // --- THE FIX ---
        // We now check both the main enrollment array AND for a progress object.
        // This ensures the security check is robust and correct.
        const isEnrolled = user.enrolledInternships.includes(internshipId);
        const userProgress = user.internshipProgress.find(p => p.internshipId.toString() === internshipId);
        
        if (!isEnrolled) {
             return res.status(403).json({ message: "You are not enrolled in this internship." });
        }

        // If the user is enrolled but has no progress yet (e.g., they just purchased it),
        // we can create a default progress object to send back.
        const progressToSend = userProgress || { internshipId, completedLectures: [] };

        res.status(200).json({ internship, userProgress: progressToSend });

    } catch (error) {
        console.error("Error fetching internship data for user:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update the status of a task submission
const updateSubmissionStatus = async (req, res) => {
    try {
        const { userId, internshipId, lectureId, newStatus } = req.body;
        
        console.log('🔵 updateSubmissionStatus - Received data:', { userId, internshipId, lectureId, newStatus });
        
        // Validate input
        if (!userId || !internshipId || !lectureId || !newStatus) {
            console.error('❌ Missing required fields');
            return res.status(400).json({ message: "Missing required fields: userId, internshipId, lectureId, and newStatus are required." });
        }
        
        if (!['Approved', 'Rejected'].includes(newStatus)) {
            console.error('❌ Invalid status:', newStatus);
            return res.status(400).json({ message: "Invalid status. Must be 'Approved' or 'Rejected'." });
        }
        
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId) || 
            !mongoose.Types.ObjectId.isValid(internshipId) || 
            !mongoose.Types.ObjectId.isValid(lectureId)) {
            console.error('❌ Invalid ObjectId format');
            return res.status(400).json({ message: "Invalid ID format provided." });
        }
        
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            console.error('❌ User not found:', userId);
            return res.status(404).json({ message: "User not found." });
        }
        
        console.log('✅ User found:', user.email);
        console.log('🔵 User internshipProgress count:', user.internshipProgress?.length || 0);
        
        // Convert IDs to strings for comparison
        const internshipIdStr = internshipId.toString();
        const lectureIdStr = lectureId.toString();
        
        // Find internship progress - use string comparison
        const progress = user.internshipProgress.find(p => {
            if (!p.internshipId) return false;
            return p.internshipId.toString() === internshipIdStr;
        });
        
        if (!progress) {
            console.error('❌ Internship progress not found. Looking for:', internshipIdStr);
            console.error('❌ Available progress:', user.internshipProgress.map(p => ({
                internshipId: p.internshipId?.toString() || 'null',
                completedLecturesCount: p.completedLectures?.length || 0
            })));
            return res.status(404).json({ message: "Internship progress not found for this user." });
        }
        
        console.log('✅ Progress found. Completed lectures count:', progress.completedLectures?.length || 0);
        
        // Find lecture submission - use string comparison
        const lectureToUpdate = progress.completedLectures.find(l => {
            if (!l.lectureId) return false;
            return l.lectureId.toString() === lectureIdStr;
        });
        
        if (!lectureToUpdate) {
            console.error('❌ Lecture submission not found. Looking for:', lectureIdStr);
            console.error('❌ Available lectures:', progress.completedLectures.map(l => ({
                lectureId: l.lectureId?.toString() || 'null',
                status: l.status || 'undefined'
            })));
            return res.status(404).json({ message: "Lecture submission not found." });
        }
        
        console.log('✅ Lecture found. Current status:', lectureToUpdate.status);
        
        // Convert IDs to ObjectId for MongoDB query
        const userObjId = new mongoose.Types.ObjectId(userId);
        const internshipObjId = new mongoose.Types.ObjectId(internshipId);
        const lectureObjId = new mongoose.Types.ObjectId(lectureId);
        
        // Use findOneAndUpdate with arrayFilters for reliable nested updates
        try {
            const result = await User.findOneAndUpdate(
                {
                    _id: userObjId,
                    'internshipProgress.internshipId': internshipObjId
                },
                {
                    $set: {
                        'internshipProgress.$[progress].completedLectures.$[lecture].status': newStatus
                    }
                },
                {
                    arrayFilters: [
                        { 'progress.internshipId': internshipObjId },
                        { 'lecture.lectureId': lectureObjId }
                    ],
                    new: true,
                    runValidators: true
                }
            );
            
            if (!result) {
                console.error('❌ Update operation returned no result');
                return res.status(404).json({ message: "Could not update submission status. Record not found." });
            }
            
            console.log('✅ Status updated successfully to:', newStatus);

            // --- Create Notification for User ---
            try {
                const notification = await Notification.create({
                    recipient: userId,
                    type: 'GRADING',
                    title: `Submission ${newStatus}`,
                    message: `Your submission for an internship task has been marked as ${newStatus}.`,
                    link: `/user/internship-view/${internshipId}`,
                    isRead: false
                });

                // Emit to connected user
                const io = req.app.get('io');
                if (io) {
                    io.to(userId.toString()).emit('newNotification', notification);
                }
            } catch (notifError) {
                console.error('Error creating notification for grading:', notifError);
            }

            res.status(200).json({ message: `Submission status successfully updated to ${newStatus}.` });
        } catch (updateError) {
            console.error('❌ Error updating user:', updateError);
            console.error('❌ Update error details:', {
                name: updateError.name,
                message: updateError.message,
                stack: updateError.stack
            });
            return res.status(500).json({ 
                message: "Error saving status update.",
                error: process.env.NODE_ENV === 'development' ? updateError.message : undefined
            });
        }
    } catch (error) {
        console.error("❌ Error updating submission status:", error);
        console.error("❌ Error stack:", error.stack);
        res.status(500).json({ 
            message: "Server error while updating status.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// --- EXPORTS ---
module.exports = {
    createInternship,
    getAllInternships,
    deleteInternship,
    getInternshipById,
    updateInternship,
    getAllSubmissions,
    updateSubmissionStatus,
    getInternshipDataForUser,
};