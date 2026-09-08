import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import api from '../utils/api';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  PlayCircle,
  Sparkles,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';

const getStatusMeta = (progress) => {
  if (progress >= 100) {
    return {
      label: 'Completed',
      chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      bar: 'from-emerald-500 via-emerald-500 to-lime-400',
    };
  }

  if (progress > 0) {
    return {
      label: 'In Progress',
      chip: 'border-sky-200 bg-sky-50 text-sky-700',
      bar: 'from-sky-500 via-cyan-500 to-indigo-500',
    };
  }

  return {
    label: 'Ready to Start',
    chip: 'border-slate-200 bg-slate-100 text-slate-700',
    bar: 'from-slate-400 via-slate-400 to-slate-300',
  };
};

const StatCard = ({ label, value, hint, icon: Icon, tone }) => (
  <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${tone} p-5 shadow-sm transition duration-300 hover:shadow-md`}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        <p className="mt-0.5 text-sm text-slate-500">{hint}</p>
      </div>
      <div className="rounded-xl bg-white/90 p-3 shadow-sm flex-shrink-0">
        <Icon className="h-6 w-6 text-slate-700" />
      </div>
    </div>
  </div>
);

const InternshipCard = ({ internship }) => {
  const progress = internship.progress || 0;
  const status = getStatusMeta(progress);

  return (
    <Link
      to={`/user/internship-view/${internship._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_-40px_rgba(15,23,42,0.45)]"
    >
      <div className="relative h-60 overflow-hidden bg-slate-100">
        <img
          src={internship.thumbnail?.url || '/api/placeholder/640/360'}
          alt={internship.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <span className={`rounded-full border px-4 py-1 text-xs font-semibold backdrop-blur ${status.chip}`}>
            {status.label}
          </span>
          <span className="rounded-full border border-white/20 bg-white/85 px-4 py-1 text-xs font-semibold text-slate-700">
            {internship.category?.name || 'Internship'}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="max-w-[80%] text-3xl font-semibold leading-tight text-white drop-shadow-sm">
            {internship.title}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-base text-slate-500">
          <Clock3 className="h-5 w-5" />
          <span>{internship.duration || 'Flexible duration'}</span>
        </div>

        <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-5">
          <div className="mb-2 flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-600">Progress</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold border shadow-sm whitespace-nowrap ${
                internship.strics > 0 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' 
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                🔥 {internship.strics || 0}
              </span>
            </div>
            <span className="font-semibold text-slate-900 text-lg">{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${status.bar}`}
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
            <span>{progress >= 100 ? 'You completed this internship' : progress > 0 ? 'Keep moving forward' : 'Start your first lesson'}</span>
            <span>{internship.lectures?.length || 0} lessons</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-[22px] border border-slate-200 px-5 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Mentor / Guide</p>
            <p className="mt-1 text-base font-semibold text-slate-800">
              {internship.tutor || 'Expert Industry Mentor'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
            <User className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-semibold text-white transition hover:bg-sky-700">
          {progress > 0 ? 'Continue Learning' : 'Start Internship'}
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
};

const Intrenship = () => {
  const [myInternships, setMyInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useUserAuth();

  useEffect(() => {
    const fetchMyInternships = async () => {
      if (!auth || !auth.token) {
        setError('Please log in to see your internships.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await api.get('/api/users/my-internships');

        if (data && Array.isArray(data)) {
          setMyInternships(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setMyInternships(data.data);
        } else {
          setMyInternships([]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load your enrolled internships.');
        console.error('Fetch my internships error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyInternships();
  }, [auth]);

  const stats = useMemo(() => {
    const total = myInternships.length;
    const completed = myInternships.filter((internship) => (internship.progress || 0) >= 100).length;
    const inProgress = myInternships.filter((internship) => (internship.progress || 0) > 0 && (internship.progress || 0) < 100).length;
    const avgProgress = total > 0
      ? Math.round(myInternships.reduce((sum, internship) => sum + (internship.progress || 0), 0) / total)
      : 0;

    return { total, completed, inProgress, avgProgress };
  }, [myInternships]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-sky-600" />
          <p className="mt-4 text-lg font-semibold text-slate-700">Loading your internships...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4">
        <div className="w-full max-w-md rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">Unable to load internships</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="mx-auto max-w-8xl px-6 py-8 sm:px-8 lg:px-10">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.96)_55%,_rgba(8,47,73,0.92))] p-6 text-white shadow-md sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                <Sparkles className="h-3 w-3 text-sky-400" />
                Learning dashboard
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">My Internships</h1>
              <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                A sharper view of your enrolled internships, progress, and next actions to stay focused.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Progress</p>
                <p className="mt-1 text-2xl font-bold text-white leading-none">{stats.avgProgress}%</p>
                <p className="mt-1 text-xs text-slate-400 hidden sm:block">Overall health</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed</p>
                <p className="mt-1 text-2xl font-bold text-white leading-none">{stats.completed}</p>
                <p className="mt-1 text-xs text-slate-400 hidden sm:block">Programs done</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur text-center sm:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">In Progress</p>
                <p className="mt-1 text-2xl font-bold text-white leading-none">{stats.inProgress}</p>
                <p className="mt-1 text-xs text-slate-400 hidden sm:block">Active paths</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total internships"
            value={stats.total}
            hint="All enrolled programs"
            icon={Briefcase}
            tone="from-sky-500/15 via-sky-500/5 to-white"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            hint="Programs finished"
            icon={CheckCircle2}
            tone="from-emerald-500/15 via-emerald-500/5 to-white"
          />
          <StatCard
            label="In progress"
            value={stats.inProgress}
            hint="Active learning paths"
            icon={TrendingUp}
            tone="from-violet-500/15 via-violet-500/5 to-white"
          />
          <StatCard
            label="Avg progress"
            value={`${stats.avgProgress}%`}
            hint="Completion health"
            icon={Target}
            tone="from-amber-500/15 via-amber-500/5 to-white"
          />
        </div>

        {myInternships.length > 0 ? (
          <section className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">Continue Your Programs</h2>
                <p className="mt-1 text-base text-slate-500">Clean, focused cards with your progress and next action.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 xl:grid-cols-3">
              {myInternships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} />
              ))}
            </div>
          </section>
        ) : (
          <div className="py-14">
            <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] sm:p-12">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-sky-50">
                <Briefcase className="h-12 w-12 text-sky-600" />
              </div>
              <h2 className="mt-6 text-4xl font-semibold text-slate-900">Start Your Internship Journey</h2>
              <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
                You have not enrolled in any internships yet. Explore curated programs, build practical skills,
                and start learning with a cleaner dashboard experience.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/internship"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 py-4 text-base font-semibold text-white transition hover:bg-sky-700"
                >
                  <Briefcase className="h-5 w-5" />
                  Browse Internships
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                >
                  <BookOpen className="h-5 w-5" />
                  View Courses
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Intrenship;
