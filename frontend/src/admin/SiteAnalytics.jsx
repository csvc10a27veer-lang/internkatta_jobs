import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarRange,
  Eye,
  Globe,
  Link2,
  MousePointerClick,
  RefreshCw,
  Users,
} from 'lucide-react';
import api from '../utils/api';

const metricCards = (stats, activeVisitors, hasDateFilter) => [
  {
    label: 'Total visits',
    value: stats?.totalVisits || 0,
    icon: Eye,
    accent: 'from-sky-500/20 via-sky-500/10 to-white',
    iconColor: 'text-sky-600',
  },
  {
    label: 'Unique visitors',
    value: stats?.uniqueVisitors || 0,
    icon: Users,
    accent: 'from-emerald-500/20 via-emerald-500/10 to-white',
    iconColor: 'text-emerald-600',
  },
  {
    label: hasDateFilter ? 'Visits in range' : 'Visits today',
    value: stats?.visitsToday || 0,
    icon: CalendarRange,
    accent: 'from-amber-500/20 via-amber-500/10 to-white',
    iconColor: 'text-amber-600',
  },
  {
    label: hasDateFilter ? 'Active in range' : 'Active in 5 min',
    value: activeVisitors || 0,
    icon: Activity,
    accent: 'from-violet-500/20 via-violet-500/10 to-white',
    iconColor: 'text-violet-600',
  },
];

const getBadgeClass = (tone) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return tones[tone] || tones.slate;
};

const getPageLabel = (path) => {
  const pageMap = {
    '/': 'Home',
    '/internship': 'Internships',
    '/courses': 'Courses',
    '/training': 'Training',
    '/contact': 'Contact',
    '/about': 'About',
    '/login': 'Login',
    '/register': 'Register',
    '/faq': 'FAQ',
  };

  if (!path || path === '/') {
    return 'Home';
  }

  if (pageMap[path]) {
    return pageMap[path];
  }

  const cleanPath = path.split('?')[0].split('#')[0];
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return 'Home';
  }

  return segments
    .map((segment) => segment.replace(/[-_]/g, ' '))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' / ');
};

const SectionCard = ({ title, subtitle, children, action }) => (
  <section className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const SiteAnalytics = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeVisitors, setActiveVisitors] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const hasDateFilter = Boolean(startDate || endDate);

  useEffect(() => {
    checkAuth();
    fetchVisits();
    fetchStats();
    fetchRealtime();

    const interval = setInterval(() => {
      fetchStats();
      fetchRealtime();
    }, 10000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const checkAuth = () => {
    const token = localStorage.getItem('adminAuth');
    if (!token) {
      console.warn('No admin auth found');
    }
  };

  const fetchVisits = async () => {
    try {
      setLoading(true);
      if (!localStorage.getItem('adminAuth')) {
        console.error('No admin token found');
        return;
      }

      const response = await api.get('/api/analytics/visits', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });

      if (response.data.success) {
        setVisits(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (!localStorage.getItem('adminAuth')) return;

      const response = await api.get('/api/analytics/stats', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRealtime = async () => {
    try {
      if (!localStorage.getItem('adminAuth')) return;

      const response = await api.get('/api/analytics/realtime', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      if (response.data.success) {
        setActiveVisitors(response.data.data.activeVisitors || 0);
      }
    } catch (error) {
      console.error('Error fetching realtime data:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const overviewCards = useMemo(
    () => metricCards(stats, activeVisitors, hasDateFilter),
    [stats, activeVisitors, hasDateFilter]
  );

  const topPages = stats?.mostVisitedPages || [];
  const topInternships = stats?.mostClickedInternships || [];
  const topNavLinks = stats?.mostClickedNavLinks || [];

  const visitSummary = useMemo(() => {
    const mobileCount = visits.filter((visit) => visit.deviceType === 'Mobile').length;
    const desktopCount = visits.filter((visit) => visit.deviceType === 'Desktop').length;
    const latestVisit = visits[0];

    return {
      totalShown: visits.length,
      mobileCount,
      desktopCount,
      latestVisit,
    };
  }, [visits]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 rounded-[32px] border border-white/60 bg-white/70 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
            <RefreshCw className="h-7 w-7 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">Loading analytics</p>
            <p className="mt-1 text-sm text-slate-500">Preparing your latest visitor insights.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.95)_55%,_rgba(12,74,110,0.92))] p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.55)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-200">
                <Activity className="h-3.5 w-3.5" />
                Site analytics
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Website Visits Dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                A cleaner view of traffic, engagement, and visitor behavior so you can spot trends quickly
                and review individual sessions without digging through clutter.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5">
                  {activeVisitors} active visitors in the last 5 minutes
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {visitSummary.totalShown} visits in current view
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Latest visit</p>
                <p className="mt-3 text-lg font-semibold text-white">{visitSummary.latestVisit?.page || 'No visits yet'}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {visitSummary.latestVisit?.createdAt ? formatDate(visitSummary.latestVisit.createdAt) : 'Waiting for new data'}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Desktop</p>
                <p className="mt-3 text-3xl font-semibold text-white">{visitSummary.desktopCount}</p>
                <p className="mt-1 text-sm text-slate-300">Desktop sessions in the current result set</p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Mobile</p>
                <p className="mt-3 text-3xl font-semibold text-white">{visitSummary.mobileCount}</p>
                <p className="mt-1 text-sm text-slate-300">Mobile sessions in the current result set</p>
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          title="Filter Range"
          subtitle="Narrow the view by date to inspect recent campaigns, launches, or active periods."
          action={
            <button
              onClick={handleClearFilter}
              disabled={!startDate && !endDate}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <label className="block rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
              />
            </label>

            <label className="block rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
              />
            </label>

            <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Current range</p>
              <p className="mt-2 text-sm font-semibold">
                {startDate || 'Beginning'} to {endDate || 'Now'}
              </p>
            </div>
          </div>

          {(startDate || endDate) && (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Showing visits from <span className="font-semibold">{startDate || 'the beginning'}</span> to{' '}
              <span className="font-semibold">{endDate || 'now'}</span>.
            </div>
          )}
        </SectionCard>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className={`rounded-[28px] border border-slate-200 bg-gradient-to-br ${card.accent} p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                    <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{card.value}</p>
                  </div>
                  <div className={`rounded-2xl bg-white/80 p-3 shadow-sm ${card.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <SectionCard title="Traffic Highlights" subtitle="Quick rankings for pages and actions attracting the most attention.">
            <div className="grid gap-5 xl:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-sky-600" />
                  <h3 className="font-semibold text-slate-900">Top Pages</h3>
                </div>
                {topPages.length > 0 ? (
                  <div className="space-y-3">
                    {topPages.map((page, index) => (
                      <div key={`${page._id || 'root'}-${index}`} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{getPageLabel(page._id)}</p>
                          <p className="text-xs text-slate-500">
                            {page._id && page._id !== '/' ? page._id : 'Homepage'} • Rank #{index + 1}
                          </p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClass('blue')}`}>
                          {page.count} visits
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    No page activity found for this range.
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4 text-amber-600" />
                    <h3 className="font-semibold text-slate-900">Most Clicked Internships</h3>
                  </div>
                  {topInternships.length > 0 ? (
                    <div className="space-y-3">
                      {topInternships.map((item, index) => (
                        <div key={`${item._id}-${index}`} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{item.title || `ID: ${item._id}`}</p>
                              <p className="mt-1 text-xs text-slate-500">{item._id}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClass('amber')}`}>
                              {item.count} clicks
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                      No internship clicks recorded yet.
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-violet-600" />
                    <h3 className="font-semibold text-slate-900">Most Clicked Navigation Links</h3>
                  </div>
                  {topNavLinks.length > 0 ? (
                    <div className="space-y-3">
                      {topNavLinks.map((item, index) => (
                        <div key={`${item._id}-${index}`} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{item._id}</p>
                              <p className="mt-1 text-xs text-slate-500">{item.path || 'No path available'}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClass('violet')}`}>
                              {item.count} clicks
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                      No navigation click data is available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
      </div>
    </div>
  );
};

export default SiteAnalytics;
