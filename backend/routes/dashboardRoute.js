const express = require('express');
const router = express.Router();
const { getDashboardStats, getExportPdfData, getExportExcelData, getExportJsonData } = require('../controllers/dashboardController');
const { protectAdmin, isAdmin } = require('../middleware/authMiddleware');

// Get dashboard statistics (requires admin auth)
router.get('/stats', protectAdmin, isAdmin, getDashboardStats);

// Get export data for PDF report (requires admin auth)
router.get('/export-pdf-data', protectAdmin, isAdmin, getExportPdfData);

// Get export data for Excel report (requires admin auth)
router.get('/export-excel-data', protectAdmin, isAdmin, getExportExcelData);

// Get export data for JSON report (requires admin auth)
router.get('/export-json-data', protectAdmin, isAdmin, getExportJsonData);

module.exports = router;
