import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BookCheck,
  GraduationCap,
  LoaderCircle,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import api from '../utils/api';

const StatCard = ({ label, value, icon: Icon, tone }) => (
  <div className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${tone} p-5 shadow-sm`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <p className="mt-4 text-4xl font-semibold text-slate-950">{value}</p>
      </div>
      <div className="rounded-2xl bg-white/90 p-3 shadow-sm">
        <Icon className="h-5 w-5 text-slate-800" />
      </div>
    </div>
  </div>
);

const ProgressBar = ({ value }) => (
  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
    <div
      className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

const formatDate = (value) => (value ? new Date(value).toLocaleString('en-IN', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}) : 'No recent activity');

const InternshipLearningAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/api/admin/internship-learning-analytics');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching internship learning analytics:', error);
        setError(error.response?.data?.message || 'Failed to load internship learning analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const rows = data?.rows || [];
  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) =>
      row.userName?.toLowerCase().includes(term) ||
      row.userEmail?.toLowerCase().includes(term) ||
      row.internshipTitle?.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const summary = data?.summary || {};
  const topInternships = data?.topInternships || [];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-[32px] border border-slate-200 bg-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-sky-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">Loading learning analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        <h2 className="text-lg font-semibold">Learning Analytics Error</h2>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.95)_55%,_rgba(14,116,144,0.9))] p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.55)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-200">
              <GraduationCap className="h-3.5 w-3.5" />
              Internship learning analytics
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Learner Progress Overview</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Track how far users have progressed inside purchased internships, how many lectures they completed,
              and which internships are moving learners forward.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Important note</p>
            <p className="mt-2 text-sm text-slate-100">
              This page shows progress and learning status. Per-user site time is not stored accurately yet.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total users" value={summary.totalUsers || 0} icon={Users} tone="from-slate-400/20 via-slate-300/10 to-white" />
        <StatCard label="Bought internship" value={summary.usersWithInternshipPurchases || 0} icon={ShoppingBag} tone="from-sky-500/20 via-sky-500/10 to-white" />
        <StatCard label="Active learners" value={summary.totalLearners || 0} icon={Users} tone="from-cyan-500/20 via-cyan-500/10 to-white" />
        <StatCard label="Total enrollments" value={summary.totalEnrollments || 0} icon={BookCheck} tone="from-violet-500/20 via-violet-500/10 to-white" />
        <StatCard label="Completed" value={summary.completedEnrollments || 0} icon={GraduationCap} tone="from-emerald-500/20 via-emerald-500/10 to-white" />
        <StatCard label="Average progress" value={`${summary.averageProgress || 0}%`} icon={TrendingUp} tone="from-amber-500/20 via-amber-500/10 to-white" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Activity className="h-5 w-5 text-sky-600" />
            <h2 className="text-xl font-semibold text-slate-900">Top Internship Progress</h2>
          </div>

          {topInternships.length === 0 ? (
            <p className="text-sm text-slate-500">No internship progress data found yet.</p>
          ) : (
            <div className="space-y-4">
              {topInternships.slice(0, 8).map((item) => (
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

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Learner Progress Table</h2>
              <p className="mt-1 text-sm text-slate-500">Each row shows one user and one internship enrollment.</p>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user or internship..."
              className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 sm:max-w-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="pb-3 pr-4">Learner</th>
                  <th className="pb-3 pr-4">Internship</th>
                  <th className="pb-3 pr-4">Progress</th>
                  <th className="pb-3 pr-4">Completed</th>
                  <th className="pb-3 pr-4">Pending</th>
                  <th className="pb-3">Last activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-sm text-slate-500">
                      No learner progress found for this search.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={`${row.userId}-${row.internshipId}`} className="align-top">
                      <td className="py-4 pr-4">
                        <p className="text-sm font-semibold text-slate-900">{row.userName}</p>
                        <p className="mt-1 text-xs text-slate-500">{row.userEmail}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-sm font-semibold text-slate-900">{row.internshipTitle}</p>
                        <p className="mt-1 text-xs text-slate-500">{row.totalLectures} total lectures</p>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="min-w-[160px]">
                          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
                            <span>{row.progressPercent}%</span>
                            <span>{row.startedCount} started</span>
                          </div>
                          <ProgressBar value={row.progressPercent} />
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="space-y-1 text-xs text-slate-600">
                          <p><span className="font-semibold text-slate-900">{row.completedCount}</span> completed</p>
                          <p><span className="font-semibold text-slate-900">{row.approvedCount}</span> approved</p>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="space-y-1 text-xs text-slate-600">
                          <p><span className="font-semibold text-slate-900">{row.pendingCount}</span> pending</p>
                          <p><span className="font-semibold text-slate-900">{row.rejectedCount}</span> rejected</p>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-slate-500">{formatDate(row.lastActivity)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InternshipLearningAnalytics;
