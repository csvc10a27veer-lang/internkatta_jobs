// backend/controllers/courseController.js

const Course = require('../models/courseModel');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');
const { LIMITS, validateWordLimit } = require('../utils/validation');

// @desc    Get all courses (Public)
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ deleted: { $ne: true } })
            .sort({ createdAt: -1 });

        // Fallback: compute size on the fly for any course missing size
        const getBytesFromUrl = (url) => {
            try {
                if (!url || !url.includes('/uploads/')) return 0;
                const filename = url.split('/uploads/')[1];
                const filePath = path.join(__dirname, '..', 'uploads', filename);
                const stat = fs.statSync(filePath);
                return stat.size || 0;
            } catch (e) {
                return 0;
            }
        };

        const coursesWithSize = courses.map((course) => {
            if (course.totalSizeBytes && course.totalSizeBytes > 0) return course;
            let totalSizeBytes = 0;
            totalSizeBytes += getBytesFromUrl(course.thumbnailUrl);
            totalSizeBytes += getBytesFromUrl(course.introVideoUrl);
            course.sections.forEach(section => {
                section.lectures.forEach(lecture => {
                    totalSizeBytes += getBytesFromUrl(lecture.videoUrl);
                });
            });
            // Do not mutate DB here; only set in the response
            const asObj = course.toObject();
            asObj.totalSizeBytes = totalSizeBytes;
            return asObj;
        });

        res.status(200).json(coursesWithSize);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new course (Private/Admin)
const addCourse = async (req, res) => {
    try {
        const { title, subtitle, description, smallDescription, category, level, tutor, price, discountedPrice, sections, whatYouWillLearn, toolsAndTechnologies, prerequisites, skills } = req.body;
        const files = req.files;

        if (smallDescription && !validateWordLimit(smallDescription, LIMITS.SMALL_DESCRIPTION_MAX_WORDS)) {
            return res.status(400).json({ message: `Small description cannot exceed ${LIMITS.SMALL_DESCRIPTION_MAX_WORDS} words.` });
        }
        if (description && !validateWordLimit(description, LIMITS.DETAILED_DESCRIPTION_MAX_WORDS)) {
            return res.status(400).json({ message: `Detailed description cannot exceed ${LIMITS.DETAILED_DESCRIPTION_MAX_WORDS} words.` });
        }

        if (!files.thumbnail) {
            return res.status(400).json({ message: 'A thumbnail image is required.' });
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

        const thumbnailUrl = `${finalBaseUrl}/uploads/${files.thumbnail[0].filename}`;
        const bannerImageUrl = files.bannerImage ? `${finalBaseUrl}/uploads/${files.bannerImage[0].filename}` : '';
        const introVideoUrl = files.introVideo ? `${finalBaseUrl}/uploads/${files.introVideo[0].filename}` : '';
        
        let parsedSections = JSON.parse(sections);
        let videoFileIndex = 0;

        for (const section of parsedSections) {
            for (const lecture of section.lectures) {
                if (files.lectureVideos && files.lectureVideos[videoFileIndex]) {
                    lecture.videoUrl = `${finalBaseUrl}/uploads/${files.lectureVideos[videoFileIndex].filename}`;
                    videoFileIndex++;
                } else {
                    lecture.videoUrl = undefined; 
                }
            }
        }

        // Validate that all lectures have videoUrl for new courses
        for (const section of parsedSections) {
            for (const lecture of section.lectures) {
                if (!lecture.videoUrl) {
                    return res.status(400).json({ 
                        message: "Validation Error: A video is required for every lecture." 
                    });
                }
            }
        }

        // Compute total size (thumbnail + bannerImage + intro + all lecture videos)
        const sumSizes = (arr = []) => arr.reduce((s, f) => s + (f.size || 0), 0);
        const totalSizeBytes =
            sumSizes(files.thumbnail) +
            sumSizes(files.bannerImage) +
            sumSizes(files.introVideo) +
            sumSizes(files.lectureVideos);

        // Validate total course size - maximum 2GB
        const MAX_COURSE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
        if (totalSizeBytes > MAX_COURSE_SIZE_BYTES) {
            // Delete uploaded files if course size exceeds limit
            const deleteFile = (fileUrl) => {
                if (fileUrl && fileUrl.includes('/uploads/')) {
                    const filename = fileUrl.split('/uploads/')[1];
                    const filePath = path.join(__dirname, '..', 'uploads', filename);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Failed to delete file: ${filePath}`, err);
                    });
                }
            };
            if (files.thumbnail && files.thumbnail[0]) {
                deleteFile(thumbnailUrl);
            }
            if (files.bannerImage && files.bannerImage[0]) {
                deleteFile(bannerImageUrl);
            }
            if (files.introVideo && files.introVideo[0]) {
                deleteFile(introVideoUrl);
            }
            if (files.lectureVideos) {
                files.lectureVideos.forEach(video => {
                    const videoUrl = `${finalBaseUrl}/uploads/${video.filename}`;
                    deleteFile(videoUrl);
                });
            }
            const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (MAX_COURSE_SIZE_BYTES / (1024 * 1024)).toFixed(2);
            return res.status(400).json({ 
                message: `Course size (${totalSizeMB} MB) exceeds the maximum allowed size of ${maxSizeMB} MB (2GB). Please reduce the file sizes or remove some content.` 
            });
        }

        const course = await Course.create({
            title, subtitle, description, smallDescription, category, level, tutor, price, discountedPrice,
            whatYouWillLearn: whatYouWillLearn ? JSON.parse(whatYouWillLearn) : [],
            toolsAndTechnologies: toolsAndTechnologies ? JSON.parse(toolsAndTechnologies) : [],
            prerequisites: prerequisites ? JSON.parse(prerequisites) : [],
            skills: skills ? JSON.parse(skills) : [],
            thumbnailUrl,
            bannerImageUrl,
            introVideoUrl,
            sections: parsedSections,
            totalSizeBytes,
            createdBy: req.user._id,
        });

        res.status(201).json(course);
    } catch (error) {
        console.error("Error creating course:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error: A video is required for every lecture." });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a course (Private/Admin) - Soft delete
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.deleted) {
            return res.status(400).json({ message: 'Course is already deleted' });
        }
        // Soft delete - mark as deleted instead of removing
        course.deleted = true;
        course.deletedAt = new Date();
        await course.save();
        res.status(200).json({ id: req.params.id, message: 'Course moved to recycle bin successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single course by its ID (Public)
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, deleted: { $ne: true } });
        if (course) {
            // Fallback compute if missing
            if (!course.totalSizeBytes || course.totalSizeBytes === 0) {
                const getBytesFromUrl = (url) => {
                    try {
                        if (!url || !url.includes('/uploads/')) return 0;
                        const filename = url.split('/uploads/')[1];
                        const filePath = path.join(__dirname, '..', 'uploads', filename);
                        const stat = fs.statSync(filePath);
                        return stat.size || 0;
                    } catch (e) {
                        return 0;
                    }
                };
                let totalSizeBytes = 0;
                totalSizeBytes += getBytesFromUrl(course.thumbnailUrl);
                totalSizeBytes += getBytesFromUrl(course.bannerImageUrl);
                totalSizeBytes += getBytesFromUrl(course.introVideoUrl);
                course.sections.forEach(section => {
                    section.lectures.forEach(lecture => {
                        totalSizeBytes += getBytesFromUrl(lecture.videoUrl);
                    });
                });
                const asObj = course.toObject();
                asObj.totalSizeBytes = totalSizeBytes;
                return res.status(200).json(asObj);
            }
            res.status(200).json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update an existing course (Private/Admin)
const updateCourse = async (req, res) => {
    try {
        // Debug: Log the request details
        console.log('=== COURSE UPDATE DEBUG ===');
        console.log('Request headers:', req.headers);
        console.log('User object:', req.user);
        console.log('Course ID:', req.params.id);
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
        
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        const { title, subtitle, description, smallDescription, category, level, tutor, price, discountedPrice, sections, whatYouWillLearn, toolsAndTechnologies, prerequisites, skills } = req.body;
        const files = req.files;

        // Perform validation before updating
        const finalSmallDesc = smallDescription !== undefined ? smallDescription : course.smallDescription;
        const finalDesc = description !== undefined ? description : course.description;

        if (finalSmallDesc && !validateWordLimit(finalSmallDesc, LIMITS.SMALL_DESCRIPTION_MAX_WORDS)) {
            return res.status(400).json({ message: `Small description cannot exceed ${LIMITS.SMALL_DESCRIPTION_MAX_WORDS} words.` });
        }
        if (finalDesc && !validateWordLimit(finalDesc, LIMITS.DETAILED_DESCRIPTION_MAX_WORDS)) {
            return res.status(400).json({ message: `Detailed description cannot exceed ${LIMITS.DETAILED_DESCRIPTION_MAX_WORDS} words.` });
        }

        
        // Update basic course information
        course.title = title || course.title;
        course.subtitle = subtitle || course.subtitle;
        course.description = description || course.description;
        course.smallDescription = smallDescription || course.smallDescription;
        course.category = category || course.category;
        course.level = level || course.level;
        course.tutor = tutor || course.tutor;
        course.price = price || course.price;
        course.discountedPrice = discountedPrice ?? course.discountedPrice;

        if (whatYouWillLearn !== undefined) course.whatYouWillLearn = whatYouWillLearn ? JSON.parse(whatYouWillLearn) : [];
        if (toolsAndTechnologies !== undefined) course.toolsAndTechnologies = toolsAndTechnologies ? JSON.parse(toolsAndTechnologies) : [];
        if (prerequisites !== undefined) course.prerequisites = prerequisites ? JSON.parse(prerequisites) : [];
        if (skills !== undefined) course.skills = skills ? JSON.parse(skills) : [];
        
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
        
        // Handle thumbnail update (delete old file if replaced)
        if (files.thumbnail) {
            const previousThumbnail = course.thumbnailUrl;
            course.thumbnailUrl = `${finalBaseUrl}/uploads/${files.thumbnail[0].filename}`;
            if (previousThumbnail && previousThumbnail.includes('/uploads/')) {
                const prevThumbName = previousThumbnail.split('/uploads/')[1];
                const prevThumbPath = path.join(__dirname, '..', 'uploads', prevThumbName);
                fs.unlink(prevThumbPath, (err) => {
                    if (err) console.warn('Could not delete previous thumbnail:', prevThumbPath, err?.message);
                });
            }
        }

        // Handle bannerImage update (delete old file if replaced)
        if (files.bannerImage) {
            const previousBanner = course.bannerImageUrl;
            course.bannerImageUrl = `${finalBaseUrl}/uploads/${files.bannerImage[0].filename}`;
            if (previousBanner && previousBanner.includes('/uploads/')) {
                const prevBannerName = previousBanner.split('/uploads/')[1];
                const prevBannerPath = path.join(__dirname, '..', 'uploads', prevBannerName);
                fs.unlink(prevBannerPath, (err) => {
                    if (err) console.warn('Could not delete previous banner image:', prevBannerPath, err?.message);
                });
            }
        }
        
        // Handle intro video update (delete old file if replaced)
        if (files.introVideo) {
            const previousIntro = course.introVideoUrl;
            course.introVideoUrl = `${finalBaseUrl}/uploads/${files.introVideo[0].filename}`;
            if (previousIntro && previousIntro.includes('/uploads/')) {
                const prevIntroName = previousIntro.split('/uploads/')[1];
                const prevIntroPath = path.join(__dirname, '..', 'uploads', prevIntroName);
                fs.unlink(prevIntroPath, (err) => {
                    if (err) console.warn('Could not delete previous intro video:', prevIntroPath, err?.message);
                });
            }
        }
        
        // Handle sections and lecture videos update
        if (sections) {
            let parsedSections = JSON.parse(sections);
            console.log('=== UPDATE COURSE DEBUG ===');
            console.log('Parsed sections (initial):', JSON.stringify(parsedSections, null, 2));
            console.log('Files received:', files ? Object.keys(files) : 'No files');
            if (files.lectureVideos) {
                console.log('Lecture videos count:', files.lectureVideos.length);
            }
            
            // Clean up section titles - replace empty strings with default
            parsedSections = parsedSections.map((section, index) => ({
                ...section,
                title: section.title && section.title.trim() !== '' ? section.title : `Section ${index + 1}`,
                // Clean up lectures - remove empty lectures and ensure titles are not empty
                lectures: section.lectures
                    .filter(lecture => lecture.title && lecture.title.trim() !== '')
                    .map((lecture, lectureIndex) => ({
                        ...lecture,
                        title: lecture.title && lecture.title.trim() !== '' ? lecture.title : `Lecture ${lectureIndex + 1}`
                    }))
            }));
            
            console.log('Parsed sections (after title cleanup):', JSON.stringify(parsedSections, null, 2));
            
            // Create a deep copy of the original course sections to easily access existing video URLs
            const originalCourseSections = JSON.parse(JSON.stringify(course.sections));
            console.log('Original course sections:', JSON.stringify(originalCourseSections, null, 2));
            
            let videoFileIndex = 0; // Index for the uploaded files array
            
            // Process all sections and lectures in a single pass
            const processedSections = parsedSections.map((section, sIndex) => {
                const processedLectures = section.lectures.map((lecture, lIndex) => {
                    const newLectureData = { ...lecture }; // Start with data from frontend

                    // 1) Prefer a newly uploaded video file for this lecture only if frontend marked it
                    if (lecture.hasNewVideo && files.lectureVideos && files.lectureVideos[videoFileIndex]) {
                        newLectureData.videoUrl = `${finalBaseUrl}/uploads/${files.lectureVideos[videoFileIndex].filename}`;
                        videoFileIndex++; // Consume the uploaded file
                        console.log(`Assigned new video URL for "${lecture.title}":`, newLectureData.videoUrl);
                    } else {
                        // 2) Preserve existing video URL. First try by exact position (section+lecture index),
                        //    then fall back to title-based matching for robustness.
                        const existingSectionByIndex = originalCourseSections[sIndex];
                        const existingLectureByIndex = existingSectionByIndex?.lectures?.[lIndex];
                        if (existingLectureByIndex?.videoUrl) {
                            newLectureData.videoUrl = existingLectureByIndex.videoUrl;
                            console.log(`Preserved existing video URL by index for s${sIndex} l${lIndex}:`, existingLectureByIndex.videoUrl);
                        } else {
                            const existingSectionByTitle = originalCourseSections.find(s => s.title === section.title);
                            const existingLectureByTitle = existingSectionByTitle?.lectures?.find(l => l.title === lecture.title);
                            if (existingLectureByTitle?.videoUrl) {
                                newLectureData.videoUrl = existingLectureByTitle.videoUrl;
                                console.log(`Preserved existing video URL by title for "${lecture.title}":`, existingLectureByTitle.videoUrl);
                            } else {
                                console.log(`No existing video URL found for s${sIndex} l${lIndex} / "${lecture.title}" - leaving empty (allowed for updates)`);
                            }
                        }
                    }

                    return newLectureData;
                });

                return { ...section, lectures: processedLectures };
            });
            
            console.log('Final processed sections:', JSON.stringify(processedSections, null, 2));
            
            // Assign the fully processed sections to the course object
            // Before saving, delete any lecture video files that are no longer referenced
            const remainingVideoUrls = new Set();
            processedSections.forEach(sec => {
                sec.lectures.forEach(lec => {
                    if (lec.videoUrl) remainingVideoUrls.add(lec.videoUrl);
                });
            });

            // Files that existed before
            const previouslyExistingUrls = [];
            originalCourseSections.forEach(sec => {
                sec.lectures.forEach(lec => {
                    if (lec.videoUrl) previouslyExistingUrls.push(lec.videoUrl);
                });
            });

            // Anything that was present before but not anymore should be deleted from disk
            previouslyExistingUrls
                .filter(url => !remainingVideoUrls.has(url))
                .forEach(url => {
                    if (url.includes('/uploads/')) {
                        const filename = url.split('/uploads/')[1];
                        const filePath = path.join(__dirname, '..', 'uploads', filename);
                        fs.unlink(filePath, (err) => {
                            if (err) console.warn('Could not delete removed lecture video:', filePath, err?.message);
                        });
                    }
                });

            course.sections = processedSections;
        }
        
        console.log('Saving course to database...');
        // Recompute totalSizeBytes from current URLs on disk (thumbnail + intro + all lecture videos)
        const getBytesFromUrl = (url) => {
            try {
                if (!url || !url.includes('/uploads/')) return 0;
                const filename = url.split('/uploads/')[1];
                const filePath = path.join(__dirname, '..', 'uploads', filename);
                const stat = fs.statSync(filePath);
                return stat.size || 0;
            } catch (e) {
                return 0;
            }
        };

        let totalSizeBytes = 0;
        totalSizeBytes += getBytesFromUrl(course.thumbnailUrl);
        totalSizeBytes += getBytesFromUrl(course.introVideoUrl);
        course.sections.forEach(section => {
            section.lectures.forEach(lecture => {
                totalSizeBytes += getBytesFromUrl(lecture.videoUrl);
            });
        });
        
        // Validate total course size - maximum 2GB
        const MAX_COURSE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
        if (totalSizeBytes > MAX_COURSE_SIZE_BYTES) {
            // Delete newly uploaded files if course size exceeds limit
            const deleteFile = (fileUrl) => {
                if (fileUrl && fileUrl.includes('/uploads/')) {
                    const filename = fileUrl.split('/uploads/')[1];
                    const filePath = path.join(__dirname, '..', 'uploads', filename);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Failed to delete file: ${filePath}`, err);
                    });
                }
            };
            
            // Only delete newly uploaded files
            if (files.thumbnail && files.thumbnail[0]) {
                deleteFile(course.thumbnailUrl);
            }
            if (files.introVideo && files.introVideo[0]) {
                deleteFile(course.introVideoUrl);
            }
            if (files.lectureVideos) {
                files.lectureVideos.forEach(video => {
                    const videoUrl = `${finalBaseUrl}/uploads/${video.filename}`;
                    deleteFile(videoUrl);
                });
            }
            
            const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
            const maxSizeMB = (MAX_COURSE_SIZE_BYTES / (1024 * 1024)).toFixed(2);
            return res.status(400).json({ 
                message: `Course size (${totalSizeMB} MB) exceeds the maximum allowed size of ${maxSizeMB} MB (2GB). Please reduce the file sizes or remove some content.` 
            });
        }
        
        course.totalSizeBytes = totalSizeBytes;

        const updatedCourse = await course.save();
        console.log('Course saved successfully');
        res.status(200).json(updatedCourse);
    } catch (error) {
        console.error('Error updating course:', error);
        console.error('Error stack:', error.stack);
        
        // Provide more specific error messages
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation Error', 
                errors: validationErrors 
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: 'Invalid course ID format' 
            });
        }
        
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single course for a user who is enrolled in it (Private/User)
const getCourseForEnrolledUser = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.status(403).json({ message: "Access denied. You are not enrolled in this course." });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }
        res.status(200).json(course);
    } catch (error) {
        console.error("Error in getCourseForEnrolledUser:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// @desc    Get all courses a user is enrolled in (Private/User)
const getEnrolledCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const courses = await Course.find({
            '_id': { $in: user.enrolledCourses },
            deleted: { $ne: true }
        });

        res.status(200).json(courses);

    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- THIS IS THE CORRECTED FUNCTION ---
// @desc    Get course content and user progress for the player
// @route   GET /api/courses/user-data/:id
// @access  Private
const getCourseDataForUser = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user._id;

        const [course, user] = await Promise.all([
            Course.findById(courseId).lean(),
            User.findById(userId).select('courseProgress enrolledCourses')
        ]);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        
        const enrolledIds = user.enrolledCourses.map(id => id.toString());
        if (req.user.role !== 'admin' && !enrolledIds.includes(courseId)) {
            console.log(`🚫 Access denied for course ${courseId}. User ${user._id} enrolled:`, enrolledIds.slice(0,3));
            return res.status(403).json({ 
                message: `Access denied. You are not enrolled in this course. Your enrolled courses: ${enrolledIds.slice(0,5).join(', ') || 'none'}`,
                enrolledCourseCount: enrolledIds.length,
                targetCourseId: courseId,
                userId: user._id.toString()
            });
        }

        const courseProgress = user.courseProgress.find(p => p.courseId.toString() === courseId);

        // --- THE FIX ---
        // The variable name is now correct, fixing the ReferenceError.
        res.status(200).json({ course, userProgress: courseProgress });

    } catch (error) {
        console.error("Error fetching course data for user:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


// --- MODULE EXPORTS UPDATED ---
module.exports = {
    getCourses,
    addCourse,
    deleteCourse,
    getCourseById,
    updateCourse,
    getCourseForEnrolledUser,
    getEnrolledCourses,
    getCourseDataForUser,
};