const express = require('express');
const asyncHandler = require('express-async-handler');
const Visit = require('../models/Visit');
const { protectAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/visits - log a new visit
router.post('/', asyncHandler(async (req, res) => {
  const { page, userAgent, timestamp, sessionId } = req.body;
  const ua = userAgent || req.headers['user-agent'] || '';
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const referrer = req.headers.referer || '';

  // Simple UA parser
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  const deviceType = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
  
  const browser = 
  ua.match(/Edg(e|)\/([\d]+)/i)   ? 'Edge'    :  // Check Edge BEFORE Chrome
  ua.match(/OPR|Opera/i)          ? 'Opera'   :  // Opera also contains "Chrome"
  ua.match(/Chrome\/([\d]+)/i)    ? 'Chrome'  :
  ua.match(/Firefox\/([\d]+)/i)   ? 'Firefox' :
  ua.match(/Safari\/([\d]+)/i)    ? 'Safari'  :
                                    'Other';
  const osMatch = ua.match(/Windows NT/i) || ua.match(/Mac OS X/i) || ua.match(/Android/i) || ua.match(/iPhone|iPad/i) || ua.match(/Linux/i);
  const os = osMatch ? (osMatch[0].includes('Windows') ? 'Windows' : osMatch[0].includes('Mac') ? 'macOS' : osMatch[0].includes('Android') ? 'Android' : 'iOS/Linux') : 'Unknown';

  const visit = new Visit({
    page: page || '/',
    ipAddress: ip,
    userAgent: ua,
    deviceType,
    browser,
    os,
    referrer,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    sessionId: sessionId || undefined,
  });

  await visit.save();
  res.json({ success: true, data: visit });
}));

// PATCH /api/visits/clicks - track clicks (internship or nav link)
router.patch('/clicks', asyncHandler(async (req, res) => {
  const { sessionId, clickType, clickData } = req.body;
  
  if (!sessionId || !clickType || !clickData) {
    return res.status(400).json({ success: false, message: 'sessionId, clickType, and clickData are required' });
  }

  // Find the most recent visit for this session
  const visit = await Visit.findOne({ sessionId }).sort({ timestamp: -1 });
  
  if (!visit) {
    return res.status(404).json({ success: false, message: 'Visit not found for this session' });
  }

  // Add click data with timestamp
  const clickEntry = {
    ...clickData,
    clickedAt: new Date(),
  };

  if (clickType === 'internship') {
    visit.internshipClicks = visit.internshipClicks || [];
    visit.internshipClicks.push(clickEntry);
  } else if (clickType === 'navLink') {
    visit.navLinkClicks = visit.navLinkClicks || [];
    visit.navLinkClicks.push(clickEntry);
  } else {
    return res.status(400).json({ success: false, message: 'Invalid clickType. Use "internship" or "navLink"' });
  }

  await visit.save();
  res.json({ success: true, message: 'Click tracked', data: visit });
}));

// DELETE /api/visits/:id - delete specific visit (admin only)
router.delete('/:id', protectAdmin, asyncHandler(async (req, res) => {
  const visit = await Visit.findByIdAndDelete(req.params.id);
  if (!visit) {
    return res.status(404).json({ success: false, message: 'Visit not found' });
  }
  res.json({ success: true, message: 'Visit deleted', data: visit });
}));

module.exports = router;
