import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, CheckCircle, Clock, FileText, CheckCircle2, AlertCircle, PlayCircle, LoaderCircle } from 'lucide-react';
import api from '../utils/api';

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
}) : '-');

const getStatusBadge = (status) => {
    switch(status) {
        case 'Completed':
        case 'QuizPassed':
            return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
        case 'Approved':
            return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
        case 'Pending':
            return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>;
        case 'Rejected':
            return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200"><AlertCircle className="w-3.5 h-3.5" /> Rejected</span>;
        default:
            return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200"><PlayCircle className="w-3.5 h-3.5" /> Not Started</span>;
    }
};

const LearnerProgressDetail = () => {
    const { userId, internshipId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/admin/internship-learner-detail/${userId}/${internshipId}`);
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                console.error(err);
                const backendMsg = err.response && err.response.data && err.response.data.message ? err.response.data.message : '';
                setError(`Error: ${err.message}. ${backendMsg}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [userId, internshipId]);

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <LoaderCircle className="h-10 w-10 animate-spin text-sky-600" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading detailed progress...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center p-10">
                <p className="text-rose-600 font-medium">{error || 'Data not found'}</p>
                <button 
                    onClick={() => navigate('/admin/internship-learning-analytics')}
                    className="mt-4 flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Analytics
                </button>
            </div>
        );
    }

    const { user, internship, progress, lectures } = data;

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
            {/* Header section */}
            <div>
                <button 
                    onClick={() => navigate('/admin/internship-learning-analytics')}
                    className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm transition-colors group-hover:border-slate-300 group-hover:bg-slate-50">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Learning Analytics
                </button>
                
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Detailed Progress</h1>
                <p className="mt-2 text-sm text-slate-500">View individual lecture status and completion metrics for this learner.</p>
            </div>

            {/* Top overview cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm text-indigo-600">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-sky-500/20 via-sky-500/10 to-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm text-sky-600">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 line-clamp-1">{internship.title}</p>
                            <p className="text-xs text-slate-500">{internship.totalLectures} Total Lectures</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-white p-6 shadow-sm lg:col-span-1 md:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Overall Progress</p>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">{progress.percent}%</span>
                    </div>
                    <ProgressBar value={progress.percent} />
                    <div className="mt-4 flex gap-4 text-xs text-slate-600">
                        <p><span className="font-semibold text-slate-900">{progress.completedCount}</span> completed</p>
                        <p><span className="font-semibold text-slate-900">{progress.approvedCount}</span> approved</p>
                    </div>
                </div>
            </div>

            {/* Lecture list */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Lecture Roadmap</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 border-b border-slate-200">
                                <th className="py-3 px-6">Lecture Title</th>
                                <th className="py-3 px-6">Status</th>
                                <th className="py-3 px-6">Submitted At</th>
                                <th className="py-3 px-6">Completed At</th>
                                <th className="py-3 px-6">Files</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lectures.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-sm text-slate-500">
                                        No lectures found in this internship.
                                    </td>
                                </tr>
                            ) : (
                                lectures.map((lecture, idx) => (
                                    <tr key={lecture.lectureId} className="align-middle hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <p className="text-sm font-medium text-slate-900">
                                                <span className="text-slate-400 mr-2">{idx + 1}.</span> 
                                                {lecture.title}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            {getStatusBadge(lecture.status)}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-slate-500">
                                            {formatDate(lecture.submittedAt)}
                                        </td>
                                        <td className="py-4 px-6 text-xs text-slate-500">
                                            {formatDate(lecture.completedAt)}
                                        </td>
                                        <td className="py-4 px-6 text-xs">
                                            {lecture.files && lecture.files.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {lecture.files.map((f, i) => (
                                                        <a 
                                                            key={i} 
                                                            href={f.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 hover:underline"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                            Attachment {i + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LearnerProgressDetail;
