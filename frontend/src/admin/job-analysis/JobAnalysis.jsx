import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Briefcase, Users, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { mockJobApplications } from './mockJobApplications';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];
const STATUS_COLORS = {
  'Applied': '#3b82f6', // blue
  'Under Review': '#f59e0b', // amber
  'Shortlisted': '#8b5cf6', // purple
  'Selected': '#10b981', // green
  'Rejected': '#ef4444' // red
};

const JobAnalysis = () => {
  // State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [trendFilter, setTrendFilter] = useState('Weekly');

  // Load Data
  useEffect(() => {
    // In the future:
    // const fetchAnalysisData = async () => {
    //    const response = await api.get('/api/job-analysis');
    //    setApplications(response.data);
    // };
    
    // Using mock data for now
    setTimeout(() => {
      setApplications(mockJobApplications);
      setLoading(false);
    }, 600);
  }, []);

  // Filtered Applications based on Domain and Date
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      let domainMatch = domainFilter === 'All' || app.domain === domainFilter;
      
      let dateMatch = true;
      if (dateFilter !== 'All Time') {
        const appDate = new Date(app.appliedDate);
        const now = new Date();
        const diffTime = Math.abs(now - appDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'This Week') dateMatch = diffDays <= 7;
        else if (dateFilter === 'This Month') dateMatch = diffDays <= 30;
        else if (dateFilter === 'This Year') dateMatch = diffDays <= 365;
      }

      return domainMatch && dateMatch;
    });
  }, [applications, domainFilter, dateFilter]);

  // Aggregations
  const summary = useMemo(() => {
    const uniqueJobs = new Set(filteredApps.map(a => a.jobId)).size;
    const uniqueStudents = new Set(filteredApps.map(a => a.studentId)).size;
    const uniqueDomains = new Set(filteredApps.map(a => a.domain)).size;

    return {
      totalJobs: uniqueJobs,
      totalApplications: filteredApps.length,
      uniqueStudents: uniqueStudents,
      activeDomains: uniqueDomains
    };
  }, [filteredApps]);

  const domainAnalysis = useMemo(() => {
    const counts = {};
    filteredApps.forEach(app => {
      if (!counts[app.domain]) {
        counts[app.domain] = { domain: app.domain, applications: 0, students: new Set(), jobs: new Set() };
      }
      counts[app.domain].applications += 1;
      counts[app.domain].students.add(app.studentId);
      counts[app.domain].jobs.add(app.jobId);
    });

    const totalApps = filteredApps.length;

    return Object.values(counts)
      .map(d => ({
        ...d,
        uniqueStudents: d.students.size,
        totalJobs: d.jobs.size,
        percentage: totalApps ? ((d.applications / totalApps) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.applications - a.applications);
  }, [filteredApps]);

  const mostAppliedJobs = useMemo(() => {
    const counts = {};
    filteredApps.forEach(app => {
      if (!counts[app.jobId]) {
        counts[app.jobId] = {
          jobId: app.jobId,
          jobTitle: app.jobTitle,
          companyName: app.companyName,
          domain: app.domain,
          applications: 0,
          students: new Set()
        };
      }
      counts[app.jobId].applications += 1;
      counts[app.jobId].students.add(app.studentId);
    });

    return Object.values(counts)
      .map(j => ({ ...j, uniqueStudents: j.students.size, status: 'Active' }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 10); // Top 10
  }, [filteredApps]);

  const companyChartData = useMemo(() => {
    const counts = {};
    filteredApps.forEach(app => {
      counts[app.companyName] = (counts[app.companyName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // top 8 companies
  }, [filteredApps]);

  const statusChartData = useMemo(() => {
    const counts = {};
    filteredApps.forEach(app => {
      counts[app.applicationStatus] = (counts[app.applicationStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredApps]);

  const trendData = useMemo(() => {
    const dates = {};
    filteredApps.forEach(app => {
      const date = new Date(app.appliedDate);
      let key;
      if (trendFilter === 'Weekly') {
        // Simple mock: group by week of year (approximate)
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        key = `Week ${weekNo}`;
      } else if (trendFilter === 'Monthly') {
        key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      } else {
        key = date.getFullYear().toString();
      }
      dates[key] = (dates[key] || 0) + 1;
    });
    
    // Sort keys logically based on filter (for simplicity here, sort alphabetically assuming formatted well or chronological)
    return Object.entries(dates)
      .map(([name, applications]) => ({ name, applications }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredApps, trendFilter]);

  // Derived filters
  const uniqueDomains = [...new Set(applications.map(a => a.domain))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <PieChartIcon size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No job application data available</h2>
        <p className="text-gray-500 max-w-md text-center">
          Application analytics will appear here once students start applying for jobs. 
          The backend is ready to process scraper and application data.
        </p>
      </div>
    );
  }

  const topDomain = domainAnalysis.length > 0 ? domainAnalysis[0] : null;
  const topJob = mostAppliedJobs.length > 0 ? mostAppliedJobs[0] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Job Analysis</h1>
          <p className="text-gray-500 mt-2">Analyze student job applications, popular job domains, companies, and application trends.</p>
        </div>
        
        {/* Global Filters */}
        <div className="flex gap-3">
          <select 
            value={domainFilter} 
            onChange={e => setDomainFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Domains</option>
            {uniqueDomains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All Time">All Time</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Jobs</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.totalJobs}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Briefcase size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Applications</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.totalApplications}</h3>
          </div>
          <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
            <FileText size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Unique Students</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.uniqueStudents}</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <Users size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Domains</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.activeDomains}</h3>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <PieChartIcon size={24} />
          </div>
        </div>
      </div>

      {/* Top Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-lg font-bold text-indigo-900 mb-2">Key Insights</h3>
          <div className="space-y-2 text-indigo-800 text-sm">
            <p>• <strong>{topDomain?.domain || 'N/A'}</strong> is currently the most popular job domain with <strong>{topDomain?.applications || 0}</strong> applications.</p>
            <p>• <strong>{topJob?.jobTitle || 'N/A'}</strong> at {topJob?.companyName || 'N/A'} has received the highest number of applications ({topJob?.applications || 0}).</p>
            <p>• <strong>{summary.uniqueStudents}</strong> unique students have applied for {summary.totalJobs} available jobs, averaging {summary.totalJobs ? (summary.totalApplications / summary.totalJobs).toFixed(1) : 0} apps per job.</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 flex flex-col justify-center items-center text-center">
          <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Most Popular Domain</h4>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{topDomain?.domain || 'N/A'}</h2>
          <p className="text-gray-600 text-sm">{topDomain?.applications || 0} Apps • {topDomain?.uniqueStudents || 0} Unique Students</p>
        </div>
      </div>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Applications by Job Domain</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainAnalysis} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="domain" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="applications" fill="#6366f1" radius={[0, 4, 4, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Application Status</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Domain Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Domain-wise Application Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700">Domain</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Total Jobs</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Applications</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Unique Students</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {domainAnalysis.map((domain, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{domain.domain}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{domain.totalJobs}</td>
                  <td className="px-6 py-4 text-right font-medium text-indigo-600">{domain.applications}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{domain.uniqueStudents}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{domain.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Student Application Trend</h3>
            <select 
              value={trendFilter}
              onChange={e => setTrendFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 outline-none"
            >
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Applications by Company</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most Applied Jobs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Most Applied Jobs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700">Job Title</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Company</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Domain</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Total Applications</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-right">Unique Students</th>
                <th className="px-6 py-3 font-semibold text-gray-700 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mostAppliedJobs.map((job, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{job.jobTitle}</td>
                  <td className="px-6 py-4 text-gray-600">{job.companyName}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{job.domain}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-indigo-600">{job.applications}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{job.uniqueStudents}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default JobAnalysis;
