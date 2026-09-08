const express = require('express');
const asyncHandler = require('express-async-handler');
const Visit = require('../models/Visit');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');

const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');

const buildDateFilter = (startDate, endDate) => {
  const filter = {};

  if (startDate || endDate) {
    filter.timestamp = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filter.timestamp.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.timestamp.$lte = end;
    }
  }

  return filter;
};

// GET /api/analytics/public-stats
// Unprotected route for fetching stats to display on public pages like the homepage hero
router.get('/public-stats', asyncHandler(async (req, res) => {
  // Count real users (interns trained)
  const internsTrained = await User.countDocuments({ role: 'user' });
  
  // Count real courses and internships (Internships/Courses)
  const courseCount = await Course.countDocuments({ isPublished: true });
  const internshipCount = await Internship.countDocuments({ isPublished: true });
  const totalCourses = courseCount + internshipCount;

  // Hardcode marketing metrics that aren't stored in DB
  const hiringPartners = 500;
  const verifiedPrograms = 100;

  res.json({
    success: true,
    data: {
      internsTrained,
      totalCourses,
      hiringPartners,
      verifiedPrograms
    }
  });
}));


// GET /api/analytics/visits
// optional query params: startDate, endDate
router.get('/visits', protectAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = buildDateFilter(startDate, endDate);
  const visits = await Visit.find(filter).sort({ timestamp: -1 });
  res.json({ success: true, data: visits });
}));

// GET /api/analytics/stats
router.get('/stats', protectAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = buildDateFilter(startDate, endDate);

  const totalVisits = await Visit.countDocuments(filter);
  const uniqueVisitors = await Visit.distinct('sessionId', filter).then(arr => arr.filter(Boolean).length);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const visitsTodayFilter = {
    ...filter,
    timestamp: {
      ...(filter.timestamp || {}),
      $gte: todayStart,
    }
  };
  const visitsToday = await Visit.countDocuments(visitsTodayFilter);

  const mostVisitedPages = await Visit.aggregate([
    { $match: filter },
    { $group: { _id: '$page', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // additional breakdowns similar to existing stats if desired
  const deviceStats = await Visit.aggregate([
    { $match: filter },
    { $group: { _id: '$browser', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Most clicked internships
  const mostClickedInternships = await Visit.aggregate([
    { $match: filter },
    { $unwind: { path: '$internshipClicks', preserveNullAndEmptyArrays: false } },
    { $group: { 
        _id: '$internshipClicks.internshipId', 
        title: { $first: '$internshipClicks.internshipTitle' },
        count: { $sum: 1 } 
      } 
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Most clicked nav links
  const mostClickedNavLinks = await Visit.aggregate([
    { $match: filter },
    { $unwind: { path: '$navLinkClicks', preserveNullAndEmptyArrays: false } },
    { $group: { 
        _id: '$navLinkClicks.linkName', 
        path: { $first: '$navLinkClicks.linkPath' },
        count: { $sum: 1 } 
      } 
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: { 
      totalVisits, 
      uniqueVisitors, 
      visitsToday, 
      mostVisitedPages, 
      deviceStats,
      mostClickedInternships,
      mostClickedNavLinks
    }
  });
}));

// GET /api/analytics/realtime
router.get('/realtime', protectAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = buildDateFilter(startDate, endDate);
  const fiveAgo = new Date(Date.now() - 5 * 60 * 1000);
  const activeVisitors = await Visit.countDocuments({
    ...filter,
    timestamp: {
      ...(filter.timestamp || {}),
      $gte: fiveAgo,
    }
  });
  res.json({ success: true, data: { activeVisitors } });
}));

module.exports = router;
