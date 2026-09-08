const Payment = require('../models/paymentModel');
const User = require('../models/userModel');
const Contact = require('../models/contactModel');
const Training = require('../models/trainingModel');
const Course = require('../models/courseModel');
const Internship = require('../models/internshipModel');

// Helper to format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();

  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

// Generate an array of dates between start and end
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (currentDate <= end) {
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

exports.getDashboardStats = async (req, res) => {
  try {
    let { startDate, endDate, dateMode, page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let start, end;

    if (dateMode === 'lifetime') {
      start = new Date('2020-01-01');
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else {
      end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      
      start = startDate ? new Date(startDate) : new Date(end);
      if (!startDate) {
        start.setDate(start.getDate() - 30);
      }
      start.setHours(0, 0, 0, 0);
    }

    // Filter for current period
    const dateFilter = {
      paymentDate: {
        $gte: start,
        $lte: end
      }
    };

    // Filter for previous period (for comparison % change)
    const duration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - duration);
    const prevEnd = new Date(end.getTime() - duration);
    const prevDateFilter = {
      paymentDate: {
        $gte: prevStart,
        $lte: prevEnd
      }
    };

    // Filter for today (Today's Purchases)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    // Filter for yesterday (Today's Purchases comparison)
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // --- KPI Calculations ---
    const calculatePaymentsAgg = async (filter) => {
      const agg = await Payment.aggregate([
        { $match: { ...filter, status: { $in: ['COMPLETED', 'SUCCESS'] } } },
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: '$amount' },
            totalPurchases: { $sum: 1 },
            coursePurchases: { 
              $sum: { $cond: [{ $eq: ['$type', 'COURSE'] }, 1, 0] } 
            },
            internshipPurchases: {
              $sum: { $cond: [{ $eq: ['$type', 'INTERNSHIP'] }, 1, 0] }
            }
          }
        }
      ]);
      return agg[0] || { totalRevenue: 0, totalPurchases: 0, coursePurchases: 0, internshipPurchases: 0 };
    };

    const currentPeriodStats = await calculatePaymentsAgg(dateFilter);
    const prevPeriodStats = await calculatePaymentsAgg(prevDateFilter);
    
    const todayStats = await calculatePaymentsAgg({ paymentDate: { $gte: todayStart, $lte: todayEnd } });
    const yesterdayStats = await calculatePaymentsAgg({ paymentDate: { $gte: yesterdayStart, $lte: yesterdayEnd } });

    // Users count
    const totalUsers = await User.countDocuments({ role: 'user', createdAt: { $lte: end } });
    const prevTotalUsers = await User.countDocuments({ role: 'user', createdAt: { $lte: prevEnd } });

    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const kpi = {
      totalRevenue: currentPeriodStats.totalRevenue,
      totalRevenueChange: calculatePercentageChange(currentPeriodStats.totalRevenue, prevPeriodStats.totalRevenue),
      
      totalPurchases: currentPeriodStats.totalPurchases,
      totalPurchasesChange: calculatePercentageChange(currentPeriodStats.totalPurchases, prevPeriodStats.totalPurchases),
      
      todayPurchases: todayStats.totalPurchases,
      todayPurchasesChange: calculatePercentageChange(todayStats.totalPurchases, yesterdayStats.totalPurchases),
      
      coursePurchases: currentPeriodStats.coursePurchases,
      coursePurchasesChange: calculatePercentageChange(currentPeriodStats.coursePurchases, prevPeriodStats.coursePurchases),
      
      internshipPurchases: currentPeriodStats.internshipPurchases,
      internshipPurchasesChange: calculatePercentageChange(currentPeriodStats.internshipPurchases, prevPeriodStats.internshipPurchases),
      
      totalUsers: totalUsers,
      totalUsersChange: calculatePercentageChange(totalUsers, prevTotalUsers),
    };

    // --- Charts Data ---
    
    // Group payments by date
    const dailyPayments = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
          revenue: { $sum: '$amount' },
          purchases: { $sum: 1 },
          coursePurchases: { $sum: { $cond: [{ $eq: ['$type', 'COURSE'] }, 1, 0] } },
          internshipPurchases: { $sum: { $cond: [{ $eq: ['$type', 'INTERNSHIP'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dateMap = {};
    dailyPayments.forEach(day => {
      dateMap[day._id] = day;
    });

    let chartData = [];
    if (dateMode !== 'lifetime' && end.getTime() - start.getTime() <= 365 * 24 * 60 * 60 * 1000) {
      const allDates = getDatesInRange(start, end);
      
      chartData = allDates.map(date => {
        const data = dateMap[date] || { revenue: 0, purchases: 0, coursePurchases: 0, internshipPurchases: 0 };
        // Format date for display (e.g. "May 02")
        const displayDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return {
          date,
          displayDate,
          revenue: data.revenue,
          purchases: data.purchases,
          coursePurchases: data.coursePurchases,
          internshipPurchases: data.internshipPurchases
        };
      });
    } else {
      // For lifetime or large ranges, just return the days that have data
      chartData = dailyPayments.map(data => ({
        date: data._id,
        displayDate: new Date(data._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        revenue: data.revenue,
        purchases: data.purchases,
        coursePurchases: data.coursePurchases,
        internshipPurchases: data.internshipPurchases
      }));
    }

    // Donut Chart Data
    const courseRevenue = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'COURSE' } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, orders: { $sum: 1 } } }
    ]);
    
    const internshipRevenue = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'INTERNSHIP' } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, orders: { $sum: 1 } } }
    ]);

    const courseRevData = courseRevenue[0] || { revenue: 0, orders: 0 };
    const internRevData = internshipRevenue[0] || { revenue: 0, orders: 0 };
    
    const donutData = {
      courses: {
        revenue: courseRevData.revenue,
        orders: courseRevData.orders
      },
      internships: {
        revenue: internRevData.revenue,
        orders: internRevData.orders
      },
      totalRevenue: currentPeriodStats.totalRevenue
    };

    // --- Top Sellers ---
    const topCourses = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'COURSE', courseId: { $ne: null } } },
      { $group: { 
          _id: '$courseId', 
          revenue: { $sum: '$amount' }, 
          sales: { $sum: 1 },
          productName: { $first: '$productName' },
          productImage: { $first: '$productImage' }
      } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          name: { $ifNull: ['$productName', { $ifNull: ['$courseDetails.title', 'Deleted Course'] }] },
          image: { $ifNull: ['$productImage', { $ifNull: ['$courseDetails.thumbnailUrl', ''] }] },
          revenue: 1,
          sales: 1
        }
      }
    ]);

    const topInternships = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'INTERNSHIP', internshipId: { $ne: null } } },
      { $group: { 
          _id: '$internshipId', 
          revenue: { $sum: '$amount' }, 
          sales: { $sum: 1 },
          productName: { $first: '$productName' },
          productImage: { $first: '$productImage' }
      } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'internships',
          localField: '_id',
          foreignField: '_id',
          as: 'internshipDetails'
        }
      },
      { $unwind: { path: '$internshipDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          name: { $ifNull: ['$productName', { $ifNull: ['$internshipDetails.title', 'Deleted Internship'] }] },
          image: { $ifNull: ['$productImage', { $ifNull: ['$internshipDetails.thumbnail.url', ''] }] },
          revenue: 1,
          sales: 1
        }
      }
    ]);

    // --- Recent Purchases ---
    const skip = (page - 1) * limit;

    const recentPurchases = await Payment.find({ ...dateFilter })
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email profilePicture loginMethod')
      .populate('courseId', 'title')
      .populate('internshipId', 'title')
      .lean();

    const totalRecentPurchases = await Payment.countDocuments({ ...dateFilter });

    const formattedRecentPurchases = recentPurchases.map(p => ({
      id: p._id,
      user: p.userId ? {
        name: p.userId.fullName,
        email: p.userId.email,
        avatar: p.userId.profilePicture,
        loginMethod: p.userId.loginMethod
      } : { name: 'Unknown', email: 'unknown' },
      product: p.productName || (p.type === 'COURSE' ? (p.courseId?.title || 'Deleted Course') : (p.internshipId?.title || 'Deleted Internship')),
      type: p.type === 'COURSE' ? 'Course' : 'Internship',
      amount: p.amount,
      purchaseDate: p.paymentDate,
      status: p.status
    }));

    const recentPurchasesPagination = {
      totalPurchases: totalRecentPurchases,
      totalPages: Math.ceil(totalRecentPurchases / limit) || 1,
      currentPage: page
    };

    // --- Action Required ---
    const newInquiries = await Contact.countDocuments({ status: 'NEW' });
    
    // Count users with pending internship submissions
    const usersWithPendingSubmissions = await User.countDocuments({
      'internshipProgress.completedLectures.status': 'Pending'
    });

    const newTrainingRegistrations = await Training.countDocuments({ status: 'pending' });
    
    // Recent purchases in last 24h
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    const recentPurchasesCount = await Payment.countDocuments({ paymentDate: { $gte: last24h } });
    
    const pendingPurchases = await Payment.countDocuments({ status: 'PENDING' });

    const actionRequired = {
      newInquiries,
      newInternshipSubmissions: usersWithPendingSubmissions,
      trainingRegistrations: newTrainingRegistrations,
      recentPurchases: recentPurchasesCount,
      pendingPurchases
    };

    res.json({
      success: true,
      data: {
        kpi,
        charts: {
          daily: chartData,
          donut: donutData
        },
        topSellers: {
          courses: topCourses,
          internships: topInternships
        },
        recentPurchases: formattedRecentPurchases,
        recentPurchasesPagination,
        actionRequired
      }
    });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: `Failed to fetch dashboard statistics: ${error.message} | Stack: ${error.stack}`, error: error.message });
  }
};



exports.getExportPdfData = async (req, res) => {
  try {
    let { startDate, endDate, dateMode } = req.query;

    let start, end;

    if (dateMode === 'lifetime') {
      start = new Date('2020-01-01');
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else {
      end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      
      start = startDate ? new Date(startDate) : new Date(end);
      if (!startDate) {
        start.setDate(start.getDate() - 30);
      }
      start.setHours(0, 0, 0, 0);
    }

    const dateFilter = {
      paymentDate: {
        $gte: start,
        $lte: end
      }
    };

    const duration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - duration);
    const prevEnd = new Date(end.getTime() - duration);
    const prevDateFilter = {
      paymentDate: {
        $gte: prevStart,
        $lte: prevEnd
      }
    };

    // Filter for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // --- KPI Calculations ---
    const calculatePaymentsAgg = async (filter) => {
      const agg = await Payment.aggregate([
        { $match: { ...filter, status: { $in: ['COMPLETED', 'SUCCESS'] } } },
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: '$amount' },
            totalPurchases: { $sum: 1 },
            coursePurchases: { 
              $sum: { $cond: [{ $eq: ['$type', 'COURSE'] }, 1, 0] } 
            },
            internshipPurchases: {
              $sum: { $cond: [{ $eq: ['$type', 'INTERNSHIP'] }, 1, 0] }
            }
          }
        }
      ]);
      return agg[0] || { totalRevenue: 0, totalPurchases: 0, coursePurchases: 0, internshipPurchases: 0 };
    };

    const currentPeriodStats = await calculatePaymentsAgg(dateFilter);
    const prevPeriodStats = await calculatePaymentsAgg(prevDateFilter);
    const todayStats = await calculatePaymentsAgg({ paymentDate: { $gte: todayStart, $lte: todayEnd } });
    const yesterdayStats = await calculatePaymentsAgg({ paymentDate: { $gte: yesterdayStart, $lte: yesterdayEnd } });

    // Users count
    const totalUsers = await User.countDocuments({ role: 'user', createdAt: { $lte: end } });
    const prevTotalUsers = await User.countDocuments({ role: 'user', createdAt: { $lte: prevEnd } });

    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const kpi = {
      totalRevenue: currentPeriodStats.totalRevenue,
      totalRevenueChange: calculatePercentageChange(currentPeriodStats.totalRevenue, prevPeriodStats.totalRevenue),
      totalPurchases: currentPeriodStats.totalPurchases,
      totalPurchasesChange: calculatePercentageChange(currentPeriodStats.totalPurchases, prevPeriodStats.totalPurchases),
      coursePurchases: currentPeriodStats.coursePurchases,
      coursePurchasesChange: calculatePercentageChange(currentPeriodStats.coursePurchases, prevPeriodStats.coursePurchases),
      internshipPurchases: currentPeriodStats.internshipPurchases,
      internshipPurchasesChange: calculatePercentageChange(currentPeriodStats.internshipPurchases, prevPeriodStats.internshipPurchases),
      totalUsers: totalUsers,
      totalUsersChange: calculatePercentageChange(totalUsers, prevTotalUsers),
    };

    // --- Secondary KPI Row ---
    const averageOrderValue = currentPeriodStats.totalPurchases > 0 
      ? (currentPeriodStats.totalRevenue / currentPeriodStats.totalPurchases) 
      : 0;

    const courseRevenueAgg = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'COURSE' } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, orders: { $sum: 1 } } }
    ]);
    const internshipRevenueAgg = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'INTERNSHIP' } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, orders: { $sum: 1 } } }
    ]);
    const courseRevData = courseRevenueAgg[0] || { revenue: 0, orders: 0 };
    const internRevData = internshipRevenueAgg[0] || { revenue: 0, orders: 0 };

    const paymentStatusesAgg = await Payment.aggregate([
      { $match: { ...dateFilter } },
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);
    
    let successfulPayments = 0;
    let failedPayments = 0;
    let pendingPayments = 0;
    let refundedAmount = 0;
    let allPaymentsCount = 0;

    paymentStatusesAgg.forEach(statusData => {
      allPaymentsCount += statusData.count;
      if (statusData._id === 'COMPLETED' || statusData._id === 'SUCCESS') {
        successfulPayments += statusData.count;
      } else if (statusData._id === 'FAILED') {
        failedPayments += statusData.count;
      } else if (statusData._id === 'PENDING') {
        pendingPayments += statusData.count;
      } else if (statusData._id === 'REFUNDED') {
        refundedAmount += statusData.amount;
      }
    });

    const secondaryKpi = {
      todayPurchases: todayStats.totalPurchases,
      todayPurchasesChange: calculatePercentageChange(todayStats.totalPurchases, yesterdayStats.totalPurchases),
      averageOrderValue,
      courseRevenue: courseRevData.revenue,
      internshipRevenue: internRevData.revenue,
      successfulPayments,
      successfulPaymentsPercentage: allPaymentsCount > 0 ? (successfulPayments / allPaymentsCount) * 100 : 0,
      failedPayments,
      failedPaymentsPercentage: allPaymentsCount > 0 ? (failedPayments / allPaymentsCount) * 100 : 0,
      pendingPayments,
      refundedAmount
    };

    // --- Summary Table (Daily, Weekly, or Monthly) ---
    const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    let summaryType = 'Daily';
    
    if (dateMode === 'lifetime') {
      summaryType = 'Monthly';
    } else if (durationDays > 7) {
      summaryType = 'Weekly';
    } else {
      summaryType = 'Daily';
    }

    let groupByFormat;
    if (summaryType === 'Monthly') {
      groupByFormat = { $dateToString: { format: "%Y-%m", date: "$paymentDate" } };
    } else if (summaryType === 'Weekly') {
      groupByFormat = { $dateToString: { format: "%Y-%U", date: "$paymentDate" } };
    } else {
      groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } };
    }

    const summaryAgg = await Payment.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: groupByFormat,
          totalPurchases: { $sum: 1 },
          successful: { $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'SUCCESS']] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          courseRevenue: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$type', 'COURSE'] }, { $in: ['$status', ['COMPLETED', 'SUCCESS']] }] }, 
                '$amount', 
                0
              ] 
            } 
          },
          internshipRevenue: { 
            $sum: { 
              $cond: [
                { $and: [{ $eq: ['$type', 'INTERNSHIP'] }, { $in: ['$status', ['COMPLETED', 'SUCCESS']] }] }, 
                '$amount', 
                0
              ] 
            } 
          },
          netRevenue: { 
            $sum: { 
              $cond: [
                { $in: ['$status', ['COMPLETED', 'SUCCESS']] }, 
                '$amount', 
                0
              ] 
            } 
          },
          minDate: { $min: "$paymentDate" }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    const summaryTable = summaryAgg.map(item => {
      let displayDate = item._id;
      if (summaryType === 'Monthly') {
        displayDate = new Date(item.minDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (summaryType === 'Weekly') {
        const startOfWeek = new Date(item.minDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        displayDate = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        displayDate = new Date(item.minDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      return {
        date: item._id,
        displayDate,
        totalPurchases: item.totalPurchases,
        successful: item.successful,
        failed: item.failed,
        courseRevenue: item.courseRevenue,
        internshipRevenue: item.internshipRevenue,
        netRevenue: item.netRevenue
      };
    });

    // --- Charts Data ---
    const dailyPaymentsList = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
          revenue: { $sum: '$amount' },
          purchases: { $sum: 1 },
          coursePurchases: { $sum: { $cond: [{ $eq: ['$type', 'COURSE'] }, 1, 0] } },
          internshipPurchases: { $sum: { $cond: [{ $eq: ['$type', 'INTERNSHIP'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dateMapChart = {};
    dailyPaymentsList.forEach(day => {
      dateMapChart[day._id] = day;
    });

    let chartData = [];
    
    // Generate dates helper for charts
    const getDates = (s, e) => {
      const dates = [];
      const current = new Date(s);
      current.setHours(0, 0, 0, 0);
      const en = new Date(e);
      en.setHours(0, 0, 0, 0);
      while (current <= en) {
        const d = new Date(current);
        const month = '' + (d.getMonth() + 1);
        const day = '' + d.getDate();
        const year = d.getFullYear();
        dates.push([year, month.padStart(2, '0'), day.padStart(2, '0')].join('-'));
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    if (dateMode !== 'lifetime' && end.getTime() - start.getTime() <= 365 * 24 * 60 * 60 * 1000) {
      const allDates = getDates(start, end);
      chartData = allDates.map(date => {
        const data = dateMapChart[date] || { revenue: 0, purchases: 0, coursePurchases: 0, internshipPurchases: 0 };
        return {
          date,
          displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: data.revenue,
          purchases: data.purchases,
          coursePurchases: data.coursePurchases,
          internshipPurchases: data.internshipPurchases
        };
      });
    } else {
      chartData = dailyPaymentsList.map(data => ({
        date: data._id,
        displayDate: new Date(data._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        revenue: data.revenue,
        purchases: data.purchases,
        coursePurchases: data.coursePurchases,
        internshipPurchases: data.internshipPurchases
      }));
    }

    const donutData = {
      courses: {
        revenue: courseRevData.revenue,
        orders: courseRevData.orders
      },
      internships: {
        revenue: internRevData.revenue,
        orders: internRevData.orders
      },
      totalRevenue: currentPeriodStats.totalRevenue
    };

    // --- Action Required ---
    const newInquiries = await Contact.countDocuments({ status: 'NEW' });
    const usersWithPendingSubmissions = await User.countDocuments({
      'internshipProgress.completedLectures.status': 'Pending'
    });
    const newTrainingRegistrations = await Training.countDocuments({ status: 'pending' });
    
    // Recent purchases: count total purchases in last 24h
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    const recentPurchasesCount = await Payment.countDocuments({ paymentDate: { $gte: last24h } });
    
    const overallPending = await Payment.countDocuments({ status: 'PENDING' });

    const actionRequired = {
      newInquiries,
      newInternshipSubmissions: usersWithPendingSubmissions,
      trainingRegistrations: newTrainingRegistrations,
      recentPurchases: recentPurchasesCount,
      pendingPayments: overallPending
    };

    // --- Page 2 Data ---
    const topCourses = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'COURSE', courseId: { $ne: null } } },
      { $group: { 
          _id: '$courseId', 
          revenue: { $sum: '$amount' }, 
          sales: { $sum: 1 },
          productName: { $first: '$productName' }
      } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          name: { $ifNull: ['$productName', { $ifNull: ['$courseDetails.title', 'Deleted Course'] }] },
          revenue: 1,
          sales: 1,
          avgOrderValue: { $cond: [{ $eq: ['$sales', 0] }, 0, { $divide: ['$revenue', '$sales'] }] }
        }
      }
    ]);

    const topInternships = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'INTERNSHIP', internshipId: { $ne: null } } },
      { $group: { 
          _id: '$internshipId', 
          revenue: { $sum: '$amount' }, 
          sales: { $sum: 1 },
          productName: { $first: '$productName' }
      } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'internships',
          localField: '_id',
          foreignField: '_id',
          as: 'internshipDetails'
        }
      },
      { $unwind: { path: '$internshipDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          name: { $ifNull: ['$productName', { $ifNull: ['$internshipDetails.title', 'Deleted Internship'] }] },
          revenue: 1,
          sales: 1,
          avgOrderValue: { $cond: [{ $eq: ['$sales', 0] }, 0, { $divide: ['$revenue', '$sales'] }] }
        }
      }
    ]);

    const recentPurchasesData = await Payment.find({ ...dateFilter })
      .sort({ paymentDate: -1 })
      .limit(10)
      .populate('userId', 'fullName email')
      .populate('courseId', 'title')
      .populate('internshipId', 'title')
      .lean();

    const recentPurchases = recentPurchasesData.map(p => ({
      id: p._id,
      user: p.userId ? { fullName: p.userId.fullName, email: p.userId.email } : { fullName: p.customerName || 'Guest' },
      product: p.productName || (p.type === 'COURSE' && p.courseId ? p.courseId.title : (p.internshipId ? p.internshipId.title : 'Unknown Product')),
      type: p.type,
      amount: p.amount,
      date: p.paymentDate,
      status: p.status
    }));

    const revenueSummaryAgg = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] } } },
      {
        $group: {
          _id: null,
          grossRevenue: { 
            $sum: { $cond: [{ $gt: ['$originalAmount', '$amount'] }, '$originalAmount', '$amount'] } 
          },
          netRevenue: { $sum: '$amount' }
        }
      }
    ]);
    
    const grossRev = revenueSummaryAgg[0] ? revenueSummaryAgg[0].grossRevenue : 0;
    const netRev = revenueSummaryAgg[0] ? revenueSummaryAgg[0].netRevenue : 0;
    const discounts = grossRev - netRev;
    const refunds = refundedAmount; // from secondaryKpi
    const finalNetRevenue = netRev - refunds;

    const page2Data = {
      topCourses,
      topInternships,
      recentPurchases,
      paymentStatusSummary: {
        successful: successfulPayments,
        failed: failedPayments,
        pending: pendingPayments,
        total: allPaymentsCount
      },
      revenueSummary: {
        grossRevenue: grossRev,
        discounts: discounts,
        refunds: refunds,
        netRevenue: finalNetRevenue
      }
    };

    res.json({
      success: true,
      data: {
        kpi,
        secondaryKpi,
        summaryTable,
        summaryType,
        charts: {
          daily: chartData,
          donut: donutData
        },
        actionRequired,
        reportPeriod: {
          start: start.toISOString(),
          end: end.toISOString(),
          mode: dateMode
        },
        page2Data
      }
    });

  } catch (error) {
    console.error('Export Stats Error:', error);
    res.status(500).json({ success: false, message: `Failed to fetch export statistics: ${error.message} | Stack: ${error.stack}`, error: error.message });
  }
};


const ExcelJS = require('exceljs');

exports.getExportExcelData = async (req, res) => {
  try {
    const { dateMode, startDate, endDate } = req.query;

    let start, end;
    if (dateMode === 'lifetime') {
      start = new Date('2000-01-01');
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else {
      end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      start = startDate ? new Date(startDate) : new Date(end);
      if (!startDate) {
        start.setDate(start.getDate() - 30);
      }
      start.setHours(0, 0, 0, 0);
    }

    const dateFilter = {
      paymentDate: { $gte: start, $lte: end }
    };

    // ---- 1. Fetch Transactions ----
    const transactions = await Payment.find(dateFilter)
      .populate('userId', 'fullName email createdAt')
      .populate('courseId', 'title category type')
      .populate({ path: 'internshipId', populate: { path: 'category' } })
      .sort({ paymentDate: -1 })
      .lean();

    const getPopulatedId = (field) => {
      if (!field) return '';
      if (field._id) return field._id.toString();
      return field.toString();
    };

    // ---- 2. Calculate Daily Analytics ----
    const dailyMap = {};
    transactions.forEach(t => {
      const dateStr = new Date(t.paymentDate).toISOString().split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          total_transactions: 0, successful_transactions: 0, failed_transactions: 0, pending_transactions: 0,
          course_sales: 0, internship_sales: 0,
          course_revenue: 0, internship_revenue: 0,
          gross_revenue: 0, discount_amount: 0, refund_amount: 0, net_revenue: 0
        };
      }
      const day = dailyMap[dateStr];
      day.total_transactions++;
      
      const isSuccess = t.status === 'COMPLETED' || t.status === 'SUCCESS';
      const isFailed = t.status === 'FAILED';
      const isPending = t.status === 'PENDING';
      const isRefunded = t.refundStatus === 'COMPLETED' || t.refundStatus === 'REFUNDED';

      if (isSuccess) day.successful_transactions++;
      else if (isFailed) day.failed_transactions++;
      else if (isPending) day.pending_transactions++;

      const gross = t.originalAmount || t.amount || 0;
      const net = t.amount || 0;
      const discount = Math.max(0, gross - net);
      const refund = t.refundAmount || 0;

      if (isSuccess) {
        day.gross_revenue += gross;
        day.discount_amount += discount;
        day.net_revenue += net;
        
        if (t.type === 'COURSE') {
          day.course_sales++;
          day.course_revenue += net;
        } else if (t.type === 'INTERNSHIP') {
          day.internship_sales++;
          day.internship_revenue += net;
        }
      }
      if (isRefunded) {
        day.refund_amount += refund;
      }
    });

    const dailyData = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    dailyData.forEach(d => {
      d.avg_order_value = d.successful_transactions > 0 ? (d.net_revenue / d.successful_transactions) : 0;
    });

    // ---- 3. Calculate Product Performance ----
    const productMap = {};
    transactions.forEach(t => {
      let pId = '', pName = '', pType = '', pCat = '';
      if (t.type === 'COURSE') {
        pId = getPopulatedId(t.courseId);
        pName = t.courseId?.title || t.productName || '';
        pType = 'COURSE';
        pCat = t.courseId?.category || '';
      } else if (t.type === 'INTERNSHIP') {
        pId = getPopulatedId(t.internshipId);
        pName = t.internshipId?.title || t.productName || '';
        pType = 'INTERNSHIP';
        pCat = t.internshipId?.category?.name || '';
      }
      if (!pId) return;

      if (!productMap[pId]) {
        productMap[pId] = {
          product_id: pId, product_name: pName, product_type: pType, category: pCat,
          total_sales: 0, successful_sales: 0, failed_sales: 0,
          gross_revenue: 0, refund_amount: 0, net_revenue: 0
        };
      }
      const prod = productMap[pId];
      prod.total_sales++;
      
      const isSuccess = t.status === 'COMPLETED' || t.status === 'SUCCESS';
      const isFailed = t.status === 'FAILED';
      const isRefunded = t.refundStatus === 'COMPLETED' || t.refundStatus === 'REFUNDED';

      if (isSuccess) {
        prod.successful_sales++;
        const gross = t.originalAmount || t.amount || 0;
        const net = t.amount || 0;
        prod.gross_revenue += gross;
        prod.net_revenue += net;
      } else if (isFailed) {
        prod.failed_sales++;
      }
      if (isRefunded) {
        prod.refund_amount += (t.refundAmount || 0);
      }
    });

    const productData = Object.values(productMap).sort((a, b) => b.net_revenue - a.net_revenue);
    productData.forEach(p => {
      p.avg_order_value = p.successful_sales > 0 ? (p.net_revenue / p.successful_sales) : 0;
    });

    // ---- 4. Create Workbook & Sheets ----
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'InternKatta';
    workbook.created = new Date();

    const ws1 = workbook.addWorksheet('Admin Analytics');
    const ws2 = workbook.addWorksheet('Transaction Data');
    const ws3 = workbook.addWorksheet('Daily Analytics');
    const ws4 = workbook.addWorksheet('Product Performance');
    const ws5 = workbook.addWorksheet('Data Dictionary');

    // ---- COLORS ----
    const C = {
      navy: 'FF172554', blue: 'FF2563EB', lightBlue: 'FFEFF6FF',
      green: 'FF16A34A', lightGreen: 'FFF0FDF4',
      orange: 'FFF59E0B', lightOrange: 'FFFFFBEB',
      purple: 'FF7C3AED', lightPurple: 'FFF5F3FF',
      red: 'FFE11D48', lightRed: 'FFFFF1F2',
      cyan: 'FF0891B2', lightCyan: 'FFECFEFF',
      border: 'FFE2E8F0', muted: 'FF64748B', white: 'FFFFFFFF',
      textMain: 'FF1E293B', textMuted: 'FF475569'
    };

    const borders = {
      top: { style: 'thin', color: { argb: C.border } },
      left: { style: 'thin', color: { argb: C.border } },
      bottom: { style: 'thin', color: { argb: C.border } },
      right: { style: 'thin', color: { argb: C.border } }
    };

    const currencyFmt = '₹#,##0.00';
    const dateFmt = 'dd mmm yyyy';
    const timeFmt = 'hh:mm:ss';

    // ============================================================
    // SHEET 1: Admin Analytics
    // ============================================================
    ws1.properties.defaultColWidth = 12;
    // Base layout: Title
    ws1.mergeCells('A1:O1');
    const title = ws1.getCell('A1');
    title.value = 'InternKatta | ADMIN DASHBOARD EXCEL EXPORT';
    title.font = { size: 18, bold: true, color: { argb: C.navy } };
    title.alignment = { vertical: 'middle', horizontal: 'left' };
    ws1.getRow(1).height = 30;

    ws1.mergeCells('A2:O2');
    const subtitle = ws1.getCell('A2');
    subtitle.value = 'The Excel export contains transaction-level data to help in detailed analysis, reporting, and business intelligence.';
    subtitle.font = { size: 11, color: { argb: C.muted } };
    subtitle.alignment = { vertical: 'middle', horizontal: 'left' };

    // SPACE
    ws1.getRow(3).height = 10;

    // SECTION 1: TRANSACTIONS DATA
    ws1.mergeCells('A4:D4');
    const s1Title = ws1.getCell('A4');
    s1Title.value = '1. TRANSACTIONS DATA';
    s1Title.font = { size: 14, bold: true, color: { argb: C.blue } };
    
    ws1.mergeCells('E4:G4');
    const s1Badge = ws1.getCell('E4');
    s1Badge.value = 'transactions.xlsx';
    s1Badge.font = { size: 10, bold: true, color: { argb: C.green } };
    s1Badge.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lightGreen } };
    s1Badge.alignment = { horizontal: 'center', vertical: 'middle' };
    
    ws1.mergeCells('A5:O5');
    const s1Desc = ws1.getCell('A5');
    s1Desc.value = 'This file contains one row per transaction (purchase/payment) with all key details.';
    s1Desc.font = { size: 10, color: { argb: C.muted } };

    // Transaction Preview Header
    const tpRow = 7;
    ws1.getRow(tpRow).height = 25;
    const tGroups = [
      { name: 'A. Transaction Info', cols: 7, bg: C.lightPurple },
      { name: 'B. User Info', cols: 3, bg: C.lightBlue },
      { name: 'C. Product Info', cols: 5, bg: C.lightOrange },
      { name: 'D. Financial Info', cols: 8, bg: C.lightGreen },
      { name: 'E. Payment Info', cols: 7, bg: C.lightRed },
      { name: 'F. Additional Info', cols: 2, bg: C.lightPurple } // Simplified for preview
    ];

    let cCol = 1;
    tGroups.forEach(g => {
      if (cCol > 15) return; // Only show up to column O in preview
      const endCol = Math.min(cCol + g.cols - 1, 15);
      if (cCol <= endCol) {
        ws1.mergeCells(tpRow, cCol, tpRow, endCol);
        const gc = ws1.getCell(tpRow, cCol);
        gc.value = g.name;
        gc.font = { size: 10, bold: true, color: { argb: C.navy } };
        gc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: g.bg } };
        gc.alignment = { horizontal: 'center', vertical: 'middle' };
        gc.border = borders;
      }
      cCol += g.cols;
    });

    const previewHeaders = [
      'transaction_id', 'order_id', 'payment_id', 'purchase_date', 'purchase_time', 'user_id', 'user_name',
      'user_email', 'product_id', 'product_name', 'product_type', 'amount', 'discount_amount', 'tax_amount', 'net_amount'
    ];
    
    ws1.getRow(tpRow + 1).height = 20;
    previewHeaders.forEach((h, i) => {
      const c = ws1.getCell(tpRow + 1, i + 1);
      c.value = h;
      c.font = { size: 9, bold: true, color: { argb: C.white } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.navy } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = borders;
    });

    ws1.mergeCells(`A${tpRow+2}:O${tpRow+2}`);
    ws1.getCell(`A${tpRow+2}`).value = 'Sample Data (First 5 Rows)';
    ws1.getCell(`A${tpRow+2}`).font = { size: 10, bold: true, color: { argb: C.textMain } };

    let sRow = tpRow + 3;
    const sampleTxns = transactions.slice(0, 5);
    sampleTxns.forEach(t => {
      const r = ws1.getRow(sRow);
      r.height = 18;
      r.getCell(1).value = t.transactionId || '';
      r.getCell(2).value = t.orderId || '';
      r.getCell(3).value = t.phonepeTransactionId || '';
      r.getCell(4).value = new Date(t.paymentDate);
      r.getCell(4).numFmt = dateFmt;
      r.getCell(5).value = new Date(t.paymentDate);
      r.getCell(5).numFmt = timeFmt;
      r.getCell(6).value = getPopulatedId(t.userId);
      r.getCell(7).value = t.customerName || t.userId?.fullName || '';
      r.getCell(8).value = t.customerEmail || t.userId?.email || '';
      
      let pId = '', pName = '', pType = '';
      if (t.type === 'COURSE') {
        pId = getPopulatedId(t.courseId);
        pName = t.courseId?.title || t.productName || '';
        pType = 'COURSE';
      } else {
        pId = getPopulatedId(t.internshipId);
        pName = t.internshipId?.title || t.productName || '';
        pType = 'INTERNSHIP';
      }
      
      r.getCell(9).value = pId;
      r.getCell(10).value = pName;
      r.getCell(11).value = pType;
      
      const gross = t.originalAmount || t.amount || 0;
      const net = t.amount || 0;
      r.getCell(12).value = gross;
      r.getCell(12).numFmt = currencyFmt;
      r.getCell(13).value = Math.max(0, gross - net);
      r.getCell(13).numFmt = currencyFmt;
      r.getCell(14).value = 0; // tax
      r.getCell(14).numFmt = currencyFmt;
      r.getCell(15).value = net;
      r.getCell(15).numFmt = currencyFmt;
      
      for(let i=1; i<=15; i++) {
        r.getCell(i).border = borders;
        r.getCell(i).alignment = { vertical: 'middle', horizontal: i>11 ? 'right' : 'center' };
      }
      sRow++;
    });

    // Total Columns Badge
    ws1.mergeCells(`A${sRow+1}:B${sRow+1}`);
    const tcBadge = ws1.getCell(`A${sRow+1}`);
    tcBadge.value = 'Total Columns: 32';
    tcBadge.font = { size: 10, bold: true, color: { argb: C.purple } };
    tcBadge.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lightPurple } };
    tcBadge.alignment = { horizontal: 'center', vertical: 'middle' };
    tcBadge.border = borders;
    
    ws1.mergeCells(`C${sRow+1}:H${sRow+1}`);
    ws1.getCell(`C${sRow+1}`).value = 'This file is ideal for detailed analysis in Excel, Power BI, Tableau, Python, SQL, etc.';
    ws1.getCell(`C${sRow+1}`).font = { size: 9, color: { argb: C.muted } };
    ws1.getCell(`C${sRow+1}`).alignment = { vertical: 'middle' };

    // Key Use Cases
    ws1.mergeCells(`I${sRow+1}:O${sRow+7}`);
    const ucCell = ws1.getCell(`I${sRow+1}`);
    ucCell.value = "Key Use Cases:\n• Revenue analysis\n• Product performance\n• Channel & device analysis\n• Payment success rate\n• User purchase behavior\n• Refund & failure analysis";
    ucCell.font = { size: 9, color: { argb: C.navy } };
    ucCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lightBlue } };
    ucCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    ucCell.border = borders;

    let r2Start = sRow + 9;

    // SECTION 2 & 3: DAILY & PRODUCT
    // DAILY (A-H)
    ws1.mergeCells(`A${r2Start}:C${r2Start}`);
    ws1.getCell(`A${r2Start}`).value = '2. DAILY ANALYTICS';
    ws1.getCell(`A${r2Start}`).font = { size: 12, bold: true, color: { argb: C.blue } };
    
    ws1.mergeCells(`D${r2Start}:F${r2Start}`);
    const dBadge = ws1.getCell(`D${r2Start}`);
    dBadge.value = 'daily_analytics.xlsx';
    dBadge.font = { size: 9, bold: true, color: { argb: C.green } };
    dBadge.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lightGreen } };
    dBadge.alignment = { horizontal: 'center', vertical: 'middle' };

    ws1.mergeCells(`A${r2Start+1}:H${r2Start+1}`);
    ws1.getCell(`A${r2Start+1}`).value = 'Aggregated daily metrics for trend analysis and reporting.';
    ws1.getCell(`A${r2Start+1}`).font = { size: 9, color: { argb: C.muted } };

    // PRODUCT (J-O)
    ws1.mergeCells(`J${r2Start}:M${r2Start}`);
    ws1.getCell(`J${r2Start}`).value = '3. PRODUCT PERFORMANCE';
    ws1.getCell(`J${r2Start}`).font = { size: 12, bold: true, color: { argb: C.purple } };
    
    ws1.mergeCells(`N${r2Start}:O${r2Start}`);
    const pBadge = ws1.getCell(`N${r2Start}`);
    pBadge.value = 'product_performance.xlsx';
    pBadge.font = { size: 9, bold: true, color: { argb: C.green } };
    pBadge.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lightGreen } };
    pBadge.alignment = { horizontal: 'center', vertical: 'middle' };

    ws1.mergeCells(`J${r2Start+1}:O${r2Start+1}`);
    ws1.getCell(`J${r2Start+1}`).value = 'Product-wise performance summary.';
    ws1.getCell(`J${r2Start+1}`).font = { size: 9, color: { argb: C.muted } };

    // Sections 4, 5, 6 below that
    let r3Start = r2Start + 10; // spacing out
    
    // Notes
    ws1.mergeCells(`A${r3Start}:E${r3Start+6}`);
    const notesCell = ws1.getCell(`A${r3Start}`);
    notesCell.value = "ⓘ Important Notes\n\n• All amounts are in INR.\n• Revenue is calculated only from COMPLETED payments.\n• Failed, Pending, and Refunded transactions are included for complete analysis.\n• Date & Time are in Asia/Kolkata (IST) timezone.";
    notesCell.font = { size: 9, color: { argb: C.textMain } };
    notesCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lightPurple } };
    notesCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    notesCell.border = borders;

    // How to Use
    ws1.mergeCells(`F${r3Start}:J${r3Start+6}`);
    const howCell = ws1.getCell(`F${r3Start}`);
    howCell.value = "How to Use This Excel?\n\n✓ Import into Excel / Google Sheets for pivot tables and charts.\n✓ Use in Power BI / Tableau for interactive dashboards.\n✓ Analyze trends, cohorts, and user behavior using these datasets.";
    howCell.font = { size: 9, color: { argb: C.textMain } };
    howCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lightBlue } };
    howCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    howCell.border = borders;

    // Available Sheets
    ws1.mergeCells(`K${r3Start}:O${r3Start+6}`);
    const availCell = ws1.getCell(`K${r3Start}`);
    availCell.value = "Excel Sheets Available\n\n• Admin Analytics\n• Transaction Data\n• Daily Analytics\n• Product Performance\n• Data Dictionary";
    availCell.font = { size: 9, color: { argb: C.textMain } };
    availCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.lightGreen } };
    availCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    availCell.border = borders;


    // ============================================================
    // SHEET 2: Transaction Data
    // ============================================================
    const txHeaders = [
      // A. Transaction Info
      { header: 'transaction_id', key: 'transaction_id', width: 20 },
      { header: 'order_id', key: 'order_id', width: 18 },
      { header: 'payment_id', key: 'payment_id', width: 22 },
      { header: 'purchase_date', key: 'purchase_date', width: 15 },
      { header: 'purchase_time', key: 'purchase_time', width: 15 },
      { header: 'created_at', key: 'created_at', width: 20 },
      { header: 'updated_at', key: 'updated_at', width: 20 },
      // B. User Info
      { header: 'user_id', key: 'user_id', width: 20 },
      { header: 'user_name', key: 'user_name', width: 22 },
      { header: 'user_email', key: 'user_email', width: 30 },
      // C. Product Info
      { header: 'product_id', key: 'product_id', width: 20 },
      { header: 'product_name', key: 'product_name', width: 35 },
      { header: 'product_type', key: 'product_type', width: 15 },
      { header: 'category', key: 'category', width: 20 },
      // D. Financial Info
      { header: 'amount', key: 'amount', width: 15 },
      { header: 'discount_amount', key: 'discount_amount', width: 18 },
      { header: 'tax_amount', key: 'tax_amount', width: 15 },
      { header: 'net_amount', key: 'net_amount', width: 15 },
      { header: 'refund_amount', key: 'refund_amount', width: 15 },
      { header: 'currency', key: 'currency', width: 10 },
      { header: 'coupon_code', key: 'coupon_code', width: 15 },
      // E. Payment Info
      { header: 'payment_status', key: 'payment_status', width: 18 },
      { header: 'payment_method', key: 'payment_method', width: 18 },
      { header: 'payment_gateway', key: 'payment_gateway', width: 18 },
      { header: 'payment_date_completed', key: 'payment_date_completed', width: 22 },
      { header: 'payment_time_completed', key: 'payment_time_completed', width: 22 },
      { header: 'failure_reason', key: 'failure_reason', width: 35 },
      { header: 'refund_date', key: 'refund_date', width: 15 },
      // F. Additional Info
      { header: 'purchase_source', key: 'purchase_source', width: 18 },
      { header: 'device_type', key: 'device_type', width: 15 },
      { header: 'is_refunded', key: 'is_refunded', width: 12 },
      { header: 'remarks', key: 'remarks', width: 35 }
    ];
    ws2.columns = txHeaders;
    ws2.autoFilter = 'A1:AF1';
    ws2.views = [{ state: 'frozen', ySplit: 1 }];

    const headerRow = ws2.getRow(1);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.navy } };
      cell.font = { bold: true, color: { argb: C.white } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = borders;
    });

    transactions.forEach((t, index) => {
      let pId = '', pName = '', pType = '', pCat = '';
      if (t.type === 'COURSE') {
        pId = getPopulatedId(t.courseId);
        pName = t.courseId?.title || t.productName || '';
        pType = 'COURSE';
        pCat = t.courseId?.category || '';
      } else {
        pId = getPopulatedId(t.internshipId);
        pName = t.internshipId?.title || t.productName || '';
        pType = 'INTERNSHIP';
        pCat = t.internshipId?.category?.name || '';
      }
      
      const gross = t.originalAmount || t.amount || 0;
      const net = t.amount || 0;
      const pDate = new Date(t.paymentDate);

      const row = ws2.addRow({
        transaction_id: t.transactionId || '',
        order_id: t.orderId || '',
        payment_id: t.phonepeTransactionId || '',
        purchase_date: pDate,
        purchase_time: pDate,
        created_at: new Date(t.createdAt || t.paymentDate),
        updated_at: new Date(t.updatedAt || t.paymentDate),
        user_id: getPopulatedId(t.userId),
        user_name: t.customerName || t.userId?.fullName || '',
        user_email: t.customerEmail || t.userId?.email || '',
        product_id: pId,
        product_name: pName,
        product_type: pType,
        category: pCat,
        amount: gross,
        discount_amount: Math.max(0, gross - net),
        tax_amount: 0,
        net_amount: net,
        refund_amount: t.refundAmount || 0,
        currency: 'INR',
        coupon_code: t.couponCode || '',
        payment_status: t.status || 'PENDING',
        payment_method: t.paymentMethod || '',
        payment_gateway: 'PhonePe',
        payment_date_completed: t.completedDate ? new Date(t.completedDate) : null,
        payment_time_completed: t.completedDate ? new Date(t.completedDate) : null,
        failure_reason: t.failureReason || '',
        refund_date: t.refundDate ? new Date(t.refundDate) : null,
        purchase_source: '',
        device_type: '',
        is_refunded: (t.refundStatus === 'COMPLETED' || t.refundStatus === 'REFUNDED') ? 'YES' : 'NO',
        remarks: ''
      });

      // Formatting
      row.getCell('purchase_date').numFmt = dateFmt;
      row.getCell('purchase_time').numFmt = timeFmt;
      row.getCell('created_at').numFmt = dateFmt + ' ' + timeFmt;
      row.getCell('updated_at').numFmt = dateFmt + ' ' + timeFmt;
      if (t.completedDate) {
        row.getCell('payment_date_completed').numFmt = dateFmt;
        row.getCell('payment_time_completed').numFmt = timeFmt;
      }
      if (t.refundDate) {
        row.getCell('refund_date').numFmt = dateFmt;
      }
      
      row.getCell('amount').numFmt = currencyFmt;
      row.getCell('discount_amount').numFmt = currencyFmt;
      row.getCell('tax_amount').numFmt = currencyFmt;
      row.getCell('net_amount').numFmt = currencyFmt;
      row.getCell('refund_amount').numFmt = currencyFmt;

      // Status color
      const statusCell = row.getCell('payment_status');
      statusCell.font = { bold: true };
      if (t.status === 'COMPLETED' || t.status === 'SUCCESS') statusCell.font.color = { argb: C.green };
      else if (t.status === 'FAILED') statusCell.font.color = { argb: C.red };
      else statusCell.font.color = { argb: C.orange };

      // Alternate row bg
      if (index % 2 === 1) {
        row.eachCell({ includeEmpty: true }, (c) => {
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
        });
      }
    });

    // ============================================================
    // SHEET 3: Daily Analytics
    // ============================================================
    ws3.columns = [
      { header: 'date', key: 'date', width: 15 },
      { header: 'total_transactions', key: 'total_transactions', width: 18 },
      { header: 'successful_transactions', key: 'successful_transactions', width: 22 },
      { header: 'failed_transactions', key: 'failed_transactions', width: 18 },
      { header: 'pending_transactions', key: 'pending_transactions', width: 20 },
      { header: 'course_sales', key: 'course_sales', width: 15 },
      { header: 'internship_sales', key: 'internship_sales', width: 18 },
      { header: 'course_revenue', key: 'course_revenue', width: 18 },
      { header: 'internship_revenue', key: 'internship_revenue', width: 20 },
      { header: 'gross_revenue', key: 'gross_revenue', width: 18 },
      { header: 'discount_amount', key: 'discount_amount', width: 18 },
      { header: 'refund_amount', key: 'refund_amount', width: 18 },
      { header: 'net_revenue', key: 'net_revenue', width: 18 },
      { header: 'avg_order_value', key: 'avg_order_value', width: 18 }
    ];
    ws3.autoFilter = 'A1:N1';
    ws3.views = [{ state: 'frozen', ySplit: 1 }];

    const ws3Header = ws3.getRow(1);
    ws3Header.height = 24;
    ws3Header.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.navy } };
      cell.font = { bold: true, color: { argb: C.white } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = borders;
    });

    dailyData.forEach((d, i) => {
      const row = ws3.addRow({
        ...d,
        date: new Date(d.date)
      });
      row.getCell('date').numFmt = dateFmt;
      ['course_revenue', 'internship_revenue', 'gross_revenue', 'discount_amount', 'refund_amount', 'net_revenue', 'avg_order_value'].forEach(k => {
        row.getCell(k).numFmt = currencyFmt;
      });
      if (i % 2 === 1) {
        row.eachCell({ includeEmpty: true }, c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } });
      }
    });

    // ============================================================
    // SHEET 4: Product Performance
    // ============================================================
    ws4.columns = [
      { header: 'product_id', key: 'product_id', width: 20 },
      { header: 'product_name', key: 'product_name', width: 35 },
      { header: 'product_type', key: 'product_type', width: 18 },
      { header: 'category', key: 'category', width: 20 },
      { header: 'total_sales', key: 'total_sales', width: 15 },
      { header: 'successful_sales', key: 'successful_sales', width: 18 },
      { header: 'failed_sales', key: 'failed_sales', width: 15 },
      { header: 'gross_revenue', key: 'gross_revenue', width: 18 },
      { header: 'refund_amount', key: 'refund_amount', width: 18 },
      { header: 'net_revenue', key: 'net_revenue', width: 18 },
      { header: 'avg_order_value', key: 'avg_order_value', width: 18 }
    ];
    ws4.autoFilter = 'A1:K1';
    ws4.views = [{ state: 'frozen', ySplit: 1 }];

    const ws4Header = ws4.getRow(1);
    ws4Header.height = 24;
    ws4Header.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.navy } };
      cell.font = { bold: true, color: { argb: C.white } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = borders;
    });

    productData.forEach((p, i) => {
      const row = ws4.addRow(p);
      ['gross_revenue', 'refund_amount', 'net_revenue', 'avg_order_value'].forEach(k => {
        row.getCell(k).numFmt = currencyFmt;
      });
      if (i % 2 === 1) {
        row.eachCell({ includeEmpty: true }, c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } });
      }
    });

    // ============================================================
    // SHEET 5: Data Dictionary
    // ============================================================
    ws5.columns = [
      { header: 'Group', key: 'group', width: 20 },
      { header: 'Column Name', key: 'column', width: 25 },
      { header: 'Description', key: 'desc', width: 50 },
      { header: 'Data Type', key: 'type', width: 15 }
    ];
    ws5.views = [{ state: 'frozen', ySplit: 1 }];
    const ws5Header = ws5.getRow(1);
    ws5Header.height = 24;
    ws5Header.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.navy } };
      cell.font = { bold: true, color: { argb: C.white } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = borders;
    });

    const dictData = [
      { group: 'Transaction Info', column: 'transaction_id', desc: 'Unique identifier for the transaction', type: 'String' },
      { group: 'Transaction Info', column: 'purchase_date', desc: 'Date of the purchase', type: 'Date' },
      { group: 'User Info', column: 'user_name', desc: 'Name of the customer', type: 'String' },
      { group: 'Product Info', column: 'product_name', desc: 'Name of the course/internship', type: 'String' },
      { group: 'Financial Info', column: 'net_amount', desc: 'Final amount collected after discounts', type: 'Currency' },
      { group: 'Payment Info', column: 'payment_status', desc: 'COMPLETED, FAILED, PENDING', type: 'String' }
    ];
    
    dictData.forEach(d => {
      const row = ws5.addRow(d);
      row.eachCell(c => { c.border = borders; c.alignment = { vertical: 'middle', wrapText: true }; });
    });

    // ============================================================
    // FILE GENERATION
    // ============================================================
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `internkatta_dashboard_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export Excel Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate Excel export', error: error.message });
  }
};

exports.getExportJsonData = async (req, res) => {
  try {
    const { startDate, endDate, dateMode } = req.query;

    let start, end;
    if (dateMode === 'lifetime') {
      start = new Date('2020-01-01');
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else {
      end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      
      start = startDate ? new Date(startDate) : new Date(end);
      if (!startDate) {
        start.setDate(start.getDate() - 30);
      }
      start.setHours(0, 0, 0, 0);
    }

    const dateFilter = {
      paymentDate: {
        $gte: start,
        $lte: end
      }
    };

    // Calculate Payments Agg for Summary
    const agg = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] } } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$amount' },
          totalPurchases: { $sum: 1 },
          coursePurchases: { 
            $sum: { $cond: [{ $eq: ['$type', 'COURSE'] }, 1, 0] } 
          },
          internshipPurchases: {
            $sum: { $cond: [{ $eq: ['$type', 'INTERNSHIP'] }, 1, 0] }
          },
          courseRevenue: {
             $sum: { $cond: [{ $eq: ['$type', 'COURSE'] }, '$amount', 0] }
          },
          internshipRevenue: {
             $sum: { $cond: [{ $eq: ['$type', 'INTERNSHIP'] }, '$amount', 0] }
          }
        }
      }
    ]);
    const currentPeriodStats = agg[0] || { totalRevenue: 0, totalPurchases: 0, coursePurchases: 0, internshipPurchases: 0, courseRevenue: 0, internshipRevenue: 0 };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayAgg = await Payment.aggregate([
      { $match: { paymentDate: { $gte: todayStart, $lte: todayEnd }, status: { $in: ['COMPLETED', 'SUCCESS'] } } },
      { $group: { _id: null, totalPurchases: { $sum: 1 } } }
    ]);
    const todayPurchases = todayAgg[0]?.totalPurchases || 0;

    const totalUsers = await User.countDocuments({ role: 'user', createdAt: { $lte: end } });

    const statusCounts = await Payment.aggregate([
      { $match: { ...dateFilter } },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);
    let successfulCount = 0, failedCount = 0, pendingCount = 0, refundedCount = 0;
    statusCounts.forEach(s => {
      if (s._id === 'COMPLETED' || s._id === 'SUCCESS') successfulCount += s.count;
      else if (s._id === 'FAILED') failedCount += s.count;
      else if (s._id === 'PENDING') pendingCount += s.count;
      else if (s._id === 'REFUNDED') refundedCount += s.count;
    });

    const totalTransactions = successfulCount + failedCount + pendingCount + refundedCount;

    // Daily Analytics
    const dailyAnalytics = await Payment.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate", timezone: "Asia/Kolkata" } },
          total_transactions: { $sum: 1 },
          successful_transactions: { $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'SUCCESS']] }, 1, 0] } },
          failed_transactions: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          pending_transactions: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          course_sales: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'COURSE'] }, { $in: ['$status', ['COMPLETED', 'SUCCESS']] }] }, 1, 0] } },
          internship_sales: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'INTERNSHIP'] }, { $in: ['$status', ['COMPLETED', 'SUCCESS']] }] }, 1, 0] } },
          course_revenue: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'COURSE'] }, { $in: ['$status', ['COMPLETED', 'SUCCESS']] }] }, '$amount', 0] } },
          internship_revenue: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'INTERNSHIP'] }, { $in: ['$status', ['COMPLETED', 'SUCCESS']] }] }, '$amount', 0] } },
          gross_revenue: { $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'SUCCESS']] }, { $ifNull: ['$originalAmount', '$amount'] }, 0] } },
          discount_amount: { $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'SUCCESS']] }, { $subtract: [{ $ifNull: ['$originalAmount', '$amount'] }, '$amount'] }, 0] } },
          net_revenue: { $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'SUCCESS']] }, '$amount', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedDailyAnalytics = dailyAnalytics.map(d => ({
      date: d._id,
      total_transactions: d.total_transactions,
      successful_transactions: d.successful_transactions,
      failed_transactions: d.failed_transactions,
      pending_transactions: d.pending_transactions,
      course_sales: d.course_sales,
      internship_sales: d.internship_sales,
      course_revenue: d.course_revenue,
      internship_revenue: d.internship_revenue,
      gross_revenue: d.gross_revenue,
      discount_amount: d.discount_amount,
      refund_amount: 0,
      net_revenue: d.net_revenue,
      avg_order_value: d.successful_transactions > 0 ? Number((d.net_revenue / d.successful_transactions).toFixed(2)) : 0
    }));

    // Revenue Trends (Recreation of charting data)
    const revenue_trends = formattedDailyAnalytics.map(d => ({
      date: d.date,
      revenue: d.net_revenue,
      purchase_count: d.successful_transactions
    }));

    // Top Sellers
    const topCourses = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'COURSE', courseId: { $ne: null } } },
      { $group: { 
          _id: '$courseId', 
          revenue: { $sum: '$amount' }, 
          sales: { $sum: 1 },
          productName: { $first: '$productName' }
      } },
      { $sort: { sales: -1 } },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      { $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          product_id: '$_id',
          product_name: { $ifNull: ['$productName', { $ifNull: ['$courseDetails.title', 'Deleted Course'] }] },
          category: { $ifNull: ['$courseDetails.category', null] },
          sales: 1,
          revenue: 1,
          average_order_value: { $round: [{ $divide: ['$revenue', '$sales'] }, 2] }
        }
      }
    ]);
    // Add rank
    topCourses.forEach((c, i) => c.rank = i + 1);

    const topInternships = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] }, type: 'INTERNSHIP', internshipId: { $ne: null } } },
      { $group: { 
          _id: '$internshipId', 
          revenue: { $sum: '$amount' }, 
          sales: { $sum: 1 },
          productName: { $first: '$productName' }
      } },
      { $sort: { sales: -1 } },
      {
        $lookup: {
          from: 'internships',
          localField: '_id',
          foreignField: '_id',
          as: 'internshipDetails'
        }
      },
      { $unwind: { path: '$internshipDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          product_id: '$_id',
          product_name: { $ifNull: ['$productName', { $ifNull: ['$internshipDetails.title', 'Deleted Internship'] }] },
          category: { $ifNull: ['$internshipDetails.category', null] },
          sales: 1,
          revenue: 1,
          average_order_value: { $round: [{ $divide: ['$revenue', '$sales'] }, 2] }
        }
      }
    ]);
    topInternships.forEach((c, i) => c.rank = i + 1);

    // Product Performance
    const productPerformance = await Payment.aggregate([
      { $match: { ...dateFilter } },
      { $group: {
          _id: {
            id: { $cond: [{ $eq: ['$type', 'COURSE'] }, '$courseId', '$internshipId'] },
            type: '$type'
          },
          productName: { $first: '$productName' },
          total_sales: { $sum: 1 },
          successful_sales: { $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'SUCCESS']] }, 1, 0] } },
          failed_sales: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          net_revenue: { $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'SUCCESS']] }, '$amount', 0] } },
          gross_revenue: { $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'SUCCESS']] }, { $ifNull: ['$originalAmount', '$amount'] }, 0] } }
      }},
      {
        $lookup: {
          from: 'courses',
          localField: '_id.id',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $lookup: {
          from: 'internships',
          localField: '_id.id',
          foreignField: '_id',
          as: 'internshipDetails'
        }
      },
      { $unwind: { path: '$courseDetails', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$internshipDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { net_revenue: -1 } }
    ]);
    
    const formattedProductPerformance = productPerformance.map(p => {
      const isCourse = p._id.type === 'COURSE';
      const pName = p.productName || (isCourse ? p.courseDetails?.title : p.internshipDetails?.title) || 'Deleted Product';
      const category = isCourse ? p.courseDetails?.category : p.internshipDetails?.category;
      
      const discount = p.gross_revenue - p.net_revenue;
      
      return {
        product_id: p._id.id,
        product_name: pName,
        product_type: p._id.type,
        category: category || null,
        total_sales: p.total_sales,
        successful_sales: p.successful_sales,
        failed_sales: p.failed_sales,
        gross_revenue: p.gross_revenue,
        discount_amount: discount > 0 ? discount : 0,
        refund_amount: 0,
        net_revenue: p.net_revenue,
        average_order_value: p.successful_sales > 0 ? Number((p.net_revenue / p.successful_sales).toFixed(2)) : 0
      };
    });

    // Action Required
    const newInquiries = await Contact.countDocuments({ status: 'NEW' });
    const usersWithPendingSubmissions = await User.countDocuments({ 'internshipProgress.completedLectures.status': 'Pending' });
    const newTrainingRegistrations = await Training.countDocuments({ status: 'pending' });
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    const recentPurchasesCount = await Payment.countDocuments({ paymentDate: { $gte: last24h } });
    
    const action_required = {
      new_inquiries: newInquiries,
      new_internship_submissions: usersWithPendingSubmissions,
      training_registrations: newTrainingRegistrations,
      recent_purchases: recentPurchasesCount,
      pending_payments: pendingCount
    };

    // Transactions
    // Fetch all for the period unpaginated
    const transactions = await Payment.find({ ...dateFilter })
      .sort({ paymentDate: -1 })
      .populate('userId', 'fullName email createdAt')
      .populate('courseId', 'title category subCategory')
      .populate('internshipId', 'title category subCategory')
      .lean();

    const formattedTransactions = transactions.map(t => {
      const isCourse = t.type === 'COURSE';
      const prod = isCourse ? t.courseId : t.internshipId;
      
      let pdate = null, ptime = null;
      if (t.paymentDate) {
        const pd = new Date(t.paymentDate);
        pdate = pd.toISOString().split('T')[0];
        ptime = pd.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' });
      }

      let udate = null;
      if (t.userId && t.userId.createdAt) {
        udate = new Date(t.userId.createdAt).toISOString().split('T')[0];
      }

      return {
        transaction_id: t.transactionId || t._id.toString(),
        order_id: t.orderId || null,
        payment_id: t.phonepeTransactionId || null,
        purchase_date: pdate,
        purchase_time: ptime,
        
        user: {
          user_id: t.userId?._id?.toString() || null,
          user_name: t.customerName || t.userId?.fullName || null,
          user_email: t.customerEmail || t.userId?.email || null,
          registration_date: udate
        },

        product: {
          product_id: isCourse ? t.courseId?._id?.toString() || null : t.internshipId?._id?.toString() || null,
          product_name: t.productName || prod?.title || null,
          product_type: t.type,
          category: prod?.category || null,
          subcategory: prod?.subCategory || null
        },

        financial: {
          base_amount: t.originalAmount || t.amount || 0,
          discount_amount: (t.originalAmount && t.amount) ? (t.originalAmount - t.amount) : 0,
          tax_amount: 0, // no tax info available
          gross_amount: t.originalAmount || t.amount || 0,
          coupon_code: t.couponCode || null,
          coupon_discount: (t.originalAmount && t.amount) ? (t.originalAmount - t.amount) : 0,
          net_amount: t.amount || 0,
          refund_amount: 0,
          currency: "INR"
        },

        payment: {
          payment_status: t.status,
          payment_method: t.paymentMethod || 'UPI/Card',
          payment_gateway: 'PhonePe', // System uses PhonePe as default
          payment_date: pdate,
          payment_time: ptime,
          failure_reason: null,
          refund_date: null
        },

        source: {
          purchase_source: "WEB",
          referral_code: null,
          utm_source: null,
          utm_medium: null,
          utm_campaign: null,
          device_type: "DESKTOP"
        },

        analytics: {
          is_new_user: udate === pdate, // simplified assumption
          lifetime_value_before: null, // difficult to compute in single pass
          lifetime_value_after: null,
          total_orders_by_user: null,
          total_successful_orders_by_user: null
        },

        remarks: null,
        is_refunded: false
      };
    });

    // Recent Purchases for summary
    const recent_purchases = formattedTransactions.slice(0, 10).map(t => ({
      transaction_id: t.transaction_id,
      user_id: t.user.user_id,
      user_name: t.user.user_name,
      user_email: t.user.user_email,
      product_id: t.product.product_id,
      product_name: t.product.product_name,
      product_type: t.product.product_type,
      amount: t.financial.net_amount,
      purchase_date: t.purchase_date,
      purchase_time: t.purchase_time,
      payment_status: t.payment.payment_status
    }));

    const sales_distribution = {
      courses: {
        sales: currentPeriodStats.coursePurchases,
        revenue: currentPeriodStats.courseRevenue,
        percentage_of_revenue: currentPeriodStats.totalRevenue > 0 ? Number(((currentPeriodStats.courseRevenue / currentPeriodStats.totalRevenue) * 100).toFixed(1)) : 0
      },
      internships: {
        sales: currentPeriodStats.internshipPurchases,
        revenue: currentPeriodStats.internshipRevenue,
        percentage_of_revenue: currentPeriodStats.totalRevenue > 0 ? Number(((currentPeriodStats.internshipRevenue / currentPeriodStats.totalRevenue) * 100).toFixed(1)) : 0
      }
    };

    const payment_summary = {
      total_purchases: totalTransactions,
      successful: {
        count: successfulCount,
        percentage: totalTransactions > 0 ? Number(((successfulCount / totalTransactions) * 100).toFixed(1)) : 0
      },
      failed: {
        count: failedCount,
        percentage: totalTransactions > 0 ? Number(((failedCount / totalTransactions) * 100).toFixed(1)) : 0
      },
      pending: {
        count: pendingCount,
        percentage: totalTransactions > 0 ? Number(((pendingCount / totalTransactions) * 100).toFixed(1)) : 0
      },
      refunded: {
        count: refundedCount,
        percentage: totalTransactions > 0 ? Number(((refundedCount / totalTransactions) * 100).toFixed(1)) : 0
      }
    };

    const grossRev = formattedDailyAnalytics.reduce((sum, d) => sum + d.gross_revenue, 0);
    const totDiscount = formattedDailyAnalytics.reduce((sum, d) => sum + d.discount_amount, 0);

    const revenue_summary = {
      gross_revenue: grossRev,
      discounts: totDiscount,
      refunds: 0,
      net_revenue: currentPeriodStats.totalRevenue,
      currency: "INR"
    };

    const adminInfo = req.admin ? req.admin.fullName || req.admin.email || "Admin" : "Admin";

    const report_metadata = {
      report_name: "InternKatta Admin Dashboard Analytics",
      export_type: "JSON",
      generated_at: new Date().toISOString(),
      generated_by: adminInfo,
      report_period_type: dateMode === 'lifetime' ? 'LIFETIME' : 'CUSTOM',
      date_from: start.toISOString().split('T')[0],
      date_to: end.toISOString().split('T')[0],
      timezone: "Asia/Kolkata",
      currency: "INR",
      total_columns: 20,
      total_transactions: transactions.length
    };

    const summary = {
      total_revenue: currentPeriodStats.totalRevenue,
      total_purchases: currentPeriodStats.totalPurchases,
      total_users: totalUsers,
      today_purchases: todayPurchases,
      course_purchases: currentPeriodStats.coursePurchases,
      internship_purchases: currentPeriodStats.internshipPurchases,
      average_order_value: currentPeriodStats.totalPurchases > 0 ? Number((currentPeriodStats.totalRevenue / currentPeriodStats.totalPurchases).toFixed(2)) : 0,
      course_revenue: currentPeriodStats.courseRevenue,
      internship_revenue: currentPeriodStats.internshipRevenue,
      successful_payments: successfulCount,
      failed_payments: failedCount,
      pending_payments: pendingCount,
      refunded_amount: 0
    };

    const jsonExport = {
      report_metadata,
      summary,
      sales_distribution,
      revenue_trends,
      daily_analytics: formattedDailyAnalytics,
      top_selling_courses: topCourses,
      top_selling_internships: topInternships,
      recent_purchases,
      action_required,
      payment_summary,
      revenue_summary,
      product_performance: formattedProductPerformance,
      transactions: formattedTransactions
    };

    const now = new Date();
    const ts = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    const filename = `internkatta_dashboard_${ts}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // 2 spaces indentation for readable json
    res.send(JSON.stringify(jsonExport, null, 2));

  } catch (error) {
    console.error('JSON Export Error:', error);
    res.status(500).json({ success: false, message: `Failed to generate JSON export: ${error.message} | Stack: ${error.stack}` });
  }
};

