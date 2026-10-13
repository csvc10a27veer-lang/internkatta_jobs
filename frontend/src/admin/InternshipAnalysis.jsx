import React, { useEffect, useState, useMemo } from 'react';
import { Briefcase, MousePointerClick, Users, RefreshCw, Filter, FileText, CheckCircle, Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../utils/api';

const ProgressBar = ({ value }) => (
  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
    <div
      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

const InternshipAnalysis = () => {
    const [data, setData] = useState(null);
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all_time'); // all_time, weekly, monthly, yearly

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminAuth');
            if (!token) return;

            const [res, progressRes] = await Promise.all([
                api.get('/api/admin/analytics/internships', { params: { period } }),
                api.get('/api/admin/internship-learning-analytics')
            ]);
            
            if (res.data.success) {
                setData(res.data.data);
            }
            if (progressRes.data.success) {
                setProgressData(progressRes.data.data.topInternships || []);
            }
        } catch (error) {
            console.error("Error fetching internship analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data by merging trends
    const chartData = useMemo(() => {
        if (!data || !data.trends) return [];
        const { views, applications } = data.trends;
        
        // Merge the arrays by date
        const mergedMap = {};
        
        if (views) {
            views.forEach(v => {
                mergedMap[v.date] = { date: v.date, views: v.count, applications: 0 };
            });
        }
        
        if (applications) {
            applications.forEach(a => {
                if (!mergedMap[a.date]) {
                    mergedMap[a.date] = { date: a.date, views: 0, applications: 0 };
                }
                mergedMap[a.date].applications = a.count;
            });
        }
        
        return Object.values(mergedMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [data]);

    if (loading && !data) {
        return (
            <div className="flex h-64 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const summary = data?.summary || { totalInternships: 0, studentsEnrolled: 0, applications: 0, activeInternships: 0 };
    const tableData = data?.tableData || [];

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                
                {/* Header & Filter */}
                <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.95)_55%,_rgba(12,74,110,0.92))] p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.55)] sm:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-200">
                                <Briefcase className="h-3.5 w-3.5" />
                                Internship Analysis
                            </div>
                            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Internship Analytics</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                Monitor internship views, student enrollments, and overall participation.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur">
                            <Filter className="h-5 w-5 text-slate-300 ml-2" />
                            <select 
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="bg-transparent text-white border-none outline-none font-medium text-sm pr-4 focus:ring-0 cursor-pointer"
                            >
                                <option value="all_time" className="text-slate-900">All Time</option>
                                <option value="weekly" className="text-slate-900">Weekly</option>
                                <option value="monthly" className="text-slate-900">Monthly</option>
                                <option value="yearly" className="text-slate-900">Yearly</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Total Internships</p>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{summary.totalInternships}</p>
                            </div>
                            <div className="rounded-2xl bg-white/80 p-3 shadow-sm text-blue-600">
                                <Briefcase className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Students Enrolled</p>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{summary.studentsEnrolled}</p>
                            </div>
                            <div className="rounded-2xl bg-white/80 p-3 shadow-sm text-emerald-600">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Total Enrollments</p>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{summary.applications}</p>
                            </div>
                            <div className="rounded-2xl bg-white/80 p-3 shadow-sm text-amber-600">
                                <FileText className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Active Internships</p>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{summary.activeInternships}</p>
                            </div>
                            <div className="rounded-2xl bg-white/80 p-3 shadow-sm text-violet-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
                    {/* Top Internship Progress */}
                    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-sky-600" />
                            <h2 className="text-lg font-semibold text-slate-900">Top Internship Progress</h2>
                        </div>

                        {progressData.length === 0 ? (
                            <p className="text-sm text-slate-500">No internship progress data found yet.</p>
                        ) : (
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                                {progressData.slice(0, 8).map((item) => (
                                    <div key={item.internshipId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{item.internshipTitle}</p>
                                                <p className="mt-1 text-xs text-slate-500">{item.learners} learners enrolled</p>
                                            </div>
                                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                {item.averageProgress}% avg
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <ProgressBar value={item.averageProgress} />
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">{item.completedEnrollments} completed enrollments</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Trend Chart */}
                    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-6">Views & Enrollment Trends</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" name="Internship Views" dataKey="views" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" name="Enrollments" dataKey="applications" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* Data Table */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 overflow-hidden">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Detailed Internship Data</h2>
                        {loading && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Internship Name</th>
                                    <th className="px-6 py-4 font-medium">Duration</th>
                                    <th className="px-6 py-4 font-medium text-right">Views</th>
                                    <th className="px-6 py-4 font-medium text-right">Enrollments</th>
                                    <th className="px-6 py-4 font-medium text-right">Unique Students</th>
                                    <th className="px-6 py-4 font-medium text-right">Engaged Students</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tableData.length > 0 ? (
                                    tableData.map((row, i) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {row.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {row.duration}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                                                    {row.views}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                                {row.applications}
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-700">
                                                {row.enrolledStudents}
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-700">
                                                {row.activeStudents}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                            No internship data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default InternshipAnalysis;
