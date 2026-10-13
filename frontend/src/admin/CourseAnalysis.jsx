import React, { useEffect, useState, useMemo } from 'react';
import { BookOpen, MousePointerClick, Users, RefreshCw, Filter, ArrowUpRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../utils/api';

const CourseAnalysis = () => {
    const [data, setData] = useState(null);
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

            const res = await api.get('/api/admin/analytics/courses', {
                params: { period }
            });
            
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching course analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data by merging trends
    const chartData = useMemo(() => {
        if (!data || !data.trends) return [];
        const { clicks, enrollments } = data.trends;
        
        // Merge the two arrays by date
        const merged = clicks.map(c => {
            const enrollData = enrollments.find(e => e.date === c.date);
            return {
                date: c.date,
                clicks: c.count,
                enrollments: enrollData ? enrollData.count : 0
            };
        });
        return merged;
    }, [data]);

    if (loading && !data) {
        return (
            <div className="flex h-64 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const summary = data?.summary || { totalCourses: 0, totalClicks: 0, totalEnrollments: 0, uniqueStudents: 0 };
    const tableData = data?.tableData || [];

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                
                {/* Header & Filter */}
                <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.95)_55%,_rgba(12,74,110,0.92))] p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.55)] sm:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-200">
                                <BookOpen className="h-3.5 w-3.5" />
                                Course Analysis
                            </div>
                            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Course Analytics</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                Monitor course engagement, click-through rates, and overall enrollments.
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
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Total Courses</p>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{summary.totalCourses}</p>
                            </div>
                            <div className="rounded-2xl bg-white/80 p-3 shadow-sm text-blue-600">
                                <BookOpen className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Total Clicks/Views</p>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{summary.totalClicks}</p>
                            </div>
                            <div className="rounded-2xl bg-white/80 p-3 shadow-sm text-amber-600">
                                <MousePointerClick className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Total Enrollments</p>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{summary.totalEnrollments}</p>
                            </div>
                            <div className="rounded-2xl bg-white/80 p-3 shadow-sm text-emerald-600">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Unique Students</p>
                                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{summary.uniqueStudents}</p>
                            </div>
                            <div className="rounded-2xl bg-white/80 p-3 shadow-sm text-violet-600">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trend Chart */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">Engagement & Enrollment Trends</h2>
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
                                <Line type="monotone" name="Course Clicks" dataKey="clicks" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" name="Enrollments" dataKey="enrollments" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Data Table */}
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 overflow-hidden">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Detailed Course Data</h2>
                        {loading && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Course Name</th>
                                    <th className="px-6 py-4 font-medium text-right">Clicks / Views</th>
                                    <th className="px-6 py-4 font-medium text-right">Enrollments</th>
                                    <th className="px-6 py-4 font-medium text-right">Unique Students</th>
                                    <th className="px-6 py-4 font-medium text-right">Enrollment Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tableData.length > 0 ? (
                                    tableData.map((row, i) => (
                                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {row.name}
                                                <div className="text-xs text-slate-400 font-normal mt-0.5">{row.id}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                                                    {row.clicks}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                                {row.enrollments}
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-700">
                                                {row.uniqueStudents}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {row.enrollmentRate}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                            No course data available.
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

export default CourseAnalysis;
