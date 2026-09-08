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

    // --- Daily Summary Table ---
    let summaryEnd = new Date(end);
    if (summaryEnd > new Date()) {
      summaryEnd = new Date();
    }
    const summaryStart = new Date(summaryEnd);
    summaryStart.setDate(summaryStart.getDate() - 6);
    summaryStart.setHours(0, 0, 0, 0);

    const actualSummaryStart = summaryStart < start ? start : summaryStart;

    const dailySummaryAgg = await Payment.aggregate([
      { $match: { paymentDate: { $gte: actualSummaryStart, $lte: summaryEnd } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
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
          }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const dailySummary = [];
    
    // Generate dates helper for local logic
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
    
    const datesInRange = getDates(actualSummaryStart, summaryEnd).reverse();
    const summaryMap = {};
    dailySummaryAgg.forEach(day => {
      summaryMap[day._id] = day;
    });

    datesInRange.forEach(date => {
      if (summaryMap[date]) {
        dailySummary.push({
          date,
          displayDate: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          ...summaryMap[date]
        });
      } else {
        dailySummary.push({
          date,
          displayDate: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          totalPurchases: 0,
          successful: 0,
          failed: 0,
          courseRevenue: 0,
          internshipRevenue: 0,
          netRevenue: 0
        });
      }
    });

    // --- Charts Data ---
    const dailyPaymentsList = await Payment.aggregate([
      { $match: { ...dateFilter, status: { $in: ['COMPLETED', 'SUCCESS'] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } },
          revenue: { $sum: '$amount' },
          purchases: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dateMapChart = {};
    dailyPaymentsList.forEach(day => {
      dateMapChart[day._id] = day;
    });

    let chartData = [];
    if (dateMode !== 'lifetime' && end.getTime() - start.getTime() <= 365 * 24 * 60 * 60 * 1000) {
      const allDates = getDates(start, end);
      chartData = allDates.map(date => {
        const data = dateMapChart[date] || { revenue: 0, purchases: 0 };
        return {
          date,
          displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: data.revenue,
          purchases: data.purchases
        };
      });
    } else {
      chartData = dailyPaymentsList.map(data => ({
        date: data._id,
        displayDate: new Date(data._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        revenue: data.revenue,
        purchases: data.purchases
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

    res.json({
      success: true,
      data: {
        kpi,
        secondaryKpi,
        dailySummary,
        charts: {
          daily: chartData,
          donut: donutData
        },
        actionRequired,
        reportPeriod: {
          start: start.toISOString(),
          end: end.toISOString(),
          mode: dateMode
        }
      }
    });

  } catch (error) {
    console.error('Export Stats Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch export statistics', error: error.message });
  }
};
