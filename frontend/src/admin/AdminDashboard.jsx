import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  ArrowUp, ArrowDown, Calendar, Download, 
  Eye, GraduationCap, CheckCircle, Clock,
  ShoppingCart, BookOpenText, Briefcase, Users
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import PdfExportModal from './PdfExportModal';
import AdminAnalyticsPdfReport from './AdminAnalyticsPdfReport';
import { generatePdfFromElement } from './pdfExportUtils';

const AdminDashboard = () => {
  const [dateMode, setDateMode] = useState('lifetime'); // 'lifetime', 'custom'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    setExpandedCardId(null);
  }, [dateMode, startDate, endDate, currentPage]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        dateMode
      };
      
      if (dateMode === 'custom') {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      const response = await api.get('/api/admin/dashboard/stats', { params });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    // Hide the dropdown menu
    setShowExportMenu(false);
    
    if (format === 'pdf') {
      setIsPdfModalOpen(true);
    } else if (format === 'excel') {
      setIsExporting(true);
      try {
        const params = { dateMode };
        if (dateMode === 'custom') {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        
        const response = await api.get('/api/admin/dashboard/export-excel-data', { 
          params, 
          responseType: 'blob' 
        });
        
        let filename = `internkatta_dashboard_export.xlsx`;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
          filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
        }

        const url = window.URL.createObjectURL(new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
      } catch (err) {
        console.error('Error generating Excel:', err);
        alert('An error occurred while generating Excel export');
      } finally {
        setIsExporting(false);
      }
    } else if (format === 'json') {
      setIsExporting(true);
      try {
        const params = { dateMode };
        if (dateMode === 'custom') {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        
        const response = await api.get('/api/admin/dashboard/export-json-data', { 
          params, 
          responseType: 'blob' 
        });
        
        let filename = `internkatta_dashboard_export.json`;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
          filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
        }

        const url = window.URL.createObjectURL(new Blob([response.data], { 
          type: 'application/json' 
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
      } catch (err) {
        console.error('Error generating JSON:', err);
        alert('An error occurred while generating JSON export');
      } finally {
        setIsExporting(false);
      }
    } else {
      alert(`Export functionality for ${format.toUpperCase()} will be implemented next!`);
    }
  };

  const handlePdfExport = async (options) => {
    setIsPdfModalOpen(false);
    setIsExporting(true);
    try {
      const params = { dateMode: options.dateMode };
      if (options.dateMode === 'custom') {
        params.startDate = options.startDate;
        params.endDate = options.endDate;
      }
      
      const response = await api.get('/api/admin/dashboard/export-pdf-data', { params });
      
      if (response.data.success) {
        // Include reportPeriod in the pdfData so report can display dates
        const exportData = {
          ...response.data.data,
          reportPeriod: {
            mode: options.dateMode,
            start: options.startDate,
            end: options.endDate
          }
        };
        setPdfData(exportData);
        
        // Wait for React to render the report component
        setTimeout(async () => {
          if (pdfRef.current) {
            const dateStr = new Date().toISOString().split('T')[0];
            const success = await generatePdfFromElement(pdfRef.current, `Admin_Analytics_Report_${dateStr}.pdf`);
            if (!success) {
              alert('Failed to generate PDF');
            }
          }
          setIsExporting(false);
          setPdfData(null);
        }, 1500); // Give Recharts more time to render
      } else {
        alert(response.data.message || 'Failed to fetch data for PDF');
        setIsExporting(false);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert(err.response?.data?.message || 'An error occurred while generating PDF');
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="text-red-500 mb-4 text-5xl">⚠️</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to load dashboard</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { kpi, charts, topSellers, recentPurchases, recentPurchasesPagination, actionRequired } = data || {};
  
  const DONUT_COLORS = ['#6C5CE7', '#00B8D9'];

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Loading overlay for PDF/CSV generation */}
      {isExporting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-4 border border-indigo-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-lg">Generating Report</span>
              <span className="text-sm text-gray-500">Please wait while we prepare your file...</span>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      <PdfExportModal 
        isOpen={isPdfModalOpen} 
        onClose={() => setIsPdfModalOpen(false)} 
        onExport={handlePdfExport} 
      />

      {/* Hidden PDF Report Template */}
      {pdfData && (
        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
          <AdminAnalyticsPdfReport 
            ref={pdfRef} 
            data={pdfData} 
            generatedOn={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} 
          />
        </div>
      )}

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Admin! Here's what's happening on your platform.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="flex bg-gray-100 p-1 rounded-md">
            <button
              onClick={() => setDateMode('lifetime')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateMode === 'lifetime' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Lifetime
            </button>
            <button
              onClick={() => setDateMode('custom')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateMode === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Custom
            </button>
          </div>
          
          {dateMode === 'custom' && (
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md p-1 shadow-sm">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm text-gray-700 bg-transparent border-none focus:ring-0 py-1 px-2 w-32"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm text-gray-700 bg-transparent border-none focus:ring-0 py-1 px-2 w-32"
              />
            </div>
          )}
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-[#4F46E5] hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Download size={16} /> Export Report
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100 overflow-hidden">
                <div className="py-1">
                  <button 
                    onClick={() => handleExport('pdf')} 
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 w-full text-left transition-colors"
                  >
                    Export as PDF
                  </button>
                  <button 
                    onClick={() => handleExport('excel')} 
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 w-full text-left transition-colors border-t border-gray-50"
                  >
                    Export as Excel
                  </button>
                  <button 
                    onClick={() => handleExport('json')} 
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 w-full text-left transition-colors border-t border-gray-50"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(kpi?.totalRevenue)}</h3>
            </div>
            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
              <span className="text-lg font-bold">₹</span>
            </div>
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className={`flex items-center font-medium ${kpi?.totalRevenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpi?.totalRevenueChange >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
              {Math.abs(kpi?.totalRevenueChange || 0).toFixed(1)}%
            </span>
            <span className="text-gray-400 ml-1">
              {dateMode === 'lifetime' ? 'All time' : `vs prev period`}
            </span>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">Total Purchases</p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi?.totalPurchases?.toLocaleString()}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className={`flex items-center font-medium ${kpi?.totalPurchasesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpi?.totalPurchasesChange >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
              {Math.abs(kpi?.totalPurchasesChange || 0).toFixed(1)}%
            </span>
            <span className="text-gray-400 ml-1">
              {dateMode === 'lifetime' ? 'All time' : `vs prev period`}
            </span>
          </div>
        </div>

        {/* Today's Purchases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">Today's Purchases</p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi?.todayPurchases?.toLocaleString()}</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className={`flex items-center font-medium ${kpi?.todayPurchasesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpi?.todayPurchasesChange >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
              {Math.abs(kpi?.todayPurchasesChange || 0).toFixed(1)}%
            </span>
            <span className="text-gray-400 ml-1">vs yesterday</span>
          </div>
        </div>

        {/* Course Purchases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">Course Purchases</p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi?.coursePurchases?.toLocaleString()}</h3>
            </div>
            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
              <BookOpenText size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className={`flex items-center font-medium ${kpi?.coursePurchasesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpi?.coursePurchasesChange >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
              {Math.abs(kpi?.coursePurchasesChange || 0).toFixed(1)}%
            </span>
            <span className="text-gray-400 ml-1">
              {dateMode === 'lifetime' ? 'All time' : `vs prev period`}
            </span>
          </div>
        </div>

        {/* Internship Purchases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">Internship Purchases</p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi?.internshipPurchases?.toLocaleString()}</h3>
            </div>
            <div className="bg-pink-100 p-2 rounded-full text-pink-600">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className={`flex items-center font-medium ${kpi?.internshipPurchasesChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpi?.internshipPurchasesChange >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
              {Math.abs(kpi?.internshipPurchasesChange || 0).toFixed(1)}%
            </span>
            <span className="text-gray-400 ml-1">
              {dateMode === 'lifetime' ? 'All time' : `vs prev period`}
            </span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-xs font-medium mb-1">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi?.totalUsers?.toLocaleString()}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs mt-2">
            <span className={`flex items-center font-medium ${kpi?.totalUsersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {kpi?.totalUsersChange >= 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
              {Math.abs(kpi?.totalUsersChange || 0).toFixed(1)}%
            </span>
            <span className="text-gray-400 ml-1">
              {dateMode === 'lifetime' ? 'All time' : `vs prev period`}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Overview (Line Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
              Revenue Overview <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
            </h3>
            <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded">
              {dateMode === 'lifetime' ? 'All Time' : 'Selected Period'} ▼
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(kpi?.totalRevenue)}</h3>
          </div>
          
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.daily || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(value) => `₹${value/1000}K`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  formatter={(value, name) => {
                    if (name === "Revenue (₹)") return [formatCurrency(value), name];
                    return [value, name];
                  }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#A855F7" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="purchases" name="No. of Purchases" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Purchases Overview (Bar Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
              Purchases Overview <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
            </h3>
            <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded">
              {dateMode === 'lifetime' ? 'All Time' : 'Selected Period'} ▼
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500">Total Purchases</p>
            <h3 className="text-xl font-bold text-gray-900">{kpi?.totalPurchases?.toLocaleString()}</h3>
          </div>
          
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.daily || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="coursePurchases" name="Course Purchases" stackId="a" fill="#6C5CE7" radius={[0, 0, 0, 0]} />
                <Bar dataKey="internshipPurchases" name="Internship Purchases" stackId="a" fill="#00B8D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales: Course vs Internship (Donut Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
              Sales: Course vs Internship <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
            </h3>
          </div>
          
          <div className="flex-grow flex flex-col items-center justify-center relative">
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Courses', value: charts?.donut?.courses?.revenue || 0 },
                      { name: 'Internships', value: charts?.donut?.internships?.revenue || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {[0, 1].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-gray-500 font-medium">Total Revenue</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(charts?.donut?.totalRevenue)}</span>
              </div>
            </div>
            
            <div className="w-full mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6C5CE7]"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">Courses</span>
                    <span className="text-xs text-gray-500">{charts?.donut?.courses?.orders} Orders</span>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(charts?.donut?.courses?.revenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00B8D9]"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">Internships</span>
                    <span className="text-xs text-gray-500">{charts?.donut?.internships?.orders} Orders</span>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(charts?.donut?.internships?.revenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Sellers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
              Top Selling Courses <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
            </h3>
          </div>
          <div className="space-y-4">
            {topSellers?.courses?.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{index + 1}.</span>
                  <div className="h-10 w-16 bg-gray-200 rounded object-cover overflow-hidden">
                    {course.image && <img src={course.image} alt={course.name} className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{course.name}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{formatCurrency(course.revenue)}</div>
                  <div className="text-xs text-gray-500">({course.sales} Sales)</div>
                </div>
              </div>
            ))}
            {(!topSellers?.courses || topSellers.courses.length === 0) && (
              <div className="text-center py-4 text-gray-500 text-sm">No course sales in this period</div>
            )}
          </div>
        </div>

        {/* Top Selling Internships */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
              Top Selling Internships <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
            </h3>
            <a href="/admin/manage-internship" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View All</a>
          </div>
          <div className="space-y-4">
            {topSellers?.internships?.map((internship, index) => (
              <div key={internship.id} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{index + 1}.</span>
                  <div className="h-10 w-16 bg-gray-200 rounded object-cover overflow-hidden">
                    {internship.image && <img src={internship.image} alt={internship.name} className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{internship.name}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{formatCurrency(internship.revenue)}</div>
                  <div className="text-xs text-gray-500">({internship.sales} Sales)</div>
                </div>
              </div>
            ))}
            {(!topSellers?.internships || topSellers.internships.length === 0) && (
              <div className="text-center py-4 text-gray-500 text-sm">No internship sales in this period</div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Purchases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
              Recent Purchases <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
            </h3>
            <a href="/admin/purchased-history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View All</a>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="text-xs text-gray-400 bg-gray-50/50 uppercase border-b border-gray-100">
                <tr>
                  <th className="py-3 px-2 font-medium">#</th>
                  <th className="py-3 px-2 font-medium">User</th>
                  <th className="py-3 px-2 font-medium">Product</th>
                  <th className="py-3 px-2 font-medium">Type</th>
                  <th className="py-3 px-2 font-medium">Amount</th>
                  <th className="py-3 px-2 font-medium">Purchase Date</th>
                  <th className="py-3 px-2 font-medium">Payment Status</th>
                  <th className="py-3 px-2 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentPurchases?.map((purchase, index) => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">{index + 1}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                          ${index % 4 === 0 ? 'bg-blue-400' : index % 4 === 1 ? 'bg-orange-400' : index % 4 === 2 ? 'bg-indigo-400' : 'bg-green-400'}
                        `}>
                          {purchase.user.name ? purchase.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{purchase.user.name}</span>
                          <span className="text-xs text-gray-500">{purchase.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-800">{purchase.product}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${purchase.type === 'Course' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {purchase.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-900">{formatCurrency(purchase.amount)}</td>
                    <td className="py-3 px-2">
                      <div className="flex flex-col">
                        <span>{new Date(purchase.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-xs text-gray-500">{new Date(purchase.purchaseDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        purchase.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        purchase.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {purchase.status === 'COMPLETED' ? 'Paid' : purchase.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <a href="/admin/purchased-history" className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-1.5 rounded inline-flex">
                        <Eye size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
                {(!recentPurchases || recentPurchases.length === 0) && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-500">No recent purchases found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="block lg:hidden space-y-4">
            {recentPurchases?.map((purchase, index) => {
              const isExpanded = expandedCardId === purchase.id;
              
              return (
                <div 
                  key={purchase.id} 
                  className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? 'border-indigo-300 shadow-md' : 'border-gray-200 shadow-sm'}`}
                >
                  {/* Card Header (Always visible) */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 flex items-start gap-3"
                    onClick={() => setExpandedCardId(isExpanded ? null : purchase.id)}
                  >
                    <div className="text-xs font-bold text-gray-400 mt-1">#{((recentPurchasesPagination?.currentPage || 1) - 1) * 10 + index + 1}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                            ${index % 4 === 0 ? 'bg-blue-400' : index % 4 === 1 ? 'bg-orange-400' : index % 4 === 2 ? 'bg-indigo-400' : 'bg-green-400'}
                          `}>
                            {purchase.user.name ? purchase.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="truncate">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{purchase.user.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{purchase.user.email}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-gray-400 ml-2">
                          <svg 
                            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <h5 className="text-sm font-semibold text-gray-800 break-words mb-2 leading-tight">{purchase.product}</h5>
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-semibold tracking-wide uppercase ${purchase.type === 'Course' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                            {purchase.type}
                          </span>
                          <span className="font-bold text-gray-900 text-sm">{formatCurrency(purchase.amount)}</span>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                            purchase.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                            purchase.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {purchase.status === 'COMPLETED' ? 'Paid' : purchase.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-2">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Purchase Date</p>
                          <p className="text-gray-900 font-medium">{new Date(purchase.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-500">{new Date(purchase.purchaseDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Payment ID</p>
                          <p className="text-gray-900 font-mono text-xs break-all">{purchase.id}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <a 
                          href="/admin/purchased-history" 
                          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye size={16} /> View Details
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {(!recentPurchases || recentPurchases.length === 0) && (
              <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg">No recent purchases found</div>
            )}
          </div>
          
          {recentPurchasesPagination && recentPurchasesPagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div>
                Showing {((recentPurchasesPagination.currentPage - 1) * 10) + 1} to {Math.min(recentPurchasesPagination.currentPage * 10, recentPurchasesPagination.totalPurchases)} of {recentPurchasesPagination.totalPurchases} entries
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={recentPurchasesPagination.currentPage === 1}
                  className="h-8 w-8 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                
                {Array.from({ length: Math.min(recentPurchasesPagination.totalPages, 3) }).map((_, idx) => {
                  let pageNum;
                  if (recentPurchasesPagination.totalPages <= 3) {
                    pageNum = idx + 1;
                  } else if (recentPurchasesPagination.currentPage <= 2) {
                    pageNum = idx + 1;
                  } else if (recentPurchasesPagination.currentPage >= recentPurchasesPagination.totalPages - 1) {
                    pageNum = recentPurchasesPagination.totalPages - 2 + idx;
                  } else {
                    pageNum = recentPurchasesPagination.currentPage - 1 + idx;
                  }
                  
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded flex items-center justify-center font-medium ${
                        recentPurchasesPagination.currentPage === pageNum 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, recentPurchasesPagination.totalPages))}
                  disabled={recentPurchasesPagination.currentPage === recentPurchasesPagination.totalPages}
                  className="h-8 w-8 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Required */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
              Action Required <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
            </h3>
          </div>
          
          <div className="space-y-4 mt-2">
            
            <a href="/admin/inquiry-history" className="flex items-center justify-between group p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">New Inquiries</h4>
                  <p className="text-xs text-gray-500">Users have submitted new inquiries</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-purple-600">{actionRequired?.newInquiries || 0}</span>
                <span className="text-gray-400">&gt;</span>
              </div>
            </a>
            
            <a href="/admin/internship-submissions" className="flex items-center justify-between group p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">New Internship Submissions</h4>
                  <p className="text-xs text-gray-500">Pending submissions to review</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-orange-600">{actionRequired?.newInternshipSubmissions || 0}</span>
                <span className="text-gray-400">&gt;</span>
              </div>
            </a>
            
            <a href="/admin/training-registrations" className="flex items-center justify-between group p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2.5 rounded-lg text-green-600">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Training Registrations</h4>
                  <p className="text-xs text-gray-500">New registrations this week</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">{actionRequired?.trainingRegistrations || 0}</span>
                <span className="text-gray-400">&gt;</span>
              </div>
            </a>
            
            <a href="/admin/purchased-history" className="flex items-center justify-between group p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Recent Purchases</h4>
                  <p className="text-xs text-gray-500">New purchases in last 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">{actionRequired?.recentPurchases || 0}</span>
                <span className="text-gray-400">&gt;</span>
              </div>
            </a>
            
            <a href="/admin/purchased-history" className="flex items-center justify-between group p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-2.5 rounded-lg text-pink-600">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Pending Purchases</h4>
                  <p className="text-xs text-gray-500">Awaiting payment confirmation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-pink-600">{actionRequired?.pendingPurchases || 0}</span>
                <span className="text-gray-400">&gt;</span>
              </div>
            </a>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
