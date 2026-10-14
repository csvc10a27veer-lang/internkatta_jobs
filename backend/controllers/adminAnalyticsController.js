const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const Visit = require('../models/Visit');
const mongoose = require('mongoose');

// Helper to build match filter based on period
const buildPeriodFilter = (period) => {
    const now = new Date();
    const filter = {};
    
    if (period === 'weekly') {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        filter.$gte = lastWeek;
    } else if (period === 'monthly') {
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        filter.$gte = lastMonth;
    } else if (period === 'yearly') {
        const lastYear = new Date(now);
        lastYear.setFullYear(now.getFullYear() - 1);
        filter.$gte = lastYear;
    }
    // all_time returns empty filter (no date restriction)
    
    return filter;
};

// Generate an array of dates for the trend charts to ensure zero-fill for days with no activity
const generateDateRange = (period, dataAgg = []) => {
    const dates = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (period === 'weekly') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
    } else if (period === 'monthly') {
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
    } else if (period === 'yearly') {
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(1);
            d.setMonth(d.getMonth() - i);
            dates.push(d.toISOString().split('T')[0].substring(0, 7)); // YYYY-MM
        }
    } else if (period === 'all_time') {
        // If all_time, just use the dates present in the aggregated data
        const uniqueDates = new Set();
        dataAgg.forEach(item => {
            if (item && item._id) uniqueDates.add(item._id);
        });
        return Array.from(uniqueDates).sort();
    }
    return dates;
};

const formatTrendData = (aggregationResult, period) => {
    const dateRange = generateDateRange(period, aggregationResult);
    const resultDict = {};
    aggregationResult.forEach(item => {
        resultDict[item._id] = item.count;
    });

    return dateRange.map(date => ({
        date,
        count: resultDict[date] || 0
    }));
};

exports.getCourseAnalysis = async (req, res) => {
    try {
        const { period = 'all_time' } = req.query;
        const dateFilter = buildPeriodFilter(period);
        const matchFilter = dateFilter.$gte ? { createdAt: dateFilter } : {};
        const visitMatchFilter = dateFilter.$gte ? { timestamp: dateFilter } : {};
        const paymentMatchFilter = dateFilter.$gte ? { paymentDate: dateFilter } : {};

        // 1. Summary Cards
        const totalCourses = await Course.countDocuments(matchFilter);
        
        // Clicks (Views) from Visits where page starts with /course/
        const totalClicks = await Visit.countDocuments({
            ...visitMatchFilter,
            page: { $regex: '^/course/' }
        });

        // Enrollments from Payments where type = COURSE and status is SUCCESS or COMPLETED, or CART with Course
        const enrollments = await Payment.find({
            ...paymentMatchFilter,
            $or: [
                { type: 'COURSE' },
                { type: 'CART', 'cartItems.itemType': 'Course' }
            ],
            status: { $in: ['COMPLETED', 'SUCCESS'] }
        });
        const totalEnrollments = enrollments.length;
        const uniqueStudentsSet = new Set(enrollments.map(p => p.userId.toString()));
        const uniqueStudents = uniqueStudentsSet.size;

        // 2. Trend Charts
        const dateFormat = period === 'yearly' ? "%Y-%m" : "%Y-%m-%d";
        
        const clicksTrendAgg = await Visit.aggregate([
            { $match: { ...visitMatchFilter, page: { $regex: '^/course/' } } },
            { $group: {
                _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        const clicksTrend = formatTrendData(clicksTrendAgg, period);

        const enrollmentTrendAgg = await Payment.aggregate([
            { $match: { 
                ...paymentMatchFilter, 
                status: { $in: ['COMPLETED', 'SUCCESS'] },
                $or: [{ type: 'COURSE' }, { type: 'CART', 'cartItems.itemType': 'Course' }]
            }},
            { $group: {
                _id: { $dateToString: { format: dateFormat, date: "$paymentDate" } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        const enrollmentTrend = formatTrendData(enrollmentTrendAgg, period);

        // 3. Table Data
        // Aggregate clicks per course
        const clicksPerCourseAgg = await Visit.aggregate([
            { $match: { ...visitMatchFilter, page: { $regex: '^/course/' } } },
            { $group: {
                _id: "$page", // e.g., /course/643f...
                clicks: { $sum: 1 },
                lastActivity: { $max: "$timestamp" }
            }}
        ]);
        
        const clicksMap = {};
        const lastActivityMap = {};
        clicksPerCourseAgg.forEach(c => {
            const courseId = c._id.replace('/course/', '').split('?')[0]; // simple extract
            if (courseId && courseId.length === 24) { // Valid ObjectId length
                clicksMap[courseId] = (clicksMap[courseId] || 0) + c.clicks;
                if (!lastActivityMap[courseId] || c.lastActivity > lastActivityMap[courseId]) {
                    lastActivityMap[courseId] = c.lastActivity;
                }
            }
        });

        // Aggregate enrollments per course
        const enrollmentsPerCourseAgg = await Payment.aggregate([
            { $match: { 
                ...paymentMatchFilter, 
                status: { $in: ['COMPLETED', 'SUCCESS'] },
                $or: [{ type: 'COURSE' }, { type: 'CART', 'cartItems.itemType': 'Course' }]
            }},
            // We need to unwind cartItems just in case it's a CART purchase
            { $unwind: { path: "$cartItems", preserveNullAndEmptyArrays: true } },
            { $project: {
                courseId: { 
                    $cond: { 
                        if: { $eq: ["$type", "CART"] }, 
                        then: "$cartItems.itemId", 
                        else: "$courseId" 
                    } 
                },
                userId: 1,
                itemType: {
                    $cond: {
                        if: { $eq: ["$type", "CART"] },
                        then: "$cartItems.itemType",
                        else: "Course"
                    }
                }
            }},
            { $match: { itemType: "Course" } },
            { $group: {
                _id: "$courseId",
                enrollments: { $sum: 1 },
                uniqueStudents: { $addToSet: "$userId" }
            }}
        ]);

        const enrollmentsMap = {};
        const uniqueStudentsMap = {};
        enrollmentsPerCourseAgg.forEach(e => {
            if (e._id) {
                const courseId = e._id.toString();
                enrollmentsMap[courseId] = e.enrollments;
                uniqueStudentsMap[courseId] = e.uniqueStudents.length;
            }
        });

        // Fetch all active courses
        const allCourses = await Course.find({ deleted: { $ne: true } }).select('_id title').lean();
        
        const tableData = allCourses.map(course => {
            const courseId = course._id.toString();
            const clicks = clicksMap[courseId] || 0;
            const courseEnrollments = enrollmentsMap[courseId] || 0;
            
            let enrollmentRate = "0%";
            if (clicks > 0) {
                enrollmentRate = ((courseEnrollments / clicks) * 100).toFixed(1) + "%";
            } else if (courseEnrollments > 0) {
                enrollmentRate = "100%"; // edge case where clicks weren't tracked but enrolled
            }

            return {
                id: courseId,
                name: course.title,
                clicks,
                uniqueStudents: uniqueStudentsMap[courseId] || 0,
                enrollments: courseEnrollments,
                enrollmentRate,
                lastActivity: lastActivityMap[courseId] || null
            };
        });

        // Sort table data by clicks desc
        tableData.sort((a, b) => b.clicks - a.clicks);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalCourses,
                    totalClicks,
                    totalEnrollments,
                    uniqueStudents
                },
                trends: {
                    clicks: clicksTrend,
                    enrollments: enrollmentTrend
                },
                tableData
            }
        });

    } catch (error) {
        console.error("Error in getCourseAnalysis:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

exports.getInternshipAnalysis = async (req, res) => {
    try {
        const { period = 'all_time' } = req.query;
        const dateFilter = buildPeriodFilter(period);
        const matchFilter = dateFilter.$gte ? { createdAt: dateFilter } : {};
        const visitMatchFilter = dateFilter.$gte ? { timestamp: dateFilter } : {};
        const paymentMatchFilter = dateFilter.$gte ? { paymentDate: dateFilter } : {};

        // 1. Summary Cards
        const totalInternships = await Internship.countDocuments(matchFilter);
        const activeInternships = await Internship.countDocuments({ ...matchFilter, deleted: { $ne: true } });
        
        // Enrollments/Applications
        const enrollments = await Payment.find({
            ...paymentMatchFilter,
            $or: [
                { type: 'INTERNSHIP' },
                { type: 'CART', 'cartItems.itemType': 'Internship' }
            ],
            status: { $in: ['COMPLETED', 'SUCCESS'] }
        });
        const applications = enrollments.length;
        
        const uniqueStudentsSet = new Set(enrollments.map(p => p.userId.toString()));
        const studentsEnrolled = uniqueStudentsSet.size;

        // 2. Trend Charts
        const dateFormat = period === 'yearly' ? "%Y-%m" : "%Y-%m-%d";
        
        const viewsTrendAgg = await Visit.aggregate([
            { $match: { ...visitMatchFilter, page: { $regex: '^/internship/' } } },
            { $group: {
                _id: { $dateToString: { format: dateFormat, date: "$timestamp" } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        const viewsTrend = formatTrendData(viewsTrendAgg, period);

        const applicationTrendAgg = await Payment.aggregate([
            { $match: { 
                ...paymentMatchFilter, 
                status: { $in: ['COMPLETED', 'SUCCESS'] },
                $or: [{ type: 'INTERNSHIP' }, { type: 'CART', 'cartItems.itemType': 'Internship' }]
            }},
            { $group: {
                _id: { $dateToString: { format: dateFormat, date: "$paymentDate" } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        const applicationTrend = formatTrendData(applicationTrendAgg, period);

        // 3. Table Data
        const viewsPerInternshipAgg = await Visit.aggregate([
            { $match: { ...visitMatchFilter, page: { $regex: '^/internship/' } } },
            { $group: {
                _id: "$page",
                views: { $sum: 1 }
            }}
        ]);
        
        const viewsMap = {};
        viewsPerInternshipAgg.forEach(c => {
            const internshipId = c._id.replace('/internship/', '').split('?')[0];
            if (internshipId && internshipId.length === 24) {
                viewsMap[internshipId] = (viewsMap[internshipId] || 0) + c.views;
            }
        });

        const enrollmentsPerInternshipAgg = await Payment.aggregate([
            { $match: { 
                ...paymentMatchFilter, 
                status: { $in: ['COMPLETED', 'SUCCESS'] },
                $or: [{ type: 'INTERNSHIP' }, { type: 'CART', 'cartItems.itemType': 'Internship' }]
            }},
            { $unwind: { path: "$cartItems", preserveNullAndEmptyArrays: true } },
            { $project: {
                internshipId: { 
                    $cond: { 
                        if: { $eq: ["$type", "CART"] }, 
                        then: "$cartItems.itemId", 
                        else: "$internshipId" 
                    } 
                },
                userId: 1,
                itemType: {
                    $cond: {
                        if: { $eq: ["$type", "CART"] },
                        then: "$cartItems.itemType",
                        else: "Internship"
                    }
                }
            }},
            { $match: { itemType: "Internship" } },
            { $group: {
                _id: "$internshipId",
                applications: { $sum: 1 },
                uniqueStudents: { $addToSet: "$userId" }
            }}
        ]);

        const applicationsMap = {};
        const uniqueStudentsMap = {};
        enrollmentsPerInternshipAgg.forEach(e => {
            if (e._id) {
                const internshipId = e._id.toString();
                applicationsMap[internshipId] = e.applications;
                uniqueStudentsMap[internshipId] = e.uniqueStudents.length;
            }
        });

        // We can check how many students are actively engaged by seeing if they have a non-empty internshipProgress for it.
        const allUsers = await User.find({ "internshipProgress.0": { $exists: true } }, 'internshipProgress').lean();
        const activeStudentsMap = {};
        allUsers.forEach(user => {
            if (user.internshipProgress) {
                user.internshipProgress.forEach(prog => {
                    if (prog.internshipId && prog.completedLectures && prog.completedLectures.length > 0) {
                        const idStr = prog.internshipId.toString();
                        activeStudentsMap[idStr] = (activeStudentsMap[idStr] || 0) + 1;
                    }
                });
            }
        });

        const allInternships = await Internship.find({}).select('_id title duration deleted').lean();
        
        const tableData = allInternships.map(internship => {
            const internshipId = internship._id.toString();
            return {
                id: internshipId,
                name: internship.title,
                duration: internship.duration || 'N/A',
                views: viewsMap[internshipId] || 0,
                applications: applicationsMap[internshipId] || 0,
                enrolledStudents: uniqueStudentsMap[internshipId] || 0,
                activeStudents: activeStudentsMap[internshipId] || 0,
                status: internship.deleted ? 'Inactive' : 'Active'
            };
        });

        // Filter out completely dead data if desired, but good to show all usually
        tableData.sort((a, b) => b.views - a.views);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalInternships,
                    studentsEnrolled,
                    applications,
                    activeInternships
                },
                trends: {
                    enrollments: applicationTrend,
                    applications: applicationTrend,
                    views: viewsTrend // adding views trend to frontend
                },
                tableData
            }
        });

    } catch (error) {
        console.error("Error in getInternshipAnalysis:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
